"""Banned-content check shared by the build and the tests.

Phrases (owner, school and place names) are stored only as SHA-256 hashes in tests/banned-sha256.json; text is
normalised (lower case, accents removed, words [a-z0-9]+) and every window of 1 to maxWords words is hashed and
compared. Personal-space links and e-mail addresses are matched by pattern.

Usage as a script: python3 tests/banned.py [paths...]  (default: tracked text files and PDF text under dist/)
"""
import hashlib, json, re, subprocess, sys, unicodedata, zipfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
_SPEC = json.loads((ROOT / 'tests/banned-sha256.json').read_text())
HASHES, MAXW = set(_SPEC['sha256']), _SPEC['maxWords']
PERSONAL = re.compile(r'(?:drive|docs)\.google\.com|dropbox\.com|onedrive|sharepoint', re.I)
EMAIL = re.compile(r'(?<![\\\w.+-])[\w.+-]+@[\w-]+\.[A-Za-z](?:[\w.]*\w)?')   # \w is Unicode; never ends on a period
# Addresses that are part of vendored licences or tooling, not owner details.
EMAIL_OK = re.compile(r'noreply@anthropic\.com|@(?:users\.noreply\.github\.com|example\.(?:com|org))$')


def words(text):
    t = unicodedata.normalize('NFKD', text.lower())
    t = ''.join(c for c in t if not unicodedata.combining(c))
    return re.findall(r'[a-z0-9]+', t)


def findings(text):
    """Return a list of short reasons; the matched banned phrase itself is never echoed."""
    out = []
    if PERSONAL.search(text): out.append('personal-space link')
    if any(not EMAIL_OK.search(m) for m in EMAIL.findall(text)): out.append('e-mail address')
    w = words(text)
    for n in range(1, MAXW + 1):
        for i in range(len(w) - n + 1):
            if hashlib.sha256(' '.join(w[i:i + n]).encode()).hexdigest() in HASHES:
                return out + ['banned phrase']
    return out


def pdf_text(path):
    import pymupdf
    with pymupdf.open(path) as d:
        return '\n'.join(p.get_text() for p in d) + json.dumps(d.metadata)


def publication_text(path):
    """Inspect archive members as documents; compressed bytes are not publication text."""
    if path.suffix == '.pdf':
        return pdf_text(path)
    if path.suffix == '.zip':
        parts = []
        binary = {'.png', '.jpg', '.jpeg', '.gif', '.ico', '.woff', '.woff2', '.ttf', '.otf'}
        with zipfile.ZipFile(path) as archive:
            for entry in archive.infolist():
                if entry.is_dir():
                    continue
                parts.append(entry.filename)
                suffix = Path(entry.filename).suffix.lower()
                if suffix in binary:
                    continue
                data = archive.read(entry)
                if suffix == '.pdf':
                    import pymupdf
                    with pymupdf.open(stream=data, filetype='pdf') as doc:
                        parts.append('\n'.join(p.get_text() for p in doc) + json.dumps(doc.metadata))
                        parts.append(doc.get_xml_metadata())
                        parts.append(json.dumps(doc.get_toc(False), default=str))
                        parts.extend(json.dumps(link, default=str) for page in doc for link in page.get_links())
                elif suffix == '.zip':
                    raise ValueError('Nested publication archive needs explicit inspection')
                else:
                    parts.append(data.decode('utf-8', errors='replace'))
        return '\n'.join(parts)
    return path.read_text(errors='replace')


def main(argv):
    if argv:
        paths = [Path(a) for a in argv]
    else:
        tracked = subprocess.run(['git', 'ls-files'], cwd=ROOT, capture_output=True, text=True).stdout.split()
        skip = re.compile(r'^dist/vendor/|^tests/banned|\.(?:png|jpg|svg|ico|woff2?)$')
        paths = [ROOT / p for p in tracked if not skip.search(p) and (ROOT / p).exists()]   # deleted, not yet committed
    bad = 0
    for p in paths:
        try:
            text = publication_text(p)
        except Exception as e:
            print(f'{p}: unreadable ({e})'); bad += 1; continue
        f = findings(text)
        if f: print(f'{p.relative_to(ROOT) if p.is_absolute() else p}: {", ".join(f)}'); bad += 1
    print('banned-content check: OK' if not bad else f'banned-content check: {bad} file(s)')
    return 1 if bad else 0


if __name__ == '__main__':
    sys.exit(main(sys.argv[1:]))
