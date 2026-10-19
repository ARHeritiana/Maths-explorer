"""Build Fourier web lessons and four XeLaTeX editions from one original source."""
import argparse, hashlib, html, importlib.util, json, re, shutil, subprocess, tempfile, zipfile
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
SOURCE=ROOT/'content/university/fourier'
OUT=ROOT/'dist/resources/university/fourier'
spec=importlib.util.spec_from_file_location('fourier_lessons',SOURCE/'lessons.py');module=importlib.util.module_from_spec(spec);spec.loader.exec_module(module)
LESSONS=module.LESSONS

# Inline mathematics is typeset in both exports; prose and display equations stay distinct.
MATH = {
 'σ_N':r'\sigma_N',
 'z_j=x_j+iy_j':r'z_j=x_j+iy_j',
 'iy_j':r'iy_j',
 '0,4√2':r'0{,}4\sqrt2',
 'σ_2':r'\sigma_2',
 'ib_n':r'ib_n',
 'c_{−1}':r'c_{-1}',

 'u(t)=2 cos(6πt+π/3)':r'u(t)=2\cos(6\pi t+\pi/3)',
 '0,6 cos(2πt)+0,8 sin(4πt)':r'0{,}6\cos(2\pi t)+0{,}8\sin(4\pi t)',
 'f(t)=cos(2πt)+sin(4πt)':r'f(t)=\cos(2\pi t)+\sin(4\pi t)',
 'e^{2πit}+e^{-2πit}':r'e^{2\pi it}+e^{-2\pi it}',
 'exp(2πi(k−l)t)/(2πi(k−l))':r'\dfrac{e^{2\pi i(k-l)t}}{2\pi i(k-l)}',
 'exp(2πi(k−l)t)':r'e^{2\pi i(k-l)t}',
 '⟨f−S_N,e_k⟩=c_k−c_k=0':r'\langle f-S_N,e_k\rangle=c_k-c_k=0',
 '1−|k|/(N+1)':r'1-\dfrac{|k|}{N+1}',
 'N+1−|k|':r'N+1-|k|',
 '1−8/π²':r'1-\dfrac8{\pi^2}',
 '−2/(πn)':r'-\dfrac2{\pi n}',
 '(1−q^M)/(1−q)':r'\dfrac{1-q^M}{1-q}',
 'exp(2πir/M)':r'e^{2\pi ir/M}',
 'exp(2πirj/M)':r'e^{2\pi irj/M}',
 'exp(2πij/4)':r'e^{2\pi ij/4}',
 'exp(2πij)':r'e^{2\pi ij}',
 're^{iθ}':r're^{i\theta}',
 'f(t+T)=f(t)':r'f(t+T)=f(t)',
 'z=x+iy':r'z=x+iy',
 't↦z(t)':r't\mapsto z(t)',
 '2 cos(2πt)':r'2\cos(2\pi t)',
 'sin(2πnt)':r'\sin(2\pi nt)',
 '−cos(2πnt)/(2πn)':r'-\dfrac{\cos(2\pi nt)}{2\pi n}',
 '(1−(−1)^n)/(2πn)':r'\dfrac{1-(-1)^n}{2\pi n}',
}
def mathtext(s):
    slots=[]
    def save(value):
        slots.append(value);return '\u0001'+str(len(slots)-1)+'\u0002'
    for plain,value in sorted(MATH.items(),key=lambda x:-len(x[0])):
        s=s.replace(plain,save(value))
    s=re.sub(r'(?<![\w])(?:[A-Za-z]_[{][^}]+[}]|[A-Za-z]_[A-Za-z0-9]+|[A-Za-z]\^[{][^}]+[}]|[A-Za-z]\^[A-Za-z0-9])',lambda m:save(m[0].replace('−','-').replace('π',r'\pi').replace('θ',r'\theta')),s)
    return re.sub('\u0001([0-9]+)\u0002',lambda m:r'\('+slots[int(m[1])]+r'\)',s)
def esc(s): return html.escape(mathtext(s))
def tex(s):
    s=mathtext(s)
    def plain(s):
        out=''
        special={'&':r'\&','%':r'\%','_':r'\_','^':r'\textasciicircum{}','{':r'\{','}':r'\}'}
        symbols={'−':'-','↦':r'$\mapsto$','θ':r'$\theta$','φ':r'$\varphi$','ε':r'$\varepsilon$','π':r'$\pi$','σ':r'$\sigma$','∫':r'$\int$','√':r'$\sqrt{\vphantom1}$','≤':r'$\le$','≥':r'$\ge$','≠':r'$\ne$','²':r'$^2$','₀':r'$_0$','₁':r'$_1$','₂':r'$_2$','⟨':r'$\langle$','⟩':r'$\rangle$'}
        for c in s:out+=symbols.get(c,special.get(c,c))
        return out
    return ''.join('$'+part[2:-2]+'$' if part.startswith(r'\(') else plain(part) for part in re.split(r'(\\\(.*?\\\))',s))

def digest():
    h=hashlib.sha256()
    for p in [SOURCE/'lessons.py',Path(__file__),ROOT/'content/data/manifest.json']:
        data=p.read_bytes() if p.name!='manifest.json' else json.dumps(next(s for s in json.loads(p.read_text())['university']['sections'] if s['id']=='fourier'),ensure_ascii=False,sort_keys=True).encode()
        h.update(data)
    return h.hexdigest()

def build(check=False):
    receipt=ROOT/'content/data/fourier-build.json'
    if check:
        saved=json.loads(receipt.read_text());assert saved['sourceDigest']==digest(),'Rebuild Fourier sources'
        for p,h in saved['outputs'].items():assert hashlib.sha256((ROOT/p).read_bytes()).hexdigest()==h,p
        print('Fourier: all source fingerprints and published file hashes match.');return
    OUT.mkdir(parents=True,exist_ok=True);(OUT/'slides').mkdir(exist_ok=True);(OUT/'tex').mkdir(exist_ok=True)
    manifest=json.loads((ROOT/'content/data/manifest.json').read_text());section=next(s for s in manifest['university']['sections'] if s['id']=='fourier')
    for i,L in enumerate(LESSONS):
        seq=next(s for s in section['sequences'] if s['id']==L['id'])
        nav='<nav aria-label="Parcours Fourier"><a href="../../../../index.html#gallery/fourier">Voir Madagascar</a> · <a href="../../../../index.html#lab/'+seq['labRef']+'">Expérimenter</a> · <a href="../../../../index.html#university">Toutes les leçons</a></nav>'
        body=f'<p class="eyebrow">Séries de Fourier · Leçon {i+1} / {len(LESSONS)}</p><h1>{esc(L["title"])}</h1>{nav}<p><strong>Prérequis :</strong> {esc(L["prerequisites"])}</p><h2>Objectifs</h2><ul>'+''.join('<li>'+esc(s)+'</li>' for s in L['objectives'])+'</ul><section class="activity"><h2>Explorer avant de formaliser</h2><p>'+esc(L['activity'])+'</p></section>'
        for b in L['sections']:
            body+='<section><h2>'+esc(b['title'])+'</h2><p>'+esc(b['text'])+'</p>'
            if b['formula']:body+='<div class="formula">\\['+html.escape(b['formula'])+'\\]</div>'
            if b['proof']:body+='<details><summary>Justification</summary><p>'+esc(b['proof'])+'</p></details>'
            body+='</section>'
        body+='<h2>Exercices</h2><ol>'+''.join('<li><p>'+esc(e['question'])+'</p><details><summary>Correction détaillée</summary><p>'+esc(e['solution'])+'</p></details></li>' for e in L['exercises'])+'</ol>'
        body+='<h2>Pour approfondir</h2><p>Références sur les théorèmes admis et leurs démonstrations (en anglais).</p><ul>'+''.join('<li><a href="'+html.escape(url)+'">'+html.escape(title)+'</a></li>' for title,url in module.REFERENCES)+'</ul>'
        body+='<nav aria-label="Leçons suivantes">'+(f'<a href="{LESSONS[i-1]["id"]}.html">← Leçon précédente</a>' if i else '')+' '+(f'<a href="{LESSONS[i+1]["id"]}.html">Leçon suivante →</a>' if i+1<len(LESSONS) else '')+'</nav>'+nav
        page='''<!doctype html><html lang="fr"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>'''+esc(L['title'])+''' · Fourier</title><style>:root{color-scheme:light dark}*{box-sizing:border-box}body{margin:auto;max-width:900px;padding:24px;font:1.13rem/1.65 system-ui,sans-serif;background:#f5f6f8;color:#141c2b}h1,h2{font-family:Georgia,serif;line-height:1.2}h1{font-size:clamp(1.8rem,5vw,2.7rem)}h2{margin-top:2em}a{color:#1d4ed8}nav{display:flex;gap:16px;flex-wrap:wrap;padding:12px 0}a,summary{min-height:44px;display:inline-flex;align-items:center}summary{cursor:pointer;font-weight:600}.eyebrow{color:#55637a}.activity{padding:20px;border-left:4px solid #1d4ed8;background:white}.activity h2{margin-top:0}.formula{overflow-x:auto;padding:12px 0}li{margin-bottom:18px}details{border-left:2px solid #8693a8;padding-left:16px}a:focus-visible,summary:focus-visible{outline:3px solid #b45309;outline-offset:4px}@media(prefers-color-scheme:dark){body{background:#0c111b;color:#e8edf6}a{color:#7aa2ff}.eyebrow{color:#97a5be}.activity{background:#131a28}}mjx-container{max-width:100%}</style><script>window.MathJax={tex:{inlineMath:[['\\\\(','\\\\)']]},svg:{fontCache:'none'},options:{enableAssistiveMml:true}};</script><script defer src="../../../../vendor/mathjax-tex-svg.js"></script><main>'''+body+'</main></html>'
        (OUT/'slides'/seq['slide']).write_text(page)
    pre=r'''\documentclass[11pt,a4paper]{article}
\usepackage{fontspec}\setmainfont{Latin Modern Roman}
\usepackage[provide=*,french]{babel}\usepackage{amsmath,amssymb,geometry,xcolor,hyperref,enumitem}
\geometry{margin=24mm}\hypersetup{colorlinks=true,linkcolor=blue,pdftitle={Séries de Fourier},pdfauthor={}}
\setlength{\parindent}{0pt}\setlength{\parskip}{7pt}\setlist{itemsep=6pt}
\newcommand{\editiontitle}[1]{\begin{center}{\Large\bfseries Séries de Fourier}\\[8pt]#1\end{center}}
\begin{document}
'''
    names={'cours':'Cours et démonstrations','exercices':'Exercices seuls','corriges':'Exercices corrigés','guide':'Guide de travail et corrigés'}
    for edition,title in names.items():
        body=pre+r'\editiontitle{'+title+r'}\tableofcontents\clearpage'+'\n'
        for i,L in enumerate(LESSONS):
            body+=r'\section{'+tex(L['title'])+'}\n'+r'\textbf{Prérequis :} '+tex(L['prerequisites'])+'\n'
            if edition in ('cours','guide'):
                body+=r'\subsection*{Explorer avant de formaliser}'+tex(L['activity'])+'\n'
                for b in L['sections']:
                    body+=r'\subsection{'+tex(b['title'])+'}\n'+tex(b['text'])+'\n'
                    if b['formula']:
                        formula=b['formula'].replace(r',\qquad',r'\\').replace(r',\quad',r'\\') if len(b['formula'])>80 else b['formula']
                        body+=r'\[\begin{gathered}'+formula+r'\end{gathered}\]'+'\n'
                    if b['proof']:body+=r'\textbf{Justification.} '+tex(b['proof'])+'\n'
            if edition!='cours':
                body+=r'\subsection*{Exercices}\begin{enumerate}'+'\n'
                for e in L['exercises']:
                    body+=r'\item '+tex(e['question'])+'\n'
                    if edition in ('corriges','guide'):body+=r'\par\textbf{Correction.} '+tex(e['solution'])+'\n'
                body+=r'\end{enumerate}'+'\n'
            body+=r'\clearpage'+'\n'
        body+=r'\section*{Références pour approfondir}'+'\n'+''.join(r'\par\href{'+url+'}{'+tex(title)+'}'+'\n' for title,url in module.REFERENCES)
        body+=r'\end{document}'+'\n'
        # Keep generated standalone TeX alongside its PDF and in the editable bundle.
        (OUT/'tex'/(edition+'.tex')).write_text(body)
        with tempfile.TemporaryDirectory(prefix='mx-fourier-') as tmp:
            p=Path(tmp);(p/(edition+'.tex')).write_text(body)
            for _ in range(2):
                result=subprocess.run(['xelatex','-interaction=nonstopmode','-halt-on-error',edition+'.tex'],cwd=p,capture_output=True,text=True)
                if result.returncode:raise RuntimeError(result.stdout[-5000:])
            log=(p/(edition+'.log')).read_text();warnings=[s for s in log.splitlines() if 'Overfull' in s or 'Missing character' in s]
            if warnings:raise RuntimeError('\n'.join(warnings[:30]))
            import pymupdf
            d=pymupdf.open(p/(edition+'.pdf'));d.set_metadata({'title':'Séries de Fourier : '+title,'author':'','subject':'Ondes, coefficients, convergence et contours','keywords':''});d.del_xml_metadata();d.save(OUT/(edition+'.pdf'),garbage=4,deflate=True);d.close()
    with zipfile.ZipFile(OUT/'sources-latex.zip','w',zipfile.ZIP_DEFLATED) as z:
        for p in sorted((OUT/'tex').glob('*.tex')):z.write(p,'tex/'+p.name)
        z.write(SOURCE/'lessons.py','lessons.py')
        z.writestr('README.txt','Sources originales et quatre éditions LaTeX autonomes. Compiler chaque fichier .tex deux fois avec XeLaTeX.\n')
    receipt.parent.mkdir(exist_ok=True)
    receipt.write_text(json.dumps({'sourceDigest':digest(),'outputs':{p.relative_to(ROOT).as_posix():hashlib.sha256(p.read_bytes()).hexdigest() for p in sorted(OUT.rglob('*')) if p.is_file()}},indent=2)+'\n')
    print('Fourier: six web lessons, four PDF editions and editable LaTeX sources built.')
if __name__=='__main__':
    ap=argparse.ArgumentParser();ap.add_argument('--check',action='store_true');build(ap.parse_args().check)
