// Which entrance a device opens: the student home (default for everyone) or the teacher dashboard (an explicit, reversible choice).
// Eager and tiny: app.js uses it at start-up; the dashboard itself (teacher-dashboard.js) is loaded only when opened.
export const TEACHER_HASH = '#teacher';
// Hash to open instead of the requested one, or null. Only an empty address or the bare home is redirected, and only when
// the teacher chose that entrance on this device; every explicit link still goes where it points.
export const landingHash = (hash, entry) => (entry === 'teacher' && (!hash || hash === '#' || hash === '#home') ? TEACHER_HASH : null);
// Where the logo and the "home" of this device point.
export const homeHash = entry => (entry === 'teacher' ? TEACHER_HASH : '#home');
// Elements with data-set-entry="teacher|student" record the choice, then follow their own link.
export function installEntrySwitch(root, state) {
  const click = e => {
    const el = e.target.closest?.('[data-set-entry]');
    if (el && root.contains(el)) state.setEntry(el.dataset.setEntry);
  };
  root.addEventListener('click', click);
  return () => root.removeEventListener('click', click);
}
