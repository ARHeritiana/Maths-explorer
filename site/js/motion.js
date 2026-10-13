// Animate the mathematical parameters, not independent SVG coordinates.
// A rotating point therefore stays on its circle and every frame's results
// describe the frame's graph. Integer-valued models always use exact counts.
export function createLabMotion({ paint, reduced, visible, request = requestAnimationFrame, cancel = cancelAnimationFrame, now = () => performance.now() }) {
  let frame = null;
  let displayed = null;
  let target = null;
  let parameters = [];

  function stop() {
    if (frame !== null) cancel(frame);
    frame = null;
  }
  function settle() {
    stop();
    if (target) {
      displayed = [...target];
      paint(displayed, false);
    }
  }
  function reset() {
    stop();
    displayed = target = null;
  }
  function move(values, params) {
    stop();
    target = [...values];
    parameters = params;
    if (!displayed || reduced() || !visible()) return settle();
    const from = [...displayed];
    const started = now();
    const tick = (time) => {
      frame = null;
      if (reduced() || !visible()) return settle();
      const progress = Math.min(1, Math.max(0, (time - started) / 160));
      const eased = 1 - (1 - progress) ** 3;
      displayed = target.map((value, i) =>
        ["n", "N"].includes(parameters[i][0])
          ? value
          : from[i] + (value - from[i]) * eased,
      );
      // Always finish at the exact slider values (no accumulated rounding).
      if (progress === 1) return settle();
      paint(displayed, true);
      frame = request(tick);
    };
    frame = request(tick);
  }
  function remember(values) {
    stop();
    displayed = target = [...values];
  }
  return { move, settle, reset, remember };
}

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

export function illuminateFeedback(element, reduced) {
  if (!element || reduced() || !element.animate) return;
  element.getAnimations().forEach(animation => animation.cancel());
  element.animate(
    [{ opacity: .55, transform: "translateY(5px)" }, { opacity: 1, transform: "translateY(0)" }],
    { duration: 360, easing: "cubic-bezier(.16,1,.3,1)" },
  );
}
