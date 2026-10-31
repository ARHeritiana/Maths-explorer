// Design v6 "Grille": no decoration. Surfaces do not rise in; details open without a slide.
export function installInterfaceMotion() {}

// A correct answer is shown by the feedback box itself (colour and text); no confetti.
export function celebrate() {}
export function illuminateFeedback(element, reduced) {
  if (!element || reduced() || !element.animate) return;
  if (element.classList.contains("success")) celebrate(element, reduced);
  element.getAnimations().forEach(animation => animation.cancel());
  element.animate([{ opacity: .4 }, { opacity: 1 }], { duration: 200, easing: "ease-out" });
}
