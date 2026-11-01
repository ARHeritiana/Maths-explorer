#!/usr/bin/env python3
"""Malagasy curriculum books (T10, T11 S): chapter and supplement PDFs cut from the owner's compiled books, and their manifest records.

The books are written in a separate repository (Mada-Boky, LaTeX). This script reads its four compiled PDFs, cuts them by their
tables of contents (bookmarks), clears the PDF metadata, writes dist/resources/<chapter>/{chapter,teacher}.pdf and the
course-wide supplements, then writes the courses, chapters, resources, companion records and sources into
content/data/manifest.json (labs and topics are authored in the tables below). Run `make site` afterwards.

  python3 scripts/build-mada.py --books <Mada-Boky>/Livres            # use the PDFs already compiled there
  python3 scripts/build-mada.py --books <Mada-Boky>/Livres --compile  # compile both editions of both books first

Compiling on a TeX installation without the Palatino fonts of mathpazo: put a stand-in mathpazo.sty that loads newpx first on
TEXINPUTS (see the T10 note in docs/CURRICULUM.md). Only chapter pages are published: the front pages of the books (preface,
working notes) are never cut into a resource.
"""
import argparse, datetime, hashlib, json, os, subprocess, sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / 'build'))
from mxbuild import catalog  # noqa: E402

DIST = ROOT / 'dist'

# T10: the nine chapters of the book, in order; topic = a study-guide topic; labs = laboratory references.
T10 = [
    ('Logique', ['Logique', 'Logic'], 'logic', []),
    ('Algorithmique', ['Algorithmique', 'Algorithms'], 'logic', []),
    ('Calcul dans R', ['Calcul dans ℝ', 'Calculation with real numbers'], 'reals', []),
    ('Équations et Inéquations', ['Équations et inéquations', 'Equations and inequalities'], 'quadratic', ['quadratic/roots']),
    ('Vecteurs du plan', ['Vecteurs du plan', 'Vectors in the plane'], 'vectors', ['vectors/collinear']),
    ('Droites et Cercles', ['Droites et cercles', 'Lines and circles'], 'lines', ['line/slope']),
    ('Fonctions numériques', ['Fonctions numériques', 'Real functions'], 'functions', ['quadratic/vertex', 'line/intercept']),
    ('Trigonométrie', ['Trigonométrie', 'Trigonometry'], 'trigonometry', ['trig/quadrants']),
    ('Statistiques', ['Statistiques', 'Statistics'], 'statistics', ['statistics/box']),
]
# T11 S: the twenty chapters (book titles, cut to their start), then the four parts' assessments.
T11S = [
    ('Généralités sur les fonctions', ['Généralités sur les fonctions numériques', 'Real functions: general properties'], 'functions', []),
    ('Limites et continuité', ['Limites et continuité', 'Limits and continuity'], 'function-limits', []),
    ('Branches infinies', ['Branches infinies et asymptotes', 'Infinite branches and asymptotes'], 'function-limits', []),
    ('Dérivation et tangentes', ['Dérivation et tangentes', 'Differentiation and tangents'], 'derivative', ['derivative/approach']),
    ('Étude complète', ['Étude complète et représentation graphique', 'Full study and graph of a function'], 'derivative', ['derivative/where']),
    ('Logique et raisonnement', ['Logique et raisonnement', 'Logic and reasoning'], 'logic', []),
    ('Boucles et organigrammes', ['Boucles et organigrammes', 'Loops and flowcharts'], 'logic', []),
    ('Équations et inéquations', ['Équations et inéquations', 'Equations and inequalities'], 'quadratic', ['quadratic/roots']),
    ('Systèmes linéaires', ['Systèmes linéaires et pivot de Gauss', 'Linear systems and Gaussian elimination'], 'algebra', ['line/direction']),
    ('Divisibilité', ['Divisibilité, nombres premiers, PGCD et PPCM', 'Divisibility, primes, GCD and LCM'], 'arithmetic', ['euler-primes/hunt']),
    ('Systèmes de numération', ['Systèmes de numération', 'Number bases'], 'arithmetic', []),
    ('Suites numériques', ['Suites numériques', 'Sequences'], 'sequences', ['sequences/versus', 'cobweb/steps']),
    ('Calcul vectoriel', ['Calcul vectoriel et produit scalaire', 'Vectors and the dot product'], 'scalar', ['vectors/area']),
    ('Barycentres', ['Barycentres et lignes de niveau', 'Barycentres and level lines'], 'vectors', []),
    ('Transformations', ['Transformations et similitudes directes', 'Transformations and direct similarities'], 'geometry', ['complex/scale']),
    ('Trigonométrie', ['Trigonométrie', 'Trigonometry'], 'trigonometry', ['trig/exact']),
    ('Géométrie dans l', ['Géométrie dans l’espace', 'Solid geometry'], 'space', ['space-lines/param']),
    ('Organisation des données', ['Organisation des données et statistique', 'Organising data and statistics'], 'statistics', ['statistics/mean']),
    ('Ensembles, applications', ['Ensembles, applications et dénombrement', 'Sets, maps and counting'], 'counting', []),
    ('Probabilités', ['Probabilités sur un univers fini', 'Probability on a finite sample space'], 'random', ['probability/run']),
]
# the companion lessons of chapter pages name some topics differently from the study guides (same pairs as the French courses)
COMPANION_TOPIC = {'logic': 'reasoning', 'reals': 'intervals', 'function-limits': 'limitsfunction', 'scalar': 'vectors', 'geometry': 'lines',
                   'counting': 'combinatorics', 'random': 'randomvariables'}
COURSES = [
    {'id': 't10', 'title': ['T10', 'T10 · Malagasy curriculum'], 'curriculum': 'mg', 'contentLanguage': 'fr'},
    {'id': 't11s', 'title': ['T11 série S', 'T11 S · Malagasy curriculum'], 'curriculum': 'mg', 'contentLanguage': 'fr'},
]
BOOKS = {   # source name -> path inside <Mada-Boky>/Livres, title shown in the provenance
    't10-eleve.pdf': ('T10/build/student/main.pdf', 'Manuel de mathématiques T10, édition élève'),
    't10-prof.pdf': ('T10/build/teacher/main-prof.pdf', 'Manuel de mathématiques T10, édition professeur'),
    't11s-eleve.pdf': ('T11-S/livre-t11s-eleve.pdf', 'Manuel de mathématiques T11 S, édition élève'),
    't11s-prof.pdf': ('T11-S/livre-t11s-prof.pdf', 'Manuel de mathématiques T11 S, édition professeur'),
}


def catalog_name(name):
    """The catalogue names a book <course>-student / -teacher, the companion <course>-eleve.pdf / -prof.pdf (as for the French courses)."""
    return name.replace('-eleve.pdf', '-student').replace('-prof.pdf', '-teacher')


def compile_books(livres):
    env = dict(os.environ)
    subprocess.run(['make', 'all'], cwd=livres / 'T10', check=True, env=env)
    subprocess.run(['bash', 'compiler.sh', 'les-deux'], cwd=livres / 'T11-S', check=True, env=env)


def entries(doc):
    """Bookmarks as (level, title, first page) with 1-based pages, in reading order."""
    return [(lv, t.strip(), p) for lv, t, p in doc.get_toc() if p > 0]


def find(toc, prefix, level=None, after=0):
    for i, (lv, t, p) in enumerate(toc):
        if i >= after and t.startswith(prefix) and (level is None or lv == level): return i
    raise SystemExit(f'build-mada: no bookmark starting with {prefix!r}')


def span(toc, i, pages):
    """Pages of bookmark i: up to the page before the next bookmark of the same or a higher level."""
    lv, _, start = toc[i]
    for lv2, _, p in toc[i + 1:]:
        if lv2 <= lv and p > start: return [start, p - 1]
    return [start, pages]


def write_pdf(src, ranges, out, title):
    import pymupdf
    out.parent.mkdir(parents=True, exist_ok=True)
    d = pymupdf.open()
    for a, b in ranges: d.insert_pdf(src, from_page=a - 1, to_page=b - 1)
    d.set_metadata({'title': title, 'author': '', 'subject': '', 'keywords': '', 'creator': '', 'producer': ''})
    d.set_toc([])
    d.save(out, garbage=4, deflate=True, no_new_id=True)
    d.close()


def main():
    import pymupdf
    ap = argparse.ArgumentParser(); ap.add_argument('--books', required=True, type=Path); ap.add_argument('--compile', action='store_true')
    a = ap.parse_args(); livres = a.books.resolve()
    if a.compile: compile_books(livres)
    docs = {name: pymupdf.open(livres / path) for name, (path, _) in BOOKS.items()}
    tocs = {name: entries(d) for name, d in docs.items()}
    m = catalog.load(); cat, comp = m['catalog'], m['companion']
    for course in COURSES:   # replace the records of these courses, keep everything else
        cat['courses'] = [c for c in cat['courses'] if c['id'] != course['id']] + [course]
    ours = lambda cid: cid.split('-')[0] in ('t10', 't11s')
    cat['chapters'] = [c for c in cat['chapters'] if not ours(c['id'])]
    cat['resources'] = [r for r in cat['resources'] if not ours(r['chapter'])]
    comp['chapters'] = [c for c in comp['chapters'] if not ours(c['id'])]
    comp['supplements'] = [s for s in comp['supplements'] if not ours(s['id'])]
    made = []

    def chapter(course, n, title, topic, labs, student, teacher):
        cid = f'{course}-{n:02d}'; base = DIST / 'resources' / cid
        write_pdf(docs[student[0]], student[1], base / 'chapter.pdf', title[0])
        write_pdf(docs[teacher[0]], teacher[1], base / 'teacher.pdf', title[0] + ' (professeur)')
        cat['chapters'].append({'id': cid, 'course': course, 'number': n, 'title': title, 'topic': topic, 'labs': labs})
        for kind, rtype, aud, label, (src, ranges) in (
                ('chapter', 'booklet', 'student', ['Chapitre complet · élève', 'Complete chapter · student'], student),
                ('teacher', 'solutions', 'teacher', ['Chapitre complet · professeur (cours et corrigés)', 'Complete chapter · teacher (notes and solutions)'], teacher)):
            path = f'./resources/{cid}/{kind}.pdf'
            rec = {'id': f'{cid}-{kind}', 'chapter': cid, 'course': course, 'type': rtype, 'title': label, 'audience': aud, 'format': 'PDF',
                   'url': path, 'source': catalog_name(src), 'sourcePages': ranges[0], 'review': 'source-unverified', 'editions': {'fr': {'path': path}}}
            if len(ranges) > 1: rec['sourcePagesExtra'] = ranges[1:]
            cat['resources'].append(rec)
        comp['chapters'].append({'id': cid, 'course': course, 'number': n, 'title': title, 'topic': COMPANION_TOPIC.get(topic, topic), 'files': [
            {'kind': 'chapter', 'source': student[0], 'start': student[1][0][0], 'path': f'resources/{cid}/chapter.pdf', 'editions': {'fr': {'path': f'resources/{cid}/chapter.pdf'}}},
            {'kind': 'teacher', 'source': teacher[0], 'start': teacher[1][0][0], 'path': f'resources/{cid}/teacher.pdf', 'editions': {'fr': {'path': f'resources/{cid}/teacher.pdf'}}}]})
        made.append((cid, student[1], teacher[1]))

    def supplement(sid, course, kind, title, student, teacher):
        files = []
        for fkind, part in (('chapter', student), ('teacher', teacher)):
            if not part: continue
            src, ranges = part; path = f'resources/{sid}-{"eleve" if fkind == "chapter" else "prof"}.pdf'
            write_pdf(docs[src], ranges, DIST / path, title[0])
            files.append({'kind': fkind, 'source': src, 'start': ranges[0][0], 'path': path, 'editions': {'fr': {'path': path}}})
        comp['supplements'].append({'id': sid, 'course': course, 'kind': kind, 'title': title, 'files': files})
        made.append((sid, student[1] if student else None, teacher[1] if teacher else None))

    # ---- T10: chapters are level-2 bookmarks under the parts; the teacher's solutions are under "Corrigés", one per chapter
    ts, tp = tocs['t10-eleve.pdf'], tocs['t10-prof.pdf']; ns, np_ = len(docs['t10-eleve.pdf']), len(docs['t10-prof.pdf'])
    sol = find(tp, 'Corrigés', 2)
    for n, (prefix, title, topic, labs) in enumerate(T10, 1):
        i, j = find(ts, prefix, 2), find(tp, prefix, 2)
        k = find(tp, f'Chapitre {n} ', 3, after=sol)
        chapter('t10', n, title, topic, labs, ('t10-eleve.pdf', [span(ts, i, ns)]), ('t10-prof.pdf', [span(tp, j, np_), span(tp, k, np_)]))
    bank_sol = find(tp, 'Corrigés de la banque', 2)
    supplement('t10-fluency', 't10', 'fluency', ['Automatismes de chaque séance', 'Fluency starters for every lesson'],
               ('t10-eleve.pdf', [span(ts, find(ts, 'Automatismes de chaque', 2), ns)]), ('t10-prof.pdf', [span(tp, find(tp, 'Automatismes de chaque', 2), np_)]))
    supplement('t10-assessments', 't10', 'assessments', ['Banque d’exercices et de problèmes', 'Bank of exercises and problems'],
               ('t10-eleve.pdf', [span(ts, find(ts, 'Banque d', 2), ns)]), ('t10-prof.pdf', [span(tp, find(tp, 'Banque d', 2), np_), span(tp, bank_sol, np_)]))
    supplement('t10-guide', 't10', 'planning', ['Guide du professeur et progression', 'Teacher guide and yearly plan'], None,
               ('t10-prof.pdf', [span(tp, find(tp, 'Guide du professeur', None), np_)]))
    # ---- T11 S: chapters are level-1 bookmarks; the teacher edition interleaves notes and solutions in each chapter
    ss, sp = tocs['t11s-eleve.pdf'], tocs['t11s-prof.pdf']; ns, np_ = len(docs['t11s-eleve.pdf']), len(docs['t11s-prof.pdf'])
    for n, (prefix, title, topic, labs) in enumerate(T11S, 1):
        chapter('t11s', n, title, topic, labs, ('t11s-eleve.pdf', [span(ss, find(ss, prefix, 1), ns)]), ('t11s-prof.pdf', [span(sp, find(sp, prefix, 1), np_)]))
    evals = lambda toc, pages: [span(toc, i, pages) for i, (lv, t, _) in enumerate(toc) if lv == 1 and (t.startswith('Évaluation') or t.startswith('Sujet de synthèse'))]
    supplement('t11s-assessments', 't11s', 'assessments', ['Évaluations et sujets de synthèse', 'Assessments and synthesis papers'], ('t11s-eleve.pdf', evals(ss, ns)), ('t11s-prof.pdf', evals(sp, np_)))
    supplement('t11s-formulas', 't11s', 'formulas', ['Formulaire et glossaire', 'Formulas and glossary'],
               ('t11s-eleve.pdf', [span(ss, find(ss, 'Formulaire', 1), ns), span(ss, find(ss, 'Glossaire', 1), ns)]),
               ('t11s-prof.pdf', [span(sp, find(sp, 'Formulaire', 1), np_), span(sp, find(sp, 'Glossaire', 1), np_)]))
    supplement('t11s-planning', 't11s', 'planning', ['Progression indicative', 'Suggested yearly plan'], None, ('t11s-prof.pdf', [span(sp, find(sp, 'Progression indicative', 1), np_)]))

    # ---- sources: name, title, date, hash and size of each compiled book (no path, no storage id)
    for name, (path, title) in BOOKS.items():
        data = (livres / path).read_bytes()   # the date is the compiled book's, so a rerun on the same books changes nothing
        now = datetime.datetime.fromtimestamp((livres / path).stat().st_mtime, datetime.timezone.utc).strftime('%Y-%m-%dT%H:%M:%S.000Z')
        rec = {'name': catalog_name(name), 'title': title, 'modified': now, 'sha256': hashlib.sha256(data).hexdigest(), 'bytes': len(data)}
        cat['sources'] = [s for s in cat['sources'] if s['name'] not in (name, rec['name'])] + [rec]
        comp['sources'] = [s for s in comp['sources'] if s['name'] != name] + [{'name': name, 'title': title, 'modified': now}]
    catalog.save(m)
    for item in made: print(*item)
    print(f'build-mada: {sum(1 for x in made if not x[0].endswith(("fluency", "assessments", "guide", "formulas", "planning")))} chapters, '
          f'{len([s for s in comp["supplements"] if ours(s["id"])])} supplements')


if __name__ == '__main__':
    main()
