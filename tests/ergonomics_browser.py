"""Site-wide practical navigation, native disclosures and responsive page families."""
import os,shutil
from playwright.sync_api import sync_playwright
# The home is the visitor home by default (docs/AUDIENCE_MODES.md); these checks are about the student home.
STUDENT = "try{if(!localStorage.getItem('mx-teacher-entry'))localStorage.setItem('mx-teacher-entry','student')}catch(e){}"
BASE=os.environ.get('MATHS_EXPLORER_URL','http://localhost:4173').rstrip('/')
ROUTES=['home','resources/premiere','slides/premiere','bank/premiere','bank/annales','bank/seconde/seconde-01','chapter/premiere-02/cours','chapter/premiere-02/documents','topics','topics/analysis','lab','gallery','gallery/fourier','challenges','challenges/gauss-sum','biographies','stories','errors','errors/square-of-sum','olympiad','basics','automatismes','sheets']
with sync_playwright() as p:
 browser=p.chromium.launch(headless=True,executable_path=os.environ.get('PLAYWRIGHT_CHROMIUM_PATH') or shutil.which('chromium'))
 context=browser.new_context(locale='fr-FR',reduced_motion='reduce',viewport={'width':1440,'height':1000});context.add_init_script(STUDENT);page=context.new_page();errors=[]
 page.on('pageerror',lambda e:errors.append(str(e)))
 def go(route):
  page.goto(BASE+'/#'+route);page.locator('main').wait_for();page.wait_for_timeout(120)
 go('home');page.select_option('#home-class','stmg');assert page.locator('.mainnav [data-section="learn"]').get_attribute('href')=='#resources/stmg'
 page.locator('.mainnav [data-section="learn"]').click();
 assert page.locator('.subnav a[href="#automatismes"]').is_visible(), 'Automatismes must be visible in Apprendre'
 assert page.locator('.subnav a[href="#sheets"]').is_visible(), 'Fiches must be visible in Apprendre'
 page.locator('.res-rail [data-course="premiere"]').click()
 assert page.locator('.subnav [data-course-page="bank"]').get_attribute('href')=='#bank/premiere'
 page.locator('.subnav [data-course-page="bank"]').click();page.wait_for_url('**/#bank/premiere')
 page.locator('.subnav [data-course-page="slides"]').click();page.locator('.deck-card').first.wait_for()
 page.locator('[data-course="expertes"]').click();assert page.locator('.subnav [data-course-page="resources"]').get_attribute('href')=='#resources/expertes'
 go('chapter/premiere-02/cours');page.locator('#chapter-sequence[aria-busy="false"]').wait_for();go('sheets')
 assert page.locator('#gen-new').is_visible(), 'New worksheet variant must be visible without opening settings'
 assert page.locator('[name="cls"]').input_value()=='premiere'
 page.select_option('[name="cls"]','seconde');assert page.locator('.subnav [data-course-page="resources"]').get_attribute('href')=='#resources/seconde'
 page.locator('.chapter-options > summary').click();page.locator('[name="chapter"]').first.check();assert page.locator('.chapter-options > summary').inner_text().startswith('Chapitres : 1')
 page.locator('.advanced-settings > summary').click();page.fill('[name="seed"]','same-sheet');page.check('[name="two"]');assert page.locator('[data-subject="A"]').is_visible();assert page.locator('[data-subject="B"]').is_visible()
 page.locator('.export-options > summary').click()
 with page.expect_download() as download:page.locator('[data-act="tex-student"]').click()
 assert download.value.suggested_filename.endswith('.tex')
 go('automatismes')
 assert page.locator('#gen-new').is_visible(), 'New starter series must be visible without opening settings'
 go('bank/annales')
 assert page.locator('.annal-filters [name="course"]').count()==0
 year=page.locator('.annal-filters [name="year"]');notion=page.locator('.annal-filters [name="topic"]')
 assert not year.is_visible() and not notion.is_visible()
 page.select_option('.annal-filters [name="family"]','BAC')
 assert year.is_visible() and notion.is_visible()
 assert all('BAC' in text for text in page.locator('.annal-ex > summary strong').all_text_contents())
 year.select_option('2022');page.select_option('.annal-filters [name="family"]','E3C')
 assert year.input_value()==''
 page.locator('.annal-filters [type="reset"]').click()
 assert not year.is_visible() and not notion.is_visible()
 go('gallery/fourier');assert page.locator('.entry-chooser').get_attribute('open') is None
 page.locator('.entry-chooser > summary').click();assert page.locator('.entry-chooser .lab-link').count()>20
 for collection in ['gallery','challenges','biographies','stories','errors']:
  go(collection);entry=page.locator(f'main a[href^="#{collection}/"]').first.get_attribute('href');go(entry[1:])
  chooser=page.locator('.entry-chooser');assert chooser.get_attribute('open') is None
  chooser.locator('summary').click();items=chooser.locator('.lab-link');assert items.count()>=4
  target=items.last.get_attribute('href');items.last.click();page.wait_for_function('(h)=>location.hash===h',arg=target)
  page.locator('.entry-chooser > summary').wait_for();assert page.locator('.entry-chooser').get_attribute('open') is None
  assert page.locator('.entry-chooser [aria-current="page"]').get_attribute('href')==target
  assert page.locator('.entry-steps [rel="prev"]').count()==1
 go('topics');assert not page.locator('#discovery-results').is_visible();page.fill('[name="query"]','dériv');assert page.locator('#discovery-results').is_visible();assert page.locator('.discovery-card').count()>0
 go('lab');page.select_option('#lab-field','analysis');assert page.locator('.lab2-card-link:visible').count()<42
 checked=0;overflows=[]
 for route in ROUTES:
  go(route)
  if route=='bank/annales':page.select_option('.annal-filters [name="family"]','BAC')
  if route.startswith('slides'):page.locator('.deck-card').first.wait_for()
  if route.startswith('chapter/'):page.locator('#chapter-sequence[aria-busy="false"]').wait_for()
  for width in [320,390,768,1440]:
   page.set_viewport_size({'width':width,'height':900})
   for theme in ['jour','nuit']:
    page.evaluate('(t)=>document.documentElement.dataset.theme=t',theme)
    for size in ['100%','200%']:
     page.evaluate('(s)=>document.documentElement.style.fontSize=s',size)
     if page.evaluate('document.documentElement.scrollWidth>innerWidth+2'):overflows.append((route,width,theme,size))
     checked+=1
   page.evaluate("document.documentElement.style.fontSize='100%'")
  if route in ['sheets','automatismes']:
   page.set_viewport_size({'width':320,'height':900})
   page.locator('.advanced-settings > summary').click();page.locator('.export-options > summary').click();page.locator('.chapter-options > summary').click()
   assert page.evaluate('document.documentElement.scrollWidth<=innerWidth+2'),(route,'expanded options')
 # Generated series are seeded at random: sweep fixed seeds so formulas of every shape (including their assistive MathML) are covered on any day.
 for route in ['automatismes','sheets']:
  go(route);page.locator('.advanced-settings > summary').click()
  for seed in ['s5','s7','s8','s10','s21','s33','s46','s52','s58','s2','s3','s4']:
   page.fill('[name="seed"]',seed);page.wait_for_timeout(60)
   for width in [320,390,768,1440]:
    page.set_viewport_size({'width':width,'height':900})
    for theme in ['jour','nuit']:
     page.evaluate('(t)=>document.documentElement.dataset.theme=t',theme)
     for size in ['100%','200%']:
      page.evaluate('(s)=>document.documentElement.style.fontSize=s',size)
      if page.evaluate('document.documentElement.scrollWidth>innerWidth+2'):overflows.append((route,'seed '+seed,width,theme,size))
      checked+=1
   page.evaluate("document.documentElement.style.fontSize='100%'")
 assert not errors,errors
 assert not overflows,overflows
 browser.close();print(f'Ergonomics passed: shared class context, real downloads, collection chooser, filters and {checked} responsive page/theme combinations.')
