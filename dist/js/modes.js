// The three teacher modes shown in the mode bar. Pure: no DOM, no storage.
// Strings are [French, English] pairs; hashes are the home page of each mode.
export const MODES = [
 {id:'preparer',label:['Préparer','Prepare'],hash:'#prepare'},
 {id:'classe',label:['En classe','In class'],hash:'#teacher'},
 {id:'detente',label:['Détente','Relax'],hash:'#relax'},
];
export const MODE_IDS = MODES.map(m => m.id);
const OWN = {teacher:'classe',prepare:'preparer',sheets:'preparer',pack:'preparer',sources:'preparer'};
for (const p of ['relax','biographies','stories','history','gallery','olympiad','challenges','topics','lab']) OWN[p] = 'detente';
// Mode a page belongs to. Every other page keeps the remembered mode, so a tool opened from a mode stays under it.
export function modeOfRoute(page, remembered = '') {
 if (Object.hasOwn(OWN, page)) return OWN[page];
 return MODE_IDS.includes(remembered) ? remembered : '';
}
// The student experience stays untouched: the bar shows only for a device that chose the teacher entrance, or on the mode pages.
export function showModeBar({entry, page} = {}) {
 return entry === 'teacher' || ['teacher', 'prepare', 'relax'].includes(page);
}
