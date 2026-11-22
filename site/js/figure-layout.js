// Figure and console: one layout for every interactive figure of the gallery (owner, 22 November 2026).
// The figure and the controls that act on it are always on one screen. When the figure area is wide (container query in
// styles/figure-layout.css), the controls sit in a column beside the figure, which is sized to the height of the viewport;
// when it is narrow, the controls follow the figure directly and the figure is short enough to leave room for them.
// The exhibits keep writing their markup as before (help, stage, metrics, plot, controls, readout, notes); `arrangeFigure`
// sorts those top-level blocks into two columns. It moves nodes (listeners and canvases survive) and sorts again when an
// exhibit rebuilds its markup.

// Blocks that belong beside the figure: what the reader acts with and the live values it reads while acting. The readout
// (the sentence that says what the figure shows) stays under the figure as its caption.
const CONSOLE = [".act-help", ".act-controls", ".act-buttons", ".exhibit-metrics", ".feedback"];
const isConsole = (el) => CONSOLE.some((s) => el.matches(s)) && !el.querySelector("canvas, .obj-stage");

// Pure: which column a top-level block of an exhibit goes to ('console' or 'main'), from its classes and whether it holds a
// canvas. Exported for the tests.
export function columnOf({ classes = [], hasCanvas = false }) {
  if (hasCanvas) return "main";
  return CONSOLE.some((s) => classes.includes(s.slice(1))) ? "console" : "main";
}

// Pure: a set of buttons with aria-pressed is one choice among several when exactly one of them is pressed (a radio group
// in all but name); otherwise each one is an on/off toggle. The console draws the two differently (figure-layout.css).
export function pressedKind(states) {
  return states.length >= 2 && states.filter((s) => s === "true").length === 1 ? "choice" : "toggle";
}
const WIDE = 860;   // the container width of styles/figure-layout.css where the console moves beside the figure

export function arrangeFigure(root) {
  if (!root || root.querySelector(":scope > .fig-split")) return () => {};
  const doc = root.ownerDocument, split = doc.createElement("div"), main = doc.createElement("div"), side = doc.createElement("div");
  split.className = "fig-split"; main.className = "fig-main"; side.className = "fig-console";
  side.setAttribute("role", "group");
  split.append(main, side);
  let sorting = false, wide = null;
  const placeBands = () => {
    const nowWide = root.clientWidth >= WIDE;
    if (nowWide === wide && !sorting) return;
    wide = nowWide;
    const bands = [...main.children, ...side.children].filter((n) => n.dataset.figBand !== undefined);
    const stage = main.querySelector(":scope > :is(.obj-stage, .exhibit-stage)");
    for (const b of bands) {
      if (wide) { if (b.parentNode !== side) side.insertBefore(b, side.querySelector(":scope > :not([data-fig-band])")); }
      else if (b.parentNode !== main) main.insertBefore(b, stage);
    }
  };
  // buttons with aria-pressed: one choice among several, or on/off toggles (drawn differently by the CSS)
  const classify = () => {
    const groups = new Set([...side.querySelectorAll("button[aria-pressed]")].map((b) => b.parentElement));
    for (const g of groups) {
      const bs = [...g.children].filter((b) => b.matches("button[aria-pressed]"));
      const kind = pressedKind(bs.map((b) => b.getAttribute("aria-pressed")));
      for (const b of bs) if (!b.dataset.fig) b.dataset.fig = kind;
    }
  };
  const sort = () => {
    sorting = true;
    const loose = [...root.children].filter((n) => n !== split);
    if (loose.length) {
      // a rebuild replaced the whole markup: start again from the new blocks; a block added later joins its column
      if (!split.isConnected) { main.replaceChildren(); side.replaceChildren(); root.append(split); }
      // a band of choices written before the figure (a question, a mode) is marked: it moves with the width
      let seenStage = !!main.querySelector(":scope > :is(.obj-stage, .exhibit-stage)");
      for (const n of loose) {
        if (n.matches(".obj-stage, .exhibit-stage") || n.querySelector("canvas")) seenStage = true;
        else if (!seenStage && n.matches(".exhibit-band")) n.dataset.figBand = "";
        (isConsole(n) ? side : main).append(n);
      }
    }
    // a band of choices above the figure (question, mode) joins the console when it sits beside the figure
    placeBands();
    classify();
    side.hidden = !side.children.length;
    split.classList.toggle("fig-solo", side.hidden);
    sorting = false;
  };
  root.classList.add("fig-layout");
  sort();
  const MO = doc.defaultView.MutationObserver;
  const mo = MO ? new MO(() => { if (!sorting && [...root.children].some((n) => n !== split)) sort(); }) : null;
  mo?.observe(root, { childList: true });
  const RO = doc.defaultView.ResizeObserver;
  const ro = RO ? new RO(() => { if (!sorting) placeBands(); }) : null;
  ro?.observe(root);
  return () => { mo?.disconnect(); ro?.disconnect(); root.classList.remove("fig-layout"); };
}
