"""History atlas: responsive geometry, visibility transitions and real pointer/keyboard navigation."""
from playwright.sync_api import sync_playwright
import os
BASE=os.environ.get("MATHS_EXPLORER_URL","http://localhost:4173").rstrip("/")
results=[]
with sync_playwright() as p:
 options={'headless':True,'args':['--no-sandbox']}
 if os.environ.get('PLAYWRIGHT_CHROMIUM_PATH'): options['executable_path']=os.environ['PLAYWRIGHT_CHROMIUM_PATH']
 b=p.chromium.launch(**options)
 page=b.new_page(viewport={'width':1440,'height':1000},reduced_motion='reduce')
 page.set_default_navigation_timeout(120000)
 errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
 for lang in ['fr','en']:
  for kind in ['people','advances']:
   if kind=='people': page.goto(BASE+'/resources/history/mathematicians-timeline.html?lang='+lang,wait_until='networkidle')
   else:
    page.goto(BASE+'/#history/advances',wait_until='networkidle')
    page.locator('[data-lang="'+lang+'"]').click()
   page.evaluate('document.fonts.ready')
   for theme in ['jour','nuit']:
    page.evaluate('(theme)=>document.documentElement.dataset.theme=theme',theme)
    for width in [320,390,768,1440]:
     page.set_viewport_size({'width':width,'height':1000})
     for font in [100,200]:
      page.evaluate('(n)=>document.documentElement.style.fontSize=n+"%"',font);page.wait_for_timeout(80)
      assert page.evaluate('document.documentElement.scrollWidth<=innerWidth'),(lang,kind,theme,width,font,'page overflow')
      if width>600 and kind=='advances':
       overlap=page.locator('.history-atlas').evaluate('''el=>{const nodes=[...el.querySelectorAll('.history-node-body')].map(e=>e.getBoundingClientRect());let count=0;for(let i=0;i<nodes.length;i++)for(let j=i+1;j<nodes.length;j++){let a=nodes[i],b=nodes[j];if(a.left<b.right-.5&&a.right>b.left+.5&&a.top<b.bottom-.5&&a.bottom>b.top+.5)count++}return count}''')
       assert overlap==0,(lang,kind,theme,width,font,'node overlap',overlap)
      results.append([lang,kind,theme,width,font,'pass'])
    page.evaluate('document.documentElement.style.fontSize="100%"');page.set_viewport_size({'width':1440,'height':1000})
    if kind=='advances':
     page.locator('[data-history-era="structures"]').click();page.wait_for_timeout(100)

 page.goto(BASE+'/#history/people',wait_until='networkidle')
 page.wait_for_url('**/resources/history/mathematicians-timeline.html*')
 assert '/resources/history/mathematicians-timeline.html' in page.url
 assert '236' in page.locator('#total').inner_text()
 assert page.locator('.era-marker small').count()==0
 assert page.locator('.era-marker span').count()>0
 assert page.locator('.axis-label').count()>0
 assert page.locator('.century.loud').first.evaluate("e=>getComputedStyle(e,'::after').content")=='none'
 assert page.locator('.era-marker').first.evaluate("e=>getComputedStyle(e).borderLeftWidth")=='0px'
 assert page.locator('.topbar .brand').is_visible()
 assert page.locator('.subnav a[href="../../index.html#home"]').count()==0
 assert page.locator('.topbar .brand').get_attribute('href')=='../../index.html#home'
 assert page.locator('.topbar .mainnav a').count()==3
 # The whole chronology fits the stage height (no vertical scroll): rows shrink to fit, labelled rows stay legible.
 for vw,vh in [(1366,768),(1920,1080),(1440,1000)]:
  page.set_viewport_size({'width':vw,'height':vh});page.wait_for_timeout(250)
  fit=page.evaluate('''()=>{const s=document.getElementById('scroller'),r=s.getBoundingClientRect(),lives=[...document.querySelectorAll('.life')].map(e=>e.getBoundingClientRect());return {sh:s.scrollHeight,ch:s.clientHeight,vh:innerHeight,bottom:Math.max(...lives.map(l=>l.bottom)),axis:document.querySelector('.axis').getBoundingClientRect().bottom,rowH:Math.min(...lives.map(l=>l.height))}}''')
  assert fit['sh']<=fit['ch']+1,(vw,vh,'timeline scrolls vertically',fit)
  assert fit['bottom']<=fit['vh'] and fit['axis']<=fit['vh']+1,(vw,vh,'timeline bottom outside viewport',fit)
  assert fit['rowH']>=22,(vw,vh,'rows too small',fit)
 page.set_viewport_size({'width':1440,'height':1000});page.wait_for_timeout(250)
 page.locator('[data-theme-toggle]').click()
 assert page.evaluate("localStorage.getItem('maths-explorer-theme')")==page.evaluate('document.documentElement.dataset.theme')
 page.locator('[data-theme-toggle]').click()
 page.set_viewport_size({'width':390,'height':844})
 page.wait_for_timeout(100)
 assert page.locator('.life').first.evaluate('e=>e.getBoundingClientRect().height')>=44
 assert page.evaluate('document.documentElement.scrollWidth<=innerWidth')
 assert page.locator('.mainnav').is_visible()
 page.set_viewport_size({'width':1440,'height':1000})
 page.locator('#scroller').focus()
 page.keyboard.press('ArrowRight')
 assert page.locator('#scroller').evaluate('e=>e.scrollLeft')>0
 page.locator('#search').fill('Noether')
 page.locator('.result').first.click()
 assert 'Noether' in page.locator('#detail-name').inner_text()
 page.locator('#total').click()
 assert page.locator('.overlay.show').count()==0
 # Filtering in Reading and loading on a phone must both remeasure translated card heights when the atlas returns.
 page.goto(BASE+'/#history/advances',wait_until='networkidle')
 page.locator('button[data-history-view="list"]').click();page.locator('input[name=query]').fill('animateur')
 page.locator('button[data-history-view="atlas"]').click()
 assert page.locator('.history-node-body').evaluate('e=>e.getBoundingClientRect().bottom')<page.locator('.history-document-marker').evaluate('e=>e.getBoundingClientRect().top')
 page.set_viewport_size({'width':390,'height':844});page.reload(wait_until='networkidle');page.set_viewport_size({'width':1440,'height':1000});page.wait_for_timeout(100)
 assert page.locator('[data-history-id="monty-letters"] .history-node-body').evaluate('e=>e.getBoundingClientRect().bottom')<page.locator('[data-history-id="monty-letters"] .history-document-marker').evaluate('e=>e.getBoundingClientRect().top')
 page.goto(BASE+'/#history/people',wait_until='networkidle')
 page.wait_for_url('**/resources/history/mathematicians-timeline.html*')
 assert '/resources/history/mathematicians-timeline.html' in page.url
 page.locator('#search').fill('Noether')
 page.locator('.result').first.click()
 assert 'Noether' in page.locator('#detail-name').inner_text()
 for kind,id in [('people','mirzakhani'),('people','shannon'),('advances','elements')]:
  page.goto(f'{BASE}/#history/{kind}/{id}',wait_until='networkidle');page.locator('.history-credit summary').first.click()
  assert page.locator('.history-detail>header img').evaluate('e=>e.complete&&e.naturalWidth>0'),id
  assert not page.evaluate('/[–—]/.test(document.querySelector("main").textContent)'),id
 page.goto(BASE+'/#history/advances',wait_until='networkidle');assert page.locator('.history-node').count()==82
 page.locator('input[name=query]').fill('galois');assert page.locator('.history-node').count()==3
 page.locator('input[name=query]').fill('zzzzzzzz');assert page.locator('.history-empty').is_visible()
 page.locator('[data-history-reset]').click();assert page.locator('.history-node').count()==82
 assert not errors,errors
 b.close()
print(len(results),'layout combinations passed; keyboard, mouse pan, search, navigation, images and credits passed')
