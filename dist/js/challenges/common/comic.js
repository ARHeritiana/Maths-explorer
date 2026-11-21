// A written explanation played as a short cartoon: a teacher at a chalkboard and a curious student. The text is cut into
// sentences (one step each, shown as the player's caption); the teacher writes the formula or the numbers of each sentence
// on the board in chalk (a sentence without any keeps the board as it is), points, talks; the student listens, wonders,
// and lights up at the end. `comic(text, options)` returns a solution definition for the shared player
// (common/player.js): { size, dur, steps, mount, update }, every frame a pure function of (step, p). Used by the written
// version of the challenges, by the curiosities' "Comprendre la réponse" and by the laboratory's argument.
import { svgEl } from "./kit.js";
import { makePerson, posePerson } from "./person.js";
import { makeBubble, poseBubble } from "./bubble.js";
import { playSolution } from "./player.js";

const W = 520, H = 300, FLOOR = 274, INK = "var(--ink)", CHALK = "#f4f1e6", CHALK_HOT = "#ffd34d";
const BOARD = { x: 196, y: 22, w: 308, h: 176 };
const cl = (x) => Math.max(0, Math.min(1, x)), seg = (p, a, b) => cl((p - a) / (b - a));
const g = (p, a = {}) => svgEl("g", a, p);

// Sentences of a text, merged so that there are at most `max` steps.
export function sentences(text, max = 7) {
  const parts = String(text).replace(/<sup>(.*?)<\/sup>/g, "^$1").replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim().split(/(?<=[.!?…])\s+(?=[A-ZÀ-ÝÉ«“"(0-9])/u).filter(Boolean);
  while (parts.length > max) {
    let k = 0;   // merge the shortest neighbouring pair
    for (let i = 1; i < parts.length - 1; i++) if (parts[i].length + parts[i + 1].length < parts[k].length + parts[k + 1].length) k = i;
    parts.splice(k, 2, `${parts[k]} ${parts[k + 1]}`);
  }
  return parts;
}

// The mathematical bits of a sentence: runs around a relation or an operator that hold a digit, written with short
// tokens (no ordinary words), at most `max` characters each. "C(14, 4) = 1001", "√365 ≈ 19", "50 × 2".
export function mathBits(sentence, max = 34) {
  const out = [], re = /[\p{L}\p{N}√π(⌊|\-−][^\s;:]*(?:\s*[=≈≤≥<>×÷+−·/]\s*[^\s;:]+)+/gu;
  // keep "C(14, 4)" and "5 050" in one piece while matching (spaces after a comma inside brackets, digit groups)
  const KEEP = "\uE000", plain = String(sentence).replace(/<sup>(.*?)<\/sup>/g, "^$1").replace(/<[^>]+>/g, "")
    .replace(/\(([^()]*)\)/g, (m) => m.replace(/,\s+/g, `,${KEEP}`)).replace(/(\d)[\s\u00a0\u202f](?=\d{3}\b)/g, `$1${KEEP}`);
  for (const m of plain.matchAll(re)) {
    let s = m[0].replace(/[,.]+$/, "").replace(/\uE000/g, (c, i, all) => (all[i - 1] === "," ? " " : "\u202f"));
    if (!/\d/.test(s) || !/[=≈≤≥<>×÷+−·]/.test(s)) continue;
    s = s.replace(/^.*\p{L}{4,}\S*\s*/u, "");   // drop the words in front ("x-coordinate −b/(2a)")
    if (!/\d/.test(s) || (s.match(/\p{L}{4,}/gu) || []).length) continue;   // ordinary words: not a formula
    if (s.length > max) s = `${s.slice(0, max - 1)}…`;
    if (!out.includes(s)) out.push(s);
  }
  const rel = out.filter((b) => /[=≈≤≥<>]/.test(b));
  return (rel.length ? rel : out).slice(0, 2);
}

// what the teacher says to the student when a step starts (never addressed to the reader)
const TALK = [["Bon…", "Right…"], ["Ensuite…", "Next…"], ["Donc…", "So…"], ["Et voilà !", "There it is!"]];

// text: [fr, en] (or a string); icon: optional SVG markup drawn in the corner of the board (an emblem in currentColor);
// picture: optional (canvas) => void that draws the subject on a sheet pinned to the board (a gallery card's art).
export function comic(text, { icon = "", max = 7, picture = null } = {}) {
  const pair = Array.isArray(text) ? text : [text, text];
  const parts = [sentences(pair[0], max), sentences(pair[1], max)];
  const n = Math.max(parts[0].length, parts[1].length);
  const at = (L, i) => parts[L][Math.min(i, parts[L].length - 1)] || "";
  const steps = Array.from({ length: n }, (_, i) => [at(0, i), at(1, i)]);
  return {
    size: [W, H],
    dur: (step) => Math.min(9000, Math.max(3600, 1800 + 48 * Math.max(at(0, step).length, at(1, step).length))),
    steps: () => steps,
    mount(c) {
      const L = c.t(0, 1), svg = c.svg;
      // the classroom: wall with a window, floor, the board with its ledge and chalk
      svgEl("rect", { x: 0, y: 0, width: W, height: FLOOR, fill: "color-mix(in srgb, #f6e7c8 55%, var(--surface))" }, svg);
      svgEl("rect", { x: 22, y: 30, width: 96, height: 70, rx: 4, fill: "color-mix(in srgb, #9fd3ff 55%, var(--surface))", stroke: INK, "stroke-width": 1.4 }, svg);
      svgEl("path", { d: "M70 30 V100 M22 65 H118", stroke: INK, "stroke-width": 1.2 }, svg);
      svgEl("rect", { x: 0, y: FLOOR, width: W, height: H - FLOOR, fill: "#b07a43" }, svg);
      svgEl("rect", { x: 0, y: FLOOR - 3, width: W, height: 5, fill: "#8d5f2d", stroke: INK, "stroke-width": 1 }, svg);
      svgEl("rect", { x: BOARD.x - 7, y: BOARD.y - 7, width: BOARD.w + 14, height: BOARD.h + 14, rx: 5, fill: "#8d5f2d", stroke: INK, "stroke-width": 1.6 }, svg);
      svgEl("rect", { ...{ x: BOARD.x, y: BOARD.y, width: BOARD.w, height: BOARD.h }, rx: 2, fill: "#2f4a3c", stroke: INK, "stroke-width": 1 }, svg);
      svgEl("rect", { x: BOARD.x + 20, y: BOARD.y + BOARD.h + 4, width: 22, height: 5, rx: 2, fill: "#fff" }, svg);
      // a sheet pinned on the right of the board, with the subject drawn on it
      const PW = picture ? 128 : 0;
      if (picture) {
        const px = BOARD.x + BOARD.w - PW - 12, py = BOARD.y + (BOARD.h - PW) / 2;
        svgEl("rect", { x: px - 5, y: py - 5, width: PW + 10, height: PW + 10, fill: "#fffdf6", stroke: INK, "stroke-width": 1.2, transform: `rotate(-2 ${px + PW / 2} ${py + PW / 2})` }, svg);
        const fo = svgEl("foreignObject", { x: px, y: py, width: PW, height: PW }, svg), doc = svg.ownerDocument;
        const cv = doc.createElementNS("http://www.w3.org/1999/xhtml", "canvas");
        cv.setAttribute("style", `display:block;width:${PW}px;height:${PW}px`); cv.setAttribute("aria-hidden", "true");
        fo.append(cv);
        try { picture(cv); } catch { /* a drawing that cannot start leaves the sheet blank */ }
        svgEl("rect", { x: px + PW / 2 - 14, y: py - 10, width: 28, height: 10, fill: "#f4e1a0", opacity: 0.85, transform: `rotate(-6 ${px + PW / 2} ${py})` }, svg);
      }
      if (icon && !picture) { const e = g(svg, { transform: `translate(${BOARD.x + BOARD.w - 44} ${BOARD.y + 6}) scale(0.6)`, color: CHALK, opacity: 0.7 }); e.innerHTML = icon; }
      // the board lines: one per step that has formulas, written one after the other
      const lines = [];
      for (let i = 0; i < n; i++) for (const bit of mathBits(at(L, i))) lines.push({ step: i, text: bit });
      const fit = Math.min(18, Math.max(10, (BOARD.w - PW - 40) / Math.max(12, ...lines.map((l) => l.text.length)) * 1.75));
      const clipId = `comic-${Math.random().toString(36).slice(2, 8)}`;
      const cp = svgEl("clipPath", { id: clipId }, svg), cpRect = svgEl("rect", { x: BOARD.x, y: BOARD.y, width: 0, height: BOARD.h }, cp);
      const texts = lines.map((l) => svgEl("text", { x: BOARD.x + 16, "font-size": fit, "font-weight": 700, fill: CHALK, "font-family": "var(--math, var(--body))" }, svg));
      texts.forEach((T, i) => { T.textContent = lines[i].text; });
      const marks = [g(svg), g(svg)];   // a big "?" at the start, a tick at the end when the board has nothing else
      svgEl("text", { x: BOARD.x + (BOARD.w - PW) / 2, y: BOARD.y + BOARD.h / 2 + 24, "text-anchor": "middle", "font-size": 64, "font-weight": 700, fill: CHALK, opacity: 0.85 }, marks[0]).textContent = "?";
      svgEl("path", { d: `M${BOARD.x + (BOARD.w - PW) / 2 - 30} ${BOARD.y + BOARD.h / 2} l22 24 l40 -50`, fill: "none", stroke: CHALK_HOT, "stroke-width": 7, "stroke-linecap": "round", "stroke-linejoin": "round" }, marks[1]);
      // the teacher (pointing with a stick) and the student
      const teacher = makePerson(svg, { fill: "color-mix(in srgb, var(--c6) 70%, var(--surface))", look: 5, size: 1.75 });
      const student = makePerson(svg, { fill: "color-mix(in srgb, var(--c2) 70%, var(--surface))", look: 2, size: 1.45 });
      const bulb = g(svg);
      svgEl("circle", { cx: 0, cy: 0, r: 10, fill: CHALK_HOT, stroke: INK, "stroke-width": 1.3 }, bulb);
      svgEl("rect", { x: -4.5, y: 9, width: 9, height: 6, rx: 1.5, fill: "#9a9a9a", stroke: INK, "stroke-width": 1 }, bulb);
      for (let k = 0; k < 6; k++) svgEl("line", { x1: 0, y1: -14, x2: 0, y2: -19, stroke: CHALK_HOT, "stroke-width": 2, "stroke-linecap": "round", transform: `rotate(${k * 60 - 150})` }, bulb);
      const bubble = makeBubble(svg);
      return { L, lines, texts, cpRect, clipId, marks, teacher, student, bulb, bubble, fit, PW };
    },
    update(S, s, p) {
      const { L, lines, texts, cpRect, clipId, marks, teacher, student, bulb, bubble, fit, PW } = S;
      // lines written so far; the current one appears under the chalk as p grows; older ones scroll up when the board is full
      const done = lines.filter((l) => l.step < s), now = lines.filter((l) => l.step === s), cur = now[0] || null, shown = [...done, ...now];
      const rows = Math.max(1, Math.floor((BOARD.h - 28) / (fit * 1.7))), first = Math.max(0, shown.length - rows);
      const write = cur ? seg(p, 0.08, 0.7) : 1;
      texts.forEach((T, i) => {
        const k = shown.indexOf(lines[i]);
        if (k < first) { T.setAttribute("opacity", 0); return; }
        T.setAttribute("y", (BOARD.y + 30 + (k - first) * fit * 1.7).toFixed(1));
        T.setAttribute("opacity", 1);
        T.setAttribute("fill", now.includes(lines[i]) || (s === n - 1 && i === lines.length - 1) ? CHALK_HOT : CHALK);
        if (now.includes(lines[i])) T.setAttribute("clip-path", `url(#${clipId})`); else T.removeAttribute("clip-path");
      });
      cpRect.setAttribute("width", ((BOARD.w - PW) * write).toFixed(1));
      marks[0].setAttribute("opacity", !shown.length && s < n - 1 ? 1 : 0);
      marks[1].setAttribute("opacity", s === n - 1 && !cur ? seg(p, 0.3, 0.6) : 0);
      // the teacher writes (arm up to the board), then turns to the student and talks
      const writing = cur && p < 0.75, talk = Math.sin(p * 40) > 0 ? "grin" : "o";
      const last = s === n - 1;
      const pointing = PW && !cur && p > 0.15 && p < 0.7;
      posePerson(teacher, { x: 168, y: FLOOR, facing: writing || pointing ? 1 : -1, gaze: [1, -0.3], reach: writing || pointing ? 1 : 0.4, reachAngle: writing ? -40 + 20 * Math.sin(p * 30) : pointing ? -30 : 10, breathe: 6 * p, blink: Math.abs(Math.sin(9 * p + s)) > 0.997 ? 1 : 0, mood: writing ? "smile" : talk });
      const lit = last ? seg(p, 0.55, 0.75) : 0;
      posePerson(student, { x: 62, y: FLOOR, facing: 1, gaze: [1, writing ? -0.6 : -0.1], breathe: 6 * p + 2, blink: Math.abs(Math.sin(7 * p + s * 2)) > 0.997 ? 1 : 0, mood: last && lit > 0 ? "grin" : writing ? "o" : "smile", hop: last ? seg(p, 0.7, 0.95) : 0, wave: last && p > 0.8 ? seg(p, 0.8, 1) : 0 });
      bulb.setAttribute("transform", `translate(64 ${FLOOR - 150}) scale(${(0.3 + 0.7 * lit).toFixed(2)})`);
      bulb.setAttribute("opacity", lit.toFixed(2));
      const word = s === 0 ? TALK[0] : last ? TALK[3] : TALK[1 + (s % 2)];
      const say = seg(p, 0.02, 0.1) * (1 - seg(p, 0.4, 0.5));
      poseBubble(bubble, { x: 150, y: FLOOR - 128, text: word[L], appear: say });
    },
  };
}

// Mount a comic in `root` with the shared player; returns the player's handle ({ stop, start, seek, steps }).
export const mountComic = (text, root, { lang, reduced, icon = "", max = 7, picture = null } = {}) => playSolution(comic(text, { icon, max, picture }), root, { lang, reduced, params: {} });
