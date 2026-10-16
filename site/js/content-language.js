import {courses,university} from './catalogue-data.js';
export function preferredLanguage(saved, languages=globalThis.navigator?.languages || ['fr']) {
  if(saved==='fr'||saved==='en')return saved;
  return languages.find(l=>/^(fr|en)(-|$)/i.test(l))?.slice(0,2).toLowerCase() || 'fr';
}
export function courseLanguage(id, preferred='fr') {
  return courses.find(c=>c.id===id)?.contentLanguage || preferred;
}
export function routeLanguage(route, chapters, preferred) {
  if(['chapter','library'].includes(route.page)&&route.id)return courseLanguage(chapters.find(c=>c.id===route.id)?.course,preferred);
  if(route.page==='workshop'&&route.id==='quadratic')return courseLanguage('premiere',preferred);
  if(route.page==='university')return university.sections.find(s=>s.sequences.some(q=>q.id===route.id))?.language || preferred;
  return preferred;
}
