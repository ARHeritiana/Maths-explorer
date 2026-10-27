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
  page.goto(BASE+'/#history',wait_until='networkidle')
  page.locator('[data-lang="'+lang+'"]').click()
  for kind in ['people','advances']:
   page.goto(BASE+'/#history/'+kind,wait_until='networkidle');page.evaluate('document.fonts.ready')
   for theme in ['jour','nuit']:
    page.evaluate('(theme)=>document.documentElement.dataset.theme=theme',theme)
    for width in [320,390,768,1440]:
     page.set_viewport_size({'width':width,'height':1000})
     for font in [100,200]:
      page.evaluate('(n)=>document.documentElement.style.fontSize=n+"%"',font);page.wait_for_timeout(80)
      assert page.evaluate('document.documentElement.scrollWidth<=innerWidth'),(lang,kind,theme,width,font,'page overflow')
      if width>600:
       overlap=page.locator('.history-atlas').evaluate('''el=>{const nodes=[...el.querySelectorAll('.history-node-body')].map(e=>e.getBoundingClientRect());let count=0;for(let i=0;i<nodes.length;i++)for(let j=i+1;j<nodes.length;j++){let a=nodes[i],b=nodes[j];if(a.left<b.right-.5&&a.right>b.left+.5&&a.top<b.bottom-.5&&a.bottom>b.top+.5)count++}return count}''')
       assert overlap==0,(lang,kind,theme,width,font,'node overlap',overlap)
      results.append([lang,kind,theme,width,font,'pass'])
    page.evaluate('document.documentElement.style.fontSize="100%"');page.set_viewport_size({'width':1440,'height':1000})
    page.locator('[data-history-era="structures"]').click();page.wait_for_timeout(100)

 page.goto(BASE+'/#history/people',wait_until='networkidle')
 page.locator('#history-viewport').focus();page.keyboard.press('Home');assert page.locator('#history-viewport').evaluate('e=>e.scrollLeft')==0
 page.keyboard.press('ArrowRight');assert page.locator('#history-viewport').evaluate('e=>e.scrollLeft')>0
 page.locator('[data-history-era="methods"]').click();old=page.locator('#history-viewport').evaluate('e=>e.scrollLeft')
 viewport=page.locator('#history-viewport');viewport.scroll_into_view_if_needed();box=viewport.bounding_box()
 page.mouse.move(box['x']+500,box['y']+100);page.mouse.down();page.mouse.move(box['x']+300,box['y']+100,steps=8);page.mouse.up()
 assert viewport.evaluate('e=>e.scrollLeft')>old,'mouse background pan'
 # Filtering in Reading and loading on a phone must both remeasure translated card heights when the atlas returns.
 page.goto(BASE+'/#history/advances',wait_until='networkidle')
 page.locator('button[data-history-view="list"]').click();page.locator('input[name=query]').fill('animateur')
 page.locator('button[data-history-view="atlas"]').click()
 assert page.locator('.history-node-body').evaluate('e=>e.getBoundingClientRect().bottom')<page.locator('.history-document-marker').evaluate('e=>e.getBoundingClientRect().top')
 page.set_viewport_size({'width':390,'height':844});page.reload(wait_until='networkidle');page.set_viewport_size({'width':1440,'height':1000});page.wait_for_timeout(100)
 assert page.locator('[data-history-id="monty-letters"] .history-node-body').evaluate('e=>e.getBoundingClientRect().bottom')<page.locator('[data-history-id="monty-letters"] .history-document-marker').evaluate('e=>e.getBoundingClientRect().top')
 page.goto(BASE+'/#history/people',wait_until='networkidle')
 page.locator('input[name=query]').fill('noether');assert page.locator('.history-node').count()==1
 page.locator('.history-node').click();page.locator('.history-detail h1').wait_for();assert 'Noether' in page.locator('h1').inner_text()
 page.locator('.history-credit summary').click();assert 'Public domain' in page.locator('.history-credit').inner_text()
 assert page.locator('.history-detail>header img').evaluate('e=>e.complete&&e.naturalWidth>0')
 for kind,id in [('people','mirzakhani'),('people','shannon'),('advances','elements')]:
  page.goto(f'{BASE}/#history/{kind}/{id}',wait_until='networkidle');page.locator('.history-credit summary').first.click()
  assert page.locator('.history-detail>header img').evaluate('e=>e.complete&&e.naturalWidth>0'),id
  assert not page.evaluate('/[–—]/.test(document.querySelector("main").textContent)'),id
 page.goto(BASE+'/#history/advances',wait_until='networkidle');assert page.locator('.history-node').count()==56
 page.locator('input[name=query]').fill('galois');assert page.locator('.history-node').count()==3
 page.locator('input[name=query]').fill('zzzzzzzz');assert page.locator('.history-empty').is_visible()
 page.locator('[data-history-reset]').click();assert page.locator('.history-node').count()==56
 assert not errors,errors
 b.close()
print(len(results),'layout combinations passed; keyboard, mouse pan, search, navigation, images and credits passed')
