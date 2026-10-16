"""Build the independently authored foundations collection from anonymous, editable sources."""
import argparse, hashlib, json, shutil, subprocess, tempfile, zipfile
from pathlib import Path
import pymupdf

ROOT = Path(__file__).resolve().parents[1]
TEX = ROOT / 'content/tex/university/foundations'
SLIDES = ROOT / 'content/slides/university/foundations'
OUT = ROOT / 'dist/resources/university/foundations'

def digest(collection):
    h = hashlib.sha256(json.dumps(collection, ensure_ascii=False, sort_keys=True).encode())
    for folder in (TEX, SLIDES):
        for p in sorted(folder.rglob('*')):
            if p.is_file(): h.update(p.relative_to(ROOT).as_posix().encode()); h.update(p.read_bytes())
    return h.hexdigest()

def bundle(path, folder, instructions):
    with zipfile.ZipFile(path, 'w', zipfile.ZIP_DEFLATED) as z:
        for p in sorted(folder.rglob('*')):
            if p.is_file():
                info = zipfile.ZipInfo(p.relative_to(folder).as_posix(), (2026, 10, 16, 0, 0, 0))
                info.compress_type = zipfile.ZIP_DEFLATED; z.writestr(info, p.read_bytes())
        info = zipfile.ZipInfo('README.txt', (2026, 10, 16, 0, 0, 0)); info.compress_type = zipfile.ZIP_DEFLATED
        z.writestr(info, instructions)

def main():
    ap = argparse.ArgumentParser(); ap.add_argument('--check', action='store_true'); args = ap.parse_args()
    collection = json.loads((ROOT / 'content/data/manifest.json').read_text())['university']
    index_path = OUT.parent / 'index.json'
    if args.check:
        index = json.loads(index_path.read_text()); assert index['sourceDigest'] == digest(collection), 'University sources changed: rebuild the collection'
        for r in index['files'].values():
            p = ROOT / 'dist' / r['path']; assert p.stat().st_size == r['bytes']; assert hashlib.sha256(p.read_bytes()).hexdigest() == r['sha256']
        for section in index['sections']:
            for seq in section['sequences']:
                for edition in ['student', 'teacher']:
                    assert 1 <= seq[edition + 'Page'] <= index['files'][edition]['pages']
        print('University collection: sources, files, hashes and chapter links match.'); return
    OUT.mkdir(parents=True, exist_ok=True); (OUT / 'slides').mkdir(exist_ok=True)
    files = {}; starts = {}
    for key, entry, output in [('student', 'student.tex', 'notes-etudiant.pdf'), ('teacher', 'main.tex', 'guide-enseignant.pdf')]:
        with tempfile.TemporaryDirectory(prefix='mx-university-') as tmp:
            tmp = Path(tmp); shutil.copytree(TEX, tmp / 'tex'); cwd = tmp / 'tex'
            for _ in range(2):
                p = subprocess.run(['xelatex', '-interaction=nonstopmode', '-halt-on-error', entry], cwd=cwd, capture_output=True, text=True)
                if p.returncode: raise RuntimeError(p.stdout[-4000:])
            log = (cwd / entry.replace('.tex', '.log')).read_text()
            warnings = [l for l in log.splitlines() if 'Overfull' in l or 'Missing character' in l]
            report = ROOT / 'build/university'; report.mkdir(parents=True, exist_ok=True); (report / (key + '.log')).write_text(log)
            print(key, 'layout warnings:', len(warnings))
            doc = pymupdf.open(cwd / entry.replace('.tex', '.pdf'))
            toc = [x for x in doc.get_toc() if x[0] == 1]
            assert len(toc) == 6, toc
            starts[key] = [x[2] for x in toc]
            doc.set_metadata({'title': 'Fondements mathématiques : ' + ('notes de cours' if key == 'student' else 'guide enseignant'), 'author': '', 'subject': 'Six séquences pour les études supérieures', 'keywords': ''})
            doc.del_xml_metadata(); doc.save(OUT / output, garbage=4, deflate=True); doc.close()
        doc = pymupdf.open(OUT / output); files[key] = {'path': (OUT / output).relative_to(ROOT / 'dist').as_posix(), 'pages': len(doc)}; doc.close()
    section = collection['sections'][0]
    for n, seq in enumerate(section['sequences'], 1):
        head = (SLIDES / 'shell_head.html').read_text().replace('@TITLE@', seq['title'][0])
        body = head + (SLIDES / 'lib.js').read_text() + '\n' + (SLIDES / f'deck{n}.js').read_text() + '\nboot();\n})();\n</script>\n</body>\n</html>\n'
        p = OUT / 'slides' / seq['slide']; p.write_text(body)
        seq['studentPage'] = starts['student'][n - 1]; seq['teacherPage'] = starts['teacher'][n - 1]
        files[seq['id']] = {'path': p.relative_to(ROOT / 'dist').as_posix()}
    bundle(OUT / 'sources-latex.zip', TEX, 'Deux éditions, mêmes sections. Compiler deux fois avec XeLaTeX : main.tex (guide enseignant), student.tex (notes étudiant). Les dix-huit ateliers de la collection et leurs solutions sont inclus.\n')
    bundle(OUT / 'sources-slides.zip', SLIDES, 'Sources des six diaporamas. Les exports HTML sont assemblés par scripts/build-university.py dans le dépôt Maths Explorer.\n')
    for key, name in [('tex', 'sources-latex.zip'), ('slidesSource', 'sources-slides.zip')]: files[key] = {'path': (OUT / name).relative_to(ROOT / 'dist').as_posix()}
    for r in files.values():
        p = ROOT / 'dist' / r['path']; r.update(bytes=p.stat().st_size, sha256=hashlib.sha256(p.read_bytes()).hexdigest())
    # Computed page anchors are output metadata, not part of the editable manifest.
    clean = json.loads((ROOT / 'content/data/manifest.json').read_text())['university']
    collection.update(files=files, sourceDigest=digest(clean))
    index_path.write_text(json.dumps(collection, ensure_ascii=False, indent=2) + '\n')
    print('University collection: two PDF editions, six HTML decks, two editable source bundles.')

if __name__ == '__main__': main()
