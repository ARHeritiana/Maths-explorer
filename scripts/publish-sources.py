"""Publish the LaTeX sources with the site and refuse anything that identifies the owner.

Copies content/tex/courses/** (TeX, class, style and bibliography files, figures) to
dist/sources/ and writes dist/sources/manifest.json, which the "Sources" page
reads. The scan fails on personal-storage URLs, e-mail addresses and the names
that earlier builds printed in running footers. Run it after editing sources.
"""
import json, re, shutil, sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / 'content/tex/courses'
OUT = ROOT / 'dist/sources'
KEEP = {'.tex', '.sty', '.cls', '.bib', '.bst', '.png', '.jpg', '.jpeg', '.pdf', '.svg'}
sys.path.insert(0, str(ROOT / 'tests'))
import banned   # hashed owner/school/place names, personal-space links, e-mail addresses
sys.path.insert(0, str(ROOT / 'build'))
from mxbuild import books   # mains of migrated courses are generated from the manifest
CORE = ROOT / 'content/tex/core'
# Held back from the public download: textbook extracts (rights to be confirmed) and exercise drafts not yet verified.
SKIP = re.compile(r"(?!)")   # nothing withheld any more (Calao extracts removed, exercises verified)
COURSES = {
    'premiere': (['Première spécialité', 'Première · mathematics specialty'],
                 {'eleve.tex': ('fr', 'student'), 'professeur.tex': ('fr', 'teacher'),
                  'eleve-en.tex': ('en', 'student'), 'professeur-en.tex': ('en', 'teacher'),
                  }),
    'seconde': (['Seconde', 'Seconde'],
                {'eleve.tex': ('fr', 'student'), 'professeur.tex': ('fr', 'teacher'),
                 'eleve-en.tex': ('en', 'student'), 'professeur-en.tex': ('en', 'teacher'),
                 }),
    'terminale': (['Terminale spécialité', 'Terminale · mathematics specialty'],
                  {'eleve.tex': ('fr', 'student'), 'professeur.tex': ('fr', 'teacher'),
                   'eleve-en.tex': ('en', 'student'), 'professeur-en.tex': ('en', 'teacher')}),
    'stmg': (['Terminale STMG', 'Terminale STMG'],
             {'livret-eleve.tex': ('fr', 'student'), 'livret-prof.tex': ('fr', 'teacher'),
              'livret-eleve-en.tex': ('en', 'student'), 'livret-prof-en.tex': ('en', 'teacher')}),
    'automatismes': (['Automatismes de seconde', 'Seconde fluency sheets'],
                     {'eleve.tex': ('fr', 'student'), 'professeur.tex': ('fr', 'teacher'),
                      'eleve-en.tex': ('en', 'student'), 'professeur-en.tex': ('en', 'teacher')}),
    'enrichment': (['Ateliers d’enrichissement', 'Enrichment workshops'], {}),
}


# Reuse canonical course titles; entry names remain format-specific build adapters.
_names={c['id']:c['title'] for c in books.catalog.load()['catalog']['courses']}
for _id,(_title,_entries) in list(COURSES.items()):
    COURSES[_id]=(_names.get({'enrichment':'explorations'}.get(_id,_id),_title),_entries)

def main():
    problems = []
    if OUT.exists():
        shutil.rmtree(OUT)
    courses = []
    migrated = set(books.catalog.load().get('books', {}))
    for course, (title, entries) in COURSES.items():
        base = SRC / course
        if not base.is_dir():
            continue
        if course in migrated:   # entry files are generated; the core is published once, beside the courses
            books.write_mains(course, OUT / course, '../core')
        files = []
        for name in (sorted(books.ENTRIES.values()) if course in migrated else []):
            p = OUT / course / (name + '.tex'); entry = entries.get(name + '.tex')
            files.append({'path': f'{course}/{name}.tex', 'bytes': p.stat().st_size, 'kind': 'tex', 'lang': 'en' if name.endswith('-en') else 'fr',
                          **({'entry': {'lang': entry[0], 'edition': entry[1]}} if entry else {})})
        for p in sorted(base.rglob('*')):
            if not p.is_file() or p.suffix.lower() not in KEEP or p.name.startswith('_fig'):
                continue
            rel = p.relative_to(SRC)
            if SKIP.search(rel.as_posix()): continue
            if p.suffix.lower() in {'.tex', '.sty', '.cls', '.bib', '.bst', '.svg'}:
                found = banned.findings(p.read_text(encoding='utf8', errors='replace'))
                if found:
                    problems.append(f'{rel}: {", ".join(found)}')
            target = OUT / rel
            target.parent.mkdir(parents=True, exist_ok=True)
            shutil.copy2(p, target)
            name = p.relative_to(base).as_posix()
            kind = 'figure' if p.suffix.lower() in {'.png', '.jpg', '.jpeg', '.pdf', '.svg'} else \
                   'style' if p.suffix.lower() in {'.sty', '.cls', '.bst'} else 'tex'
            lang = 'en' if re.search(r'(-en|\.en)\.(tex|sty)$', name) else 'fr'
            entry = entries.get(name)
            files.append({'path': rel.as_posix(), 'bytes': p.stat().st_size, 'kind': kind, 'lang': lang,
                          **({'entry': {'lang': entry[0], 'edition': entry[1]}} if entry else {})})
        courses.append({'id': course, 'title': title, 'files': files})
    # Shared class and packages: published once in core/ and listed in every migrated course, so a course archive
    # (site "Sources" page) unpacks as course/ + core/ and compiles as is.
    core_files = []
    for p in sorted(CORE.glob('*')):
        if p.suffix not in {'.cls', '.sty', '.tex'}: continue
        if banned.findings(p.read_text(encoding='utf8')): problems.append(f'core/{p.name}: banned content')
        (OUT / 'core').mkdir(parents=True, exist_ok=True); shutil.copy2(p, OUT / 'core' / p.name)
        core_files.append({'path': f'core/{p.name}', 'bytes': p.stat().st_size, 'kind': 'style' if p.suffix != '.tex' else 'tex',
                           'lang': 'en' if '.en.' in p.name else 'fr'})
    for c in courses:
        if c['id'] in migrated: c['files'] += core_files
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
        'Courses already moved to the shared system (`core/` folder: class `mxbook` and packages) hold one file per unit,\n'
        '`<unit>.fr.tex` and `<unit>.en.tex` (the English unit is generated from the French one), and the same entry files\n'
        '(`eleve.tex`, `professeur.tex`, `eleve-en.tex`, `professeur-en.tex`); keep `core/` next to the course folder.\n\n'
        '# Sources LaTeX\n\n'
        'Chaque dossier contient les sources complètes d’un livret : chapitres, corrigés, évaluations, figures et\n'
        'fichiers de style. Les versions anglaises portent le suffixe `-en` (prose traduite, mathématiques identiques).\n'
        'Les cours déjà passés au système commun (dossier `core/`) ont un fichier par unité, `<unité>.fr.tex` et\n'
        '`<unité>.en.tex` (généré à partir du français) ; garder `core/` à côté du dossier du cours.\n',
        encoding='utf8')
    (OUT / 'manifest.json').write_text(json.dumps({'courses': courses}, ensure_ascii=False, indent=1) + '\n', encoding='utf8')
    print(f"Published {sum(len(c['files']) for c in courses)} source files in {len(courses)} courses to dist/sources/")


main()
