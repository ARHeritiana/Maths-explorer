"""Course mains generated from the manifest (content/data/manifest.json, key "books").

A book is {"layout": ..., "front": [...], "units": [...], "appendix": [...], "teacherUnits": [...]}: unit stems in the
course folder (<stem>.fr.tex, <stem>.en.tex). Booklets put "front" in \\frontmatter, "units" in \\mainmatter and
"appendix" after \\appendix; teacher units are appended in the teacher edition only. Mains keep the historical
entry names (eleve.tex, professeur.tex, eleve-en.tex, professeur-en.tex) so builders and the Sources page are unchanged.
The core is found through \\input@path, so the same main compiles in the repository and in the published sources.
"""
from . import catalog

ENTRIES = {('fr', 'student'): 'eleve', ('fr', 'teacher'): 'professeur', ('en', 'student'): 'eleve-en', ('en', 'teacher'): 'professeur-en'}


def spec(course):
    return catalog.load()['books'][course]


def main_text(course, lang, edition, core_path):
    b = spec(course)
    lines = ['% GENERATED from content/data/manifest.json (books) by mxbuild.books; do not edit.',
             r'\makeatletter\def\input@path{{%s/}}\makeatother' % core_path.rstrip('/'),
             r'\documentclass[course=%s,lang=%s,edition=%s,layout=%s]{mxbook}' % (course, lang, edition, b['layout']),
             r'\begin{document}']
    if b.get('front'): lines += [r'\frontmatter'] + [r'\mxinclude{%s}' % u for u in b['front']] + [r'\mainmatter']
    lines += [r'\mxinclude{%s}' % u for u in b['units']]
    if b.get('appendix'): lines += [r'\appendix'] + [r'\mxinclude{%s}' % u for u in b['appendix']]
    if edition != 'student':
        lines += [r'\clearpage\mxinclude{%s}' % u for u in b.get('teacherUnits', [])]
    lines.append(r'\end{document}')
    return '\n'.join(lines) + '\n'


def write_mains(course, outdir, core_path):
    """Write the four entry files into outdir; returns {entry name: path}."""
    outdir.mkdir(parents=True, exist_ok=True); out = {}
    for (lang, edition), name in ENTRIES.items():
        p = outdir / (name + '.tex'); p.write_text(main_text(course, lang, edition, core_path)); out[name] = p
    return out
