// Which entrance a device opens. Each edition has a default (limited edition: the teacher entrance; full edition: the student
// home); an explicit choice stored on the device always wins, in both editions. The edition flag lives in live-curriculum.js.
// Eager and tiny: app.js uses it at start-up; the dashboard itself (teacher-dashboard.js) is loaded only when opened.
import {FULL_EDITION} from './live-curriculum.js';
export const TEACHER_HASH = '#teacher';
// Entrance in force: the stored choice ('teacher' | 'student'), else the edition default.
export const defaultEntry = (full = FULL_EDITION) => (full ? 'student' : 'teacher');
export const effectiveEntry = (entry, {full = FULL_EDITION} = {}) => (entry === 'teacher' || entry === 'student' ? entry : defaultEntry(full));
// Hash to open instead of the requested one, or null. Only an empty address or the bare '#' is redirected (an explicit
// '#home' still opens the student home), and only when the effective entrance is the teacher one.
export const landingHash = (hash, entry, opts) => (effectiveEntry(entry, opts) === 'teacher' && (!hash || hash === '#') ? TEACHER_HASH : null);
// Where the logo and the "home" of this device point.
export const homeHash = (entry, opts) => (effectiveEntry(entry, opts) === 'teacher' ? TEACHER_HASH : '#home');
// Elements with data-set-entry="teacher|student" record the choice, then follow their own link.
export function installEntrySwitch(root, state) {
  const click = e => {
    const el = e.target.closest?.('[data-set-entry]');
    if (el && root.contains(el)) state.setEntry(el.dataset.setEntry);
  };
  root.addEventListener('click', click);
  return () => root.removeEventListener('click', click);
}
