export function installInterfaceMotion(root, reduced) {
  if (reduced() || !Element.prototype.animate) return;
  const surfaces = root.querySelectorAll(".lab-heading, .experiment, .learning, .history, .page-heading, .challenge-card, .pathway-card, .hint-panel");
  surfaces.forEach((element, i) => {
    element.animate(
      [{ opacity: 0, transform: "translateY(10px)" }, { opacity: 1, transform: "translateY(0)" }],
      { duration: 440, delay: Math.min(i * 40, 200), easing: "cubic-bezier(.16,1,.3,1)" },
    );
  });
  root.querySelectorAll("details").forEach(details => {
    details.addEventListener("toggle", () => {
      if (!details.open || reduced()) return;
      for (const content of details.children) {
        if (content.tagName === "SUMMARY") continue;
        content.animate([{ opacity: 0, transform: "translateY(5px)" }, { opacity: 1, transform: "translateY(0)" }], { duration: 240, easing: "ease-out" });
      }
    });
  });
}

// A short burst of coloured pieces from a correct answer. Decorative (aria-hidden), removed after 1.2 s, skipped under reduced motion.
export function celebrate(element, reduced) {
  if (!element || reduced() || !element.animate) return;
  const box = element.getBoundingClientRect(), layer = document.createElement("div");
  layer.setAttribute("aria-hidden", "true");
  layer.style.cssText = `position:fixed;left:${box.left}px;top:${box.top}px;width:${box.width}px;height:0;pointer-events:none;z-index:50`;
  for (let i = 0; i < 28; i++) {
    const bit = document.createElement("i"), size = 6 + Math.random() * 6, dx = (Math.random() - 0.5) * 260, dy = -40 - Math.random() * 110;
    bit.style.cssText = `position:absolute;left:${10 + Math.random() * 80}%;top:0;width:${size}px;height:${size * (Math.random() < 0.5 ? 1 : 0.5)}px;border-radius:${Math.random() < 0.4 ? "50%" : "1px"};background:var(--c${1 + (i % 8)})`;
    layer.append(bit);
    bit.animate([{ transform: "translate(0,0) rotate(0)", opacity: 1 }, { transform: `translate(${dx}px,${dy}px) rotate(${Math.random() * 540}deg)`, opacity: 1, offset: 0.45 }, { transform: `translate(${dx * 1.2}px,${dy + 150}px) rotate(${Math.random() * 900}deg)`, opacity: 0 }], { duration: 900 + Math.random() * 400, easing: "cubic-bezier(.2,.7,.4,1)", fill: "forwards" });
  }
  document.body.append(layer);
  setTimeout(() => layer.remove(), 1400);
}
export function illuminateFeedback(element, reduced) {
  if (!element || reduced() || !element.animate) return;
  if (element.classList.contains("success")) celebrate(element, reduced);
  element.getAnimations().forEach(animation => animation.cancel());
  element.animate(
    [{ opacity: .55, transform: "translateY(5px)" }, { opacity: 1, transform: "translateY(0)" }],
    { duration: 360, easing: "cubic-bezier(.16,1,.3,1)" },
  );
}
