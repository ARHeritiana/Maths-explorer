# Engine patterns (from the working trinôme implementation)

Reference implementation: `assets/example_trinome.html`. Excerpts below are the parts to reuse unchanged.

## Contents
1. Page shell and stage scaling
2. MathJax boot and helper
3. Flow column and cached lines
4. Tables with rules
5. State, tween and render loop
6. Parameter modes
7. Case-matrix selectors
8. Graph helpers
9. Scripted scenes (format B)
10. Narration and sound (optional)
11. French maths typography

## 1. Page shell and stage scaling
```html
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<style>
html,body{height:100%;margin:0}
body{background:#0f1b2d;display:flex;align-items:center;justify-content:center;overflow:hidden}
#wrap{position:relative}
#stage{position:absolute;left:0;top:0;width:1280px;height:720px;transform-origin:0 0;background:#0f1b2d;overflow:hidden;color:#f4f1ea;font-family:"STIX Two Text","Latin Modern Roman",Georgia,serif}
</style>
<script>
function fit(){var k=Math.min(innerWidth/1280,innerHeight/720),w=document.getElementById('wrap');
  w.style.width=1280*k+'px';w.style.height=720*k+'px';stage.style.transform='scale('+k+')'}
addEventListener('resize',fit);fit();
</script>
```
Include dark/light page tokens only if the page background should differ from the stage; matching them hides letterbox bars on projectors.

## 2. MathJax boot and helper
```html
<script>window.MathJax={startup:{typeset:false},svg:{fontCache:'none'},options:{enableAssistiveMml:false}};</script>
<script async src="https://cdn.jsdelivr.net/npm/mathjax@3.2.2/es5/tex-svg.js"></script>
```
```js
function build(h){ // 'prose $tex$ prose' -> fragment; odd segments are TeX
  var d=document.createDocumentFragment();
  h.split('$').forEach(function(p,i){ if(!p)return;
    if(i%2){var m=MathJax.tex2svg(p,{display:false});
      m.querySelectorAll('mjx-assistive-mml').forEach(function(e){e.remove()});d.appendChild(m)}
    else{var s=document.createElement('span');s.textContent=p;d.appendChild(s)}});
  return d}
function boot(){
  if(!(window.MathJax&&MathJax.startup&&MathJax.startup.promise)){setTimeout(boot,100);return}
  Promise.all([MathJax.startup.promise,document.fonts.load('400 20px "STIX Two Text"').catch(function(){})])
    .then(function(){/* build DOM, first upd(), start rAF */});
}
```
In JS string literals every TeX backslash is doubled: `'\\dfrac{b}{2a}'`. A TeX line break is `\\\\`, `\hline` is `\\hline`.

## 3. Flow column and cached lines
```css
#col{position:absolute;left:40px;top:24px;width:520px;height:636px;overflow-y:auto;overflow-x:hidden;display:flex;flex-direction:column;gap:12px;font-size:25px;scrollbar-width:none}
.blk{display:none;animation:fd .6s}
@keyframes fd{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
.hd{color:#e8a33d;font-weight:600;font-size:21px;margin-bottom:3px}
.ln{line-height:1.3;margin:2px 0}
mjx-assistive-mml{display:none!important}
```
```js
function setLines(i,arr){ // arr: [{t:tex,c:colour}] or [{h:1,t:'prose $tex$'}] or [{tb:rows}]
  var cont=blk[i].l;
  while(cont.children.length>arr.length)cont.removeChild(cont.lastChild);
  while(cont.children.length<arr.length){var d=document.createElement('div');d.className='ln';cont.appendChild(d)}
  arr.forEach(function(o,k){var d=cont.children[k],key=(o.tb?JSON.stringify(o.tb):o.t)+'|'+o.c;
    if(d._k===key)return;d._k=key;d.style.color=o.c||INK;d.innerHTML='';
    d.appendChild(o.tb?tbl(o.tb):build(o.h?o.t:'$'+o.t+'$'))})}
```
Show block `i` when `all||i<step`; restart the CSS animation when it becomes visible (`style.animation='none'; void el.offsetWidth; style.animation=''`).

## 4. Tables with rules
```css
.sg{border-collapse:collapse;margin:8px 0;font-size:25px}
.sg td{padding:4px 14px;min-width:28px;height:40px;text-align:center;vertical-align:middle}
.sg tr:first-child td{border-bottom:2px solid #8fa6c4}
.sg td:first-child{border-right:2px solid #8fa6c4;padding:4px 16px}
```
```js
function tbl(rows){var t=document.createElement('table');t.className='sg';
  rows.forEach(function(r){var tr=document.createElement('tr');
    r.forEach(function(c){var td=document.createElement('td');if(c)td.appendChild(build('$'+c+'$'));tr.appendChild(td)});
    t.appendChild(tr)});return t}
// tableau de signes, Δ>0: [['x','-\\infty','',r1,'',r2,'','+\\infty'],['f(x)','',s_out,'0',s_in,'0',s_out,'']]
```
Tableau de variations: same helper, cells such as `\\nearrow`, `\\searrow`, `-8`; add a row border for each row if needed.

## 5. State, tween and render loop
```js
var P={a:2,b:-4,c:-6}, D={a:2,b:-4,c:-6};          // target and displayed parameters
function frame(){
  ['a','b','c'].forEach(function(q){D[q]+=(P[q]-D[q])*.22; if(Math.abs(P[q]-D[q])<.003)D[q]=P[q]});
  /* draw axes, layers by step, curve with D */
  requestAnimationFrame(frame)}
var pend=false;function after(){if(pend)return;pend=true;requestAnimationFrame(function(){pend=false;upd()})}
```
`upd()` computes everything from `P` (pure), fills the panel with `setLines`, shows blocks by `step`, updates slider read-outs and selector highlights.

## 6. Parameter modes
Keep `toS()` (P to slider values) and `fromS()` (slider values to P) per mode. On mode change: set `min/max/step` before `value`, then `readS()`. For a mode that needs real roots, replace an infeasible state by a valid preset and show a toast. Example conversions: `(a,α,β)`: `b=-2aα`, `c=aα²+β`; `(a,x₁,x₂)`: `b=-a(x₁+x₂)`, `c=a x₁ x₂`.

## 7. Case-matrix selectors
```js
var PRE=[[[2,-4,-6],[2,-4,2],[2,-4,4]],[[-2,4,6],[-2,4,-2],[-2,4,-4]]]; // [sign of a][case of Δ]
// click on a-group: sa=new, cs=current; click on Δ-group: cs=new, sa=current; then setP(PRE[sa][cs])
// highlight: aBtn on if (M.a>0?0:1)===k ; ΔBtn on if M.cs===k
```
All six presets share α=1 so only the sign of a and the constant change.

## 8. Graph helpers
Map functions `X(x)`, `Y(y)` from the math window to canvas pixels; clip all drawing to the graph rectangle; ticks every 1 (grid) and labels every 2 or 4 using the true minus sign `\u2212` and `STIX Two Text`; draw dashed lines for axes of symmetry; shade sign regions at 16 % alpha (green positive, red negative); draw points last. Use `Math.sin` pulses for emphasis.

## 9. Scripted scenes (format B)
```js
var DUR=[9,9,10]; // seconds per scene
function render(s,t){ /* pure function of scene and local time; no hidden state */ }
// timeline helpers: cl=clamp 0..1, ez=1-(1-t)^3; element fades with a=ez(cl((t-t0)/.5)); curve draw p=ez(cl((t-1)/3))
// player: advance when t>=DUR[s]+1; buttons ◀ ▶ Pause; keyboard arrows; swipe optional
```
Because `render` is a pure function of `(s,t)`, any frame is reproducible, which makes screen-recording and shot-by-shot revision easy. Keep scenes 4–10 s.

## 10. Narration and sound (optional)
- Both need a user tap before they can start; keep them off by default; place the buttons inside the stage.
- **Voice (Web Speech API):** rank `speechSynthesis.getVoices()` filtered on `/^fr/`: +10 for `fr-FR`, +30 for names containing natural, neural, online, premium or enhanced, +15 Google, +8 for Denise, Henri, Vivienne, Eloise, Hortense, Julie, Amélie, Thomas, Audrey, Siri; offer a `<select>`; reload voices on `voiceschanged` (they load asynchronously, otherwise the default non-French voice is used). Speak one utterance per sentence (long utterances are cut off), `rate≈0.92`, `lang` from the chosen voice. Write narration in words: "x au carré", "alpha", "bêta", "moins un", numbers with "virgule"; avoid symbols. Provide subtitles as a fallback and hold the scene until speech ends.
- **Sound (WebAudio):** a short sine plus octave partial with exponential decay for ticks and chimes; a quiet triangle oscillator whose pitch follows progress for drawing; major chord for positive, minor for negative, distinct chime when a case changes. Keep gains ≤ 0.06.

## 11. French maths typography
- Decimal comma: format numbers with `String(x).replace('.','{,}')` inside TeX.
- Intervals: `]-\infty\,;1]`, `[1\,;+\infty[` (thin space before the semicolon).
- Sets and symbols: `\mathbb{R}`, `\Delta`, `\alpha`, `\beta`, `\mathcal{C}_f`, `\neq`, `\geq`, `\times`, `x_1`.
- Text inside TeX: ASCII only (`\text{ ou }`); accented prose goes outside `$…$`, in STIX Two Text.
- Fractions `\dfrac`; powers and indices in TeX, never Unicode superscripts.
- Vocabulary: forme développée, forme canonique, forme factorisée, discriminant, racine double, tableau de signes, tableau de variations, axe de symétrie, sommet.
