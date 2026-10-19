// All entry points use the same collection records, including future additions.
export function universityPathway(index) {
  const total = index.sections.reduce((n, s) => n + s.sequences.length, 0);
  return {
    id: index.id, label: 'UNI', name: index.title,
    intro: [`${index.sections.length} collections · ${total} séquences. Cours, exercices, corrigés et explorations pour les études supérieures.`,
      `${index.sections.length} collections · ${total} sequences. Course notes, exercises, solutions and explorations for higher education.`],
    programmes: index.sections.map(section => ({
      id: section.id, name: section.title, intro: section.intro,
      stages: [{ name: [`${section.sequences.length} séquences · ${section.language.toUpperCase()}`, `${section.sequences.length} sequences · ${section.language.toUpperCase()}`],
        ids: [], note: section.audience || ['Documents et diaporamas interactifs de cette collection.', 'Documents and interactive slides in this collection.'] }],
      resources: [{ title: ['Explorer les ressources universitaires', 'Explore university resources'], href: '#university' },
        ...(section.sequences.length ? [{ title: ['Commencer cette collection', 'Start this collection'], href: '#university/' + section.sequences[0].id }] : [])]
    }))
  };
}

export function universitySlideLinks(index, lang = 0) {
  const E = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  return index.sections.map(section => `<section class="source-course"><h2>${E(section.title[lang])}</h2><p>${section.sequences.length} ${section.sequences.every(q=>q.edition==='lesson')?(lang?'web lessons':'leçons web'):(lang ? 'HTML explorations' : 'explorations HTML')} · ${section.language.toUpperCase()}</p><a href="#university">${section.sequences.every(q=>q.edition==='lesson')?(lang?'Notes, exercises and web lessons':'Cours, exercices et leçons web'):(lang ? 'Documents and interactive slides' : 'Documents et diaporamas interactifs')} →</a></section>`).join('');
}
