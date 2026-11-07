#!/usr/bin/env python3
"""Typeset the self-hosted annales bank from its attributed LaTeX units.

Pandoc preserves the question hierarchy and maths. Graphics and complex variation
or tabularray tables are compiled from the original TeX, then kept as local SVGs.
No upstream document is embedded or fetched by the reader. Build outputs are cached
by source bytes; --check verifies every published output against the build receipt.
"""
from pathlib import Path
import argparse, concurrent.futures, hashlib, html, json, os, re, shutil, subprocess, sys, zipfile, runpy
import pymupdf
ROOT=Path(__file__).resolve().parents[1]
SOURCE=ROOT/'content/tex/annals'
OUT=ROOT/'build/out/annals'
DEST=ROOT/'dist/resources/annals'
RECEIPT=ROOT/'content/data/annals-build.json'
CODE=runpy.run_path(str(ROOT/'scripts/annals-code.py'))
MACROS=r'''\newcommand{\R}{\mathbb{R}}
\newcommand{\N}{\mathbb{N}}
\newcommand{\Z}{\mathbb{Z}}
\newcommand{\Q}{\mathbb{Q}}
\newcommand{\D}{\mathbb{D}}
\newcommand{\C}{\mathbb{C}}
\newcommand{\e}{{\mathrm{e}}}
\newcommand{\vect}[1]{\overrightarrow{#1}}
\newcommand{\vectt}[1]{\overrightarrow{\mathrm{#1}}}
\newcommand{\vvt}[1]{\overrightarrow{\mathrm{#1}}}
\newcommand{\np}[2][]{{#2~#1}}
\newcommand{\vv}[1]{{\overrightarrow{#1}}}
\renewcommand{\d}{{\mathrm{d}}}
\newcommand{\degres}{{^\circ}}
\newcommand{\degre}{{^\circ}}
\newcommand{\blue}{\color{blue}}
\newcommand{\red}{\color{red}}
\newcommand{\enskip}{\quad}
\newcommand{\llbracket}{\lbrack\!\lbrack}
\newcommand{\rrbracket}{\rbrack\!\rbrack}
\newcommand{\euro}{{\text{€}}}
\newcommand{\no}{{\text{n°}}}
\newcommand{\interval}[2]{{[#1;#2]}}
\newcommand{\intervFO}[2]{{[#1;#2[}}
\newcommand{\dotfill}{\ldots}

\newcommand{\ds}{\displaystyle}
\newcommand{\textding}[1]{#1}
\newcommand{\Oij}{\(\mathrm{O};\vec{\imath},\vec{\jmath}\)}
\newcommand{\Oijk}{\(\mathrm{O};\vec{\imath},\vec{\jmath},\vec{k}\)}
\newcommand{\Ouv}{\(\mathrm{O};\vec{u},\vec{v}\)}
'''
TEXT_MACROS=r'''\newcommand{\intervFF}[2]{\ensuremath{[#1;#2]}}
'''
TEX_PATCHES=r'''\renewcommand{\euro}{\ifmmode\text{\texteuro}\else\texteuro\fi}
\DeclareUnicodeCharacter{00B0}{\ifmmode^{\circ}\else\textdegree\fi}
\DeclareUnicodeCharacter{20AC}{\ifmmode\text{\texteuro}\else\texteuro\fi}
'''
PREAMBLE=r'''\documentclass[10pt]{article}
\usepackage[T1]{fontenc}
\usepackage[utf8]{inputenc}
\usepackage[french]{babel}
\usepackage{amsmath,amssymb,mathrsfs,mathpazo}
\usepackage{geometry}
\geometry{paperwidth=40cm,paperheight=50cm,left=1cm,textwidth=17cm,top=1cm,textheight=48cm}
\usepackage{graphicx,array,tabularx,tabularray,colortbl,multirow,multicol,booktabs,enumitem,pifont,ulem,fancybox,diagbox,cancel}
\usepackage{pstricks,pstricks-add,pst-plot,pst-tree,pst-node,pst-text,pst-func,pst-math,pst-bspline,pst-3dplot,pst-eucl,pst-solides3d}
\let\pscalculate\undefined
\usepackage{pst-bezier}
\usepackage{tikz,pgfplots,tkz-tab}
\usetikzlibrary{arrows,arrows.meta,patterns,calc,positioning,trees,decorations.markings,shapes.geometric,shapes.misc,shapes.arrows,intersections,decorations.pathmorphing,decorations.pathreplacing,backgrounds,shadows,babel}
\pgfplotsset{compat=1.18}
\usepgfplotslibrary{fillbetween}
\usepackage[np]{numprint}
\usepackage{listings,makecell,pas-tableur,twoopt}
\let\barre\undefined
\usepackage[pstricks]{tablvar}
\definecolor{darkgreen}{RGB}{0,100,0}
\providecommand{\red}{\color{red}}
\providecommand{\blue}{\color{blue}}
\providecommand{\green}{\color{green}}
\providecommand{\black}{\color{black}}
\providecommand{\white}{\color{white}}
\providecommand{\gray}{\color{gray}}
\providecommand{\cyan}{\color{cyan}}
\providecommand{\magenta}{\color{magenta}}
\providecommand{\yellow}{\color{yellow}}
\providecommand{\violet}{\color{violet}}
\providecommand{\orange}{\color{orange}}
\providecommand{\euro}{\texteuro}
\providecommand{\EUR}{\texteuro}
\providecommand{\ieme}{\textsuperscript{e}}
\providecommand{\degres}{\ensuremath{^\circ}}
\providecommand{\degree}{\ensuremath{^\circ}}
\providecommand{\vv}[1]{\overrightarrow{#1}}
\providecommand{\Coord}[1]{#1}
\providecommand{\decosix}{}
\providecommand{\starredbullet}{\ensuremath{\bullet}}
\pagestyle{empty}
\setlength{\parindent}{0pt}
'''
# Convert a complete complex layout ancestor when a graphic lives inside it.
GRAPH={'pspicture','pspicture*','tikzpicture','tblr','tablvar'}
CONTAINERS={'center','tabular','tabularx','array'}
ENV=re.compile(r'\\(begin|end)\{([^}]+)\}')
def digest(path):return hashlib.sha256(path.read_bytes()).hexdigest()
def source_digest():
 h=hashlib.sha256(Path(__file__).read_bytes())
 h.update((ROOT/'scripts/annals-code.py').read_bytes())
 for p in sorted(p for p in SOURCE.rglob('*') if p.is_file()):h.update(p.name.encode());h.update(p.read_bytes())
 h.update(json.dumps(json.loads((ROOT/'content/data/manifest.json').read_text())['annalsBank'],sort_keys=True).encode())
 return h.hexdigest()
def math_ranges(text):
 """Find math regions without mistaking nested dollar signs in TeX text groups for delimiters."""
 result=[];i=0
 while i<len(text):
  if text.startswith('\\\\',i):i+=2;continue
  if text.startswith('\\begin{verbatim}',i) or text.startswith('\\begin{lstlisting}',i):
   name='verbatim' if text.startswith('\\begin{verbatim}',i) else 'lstlisting';end=text.find('\\end{'+name+'}',i);i=len(text) if end<0 else end+len(name)+6;continue
  if text.startswith('\\[',i) or text.startswith('\\(',i):
   close='\\]' if text[i+1]=='[' else '\\)';end=text.find(close,i+2)
   if end>=0:result.append((i,end+2));i=end+2;continue
  if text.startswith('$$',i):
   end=text.find('$$',i+2)
   if end>=0:result.append((i,end+2));i=end+2;continue
  if text[i]=='$' and (len(re.search(r'\\*$',text[:i])[0])%2==0):
   j=i+1;depth=0
   while j<len(text):
    if text[j]=='\\':j+=2;continue
    if text[j]=='{':depth+=1
    elif text[j]=='}':depth-=1
    elif text[j]=='$' and depth==0:break
    j+=1
   if j<len(text):result.append((i,j+1));i=j+1;continue
  i+=1
 return result

def normalise_inline_math(text):
 text=re.sub(r'\\aligned\b',r'\\begin{aligned}',text)
 text=re.sub(r'\\endaligned\b',r'\\end{aligned}',text)
 for start,end in reversed(math_ranges(text)):
  chunk=text[start:end]
  if chunk.startswith('$') and not chunk.startswith('$$'):left=right='$'
  elif chunk.startswith(r'\('):left,right=r'\(',r'\)'
  else:continue
  body=chunk[len(left):-len(right)];stack=[];needs=False
  for m in re.finditer(r'\\begin\{([^}]+)\}|\\end\{([^}]+)\}|\\\\',body):
   if m[1]:stack.append(m[1])
   elif m[2]:
    if stack:stack.pop()
   elif not stack:needs=True
  if needs:text=text[:start]+left+r'\begin{gathered}'+body+r'\end{gathered}'+right+text[end:]
 return text

def graphics(text,ident):
 stack=[];blocks=[];maths=math_ranges(text)

 for m in ENV.finditer(text):
  action,name=m.groups()
  if action=='begin':stack.append((name,m.start()))
  else:
   if not stack:continue
   found=next((i for i in range(len(stack)-1,-1,-1) if stack[i][0]==name),None)
   if found is None:continue
   start=stack[found][1];stack=stack[:found]
   chunk=text[start:m.end()]
   if 'MXANNALCODE' in chunk:continue
   if name in {'array','tablvar'} and any(parent in CONTAINERS for parent,_ in stack):continue
   if name in GRAPH or (name in CONTAINERS and re.search(r'\\(?:pstree|ps(?:line|dots|plot|Cancel)|[Rr]node|ncline|multicolumn|rowcolor)|\\begin\{(?:pspicture\*?|tikzpicture|tblr|tablvar)\}',chunk)):
    end=m.end()
    outer=next(((a,b) for a,b in maths if a<=start and b>=end),None) if name in {'array','tablvar'} else None
    if outer:start,end=outer;chunk=text[start:end]
    elif name=='tablvar':chunk='$'+chunk+'$'
    blocks.append((start,end,chunk))
 # Some APMEP trees are bare macros in a minipage, without a graphics environment.
 for m in re.finditer(r'\\pstree\b',text):
  if any(a<=m.start()<b for a,b,_ in blocks):continue
  cursor=m.end()
  while cursor<len(text) and text[cursor].isspace():cursor+=1
  if cursor<len(text) and text[cursor]=='[':
   stop=text.find(']',cursor)
   if stop<0:continue
   cursor=stop+1
  valid=True
  for _ in range(2):
   while cursor<len(text) and text[cursor].isspace():cursor+=1
   if cursor>=len(text) or text[cursor]!='{':valid=False;break
   depth=1;cursor+=1
   while cursor<len(text) and depth:
    if text[cursor]=='\\':cursor+=2;continue
    if text[cursor]=='{':depth+=1
    elif text[cursor]=='}':depth-=1
    cursor+=1
  if valid:blocks.append((m.start(),cursor,text[m.start():cursor]))
 blocks=list({(b[0],b[1]):b for b in blocks}.values())
 # Keep only outer blocks, so a node graph in a table is never separated from its nodes.
 blocks=[b for b in blocks if not any(a[0]<=b[0] and a[1]>=b[1] and a!=b for a in blocks)]
 tasks=[]
 for i,(start,end,chunk) in enumerate(sorted(blocks)):
  settings='\n'.join(line for line in text[:start].splitlines() if re.match(r'^\\(?:psset|def|definecolor)\b',line.strip()))
  chunk=settings+'\n'+chunk
  key=hashlib.sha256((re.sub(r'\\\\(?:usetikzlibrary|usepgfplotslibrary)\{[^}]*\}','',PREAMBLE)+MACROS+chunk+(TEX_PATCHES if re.search(r'\\euro\b|[€°]',chunk) else '')).encode()).hexdigest()[:20]
  tasks.append({'key':key,'tex':chunk,'source':ident})
 for (start,end,chunk),task in reversed(list(zip(sorted(blocks),tasks))):
  text=text[:start]+'\\includegraphics{./resources/annals/figures/'+task['key']+'.svg}'+text[end:]
 return text,tasks

def unwrap_tables(text):
 pattern=re.compile(r'\\texttt\{')
 for m in reversed(list(pattern.finditer(text))):
  depth=1;i=m.end()
  while i<len(text) and depth:
   if text[i] in '{}'.replace(' ','') and (i==0 or text[i-1]!='\\'):
    depth+=1 if text[i]=='{' else -1
   i+=1
  body=text[m.end():i-1]
  if re.search(r'\\begin\{(?:tabular|tabularx|tblr|center)\}',body):text=text[:m.start()]+body+text[i:]
 return text

def strip_twoopt(text):
 for m in reversed(list(re.finditer(r'\\newcommandtwoopt\s*\{[^}]*\}(?:\[[^\]]*\])*\s*\{',text))):
  depth=1;i=m.end()
  while i<len(text) and depth:
   if text[i]=='\\':i+=2;continue
   if text[i]=='{':depth+=1
   elif text[i]=='}':depth-=1
   i+=1
  text=text[:m.start()]+text[i:]
 return text

def expand_boxes(text):
 """Pandoc drops fbox; preserve its contents and its emphasis as a quotation block."""
 maths=math_ranges(text)
 for m in reversed(list(re.finditer(r'\\(fbox|fcolorbox|colorbox|framebox|ovalbox|shadowbox|doublebox)\b',text))):
  command=m[1]
  if any(a<=m.start()<b for a,b in maths):
   if command=='fbox':text=text[:m.start()]+r'\boxed'+text[m.end():]
   continue
  cursor=m.end()
  while cursor<len(text) and text[cursor].isspace():cursor+=1
  while cursor<len(text) and text[cursor]=='[':
   end=text.find(']',cursor)
   if end<0:break
   cursor=end+1
  count=3 if command=='fcolorbox' else 2 if command=='colorbox' else 1
  args=[]
  for _ in range(count):
   while cursor<len(text) and text[cursor].isspace():cursor+=1
   if cursor>=len(text) or text[cursor]!='{':break
   start=cursor+1;cursor+=1;depth=1
   while cursor<len(text) and depth:
    if text[cursor]=='\\':cursor+=2;continue
    if text[cursor]=='{':depth+=1
    elif text[cursor]=='}':depth-=1
    cursor+=1
   args.append(text[start:cursor-1])
  if len(args)==count:text=text[:m.start()]+'\n'+r'\begin{quote}'+'\n'+args[-1]+'\n'+r'\end{quote}'+'\n'+text[cursor:]
 return text

def _group(text,i):
 """End index (exclusive) of the balanced {...} group starting at text[i]."""
 depth=0
 for j in range(i,len(text)):
  if text[j]=='{' and text[j-1:j]!='\\':depth+=1
  elif text[j]=='}' and text[j-1:j]!='\\':
   depth-=1
   if depth==0:return j+1
 return -1

def generic_lists_to_itemize(text):
 out=[];pos=0;key='\\begin{list}'
 while True:
  k=text.find(key,pos)
  if k<0:break
  a=k+len(key);b=_group(text,a) if text[a:a+1]=='{' else -1
  c=_group(text,b) if b>0 and text[b:b+1]=='{' else -1
  if c<0:out.append(text[pos:a]);pos=a;continue
  intro=re.sub(r'\\(?:setlength|addtolength)\{[^{}]*\}\{[^{}]*\}|\\(?:itemsep|leftmargin|labelsep|topsep|parsep|partopsep|labelwidth|rightmargin|itemindent|listparindent)\S*|\\(?:hspace|vspace)\*?\{[^{}]*\}','',text[b+1:c-1]).strip()
  if not re.search(r'[A-Za-zÀ-ÿ]{3,}',re.sub(r'\\[A-Za-z]+','',intro)):intro=''
  out.append(text[pos:k]+(intro+'\n\n' if intro else '')+'\\begin{itemize}');pos=c
 out.append(text[pos:])
 return ''.join(out).replace('\\end{list}','\\end{itemize}')

def simplify_column_specs(text):
 """Pandoc leaves the cells empty when an X column carries a >{...} prefix: keep only the alignment."""
 out=[];pos=0;key='\\begin{tabularx}'
 while True:
  k=text.find(key,pos)
  if k<0:break
  a=k+len(key)
  if text[a:a+1]!='{':out.append(text[pos:a]);pos=a;continue
  b=_group(text,a)
  if b<0 or text[b:b+1]!='{':out.append(text[pos:a]);pos=a;continue
  c=_group(text,b)
  if c<0:out.append(text[pos:a]);pos=a;continue
  spec=text[b+1:c-1]
  def strip(sp):
   res='';n=0
   while n<len(sp):
    if sp[n]=='>' and sp[n+1:n+2]=='{':
     e=_group(sp,n+1);prefix=sp[n+2:e-1]
     if '$' in prefix:res+=sp[n:e];n=e;continue
     n=e
     nxt=sp[n:n+1]
     if nxt in ('X','l','c','r'):
      res+=('l' if 'raggedright' in prefix else 'r' if 'raggedleft' in prefix else 'c') if nxt=='X' else nxt;n+=1
     continue
    if sp[n]=='*' :
     m=re.match(r'\*(\d+)\{',sp[n:])
     if m:
      e=_group(sp,n+m.end()-1);res+=strip(sp[n+m.end():e-1])*int(m[1]);n=e;continue
    res+=sp[n];n+=1
   return res
  out.append(text[pos:b+1]+strip(spec)+'}');pos=c
 out.append(text[pos:])
 return ''.join(out)

def prepare_tex(text):
 text=expand_boxes(strip_twoopt(text))
 for a,b in reversed(math_ranges(text)):
  chunk=text[a:b].replace(r'\ensuremath','')
  chunk=chunk.replace(r'\emph{',r'\text{')
  chunk=re.sub(r'\\(?:og|guillemotleft)\b(?:\{\})?','«',chunk)
  chunk=re.sub(r'\\(?:fg|guillemotright)\b(?:\{\})?','»',chunk)
  chunk=re.sub(r'\\up\{([^{}]*)\}',lambda m:'^{'+r'\mathrm{'+m[1]+'}}',chunk)
  chunk=chunk.replace(r'\up', '^')
  chunk=re.sub(r'\\vspace\*?\{[^}]*\}','',chunk)
  text=text[:a]+chunk+text[b:]
 text=text.replace('\\hspace*','\\hspace').replace('\\num{','\\np{')
 text=text.replace('\\vline','\\vert')
 # Strip purely visual spacing/colour declarations outside figures before the semantic conversion.
 text=re.sub(r'\\psset\{[^\n]*\}','',text)
 text=re.sub(r'\\begin\{multicols\}\{\d+\}|\\end\{multicols\}','',text)
 text=re.sub(r'\\begin\{(?:python|ttfamily)\}',r'\\begin{verbatim}',text)
 text=re.sub(r'\\end\{(?:python|ttfamily)\}',r'\\end{verbatim}',text)
 text=re.sub(r'\\begin\{color\}\{[^}]*\}|\\end\{color\}','',text)
 text=text.replace('\\numprint','\\np')
 text=re.sub(r'\\includegraphics(?:\[[^\]]*\])?\{pyramide\}',r'\\includegraphics{./resources/annals/figures/pyramide.svg}',text)
 # Pandoc silently drops the content of a generic list nested in an item: make it a plain itemize.
 text=generic_lists_to_itemize(text)
 text=simplify_column_specs(text)
 text=unwrap_tables(text)
 return text

def to_html(job):
 from bs4 import BeautifulSoup
 ident,question,solution=job;result={'id':ident};tasks=[]
 for key,text in [('question',question),('solution',solution)]:
  if not text:result[key]='';continue
  text,code=CODE['protect_code'](unwrap_tables(text))
  text,figs=graphics(text,ident);tasks+=figs
  run=subprocess.run(['pandoc','-f','latex','-t','html5','--mathjax','--wrap=none'],input=MACROS+TEXT_MACROS+prepare_tex(text),text=True,capture_output=True)
  if run.returncode:
   result[key]='';result.setdefault('errors',[]).append(key+': '+run.stderr[-500:]);continue
  soup=BeautifulSoup(run.stdout,'html.parser')
  allowed={'p','span','em','strong','b','i','ol','ul','li','table','thead','tbody','tfoot','tr','th','td','div','pre','code','sub','sup','img','br','del','u','s','caption','blockquote','dl','dt','dd','hr','h2','h3','h4','h5','h6'}
  for tag in list(soup.find_all(True)):
   if tag.name not in allowed:tag.unwrap();continue
   tag.attrs={k:v for k,v in tag.attrs.items() if k in ['class','start','colspan','rowspan','src','alt']}
   if tag.name=='img':
    if not tag.get('src','').startswith('./resources/annals/figures/'):raise ValueError(ident+': unexpected image source')
    tag['alt']='Figure ou tableau du sujet original';tag['loading']='lazy'
   # Pandoc's layout groups sometimes leave their width argument as a standalone number.
  try:CODE['restore_code'](soup,code)
  except ValueError as error:raise ValueError(ident+' '+key+': '+str(error)) from error
  result[key]=str(soup)
 return result,tasks

def compile_figures(tasks):
 unique={t['key']:t for t in tasks};pending=[t for k,t in unique.items() if not (DEST/'figures'/f'{k}.svg').exists() or not (OUT/'figures-pdf'/f'{k}.pdf').exists()]
 pending.sort(key=lambda t:bool(re.search(r'\\(?:begin\{(?:pspicture|tablvar)|pstree|rput|uput|[Rr]node|ncline)',t['tex'])))
 (DEST/'figures').mkdir(parents=True,exist_ok=True)
 (OUT/'figures-pdf').mkdir(parents=True,exist_ok=True)
 # A short batch makes errors traceable and bounds the TeX memory use.
 groups=[[t for t in pending if bool(re.search(r'\\(?:begin\{(?:pspicture|tablvar)|pstree|rput|uput|[Rr]node|ncline)',t['tex']))==flag] for flag in [False,True]]
 batches=[group[start:start+15] for group in groups for start in range(0,len(group),15)]
 done=0
 def render_batch(job):
  batch_no,batch=job
  start=batch_no*15;work=OUT/('figures-'+str(batch_no));work.mkdir(parents=True,exist_ok=True)
  dvi=any(re.search(r'\\(?:begin\{(?:pspicture|tablvar)|pstree|rput|uput|[Rr]node|ncline)',t['tex']) for t in batch)
  base=PREAMBLE if dvi else '\n'.join(line for line in PREAMBLE.splitlines() if not any(x in line for x in ['{pstricks,','{pst-bezier}','[pstricks]{tablvar}']))+'\n'+r'\usepackage[tikz]{tablvar}'+r'\providecommand{\psset}[1]{}'
  text=base+('\\usepackage{adjustbox}\n' if any('adjustbox' in t['tex'] for t in batch) else '')+MACROS.replace(r'\newcommand',r'\providecommand')+TEX_PATCHES+r'\begin{document}'+'\n'
  for t in batch:
   text+='\\clearpage\\typeout{MXFIG:'+t['key']+':\\thepage}\n\\begingroup\\psset{unit=1cm}\n'+re.sub(r'\n\s*\n','\n',t['tex'])+'\n\\par\\endgroup\n'
  text+='\\clearpage\\end{document}\n';(work/'figures.tex').write_text(text)
  cmds=[['latex' if dvi else 'pdflatex','-interaction=nonstopmode','-halt-on-error','-no-shell-escape','figures.tex']]
  if dvi:cmds += [['dvips','-q','-o','figures.ps','figures.dvi'],['ps2pdf','-dALLOWPSTRANSPARENCY','figures.ps','figures.pdf']]
  for cmd in cmds:
   r=subprocess.run(cmd,cwd=work,capture_output=True,text=True,errors='replace')
   if r.returncode:raise RuntimeError('Graphics batch '+str(batch_no)+' '+r.stdout[-1700:]+r.stderr[-700:])
  log=(work/'figures.log').read_text(errors='replace')
  markers=re.findall(r'MXFIG:([0-9a-f]+):(\d+)',log)
  with pymupdf.open(work/'figures.pdf') as doc:
   for k,page_no in markers:
    page=doc[int(page_no)-1];boxes=[pymupdf.Rect(item[1]) for item in page.get_bboxlog() if item[0]!='ignore-text']
    if not boxes:raise ValueError('Empty graphic '+k)
    box=boxes[0]
    for b in boxes[1:]:box|=b
    box=(box+(-4,-4,4,4))&page.rect;page.set_cropbox(box)
    figure=pymupdf.open();figure.insert_pdf(doc,from_page=int(page_no)-1,to_page=int(page_no)-1);figure[0].set_cropbox(box);figure.set_metadata({});figure.del_xml_metadata();figure.save(OUT/'figures-pdf'/f'{k}.pdf',garbage=4,deflate=True);figure.close()
    svg=page.get_svg_image(text_as_path=True)
    (DEST/'figures'/f'{k}.svg').write_text(svg)
  print('Figures batch',batch_no+1,'/',len(batches),flush=True)
 with concurrent.futures.ThreadPoolExecutor(max_workers=3) as pool:list(pool.map(render_batch,enumerate(batches)))

def build():
 config=json.loads((ROOT/'content/data/manifest.json').read_text())['annalsBank']
 (DEST/'figures').mkdir(parents=True,exist_ok=True)
 r=subprocess.run(['gs','-q','-dBATCH','-dNOPAUSE','-dEPSCrop','-sDEVICE=pdfwrite','-sOutputFile=/tmp/annals-pyramide.pdf',str(SOURCE/'assets/pyramide.eps')],capture_output=True)
 if r.returncode:raise RuntimeError('Pyramid figure conversion failed')
 (OUT/'figures-pdf').mkdir(parents=True,exist_ok=True)
 shutil.copy2('/tmp/annals-pyramide.pdf',OUT/'figures-pdf/pyramide.pdf')
 with pymupdf.open('/tmp/annals-pyramide.pdf') as doc:(DEST/'figures/pyramide.svg').write_text(doc[0].get_svg_image())
 OUT.mkdir(parents=True,exist_ok=True);DEST.mkdir(parents=True,exist_ok=True)
 jobs=[]
 for r in config['records']:
  q=(SOURCE/(r['id']+'.tex')).read_text();c=SOURCE/(r['id']+'.cor.tex')
  jobs.append((r['id'],q,c.read_text() if c.exists() else ''))
 records=[];tasks=[]
 with concurrent.futures.ThreadPoolExecutor(max_workers=6) as pool:
  for i,(r,figs) in enumerate(pool.map(to_html,jobs)):
   records.append(r);tasks+=figs
   if i%100==0:print('HTML',i,'/',len(jobs),flush=True)
 errors=[r for r in records if r.get('errors')]
 (OUT/'parse-errors.json').write_text(json.dumps(errors,ensure_ascii=False,indent=2))
 if errors:raise RuntimeError('Semantic conversion errors: '+', '.join(r['id'] for r in errors))
 (OUT/'html.json').write_text(json.dumps(records,ensure_ascii=False))
 (OUT/'figures.json').write_text(json.dumps(tasks,ensure_ascii=False))
 compile_figures(tasks)
 keep={t['key'] for t in tasks}|{'pyramide'}
 for old in (DEST/'figures').glob('*.svg'):
  if old.stem not in keep:old.unlink()
 for old in (DEST/'figures').glob('*.pdf'):old.unlink()
 by_id={r['id']:r for r in records}
 for r in config['records']:
  target=DEST/(r['id']+'.json');target.write_text(json.dumps(by_id[r['id']],ensure_ascii=False,separators=(',',':'))+'\n')
  # The downloadable unit includes its full typesetting preamble and original mathematical content.
  for correction,suffix in [(False,''),(True,'.cor')]:
   source=SOURCE/(r['id']+suffix+'.tex')
   if not source.exists():continue
   tex=PREAMBLE.replace(r'\geometry{paperwidth=40cm,paperheight=50cm,left=1cm,textwidth=17cm,top=1cm,textheight=48cm}',r'\geometry{a4paper,margin=2cm}')+r'\usepackage{adjustbox}\DeclareUnicodeCharacter{2236}{:}\DeclareUnicodeCharacter{2190}{\ensuremath{\leftarrow}}'+'\n'+(MACROS+TEXT_MACROS).replace(r'\newcommand',r'\providecommand')+TEX_PATCHES+'% '+config['credit']+'\n% '+config['license']+' : '+config['terms']+'\n% '+(r['correctionURL'] if correction else r['sourceURL'])+'\n'+r'\begin{document}'+'\n'+r'\noindent\textit{APMEP / CoopMaths. CC BY-SA. Présentation adaptée par Maths Explorer.}\par\medskip'+'\n'+source.read_text()+'\n\\end{document}\n'
   (DEST/(r['id']+suffix+'.tex')).write_text(tex)
 meta={**config,'records':[{**r,'content':'./resources/annals/'+r['id']+'.json'} for r in config['records']]}
 (DEST/'index.json').write_text(json.dumps(meta,ensure_ascii=False,indent=2)+'\n')
 with zipfile.ZipFile(DEST/'sources.zip','w',zipfile.ZIP_DEFLATED) as bundle:
  bundle.writestr('ATTRIBUTION.txt',config['credit']+'\n'+config['license']+'\n'+config['terms']+'\n')
  for p in DEST.glob('*.tex'):bundle.write(p,p.name)
  bundle.write(SOURCE/'assets/pyramide.eps','pyramide.eps')
 files={p.relative_to(ROOT/'dist').as_posix():digest(p) for p in DEST.rglob('*') if p.is_file() and 'books' not in p.relative_to(DEST).parts}
 RECEIPT.write_text(json.dumps({'sourceDigest':source_digest(),'files':files},indent=2)+'\n')
 print('Published',len(records),'locally typeset exercises;',len(set(t['key'] for t in tasks)),'graphics',flush=True)
def build_html():
 """Refresh semantic HTML while reusing the already published vector figures."""
 config=json.loads((ROOT/'content/data/manifest.json').read_text())['annalsBank']
 expected={**config,'records':[{**r,'content':'./resources/annals/'+r['id']+'.json'} for r in config['records']]}
 if json.loads((DEST/'index.json').read_text())!=expected:raise ValueError('Catalogue changed; run a full annales build')
 for source in SOURCE.glob('*.tex'):
  published=DEST/source.name
  if not published.exists() or not published.read_text().endswith(source.read_text()+'\n\\end{document}\n'):
   raise ValueError('Typesetting source changed; run a full annales build: '+source.name)
 previous=json.loads(RECEIPT.read_text())
 for name,sha in previous['files'].items():
  if digest(ROOT/'dist'/name)!=sha:raise ValueError('Changed published annales output: '+name)
 records=[]
 def convert(r):
  path=SOURCE/(r['id']+'.cor.tex')
  return to_html((r['id'],(SOURCE/(r['id']+'.tex')).read_text(),path.read_text() if path.exists() else ''))
 with concurrent.futures.ThreadPoolExecutor(max_workers=6) as pool:
  for result,tasks in pool.map(convert,config['records']):
   if result.get('errors'):raise ValueError(result['errors'])
   for task in tasks:
    if not (DEST/'figures'/(task['key']+'.svg')).exists():raise ValueError('New figure requires a full annales build: '+task['key'])
   records.append(result)
 # Do not partially publish a conversion that failed or requires new graphics.
 for result in records:
  (DEST/(result['id']+'.json')).write_text(json.dumps(result,ensure_ascii=False,separators=(',',':'))+'\n')
 rec=json.loads(RECEIPT.read_text())
 rec['sourceDigest']=source_digest()
 rec['files']={name:digest(ROOT/'dist'/name) for name in rec['files']}
 RECEIPT.write_text(json.dumps(rec,indent=2)+'\n')
 print('Refreshed HTML for',len(records),'exercises; vector figures and source downloads retained.')

def check():
 rec=json.loads(RECEIPT.read_text())
 if rec['sourceDigest']!=source_digest():raise ValueError('Annales sources changed; rebuild')
 for name,sha in rec['files'].items():
  path=ROOT/'dist'/name
  if not path.is_file() or digest(path)!=sha:raise ValueError('Stale annales output: '+name)
 print('Annales sources, structure and all local downloads match.')
if __name__=='__main__':
 p=argparse.ArgumentParser();p.add_argument('--check',action='store_true');p.add_argument('--figures-only',action='store_true');p.add_argument('--html-only',action='store_true');args=p.parse_args()
 if args.check:check()
 elif args.html_only:build_html()
 elif args.figures_only:compile_figures(json.loads((OUT/'figures.json').read_text()))
 else:build()
