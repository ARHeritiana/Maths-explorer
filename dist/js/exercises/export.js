// Exports of a generated document: HTML for the page and for printing, LaTeX source (pdfLaTeX, Palatino: newpx or mathpazo),
// and a standalone projection page for the automatismes. Pure string builders, no DOM.
// A statement is French text with maths between \( \) or \[ \]; nothing else is interpreted.

import { starterFigureHtml, starterFigureTex } from './starter-visual.js';

const HTML = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
export const esc = HTML;

// Splits a string into text and maths segments.
export function segments(str) {
  const out = []; const re = /\\\((.+?)\\\)|\\\[(.+?)\\\]/gs; let last = 0, m;
  while ((m = re.exec(str))) { if (m.index > last) out.push({ t: 'text', v: str.slice(last, m.index) }); out.push(m[1] !== undefined ? { t: 'math', v: m[1] } : { t: 'display', v: m[2] }); last = re.lastIndex; }
  if (last < str.length) out.push({ t: 'text', v: str.slice(last) });
  return out;
}
// HTML for the page: text escaped, maths kept inside \( \) for MathJax (its content escaped too, MathJax reads the text).
export const html = (str) => segments(str).map((s) => (s.t === 'text' ? HTML(s.v) : s.t === 'math' ? `\\(${HTML(s.v)}\\)` : `\\[${HTML(s.v)}\\]`)).join('');

// LaTeX for the source file.
const texText = (s) => s.replace(/([%&#_$])/g, '\\$1').replace(/\^/g, '\\^{}').replace(/~/g, '\\~{}');   // statements carry no backslash or brace outside maths
export const tex = (str) => segments(str).map((s) => (s.t === 'text' ? texText(s.v) : s.t === 'math' ? `$${s.v}$` : `\\[${s.v}\\]`)).join('');

const KIND = { starter: 'Automatismes', sheet: 'Fiche d’exercices', interro: 'Interrogation', devoir: 'Devoir surveillé' };
export const kindLabel = (k) => KIND[k] || k;
const pts = (x) => String(x).replace('.', ',');

// Preamble shared by every generated document. Comments explain the non-obvious lines.
const PREAMBLE = String.raw`\documentclass[11pt,a4paper]{article}
\usepackage[T1]{fontenc}
\usepackage[utf8]{inputenc}
\usepackage{textcomp}
% characters that appear in the statements
\DeclareUnicodeCharacter{20AC}{\texteuro}
\DeclareUnicodeCharacter{221E}{\ensuremath{\infty}}
\DeclareUnicodeCharacter{2081}{\ensuremath{{}_1}}
\DeclareUnicodeCharacter{2083}{\ensuremath{{}_3}}
\usepackage[french]{babel}
\usepackage{amsmath,amssymb}
% Palatino: newpx when installed (the same design, complete fonts), else mathpazo. Some installations
% (Fedora's split TeX Live packages) ship mathpazo.sty without the Palatino fonts it needs.
\IfFileExists{newpxmath.sty}{\usepackage{newpxtext}\usepackage{newpxmath}}{\usepackage{mathpazo}}
\usepackage[a4paper,margin=2cm]{geometry}
\usepackage{enumitem}
\usepackage{xcolor}
\usepackage{mdframed}
\usepackage{needspace}
\usepackage{multicol}
\setlist[enumerate]{label=\alph*)}
% exercise counter: never numbered by hand
\newcounter{exo}
% marks at the right margin, moved whole to the next line when the statement leaves no room (TeXbook, \signed)
\newcommand{\pts}[1]{\unskip\nobreak\hfil\penalty50\hskip1em\hbox{}\nobreak\hfill\mbox{\textit{(#1)}}}
% correction frame: a left rule, may break across pages
\mdfdefinestyle{corrige}{linewidth=0pt,leftline=true,linecolor=gray,innerleftmargin=8pt,innertopmargin=2pt,innerbottommargin=2pt,skipabove=4pt,skipbelow=4pt}`;




// doc: result of buildSheet; opts: {version: 'student' | 'teacher', barème: bool, title, subtitle}
export function sheetTex(doc, opts = {}) {
  const teacher = opts.version === 'teacher', bareme = !!opts.bareme;
  const L = [PREAMBLE, '\\pagestyle{plain}', '\\begin{document}'];
  L.push(`\\begin{center}{\\Large\\bfseries ${tex(opts.title || KIND[doc.kind])}${teacher ? ' --- corrigé' : ''}}\\\\[2pt]${tex(opts.subtitle || '')}\\end{center}`);
  if (!teacher) L.push('\\noindent Nom : \\dotfill\\quad Date : \\dotfill\\par\\medskip');
  L.push(`\\noindent\\textit{Durée indicative : ${doc.minutes} minutes.${bareme ? ` Barème sur ${doc.total} points.` : ''}}\\par\\medskip`);
  for (const e of doc.exercises) {
    L.push('\\needspace{6\\baselineskip}', `\\refstepcounter{exo}\\subsection*{Exercice \\theexo${e.title ? ` : ${tex(e.title)}` : ''}${bareme ? ` (${pts(e.pts)} points)` : ''}}`);
    if (e.intro) L.push(`${tex(e.intro)}\\par`);
    L.push('\\begin{enumerate}');
    for (const p of e.parts) {
      L.push(`\\item ${tex(p.q)}${bareme ? `\\pts{${pts(p.pts)} pt${p.pts > 1 ? 's' : ''}}` : ''}`);
      if (teacher) L.push(`\\begin{mdframed}[style=corrige]${tex(p.a)}${p.s ? `\\par\\textit{${tex(p.s)}}` : ''}\\end{mdframed}`);
    }
    L.push('\\end{enumerate}');
  }
  L.push('\\end{document}');
  return L.join('\n') + '\n';
}

// Automatismes: two columns of numbered questions; the teacher version gives each answer under its question.
export function starterTex(doc, opts = {}) {
  const teacher = opts.version === 'teacher';
  // TikZ only when a question carries a figure (starter-visual.js), so a plain series keeps its exact preamble
  const preamble = doc.items.some((it) => it.figure) ? `${PREAMBLE}\n\\usepackage{tikz}` : PREAMBLE;
  const L = [preamble.replace('\\setlist[enumerate]{label=\\alph*)}', '\\setlist[enumerate]{label=\\arabic*.}'), '\\pagestyle{empty}', '\\begin{document}'];
  L.push(`\\begin{center}{\\Large\\bfseries Automatismes${teacher ? ' --- corrigé' : ''}}\\\\[2pt]${tex(opts.subtitle || '')}\\end{center}`);
  if (!teacher) L.push(`\\noindent Nom : \\dotfill\\quad Date : \\dotfill\\hfill\\textit{${doc.minutes} minutes}\\par\\medskip`);
  L.push('\\begin{multicols}{2}', '\\begin{enumerate}[itemsep=0.9em]');
  for (const it of doc.items) {
    L.push(`\\item ${tex(it.q)}`);
    if (it.figure) L.push(starterFigureTex(it.figure));
    if (teacher) L.push(`\\\\\\hspace*{1em}\\textbf{Réponse :} ${tex(it.a)}${it.s ? ` \\textit{(${tex(it.s)})}` : ''}`);
    else L.push('\\vspace{2.2em}');
  }
  L.push('\\end{enumerate}', '\\end{multicols}', '\\end{document}');
  return L.join('\n') + '\n';
}

// A standalone projection page: one question at a time, timer, answer reveal, keyboard control. It loads MathJax
// from cdnjs (internet needed in the room); everything else is inline. The questions are embedded as data.
export function projectionHtml(doc, opts = {}) {
  const data = JSON.stringify({ title: opts.title || 'Automatismes', subtitle: opts.subtitle || '', seconds: doc.secondsPerItem, total: doc.minutes * 60, items: doc.items.map((i) => ({ q: html(i.q), a: i.choices ? '' : html(i.a), fig: i.figure ? starterFigureHtml(i.figure) : '', level: i.level, ...(i.choices ? { stem: html(i.stem), choices: i.choices.map(html), correct: i.correct } : {}) })) }).replace(/</g, '\\u003c');
  return `<!doctype html>
<html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${HTML(opts.title || 'Automatismes')}</title>
<style>
:root{--bg:#fbf8f1;--fg:#1d2433;--muted:#5b6475;--accent:#b4531a;--line:#d8d2c4;--ok:#1f7a4d}
@media (prefers-color-scheme:dark){:root{--bg:#161b26;--fg:#f1ede3;--muted:#a3abbb;--accent:#f0a35e;--line:#2c3446;--ok:#6fd3a0}}
*{box-sizing:border-box}html,body{height:100%;margin:0;overflow:hidden}
body{background:var(--bg);color:var(--fg);font-family:system-ui,-apple-system,"Segoe UI",sans-serif;display:grid;grid-template-rows:auto 1fr auto}
header,footer{display:flex;gap:1rem;align-items:center;justify-content:space-between;padding:.8rem 1.5rem;color:var(--muted);font-size:clamp(14px,1.6vw,20px)}
#bar{height:6px;background:var(--line)}#bar>i{display:block;height:100%;width:0;background:var(--accent)}
main{display:grid;place-items:center;padding:1rem 6vw;text-align:center;min-height:0;overflow:hidden}
.ch{list-style:none;margin:.6em auto 0;padding:0;display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:.4em 1em;max-width:46em;text-align:left;font-size:.9em}.ch li{display:flex;gap:.6em;align-items:baseline;border:1px solid var(--line);padding:.3em .6em}.ch b{color:var(--accent)}.ch li.r{border:3px solid var(--ok)}@media(min-aspect-ratio:5/4){.ch{grid-template-columns:repeat(4,minmax(0,1fr));max-width:none}.ch li{justify-content:center}}
@media(max-width:600px){.ch{grid-template-columns:1fr}}
#q{font-size:calc(clamp(22px,4.2vw,58px)*var(--fit,1));line-height:1.35;max-width:1500px}
#a{margin-top:1em;font-size:calc(clamp(22px,3.8vw,52px)*var(--fit,1));color:var(--ok);min-height:1.5em}
#timer{font-variant-numeric:tabular-nums;font-size:clamp(28px,4vw,56px);color:var(--fg);font-weight:600}
button{font:inherit;background:transparent;color:var(--fg);border:2px solid var(--line);border-radius:10px;padding:.5rem 1rem;cursor:pointer;min-height:44px}
button:focus-visible{outline:3px solid var(--accent)}button[aria-pressed=true]{border-color:var(--accent)}
.controls{display:flex;gap:.6rem;flex-wrap:wrap}
mjx-container{font-size:100%!important}
@media print{header,footer,#bar{display:none}}
</style></head>
<body>
<div id="bar" aria-hidden="true"><i id="fill"></i></div>
<header><span id="count"></span><span id="timer" role="timer" aria-live="off">0:00</span><span id="level"></span></header>
<main><div><div id="q" aria-live="polite"></div><div id="a"></div></div></main>
<footer><div class="controls"><button id="prev">Précédent (←)</button><button id="next">Suivant (→)</button><button id="reveal" aria-pressed="false">Réponse (A)</button><button id="play" aria-pressed="false">Départ (Espace)</button><button id="full">Plein écran (F)</button></div><span id="hint">Touches : ← → A Espace F</span></footer>
<script id="data" type="application/json">${data}</script>
<script>
window.MathJax={tex:{inlineMath:[['\\\\(','\\\\)']],displayMath:[['\\\\[','\\\\]']]},svg:{fontCache:'none'}};
</script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/mathjax/3.2.2/es5/tex-svg.js" async></script>
<script>
const D=JSON.parse(document.getElementById('data').textContent);let i=0,showA=false,running=false,left=D.seconds,total=0,tick=null;
const $=id=>document.getElementById(id);
function fmt(s){s=Math.max(0,Math.round(s));return Math.floor(s/60)+':'+String(s%60).padStart(2,'0');}
function fit(){const m=document.querySelector('main');document.documentElement.style.removeProperty('--fit');let f=1;while(f>.3&&(m.scrollHeight>m.clientHeight+1||m.scrollWidth>m.clientWidth+1)){f-=.06;document.documentElement.style.setProperty('--fit',f.toFixed(2));}}
function typeset(){if(window.MathJax&&MathJax.typesetPromise)MathJax.typesetPromise([$('q'),$('a')]).then(fit,fit);else fit();}
addEventListener('resize',fit);
function draw(){const it=D.items[i];$('q').innerHTML='<strong>'+(i+1)+'.</strong> '+(it.choices?it.stem+'<ul class="ch">'+it.choices.map((c,k)=>'<li'+(showA&&k===it.correct?' class="r"':'')+'><b>'+'ABCD'[k]+'</b><span>'+c+'</span></li>').join('')+'</ul>':it.q)+(it.fig||'');$('a').innerHTML=showA?it.a:'';$('count').textContent=D.title+' · question '+(i+1)+' sur '+D.items.length;$('level').textContent='niveau '+it.level;$('timer').textContent=fmt(left);$('fill').style.width=(100*(i+1)/D.items.length)+'%';$('reveal').setAttribute('aria-pressed',String(showA));$('play').setAttribute('aria-pressed',String(running));$('play').textContent=running?'Pause (Espace)':'Départ (Espace)';typeset();}
function go(n){i=Math.max(0,Math.min(D.items.length-1,n));showA=false;left=D.seconds;draw();}
function loop(){if(!running)return;left-=1;if(left<=0){if(i<D.items.length-1){go(i+1);}else{running=false;left=0;}}draw_t();}
function draw_t(){$('timer').textContent=fmt(left);if(!running)draw();}
function toggle(){running=!running;if(running&&!tick)tick=setInterval(loop,1000);if(!running){clearInterval(tick);tick=null;}draw();}
$('prev').onclick=()=>go(i-1);$('next').onclick=()=>go(i+1);$('reveal').onclick=()=>{showA=!showA;draw();};$('play').onclick=toggle;
$('full').onclick=()=>{document.fullscreenElement?document.exitFullscreen():document.documentElement.requestFullscreen&&document.documentElement.requestFullscreen();};
addEventListener('keydown',e=>{if(e.key==='ArrowRight'||e.key==='PageDown')go(i+1);else if(e.key==='ArrowLeft'||e.key==='PageUp')go(i-1);else if(e.key==='a'||e.key==='A'){showA=!showA;draw();}else if(e.key===' '){e.preventDefault();toggle();}else if(e.key==='f'||e.key==='F')$('full').click();});
draw();
</script></body></html>
`;
}

// ---- HTML documents for the page and for printing (same structure as the LaTeX sources) ----
// `competency` (teacher version only): a function from an item to a short label, printed discreetly after the answer.
export function starterHtml(doc, { teacher = false, subtitle = '', competency = null } = {}) {
  return `<article class="sheet-doc${teacher ? ' is-teacher' : ''}"><header><h1>Automatismes${teacher ? ' : corrigé' : ''}</h1><p>${esc(subtitle)}</p>${teacher ? '' : `<p class="sheet-fields">Nom : <span></span> Date : <span></span> <em>${doc.minutes} min</em></p>`}</header><ol class="sheet-starter">${doc.items.map((i) => `<li><div>${html(i.q)}${starterFigureHtml(i.figure)}</div>${teacher ? `<div class="sheet-answer"><strong>Réponse :</strong> ${html(i.a)}${i.s ? ` <em>${html(i.s)}</em>` : ''}${competency && competency(i) ? ` <small class="sheet-comp">${esc(competency(i))}</small>` : ''}</div>` : '<div class="sheet-space"></div>'}</li>`).join('')}</ol></article>`;
}
export function sheetHtml(doc, { teacher = false, bareme = false, title = '', subtitle = '' } = {}) {
  const ex = (e) => `<section class="sheet-ex"><h2>Exercice ${e.n}${e.title ? ` : ${html(e.title)}` : ''}${bareme ? ` <small>(${pts(e.pts)} points)</small>` : ''}</h2>${e.intro ? `<p>${html(e.intro)}</p>` : ''}<ol class="sheet-parts">${e.parts.map((p) => `<li><div>${html(p.q)}${bareme ? ` <em class="sheet-pts">(${pts(p.pts)} pt${p.pts > 1 ? 's' : ''})</em>` : ''}</div>${teacher ? `<div class="sheet-answer">${html(p.a)}${p.s ? ` <em>${html(p.s)}</em>` : ''}</div>` : ''}</li>`).join('')}</ol></section>`;
  return `<article class="sheet-doc"><header><h1>${esc(title || KIND[doc.kind])}${teacher ? ' : corrigé' : ''}</h1><p>${esc(subtitle)}</p>${teacher ? '' : '<p class="sheet-fields">Nom : <span></span> Date : <span></span></p>'}<p class="sheet-meta">Durée indicative : ${doc.minutes} minutes${bareme ? `. Barème sur ${doc.total} points.` : ''}</p></header>${doc.exercises.map(ex).join('')}</article>`;
}
