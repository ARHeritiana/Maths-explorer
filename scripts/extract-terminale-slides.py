"""One-off helper: French slide drafts for Terminale from the supplied LaTeX notes.

Usage: python3 scripts/extract-terminale-slides.py path/to/terminale.tex
Writes content/slides/draft/terminale-NN.fr.json (French only, teacher-only boxes excluded). The
English versions are authored from these drafts into content/slides/terminale-NN.json.
"""
import importlib.util, json, re, sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location('bs', ROOT / 'scripts/build-slides.py'); bs = importlib.util.module_from_spec(spec); spec.loader.exec_module(bs)

src = bs.strip_comments(Path(sys.argv[1]).read_text(encoding='utf8'))
parts = list(re.finditer(r'\\chapter\{([^}]*)\}', src))
OUT = ROOT / 'content/slides/draft'; OUT.mkdir(parents=True, exist_ok=True)
TOK = re.compile(r'\\subsection\{([^}]*)\}|\\begin\{(retenir|methode)\}\{([^}]*)\}|\\paragraph\{([^}]*)\}')
for n, m in enumerate(parts, 1):
    end = parts[n].start() if n < len(parts) else len(src)
    ch = src[m.end():end]
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
        x['b'] = bs.clean_residue(x['b']); x['t'] = x['t'] or 'Notes de cours'
    slides = [x for x in slides if x['k'] == 'title' or x['b'].strip()]
    (OUT / f'terminale-{n:02d}.fr.json').write_text(json.dumps({'id': f'terminale-{n:02d}', 'slides': slides}, ensure_ascii=False, indent=0))
    print(n, bs.clean_title(m.group(1)), len(slides))
