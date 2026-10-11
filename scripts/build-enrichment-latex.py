"""Typeset the authored bilingual workshops with XeLaTeX, without shell escape.

Source prose is retained. Mathematical islands use native TeX fractions,
indices, powers and radicals. Generated .tex files and the shared style are
versioned; build products/logs stay outside the published resource directory.
"""
import argparse,concurrent.futures,hashlib,json,re,shutil,subprocess,tempfile
from pathlib import Path
from enrichment_sections import sections
ROOT=Path(__file__).resolve().parents[1]
SOURCE=ROOT/'content/tex/courses/enrichment';SOURCE.mkdir(parents=True,exist_ok=True)
OUT=ROOT/'dist/resources/enrichment'
labels={'notes':['Leçon et méthode','Lesson and method'],'exercises':['Exercices progressifs','Progressive exercises'],'problems':['Problème de synthèse','Synthesis problem'],'solutions':['Solutions détaillées','Worked solutions']}
special={'\\':r'\textbackslash{}','&':r'\&','%':r'\%','$':r'\$','#':r'\#','_':r'\_','{':r'\{','}':r'\}'}
def text(s):return ''.join(special.get(c,c) for c in s).replace('–','--').replace('—','---')
sup=str.maketrans('⁰¹²³⁴⁵⁶⁷⁸⁹ⁿ⁺⁻','0123456789n+-')
sub=str.maketrans('₀₁₂₃₄₅₆₇₈₉ₙₖ₊₋','0123456789nk+-')
# Only mathematical tokens are accepted, not arbitrary prose words.
atom=r'(?:PGCD|gcd|RR|ab|ix|iz|[αβΔΣℝℤ√]|[a-zA-Z](?![a-zA-ZÀ-ž])|\d+(?:[.,]\d+)?)[²³⁰¹⁴⁵⁶⁷⁸⁹ⁿ₀-₉ₙₖ₊₋⁺⁻′]*'
word=r'(?:rouge|rouges|red|bleue|blue|non|not|chess|puzzles)(?![a-zA-ZÀ-ž])'
island=re.compile(r'(?<![\wÀ-ž])(?:[([])*'+atom+r'(?:[ \t]*(?:[=<>≤≥≠≡+−×·*/^|()\[\],∩²³⁰¹⁴⁵⁶⁷⁸⁹ⁿ₀-₉ₙₖ₊₋⁺⁻′]|'+atom+'|'+word+r'))*(?![\wÀ-ž])')
def math(s):
 s=re.sub(word,lambda m:r'\mathrm{'+m[0]+'}',s)
 s=re.sub(r'(\d)\s+m(?=[^a-zA-Z]|$)',lambda m:m[1]+r'\,\mathrm{m}',s)
 s=s.strip().replace('−','-').replace('×',r'\times ').replace('·',r'\cdot ').replace('≤',r'\leq ').replace('≥',r'\geq ').replace('≠',r'\neq ').replace('≡',r'\equiv ').replace('ℝ',r'\mathbb{R}').replace('ℤ',r'\mathbb{Z}').replace('α',r'\alpha ').replace('β',r'\beta ').replace('Δ',r'\Delta ').replace('Σ',r'\sum ').replace('∩',r'\cap ')
 s=re.sub(r'[²³⁰¹⁴⁵⁶⁷⁸⁹ⁿ⁺⁻]+',lambda m:'^{'+m[0].translate(sup)+'}',s)
 s=re.sub(r'[₀-₉ₙₖ₊₋]+',lambda m:'_{'+m[0].translate(sub)+'}',s).replace('′',"'")
 s=re.sub(r'√\(([^()]*)\)',lambda m:r'\sqrt{'+m[1]+'}',s)
 s=re.sub(r'√([a-zA-Z]|\d+)',lambda m:r'\sqrt{'+m[1]+'}',s)
 # Parse adjacent atoms/groupings on each side of a slash, inside out.
 while '/' in s:
  i=s.index('/');l=i-1
  while l>=0 and s[l]==' ':l-=1
  end=l+1
  def leftstart(pos):
   if pos>=0 and s[pos] in ')]}':
    close=s[pos];opening={')':'(',']':'[','}':'{'}[close];depth=1;pos-=1
    while pos>=0 and depth:
     depth+=(s[pos]==close)-(s[pos]==opening);pos-=1
    start=pos+1
    if start>0 and s[start-1] in '^_':return leftstart(start-2)
    if start>0 and s[start-1] in 'fPC':start-=1
    return start
   while pos>=0 and (s[pos].isalnum() or s[pos]=='_'):pos-=1
   return pos+1
  start=leftstart(l)
  r=i+1
  while r<len(s) and s[r]==' ':r+=1
  ds=r
  if r<len(s) and s[r] in '([{':
   opening=s[r];close={'(':')','[':']','{':'}'}[opening];depth=1;r+=1
   while r<len(s) and depth:
    depth+=(s[r]==opening)-(s[r]==close);r+=1
  else:
   while r<len(s) and (s[r].isalnum() or s[r]=='_'):r+=1
   if r<len(s) and s[r]=='(':
    depth=1;r+=1
    while r<len(s) and depth:
     depth+=(s[r]=='(')-(s[r]==')');r+=1
   if r<len(s) and s[r]=='^':
    r+=1
    if r<len(s) and s[r]=='{':r=s.index('}',r)+1
  if start==end or ds==r: s=s[:i]+r'\mathbin{/}'+s[i+1:];break
  a,b=s[start:end],s[ds:r]
  if a[:1] in '([' and a[-1:] in ')]':a=a[1:-1]
  if b[:1] in '([' and b[-1:] in ')]':b=b[1:-1]
  s=s[:start]+r'\frac{'+a+'}{'+b+'}'+s[r:]
 return s
def prose(s):
 result=[];cursor=0
 for m in island.finditer(s):
  value=m[0].rstrip();valid=any(c in value for c in '=<>≤≥≠≡+−×·*/^|²³ⁿₙₖ√Σαβℝℤ') or any(c in value for c in '₀₁₂₃₄₅₆₇₈₉')
  if not valid:continue
  # Do not absorb trailing delimiters that belong to the sentence.
  value=value.rstrip(',');value=re.sub(r'\s+[a-zA-Z]$','',value) if s[m.start()+len(value):].startswith(('’',"'")) else value;delta=value.count(')')-value.count('(')
  while delta>0 and value.endswith(')'):value=value[:-1];delta-=1
  result.append(text(s[cursor:m.start()]));result.append(r'\('+math(value)+r'\)');cursor=m.start()+len(value)
 result.append(text(s[cursor:]));return ''.join(result)
STYLE=r'''\NeedsTeXFormat{LaTeX2e}
\ProvidesPackage{explorer}[2026/10/08 Maths Explorer documents]
\RequirePackage{fontspec,unicode-math,geometry,xcolor,fancyhdr,titlesec,needspace,microtype,tikz}
\setmainfont{DejaVu Sans}[Scale=.92]
\setsansfont{DejaVu Sans}[Scale=.92]
\setmathfont{Latin Modern Math}
\geometry{a4paper,left=19mm,right=19mm,top=23mm,bottom=21mm,headheight=15pt,headsep=8mm}
\definecolor{ink}{HTML}{14233E}\definecolor{mint}{HTML}{176754}\definecolor{violet}{HTML}{66529B}
\color{ink}\setlength{\parindent}{0pt}\setlength{\parskip}{7pt}
\setlength{\emergencystretch}{2em}\linespread{1.12}
\pagestyle{fancy}\fancyhf{}\fancyhead[L]{\sffamily\bfseries\small\textcolor{mint}{MATHS EXPLORER}}
\fancyhead[R]{\sffamily\small\textcolor{violet}{\ExplorerLanguage\ /\ \ExplorerNumber}}
\fancyfoot[L]{\scriptsize\ExplorerKind}\fancyfoot[R]{\scriptsize\thepage}
\renewcommand{\headrulewidth}{.8pt}\renewcommand{\footrulewidth}{.3pt}
\titleformat{\section}{\large\bfseries\color{mint}}{}{0pt}{}
\titlespacing*{\section}{0pt}{12pt}{5pt}
\newcommand{\ExplorerSection}[1]{\Needspace{5\baselineskip}\section*{#1}}
\newcommand{\ExplorerTitle}[2]{{\small\color{violet}#1\par}\vspace{5pt}{\fontsize{24}{29}\selectfont\bfseries #2\par}\vspace{6pt}{\color{violet}\ExplorerKind\par}\vspace{8pt}}
'''
FIGURES={
 'complex-rotations':r'\begin{tikzpicture}[scale=.85]\draw[->,gray](-.5,0)--(3,0) node[right]{$x$};\draw[->,gray](0,-.5)--(0,3) node[above]{$y$};\draw[mint,thick](2,0)--(2,2)--(0,2)--(0,0)--cycle;\fill[violet](1,1)circle(2pt)node[right]{$a=1+i$};\foreach \x/\y/\z in {2/0/2,2/2/2+2i,0/2/2i,0/0/0}{\fill[mint](\x,\y)circle(2pt)node[below left]{$\z$};}\end{tikzpicture}',
 'lattice-paths':r'\begin{tikzpicture}[scale=.85]\draw[gray!45](0,0)grid(3,2);\draw[mint,very thick,->](0,0)--(1,0)--(1,1)--(2,1)--(3,1)--(3,2);\fill[violet](1,1)circle(3pt)node[above left]{$(1,1)$};\node[below]at(0,0){$(0,0)$};\node[above]at(3,2){$(3,2)$};\end{tikzpicture}',
 'bayes':r'\begin{tikzpicture}[x=1.6cm,y=.8cm]\draw[mint,thick](0,0)--(1,1)node[midway,above]{$\frac13$};\draw[mint,thick](0,0)--(1,-1)node[midway,below]{$\frac23$};\node at(1.2,1){$A$};\node at(1.2,-1){$B$};\draw[violet,thick](1.5,1)--(3,1.5)node[midway,above]{$\frac34$};\draw[violet,thick](1.5,-1)--(3,-.5)node[midway,above]{$\frac14$};\node[right]at(3,1.5){$A\cap R:\ \frac14$};\node[right]at(3,-.5){$B\cap R:\ \frac16$};\end{tikzpicture}',
 'euler-trails':r'\begin{tikzpicture}[scale=1.1]\draw[mint,thick](0,0)--(2,0)--(2,2)--(0,2)--cycle;\draw[violet,thick](0,0)--(2,2);\foreach \x/\y/\z in {0/0/A,2/0/B,2/2/C,0/2/D}{\fill[mint](\x,\y)circle(2pt)node[above right]{$\z$};}\end{tikzpicture}',
}
def source(pack,kind,j,number):
 chunks=[r'\documentclass[11pt]{article}',r'\usepackage{explorer}',r'\newcommand{\ExplorerLanguage}{'+['FR','EN'][j]+'}',r'\newcommand{\ExplorerNumber}{'+f'{number:02d}'+'}',r'\newcommand{\ExplorerKind}{'+text(labels[kind][j])+'}',r'\begin{document}',r'\ExplorerTitle{'+text(pack['level'][j])+'}{'+text(pack['title'][j])+'}']
 for heading,paras in sections(pack,kind,j):
  chunks.append(r'\ExplorerSection{'+text(heading)+'}')
  for p in paras:chunks.append(prose(p)+r'\par')
  if kind in ('exercises','problems'):chunks.append(r'\vspace{5pt}')
  if kind=='notes' and heading in ('Exemple expliqué','Worked example') and pack['id'] in FIGURES:chunks.append(r'\begin{center}'+FIGURES[pack['id']]+r'\end{center}')
  if kind=='notes' and heading in ('Exemple expliqué','Worked example') and pack['id']=='bayes':chunks.append(text(['Seules les branches conduisant à une boule rouge sont représentées.','Only branches leading to a red ball are shown.'][j])+r'\par')
 chunks.append(r'\end{document}')
 return '\n'.join(chunks)+'\n'
def build(job):
 stem=job
 target=(ROOT/'dist/resources' if stem.startswith('quadratic-presentation') else OUT)/(stem+'.pdf')
 with tempfile.TemporaryDirectory(prefix='explorer-tex-') as td:
  work=Path(td);shutil.copy(SOURCE/'explorer.sty',work/'explorer.sty');shutil.copy(SOURCE/(stem+'.tex'),work/(stem+'.tex'))
  r=subprocess.run(['xelatex','-interaction=nonstopmode','-halt-on-error','-no-shell-escape',stem+'.tex'],cwd=work,capture_output=True,text=True)
  log=(work/(stem+'.log')).read_text(errors='replace') if (work/(stem+'.log')).exists() else r.stdout
  if r.returncode:raise RuntimeError(stem+'\n'+log[-3500:])
  if 'Missing character:' in log:raise RuntimeError(stem+' missing glyph\n'+ '\n'.join(x for x in log.splitlines() if 'Missing character' in x))
  shutil.copy(work/(stem+'.pdf'),target)
  warnings=[x for x in log.splitlines() if 'Overfull' in x]
 return {'stem':stem,'engine':'XeLaTeX','source':str((SOURCE/(stem+'.tex')).relative_to(ROOT)),'sourceSha256':hashlib.sha256((SOURCE/(stem+'.tex')).read_bytes()).hexdigest(),'pdfSha256':hashlib.sha256(target.read_bytes()).hexdigest(),'styleSha256':hashlib.sha256((SOURCE/'explorer.sty').read_bytes()).hexdigest(),'overfullWarnings':warnings}
def main():
 parser=argparse.ArgumentParser();parser.add_argument('--only');args=parser.parse_args()
 (SOURCE/'explorer.sty').write_text(STYLE)
 jobs=[]
 for i,p in enumerate(json.loads((ROOT/'content/enrichment.json').read_text()),1):
  for kind in labels:
   for j in (0,1):
    stem=p['id']+'-'+kind+('-en' if j else '');(SOURCE/(stem+'.tex')).write_text(source(p,kind,j,i))
    if not args.only or args.only in stem:jobs.append(stem)
 for stem in ['quadratic-presentation','quadratic-presentation-en']:
  if (SOURCE/(stem+'.tex')).exists() and (not args.only or args.only in stem):jobs.append(stem)
 ledger=ROOT/'docs/LATEX_BUILD.json';previous={x['stem']:x for x in json.loads(ledger.read_text())} if ledger.exists() else {}
 style_hash=hashlib.sha256((SOURCE/'explorer.sty').read_bytes()).hexdigest()
 def fresh(stem):
  old=previous.get(stem,{})
  target=(ROOT/'dist/resources' if stem.startswith('quadratic-presentation') else OUT)/(stem+'.pdf')
  return old.get('sourceSha256')==hashlib.sha256((SOURCE/(stem+'.tex')).read_bytes()).hexdigest() and old.get('styleSha256')==style_hash and target.exists() and old.get('pdfSha256')==hashlib.sha256(target.read_bytes()).hexdigest()
 pending=[stem for stem in jobs if not fresh(stem)]
 with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:
  for record in pool.map(build,pending):previous[record['stem']]=record
 ledger.write_text(json.dumps([previous[k] for k in sorted(previous)],indent=2)+'\n')
 print(f'Compiled {len(pending)} PDFs with XeLaTeX; reused {len(jobs)-len(pending)} unchanged PDFs. All sources retained.')
if __name__=='__main__':main()
