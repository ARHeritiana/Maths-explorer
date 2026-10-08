"""Rebuild new whole-page companion excerpts after the main resource import.
Usage: python scripts/build-companion-resources.py /absolute/source-directory
Source filenames match resourceCatalog.sources.name. Existing nested library
assets are retained; source files must be from the recorded snapshot.
"""
import hashlib,json,sys
from pathlib import Path
from pypdf import PdfReader,PdfWriter
root=Path(__file__).resolve().parents[1];sources=Path(sys.argv[1]).resolve();catalog_file=root/'dist/js/resources-data.js'
c=json.loads(catalog_file.read_text().split('=',1)[1].rstrip().rstrip(';'));readers={};manifest=[]
for item in c['chapters']+c['supplements']:
 for f in item['files']:
  target=root/'dist'/f['path'];a,b=f['start'],f['end']
  if len(Path(f['path']).parts)==2:
   if f['source'] not in readers:readers[f['source']]=PdfReader(sources/f['source'])
   writer=PdfWriter()
   for i in range(a-1,b):writer.add_page(readers[f['source']].pages[i],excluded_keys=['/Annots'])
   writer.add_metadata({'/Title':target.name,'/Subject':f"Source: {f['source']}; physical pages {a}–{b}"})
   writer.write(target)
  if len(PdfReader(target).pages)!=f['pages']:raise ValueError(f"Page count mismatch: {target}")
  data=target.read_bytes();f['bytes']=len(data);manifest.append({'path':f['path'],'source':f['source'],'pages':[a,b],'sha256':hashlib.sha256(data).hexdigest()})
catalog_file.write_text('export const resourceCatalog = '+json.dumps(c,ensure_ascii=False,indent=2)+';\n')
(root/'docs/RESOURCE_PROVENANCE.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n')
print('Updated companion catalog and provenance:',len(manifest),'PDF references')
