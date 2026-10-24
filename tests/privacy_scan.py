"""Inventory and inspect published PDFs and text assets without echoing private values.

The optional JSON report contains paths, artifact hashes and finding categories, never
matched content. Keep audit reports outside the public repository. PDF text extraction
cannot inspect text drawn as vector outlines or embedded in images; those need review.
"""
import argparse
import hashlib
import json
import re
import sys
from pathlib import Path

import banned

ROOT = Path(__file__).resolve().parents[1]
TEXT_SUFFIXES = {'.html', '.js', '.json', '.tex', '.txt', '.md', '.css', '.xml', '.svg'}
NOTICE = re.compile(
    r'\b(?:AI|artificial intelligence)[\s-]+generated\b|generated (?:by|with) (?:AI|artificial intelligence)|'
    r'g[eé]n[eé]r[eé](?:e|s|es)? (?:par|avec) (?:l[\x27’])?(?:IA|intelligence artificielle)|'
    r'content-origin|human_reviewed|audited.twice', re.I)


def reasons(text):
    result = banned.findings(text)
    if NOTICE.search(text):
        result.append('visible notice or review status')
    return result


def scan_pdf(path):
    """Inspect filenames, all extracted pages and the non-page document surfaces."""
    import pymupdf
    path = Path(path)
    result = {'bytes': path.stat().st_size, 'sha256': hashlib.sha256(path.read_bytes()).hexdigest(),
              'findings': []}

    def inspect(surface, text, page=None):
        found = reasons(text)
        if found:
            item = {'surface': surface, 'reasons': found}
            if page is not None:
                item['page'] = page
            result['findings'].append(item)

    inspect('filename', path.name)
    with pymupdf.open(path) as doc:
        result.update(pages=len(doc), has_xmp=bool(doc.get_xml_metadata()), links=0, annotations=0,
                      attachments=len(doc.embfile_names()))
        inspect('metadata', json.dumps(doc.metadata))
        inspect('xmp', doc.get_xml_metadata())
        inspect('outline', json.dumps(doc.get_toc(False), default=str))
        for name in doc.embfile_names():
            inspect('attachment filename', name)
            inspect('attachment info', json.dumps(doc.embfile_info(name), default=str))
            # Embedded documents are additional content, requiring their own inspection.
            result['findings'].append({'surface': 'attachment', 'reasons': ['embedded content needs review']})
        for number, page in enumerate(doc, 1):
            inspect('text', page.get_text(), number)
            for link in page.get_links():
                result['links'] += 1
                inspect('link', json.dumps(link, default=str), number)
            for annotation in page.annots() or []:
                result['annotations'] += 1
                inspect('annotation', json.dumps(annotation.info, default=str), number)
            for widget in page.widgets() or []:
                inspect('form field', json.dumps({'name': widget.field_name, 'value': widget.field_value}, default=str), number)
    return result


def scan(root):
    """Return a measured inventory; unreadable assets are failures, never omissions."""
    root = Path(root)
    records = []
    for path in sorted(root.rglob('*')):
        if not path.is_file():
            continue
        suffix = path.suffix.lower()
        if suffix != '.pdf' and suffix not in TEXT_SUFFIXES:
            continue
        # Third-party licences contain their authors' public contact addresses. They
        # are outside the first-party publication anonymity policy, as in banned.py.
        if 'vendor' in path.relative_to(root).parts:
            continue
        row = {'path': path.relative_to(root).as_posix(), 'kind': 'pdf' if suffix == '.pdf' else 'text'}
        try:
            if suffix == '.pdf':
                row.update(scan_pdf(path))
            else:
                row.update(bytes=path.stat().st_size, sha256=hashlib.sha256(path.read_bytes()).hexdigest(), findings=[])
                found = reasons(path.name + '\n' + path.read_text(errors='strict'))
                if found:
                    row['findings'].append({'surface': 'text or filename', 'reasons': found})
        except Exception as error:
            # Error strings can contain private values. Record only the error class.
            row['error'] = type(error).__name__
        records.append(row)
    return {'version': 1, 'records': records, 'limitations': [
        'Extracted PDF text does not cover image text or text drawn as outlines.',
        'Identity matching uses the existing hashed phrase registry.',
        'Embedded document content requires separate review.']}


def main(argv=None):
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('root', nargs='?', type=Path, default=ROOT / 'dist')
    parser.add_argument('--report', type=Path, help='Optional private JSON inventory outside the public repository')
    args = parser.parse_args(argv)
    if args.report and args.report.resolve().is_relative_to(ROOT):
        parser.error('Audit reports must stay outside the public repository')
    if not args.root.is_dir():
        parser.error('The publication root must be an existing directory')
    result = scan(args.root)
    if args.report:
        args.report.parent.mkdir(parents=True, exist_ok=True)
        args.report.write_text(json.dumps(result, indent=2) + '\n')
    records = result['records']
    bad = sum(bool(row.get('findings') or row.get('error')) for row in records)
    pdfs = sum(row['kind'] == 'pdf' for row in records)
    print(f'Publication privacy: {pdfs} PDFs, {len(records) - pdfs} text assets; {bad} file(s) need review')
    return int(bool(bad))


if __name__ == '__main__':
    sys.exit(main())
