"""Package the seven-week applied mathematics collection with measured metadata."""
from pathlib import Path
import hashlib,json,shutil,zipfile,argparse,subprocess,tempfile
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
     if f.suffix=='.html' and '4_Diapositives_interactives' in f.parts and f.name not in {s['slide'] for s in section['sequences']}:continue
     info=zipfile.ZipInfo(f.relative_to(folder).as_posix(),(2026,10,16,0,0,0)); info.compress_type=zipfile.ZIP_DEFLATED;z.writestr(info,f.read_bytes())
  record(key,p)
 index['sections']=[s if s['id']!='module-maths' else section for s in index['sections']]
 index['files']={k:v for k,v in index['files'].items() if not v['path'].startswith('resources/university/module-maths/')}
 index['files'].update(files)
 index['moduleDigest']=source_digest()
 index_path.write_text(json.dumps(index,ensure_ascii=False,indent=2)+'\n')
 print(f"Applied mathematics: four PDFs, {len(section['sequences'])} HTML decks and three source/download bundles.")
def compile_pdfs():
 # Compile from TeX whenever it changes; retain canonical PDFs as tracked inputs.
 jobs=[('cahier','cahier.tex','1_Cahier_PDF/cahier-de-travail-autonome.pdf',False),('cahier','cahier.tex','1_Cahier_PDF/cahier-de-travail-autonome-ENONCES.pdf',True),('guide','guide-etudiant.tex','2_Guide_de_sequence_PDF/Guide-etudiant.pdf',False),('guide','guide-professeur.tex','2_Guide_de_sequence_PDF/Guide-professeur.pdf',False)]
 for folder,entry,target,statements in jobs:
  with tempfile.TemporaryDirectory(prefix='mx-module-') as tmp:
   cwd=Path(tmp);shutil.copytree(SRC/'3_Sources_LaTeX'/folder,cwd,dirs_exist_ok=True)
   if statements:
    p=cwd/entry;p.write_text(p.read_text().replace('\\corrtrue %','\\corrfalse %'))
   for _ in range(2):subprocess.run(['pdflatex','-no-shell-escape','-interaction=nonstopmode','-halt-on-error',entry],cwd=cwd,stdout=subprocess.DEVNULL,check=True)
   shutil.copyfile(cwd/entry.replace('.tex','.pdf'),SRC/target)

if __name__=='__main__':
 if '--check' in __import__('sys').argv:
  index=json.loads((OUT.parent/'index.json').read_text());assert index['moduleDigest']==source_digest(),'Rebuild applied mathematics resources'
  for key,f in index['files'].items():
   if key.startswith('module-'):
    p=ROOT/'dist'/f['path'];assert p.stat().st_size==f['bytes'];assert hashlib.sha256(p.read_bytes()).hexdigest()==f['sha256']
  print('Applied mathematics sources and downloads match.')
 else:
  if '--compile' in __import__('sys').argv:compile_pdfs()
  build()
