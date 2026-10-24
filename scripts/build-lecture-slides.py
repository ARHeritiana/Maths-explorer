"""Build lecture editions as actual 16:9 Metropolis Beamer documents, never browser printouts.

The HTML decks retain manipulable figures. Lecture editions retain definitions, proofs, methods,
questions and worked answers. Interactive-only scenes are deliberately omitted. Long material is
split at paragraph/list boundaries, rather than shrunk to illegibility. Figures are vector imports.
"""
import argparse, concurrent.futures, hashlib, html, json, re, shutil, subprocess, sys, zipfile
from pathlib import Path
from lxml import html as dom
import pymupdf

ROOT=Path(__file__).resolve().parents[1]
sys.path.insert(0,str(ROOT/'build'))
from mxbuild.notation import mathjax, BRACKETS
from mxbuild.slide_editions import languages, for_language
DATA=ROOT/'dist/slides/data'; OUT=ROOT/'dist/slides/lectures'; SOURCE=ROOT/'content/tex/lectures'; BUILD=ROOT/'build/out/lectures'
PUNCT={'−':'-','–':'-','—':'-','…':r'\ldots{}','→':r'\ensuremath{\to}','↦':r'\ensuremath{\mapsto}','⇒':r'\ensuremath{\Rightarrow}','⇔':r'\ensuremath{\iff}','≤':r'\ensuremath{\leq}','≥':r'\ensuremath{\geq}','≠':r'\ensuremath{\ne}','≈':r'\ensuremath{\approx}','∞':r'\ensuremath{\infty}','ℝ':r'\ensuremath{\mathbb{R}}','ℕ':r'\ensuremath{\mathbb{N}}','ℤ':r'\ensuremath{\mathbb{Z}}','ℚ':r'\ensuremath{\mathbb{Q}}','ℂ':r'\ensuremath{\mathbb{C}}','∈':r'\ensuremath{\in}','∉':r'\ensuremath{\notin}','∩':r'\ensuremath{\cap}','∪':r'\ensuremath{\cup}','∅':r'\ensuremath{\varnothing}','×':r'\ensuremath{\times}','·':r'\ensuremath{\cdot}','²':r'\textsuperscript{2}','³':r'\textsuperscript{3}','°':r'\textdegree{}','α':r'\ensuremath{\alpha}','β':r'\ensuremath{\beta}','Δ':r'\ensuremath{\Delta}','θ':r'\ensuremath{\theta}','π':r'\ensuremath{\pi}','σ':r'\ensuremath{\sigma}','μ':r'\ensuremath{\mu}','√':r'\ensuremath{\sqrt{\phantom{x}}}','′':"'",'″':"''",'₀':r'\textsubscript{0}','₁':r'\textsubscript{1}','₂':r'\textsubscript{2}','₃':r'\textsubscript{3}','₄':r'\textsubscript{4}'}

def escape(s):
    chars={'\\':r'\textbackslash{}','&':r'\&','%':r'\%','$':r'\$','#':r'\#','_':r'\_','{':r'\{','}':r'\}','~':r'\textasciitilde{}','^':r'\textasciicircum{}'}
    return ''.join(PUNCT.get(c,chars.get(c,c)) for c in s.replace('\xa0',' ').replace('\u202f',' '))

def convert(fragment):
    maths=[]
    def save(m):maths.append(html.unescape(m[0]).replace(r'\frac',r'\dfrac'));return f'MXMATH{len(maths)-1}TOKEN'
    fragment=re.sub(r'\\\([\s\S]*?\\\)|\\\[[\s\S]*?\\\]',save,fragment)
    root=dom.fragment_fromstring(fragment,create_parent='div')
    def walk(node):
        tag=node.tag.lower() if isinstance(node.tag,str) else ''
        if tag=='br':return '\n\n'
        inner=escape(node.text or '')+''.join(walk(c)+escape(c.tail or '') for c in node)
        if tag in ('b','strong'):return r'\textbf{'+inner+'}'
        if tag in ('em','i'):return r'\emph{'+inner+'}'
        if tag=='code':return r'\texttt{'+inner+'}'
        if tag in ('ul','ol'):return '\n\\begin{'+('itemize' if tag=='ul' else 'enumerate')+'}\n'+(r'\setcounter{enumi}{'+str(int(node.get('start','1'))-1)+'}' if tag=='ol' else '')+inner+'\n\\end{'+('itemize' if tag=='ul' else 'enumerate')+'}\n'
        if tag=='li':return '\\item '+inner+'\n'
        if tag in ('p','div','section'):return inner+'\n\n'
        if tag=='tr':return ' & '.join(walk(c) for c in node)+r' \\ '+'\n'
        if tag=='table':
            rows=node.xpath('.//tr');cols=max([len(row) for row in rows] or [1]);return '\\begin{center}\\begin{tabular}{'+'l'*cols+'}\n'+''.join(walk(row) for row in rows)+'\\end{tabular}\\end{center}'
        return inner
    result=walk(root)
    for i,tex in enumerate(maths):result=result.replace(f'MXMATH{i}TOKEN',tex)
    return re.sub(r'\n\s*\n\s*\n','\n\n',result).strip()

def chunks(fragment,limit=540):
    # Keep displayed maths and list items intact. A lecture page has a reading order, no live control instructions.
    pieces=re.split(r'(?:<br\s*/?>\s*){2,}|(?<=</p>)\s*|(?=<(?:ul|ol)>)|(?<=</ul>)|(?<=</ol>)',fragment)
    out=[];current=''
    for piece in pieces:
        if not piece.strip():continue
        if len(re.sub('<[^>]*>','',current+piece))>limit and current:out.append(current);current=''
        # An oversized list is split item-by-item while retaining its list semantics.
        if len(re.sub('<[^>]*>','',piece))>limit and re.fullmatch(r'\s*<(ul|ol)>[\s\S]*</\1>\s*',piece):
            node=dom.fragment_fromstring(piece);tag=node.tag
            start=1
            for child in node:
                item=dom.tostring(child,encoding='unicode')
                if len(re.sub('<[^>]*>','',current+item))>limit and current:out.append(f'<{tag}'+(f' start="{start}"'if tag=='ol'else '')+f'>{current}</{tag}>');start+=current.count('<li');current=''
                current+=item
            if current:out.append(f'<{tag}'+(f' start="{start}"'if tag=='ol'else '')+f'>{current}</{tag}>');start+=current.count('<li');current=''
        else:current+=(('<br><br>' if current else '')+piece)
    if current:out.append(current)
    return out or ['']

def preamble(title,lang):
    macros=[]
    for key,value in mathjax().items():
        body,n=(value[0],value[1])if isinstance(value,list)else(value,0)
        macros.append('\\providecommand{\\'+key+'}'+('['+str(n)+']' if n else '')+'{'+body+'}')
    return r'''\documentclass[aspectratio=169,10pt]{beamer}
\usetheme[numbering=fraction,progressbar=frametitle]{metropolis}
\usepackage{fontspec}
\setsansfont{Latin Modern Sans}
\usepackage{amsmath,amssymb,mathtools,graphicx,booktabs}
\usepackage{polyglossia}
\setdefaultlanguage{'''+('french' if lang=='fr' else 'english')+r'''}
\setbeamertemplate{navigation symbols}{}
\setbeamerfont{frametitle}{size=\large}
\setbeamerfont{normal text}{size=\normalsize}
\setlength{\parskip}{.45em}
\hypersetup{pdfauthor={},pdfsubject={Lecture slides},pdfkeywords={},pdftitle={'''+escape(title)+r'''}}
'''+ '\n'.join(macros)+r'''
\providecommand{\pgcd}{\operatorname{PGCD}}
\providecommand{\ppcm}{\operatorname{PPCM}}
\title{'''+convert(title)+r'''}
\subtitle{'''+('Cours et exemples' if lang=='fr' else 'Lecture and worked examples')+r'''}
\date{}
\author{}
\begin{document}
\begin{frame}[plain]
\vfill
{\usebeamerfont{title}\inserttitle\par}
\medskip
{\usebeamerfont{subtitle}\insertsubtitle\par}
\medskip
{\usebeamercolor[fg]{progress bar}\rule{\textwidth}{.5pt}}
\vfill
\end{frame}
'''

def figure(deck,slide,lang,work):
    figures=[]
    for pair in slide.get('f',[]):
        idx=0 if lang=='fr' else 1;name=f'{deck["id"]}-{pair[idx]}'+('' if idx==0 else '-en')+'.svg';svg=ROOT/'dist/slides/fig'/name
        if not svg.exists():raise RuntimeError('Missing lecture figure '+str(svg))
        dest=work/'figures'/(svg.stem+'.pdf');dest.parent.mkdir(parents=True,exist_ok=True)
        if not dest.exists():
            with pymupdf.open(svg) as doc:dest.write_bytes(doc.convert_to_pdf())
        figures.append(dest)
    return figures

def tex_for(deck,lang,work):
    deck=for_language(deck,lang)
    L=0 if lang=='fr' else 1;parts=[preamble(deck['title'][L],lang)]
    for slide in deck['slides']:
        if slide['k'] in ('title','widget'):continue
        title=slide.get('t',['',''])[L];body=slide.get('b',['',''])[L]
        if slide['k']=='code':
            # HTML code text is rendered verbatim, not interpreted as TeX commands.
            code=html.unescape(re.sub('<[^>]+>','',body));parts.append('\\begin{frame}[fragile]{'+convert(title)+'}\n\\small\n\\begin{verbatim}\n'+code+'\n\\end{verbatim}\n\\end{frame}\n');continue
        fs=figure(deck,slide,lang,work)
        for i,chunk in enumerate(chunks(body,420 if fs else 540)):
            label=title+(' ('+str(i+1)+')' if i else '')
            if not chunk.strip() and not fs:continue
            text=convert(chunk)
            parts.append('\\begin{frame}{'+convert(label)+'}\n')
            if fs:
                parts.append('\\begin{columns}[T,onlytextwidth]\n\\begin{column}{.57\\textwidth}\n'+text+'\n\\end{column}\n\\begin{column}{.4\\textwidth}\n\\centering\n')
                for f in fs:parts.append('\\includegraphics[width=\\linewidth,height='+str(4.5/len(fs))+'cm,keepaspectratio]{figures/'+f.name+'}\n')
                parts.append('\\end{column}\n\\end{columns}\n')
            else:parts.append(text+'\n')
            parts.append('\\end{frame}\n')
        answer=slide.get('a',['',''])[L]
        if answer.strip():
            for i,chunk in enumerate(chunks(answer)):
                label=('Correction : ' if lang=='fr' else 'Worked answer: ')+title
                parts.append('\\begin{frame}{'+convert(label)+'}\n'+convert(chunk)+'\n\\end{frame}\n')
    parts.append('\\end{document}\n');tex=''.join(parts)
    if '\\llbracket' in tex or '\\rrbracket' in tex:   # French integer intervals: Beamer has no stmaryrd here
        tex=tex.replace('\n\\title{','\n'+''.join('\\providecommand{\\'+k+'}{'+v+'}\n' for k,v in BRACKETS.items())+'\\title{',1)
    return tex

def build_one(item):
    deck,lang=item;key=f'{deck["id"]}-{lang}';work=BUILD/key;work.mkdir(parents=True,exist_ok=True)
    tex=tex_for(deck,lang,work);source=SOURCE/(key+'.tex');source.parent.mkdir(parents=True,exist_ok=True);source.write_text(tex)
    path=work/'main.tex';path.write_text(tex)
    digest=hashlib.sha256((tex+'metropolis-lecture-v1').encode()+b''.join(p.read_bytes()for p in sorted((work/'figures').glob('*.pdf')))).hexdigest();cache=work/'source.sha256'
    out=OUT/(key+'.pdf');OUT.mkdir(parents=True,exist_ok=True)
    if not out.exists()or not cache.exists()or cache.read_text()!=digest:
        for run in range(2):
            result=subprocess.run(['xelatex','-interaction=nonstopmode','-halt-on-error','-no-shell-escape','main.tex'],cwd=work,capture_output=True,text=True)
            (work/'compile.txt').write_text(result.stdout+result.stderr)
            if result.returncode:raise RuntimeError(key+': '+(result.stdout+result.stderr)[-2200:])
        shutil.copyfile(work/'main.pdf',out);cache.write_text(digest)
    shutil.copyfile(source,OUT/(key+'.tex'))
    zpath=OUT/(key+'-source.zip')
    # An archive with the same entries is kept: rewriting it would only change timestamps and the site's cache versions.
    entries={'main.tex':source.read_bytes(),**{'figures/'+f.name:f.read_bytes() for f in sorted((work/'figures').glob('*.pdf'))}}
    same=False
    if zpath.exists():
        with zipfile.ZipFile(zpath)as archive:same=sorted(archive.namelist())==sorted(entries) and all(archive.read(n)==b for n,b in entries.items())
    if not same:
        with zipfile.ZipFile(zpath,'w',zipfile.ZIP_DEFLATED)as archive:
            for name,data in entries.items():archive.writestr(zipfile.ZipInfo(name,date_time=(1980,1,1,0,0,0)),data,zipfile.ZIP_DEFLATED)
    with pymupdf.open(out)as doc:
        dims=doc[0].rect;assert abs(dims.width/dims.height-16/9)<.005
        pages=len(doc)
    log=(work/'main.log').read_text(errors='replace');overflow=[x for x in log.splitlines()if 'Overfull' in x or 'Missing character' in x]
    return {'id':deck['id'],'lang':lang,'pages':pages,'pdf':out.name,'bytes':out.stat().st_size,'source':zpath.name,'sourceBytes':zpath.stat().st_size,'sourceSha256':hashlib.sha256(zpath.read_bytes()).hexdigest(),'sha256':hashlib.sha256(out.read_bytes()).hexdigest(),'warnings':overflow}

def main():
    parser=argparse.ArgumentParser();parser.add_argument('--deck');parser.add_argument('--lang',choices=['fr','en']);parser.add_argument('--jobs',type=int,default=4);parser.add_argument('--check',action='store_true');args=parser.parse_args()
    index=json.loads((DATA/'index.json').read_text());decks=[json.loads((DATA/(d['id']+'.json')).read_text())for d in index if not args.deck or d['id']==args.deck]
    if args.lang and any(args.lang not in languages(d) for d in decks):
        raise SystemExit('Requested lecture language is unavailable for a selected deck')
    jobs=[(d,lang)for d in decks for lang in ([args.lang]if args.lang else languages(d))];results=[]
    if args.check:
        metadata={d['id']:d for d in json.loads((OUT/'index.json').read_text())}
        if not args.lang:
            for deck in decks: assert set(metadata[deck['id']]['editions']) == set(languages(deck)), 'stale lecture language availability: '+deck['id']
        for deck,lang in jobs:
            key=f'{deck["id"]}-{lang}';expected=tex_for(deck,lang,BUILD/key)
            assert (SOURCE/(key+'.tex')).read_text()==expected, 'stale lecture source: '+key
            assert (OUT/(key+'.tex')).read_text()==expected, 'stale downloadable source: '+key
            edition=metadata[deck['id']]['editions'][lang];pdf=OUT/edition['pdf']
            assert hashlib.sha256(pdf.read_bytes()).hexdigest()==edition['sha256'], 'PDF hash: '+key
            assert pdf.stat().st_size==edition['bytes'], 'PDF size: '+key
            assert (OUT/edition['source']).stat().st_size==edition['sourceBytes'], 'archive size: '+key
            assert hashlib.sha256((OUT/edition['source']).read_bytes()).hexdigest()==edition['sourceSha256'], 'archive hash: '+key
            with pymupdf.open(pdf) as doc:
                assert len(doc)==edition['pages'],key
                assert not doc.metadata.get('author'),key
                assert all(abs(p.rect.width/p.rect.height-16/9)<.005 for p in doc),key
            with zipfile.ZipFile(OUT/edition['source'])as archive:
                assert archive.read('main.tex').decode()==expected,key
                for f in re.findall(r'\\includegraphics\[[^]]*\]\{([^}]+)\}',expected):assert f in archive.namelist(),(key,f)
        print(f'Lecture check: {len(jobs)} matching sources, PDFs, aspect ratios and source archives.');return
    with concurrent.futures.ThreadPoolExecutor(max_workers=args.jobs)as pool:
        for result in pool.map(build_one,jobs):results.append(result);print(result['pdf'],result['pages'],'pages',len(result['warnings']),'layout warnings',flush=True)
    report=BUILD/'report.json';report.write_text(json.dumps(results,ensure_ascii=False,indent=2))
    if not args.deck and not args.lang:
        (OUT/'index.json').write_text(json.dumps([{**d,'editions':{r['lang']:{k:v for k,v in r.items()if k not in ('id','lang','warnings')}for r in results if r['id']==d['id']}}for d in index],ensure_ascii=False,indent=1)+'\n')
        keep={'index.json'}|{f"{r['id']}-{r['lang']}{suffix}" for r in results for suffix in ('.pdf','.tex','-source.zip')}
        for folder in (OUT,SOURCE):
            for old in folder.iterdir():
                if old.is_file() and old.name not in keep and old.suffix in ('.pdf','.tex','.zip'):old.unlink()
    else:
        previous={d['id']:d for d in json.loads((OUT/'index.json').read_text())} if (OUT/'index.json').exists() else {}
        for d in index:
            mine=[r for r in results if r['id']==d['id']]
            if not mine: continue
            editions=previous.get(d['id'],{}).get('editions',{}) if args.lang else {}
            editions.update({r['lang']:{k:v for k,v in r.items()if k not in ('id','lang','warnings')}for r in mine})
            previous[d['id']]={**d,'editions':editions}
        (OUT/'index.json').write_text(json.dumps(list(previous.values()),ensure_ascii=False,indent=1)+'\n')

    print('Lecture editions:',len(results),'PDFs; layout warnings:',sum(len(r['warnings'])for r in results))
    if any(r['warnings']for r in results):raise SystemExit('Fix lecture layout warnings before publication.')

if __name__=='__main__':main()
