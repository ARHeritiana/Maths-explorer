"""Apply a coherent PDF frame and palette without reflowing equations or figures.

Idempotent via PDF subject marker. Existing page count, text, page links and
page size remain unchanged. Content is scaled only when existing margins are
too narrow for the header; the verification ledger records that scale.
"""
import fitz,json,re,hashlib,sys
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1];DIST=ROOT/'dist';MARK='Maths Explorer document theme v1'
sys.path.insert(0,str(ROOT/'tests'))
import banned   # personal-space link pattern shared with the checks
font='/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf';bold='/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'
navy=(11/255,18/255,36/255);mint=(117/255,239/255,201/255);violet=(181/255,165/255,1)
# Only RGB graphics operators in decoded content streams are recoloured; text
# strings, image data, coordinates and mathematical operators are untouched.
rgb=re.compile(rb'(?<![\w.])(-?(?:\d*\.\d+|\d+))\s+(-?(?:\d*\.\d+|\d+))\s+(-?(?:\d*\.\d+|\d+))\s+(rg|RG)\b')
def color(m):
 v=[float(m[i]) for i in (1,2,3)]
 if not all(0<=x<=1 for x in v) or max(v)-min(v)<.08:return m[0]
 # Preserve neutral text and backgrounds. Map saturated semantic colour families
 # to the print palette, while pale fills retain their original luminance.
 r,g,b=v
 if min(v)>.7:
  z=(.94,.96,.98) if b>=r else (.94,.93,.98) if r>g else (.92,.97,.95)
 elif r>g*1.35 and r>b*1.25:z=(.64,.26,.35) # warning / counterexample
 elif r>.55 and g>.25 and b<g*.8:z=(.48,.36,.66) # warm callout -> violet
 elif g>r and g>=b*.85:z=(.09,.40,.33) # mint ink
 else:z=(.22,.32,.52) # navy-blue diagrams/headings
 return (' '.join(f'{x:.4f}' for x in z)+' '+m[4].decode()).encode()
ledger=[]
previous=ROOT/'docs/DOCUMENT_STYLE_LEDGER.json'
known={d['path']:d for d in json.loads(previous.read_text())['documents']} if previous.exists() else {}
# Optional arguments restrict styling to the given PDFs (paths under dist/resources).
only={Path(a).resolve() for a in sys.argv[1:]}
for path in sorted((DIST/'resources').rglob('*.pdf')):
 if 'enrichment' in path.parts:continue
 if only and path.resolve() not in only:continue
 source=fitz.open(path)
 # Overlay-era files carry the marker in their subject; TeX-built files are recognised by the ledger hash.
 rel=str(path.relative_to(DIST))
 if MARK in source.metadata.get('subject','') or (rel in known and known[rel]['sha256']==hashlib.sha256(path.read_bytes()).hexdigest()):source.close();continue
 original_text=[''.join(p.get_text().split()) for p in source]
 # Stream substitution preserves all non-colour drawing commands and text.
 stream_ids=set()
 for page in source:
  stream_ids.update(page.get_contents())
  stream_ids.update(x[0] for x in page.get_xobjects())
 for xref in stream_ids:
  if source.xref_is_stream(xref):
   raw=source.xref_stream(xref);changed=rgb.sub(color,raw)
   if changed!=raw:source.update_stream(xref,changed)
 out=fitz.open();scales=[];pending_links=[];transforms=[]
 for i,old in enumerate(source):
  w,h=old.rect.width,old.rect.height
  # Bound text, images and drawn geometry to choose a safe content area.
  rects=[fitz.Rect(b['bbox']) for b in old.get_text('dict')['blocks']]
  rects += [d['rect'] for d in old.get_drawings() if d['rect'].height<h*.95 and d['rect'].width<w*.99]
  if rects:
   bounds=rects[0]
   for box in rects[1:]:bounds |= box
  else:bounds=old.rect
  scale=min(1,(h-94)/max(bounds.height,1),(w-46)/max(bounds.width,1))
  scale=max(.75,scale)
  # Use a clip encompassing all content so blank margins do not force shrinkage.
  clip=fitz.Rect(max(0,bounds.x0-3),max(0,bounds.y0-3),min(w,bounds.x1+3),min(h,bounds.y1+3))
  dest=fitz.Rect(23,52,w-23,h-38)
  page=out.new_page(width=w,height=h)
  actual=min(1,dest.width/clip.width,dest.height/clip.height)
  target=fitz.Rect((w-clip.width*actual)/2,52,(w+clip.width*actual)/2,52+clip.height*actual)
  page.show_pdf_page(target,source,i,clip=clip,keep_proportion=True)
  transforms.append((target,clip,actual))
  page.draw_rect(fitz.Rect(0,0,w,34),color=None,fill=navy)
  page.draw_line((23,35),(w-23,35),color=mint,width=1.5)
  page.insert_font(fontname='Explorer',fontfile=font);page.insert_font(fontname='ExplorerBold',fontfile=bold)
  page.insert_text((23,23),'MATHS EXPLORER',fontname='ExplorerBold',fontsize=10,color=mint)
  lang='EN' if path.stem.endswith('-en') else 'FR'
  page.insert_text((w-42,23),lang,fontname='Explorer',fontsize=8,color=violet)
  page.draw_line((23,h-27),(w-23,h-27),color=(.8,.85,.9),width=.5)
  page.insert_text((23,h-14),'Observer. Conjecturer. Démontrer.' if lang=='FR' else 'Observe. Conjecture. Prove.',fontname='Explorer',fontsize=7,color=(.32,.38,.47))
  page.insert_text((w-64,h-14),f'{i+1} / {len(source)}',fontname='Explorer',fontsize=7,color=(.32,.38,.47))
  # Preserve safe local GoTo links and public reference links at transformed rects.
  sx=target.width/clip.width;sy=target.height/clip.height
  for link in old.get_links():
   if link['kind'] not in [fitz.LINK_GOTO,fitz.LINK_URI]:continue
   if banned.PERSONAL.search(link.get('uri','')):continue
   box=link['from'];new={'kind':link['kind'],'from':fitz.Rect(target.x0+(box.x0-clip.x0)*sx,target.y0+(box.y0-clip.y0)*sy,target.x0+(box.x1-clip.x0)*sx,target.y0+(box.y1-clip.y0)*sy)}
   if link['kind']==fitz.LINK_URI:new['uri']=link['uri']
   else:
    # Destination pages are inserted after all pages exist.
    new.update(page=link['page'],to=link.get('to',fitz.Point(0,0)))
    pending_links.append((i,new))
   if link['kind']==fitz.LINK_URI:page.insert_link(new)
  scales.append(round(actual,4))
 for page_index,link in pending_links:
  if 0<=link['page']<len(out):
   target,clip,scale=transforms[link['page']];point=link['to']
   link['to']=fitz.Point(target.x0+(point.x-clip.x0)*scale,target.y0+(point.y-clip.y0)*scale)
   out[page_index].insert_link(link)
 out.set_metadata({'title':source.metadata.get('title',''),'author':'Maths Explorer'}) # metadata: title and author only
 toc=source.get_toc();
 if toc:out.set_toc(toc)
 # Check every original text character remains present in extraction order.
 for old,page in zip(original_text,out):
  if old not in ''.join(page.get_text().split()):raise ValueError(f'Content changed in {path}, page {page.number+1}')
 out.subset_fonts();tmp=path.with_suffix('.theme.pdf');out.save(tmp,garbage=4,deflate=True);out.close();source.close();tmp.replace(path)
 ledger.append({'path':str(path.relative_to(DIST)),'pages':len(scales),'minimumScale':min(scales),'sha256':hashlib.sha256(path.read_bytes()).hexdigest()})
 if len(ledger)%60==0:print(f'Styled {len(ledger)} PDFs',flush=True)
if ledger:
 known.update({d['path']:d for d in ledger})
 previous.write_text(json.dumps({'theme':MARK,'documents':[known[k] for k in sorted(known)],'verification':'Every original whitespace-normalized text sequence retained; page counts unchanged.'},indent=2)+'\n')
print(f'Styled {len(ledger)} existing PDFs.',flush=True)
