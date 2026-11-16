// Theme of a foundation lesson opened on its own (outside the site's frame): the visitor's saved site theme, else the
// system preference. Inside the site, basics-page.js bindBasics sets the host page's theme and keeps it in step.
(function () {
  var root = document.documentElement, saved = null;
  try { saved = localStorage.getItem("maths-explorer-theme"); } catch (e) { /* storage blocked */ }
  if (!root.dataset.theme) root.dataset.theme = saved === "nuit" || saved === "jour" ? saved : (matchMedia("(prefers-color-scheme: dark)").matches ? "nuit" : "jour");
})();
