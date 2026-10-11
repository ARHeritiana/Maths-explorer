"""One-off helper: French slide drafts for Terminale from the supplied LaTeX notes.

Usage: python3 scripts/extract-terminale-slides.py [outdir] [--figures-only]
Reads content/tex/courses/terminale/chapitres/C01..C14.fr.tex (French) and the generated .en.tex (figure code only) and writes
<outdir>/terminale-NN.fr.json (default content/slides/draft; French only, teacher-only boxes excluded). Each slide may carry
"f": [[n, n]] (figure numbers in the French and English chapter sources) and the draft holds "figs" / "figs_en" (the figure
code). The English decks content/slides/terminale-NN.json are authored from these drafts; build-slides.py renders the figures.
--figures-only refreshes "figs"/"figs_en" in the existing drafts and keeps their slides (the English decks are aligned to them).
"""
import importlib.util, json, re, sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location('bs', ROOT / 'scripts/build-slides.py'); bs = importlib.util.module_from_spec(spec); spec.loader.exec_module(bs)

FIGS_ONLY = '--figures-only' in sys.argv
args = [a for a in sys.argv[1:] if not a.startswith('--')]
OUT = Path(args[0]).resolve() if args else ROOT / 'content/slides/draft'; OUT.mkdir(parents=True, exist_ok=True)
CH = ROOT / 'content/tex/courses/terminale/chapitres'
TOK = re.compile(r'\\subsection\{([^}]*)\}|\\begin\{(keypoint|method)\}\[([^\]]*)\]|\\paragraph\{([^}]*)\}')
for n in range(1, 15):
    src, figs = bs.extract_figs((CH / f'C{n:02d}.fr.tex').read_text(encoding='utf8'))
    _, figs_en = bs.extract_figs((CH / f'C{n:02d}.en.tex').read_text(encoding='utf8'))
    assert len(figs) == len(figs_en), f'C{n:02d}: figure count differs between editions'
    if FIGS_ONLY:
        draft = OUT / f'terminale-{n:02d}.fr.json'; d = json.loads(draft.read_text(encoding='utf8'))
        assert len(d['figs']) == len(figs), f'C{n:02d}: figure count changed ({len(d["figs"])} -> {len(figs)})'
        d['figs'], d['figs_en'] = figs, figs_en
        draft.write_text(json.dumps(d, ensure_ascii=False, indent=0)); print(n, 'figures refreshed:', len(figs)); continue
    m = re.search(r'\\(?:chapter|mxunit\{[^}]*\})\{([^}]*)\}', src); ch = src[m.end():]
    nm = re.search(r'\\section\{Notes de cours\}', ch)
    nx = re.search(r'\\section\{', ch[nm.end():]) if nm else None
    notes = ch[nm.end(): nm.end() + nx.start()] if nm and nx else ''
    act = re.search(r'\\section\{Activité de recherche\}(.*?)(?=\\section\{)', ch, re.S)
    slides = [bs.slide('title', bs.clean_title(m.group(1)), '')]
    obj = re.search(r'\\begin\{keypoint\}\[Objectifs\](.*?)\\end\{keypoint\}', ch, re.S)
    if obj: slides.append(bs.slide('goals', 'Objectifs', bs.text2html(obj.group(1))))
    unit = ''; i = 0; pending_text = ''
    def flush(kind='concept', title=None):
        global pending_text
        t = pending_text.strip(); pending_text = ''
        if len(re.sub(r'\s', '', t)) > 20: slides.append(bs.slide(kind, unit, bs.text2html(t), None, title))
    while i < len(notes):
        mm = TOK.search(notes, i)
        chunk = notes[i: mm.start() if mm else len(notes)]
        pending_text += chunk
        if not mm: break
        if mm.group(1) is not None: flush(); unit = bs.clean_title(mm.group(1)); i = mm.end()
        elif mm.group(2):
            flush(); k = mm.end(); e0, e1 = bs.env_end(notes, k, mm.group(2))
            slides.append(bs.slide('concept' if mm.group(2) == 'keypoint' else 'method', unit, bs.text2html(notes[k:e0]), None, bs.clean_title(mm.group(3)))); i = e1
        else:
            flush(); title = bs.clean_title(mm.group(4)); k = mm.end()
            nxt = TOK.search(notes, k); body = notes[k: nxt.start() if nxt else len(notes)]
            kind = 'error' if title.startswith('Piège') else 'proof' if title.startswith('Démonstration') else 'example' if title.startswith('Exemple') else 'concept'
            slides.append(bs.slide(kind, unit, bs.text2html(body), None, title if kind == 'concept' else None)); i = nxt.start() if nxt else len(notes)
    flush()
    if act: slides.append(bs.slide('activity', 'Activité de recherche', bs.text2html(act.group(1))))
    for x in slides:
        x['b'], nums = bs.fig_tokens(x['b'])
        if nums: x['f'] = [[k, k] for k in nums]
        x['b'] = bs.clean_residue(x['b']); x['t'] = x['t'] or 'Notes de cours'
    slides = [x for x in slides if x['k'] == 'title' or x['b'].strip()]
    (OUT / f'terminale-{n:02d}.fr.json').write_text(json.dumps({'id': f'terminale-{n:02d}', 'slides': slides, 'figs': figs, 'figs_en': figs_en}, ensure_ascii=False, indent=0))
    print(n, bs.clean_title(m.group(1)), len(slides))
