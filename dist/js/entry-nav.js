// The list of entries of a collection, beside one open entry: the same sidebar as the gallery (a sticky column that scrolls on its
// own on wide screens, a strip of chips on phones). A page of a collection (a challenge, a biography, a story, an error) wraps its
// markup with `withEntryNav`, so that the next entry is one tap away whatever the length of the collection. The list keeps its
// scroll position across the page rebuild and shows the current entry (scroll-memory.js).
const esc = (x) => String(x).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
// groups: [{ label: [fr, en] | null, items: [{ href, title: [fr, en], id }] }]; current: the id of the open entry.
export function withEntryNav(mainHtml, { t, label, title, groups, current }) {
  const all = groups.flatMap((g) => g.items);
  let n = 0;
  const body = groups.map((g) => `${g.label ? `<p class="group-label">${esc(t(g.label))}</p>` : ''}${g.items.map((x) => {
    n += 1; const on = x.id === current;
    return `<a href="${esc(x.href)}" class="lab-link${on ? ' selected' : ''}"${on ? ' aria-current="page"' : ''}><span class="lab-symbol" aria-hidden="true">${String(n).padStart(2, '0')}</span><span>${esc(t(x.title))}</span></a>`;
  }).join('')}`).join('');
  return `<div class="lab-layout entry-layout"><aside class="sidebar entry-sidebar" aria-label="${esc(t(label))}"><div class="side-title">${esc(t(title))} <span>${String(all.length).padStart(2, '0')}</span></div><div class="lab-links">${body}</div></aside>${mainHtml}</div>`;
}
