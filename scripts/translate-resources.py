"""Produce English reading editions, preserving original mathematical graphics.

Usage: python scripts/translate-resources.py /path/to/translate-fr_en-1_9
Uses the Argos French-English 1.9 model locally; no document is sent to a service.
All source pages and prose spans are covered, including companion PDF assets.
"""
import json,re,sys,hashlib,collections
from pathlib import Path
import fitz,runpy

ROOT=Path(__file__).resolve().parents[1]
terminology=runpy.run_path(str(ROOT/'scripts/translation-terminology.py'))
MODEL=Path(sys.argv[1])
CACHE=ROOT/'docs/translation-cache.json'
cache=json.loads(CACHE.read_text()) if CACHE.exists() else {}
pdfs=sorted(p for p in (ROOT/'dist/resources').rglob('*.pdf') if not p.stem.endswith('-en'))
if len(sys.argv)>2:
    selected={str(Path(x)) for x in sys.argv[2:]}
    pdfs=[p for p in pdfs if str(p.relative_to(ROOT)) in selected]
MATH_NAMES={'sin','cos','tan','ln','log','exp','lim','max','min','sup','inf','det','mod','dim','arg','Re','Im','cov','Var','Card','Pr'}
GLOSSARY={'Pour':'For','pour':'for','et':'and','Et':'And','ou':'or','Ou':'Or','de':'of','du':'of','des':'of','le':'the','la':'the','les':'the','est':'is','sont':'are','tel que':'such that','tels que':'such that','telle que':'such that','telles que':'such that','avec':'with','dans':'in','donc':'so','car':'since','si':'if','alors':'then','Soit':'Let','Soient':'Let','soit':'let','où':'where','à':'to','On a':'We have','Correction :':'Solution:','Correction':'Solution','Corrigé':'Solutions','Démonstration':'Proof','Démonstration à rédiger.':'Write a proof.','Définitions':'Definitions','Définition':'Definition','Propriété':'Property','Propriétés':'Properties','Théorème':'Theorem','Exemple':'Example','Remarque':'Remark','Exercice':'Exercise','Exercices':'Exercises','Rappel':'Reminder','réels':'real numbers','une primitive de':'an antiderivative of','est une primitive de':'is an antiderivative of','par récurrence':'by induction','raison':'common difference / ratio','suite':'sequence','Suites':'Sequences','Séquence n':'Unit no.'}
FRENCH_CODE=re.compile(r'(?i)\b(calculer|saisir|afficher|retourner|pour|tant|sinon|variable|nombre|fonction|entier|résultat|somme|tirage)\b')
def units(page):
    out=[]
    for block_index,b in enumerate(page.get_text('dict')['blocks']):
        for line in b.get('lines',[]):
            spans=line['spans']
            for i,s in enumerate(spans):
                text=s['text'];stripped=text.strip()
                # Keep math fonts, symbols, numerical expressions and code intact.
                if not stripped or re.search(r'Math|Symbol|MSBM|CMSY|CMEX',s['font'],re.I):continue
                words=re.findall(r'[A-Za-zÀ-ÿ]{2,}',stripped)
                if (not words and stripped not in GLOSSARY) or (words and all(w in MATH_NAMES for w in words)):continue
                if re.search(r'Ital',s['font']) and len(stripped)<=4:continue
                if 'Mono' in s['font'] and not FRENCH_CODE.search(text):continue
                if 'Mono' in s['font'] and re.search(r'[=()]',text) and not stripped.startswith('#'):continue
                if '://' in text or 'AI-generated original' in text:continue
                rect=fitz.Rect(s['bbox'])
                # Allow trailing whitespace up to the next retained span, never an equation.
                right=rect.x1
                if i+1<len(spans):right=max(right,spans[i+1]['bbox'][0]-.6)
                else:right=min(page.rect.width-35,right+8)
                direction=line.get('dir',(1,0))
                rotate=90 if direction[1]<-.9 else 270 if direction[1]>.9 else 0
                out.append({'text':text,'key':stripped,'rect':list(rect),'origin':s['origin'],'font':s['font'],'size':s['size'],'color':s['color'],'right':right,'rotate':rotate,'block':block_index,'blockLeft':b['bbox'][0]})
    # Reconstruct words hyphenated across source lines before translation.
    for a,b in zip(out,out[1:]):
        if a['key'].endswith('-') and 0<b['origin'][1]-a['origin'][1]<30 and (abs(a['origin'][0]-b['origin'][0])<100 or abs(a['blockLeft']-b['origin'][0])<35):
            suffix=re.match(r'^([A-Za-zÀ-ÿ]+[.,;:]?)(.*)$',b['key'])
            if suffix:
                a['key']=a['key'][:-1]+suffix[1];b['key']=suffix[2].strip()
    return out

items=[];all_keys=set()
for path in pdfs:
    with fitz.open(path) as doc:
        pages=[units(p) for p in doc]
    items.append((path,pages));all_keys.update(u['key'] for page in pages for u in page if u['key'])
dotted={key:re.sub(r'(?:\.\s*){4,}$','',key).rstrip() for key in all_keys if re.search(r'(?:\.\s*){4,}$',key)}
all_keys.update(dotted.values())
missing=sorted(all_keys-cache.keys(),key=len)
print(f'{len(pdfs)} PDFs; {sum(len(x[1]) for x in items)} pages; {len(all_keys)} unique prose spans; {len(missing)} pending',flush=True)
cache.update({k:v for k,v in terminology['EXACT'].items() if k in all_keys})
cache.update({k:v for k,v in GLOSSARY.items() if k in all_keys and k not in cache})
missing=sorted(all_keys-cache.keys(),key=len)
if missing:
    import ctranslate2,sentencepiece
    sp=sentencepiece.SentencePieceProcessor(model_file=str(MODEL/'sentencepiece.model'))
    translator=ctranslate2.Translator(str(MODEL/'model'),device='cpu',compute_type='int8',inter_threads=2,intra_threads=4)
def clean(text,source=''):
    text=text.strip().replace('▁',' ')
    text=re.sub(r'\bprimitive(s)?\b',lambda m:'antiderivative'+('s' if m[1] else ''),text)
    text=text.replace('by recurrence','by induction').replace('arithmetic suite','arithmetic sequence').replace('geometric suite','geometric sequence')
    replacements={}
    if re.search(r'\bsuites?\b',source,re.I):replacements.update({'suite':'sequence','sequel':'sequence','suites':'sequences','sequels':'sequences'})
    if re.search(r'\bdiviseurs?\b',source,re.I):replacements.update({'divider':'divisor','dividers':'divisors','splitters':'divisors'})
    if re.search(r'\bdivise\b',source,re.I):replacements.update({'split':'divides','divides':'divides','divide':'divides'})
    if re.search(r'\bentiers?\b',source,re.I):replacements.update({'whole':'integer','wholes':'integers','entire':'integer'})
    if re.search(r'automatismes?',source,re.I):replacements.update({'automation':'fluency','automatisms':'fluency','automations':'fluency'})
    if re.search(r'contraposée',source,re.I):replacements.update({'constraint':'contrapositive','contraposed':'contrapositive'})
    if re.search(r'réciproque',source,re.I):replacements.update({'reciprocating':'converse','reciprocal':'converse'})
    if re.search(r'dérivée',source,re.I):replacements.update({'derived':'derivative'})
    if re.search(r'raison',source,re.I):
        noun='common ratio' if re.search(r'géométrique',source,re.I) else 'common difference' if re.search(r'arithmétique',source,re.I) else 'common difference / ratio'
        replacements.update({'reason':noun})
    if re.search(r'\beffectifs?\b',source,re.I):replacements.update({'staffing':'count','employees':'observations'})
    if re.search(r'\bnœuds?\b',source,re.I):replacements.update({'knot':'node','knots':'nodes'})
    if re.search(r'monoton',source,re.I):replacements.update({'monotony':'monotonicity'})
    if re.search(r'\bbornes?\b',source,re.I):replacements.update({'terminal':'bound','terminals':'bounds','border':'bound','borders':'bounds','pillar':'bound','pillars':'bounds'})
    if re.search(r'compétence',source,re.I):replacements.update({'jurisdiction':'skill','jurisdictions':'skills'})
    if re.search(r'variance',source,re.I):replacements.update({'variation':'variance'})
    if re.search(r'espéran',source,re.I):replacements.update({'hope':'expectation','hopes':'expectations','expectancy':'expectation'})
    if re.search(r'conditionnement',source,re.I):replacements.update({'packaging':'conditioning','packagings':'conditional probabilities'})
    if re.search(r'fonction inverse',source,re.I):replacements.update({'reverse function':'reciprocal function','inverse function':'reciprocal function'})
    if re.search(r'dérivabilité',source,re.I):replacements.update({'derivability':'differentiability','deviability':'differentiability','permissibility':'differentiability'})
    if re.search(r'(?:par|hypothèse de|raisonnement par|rédiger une) récurrence',source,re.I):replacements.update({'recurrence':'induction'})
    if re.search(r'encadrement',source,re.I):replacements.update({'supervision':'bounds','framing':'bounds'})
    if re.search(r'majorant',source,re.I):replacements.update({'majority':'upper bound','majorant':'upper bound'})
    if re.search(r'minorant',source,re.I):replacements.update({'minority':'lower bound','minorant':'lower bound'})
    if re.search(r'arbres?',source,re.I):replacements.update({'arber':'tree','arbers':'trees'})
    if re.search(r'loi (?:binomiale|normale|uniforme|exponentielle|de probabilité)',source,re.I):replacements.update({'law':'distribution'})
    if re.search(r'ordonnée',source,re.I):replacements.update({'orderly':'ordinate'})
    for old,new in replacements.items():
        text=re.sub(r'\b'+old+r'\b',lambda m:new.capitalize() if m[0][0].isupper() else new,text,flags=re.I)
    # A leading sentence separator also separates this prose from the preceding formula.
    if source.startswith(('.', ';', ':')) and not text.startswith(('.', ';', ':')):text=source[0]+' '+text
    return text
for start in range(0,len(missing),128):
    batch=missing[start:start+128]
    tokens=[sp.encode(x,out_type=str) for x in batch]
    results=translator.translate_batch(tokens,beam_size=4,replace_unknowns=True,max_batch_size=1600,batch_type='tokens',max_decoding_length=512)
    for key,result in zip(batch,results):
        translated=clean(''.join(result.hypotheses[0]).replace('▁',' '),key)
        if not translated:raise ValueError(f'Empty translation: {key}')
        cache[key]=GLOSSARY.get(key,translated)
    CACHE.write_text(json.dumps(cache,ensure_ascii=False,indent=2)+'\n')
    if start%512==0:print(f'Translated {min(start+len(batch),len(missing))}/{len(missing)} spans',flush=True)
# Override terminology even when resuming an older cache.
cache.update({k:v for k,v in GLOSSARY.items() if k in all_keys})
cache.update({k:clean(v,k) for k,v in cache.items()})
for key,base in dotted.items():cache[key]=cache[base]+' '+key[len(base):].strip()
cache.update({
    ' est l’ensemble des entiers naturels.':' is the set of natural numbers.',
    'est l’ensemble des entiers naturels.':'is the set of natural numbers.',
    'divise':'divides','diviseurs':'divisors','Entiers, multiples et diviseurs':'Integers, multiples and divisors',
    'ARITHMÉTIQUE':'ARITHMETIC','aussi que':'also that','de tout entier. Le seul multiple de 0 est 0.':'of every integer. The only multiple of 0 is 0.',
    'Dérivée de':'Derivative of','Cours':'Lesson','Notes de cours':'Course notes','Édition élève':'Student edition','Édition professeur':'Teacher edition',
    'janvier 2022, au 1':'January 2022, on 1','100, soit':'100, i.e.','On pose':'Set','l’on pose':'we set','On lance':'We roll','s’annule.':'is zero.','de somme.':'of the sum.','effectifs aux probabilités.':'counts with probabilities.','d’échecs serait':'failures would be','100 montre que ni positivité, ni':'100 shows that neither positivity nor','Objet':'Object','Effectif':'Count','Ici':'Here','Mise':'Stake','par 1':'by 1','par 2':'by 2','faux.':'false.','livré':'sent','sur tout':'on all','selon':'by','où':'where',
    '1. Que vaut':'1. Find','2 km.':'2 km.','Ici 2':'Here 2','Ici 3':'Here 3','Ici 4':'Here 4','Ici 5':'Here 5','OK':'OK',
    ', car':', since','[ car':'[since','3 car':'3 since','; il faut':'; we need','L’écart':'The gap','L’écart à':'The gap to','. Posons':'. Set','4 % et 39':'4% and 39','; raison':'; step / ratio','Raison':'Step / ratio','raison 1,15.':'ratio 1.15.','La raison est 1':'The ratio is 1','naison.':'slope.',
    'À retenir':'Key ideas','Compétence':'Skill','Terminale spécialité - 2026-2027':'Terminale specialty - 2026-2027','Première spécialité - 2026-2027':'Première specialty - 2026-2027','Seconde - 2026-2027':'Seconde - 2026-2027',
    'Conditionnement':'Conditional probability','Formulaire raisonné':'Formula sheet with explanations','Taux moyen':'Average growth rate','Ajustement affine':'Linear fit','Conditions d’existence':'Conditions for existence','Suite récurrente':'Recursively defined sequence','a espérance':'has expectation','ont espérance':'have expectation','109375. La borne vaut':'109375. The bound is','9). La borne 4 de':'9). The bound 4 from','est vraie. Par récurrence,':'holds. By induction,',
})
cache={k:terminology['correct_translation'](k,v) for k,v in cache.items()}
CACHE.write_text(json.dumps(cache,ensure_ascii=False,indent=2)+'\n')

ledger=[];small=[]
for number,(path,pages) in enumerate(items):
    with fitz.open(path) as original:
        translated=fitz.open()
        translated.insert_pdf(original,links=False,annots=False)
        for p,units_on_page in zip(translated,pages):
            for u in units_on_page:
                box=fitz.Rect(u['rect']);base=u['origin'][1]
                # Intersect each prose glyph, without touching adjacent mathematical text.
                box.x0+=.12;box.x1-=.12
                if u['rotate']:box.y0+=.12;box.y1-=.12
                else:box.y0=base-u['size']*.65;box.y1=base+.15
                p.add_redact_annot(box,fill=False,cross_out=False)
            # Remove extraction stamps and all links, keeping graphics and images.
            for b in p.get_text('blocks'):
                if 'AI-generated original' in b[4]:p.add_redact_annot(fitz.Rect(b[:4]),fill=(1,1,1))
            if units_on_page:p.apply_redactions(images=0,graphics=0,text=0)
            for u in units_on_page:
                if not u['key']:continue
                value=cache[u['key']]
                # Surrounding spaces in the original provide separation from math tokens.
                value=(' ' if u['text'].startswith(' ') else '')+value+(' ' if u['text'].endswith(' ') else '')
                font='tibi' if ('Bold' in u['font'] and 'Italic' in u['font']) else 'tibo' if 'Bold' in u['font'] else 'tiit' if 'Italic' in u['font'] else 'tiro'
                available=max(2,fitz.Rect(u['rect']).height if u['rotate'] else u['right']-u['origin'][0])
                width=fitz.get_text_length(value,fontname=font,fontsize=u['size'])
                scale=min(1,available/max(width,.01))
                # Keep source text height and baseline; condense the line horizontally
                # instead of making the whole paragraph miniature.
                size=u['size']
                if scale<.6:small.append({'file':str(path.relative_to(ROOT)),'page':p.number+1,'source':u['key'],'translation':value,'scale':round(scale,2)})
                color=u['color'];rgb=((color>>16)/255,((color>>8)&255)/255,(color&255)/255)
                matrix=fitz.Matrix(1,scale) if u['rotate'] else fitz.Matrix(scale,1)
                p.insert_text(u['origin'],value,fontname=font,fontsize=size,color=rgb,overlay=True,rotate=u['rotate'],morph=(fitz.Point(u['origin']),matrix))
        title=original.metadata.get('title') or path.stem
        translated.set_metadata({'title':cache.get(title,'Maths Explorer')+' — English edition','author':'Maths Explorer','subject':'English reading edition; equations, figures and source page order preserved.'})
        translated.set_toc([])
        target=path.with_name(path.stem+'-en.pdf')
        translated.save(target,garbage=4,deflate=True)
        ledger.append({'source':str(path.relative_to(ROOT/'dist')),'english':str(target.relative_to(ROOT/'dist')),'pages':len(pages),'proseSpans':sum(map(len,pages)),'sha256':hashlib.sha256(target.read_bytes()).hexdigest()})
        translated.close()
    if number%30==0:print(f'Wrote {number+1}/{len(items)} English PDFs',flush=True)
ledger_file=ROOT/'docs/TRANSLATION_LEDGER.json'
if len(sys.argv)>2 and ledger_file.exists():
    previous=json.loads(ledger_file.read_text());changed={x['source'] for x in ledger}
    ledger=sorted([x for x in previous['documents'] if x['source'] not in changed]+ledger,key=lambda x:x['source'])
    changed_files={str(p.relative_to(ROOT)) for p in pdfs}
    small=[x for x in previous['smallType'] if x['file'] not in changed_files]+small
ledger_file.write_text(json.dumps({'method':'Local Argos fr-en 1.9; original mathematical fonts and graphics retained; prose spans replaced.','documents':ledger,'smallType':small},ensure_ascii=False,indent=2)+'\n')
print(f'Done: {len(ledger)} English editions; {len(small)} short spans to inspect.',flush=True)
