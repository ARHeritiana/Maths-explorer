// Interface motion, design v8 "Bande dessinée" (docs/DESIGN_V8.md): nothing moves on its own. A starburst marks an
// event only: a right answer ("BIEN VU !", red) or a wrong one ("OUPS", blue); the feedback box keeps the words.
export function installInterfaceMotion() {}

const NS = "http://www.w3.org/2000/svg";
// A comic starburst: sixteen outer points with a fixed irregularity, so every burst has the same hand-drawn shape.
const JIT = [1, .88, 1.06, .93, 1.02, .86, 1.08, .95, .9, 1.04, .97, .87, 1.05, .92, 1.01, .89];
function burstPath(n = 16, R = 62, r = 42) {
  let d = "";
  for (let i = 0; i < 2 * n; i++) {
    const a = -Math.PI / 2 + i * Math.PI / n, rr = i % 2 ? r : R * JIT[(i / 2) % JIT.length | 0];
    d += (i ? " L" : "M") + (66 + rr * Math.cos(a)).toFixed(1) + " " + (66 + rr * Math.sin(a)).toFixed(1);
  }
  return d + " Z";
}
function burst(element, word, fill) {
  if (getComputedStyle(element).position === "static") element.style.position = "relative";
  element.querySelectorAll(":scope > .burst").forEach(old => old.remove());
  const svg = document.createElementNS(NS, "svg");
  svg.setAttribute("class", "burst");
  svg.setAttribute("viewBox", "0 0 132 132");
  svg.setAttribute("aria-hidden", "true");
  Object.assign(svg.style, { right: "-34px", top: "-46px" });
  const path = document.createElementNS(NS, "path");
  path.setAttribute("d", burstPath());
  path.setAttribute("fill", fill);
  const text = document.createElementNS(NS, "text");
  text.setAttribute("x", "66");
  text.setAttribute("y", "78");
  text.style.fontSize = word.length > 7 ? "24px" : "32px";
  text.textContent = word;
  svg.append(path, text);
  element.append(svg);
  setTimeout(() => svg.remove(), 1400);
}
const fr = () => (document.documentElement.lang || "fr").startsWith("fr");
export function celebrate(element, reduced) {
  if (!element || reduced?.()) return;
  burst(element, fr() ? "BIEN VU !" : "NICE!", "#e11d2e");
}
export function illuminateFeedback(element, reduced) {
  if (!element || reduced() || !element.animate) return;
  if (element.classList.contains("success")) celebrate(element, reduced);
  else if (element.classList.contains("error")) burst(element, "OUPS", "#1d4ed8");
  element.getAnimations().forEach(animation => animation.cancel());
  element.animate([{ opacity: .4 }, { opacity: 1 }], { duration: 200, easing: "ease-out" });
}
