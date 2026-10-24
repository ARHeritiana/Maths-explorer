// Explicit file editions shared by browsing, chapter downloads and packs.
export const editionFor = (record, language) => record?.editions?.[language] || null;
export const editionLanguages = record => Object.keys(record?.editions || {});
export const editionLabel = record => editionLanguages(record).map(lang => lang.toUpperCase()).join(' / ');
// A pack is complete only when every requested item has the chosen edition.
export function packEditions(items, language) {
  const available = [], unavailable = [];
  for (const item of items) {
    const edition = editionFor(item, language);
    if (edition) available.push({item, edition}); else unavailable.push(item);
  }
  return {available, unavailable, pages: available.reduce((n, x) => n + (x.edition.pages || 0), 0),
    bytes: available.reduce((n, x) => n + x.edition.bytes, 0)};
}
