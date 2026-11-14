// Publication scope: the French lycée curriculum, its shared resources and the general collections (laboratory, gallery,
// foundations, challenges, history, reading, errors). Every list of courses, chapters and routes is filtered here.
import { courses, discoveryChapters } from './catalogue-data.js';

export const liveCourses = courses.filter(c => c.curriculum === 'fr');
export const isLiveCourse = id => liveCourses.some(c => c.id === id);
const chapters = discoveryChapters.filter(c => isLiveCourse(c.course));
const chapterIds = new Set(chapters.map(c => c.id));
// Course of a live chapter id, '' when the id is unknown or not published.
export const liveChapterCourse = id => chapters.find(c => c.id === id)?.course || '';
export const liveLibraryCourses = courses.filter(c => c.curriculum === 'fr' || c.curriculum === 'shared');
const isLiveLibraryCourse = id => liveLibraryCourses.some(c => c.id === id);
const libraryChapterIds = new Set(discoveryChapters.filter(c => isLiveLibraryCourse(c.course)).map(c => c.id));

export function liveCompanionCatalog(catalog) {
  return {
    ...catalog,
    chapters: catalog.chapters.filter(c => isLiveCourse(c.course)),
    supplements: catalog.supplements.filter(c => isLiveCourse(c.course)),
  };
}

// Also used for the asynchronously loaded PDF catalogue and pack downloads.
export function liveCatalog(catalog) {
  return {
    ...catalog,
    courses: catalog.courses.filter(c => isLiveLibraryCourse(c.id)),
    chapters: catalog.chapters.filter(c => isLiveLibraryCourse(c.course)),
    resources: catalog.resources.filter(r => isLiveLibraryCourse(r.course)),
  };
}

export function isLiveRoute({ page, id, tab }) {
  if (page === 'automatismes') return !id || id === 'go' || id === 'list';
  if (['home', 'teacher', 'prepare', 'relax', 'review', 'sources', 'sheets'].includes(page)) return !id;
  if (page === 'search') return true;
  if (page === 'resources' || page === 'slides') return !id || isLiveCourse(id);
  if (page === 'chapter') return chapterIds.has(id);
  if (page === 'library') return !id || libraryChapterIds.has(id) || id.startsWith('@');
  if (page === 'pack') return !id || isLiveLibraryCourse(id) || libraryChapterIds.has(id);
  if (page === 'bank' && id === 'annales') return true;
  if (page === 'bank') return (!id || isLiveCourse(id)) && (!tab || chapters.some(c => c.id === tab && c.course === id));
  if (['lab', 'gallery', 'topics', 'basics', 'history', 'biographies', 'stories', 'challenges'].includes(page)) return true;
  if (page === 'workshop') return id === 'quadratic';
  if (page === 'errors') return true;
  return false;
}

export function isLiveHash(hash) {
  const [page, id, tab] = hash.replace(/^#/, '').split('/');
  return isLiveRoute({ page, id, tab });
}

export function liveDiscovery(index) {
  const visible = index.filter(item => isLiveHash(item.route));
  const routes = new Set(visible.map(item => item.route));
  return visible.map(item => ({ ...item, related: item.related.filter(route => routes.has(route)) }));
}
