// The animated figure of the home page: five live figures shown one after the other (figure-scenes.js SLIDES), each with its
// numbers, a legend and one sentence. The slideshow advances by itself (9 s, a progress rule on the current tab), pauses
// while the visitor touches a figure or presses the pause button, and never advances under reduced motion. Design v6.
import { FigureEngine, readouts } from './figure-engine.js';
import { SLIDES } from './figure-scenes.js';

export const SLIDE_SECONDS = 9;

// Markup of the plate (caption, stage, numbers, sentence, tabs, pause). Filled by mountHomeSlides.
export function slidesFigure({ pair }) {
  return `<figure class="home-plate" data-home-slides style="--dur:${SLIDE_SECONDS}s">
 <figcaption class="plate-top"><b class="plate-title"></b><span class="plate-legend"></span></figcaption>
 <div class="figure-stage" data-figure-stage><span class="figure-hint"></span></div>
 <div class="figure-numbers"></div>
 <p class="plate-text"></p>
 <ol class="figure-tabs" aria-label="${pair('Les cinq figures', 'The five figures')}">${SLIDES.map((s, i) => `<li><button type="button" class="figure-tab" data-i="${i}" aria-label="${pair(`Figure ${i + 1} sur ${SLIDES.length} : `, `Figure ${i + 1} of ${SLIDES.length}: `)}${s.tab[0]}"><span class="tab-progress"><i></i></span><b>${i + 1}</b><span class="tab-name">${pair(s.tab[0], s.tab[1])}</span></button></li>`).join('')}</ol>
 <div class="figure-auto"><button type="button" class="text-button" data-pause></button><span>${pair('Les figures avancent seules ; touche-en une pour les arrêter.', 'The figures advance on their own; touch one to stop them.')}</span></div>
 <p class="sr-only" role="status" aria-live="polite" data-figure-status></p>
</figure>`;
}

// Mounts the engine and the slideshow on the plate inside `root`. Returns { destroy, retheme }.
export function mountHomeSlides(root, { lang = 'fr', reduced = false } = {}) {
  const fig = root.querySelector('[data-home-slides]'); if (!fig) return { destroy() {}, retheme() {} };
  const L = lang === 'en' ? 1 : 0, P = (fr, en) => (L === 0 ? fr : en);
  const stage = fig.querySelector('[data-figure-stage]'), title = fig.querySelector('.plate-title'), legend = fig.querySelector('.plate-legend');
  const text = fig.querySelector('.plate-text'), tabs = [...fig.querySelectorAll('.figure-tab')], pause = fig.querySelector('[data-pause]'), status = fig.querySelector('[data-figure-status]');
  const update = readouts(fig.querySelector('.figure-numbers'));
  let i = 0, userPaused = reduced, busy = false, busyTimer = 0, token = 0, swapTimer = 0;

  const engine = FigureEngine(stage, SLIDES[0].make(L), {
    reduced, label: P('Figure interactive. H change de point, les flèches le déplacent, Ctrl et molette ou plus et moins zooment, zéro recentre.', 'Interactive figure. H selects a point, the arrows move it, Ctrl and wheel or plus and minus zoom, zero recentres.'),
    say: (m) => { status.textContent = m; },
    onScene: (sc) => { title.textContent = `${P('Planche', 'Plate')} ${i + 1} · ${sc.title}`; legend.innerHTML = sc.legend; update(sc); },
    onFrame: (sc) => update(sc),
    onUser: () => { busy = true; apply(); clearTimeout(busyTimer); busyTimer = setTimeout(() => { busy = false; apply(); }, 5000); },
  });

  const icon = () => { pause.textContent = userPaused ? P('Reprendre le défilement', 'Resume the slideshow') : P('Mettre en pause', 'Pause'); };
  const apply = () => { fig.classList.toggle('is-paused', userPaused || busy); fig.classList.toggle('is-static', reduced); };
  function show(n, instant) {
    i = (n + SLIDES.length) % SLIDES.length; const mine = ++token;
    text.textContent = P(...SLIDES[i].text);
    tabs.forEach((b, j) => {
      b.classList.toggle('done', j < i);
      if (j === i) { b.setAttribute('aria-current', 'true'); const bar = b.querySelector('i'); bar.style.animation = 'none'; void bar.offsetWidth; bar.style.animation = ''; } else b.removeAttribute('aria-current');
    });
    if (instant) return;
    stage.classList.add('is-swapping');
    clearTimeout(swapTimer);
    swapTimer = setTimeout(() => { if (mine !== token) return; engine.setScene(SLIDES[i].make(L)); stage.classList.remove('is-swapping'); }, reduced ? 0 : 260);
  }
  fig.querySelector('.figure-tabs').addEventListener('animationend', (e) => { if (e.animationName === 'figure-fill' && !userPaused && !busy) show(i + 1); });
  tabs.forEach((b) => b.addEventListener('click', () => show(+b.dataset.i)));
  pause.addEventListener('click', () => { userPaused = !userPaused; icon(); apply(); });
  icon(); apply(); show(0, true);

  return { destroy() { token++; clearTimeout(busyTimer); clearTimeout(swapTimer); engine.destroy(); }, retheme: () => engine.retheme(), engine, show };
}
