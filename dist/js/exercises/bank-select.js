// Which worked exercises the online bank (js/bank-page.js) shows under a chapter, and the one canonical address of each.
// Pure data, no DOM: the bank page and the resource index both import it, so the two can never disagree.
import { AUTHORED } from './bank.js';
import { MADA } from './bank-mada.js';

export const LEVEL = { 1: ['Routine', 'Routine'], 2: ['Standard', 'Standard'], 3: ['Exigeant', 'Demanding'] };
// A seeded problem that repeats a fixed exercise of the same title (its random-values twin) replaces it: one card each.
export const exercisesOf = (chapter) => {
  const all = [...AUTHORED, ...MADA].filter((e) => e.chapters.includes(chapter));
  return all.filter((e) => e.make || !all.some((x) => x.make && x.title === e.title)).sort((a, b) => a.level - b.level);
};
export const findExercise = (id) => [...AUTHORED, ...MADA].find((e) => e.id === id);
// Address of one exercise: its chapter page of the bank, then the exercise id.
export const exerciseHref = (course, chapter, id) => `#bank/${course}/${chapter}/${id}`;
// Exercises shown by at least one of the given chapters: [{exercise, chapters:[ids where it is shown, in its own chapter order]}].
export function shownExercises(chapterIds) {
  const live = new Set(chapterIds), seen = new Map();
  for (const id of live) for (const e of exercisesOf(id)) {
    if (!seen.has(e.id)) seen.set(e.id, { exercise: e, chapters: [] });
    seen.get(e.id).chapters.push(id);
  }
  return [...seen.values()].map((s) => ({ exercise: s.exercise, chapters: s.exercise.chapters.filter((c) => s.chapters.includes(c)) }));
}
