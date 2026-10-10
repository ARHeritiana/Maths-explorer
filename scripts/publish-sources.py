"""Publish the LaTeX sources with the site and refuse anything that identifies the owner.

Copies content/latex/** (TeX, class, style and bibliography files, figures) to
dist/sources/ and writes dist/sources/manifest.json, which the "Sources" page
reads. The scan fails on personal-storage URLs, e-mail addresses and the names
that earlier builds printed in running footers. Run it after editing sources.
"""
import json, re, shutil, sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / 'content/latex'
OUT = ROOT / 'dist/sources'
KEEP = {'.tex', '.sty', '.cls', '.bib', '.bst', '.png', '.jpg', '.jpeg', '.pdf', '.svg'}
BANNED = re.compile(r'(drive|docs)\.google\.com|dropbox\.com|onedrive|sharepoint|[\w.+-]+@[\w-]+\.[\w.]+|'
                    r'ANONYME|coll[eè]ges? de france|\bCDFM\b|ANONYME|ANONYME', re.I)
COURSES = {
    'premiere': (['Première spécialité', 'Première · mathematics specialty'],
                 {'eleve.tex': ('fr', 'student'), 'professeur.tex': ('fr', 'teacher'),
                  'eleve-en.tex': ('en', 'student'), 'professeur-en.tex': ('en', 'teacher'),
                  'pilot-05-en.tex': ('en', 'student + teacher (chapter 5 only)')}),
    'seconde': (['Seconde', 'Seconde'], {}),
    'terminale': (['Terminale spécialité', 'Terminale · mathematics specialty'], {}),
    'stmg': (['Terminale STMG', 'Terminale STMG'], {}),
    'automatismes': (['Automatismes de seconde', 'Seconde fluency sheets'], {}),
    'enrichment': (['Ateliers d’enrichissement', 'Enrichment workshops'], {}),
}


def main():
    problems = []
    if OUT.exists():
        shutil.rmtree(OUT)
    courses = []
    for course, (title, entries) in COURSES.items():
        base = SRC / course
        if not base.is_dir():
            continue
        files = []
        for p in sorted(base.rglob('*')):
            if not p.is_file() or p.suffix.lower() not in KEEP:
                continue
            rel = p.relative_to(SRC)
            if p.suffix.lower() in {'.tex', '.sty', '.cls', '.bib', '.bst', '.svg'}:
                for n, line in enumerate(p.read_text(encoding='utf8', errors='replace').splitlines(), 1):
                    m = BANNED.search(line)
                    if m:
                        problems.append(f'{rel}:{n}: {m.group(0)}')
            target = OUT / rel
            target.parent.mkdir(parents=True, exist_ok=True)
            shutil.copy2(p, target)
            name = p.relative_to(base).as_posix()
            kind = 'figure' if p.suffix.lower() in {'.png', '.jpg', '.jpeg', '.pdf', '.svg'} else \
                   'style' if p.suffix.lower() in {'.sty', '.cls', '.bst'} else 'tex'
            lang = 'en' if re.search(r'-en\.(tex|sty)$', name) else 'fr'
            entry = entries.get(name)
            files.append({'path': rel.as_posix(), 'bytes': p.stat().st_size, 'kind': kind, 'lang': lang,
                          **({'entry': {'lang': entry[0], 'edition': entry[1]}} if entry else {})})
        courses.append({'id': course, 'title': title, 'files': files})
    if problems:
        sys.exit('Personal or identifying text found in sources:\n' + '\n'.join(problems[:40]))
    (OUT / 'README.md').write_text(
        '# LaTeX sources\n\n'
        'Each course folder holds the complete sources of its booklets: chapters, corrections, assessments,\n'
        'figures and style files. English twins carry the suffix `-en` (translated prose, identical mathematics).\n\n'
        '```sh\n'
        'cd premiere\n'
        'pdflatex -no-shell-escape eleve.tex && pdflatex -no-shell-escape eleve.tex            # French, student\n'
        'pdflatex -no-shell-escape professeur.tex && pdflatex -no-shell-escape professeur.tex  # French, teacher\n'
        '```\n\n'
        'Engine and preamble are those of each source (pdfLaTeX unless stated; enrichment workshops use XeLaTeX).\n'
        'Shell escape is never needed.\n\n'
        '# Sources LaTeX\n\n'
        'Chaque dossier contient les sources complètes d’un livret : chapitres, corrigés, évaluations, figures et\n'
        'fichiers de style. Les versions anglaises portent le suffixe `-en` (prose traduite, mathématiques identiques).\n',
        encoding='utf8')
    (OUT / 'manifest.json').write_text(json.dumps({'courses': courses}, ensure_ascii=False, indent=1) + '\n', encoding='utf8')
    print(f"Published {sum(len(c['files']) for c in courses)} source files in {len(courses)} courses to dist/sources/")


main()
