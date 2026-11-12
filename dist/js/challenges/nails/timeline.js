// Pure timeline of "pull nails out" for the nails challenge (no DOM; tests/nails-timeline.test.mjs). Given the turns of the rope,
// the nails already pulled and the nails pulled now, `timeline` lists what happens in order: the nails pop out, the turns around
// them slip off, pairs of neighbouring turns that go round the same nail the opposite ways come undone, and then the picture
// falls (nothing left to hold the rope) or sways (still caught). `poseAt(timeline, p)` is a pure function of p in [0, 1]
// giving everything the drawing needs, so any frame can be reproduced, scrubbed or shown still.
export const clamp01 = (x) => Math.min(1, Math.max(0, x));
export const easeInOut = (s) => (s < 0.5 ? 4 * s * s * s : 1 - (-2 * s + 2) ** 3 / 2);
export const easeOut = (s) => 1 - (1 - s) ** 3;

// what is left of the rope when the nails of `mask` (bit i = nail i + 1) are out: turns around them gone, neighbouring opposite
// turns round the same nail undone (in the order they come undone: inner pairs first), and whether nothing holds the picture
export function settled(word, mask) {
  const erased = new Set(), stack = [], pairs = [];
  word.forEach((c, j) => {
    if ((mask >> (Math.abs(c) - 1)) & 1) erased.add(j);
    else if (stack.length && word[stack.at(-1)] === -c) pairs.push([stack.pop(), j]);
    else stack.push(j);
  });
  const undone = new Set(pairs.flat());
  return { erased, pairs, undone, gone: new Set([...erased, ...undone]), falls: stack.length === 0, left: stack };
}
const pullOf = (n, mask) => Array.from({ length: n }, (_, i) => ((mask >> i) & 1 ? 1 : 0));
// the resting pose of a mask
export function poseOf(word, n, mask) {
  const st = settled(word, mask);
  return { pull: pullOf(n, mask), squash: Array(n).fill(0), collapse: word.map((_, j) => (st.gone.has(j) ? 1 : 0)), fall: st.falls ? 1 : 0, sway: 0 };
}
const W = { reset: 1.1, pull: 1.3, slip: 1.1, undo: 1.1, fall: 1.9, sway: 1.3 };

// events: pulling `add` (nail numbers 0-based, in order) from the state with `from` already out; `prev` (optional) is the mask
// shown before, when different the timeline starts by moving from there to `from`
export function timeline(word, n, { from = 0, add = [], prev = from } = {}) {
  const events = [];
  if (prev !== from) events.push({ type: "reset", w: W.reset, a: poseOf(word, n, prev), b: poseOf(word, n, from) });
  let mask = from;
  for (const i of add) {
    if ((mask >> i) & 1) continue;
    const before = settled(word, mask); mask |= 1 << i; const after = settled(word, mask);
    events.push({ type: "pull", w: W.pull, nail: i });
    const mine = [...after.gone].filter((j) => !before.gone.has(j) && Math.abs(word[j]) === i + 1);
    if (mine.length) events.push({ type: "slip", w: W.slip, turns: mine, nail: i });
    for (const pair of after.pairs) if (pair.some((j) => !before.gone.has(j)) && !pair.every((j) => mine.includes(j))) events.push({ type: "undo", w: W.undo, turns: pair.filter((j) => !before.gone.has(j)) });
    if (after.falls && !before.falls) events.push({ type: "fall", w: W.fall });
    else if (!after.falls) events.push({ type: "sway", w: W.sway });
  }
  return { word, n, from, to: mask, prev, events, total: events.reduce((t, e) => t + e.w, 0) || 1 };
}

// the pose at progress p: applies finished events fully, the running one partly
export function poseAt(tl, p) {
  const { word, n } = tl, start = tl.events[0]?.type === "reset" ? tl.events[0].a : poseOf(word, n, tl.from);
  const pose = { pull: start.pull.slice(), squash: Array(n).fill(0), collapse: start.collapse.slice(), fall: start.fall, sway: 0, focus: -1 };
  let t = clamp01(p) * tl.total;
  for (const e of tl.events) {
    const s = clamp01(t / e.w), done = t >= e.w; t -= e.w;
    if (e.type === "reset") {
      const k = easeInOut(s);
      pose.pull = e.a.pull.map((v, i) => v + (e.b.pull[i] - v) * k); pose.collapse = e.a.collapse.map((v, j) => v + (e.b.collapse[j] - v) * k); pose.fall = e.a.fall + (e.b.fall - e.a.fall) * k;
    } else if (e.type === "pull") {
      pose.focus = e.nail;
      if (done) pose.pull[e.nail] = 1;
      else if (s < 0.3) pose.squash[e.nail] = 0.28 * Math.sin((Math.PI / 2) * (s / 0.3));   // anticipation: the nail is pressed flat
      else { const u = (s - 0.3) / 0.7; pose.pull[e.nail] = easeOut(u); pose.squash[e.nail] = -0.2 * Math.sin(Math.PI * u); }   // then it stretches out and pops
    } else if (e.type === "slip" || e.type === "undo") {
      for (const j of e.turns) pose.collapse[j] = done ? 1 : easeInOut(s);
    } else if (e.type === "fall") pose.fall = done ? 1 : s;
    else if (e.type === "sway") pose.sway = done ? 0 : s;
    if (!done) break;
  }
  return pose;
}
