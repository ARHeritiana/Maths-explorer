// Group optional classroom settings, keeping the new-series controls visible and usable.
export function organizePage(root,t) {
 const form=root?.querySelector('#gen-form');if(!form)return ()=>{};
 const doc=root.ownerDocument;
 const group=(parent,label,nodes,cls='')=>{
  nodes=nodes.filter(Boolean);if(!nodes.length)return null;
  const details=doc.createElement('details');details.className='secondary-tools '+cls;
  const summary=doc.createElement('summary');summary.textContent=label;details.append(summary);
  const body=doc.createElement('div');body.className='secondary-tools-body';details.append(body);
  parent.append(details);nodes.forEach(node=>body.append(node));return details;
 };
 const chapters=form.querySelector('#gen-chapters');
 const chapterGroup=group(form,t(['Choisir les chapitres','Choose chapters']),[chapters],'chapter-options');
 if(chapterGroup)form.firstElementChild?.after(chapterGroup);
 const extra=[form.querySelector('#gen-domains'),form.querySelector('#gen-levels'),
  form.elements.order?.closest('label'),form.elements.parts?.closest('label'),
  ...form.querySelectorAll(':scope > .gen-check'),form.querySelector('.gen-total'),
  ...form.querySelectorAll(':scope > p.muted')];
 group(form,t(['Réglages avancés','More settings']),extra,'advanced-settings');
 const actions=root.querySelector('.gen-actions');
 if(actions)group(actions,t(['Autres impressions et téléchargements','More printing and downloads']),
  [...actions.querySelectorAll(':scope > button[data-act]')].filter(b=>!['project','print-student'].includes(b.dataset.act)),'export-options');
 const update=()=>{
  const a=root.querySelector('[data-subject="A"]'),b=root.querySelector('[data-subject="B"]');if(a&&b){a.hidden=b.hidden;const sep=root.querySelector('.gen-sep');if(sep)sep.hidden=b.hidden;}
  if(!chapterGroup)return;
  const n=form.querySelectorAll('[name="chapter"]:checked').length;
  chapterGroup.querySelector('summary').textContent=n?t([`Chapitres : ${n} sélectionné${n>1?'s':''}`,`Chapters: ${n} selected`]):t(['Chapitres : tous','Chapters: all']);
 };
 form.addEventListener('change',update);update();
 return ()=>form.removeEventListener('change',update);
}
