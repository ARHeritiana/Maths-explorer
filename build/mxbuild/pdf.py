"""Assemble PDF excerpts with the native TeX frame and local sheet counts.

Books and excerpts overlap, so their sheet totals differ. Cached empty pages compiled on mxbook provide each
excerpt's correct frame. Python only copies the selected content and these TeX pages; it defines no typography,
palette or page decoration, never edits drawing operators, and never shrinks complete pages.
"""
import hashlib, json
from pathlib import Path
import pymupdf
from . import ROOT, OUT, tex

CORE = ROOT / 'content/tex/core'


def _cached_frame(path, pages):
    """Read an immutable frame; an interrupted or incomplete cache entry must never become a resource."""
    if not path.exists():
        return None
    try:
        document = pymupdf.open(stream=path.read_bytes(), filetype='pdf')
    except (pymupdf.FileDataError, ValueError):
        return None
    if len(document) == pages:
        return document
    document.close()
    return None


def frame(pages, lang):
    """A native mxbook PDF containing pages 1..pages, with the corresponding local total; cached by core inputs."""
    if pages < 1 or lang not in ('fr', 'en'):
        raise ValueError('A frame needs at least one page and a supported language')
    digest = hashlib.sha256()
    for path in sorted(CORE.glob('*')):
        if path.suffix in ('.cls', '.sty'):
            digest.update(path.name.encode()); digest.update(path.read_bytes())
    digest.update(Path(__file__).read_bytes())
    base = OUT / 'native-frames' / digest.hexdigest()[:16]
    job = f'frame-{lang}-{pages}'
    target = base / (job + '.pdf')
    cached = _cached_frame(target, pages)
    if cached is not None:
        return cached
    else:
        # Each language starts the class once for all known resource lengths. A newly introduced length is included
        # in the next batch without invalidating correctly cached frames for the existing lengths.
        measured = json.loads((ROOT / 'dist/resources/catalog.json').read_text())
        counts = sorted({pages} | {int(row.get('englishPages') or row['pages']) if lang == 'en' else int(row['pages'])
                                  for row in measured['resources'] if row.get('format') == 'PDF'})
        missing = []
        for count in counts:
            previous = _cached_frame(base / f'frame-{lang}-{count}.pdf', count)
            if previous is None:
                missing.append(count)
            else:
                previous.close()
        counts = missing
        base.mkdir(parents=True, exist_ok=True)
        batch = 'frames-' + lang + '-' + hashlib.sha256(str(counts).encode()).hexdigest()[:10]
        source = base / (batch + '.tex')
        source.write_text(r'\documentclass[lang=%s,layout=sheet]{mxbook}' % lang + '\n'
                          + r'\begin{document}' + '\n'
                          + '\n'.join(r'\mxframeonly{%d}' % count for count in counts)
                          + '\n' + r'\end{document}' + '\n')
        result = tex.compile(CORE, str(source), batch, base)
        if result.pages() != sum(counts):
            raise tex.CompileError(f'Native frame batch has {result.pages()} pages, expected {sum(counts)}')
        with pymupdf.open(result.pdf) as document:
            start = 0
            for count in counts:
                with pymupdf.open() as part:
                    part.insert_pdf(document, from_page=start, to_page=start + count - 1)
                    output = base / f'frame-{lang}-{count}.pdf'
                    temporary = output.with_suffix('.tmp.pdf')
                    part.save(temporary, garbage=4, deflate=True)
                    temporary.replace(output)
                start += count
    cached = _cached_frame(target, pages)
    if cached is None:
        raise tex.CompileError(f'Native frame cache is incomplete for {lang}, {pages} sheets')
    return cached


def assemble(document, copies, lang):
    """copies: (source-page index, content clip, destination rectangle). Copy safe links into the selected pages."""
    if not copies:
        raise ValueError('Cannot assemble an empty resource')
    out = pymupdf.open()
    destinations = {source: (index, clip, dest) for index, (source, clip, dest) in enumerate(copies)}
    with frame(len(copies), lang) as native:
        for index, (source, clip, dest) in enumerate(copies):
            original = document[source]
            page = out.new_page(width=original.rect.width, height=original.rect.height)
            page.show_pdf_page(dest, document, source, clip=clip, keep_proportion=True)
            page.show_pdf_page(page.rect, native, index)
        # Insert links after every destination page exists. The excerpt's page labels refer to its own sheets.
        out.set_page_labels([{'startpage': 0, 'prefix': '', 'style': 'D', 'firstpagenum': 1}])
        for index, (source, clip, dest) in enumerate(copies):
            sx, sy = dest.width / clip.width, dest.height / clip.height
            for link in document[source].get_links():
                rectangle = link['from'] & clip
                if rectangle.is_empty or link['kind'] not in (pymupdf.LINK_GOTO, pymupdf.LINK_URI):
                    continue
                result = {'kind': link['kind'], 'from': pymupdf.Rect(
                    dest.x0 + (rectangle.x0 - clip.x0) * sx, dest.y0 + (rectangle.y0 - clip.y0) * sy,
                    dest.x0 + (rectangle.x1 - clip.x0) * sx, dest.y0 + (rectangle.y1 - clip.y0) * sy)}
                if link['kind'] == pymupdf.LINK_URI:
                    result['uri'] = link['uri']
                else:
                    target = destinations.get(link['page'])
                    if target is None:
                        continue
                    number, target_clip, target_dest = target
                    point = link.get('to', pymupdf.Point(0, 0))
                    result.update(page=number, to=pymupdf.Point(
                        target_dest.x0 + (max(target_clip.x0, min(point.x, target_clip.x1)) - target_clip.x0) * target_dest.width / target_clip.width,
                        target_dest.y0 + (max(target_clip.y0, min(point.y, target_clip.y1)) - target_clip.y0) * target_dest.height / target_clip.height))
                out[index].insert_link(result)
    return out


def excerpt(document, start, end, lang):
    """Whole pages [start, end), retaining their geometry and replacing the book frame with the local native frame."""
    copies = []
    for index in range(start, end):
        rectangle = document[index].rect
        clip = pymupdf.Rect(0, 43, rectangle.width, rectangle.height - 38)
        copies.append((index, clip, clip))
    return assemble(document, copies, lang)
