"""Build authored FR/EN enrichment resources with the site's document design."""
import json,html,subprocess,sys
from enrichment_sections import sections
from pathlib import Path
import fitz
ROOT=Path(__file__).resolve().parents[1];DIST=ROOT/'dist';OUT=DIST/'resources/enrichment';OUT.mkdir(exist_ok=True)
document_theme=(ROOT/'site/resources/document-theme.css').read_text()
packs=json.loads((ROOT/'content/data/enrichment.json').read_text())
sys.path.insert(0,str(ROOT/'build'))
from mxbuild.enrichment import web_tuples   # the PDFs' tuple rule, so the web text and the PDFs agree
def localise(v):
 if isinstance(v,dict):return {k:localise(x) for k,x in v.items()}
 if isinstance(v,list) and len(v)==2 and all(isinstance(x,str) for x in v):return list(web_tuples(*v))
 if isinstance(v,list):return [localise(x) for x in v]
 return v
packs=[localise(p) for p in packs]
labels={'notes':['Leçon et méthode','Lesson and method'],'exercises':['Exercices progressifs','Progressive exercises'],'problems':['Problème de synthèse','Synthesis problem'],'solutions':['Solutions détaillées','Worked solutions']}
esc=html.escape

if '--skip-pdf' not in sys.argv:   # TeX units generated from the JSON, compiled on the shared class (mxbuild.enrichment)
 subprocess.run([sys.executable,'-m','mxbuild','enrichment'],cwd=ROOT/'build',check=True)

# Maths is marked $...$ in the JSON (Unicode inside) for the TeX units; the web editions show the text without marks.
def plain(v):
 if isinstance(v,str):return v.replace('$','')
 if isinstance(v,list):return [plain(x) for x in v]
 if isinstance(v,dict):return {k:plain(x) for k,x in v.items()}
 return v

sys.path.insert(0,str(ROOT/'build'))
from mxbuild import catalog as manifest_io   # content/data/manifest.json is the source of truth
manifest=manifest_io.load();catalog=manifest['catalog']
# Explorations entries are rebuilt where they were, so catalogue order does not depend on the order builders run.
slot={k:next((i for i,x in enumerate(catalog[k]) if (x['id'] if k=='courses' else x.get('course'))=='explorations'),len(catalog[k])) for k in ('courses','chapters','resources')}
for key in ['chapters','resources']:catalog[key]=[x for x in catalog[key] if x.get('course')!='explorations']
catalog['courses']=[x for x in catalog['courses'] if x['id']!='explorations']
fresh={'courses':[{'id':'explorations','title':['Ateliers & approfondissements','Workshops & enrichment'],'curriculum':'shared'}],'chapters':[],'resources':[]}
for i,p in enumerate(packs,1):
 cid='explore-'+p['id'];fresh['chapters'].append({'id':cid,'course':'explorations','number':i,'title':p['title'],'topic':p['id'],'labs':p['labs'],'description':p['prerequisites'],'authored':True})
 for kind,title in labels.items():
  urls=[];html_urls=[];counts=[];sizes=[]
  for j,lang in enumerate(['fr','en']):
   stem=p['id']+'-'+kind+('-en' if j else '')
   target=OUT/(stem+'.pdf')
   html_sections=[]
   for heading,paras in sections(p,kind,j):
    html_sections.append('<section class="'+('worked' if heading in ['Exemple expliqué','Worked example'] else 'exercise' if kind=='exercises' else '')+'"><h2>'+esc(heading)+'</h2>'+''.join('<p>'+esc(plain(x))+'</p>' for x in paras)+'</section>')
   with fitz.open(target) as pdf:counts.append(len(pdf))
   sizes.append(target.stat().st_size);urls.append('./resources/enrichment/'+stem+'.pdf');html_urls.append('./resources/enrichment/'+stem+'.html')
   (OUT/(stem+'.html')).write_text('<!doctype html><html lang="'+lang+'"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>'+esc(p['title'][j])+' · '+esc(title[j])+'</title><style>'+document_theme+'</style></head><body><header><p>Maths Explorer · '+lang.upper()+f' · {i:02d}</p><h1>'+esc(p['title'][j])+'</h1><p>'+esc(title[j])+'</p><p class="level">'+esc(p['level'][j])+'</p></header><main>'+''.join(html_sections)+'</main><footer><div class="actions"><a href="'+stem+'.pdf">'+('Télécharger le PDF','Download PDF')[j]+'</a><button onclick="window.print()">'+('Imprimer','Print')[j]+'</button><a href="'+p['id']+'-'+kind+('' if j else '-en')+'.html">'+('English' if j==0 else 'Français')+'</a><a href="../../index.html#library/'+cid+'">'+('Bibliothèque','Resource library')[j]+'</a></div></footer></body></html>')
  fresh['resources'].append({'id':cid+'-'+kind,'chapter':cid,'course':'explorations','type':kind,'title':title,'language':'bilingual','audience':'teacher' if kind=='solutions' else 'student','format':'PDF','url':urls,'editions':{lang:{'path':urls[i],'htmlPath':html_urls[i]} for i,lang in enumerate(('fr','en'))},'htmlUrl':html_urls,'pages':counts[0],'englishPages':counts[1],'bytes':sizes[0],'englishBytes':sizes[1],'translation':'authored-bilingual','review':'calculated','contentKey':p['id']})
for k in ('courses','chapters','resources'):catalog[k][slot[k]:slot[k]]=fresh[k]
manifest_io.save(manifest);manifest_io.write()
(DIST/'js/enrichment-data.js').write_text('export const enrichment = '+json.dumps(plain(packs),ensure_ascii=False,indent=2)+';\n')
print(f'Created {len(packs)} bilingual packs: {8*len(packs)} PDFs and {8*len(packs)} HTML reading editions.')

