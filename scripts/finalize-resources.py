"""Resolve bilingual PDFs and enforce the owner's ban on personal-space links."""
import json,re,hashlib
from pathlib import Path
import fitz
ROOT=Path(__file__).resolve().parents[1]
# Text that identifies the author or their school is removed from any PDF that still carries it.
IDENTIFYING=['ANONYME, ANONYME — ','ANONYME, ANONYME - ','ANONYME','Mr ANONYME','M. ANONYME','ANONYME · 2026-2027','ANONYME – 2026–2027']
personal=re.compile(r'(drive|docs)\.google\.com|dropbox\.com|onedrive|sharepoint',re.I)
for path in (ROOT/'dist/resources').rglob('*.pdf'):
    doc=fitz.open(path);changed=False
    for page in doc:
        for link in page.get_links():
            if personal.search(link.get('uri','')):page.delete_link(link);changed=True
        for block in page.get_text('blocks'):
            if 'AI-generated original' in block[4] or personal.search(block[4]):
                page.add_redact_annot(fitz.Rect(block[:4]),fill=(1,1,1));changed=True
        for phrase in IDENTIFYING:
            for rect in page.search_for(phrase):page.add_redact_annot(rect,fill=(1,1,1));changed=True
        if page.first_annot:page.apply_redactions(images=0,graphics=0)
    if personal.search(json.dumps(doc.metadata)):
        doc.set_metadata({'title':path.stem,'author':'Maths Explorer'});changed=True
    if changed:
        tmp=path.with_suffix('.tmp.pdf');doc.save(tmp,garbage=4,deflate=True);doc.close();tmp.replace(path)
    else:doc.close()
catalog=ROOT/'dist/resources/catalog.json';c=json.loads(catalog.read_text())
for course in c['courses']:course['language']='bilingual'
ledger=ROOT/'docs/TEX_CONVERSION.json'
converted=set(json.loads(ledger.read_text())['converted']) if ledger.exists() else set()
for r in c['resources']:
    if r['format']!='PDF':continue
    fr=r['url'][0] if isinstance(r['url'],list) else r['url']
    en=fr[:-4]+'-en.pdf';path=ROOT/'dist'/en.removeprefix('./')
    if not path.exists():raise FileNotFoundError(en)
    r['pages']=len(fitz.open(ROOT/'dist'/fr.removeprefix('./')))   # page counts follow the files
    r.update(url=[fr,en],language='bilingual',bytes=(ROOT/'dist'/fr.removeprefix('./')).stat().st_size,englishBytes=path.stat().st_size,translation='tex-source' if r['chapter'] in converted else ('local-machine' if r.get('translation') in (None,'tex-source') else r['translation']))
for source in c['sources']:source.pop('url',None);source.pop('id',None)
catalog.write_text(json.dumps(c,ensure_ascii=False,indent=2)+'\n')
companion=ROOT/'dist/js/resources-data.js';c=json.loads(companion.read_text().split('=',1)[1].rstrip().rstrip(';'))
c.pop('folder',None)
for source in c['sources']:source.pop('url',None);source.pop('id',None)
manifest=[]
for chapter in c['chapters']+c['supplements']:
    for f in chapter['files']:
        path=ROOT/'dist'/f['path'];en=path.with_name(path.stem+'-en.pdf')
        if not en.exists():raise FileNotFoundError(en)
        f['pages']=len(fitz.open(path));f['end']=f['start']+f['pages']-1   # whole-page extracts
        f.update(englishPath=str(en.relative_to(ROOT/'dist')),bytes=path.stat().st_size,englishBytes=en.stat().st_size)
        if len(fitz.open(en))!=f['pages']:raise ValueError(f'English page count mismatch: {en}')
        manifest.append({'path':f['path'],'source':f['source'],'pages':[f['start'],f['end']],'sha256':hashlib.sha256(path.read_bytes()).hexdigest(),'englishPath':f['englishPath'],'englishSha256':hashlib.sha256(en.read_bytes()).hexdigest()})
companion.write_text('export const resourceCatalog = '+json.dumps(c,ensure_ascii=False,indent=2)+';\n')
(ROOT/'docs/RESOURCE_PROVENANCE.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n')
# No private URLs or IDs may be present in data delivered to the browser.
for path in (ROOT/'dist').rglob('*'):
    if path.suffix in {'.js','.json','.html'} and personal.search(path.read_text()):raise ValueError(f'Personal-space URL in {path}')
print('Bilingual catalogues resolved. All PDF links, text and client data checked for personal-space URLs.')
