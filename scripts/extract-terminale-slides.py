"""One-off helper: French slide drafts for Terminale from the supplied LaTeX notes.

Usage: python3 scripts/extract-terminale-slides.py [outdir]
Reads content/tex/courses/terminale/chapitres/C01..C14.tex (French) and the -en twins (figure code only) and writes
<outdir>/terminale-NN.fr.json (default content/slides/draft; French only, teacher-only boxes excluded). Each slide may carry
"f": [[n, n]] (figure numbers in the French and English chapter sources) and the draft holds "figs" / "figs_en" (the figure
code). The English decks content/slides/terminale-NN.json are authored from these drafts; build-slides.py renders the figures.
"""
import importlib.util, json, re, sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location('bs', ROOT / 'scripts/build-slides.py'); bs = importlib.util.module_from_spec(spec); spec.loader.exec_module(bs)

OUT = Path(sys.argv[1]).resolve() if len(sys.argv) > 1 else ROOT / 'content/slides/draft'; OUT.mkdir(parents=True, exist_ok=True)
CH = ROOT / 'content/tex/courses/terminale/chapitres'
TOK = re.compile(r'\\subsection\{([^}]*)\}|\\begin\{(retenir|methode)\}\{([^}]*)\}|\\paragraph\{([^}]*)\}')
for n in range(1, 15):
    src, figs = bs.extract_figs((CH / f'C{n:02d}.tex').read_text(encoding='utf8'))
    _, figs_en = bs.extract_figs((CH / f'C{n:02d}-en.tex').read_text(encoding='utf8'))
    assert len(figs) == len(figs_en), f'C{n:02d}: figure count differs between editions'
    m = re.search(r'\\chapter\{([^}]*)\}', src); ch = src[m.end():]
    nm = re.search(r'\\section\{Notes de cours\}', ch)
    nx = re.search(r'\\section\{', ch[nm.end():]) if nm else None
    notes = ch[nm.end(): nm.end() + nx.start()] if nm and nx else ''
    act = re.search(r'\\section\{Activité de recherche\}(.*?)(?=\\section\{)', ch, re.S)
    slides = [bs.slide('title', bs.clean_title(m.group(1)), '')]
    obj = re.search(r'\\begin\{retenir\}\{Objectifs\}(.*?)\\end\{retenir\}', ch, re.S)
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
            slides.append(bs.slide('concept' if mm.group(2) == 'retenir' else 'method', unit, bs.text2html(notes[k:e0]), None, bs.clean_title(mm.group(3)))); i = e1
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
