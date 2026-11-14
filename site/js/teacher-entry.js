// Which audience a device opens for: visitor, student or teacher. Visitor is the default everywhere; a choice made on a
// device is stored there (key mx-teacher-entry, through teacher-state.js) and always wins. No account: the choice changes
// the entrance and the ergonomics, never what can be read (nothing on the site is private, see docs/AUDIENCE_MODES.md).
// Eager and tiny: app.js uses it at start-up; the dashboard itself (teacher-dashboard.js) is loaded only when opened.
export const TEACHER_HASH = '#teacher';
// The three audiences, in menu order. Strings are [French, English]; `hash` is the home of the audience.
export const AUDIENCES = [
  {id:'visitor',label:['Visiteur','Visitor'],hint:['Découvrir librement','Look around freely'],hash:'#home'},
  {id:'student',label:['Élève','Student'],hint:['Ma classe, mes chapitres, mes révisions','My class, my chapters, my review'],hash:'#home'},
  {id:'teacher',label:['Professeur','Teacher'],hint:['Préparer, faire classe, se détendre','Prepare, teach, relax'],hash:TEACHER_HASH},
];
const IDS = AUDIENCES.map(a => a.id);
// Audience in force when nothing is stored. The argument is kept for callers of the former per-edition default.
export const defaultEntry = () => 'visitor';
// Audience in force: the stored choice, else the default.
export const effectiveEntry = (entry) => (IDS.includes(entry) ? entry : defaultEntry());
// Hash to open instead of the requested one, or null. Only an empty address or the bare '#' is redirected (an explicit
// '#home' still opens the home), and only for a device that chose the teacher audience.
export const landingHash = (hash, entry) => (effectiveEntry(entry) === 'teacher' && (!hash || hash === '#') ? TEACHER_HASH : null);
// Where the logo and the "home" of this device point.
export const homeHash = (entry) => (effectiveEntry(entry) === 'teacher' ? TEACHER_HASH : '#home');
// Elements with data-set-entry="visitor|student|teacher" record the choice, then follow their own link.
export function installEntrySwitch(root, state) {
  const click = e => {
    const el = e.target.closest?.('[data-set-entry]');
    if (el && root.contains(el)) state.setEntry(el.dataset.setEntry);
  };
  root.addEventListener('click', click);
  return () => root.removeEventListener('click', click);
}
