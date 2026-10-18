// One small animated emblem per challenge card. Pure SVG drawn with currentColor (the card colour), so it follows
// both themes; the motion lives in pages.css under prefers-reduced-motion: no-preference (classes ci-*).
const svg = (body) => `<svg class="ci" viewBox="0 0 64 64" width="64" height="64" aria-hidden="true" focusable="false"><g fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">${body}</g></svg>`;
const soft = 'fill="currentColor" fill-opacity=".22"';
const dot = (x, y, r = 3.4, cls = "") => `<circle class="${cls}" cx="${x}" cy="${y}" r="${r}" fill="currentColor" stroke="none"/>`;

const ring = (n, R, f) => Array.from({ length: n }, (_, i) => { const a = (i / n) * 2 * Math.PI - Math.PI / 2; return f(32 + R * Math.cos(a), 32 + R * Math.sin(a), i); }).join("");
const starPts = [0, 1, 2, 3, 4].map((i) => { const a = ((i * 144 - 90) * Math.PI) / 180; return `${(32 + 24 * Math.cos(a)).toFixed(1)},${(32 + 24 * Math.sin(a)).toFixed(1)}`; }).join(" ");
const pent = Array.from({ length: 5 }, (_, i) => { const a = ((i * 72 - 90) * Math.PI) / 180; return [32 + 22 * Math.cos(a), 32 + 22 * Math.sin(a)]; });

export const CHALLENGE_ICONS = {
  doors: svg(`<rect x="6" y="14" width="14" height="38" rx="2"/><rect class="ci-door" x="25" y="14" width="14" height="38" rx="2" ${soft}/><rect x="44" y="14" width="14" height="38" rx="2"/>${dot(16, 33, 1.8)}${dot(41, 33, 1.8)}${dot(54.5, 33, 1.8)}`),
  chess: svg(`<rect x="8" y="8" width="48" height="48" rx="3"/><path d="M8 24h48M8 40h48M24 8v48M40 8v48"/><rect class="ci-slide" x="11" y="11" width="26" height="10" rx="3" ${soft}/><rect x="43" y="27" width="10" height="26" rx="3" ${soft}/>`),
  nim: svg([0, 1, 2, 3, 4].map((i) => `<circle class="ci-blink" style="--d:${i * 0.18}s" cx="${12 + i * 10}" cy="34" r="4.2" fill="currentColor" fill-opacity=".5"/>`).join("") + `<path d="M8 46h48"/><path class="ci-blink" style="--d:.9s" d="M20 18l12-8 12 8"/>`),
  pigeonhole: svg(`<path d="M6 30v20h16V30M24 30v20h16V30M42 30v20h16V30"/>${dot(14, 44)}${dot(32, 44)}${dot(50, 44)}${dot(32, 20, 3.8, "ci-bob")}${dot(23, 40, 3.2, "ci-bob2")}`),
  squares: svg([[0, 2], [1, 2], [2, 2], [2, 1], [2, 0]].map(([r, c], i) => `<rect class="ci-blink" style="--d:${i * 0.2}s" x="${10 + c * 16}" y="${10 + r * 16}" width="14" height="14" rx="2" fill="currentColor" fill-opacity=".45"/>`).join("") + [[0, 0], [0, 1], [1, 0], [1, 1]].map(([r, c]) => `<rect x="${10 + c * 16}" y="${10 + r * 16}" width="14" height="14" rx="2"/>`).join("")),
  hanoi: svg(`<path d="M32 10v40M8 52h48"/><rect x="14" y="44" width="36" height="7" rx="3" ${soft}/><rect x="20" y="36" width="24" height="7" rx="3" ${soft}/><rect class="ci-bob" x="25" y="28" width="14" height="7" rx="3" fill="currentColor" fill-opacity=".5"/>`),
  eggs: svg(`<path d="M10 56h20V12H10zM10 24h20M10 36h20M10 48h20" stroke-width="2.4"/><ellipse class="ci-fall" cx="46" cy="14" rx="7" ry="9" ${soft}/><path d="M38 56h16" />`),
  konigsberg: svg(`<path d="M32 14c-14 4-14 32 0 36M32 14c14 4 14 32 0 36M14 32h36M32 14v-3M32 50v3" stroke-dasharray="3 0"/><circle cx="32" cy="14" r="5" fill="currentColor" fill-opacity=".5"/><circle cx="32" cy="50" r="5" fill="currentColor" fill-opacity=".5"/><circle cx="14" cy="32" r="5" fill="currentColor" fill-opacity=".5"/><circle cx="50" cy="32" r="5" fill="currentColor" fill-opacity=".5"/><path class="ci-trace" d="M14 32L32 14l18 18-18 18z" stroke-dasharray="14 100"/>`),
  josephus: svg(`<g class="ci-spin">${ring(8, 21, (x, y, i) => (i === 3 ? `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="4.5" fill="none"/>` : dot(x.toFixed(1), y.toFixed(1), 3.6)))}</g>`),
  ramsey: svg(`<g class="ci-pulse">${pent.map((p, i) => { const q = pent[(i + 1) % 5], r = pent[(i + 2) % 5]; return `<path d="M${p[0]} ${p[1]}L${q[0]} ${q[1]}" ${i % 2 ? 'stroke-dasharray="4 4"' : ""}/><path d="M${p[0]} ${p[1]}L${r[0]} ${r[1]}" stroke-opacity=".45" ${i % 2 ? "" : 'stroke-dasharray="4 4"'}/>`; }).join("")}</g>${pent.map((p) => dot(p[0].toFixed(1), p[1].toFixed(1), 3.8)).join("")}`),
  artgallery: svg(`<path d="M8 50V14l16 14 14-14 4 22 14 14z" stroke-linejoin="round"/><path class="ci-pulse" d="M24 40L8 14M24 40L38 14M24 40l30 10" stroke-width="1.8" stroke-dasharray="3 3"/>${dot(24, 40, 4.2, "ci-bob")}`),
  gridpaths: svg(`<path d="M10 54h44M10 41h44M10 28h44M10 15h44M10 15v39M23 15v39M36 15v39M49 15v39" stroke-opacity=".3" stroke-width="1.8"/><path class="ci-draw" d="M10 54h13v-13h13v-13h13v-13" stroke-width="4"/>${dot(10, 54, 4)}${dot(49, 15, 4)}`),
  horses: svg([0, 1, 2, 3, 4].map((i) => `<path d="M8 ${14 + i * 9}h48" stroke-opacity=".3" stroke-width="2"/><circle class="ci-run" style="--d:${i * 0.35}s" cx="12" cy="${14 + i * 9}" r="3.4" fill="currentColor" stroke="none"/>`).join("") + `<path d="M56 10v44" stroke-width="2.4"/>`),
  cake: svg(`<path d="M32 8l22 11v26L32 56 10 45V19z"/><path d="M10 19l22 11 22-11M32 30v26" stroke-opacity=".6"/><path class="ci-cut" d="M32 8l22 11-22 11-22-11z" ${soft}/>`),
  queens: svg(`<path d="M10 20l8 14 8-18 6 18 6-18 8 18 8-14-3 28H13z" ${soft} class="ci-bob"/><path d="M13 52h38"/>${dot(10, 20, 3)}${dot(54, 20, 3)}${dot(32, 12, 3)}`),
  snail: svg(`<path d="M50 10v46" stroke-width="2.4"/><path d="M6 56h50" /><path class="ci-draw" d="M10 52c0-14 14-14 14-6s-8 6-8 0 8-9 14-3 14 4 12-14" stroke-width="3.2"/><circle class="ci-climb" cx="50" cy="52" r="4" fill="currentColor" stroke="none"/>`),
  bridge: svg(`<path d="M4 38h56M10 38c8-16 36-16 44 0"/><path d="M4 46h56" stroke-opacity=".4"/>${[0, 1, 2, 3].map((i) => `<circle class="ci-cross" style="--d:${i * 0.5}s" cx="10" cy="32" r="3.2" fill="currentColor" stroke="none"/>`).join("")}`),
  lighteggs: svg(`<g class="ci-pulse"><path d="M32 4v6M12 12l4 4M52 12l-4 4M6 28h6M52 28h6" stroke-opacity=".7"/></g><path d="M22 36c-6-5-6-18 4-22 8-3 18 2 18 12 0 5-3 8-6 10v4H26v-4z" ${soft}/><path d="M26 44h14M27 50h12"/>`),
  fakecoins: svg(`<path d="M32 10v40M20 54h24"/><g class="ci-tilt"><path d="M8 20h48"/><path d="M8 20l-4 14h16zM56 20l-4 14h16z" ${soft}/></g>${dot(32, 10, 3.4)}`),
  reflect: svg(`<path d="M32 6v52" stroke-dasharray="4 4" stroke-opacity=".6"/><path class="ci-draw" d="M12 48L32 24 52 48" stroke-width="3"/>${dot(12, 48, 4)}${dot(52, 48, 4)}${dot(32, 24, 3.4, "ci-pulse")}`),
  lunes: svg(`<circle cx="26" cy="34" r="20"/><circle class="ci-pulse" cx="40" cy="30" r="16" ${soft}/><path d="M6 34h40" stroke-opacity=".4"/>`),
  star: svg(`<polygon class="ci-spin-slow" points="${starPts}" ${soft}/>${dot(32, 8, 3.2)}`),
  box: svg(`<path d="M10 22l18-8h26v28l-18 8H10z"/><path d="M10 22h26l18-8M36 22v28" stroke-opacity=".6"/><path class="ci-draw" d="M14 46L36 22l18-8" stroke-width="3.4"/>${dot(14, 46, 3.6)}${dot(54, 14, 3.6)}`),
  merge: svg(`<circle class="ci-merge-l" cx="18" cy="32" r="9" ${soft}/><circle class="ci-merge-r" cx="46" cy="32" r="9" ${soft}/><path d="M32 10v6M32 48v6" stroke-opacity=".5"/>`),
  cham: svg(`<circle class="ci-hue" cx="20" cy="22" r="10" fill="currentColor"/><circle class="ci-hue" style="--d:-1s" cx="44" cy="22" r="10" fill="currentColor"/><circle class="ci-hue" style="--d:-2s" cx="32" cy="44" r="10" fill="currentColor"/>`),
  pegs: svg(`<path d="M8 52h48M8 36h48M8 20h48M12 16v40M28 16v40M44 16v40" stroke-opacity=".28" stroke-width="1.6"/><circle cx="12" cy="52" r="5" fill="currentColor" fill-opacity=".35"/><circle cx="28" cy="52" r="5" fill="currentColor" fill-opacity=".35"/><g class="ci-bob"><circle cx="12" cy="36" r="5" fill="currentColor"/></g><path d="M12 31c5-12 16-12 21-2" stroke-dasharray="3 3"/>${dot(44, 52, 3, "ci-blink")}`),
  inversions: svg(`<rect x="8" y="30" width="9" height="22" rx="2" ${soft}/><rect class="ci-swap-a" x="21" y="14" width="9" height="38" rx="2" ${soft}/><rect class="ci-swap-b" x="34" y="22" width="9" height="30" rx="2" ${soft}/><rect x="47" y="40" width="9" height="12" rx="2" ${soft}/><path d="M6 56h52"/>`),
  piles: svg(`<g class="ci-bob">${[0, 1, 2].map((i) => `<ellipse cx="20" cy="${44 - i * 9}" rx="11" ry="4.5" ${soft}/>`).join("")}</g>${[0, 1, 2].map((i) => `<ellipse cx="46" cy="${44 - i * 9}" rx="11" ry="4.5" ${i === 1 ? 'fill="currentColor" fill-opacity=".6"' : soft}/>`).join("")}<path d="M6 54h52"/>`),
};

export const challengeIcon = (id) => CHALLENGE_ICONS[id] || svg(`<circle cx="32" cy="32" r="20"/>${dot(32, 32, 4, "ci-pulse")}`);
