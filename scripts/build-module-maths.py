"""Package the seven-week applied mathematics collection with measured metadata."""
from pathlib import Path
import hashlib,json,shutil,zipfile,argparse
import pymupdf
ROOT=Path(__file__).resolve().parents[1]
SRC=ROOT/'content/university/module-maths'
OUT=ROOT/'dist/resources/university/module-maths'
def source_digest():
 h=hashlib.sha256()
 for p in sorted(SRC.rglob('*')):
  if p.is_file():h.update(p.relative_to(SRC).as_posix().encode());h.update(p.read_bytes())
 return h.hexdigest()
def build():
 OUT.mkdir(parents=True,exist_ok=True)
 index_path=OUT.parent/'index.json'; index=json.loads(index_path.read_text())
 collection=json.loads((ROOT/'content/data/manifest.json').read_text())['university']
 section=next(s for s in collection['sections'] if s['id']=='module-maths')
 files={}
 def record(key,p):
  d=dict(path=p.relative_to(ROOT/'dist').as_posix(),bytes=p.stat().st_size,sha256=hashlib.sha256(p.read_bytes()).hexdigest())
  if p.suffix=='.pdf':
   with pymupdf.open(p) as doc:d['pages']=len(doc)
  files[key]=d
 for key,source in [('module-workbook','1_Cahier_PDF/cahier-de-travail-autonome.pdf'),('module-statements','1_Cahier_PDF/cahier-de-travail-autonome-ENONCES.pdf'),('module-student-guide','2_Guide_de_sequence_PDF/Guide-etudiant.pdf'),('module-teacher-guide','2_Guide_de_sequence_PDF/Guide-professeur.pdf')]:
  p=OUT/Path(source).name
  with pymupdf.open(SRC/source) as doc:
   doc.set_metadata({**doc.metadata,'author':'','creator':'','keywords':''});doc.del_xml_metadata();doc.save(p,garbage=4,deflate=True)
  record(key,p)
 for s in section['sequences']:
  p=OUT/'slides'/s['slide'];p.parent.mkdir(exist_ok=True);shutil.copyfile(SRC/'4_Diapositives_interactives'/s['slide'],p);record(s['id'],p)
 for key,name,folder in [('module-tex','sources-latex.zip',SRC/'3_Sources_LaTeX'),('module-slides','diaporamas-html.zip',SRC/'4_Diapositives_interactives'),('module-all','module-complet.zip',SRC)]:
  p=OUT/name
  with zipfile.ZipFile(p,'w',zipfile.ZIP_DEFLATED) as z:
   for f in sorted(folder.rglob('*')):
    if f.is_file():
     info=zipfile.ZipInfo(f.relative_to(folder).as_posix(),(2026,10,16,0,0,0)); info.compress_type=zipfile.ZIP_DEFLATED;z.writestr(info,f.read_bytes())
  record(key,p)
 index['sections']=[s for s in index['sections'] if s['id']!='module-maths']+[section];index['files'].update(files)
 from importlib.util import spec_from_file_location, module_from_spec
 spec=spec_from_file_location('foundations_builder',ROOT/'scripts/build-university.py');module=module_from_spec(spec);spec.loader.exec_module(module)
 index['sourceDigest']=module.digest(collection)
 index['moduleDigest']=source_digest()
 index_path.write_text(json.dumps(index,ensure_ascii=False,indent=2)+'\n')
 print('Applied mathematics: four PDFs, seven HTML decks and three source/download bundles.')
if __name__=='__main__':
 if '--check' in __import__('sys').argv:
  index=json.loads((OUT.parent/'index.json').read_text());assert index['moduleDigest']==source_digest(),'Rebuild applied mathematics resources'
  for key,f in index['files'].items():
   if key.startswith('module-'):
    p=ROOT/'dist'/f['path'];assert p.stat().st_size==f['bytes'];assert hashlib.sha256(p.read_bytes()).hexdigest()==f['sha256']
  print('Applied mathematics sources and downloads match.')
 else:build()
