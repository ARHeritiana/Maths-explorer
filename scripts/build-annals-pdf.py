#!/usr/bin/env python3
"""Compile native-frame annales books and their complete, portable LaTeX source bundle."""
# The figure PDFs bundled in sources.zip are exactly those the books use (build/out/annals/figures-pdf must hold nothing else).
import argparse,concurrent.futures,hashlib,json,os,runpy,shutil,subprocess,zipfile
from pathlib import Path
import pymupdf
ROOT=Path(__file__).resolve().parents[1]
helpers=runpy.run_path(str(ROOT/'scripts/build-annals.py'))
SOURCE=ROOT/'content/tex/annals';OUT=ROOT/'build/out/annals-books';DEST=ROOT/'dist/resources/annals/books';RECEIPT=ROOT/'content/data/annals-pdf-build.json'
CORE=ROOT/'content/tex/core'
DIAGNOSE='--diagnose' in __import__('sys').argv
def fingerprint():
 h=hashlib.sha256(Path(__file__).read_bytes())
 h.update((ROOT/'scripts/build-annals.py').read_bytes())
 for p in sorted(p for p in SOURCE.rglob('*') if p.is_file()):h.update(p.name.encode());h.update(p.read_bytes())
 for p in sorted(CORE.glob('*')):
  if p.is_file():h.update(p.name.encode());h.update(p.read_bytes())
 h.update(json.dumps(json.loads((ROOT/'content/data/manifest.json').read_text())['annalsBank'],sort_keys=True).encode())
 return h.hexdigest()
def preamble():
 parts=[]
 for line in helpers['PREAMBLE'].splitlines():
  if any(k in line for k in ['{fontenc}','{inputenc}','mathpazo','{pstricks,','{pst-bezier}','[pstricks]{tablvar}','documentclass','{geometry}','\\geometry','\\pagestyle','\\setlength{\\parindent}']):continue
  parts.append(line)
 out=r'\makeatletter\def\input@path{{core/}}\makeatother\def\mxcorepath{core/}'+'\n'+r'\documentclass[lang=fr,edition=teacher,layout=sheet]{mxbook}'+'\n'+'\n'.join(parts)+'\n'+r'\usepackage[tikz]{tablvar}\usepackage[export]{adjustbox}'+r'\providecommand{\psset}[1]{}'+'\n'+'\n'.join(l for l in (helpers['MACROS']+helpers['TEXT_MACROS']).split('\n') if 'DeclareUnicodeCharacter' not in l).replace(r'\newcommand',r'\providecommand')+helpers['TEX_PATCHES']+'\n'+r'\DeclareUnicodeCharacter{2236}{:}\DeclareUnicodeCharacter{2190}{\ensuremath{\leftarrow}}'+r'\graphicspath{{assets/}}'+'\n'
 return __import__('re').sub(r'\\DeclareUnicodeCharacter\{[0-9A-F]+\}\{(?:[^{}]|\{(?:[^{}]|\{[^{}]*\})*\})*\}','',out)
def build_one(job):
 family,correction,records,config,chapters=job
 name=family.lower()+('-corriges' if correction else '-enonces');work=OUT/name;work.mkdir(parents=True,exist_ok=True)
 for folder,original in [('core',CORE),('units',SOURCE)]:
  (work/folder).mkdir(exist_ok=True)
  for p in original.glob('*'):
   if p.is_file():
    if folder=='units':
     body,_=helpers['graphics'](p.read_text(),p.stem);body=body.replace('./resources/annals/figures/','figures/').replace('.svg}', '.pdf}').replace(r'\includegraphics{figures/',r'\includegraphics[max width=\linewidth]{figures/');(work/folder/p.name).write_text(body)
    else:shutil.copy2(p,work/folder/p.name)
 (work/'core'/'fonts').mkdir(parents=True,exist_ok=True)
 for p in (CORE/'fonts').glob('*'):shutil.copy2(p,work/'core'/'fonts'/p.name)
 (work/'figures').mkdir(exist_ok=True)
 for p in (ROOT/'build/out/annals/figures-pdf').glob('*.pdf'):shutil.copy2(p,work/'figures'/p.name)
 (work/'assets').mkdir(exist_ok=True)
 for p in (SOURCE/'assets').glob('*'):shutil.copy2(p,work/'assets'/p.name)
 shutil.copy2(ROOT/'build/out/annals/figures-pdf/pyramide.pdf',work/'assets/pyramide.pdf')
 text=preamble()+r'\begin{document}'+'\n'+r'\chapter*{Banque '+family+' : '+('corrigés' if correction else 'énoncés')+'}\n'+config['credit']+'\\par\\medskip\n'+r'\noindent Documents adaptés sous licence CC BY-SA. Les sujets zéro et spécimens sont des modèles ; les autres exercices proviennent des sessions ou banques indiquées. Les sujets historiques ne certifient pas un alignement avec le programme actuel.'+'\n'
 text+='\\par\\smallskip\\url{'+config['terms']+'}\n'
 prev=None
 for r in sorted(records,key=lambda r:((r['chapters']or['zz-transversal'])[0],r['year'],r['session'],r['number'])):
  if correction and not r['correction']:continue
  group=(r['chapters']or['zz-transversal'])[0]
  if group!=prev:text+='\\clearpage\\section*{'+chapters.get(group,'Exercices transversaux')+'}\n';prev=group
  title=r['session']+' : '+('automatismes' if r['number']=='automatismes' else 'exercice '+r['number'])
  title=title.replace('_',r'\_').replace('&',r'\&')
  text+='\\mxneed{6}\\subsection*{'+title+'}\n\\typeout{MXEX:'+r['id']+'}\n'
  text+='\\begingroup\\input{units/'+r['id']+('.cor' if correction else '')+'.tex}\\endgroup\n\\par\\bigskip\n'
 text+='\\end{document}\n';(work/(name+'.tex')).write_text(text)
 for passno in ([1] if DIAGNOSE else [1,2]):
  run=subprocess.run(['xelatex','-interaction=nonstopmode',* ([] if DIAGNOSE else ['-halt-on-error']),'-no-shell-escape',name+'.tex'],cwd=work,capture_output=True,text=True,errors='replace')
  if run.returncode:
   (work/'build-error.txt').write_text(run.stdout+run.stderr)
   if DIAGNOSE:print(name,'diagnostic log written',flush=True);return name
   raise RuntimeError(name+': '+run.stdout[-1600:]+run.stderr[-300:])
 warnings=[line for line in (work/(name+'.log')).read_text(errors='replace').splitlines() if 'Missing character' in line]
 if warnings:raise RuntimeError(name+': incomplete symbol rendering: '+'; '.join(warnings[:5]))
 for cmd in []:
  run=subprocess.run(cmd,cwd=work,capture_output=True,text=True,errors='replace')
  if run.returncode:raise RuntimeError(name+': '+run.stderr[-700:])
 with pymupdf.open(work/(name+'.pdf')) as pdf:
  pdf.set_metadata({'title':'Maths Explorer : '+family+' '+('corrigés' if correction else 'énoncés'),'author':'','subject':'APMEP / CoopMaths, adaptation Maths Explorer, CC BY-SA'})
  pdf.del_xml_metadata();pdf.save(DEST/(name+'.pdf'),garbage=4,deflate=True)
  pages=len(pdf)
 shutil.copy2(work/(name+'.tex'),DEST/(name+'.tex'))
 print(name,pages,'pages',flush=True)
 return name

def build():
 config=json.loads((ROOT/'content/data/manifest.json').read_text())['annalsBank'];chapters={r['id']:r['title'][0] for r in json.loads((ROOT/'content/data/manifest.json').read_text())['catalog']['chapters']}
 OUT.mkdir(parents=True,exist_ok=True);DEST.mkdir(parents=True,exist_ok=True)
 jobs=[(f,c,[r for r in config['records'] if r['family']==f],config,chapters) for f in ['BAC','EAM','E3C'] for c in [False,True]]
 names=[];errors=[]
 with concurrent.futures.ThreadPoolExecutor(max_workers=2) as pool:
  futures=[pool.submit(build_one,job) for job in jobs]
  for future in concurrent.futures.as_completed(futures):
   try:names.append(future.result())
   except Exception as error:errors.append(str(error))
 if errors:raise RuntimeError('\n'.join(errors))
 names.sort()
 if DIAGNOSE:return
 with zipfile.ZipFile(DEST/'sources.zip','w',zipfile.ZIP_DEFLATED) as z:
  z.writestr('index.json',json.dumps(config,ensure_ascii=False,indent=2))
  z.writestr('ATTRIBUTION.txt',config['credit']+'\nCC BY-SA\n'+config['terms']+'\nCompiler avec XeLaTeX ; les figures originales sont fournies au format vectoriel PDF.\n')
  for name in names:z.write(DEST/(name+'.tex'),name+'.tex')
  for source in sorted(SOURCE.glob('*.tex')):
   p=OUT/names[0]/'units'/source.name;z.write(p,'units/'+p.name)
  for p in (ROOT/'build/out/annals/figures-pdf').glob('*.pdf'):z.write(p,'figures/'+p.name)
  for p in CORE.glob('*'):
   if p.is_file():z.write(p,'core/'+p.name)
  for p in (CORE/'fonts').glob('*'):z.write(p,'core/fonts/'+p.name)
  for p in (SOURCE/'assets').glob('*'):z.write(p,'assets/'+p.name)
  z.write(ROOT/'build/out/annals/figures-pdf/pyramide.pdf','assets/pyramide.pdf')
 files={p.relative_to(ROOT/'dist').as_posix():hashlib.sha256(p.read_bytes()).hexdigest() for p in DEST.iterdir() if p.is_file()}
 RECEIPT.write_text(json.dumps({'sourceDigest':fingerprint(),'files':files},indent=2)+'\n')
def reuse_inputs():
 """Reuse compiled books only after verifying every typesetting input is identical.

 HTML conversion changes share a helper module with the PDF builder. Comparing
 the portable bundle's actual inputs avoids recompiling unchanged book editions.
 """
 rec=json.loads(RECEIPT.read_text())
 for name,sha in rec['files'].items():
  if hashlib.sha256((ROOT/'dist'/name).read_bytes()).hexdigest()!=sha:raise ValueError('Changed book output: '+name)
 config=json.loads((ROOT/'content/data/manifest.json').read_text())['annalsBank']
 with zipfile.ZipFile(DEST/'sources.zip') as z:
  if json.loads(z.read('index.json'))!=config:raise ValueError('Annales catalogue changed')
  for p in SOURCE.glob('*.tex'):
   body,_=helpers['graphics'](p.read_text(),p.stem)
   body=body.replace('./resources/annals/figures/','figures/').replace('.svg}', '.pdf}').replace(r'\includegraphics{figures/',r'\includegraphics[max width=\linewidth]{figures/')
   if z.read('units/'+p.name).decode()!=body:raise ValueError('Changed PDF unit: '+p.name)
  for p in CORE.glob('*'):
   if p.is_file() and z.read('core/'+p.name)!=p.read_bytes():raise ValueError('Changed PDF style: '+p.name)
  for p in (CORE/'fonts').glob('*'):
   if z.read('core/fonts/'+p.name)!=p.read_bytes():raise ValueError('Changed PDF font: '+p.name)
  for p in (SOURCE/'assets').glob('*'):
   if p.is_file() and z.read('assets/'+p.name)!=p.read_bytes():raise ValueError('Changed PDF asset: '+p.name)
  for p in DEST.glob('*.tex'):
   if not p.read_text().startswith(preamble()):raise ValueError('Changed book preamble: '+p.name)
   if z.read(p.name)!=p.read_bytes():raise ValueError('Changed book source: '+p.name)
 rec['sourceDigest']=fingerprint()
 RECEIPT.write_text(json.dumps(rec,indent=2)+'\n')
 print('All book typesetting inputs and outputs are identical; compiled PDFs retained.')

def check():
 r=json.loads(RECEIPT.read_text())
 if r['sourceDigest']!=fingerprint():raise ValueError('Annales PDF sources changed')
 for name,sha in r['files'].items():
  p=ROOT/'dist'/name
  if not p.is_file() or hashlib.sha256(p.read_bytes()).hexdigest()!=sha:raise ValueError('Stale annales PDF: '+name)
 print('Native annales books and complete LaTeX sources match.')
if __name__=='__main__':
 p=argparse.ArgumentParser();p.add_argument('--check',action='store_true');p.add_argument('--diagnose',action='store_true');p.add_argument('--reuse-inputs',action='store_true');a=p.parse_args();check() if a.check else reuse_inputs() if a.reuse_inputs else build()
