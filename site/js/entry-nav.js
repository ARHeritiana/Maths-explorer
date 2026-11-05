// Compact collection navigation: previous/next entries, with the full list on demand.
const esc = (x) => String(x).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
// groups: [{ label: [fr, en] | null, items: [{ href, title: [fr, en], id }] }]; current: the id of the open entry.
export function withEntryNav(mainHtml, { t, label, title, groups, current }) {
  const all = groups.flatMap((g) => g.items);
  let n = 0;
  const body = groups.map((g) => `${g.label ? `<p class="group-label">${esc(t(g.label))}</p>` : ''}${g.items.map((x) => {
    n += 1; const on = x.id === current;
    return `<a href="${esc(x.href)}" class="lab-link${on ? ' selected' : ''}"${on ? ' aria-current="page"' : ''}><span class="lab-symbol" aria-hidden="true">${String(n).padStart(2, '0')}</span><span>${esc(t(x.title))}</span></a>`;
  }).join('')}`).join('');
  const at=all.findIndex(x=>x.id===current),prev=all[at-1],next=all[at+1];
  const step=(x,back)=>x?`<a class="entry-step" rel="${back?'prev':'next'}" href="${esc(x.href)}"><small>${t(back?['Précédent','Previous']:['Suivant','Next'])}</small><span>${back?'← ':''}${esc(t(x.title))}${back?'':' →'}</span></a>`:'<span></span>';
  return `<div class="lab-layout entry-layout"><aside class="sidebar entry-sidebar" aria-label="${esc(t(label))}"><nav class="entry-steps" aria-label="${t(['Dans cette collection','In this collection'])}">${step(prev,true)}${step(next,false)}</nav><details class="entry-chooser secondary-tools"><summary>${t(['Choisir dans la collection','Choose from the collection'])} · ${esc(t(title))} (${all.length})</summary><div class="lab-links">${body}</div></details></aside>${mainHtml}</div>`;
}
