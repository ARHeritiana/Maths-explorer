// Chapter-specific progression assembled from the reviewed chapter decks.
export function sequenceModel(deck) {
  const lessons = [], tasks = [], activities = [], goals = [], diagnostics = [], checks = [];
  let current = null;
  for (const [index, slide] of deck.slides.entries()) {
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
  if (!tasks.length) for (const lesson of lessons) for (const slide of lesson.examples) if (slide.a) tasks.push({ ...slide, lesson:lesson.title, reused:true });
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
