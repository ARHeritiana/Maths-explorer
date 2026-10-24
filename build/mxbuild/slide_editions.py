"""Explicit slide editions, retaining independent sequences and legacy paired text fields."""
import copy

LANGUAGES = ('fr', 'en')


def languages(deck):
    editions = deck.get('editions')
    if not isinstance(editions, dict) or not editions or any(k not in LANGUAGES for k in editions):
        raise ValueError('A deck needs explicit French and/or English edition records')
    return [lang for lang in LANGUAGES if lang in editions]


def localise_slides(slides, lang):
    """A per-edition sequence may use plain strings; player fields remain [French, English]."""
    index = LANGUAGES.index(lang)
    result = copy.deepcopy(slides)
    for slide in result:
        for key in ('t', 'b', 'a', 'h'):
            if key not in slide:
                continue
            if isinstance(slide[key], str):
                value = slide[key]; slide[key] = ['', '']; slide[key][index] = value
            if not isinstance(slide[key], list) or len(slide[key]) != 2 or not isinstance(slide[key][index], str):
                raise ValueError(f'{lang} slide has invalid {key} text')
        if 'f' in slide:
            slide['f'] = [([p, None] if index == 0 else [None, p]) if isinstance(p, int) else p for p in slide['f']]
            if any(not isinstance(p, list) or len(p) != 2 or not isinstance(p[index], int) for p in slide['f']):
                raise ValueError(f'{lang} slide has invalid figure references')
    return result


def normalise_deck(deck):
    deck = copy.deepcopy(deck)
    available = languages(deck)
    for lang in available:
        edition = deck['editions'][lang]
        if not isinstance(edition, dict):
            raise ValueError('Slide edition record must be an object')
        if 'slides' in edition:
            edition['slides'] = localise_slides(edition['slides'], lang)
    if 'slides' not in deck:
        deck['slides'] = copy.deepcopy(deck['editions'][available[0]]['slides'])
    for lang in available:
        # Shared sequences retain paired prose; validate only declared editions.
        localise_slides(deck['editions'][lang].get('slides', deck['slides']), lang)
    deck['languages'] = available
    return deck


def for_language(deck, lang):
    if lang not in languages(deck):
        raise ValueError(f'Unavailable slide edition: {lang}')
    result = copy.deepcopy(deck)
    edition = result['editions'][lang]
    result['slides'] = localise_slides(edition.get('slides', result['slides']), lang)
    if 'title' in edition:
        title = edition['title']
        if isinstance(title, str):
            result['title'] = list(result.get('title') or ['', '']); result['title'][LANGUAGES.index(lang)] = title
        else:
            result['title'] = title
    if not result.get('title') or not result['title'][LANGUAGES.index(lang)]:
        raise ValueError(f'Missing {lang} deck title')
    return result


def combine_sequences(sequences):
    """Share aligned sequences when possible; differing editions keep independent slides."""
    available = [lang for lang in LANGUAGES if lang in sequences]
    if not available:
        raise ValueError('No slide source edition exists')
    localised = {lang: localise_slides(slides, lang) for lang, slides in sequences.items()}
    first = available[0]
    aligned = len(available) == 2 and len(sequences['fr']) == len(sequences['en'])
    if aligned:
        aligned = all(a['k'] == b['k'] and len(a.get('f', [])) == len(b.get('f', []))
                      for a, b in zip(sequences['fr'], sequences['en']))
    if not aligned:
        return {'slides': localised[first], 'editions': {lang: {'slides': slides} for lang, slides in localised.items()}}
    merged = []
    for a, b in zip(localised['fr'], localised['en']):
        slide = {'k': a['k']}
        for key in ('t', 'b', 'a', 'h'):
            if key in a or key in b:
                slide[key] = [a.get(key, ['', ''])[0], b.get(key, ['', ''])[1]]
        if a.get('f'):
            slide['f'] = [[x[0], y[1]] for x, y in zip(a['f'], b['f'])]
        merged.append(slide)
    return {'slides': merged, 'editions': {lang: {} for lang in available}}
