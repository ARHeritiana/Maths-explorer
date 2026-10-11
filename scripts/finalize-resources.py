"""PDF hygiene (personal-space links, stray per-file AI notices, banned content), then regenerate the catalogue from the manifest."""
import json,re
from pathlib import Path
import fitz
ROOT=Path(__file__).resolve().parents[1]
import sys
sys.path.insert(0,str(ROOT/'tests'))
import banned   # hashed owner/school/place names, personal-space links, e-mail addresses
personal=banned.PERSONAL
problems=[]
for path in (ROOT/'dist/resources').rglob('*.pdf'):
    doc=fitz.open(path);changed=False
    for page in doc:
        for link in page.get_links():
            if personal.search(link.get('uri','')):page.delete_link(link);changed=True
        for block in page.get_text('blocks'):   # earlier per-file AI notices: the site keeps one notice, in its footer
            if 'AI-generated original' in block[4]:
                page.add_redact_annot(fitz.Rect(block[:4]),fill=(1,1,1));changed=True
        if page.first_annot:page.apply_redactions(images=0,graphics=0)
    if personal.search(json.dumps(doc.metadata)):
        doc.set_metadata({'title':path.stem,'author':'Maths Explorer'});changed=True
    if changed:
        tmp=path.with_suffix('.tmp.pdf');doc.save(tmp,garbage=4,deflate=True);doc.close();tmp.replace(path)
    else:doc.close()
    found=banned.findings(banned.pdf_text(path))   # identifying text must be fixed in the source, not redacted here
    if found:problems.append(f'{path.relative_to(ROOT)}: {", ".join(found)}')
if problems:raise SystemExit('Banned content in PDFs:\n'+'\n'.join(problems))
sys.path.insert(0,str(ROOT/'build'))
from mxbuild import catalog as manifest_io   # catalogue, companion and provenance are generated from content/data/manifest.json
manifest_io.write()
# No private URLs or IDs may be present in data delivered to the browser.
for path in (ROOT/'dist').rglob('*'):
    if path.suffix in {'.js','.json','.html'} and personal.search(path.read_text()):raise ValueError(f'Personal-space URL in {path}')
print('Bilingual catalogues resolved. All PDF links, text and client data checked for personal-space URLs.')
