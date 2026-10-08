"""Import authenticated, locally materialized Drive PDFs. Never fetch public URLs.

Usage: python scripts/import-resources.py /absolute/path/to/materials.json
Manifest rows: name, local, id, url, title, modified. Local paths stay outside output.
PDF bookmarks select chapters; section headings select bounded excerpts. Full-page
chapter copies are authoritative; excerpts carry original source page provenance.
"""
import json, re, hashlib, sys, unicodedata
from pathlib import Path
import fitz

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'dist/resources'
OUT.mkdir(parents=True, exist_ok=True)
inputs = {x['name']: x for x in json.load(open(sys.argv[1]))}
catalog = {'schemaVersion': 1, 'importedAt': '2026-10-07', 'courses': [], 'chapters': [], 'resources': [], 'sources': []}
docs = {}
for name, x in inputs.items():
    p = Path(x['local'])
    catalog['sources'].append({k:x[k] for k in ['name','title','modified'] if k in x} | {'sha256':hashlib.sha256(p.read_bytes()).hexdigest(), 'bytes':p.stat().st_size})
    if p.suffix == '.pdf': docs[name] = fitz.open(p)

TITLES = {
'seconde': ['Arithmetic','Vectors in the plane','Straight lines in the plane','Real numbers and intervals','Term review and consolidation','Functions: representations and reference functions','Descriptive statistics','Algebra, equations and inequalities','Proportions and percentage change','Variation and extrema','Two-way categorical tables','Coordinate geometry: vectors and lines','Synthesis, reasoning and fluency','Probability: conditioning and trees','Consolidation and transition'],
'premiere': ['Sequences and discrete models','Quadratics: forms and methods','Vectors and the scalar product','Differentiation: rates and tangents','Conditional probability and independence','Differentiation, variation and optimisation','Coordinate geometry: lines, projections and circles','Random variables and dispersion','The exponential function and continuous models','Trigonometry: circle, radians and related angles'],
'terminale': ['Sequences and induction','Vectors, lines and planes in space','Limits of sequences','Limits of functions','Combinatorics and counting','Differentiation, convexity and continuity','Conditional probability and the binomial distribution','The logarithm function','Orthogonality and distances','Antiderivatives and differential equations','Integration','Random variables, concentration and the law of large numbers','Parametric representations and Cartesian equations','Trigonometric functions'],
'stmg': ['Sequences','Exponential functions','The common logarithm','The reciprocal function','Bivariate statistics','Conditional probability','Discrete random variables and the binomial distribution','Revision and consolidation']}
COURSES = {
'seconde': ['Seconde','Seconde · French curriculum'],
'premiere': ['Première spécialité','Première · Mathematics specialism'],
'terminale': ['Terminale spécialité','Terminale · Mathematics specialism'],
'stmg': ['Terminale STMG','Terminale STMG']}
TOPICS = {
'seconde':['arithmetic','vectors','lines','reals','review','functions','statistics','algebra','percentages','optimisation','tables','geometry','logic','conditional','review'],
'premiere':['sequences','quadratic','scalar','derivative','conditional','optimisation','circle','random','exponential','trigonometry'],
'terminale':['induction','space','sequence-limits','function-limits','counting','convexity','binomial','logarithm','orthogonality','differential','integral','concentration','space-equations','trig-functions'],
'stmg':['sequences','exponential','log10','reciprocal','regression','conditional','binomial','review']}
LABS={'vectors':'vectors','scalar':'vectors','geometry':'vectors','lines':'vectors','statistics':'statistics','tables':'statistics','regression':'statistics','sequences':'sequences','induction':'sequences','sequence-limits':'sequences','quadratic':'quadratic','functions':'quadratic','optimisation':'derivative','derivative':'derivative','convexity':'derivative','trigonometry':'trig','trig-functions':'trig','conditional':'probability','binomial':'probability','random':'probability','concentration':'probability','counting':'probability','integral':'integral','differential':'integral'}

def tidy(s): return re.sub(r'\s+', ' ', unicodedata.normalize('NFC',s)).strip()
def top(course, doc):
    ts=[(tidy(t),p-1) for l,t,p in doc.get_toc() if l==1]
    if course=='seconde': return [(re.sub(r'^Séquence \d+ : ', '', t),p) for t,p in ts if re.match(r'Séquence \d+ :',t)]
    start={'premiere':2,'terminale':3,'stmg':1}[course]
    return ts[start:start+len(TITLES[course])]

def find(doc,start,end,pattern):
    for i in range(start,end):
        for block in doc[i].get_text('dict')['blocks']:
            for line in block.get('lines',[]):
                text=tidy(''.join(span['text'] for span in line['spans']))
                if re.search(pattern,text): return (i,max(0,line['bbox'][1]-4))
    return None

def emit(chapter, name, kind, label, docname, start, end, audience='student', bounds=None):
    doc=docs[docname]
    target=OUT/chapter['id']/(name+'.pdf');target.parent.mkdir(exist_ok=True)
    out=fitz.open()
    retained=[]
    if bounds:
        a,b=bounds
        for i in range(a[0],b[0]+1):
            if i>=len(doc): continue
            page=doc[i];r=page.rect
            y0=max(43,a[1]) if i==a[0] else 43
            y1=min(b[1],r.height-55) if i==b[0] else r.height-55
            if y1-y0<12:continue
            clip=fitz.Rect(30,y0,r.width-30,y1)
            if not page.get_text(clip=clip).strip():continue
            n=out.new_page(width=r.width,height=r.height)
            h=clip.height; dest=fitz.Rect(30,55,r.width-30,55+h)
            if dest.y1>r.height-30:dest.y1=r.height-30
            n.show_pdf_page(dest,doc,i,clip=clip)
            retained.append(i+1)
            n.insert_text((30,23),'Maths Explorer | '+kind+' | '+chapter['id'],fontsize=9,color=(.1,.25,.3))
            n.insert_text((30,r.height-15),f'Source PDF page {i+1}',fontsize=8)
        if not len(out):return
    else:
        out.insert_pdf(doc,from_page=start,to_page=end-1)
        retained=list(range(start+1,end+1))
        toc=[[l,t,p-start] for l,t,p in doc.get_toc() if start<p<=end]
        # Rebase flat bookmarks, retaining only valid entries.
        if toc: out.set_toc([[1,t,p] for l,t,p in toc])
    out.set_metadata({'title':chapter['title'][0]+' — '+label[0], 'author':'Maths Explorer', 'subject':f"Extract from Drive {inputs[docname]['title']}; original pages {start+1}-{end}; source edition"})
    out.subset_fonts()
    out.save(target,garbage=4,deflate=True);out.close()
    check=fitz.open(target)
    if not len(check) or any(not p.get_text().strip() for p in check):raise ValueError('Empty resource '+str(target))
    n=len(check);check.close()
    r={'id':chapter['id']+'-'+name,'chapter':chapter['id'],'course':chapter['course'],'type':kind,'title':label,'language':'fr','audience':audience,'format':'PDF','url':'./resources/'+chapter['id']+'/'+name+'.pdf','pages':n,'bytes':target.stat().st_size,'source':docname,'sourcePages':[min(retained),max(retained)],'review':'source-unverified'}
    if bounds:r['sourceBounds']=[list(bounds[0]),list(bounds[1])]
    catalog['resources'].append(r)

for course in COURSES:
    catalog['courses'].append({'id':course,'title':COURSES[course],'curriculum':'fr','language':'fr'})
    sd=docs[course+'-student'];td=docs[course+'-teacher']
    sc=top(course,sd);tc=top(course,td)
    if len(sc)!=len(tc):raise ValueError('Student/teacher chapter count mismatch')
    for j,((title,start),(tt,ts)) in enumerate(zip(sc,tc)):
        # End at next top-level chapter, including appendices after the final chapter.
        end=sc[j+1][1] if j+1<len(sc) else {'seconde':len(sd),'premiere':93,'terminale':110,'stmg':127}[course]
        te=tc[j+1][1] if j+1<len(tc) else next((p-1 for l,t,p in td.get_toc() if l==1 and p-1>ts),len(td))
        chapter={'id':f'{course}-{j+1:02}','course':course,'number':j+1,'title':[title,TITLES[course][j]],'topic':TOPICS[course][j],'labs':[LABS[TOPICS[course][j]]] if TOPICS[course][j] in LABS else []}
        catalog['chapters'].append(chapter)
        emit(chapter,'chapter','booklet',['Chapitre complet · élève','Complete chapter · student'],course+'-student',start,end)
        emit(chapter,'teacher','solutions',['Chapitre complet · professeur (cours et corrigés)','Complete chapter · teacher (notes and solutions)'],course+'-teacher',ts,te,'teacher')
        if course=='terminale':
            markers=[('notes',r'^Notes de cours$', ['Notes de cours','Lesson notes']),('practice',r'^Comprendre, essayer, reprendre$', ['Applications guidées','Guided practice']),('exercises',r'^Exercices progressifs$', ['Exercices progressifs','Progressive exercises']),('problems',r'^Devoir à la maison$', ['Problème de synthèse · DM','Synthesis problem · homework']),('assessment',r'^QCM A', ['QCM et bilan','Multiple-choice questions and review'])]
        elif course=='premiere':
            markers=[('activities',r'^Diagnostic :', ['Diagnostic et recherche','Diagnostic and investigation']),('notes',r'^\d+\.1 ', ['Cours, exemples et applications','Notes, examples and applications']),('exercises',r'^Parcours d.exercices$', ['Exercices progressifs','Progressive exercises']),('assessment',r'^QCM 1 :', ['QCM et bilan','Multiple-choice questions and review'])]
        elif course=='stmg':
            markers=[('notes',r'^Cours de référence$', ['Cours de référence','Reference notes']),('activities',r'^Séance \d+', ['Séances : activités et exercices','Sessions: activities and practice'])]
        else:markers=[]
        points=[(kind,find(sd,start,end,pat),label) for kind,pat,label in markers]
        points=[x for x in points if x[1]]
        for k,(kind,a,label) in enumerate(points):
            b=points[k+1][1] if k+1<len(points) else (end,0)
            if kind=='exercises' and course=='terminale':
                stop=find(sd,a[0],end,r'^Travail dans le manuel')
                if stop and stop>a:b=min(b,stop)
            emit(chapter,kind,kind,label,course+'-student',a[0],min(end,b[0]+1),bounds=(a,b))
        if course=='premiere':
            a=find(td,ts,te,r'^Corrigés et conduite du chapitre')
        elif course=='terminale':a=find(td,ts,te,r'^Corrigés des QCM$')
        else:a=None
        if a:emit(chapter,'corrections','solutions',['Corrigés et accompagnement','Solutions and guidance'],course+'-teacher',a[0],te,'teacher',bounds=(a,(te,0)))

# Seconde fluency booklets map to their actual source topics, not guessed page offsets.
for role in ['student','teacher']:
    doc=docs['autom-'+role];toc=[(tidy(t),p-1) for l,t,p in doc.get_toc() if l==1]
    indices=list(range(1,15))
    for j,cidx in enumerate(indices):
        title,start=toc[j];end=toc[j+1][1] if j+1<len(toc) else len(doc)
        ch=catalog['chapters'][cidx]
        emit(ch,'fluency-'+role,'fluency' if role=='student' else 'solutions',['Automatismes · '+('élève' if role=='student' else 'professeur'),'Fluency · '+role],'autom-'+role,start,end,role)

# Standalone appendix / assessment banks retain their complete context.
appendices={'premiere':[('Raisonnement et préparation', 'Reasoning and preparation',93,97,'notes'),('Banque d’automatismes','Fluency bank',97,105,'fluency'),('Évaluations annuelles','Annual assessments',105,122,'assessment')], 'terminale':[('Banque d’automatismes','Fluency bank',110,118,'fluency'),('Raisonnement, algorithmique et démonstrations','Reasoning, algorithms and proofs',121,128,'notes'),('Évaluations annuelles','Annual assessments',128,165,'assessment')], 'stmg':[('Devoirs surveillés','Written assessments',127,142,'assessment'),('Formulaire raisonné','Formula reference',142,143,'notes')]}
for course,items in appendices.items():
    ch={'id':course+'-revision','course':course,'number':0,'title':['Ressources transversales','Cross-chapter resources'],'topic':'review','labs':[]}
    catalog['chapters'].append(ch)
    for j,(fr,en,a,b,kind) in enumerate(items):emit(ch,'bank-'+str(j),kind,[fr,en],course+'-student',a,b)

(OUT/'catalog.json').write_text(json.dumps(catalog,ensure_ascii=False,indent=2))
print(json.dumps({'chapters':len(catalog['chapters']),'resources':len(catalog['resources']),'bytes':sum(r['bytes'] for r in catalog['resources'])}))
