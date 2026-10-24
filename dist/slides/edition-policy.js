// An explicit request never opens another language; curriculum language remains the default.
export function deckLanguages(deck) {
  const editions = deck?.editions;
  if (!editions || typeof editions !== 'object' || !Object.keys(editions).length) throw new Error('Missing slide editions');
  const available = ['fr', 'en'].filter(lang => Object.hasOwn(editions, lang));
  if (available.length !== Object.keys(editions).length) throw new Error('Unknown slide language');
  return available;
}
export function selectDeckEdition(deck, requested, preferred = 'fr') {
  const available = deckLanguages(deck);
  if (requested && !available.includes(requested)) return null;
  const language = requested || (available.includes(deck.language) ? deck.language : available.includes(preferred) ? preferred : available[0]);
  const edition = deck.editions[language], index = language === 'en' ? 1 : 0;
  const title = [...deck.title];
  if (edition.title) title[index] = Array.isArray(edition.title) ? edition.title[index] : edition.title;
  return {...deck, title, slides: edition.slides || deck.slides, selectedLanguage: language};
}
