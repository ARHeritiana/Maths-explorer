// Laboratory shell: builds the page of one experiment (figure, readout, mission card), runs the missions (predict, explore,
// contrast, check, explain), keeps the state, and tells the host when the mission changes. The template draws; this file
// never draws. Everything the card shows is created once or when the mission changes, never during a drag.
//
// Exploration is free (owner decision, 19 October 2026): every handle and control works in every mission, any mission can be
// opened at any time, and a mission's goal, answer or argument gives feedback without holding the learner back. The missions'
// `unlock` lists only mark the suggested controls. `opts.gated: true` restores the blocking behaviour (controls locked to the
// mission, Next after the mission is done, the argument after a written attempt); it is kept for the future tests.
import { createStage, createReadout, createTable, makeFormat, setText, setAttr, setClass, textNode } from "./engine.js";
import { isAnswer } from "../math.js";

export const KINDS = {
  predict: ["Prédire", "Predict"],
  explore: ["Explorer", "Explore"],
  contrast: ["Comparer", "Compare"],
  check: ["Vérifier", "Check"],
  explain: ["Expliquer", "Explain"],
};
const TEXT = {
  mission: ["Mission", "Mission"],
  previous: ["Précédente", "Previous"],
  next: ["Suivante", "Next"],
  open: ["Ouvrir dans le laboratoire", "Open in the laboratory"],
  restart: ["Recommencer cette mission", "Restart this mission"],
  hint: ["Un indice", "A hint"],
  verify: ["Vérifier", "Check"],
  yourAnswer: ["Ta réponse", "Your answer"],
  why: ["Ton explication", "Your explanation"],
  showArgument: ["Voir l’argument", "Show the argument"],
  needText: ["Écris au moins une phrase pour voir l’argument.", "Write at least a sentence to see the argument."],
  locked: ["verrouillé", "locked"],
  predicted: ["Prédiction notée. Teste-la à la mission suivante.", "Prediction saved. Test it in the next mission."],
  predictedFree: ["Prédiction notée. Teste-la sur la figure, ou passe à la mission suivante.", "Prediction saved. Test it on the figure, or go on to the next mission."],
  showAnswer: ["Voir la réponse", "Show the answer"],
  goal: ["Objectif atteint.", "Goal reached."],
  exact: ["Exact.", "Correct."],
  notYet: ["Pas encore. Regarde la figure et réessaie.", "Not yet. Look at the figure and try again."],
  reveal: ["La réponse attendue est", "The expected answer is"],
  seeBoth: ["Regarde les deux cas : le premier est resté en pointillés sur la figure.", "Look at both cases: the first one stays faded on the figure."],
  youPredicted: ["Tu avais prédit", "You predicted"],
  rightGuess: ["c’était juste.", "that was right."],
  wrongGuess: ["ce n’était pas ça : compare avec ce que tu as vu.", "that was not it: compare with what you saw."],
  evidenceTitle: ["Ce que l’expérience montre, et ce qu’elle ne démontre pas", "What the experiment shows, and what it does not prove"],
  evidence: [
    "Ce que tu as vu est un indice expérimental, pas une démonstration : quelques positions ne couvrent pas tous les cas. L’argument ci-dessous, lui, vaut pour tous les cas.",
    "What you saw is experimental evidence, not a proof: a few positions do not cover every case. The argument below does cover every case.",
  ],
  keys: [
    "Points : glisse-les, ou Tab puis les flèches. Zoom : boutons + et −, Ctrl + molette ou pincement ; une fois zoomé, glisse le fond pour déplacer la vue ; 0 : recentrer. N et P : mission suivante, précédente.",
    "Points: drag them, or Tab then the arrow keys. Zoom: the + and − buttons, Ctrl + wheel or pinch; once zoomed, drag the background to move the view; 0: reset. N and P: next and previous mission.",
  ],
  // the same help for a figure without draggable points (number grids, simulations)
  keysView: [
    "Zoom : boutons + et −, Ctrl + molette ou pincement ; une fois zoomé, glisse le fond pour déplacer la vue ; 0 : recentrer. N et P : mission suivante, précédente.",
    "Zoom: the + and − buttons, Ctrl + wheel or pinch; once zoomed, drag the background to move the view; 0: reset. N and P: next and previous mission.",
  ],
  play: ["Lecture", "Play"],
  pause: ["Pause", "Pause"],
  stepForward: ["Pas suivant", "Next step"],
  variant: ["Cas", "Case"],
};
const T = (k) => TEXT[k];

const el0 = (tag, className, text) => {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
};

export function createShell(host, exp, tpl, opts = {}) {
  const mode = opts.mode || "full";
  const full = mode === "full", slide = mode === "slide";
  const gated = !!opts.gated;
  // In a slide the player typesets every formula (opts.render turns the Unicode of an experiment into MathJax markup); elsewhere
  // text is written as plain text nodes. `write` sets a node's text, `put` does it only when it changed (a Text node in place).
  const render = slide ? opts.render : null;
  const write = (node, value) => { if (render) render(node, String(value)); else node.textContent = value; };
  const put = (node, value) => { if (render) render(node, String(value)); else setText(node, value); };
  const el = (tag, className, text) => { const node = el0(tag, className); if (text !== undefined) write(node, text); return node; };
  const fmt = makeFormat(opts.lang || "fr");
  const t = fmt.t;
  const missions = exp.missions;
  const defaults = exp.state;
  const model = exp.model.model;

  // ---- state
  let state = { ...defaults };
  let version = 0, synced = -1, index = -1, alive = true;
  const done = {}, predictions = {};
  let unlocked = new Set(), ghostSet = null, attempts = 0, variantSeen = new Set(), completeSent = false;
  const getState = () => state;
  const apply = (partial) => {
    if (!partial) return;
    let next = null;
    for (const k of Object.keys(partial)) if (state[k] !== partial[k]) { next ??= { ...state }; next[k] = partial[k]; }
    if (!next) return;
    state = next; version++;
    stage.invalidate();
  };
  const userApply = (partial) => { stopPlay(); apply(partial); };

  // ---- DOM skeleton (built once)
  // In a slide the parts go to the player's own areas: the canvas fills `host`, the controls and the mission stepper go to
  // `opts.controls`, the formula and the readout to `opts.readout`, the prompt to `opts.hint`.
  host.replaceChildren();
  const root = el("div", `lab2 lab2-${mode}`);
  root.dataset.experiment = exp.id;
  root.dataset.mode = mode;
  const card = el("section", "lab2-card");
  card.setAttribute("aria-label", t(["Mission en cours", "Current mission"]));
  let figure, readoutHost;
  if (slide) {
    figure = host; readoutHost = opts.readout || host;
    host.classList.add("lab2-canvas-host");
    (opts.controls || host).append(root);
    root.append(card);
  } else {
    host.append(root);
    const grid = el("div", "lab2-grid");
    figure = el("section", "lab2-figure");
    figure.setAttribute("aria-label", t(["Figure interactive", "Interactive figure"]));
    grid.append(figure, card);
    root.append(grid);
    readoutHost = figure;
  }

  let view = null;
  const stage = createStage(figure, {
    lang: fmt.lang,
    palette: opts.palette,
    fontScale: slide ? 1.3 : 1,
    canvasKeys: slide,
    zoomButtons: !slide,
    reservePointer: () => exp.pointerMode?.(getState()) === "draw",
    onSpin: tpl.spins ? (dx, dy) => view?.spin?.(dx, dy) : undefined,   // a 3D template turns its view when the background is dragged
    label: `${t(exp.title)}. ${t(exp.keys || T(Object.values(exp.controls).some((c) => c.kind === "handle") ? "keys" : "keysView"))}`,
    onFrame: (g) => { view?.draw(g); sync(); },
    onDragEnd: () => announce(),
    onNudge: () => announce(),
  });
  const formulaEl = el("p", "lab2-formula");
  formulaEl.setAttribute("aria-hidden", "true");
  readoutHost.append(formulaEl);
  const readout = createReadout(readoutHost, "lab2-readout", render ? put : undefined);
  const table = exp.views.table && !slide ? createTable(figure, t(exp.views.table.caption)) : null;
  if (full) figure.append(el("p", "lab2-keys", t(exp.keys || T(Object.values(exp.controls).some((c) => c.kind === "handle") ? "keys" : "keysView"))));
  const status = el("p", "sr-only");
  status.setAttribute("role", "status");
  status.setAttribute("aria-live", "polite");
  textNode(status);
  root.append(status);
  let announceTimer = 0;
  function announce(text) {
    clearTimeout(announceTimer);
    announceTimer = setTimeout(() => { setText(status, text ?? formulaEl._v ?? ""); }, 350);
  }

  // ---- template
  const env = { exp, stage, fmt, getState, setState: userApply, advance: apply, isUnlocked: (id) => unlocked.has(id), ghost: () => (ghostSet ? { ...state, ...ghostSet } : null) };
  view = tpl.mount(env);
  const allHandles = view.handles;
  const players = new Map();

  // ---- controls (all of them exist; a mission unlocks some, the others are disabled)
  const controlsEl = el("div", "lab2-controls");
  const controlNodes = {};
  const sliderValue = (c, s) => (c.get ? c.get(s) : s[c.key]);
  for (const [id, c] of Object.entries(exp.controls)) {
    if (c.kind === "slider" || c.kind === "scrubber") {
      const wrap = el("div", "lab2-ctl");
      wrap.dataset.control = id;
      const label = el("label", "lab2-ctl-label"), name = el("span", "", t(c.label)), out = el("output");
      const input = document.createElement("input");
      input.type = "range"; input.min = c.min; input.max = c.max; input.step = c.step;
      input.id = `lab2-${exp.id}-${id}`;
      label.htmlFor = input.id;
      label.append(name, " ", out);
      input.addEventListener("input", () => userApply(c.set ? c.set(state, +input.value) : { [c.key]: +input.value }));
      wrap.append(label, input);
      let playBtn = null;
      if (c.play && view.player) {
        const ctl = view.player(c, (on) => paintPlay(playBtn, on));
        players.set(id, ctl);
        playBtn = el("button", "lab2-play secondary", "");
        playBtn.type = "button";
        paintPlay(playBtn, false);
        playBtn.addEventListener("click", () => { ctl.toggle(); });
        wrap.append(playBtn);
      }
      controlsEl.append(wrap);
      controlNodes[id] = { wrap, input, out, c, playBtn };
    } else if (c.kind === "choice") {
      const wrap = el("div", "lab2-ctl lab2-choice");
      wrap.dataset.control = id;
      wrap.setAttribute("role", "radiogroup");
      const name = el("span", "lab2-ctl-label", t(c.label));
      name.id = `lab2-${exp.id}-${id}`;
      wrap.setAttribute("aria-labelledby", name.id);
      const group = el("div", "lab2-segments");
      const buttons = c.options.map((o) => {
        const b = el("button", "lab2-segment", t(o.label));
        b.type = "button"; b.setAttribute("role", "radio");
        b.addEventListener("click", () => userApply(c.set ? c.set(state, o.value) : { [c.key]: o.value }));
        group.append(b);
        return b;
      });
      wrap.append(name, group);
      controlsEl.append(wrap);
      controlNodes[id] = { wrap, buttons, c };
    } else if (c.kind === "action") {
      // buttons that each do something once (run 10 experiments, start a new series): they do not stay "on"
      const wrap = el("div", "lab2-ctl lab2-action");
      wrap.dataset.control = id;
      wrap.setAttribute("role", "group");
      const name = el("span", "lab2-ctl-label", t(c.label));
      name.id = `lab2-${exp.id}-${id}`;
      wrap.setAttribute("aria-labelledby", name.id);
      const group = el("div", "lab2-segments");
      const buttons = c.options.map((o) => {
        const b = el("button", "lab2-segment", t(o.label));
        b.type = "button";
        b.addEventListener("click", () => userApply(c.act(state, o.value)));
        group.append(b);
        return b;
      });
      wrap.append(name, group);
      controlsEl.append(wrap);
      controlNodes[id] = { wrap, buttons, c };
    }
  }
  function paintPlay(btn, on) {
    if (!btn) return;
    const label = stage.reduced() ? t(T("stepForward")) : on ? t(T("pause")) : t(T("play"));
    setText(btn, label);
    btn.setAttribute("aria-pressed", String(!!on));
  }
  function stopPlay() { for (const p of players.values()) p.stop(); }
  controlsEl.hidden = !Object.keys(controlNodes).length;

  // ---- card
  const head = el("div", slide ? "lab2-stepper" : "lab2-card-head");
  const stepEl = el("span", "lab2-step"), kindEl = el("span", "lab2-kind");
  const fold = el("button", "lab2-fold text-button", t(["Réduire", "Fold"]));
  fold.type = "button"; fold.setAttribute("aria-expanded", "true");
  fold.addEventListener("click", () => {
    const on = !card.classList.contains("is-folded");
    card.classList.toggle("is-folded", on);
    fold.setAttribute("aria-expanded", String(!on));
    setText(fold, on ? t(["Développer", "Unfold"]) : t(["Réduire", "Fold"]));
  });
  const prevBtn = el("button", "secondary", t(T("previous"))), nextBtn = el("button", "primary", t(T("next")));
  prevBtn.type = nextBtn.type = "button";
  if (slide) {
    // a compact stepper for the presenter: previous, "2/5 Explorer", next (no gating by progress)
    prevBtn.textContent = "◀"; nextBtn.textContent = "▶";
    prevBtn.className = nextBtn.className = "lab2-step-btn";
    prevBtn.setAttribute("aria-label", t(["Mission précédente", "Previous mission"]));
    nextBtn.setAttribute("aria-label", t(["Mission suivante", "Next mission"]));
    const label = el("span", "lab2-step-label");
    label.append(stepEl, " ", kindEl);
    head.append(prevBtn, label, nextBtn);
  } else head.append(stepEl, kindEl, fold);
  const dots = el("ol", "lab2-progress");
  dots.setAttribute("aria-label", t(["Missions", "Missions"]));
  const promptEl = slide && opts.hint ? opts.hint : el("p", "lab2-prompt");
  if (slide && opts.hint) promptEl.classList.add("lab2-hint");
  promptEl.tabIndex = -1;
  const answerEl = el("div", "lab2-answer");
  const feedbackEl = el("p", "lab2-feedback");
  feedbackEl.setAttribute("role", "status");
  const navEl = el("nav", "lab2-nav");
  navEl.setAttribute("aria-label", t(["Changer de mission", "Change mission"]));
  if (!slide) navEl.append(prevBtn, nextBtn);
  card.append(head);
  if (full) card.append(dots);
  if (!(slide && opts.hint)) card.append(promptEl);
  card.append(controlsEl, answerEl, feedbackEl);
  if (full) card.append(navEl);
  else if (!slide) {
    const open = el("a", "lab2-open secondary", t(T("open")));
    open.href = (opts.href || ((ref) => `#lab/${ref}`))(`${exp.id}/${missions[0].id}`);
    card.append(open);
    card._open = open;
  }
  let argumentEl = null;
  if (full) {
    argumentEl = el("section", "lab2-argument");
    argumentEl.hidden = true;
    argumentEl.append(el("h2", "", t(T("evidenceTitle"))), el("p", "lab2-evidence", t(exp.evidence || T("evidence"))));
    if (exp.conclusion) argumentEl.append(el("p", "lab2-conclusion", t(exp.conclusion)));
    root.append(argumentEl);
  }

  const dotButtons = missions.map((m, i) => {
    const li = el("li"), b = el("button", "lab2-dot", String(i + 1));
    b.type = "button";
    b.title = `${t(T("mission"))} ${i + 1}: ${t(KINDS[m.kind])}`;
    b.setAttribute("aria-label", b.title);
    b.addEventListener("click", () => go(i));
    li.append(b); dots.append(li);
    return b;
  });

  // ---- missions
  const mission = () => missions[index];
  const startState = (m, extra) => ({ ...defaults, ...(m.set || {}), ...(extra || {}) });
  let maxReached = 0;

  function lockControls(m) {
    const suggested = new Set(m.unlock || []);
    unlocked = gated ? suggested : new Set(Object.keys(exp.controls));
    stage.setHandles(allHandles.filter((h) => unlocked.has(h.id)));
    let shown = 0;
    for (const [id, n] of Object.entries(controlNodes)) {
      const on = unlocked.has(id) && (!gated || m.kind !== "predict");
      setClass(n.wrap, "is-locked", !on);
      setClass(n.wrap, "is-suggested", !gated && !slide && suggested.has(id) && m.kind !== "predict");
      if (n.input) n.input.disabled = !on;
      if (n.buttons) n.buttons.forEach((b) => { b.disabled = !on; });
      if (n.playBtn) n.playBtn.disabled = !on;
      // Gated: before the learner has predicted there is nothing to operate, so locked controls are not shown at all.
      // Free: every control is shown, except where the experiment shows only the mission's (`onlyUnlocked`: its controls act on
      // different figures) and in a slide, where the player's control area holds only the mission's controls.
      n.wrap.hidden = gated ? m.kind === "predict" || (exp.onlyUnlocked && !on) : (exp.onlyUnlocked || slide) && !suggested.has(id);
      if (!n.wrap.hidden) shown++;
    }
    controlsEl.hidden = !shown;
  }

  function setFeedback(text, tone) {
    put(feedbackEl, text || "");
    feedbackEl.dataset.tone = tone || "";
  }

  function markDone(text) {
    const m = mission();
    done[m.id] = true;
    setClass(card, "is-done", true);
    if (text !== undefined) setFeedback(text, "good");
    maxReached = Math.max(maxReached, index + 1);
    paintNav();
    announce(text);
    if (index === missions.length - 1 && !completeSent) { completeSent = true; opts.onComplete?.(exp.id); }
  }

  function paintNav() {
    if (slide) { prevBtn.disabled = index === 0; nextBtn.disabled = index === missions.length - 1; return; }
    if (!full) return;
    const m = mission(), last = index === missions.length - 1;
    prevBtn.disabled = index === 0;
    nextBtn.hidden = last;
    nextBtn.disabled = gated && !done[m.id];
    dotButtons.forEach((b, i) => {
      b.disabled = gated && i > maxReached;
      setClass(b, "is-done", !!done[missions[i].id]);
      if (i === index) b.setAttribute("aria-current", "step"); else b.removeAttribute("aria-current");
    });
    if (argumentEl) argumentEl.hidden = gated ? !done[missions.at(-1).id] : !(done[missions.at(-1).id] || index === missions.length - 1);
  }

  function renderAnswer(m) {
    answerEl.replaceChildren();
    attempts = 0;
    const text = (pair) => t(pair);
    if (m.kind === "predict" || (m.kind === "check" && m.choices)) {
      const group = el("div", "lab2-options");
      group.setAttribute("role", "group");
      group.setAttribute("aria-label", t(["Choisis une réponse", "Choose an answer"]));
      m.choices.forEach((c, i) => {
        const b = el("button", "lab2-option", text(c));
        b.type = "button";
        b.setAttribute("aria-pressed", String(predictions[m.id]?.index === i));
        b.addEventListener("click", () => {
          if (m.kind === "predict") {
            predictions[m.id] = { index: i, text: text(c) };
            [...group.children].forEach((o, j) => o.setAttribute("aria-pressed", String(j === i)));
            markDone(text(T(gated ? "predicted" : "predictedFree")));
          } else {
            attempts++;
            if (i === m.answer) { [...group.children].forEach((o, j) => o.setAttribute("aria-pressed", String(j === i))); markDone(`${text(T("exact"))}${m.because ? " " + text(m.because) : ""}`); }
            else if (attempts >= 3) { markDone(`${text(T("reveal"))} ${text(m.choices[m.answer])}. ${m.because ? text(m.because) : ""}`); }
            else setFeedback(m.hint ? text(m.hint) : text(T("notYet")), "warn");
          }
        });
        group.append(b);
      });
      answerEl.append(group);
      if (m.kind === "check" && !gated) {
        const show = el("button", "text-button lab2-show", text(T("showAnswer")));
        show.type = "button";
        show.addEventListener("click", () => {
          [...group.children].forEach((o, j) => o.setAttribute("aria-pressed", String(j === m.answer)));
          markDone(`${text(T("reveal"))} ${text(m.choices[m.answer])}. ${m.because ? text(m.because) : ""}`);
        });
        answerEl.append(show);
      }
    } else if (m.kind === "check") {
      const form = el("form", "lab2-check");
      const label = el("label", "", text(T("yourAnswer")));
      const input = document.createElement("input");
      input.type = "text"; input.inputMode = "decimal"; input.autocomplete = "off"; input.id = `lab2-answer-${m.id}`;
      label.htmlFor = input.id;
      const submit = el("button", "primary", text(T("verify")));
      submit.type = "submit";
      form.append(label, input, submit);
      if (!gated) {
        const show = el("button", "text-button lab2-show", text(T("showAnswer")));
        show.type = "button";
        show.addEventListener("click", () => { markDone(`${text(T("reveal"))} ${fmt.num(m.answer, 3)}. ${m.because ? text(m.because) : ""}`); });
        form.append(show);
      }
      form.addEventListener("submit", (e) => {
        e.preventDefault();
        const raw = input.value.replace(/−/g, "-");
        if (!raw.trim()) return;
        attempts++;
        if (isAnswer(raw, m.answer, m.tolerance ?? 1e-6)) markDone(`${text(T("exact"))}${m.because ? " " + text(m.because) : ""}`);
        else if (attempts >= 3) markDone(`${text(T("reveal"))} ${fmt.num(m.answer, 3)}. ${m.because ? text(m.because) : ""}`);
        else setFeedback(m.hint ? text(m.hint) : text(T("notYet")), "warn");
      });
      answerEl.append(form);
    } else if (m.kind === "contrast") {
      const group = el("div", "lab2-variants");
      group.setAttribute("role", "group");
      group.setAttribute("aria-label", t(["Choisir un cas", "Choose a case"]));
      m.variants.forEach((v, i) => {
        const b = el("button", "secondary lab2-variant", text(v.label));
        b.type = "button"; b.setAttribute("aria-pressed", "false");
        b.addEventListener("click", () => {
          stopPlay();
          const previous = currentVariant;
          currentVariant = i;
          variantSeen.add(i);
          // the other case stays on the figure, faded, under the same slider values as the current one
          ghostSet = previous !== null && previous !== i ? m.variants[previous].set : previous === i ? ghostSet : null;
          apply(v.set);
          stage.invalidate();
          [...group.children].forEach((o, j) => o.setAttribute("aria-pressed", String(j === i)));
          if (variantSeen.size === m.variants.length) markDone(text(m.done || T("seeBoth")));
          else setFeedback("", "");
        });
        group.append(b);
      });
      answerEl.append(group);
    } else if (m.kind === "explain") {
      const recall = el("p", "lab2-recall");
      const firstPredict = missions.find((x) => x.kind === "predict" && predictions[x.id]);
      if (firstPredict) {
        const p = predictions[firstPredict.id], right = firstPredict.correct === p.index;
        write(recall, `${text(T("youPredicted"))} « ${p.text} » : ${firstPredict.correct === undefined ? "" : right ? text(T("rightGuess")) : text(T("wrongGuess"))}`);
        answerEl.append(recall);
      }
      if (slide) {
        // projected: no text box, the presenter reveals the argument
        const reveal = el("button", "primary", text(T("showArgument"))), arg = el("div", "lab2-reveal");
        reveal.type = "button"; arg.hidden = !done[m.id];
        if (done[m.id]) write(arg, text(m.argument));
        reveal.addEventListener("click", () => { arg.hidden = false; write(arg, text(m.argument)); reveal.hidden = true; markDone(""); });
        reveal.hidden = !!done[m.id];
        answerEl.append(reveal, arg);
        return finishAnswer(m);
      }
      const label = el("label", "", text(T("why")));
      const area = document.createElement("textarea");
      area.rows = 3; area.id = `lab2-why-${m.id}`; area.maxLength = 1500;
      label.htmlFor = area.id;
      const button = el("button", "primary", text(T("showArgument")));
      button.type = "button"; button.disabled = gated;
      const arg = el("div", "lab2-reveal");
      arg.hidden = true;
      const note = el("p", "lab2-note", text(T("needText")));
      note.hidden = !gated;
      // Gated: the argument waits for a written attempt. Free: writing first is suggested by the order, not required.
      if (gated) area.addEventListener("input", () => { button.disabled = area.value.trim().length < 10; note.hidden = !button.disabled; });
      button.addEventListener("click", () => {
        arg.hidden = false; write(arg, text(m.argument)); note.hidden = true; button.hidden = true; area.readOnly = true;
        markDone("");
        arg.tabIndex = -1; arg.focus({ preventScroll: false });
      });
      answerEl.append(label, area, note, button, arg);
      if (done[m.id]) { arg.hidden = false; write(arg, text(m.argument)); button.hidden = true; note.hidden = true; }
    }
    finishAnswer(m);
  }
  function finishAnswer(m) {
    const text = (pair) => t(pair);
    if (m.hint && (m.kind === "explore" || m.kind === "check" || m.kind === "contrast")) {
      const d = el("details", "lab2-hintbox");
      d.append(el("summary", "", text(T("hint"))), el("p", "", text(m.hint)));
      answerEl.append(d);
    }
    if (m.kind === "explore" || m.kind === "contrast") {
      const again = el("button", "text-button lab2-restart", text(T("restart")));
      again.type = "button";
      again.addEventListener("click", () => { enter(index); });
      answerEl.append(again);
    }
  }
  let currentVariant = null;

  function enter(i) {
    stopPlay();
    index = i;
    const m = mission();
    state = startState(m); version++;
    ghostSet = null; variantSeen = new Set(); currentVariant = null; attempts = 0;
    lockControls(m);
    setClass(card, "is-done", !!done[m.id]);
    setText(stepEl, (slide ? `${i + 1}/${missions.length}` : `${t(T("mission"))} ${full ? `${i + 1}/${missions.length}` : ""}`).trim());
    setText(kindEl, t(KINDS[m.kind]));
    card.dataset.kind = m.kind;
    put(promptEl, t(m.prompt));
    renderAnswer(m);
    setFeedback("");
    if (m.kind === "contrast" && m.variants?.length) answerEl.querySelector(".lab2-variant")?.click();
    maxReached = Math.max(maxReached, i);
    paintNav();
    if (card._open) card._open.href = (opts.href || ((ref) => `#lab/${ref}`))(`${exp.id}/${m.id}`);
    stage.invalidate();
    synced = -1;
    opts.onMission?.(exp.id, m.id, i);
  }

  function go(i) {
    if (i < 0 || i >= missions.length || i === index) return;
    if (full && gated && i > maxReached) return;
    enter(i);
    if (!slide) promptEl.focus({ preventScroll: true });   // in a slide the focus stays where the presenter put it (N and P again)
  }
  prevBtn.addEventListener("click", () => go(index - 1));
  nextBtn.addEventListener("click", () => go(index + 1));
  // N and P change mission; in a slide only when the canvas (or one of its handles) has focus, so the player keeps its own keys
  (slide ? stage.wrap : root).addEventListener("keydown", (e) => {
    if (!full && !slide) return;
    if (e.target.closest("input, textarea, select") || e.ctrlKey || e.metaKey || e.altKey) return;
    if (e.key === "n" || e.key === "N") { e.preventDefault(); go(index + 1); }
    if (e.key === "p" || e.key === "P") { e.preventDefault(); go(index - 1); }
  });

  // ---- derived DOM (formula, readout, table, control values, goal) written in the frame, only when the state changed
  const ctx = { fmt, lang: fmt.lang, unlocked: (id) => unlocked.has(id) };
  function sync() {
    if (synced === version) return;
    synced = version;
    const s = state;
    put(formulaEl, exp.views.formula(s, ctx));
    readout.update(exp.views.readout(s, ctx).map(([label, value]) => [t(label), value]));
    if (table) {
      const head = exp.views.table.head;
      table.update({ ...exp.views.table.data(s, ctx), head: (typeof head === "function" ? head(s, ctx) : head).map((h) => t(h)) });
    }
    setAttr(stage.canvas, "aria-label", `${t(exp.title)}. ${formulaEl._v}`);
    for (const n of Object.values(controlNodes)) {
      const c = n.c;
      if (n.input) {
        const v = sliderValue(c, s);
        if (document.activeElement !== n.input && n.input._v !== v) { n.input._v = v; n.input.value = v; }
        setText(n.out, c.format ? c.format(v, ctx) : fmt.num(v, c.digits ?? 2));
        setAttr(n.input, "aria-valuetext", n.out._v);
      } else if (n.buttons && !c.act) {
        const cur = c.get ? c.get(s) : s[c.key];
        n.buttons.forEach((b, i) => { const on = c.options[i].value === cur; setAttr(b, "aria-checked", String(on)); setClass(b, "is-on", on); });
      }
    }
    const m = mission();
    if (m && m.kind === "explore" && !done[m.id] && m.goal(s, model(s))) markDone(t(m.done || T("goal")));
  }

  // The first mission of the reference.
  const startAt = Math.max(0, missions.findIndex((m) => m.id === opts.mission));
  maxReached = startAt;
  enter(startAt);

  const api = {
    root, stage, get index() { return index; },
    get view() { return view; },   // the template's view (tests read its panels)
    get mission() { return mission(); },
    getState: () => state,
    setState: (partial) => userApply(partial),
    setMission(idOrIndex) {
      const i = typeof idOrIndex === "number" ? idOrIndex : missions.findIndex((m) => m.id === idOrIndex);
      if (i >= 0) { maxReached = Math.max(maxReached, i); enter(i); }
    },
    flush() { sync(); },
    destroy() {
      alive = false;
      clearTimeout(announceTimer);
      stopPlay();
      view.destroy?.();
      stage.destroy();
      root.remove();
      if (slide) {   // the areas belong to the player: leave them as they were found
        formulaEl.remove(); readout.el.remove(); host.classList.remove("lab2-canvas-host");
        if (opts.hint) { opts.hint.classList.remove("lab2-hint"); opts.hint.textContent = ""; }
      }
    },
  };
  root.__lab = api;   // read by the browser tests (tests/lab_browser.py) to set a state or read the mission
  return api;
}

