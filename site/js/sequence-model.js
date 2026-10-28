// Chapter-specific progression assembled from the reviewed chapter decks.
// Only checked, self-contained worked examples may be offered as independent practice.
// In this chapter the TeX has a table after one example and Python code before another;
// both are absent from the extracted slide. Restore their original data on the web.
const intervalCases = [
  [String.raw`\(I=]-4;3],\quad J=[1;5]\)`, String.raw`\(I\cap J=[1;3],\quad I\cup J=]-4;5]\)`],
  [String.raw`\(I=]-\infty;2],\quad J=[-4;+\infty[\)`, String.raw`\(I\cap J=[-4;2],\quad I\cup J=\mathbb{R}\)`],
  [String.raw`\(I=]-\infty;7],\quad J=[7;+\infty[\)`, String.raw`\(I\cap J=\{7\},\quad I\cup J=\mathbb{R}\)`],
  [String.raw`\(I=]-\infty;5],\quad J=[-3;+\infty[\)`, String.raw`\(I\cap J=[-3;5],\quad I\cup J=\mathbb{R}\)`],
  [String.raw`\(I=]-2;0[,\quad J=]0;3]\)`, String.raw`\(I\cap J=\varnothing,\quad I\cup J=]-2;0[\cup]0;3]\)`],
];
const boundingProgram = '<pre class="sequence-code"><code>def encadre_racine2(p):\n' +
  '    q = 10**p\n    k = 0\n    while (k+1)**2 &lt;= 2*q*q:\n' +
  '        k = k+1\n    return k/q, (k+1)/q</code></pre>';
function restoreExerciseContext(deckId, slide) {
  if (deckId !== 'seconde-04' || slide.k !== 'example') return slide;
  const body = slide.b || [];
  if (body.some(s => /^(?:Compléter, en justifiant|Complete, justifying)/i.test(s || ''))) {
    const intro = [
      'Pour chaque paire d’intervalles ci-dessous, déterminer l’intersection et la réunion.',
      'For each pair of intervals below, find the intersection and the union.'
    ];
    const statements = body.map((s, L) => s ? s + '<p>' + intro[L] + '</p><ol>' +
      intervalCases.map(([given]) => '<li>' + given + '</li>').join('') + '</ol>' : s);
    const answers = (slide.a || ['', '']).map((s, L) => s ? '<ol>' +
      intervalCases.map(([, result]) => '<li>' + result + '</li>').join('') +
      '</ol><p>' + s + '</p>' : s);
    return {...slide, b: statements, a: answers, practiceReady: true, original: slide};
  }
  if (body.some(s => /^(?:Expliquer pourquoi cette fonction|Explain why this function)/i.test(s || ''))) {
    return {...slide, b: body.map(s => s ? boundingProgram + '<p>' + s + '</p>' : s), practiceReady: true, original: slide};
  }
  return slide;
}
export function sequenceModel(deck) {
  const lessons = [], tasks = [], activities = [], goals = [], diagnostics = [], checks = [];
  let current = null;
  for (const [index, original] of deck.slides.entries()) {
    const slide = restoreExerciseContext(deck.id, original);
    if (slide.k === 'title') continue;
    if(slide.stage==='diagnostic'){diagnostics.push(slide);continue;}
    if(slide.stage==='check'){checks.push(slide);continue;}
    if (slide.k === 'goals') { goals.push(slide); continue; }
    if (slide.k === 'widget' || slide.k === 'activity') { activities.push({ ...slide, index }); continue; }
    if (['concept', 'method', 'proof'].includes(slide.k)) {
      if (current && current.title[0] === slide.t[0]) current.statements.push(slide);
      else { current = { title: slide.t, statements: [slide], examples: [], warnings: [], tasks: [], index }; lessons.push(current); }
    } else if (slide.k === 'try') {
      const task = { ...slide, index, lesson: current?.title || slide.t };
      tasks.push(task); current?.tasks.push(task);
    } else if (slide.k === 'example') {
      if (!current) { current = { title: slide.t, statements: [], examples: [], warnings: [], tasks: [], index }; lessons.push(current); }
      current.examples.push(slide);
    } else if (slide.k === 'error') {
      current?.warnings.push(slide);
    } else {
      if (!current) { current = { title: slide.t, statements: [], examples: [], warnings: [], tasks: [], index }; lessons.push(current); }
      current.statements.push(slide);
    }
  }
  if (!tasks.length) for (const lesson of lessons) for (const slide of lesson.examples) if (slide.a && (slide.practiceReady || deck.id === 'seconde-04')) tasks.push({ ...slide, lesson:lesson.title, reused:true });
  return { goals, lessons, tasks, activities, diagnostics, checks };
}

export function goalFields(slides, language) {
  // Separate authored objectives and prerequisites; omit source-calendar dates.
  const fields = [];
  for (const s of slides) {
    const before=fields.length;
    for (const part of (s.b[language] || '').split(/<br\s*\/?>(?:\s*<br\s*\/?>)*/i)) {
      const match = part.match(/^\s*<(?:b|strong)>(.*?)<\/(?:b|strong)>\s*([\s\S]*)$/i);
      if (match && !/repère annuel|yearly|calend|durée|duration/i.test(match[1])) fields.push({ label: match[1].replace(/\.$/, ''), body: match[2] });
    }
    if(fields.length===before && s.b[language]?.trim()) fields.push({label:s.t[language],body:s.b[language]});
  }
  return fields;
}
