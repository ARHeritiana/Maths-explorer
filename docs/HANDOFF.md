# Hand-off: Maths Explorer (start here)

State at commit on branch `redesign/2026-10-11` (pushed; no PR; `main` and the other branches are untouched).
Detailed log of the 11 October 2026 session: `docs/history/HANDOFF-2026-10-11-session-log.md` (historical).

## The project
Static bilingual site (French source, English twin) for French-lycée mathematics, with downloadable PDFs compiled from
LaTeX and HTML slide decks. Require precision, no filler, no hallucination, and flag uncertainty
([VERIFY], [HORS PROGRAMME]). Curriculum references: Première BO n°14 of
2 April 2026 (no binomial distribution); Terminale STMG BO spécial n°8 of 25 July 2019.

Read first: `AGENTS.md` (rules), `docs/ARCHITECTURE.md` (layout, data flow, commands), `docs/TEX_STYLE_GUIDE.md`
(the TeX system), `docs/ADR-0001-tex-i18n.md` (French/English decision), `docs/REDESIGN_PLAN.md` (phases).

## Hard constraints (owner)
- Never write Google Drive URLs or IDs, owner details, e-mails, or school, teacher or city names anywhere (code, data,
  docs, PDFs, commit messages). The site never links to a personal space. `tests/banned.py` checks hashed phrases.
- Every resource exists in French and English with equal page counts (`tests/pdf_parity.py`).
- One AI-content notice, in the site footer only. Translate prose only: never maths, TikZ or listings.
- No textbook statements reproduced. No em-dashes in new visible text. One mint accent on the site.
- `make check` must pass before every push. Ask the owner before launching expensive multi-agent batches.

## Layout and commands
```
content/tex/core/        master: mxbook.cls + mx-i18n, mx-edition, mx-math, mx-notation, mx-figures, mx-layout, mx-env, mx-code
content/tex/courses/     units <id>.fr.tex (source), <id>.en.json (translation table), <id>.en.tex (generated)
content/data/            manifest.json (catalogue source of truth, book specs), enrichment.json (workshops), glossary.json
site/  -> dist/          hand-written web source copied to the served folder (dist/ is committed; host has no build)
build/mxbuild/           pipeline package: catalog, site, tex, books, twin, notation, enrichment, pipeline, migrate
scripts/                 course builders called by mxbuild (build-*.py), slides, publish-sources, finalize, style
tests/                   node, browser (Playwright), slides, twin, notation, lint, parity, banned
```
`make tex [COURSE=x] [FORCE=1]` builds courses (cached), styles changed PDFs, regenerates the catalogue, republishes
sources; `make site`; `make catalog`; `make slides`; `make inventory`; `make check [FAST=1]` (18 checks).
Full forced build: about 4 min. Container setup (per session): `apt-get install texlive-latex-extra
texlive-fonts-recommended texlive-fonts-extra texlive-science texlive-lang-french texlive-pictures
texlive-latex-recommended texlive-pstricks texlive-xetex latexmk`, `pip install pymupdf playwright==1.56.0`;
Chromium at `/opt/pw-browsers`.

## The TeX system (how to edit content)
- One master: `mxbook.cls` loads every package; units only call its environments and commands. Every unit opens with
  `\mxunit[n]{id}{title}` or `\mxfront{id}`; parts included with `\mxinclude` open with neither; no hand styling
  (`tests/tex_lint.py`). Course mains are generated from `content/data/manifest.json` ("books").
- Notation that differs by language is written once with `\num \pc \intff \intoo \intfo \intof \ent \pt \ens \pgcd
  \ppcm`; the class prints French (0,5; ]a;b[; (x;y)) or English (0.5; (a,b); (x,y)) conventions. Lint refuses
  hand-written notation; `python -m mxbuild notation --migrate --write` converts it.
- English: edit the table `<id>.en.json`, never `<id>.en.tex`. After a French edit: `python -m mxbuild twin stub
  <unit>` (adds todo segments, drops unused), fill `en`, then `python -m mxbuild twin gen` (run from `build/`).
- Every resource cut from a book starts with `\mxnewpage` (a balanced block), so French and English pages always match;
  builders fail on any difference.
- Enrichment workshops are authored in `content/data/enrichment.json` (both languages, maths marked `$...$`); their
  units are generated (`python -m mxbuild enrichment`, `--check` in make check).

## Status
- Phase A (structure): done. Phase B (TeX): B1 to B3 done for all six courses (Automatismes, STMG, Seconde, Première,
  Terminale, Enrichment), plus the uniform structure and notation layer requested on 11 October.
- Page counts (student/teacher, FR = EN): Automatismes 27/47, STMG 151/198, Seconde 94/98, Première 133/222,
  Terminale 123/289, Enrichment 37/49 sheets. 0 overfull boxes, 0 undefined references. Slides: 47 decks, 1,043 slides.
- Measured: full compile 622 s at baseline, about 4 min now (French and English compiled in parallel); rebuilt PDFs that
  differ only in their random /ID keep the committed copy (no binary churn).

## Next steps (in order)
1. B4/B5: retire `scripts/style-resource-pdfs.py` (it recolours PDFs and adds the dark header band and footer after
   compilation): move that design into `mx-layout.sty`, then rebuild everything once. Optional: precompiled format,
   figure externalisation (measure first; the class preamble loads in about 1.3 s).
2. Run `/simplify` and `/code-review` over Phase B, fix findings.
3. Phase C (site and design system): audit every route at 360/768/1280 px in FR and EN (viewed, not only scripted),
   then tokens, merged CSS, `app.js` split into route modules, catalogue view from the manifest. See `docs/REDESIGN_PLAN.md`.
   Known lab and canvas defects to fix there: vectors and complex labs keep an equal-scale frame that makes the default
   vectors tiny on wide panels; the function explorer labels "(0 ; C)" and "(1 ; Cb)" are jargon and overlap when b is
   near 1; terminale-01/03 reuse the generic "first terms" canvas (no limit, convexity or plane-intersection canvases);
   labs not yet viewed in English, by drag/step-through, or on narrow screens.
4. Phase D (content integrity): curriculum map `content/data/curriculum.json`, English proof-read through the tables
   (status `reviewed`; 16 of about 10,800 segments are reviewed), resolve the [VERIFY] list below.
5. Final report to the owner: what changed, how it was verified (viewed vs scripted), what was not done, [VERIFY] flags,
   before/after numbers (baseline in `docs/REPO_AUDIT.md`).

## Open questions for the owner ([VERIFY])
- English notation details chosen without explicit confirmation: thousands grouped from 4 digits (1,500), percent
  without space (12.5%), integer interval printed {1,…,n}.
- The one-page-per-resource rule grew Première to 133/222 and Terminale to 123/289 pages; Première and Terminale covers
  now use the shared cover (their individual title pages, including the Première parabola, were dropped).
- Owner, school and place names remain in git history (removing them needs a history rewrite and force-push).
- Drop `terminale-fluency-*` and `terminale-methods-*` supplement PDFs (overlay-era copies)?
- Terminale prints the textbook's chapter numbers (e.g. vectors "Chapitre 10" while the site card says chapter 2).
- STMG "Pour prolonger" boxes cite textbook pages and exercise numbers only: acceptable?
- Glosses and content flags: "Year 11 (seconde)"; sampling fluctuation 2σ/√n in Première C08 and EV3; Newton in C06;
  Euler in C09; Terminale E6 intro says four independent questions but has five; E7 solution starts "No." for a
  compare-and-explain question; Terminale slide wording "sur un domaine disjoint".

## Working style that worked
Change sources, then prove it: rebuild, compare French text with the previous PDFs (token comparison ignoring running
heads), view sample pages, run `make check`, then commit with what was verified and how. Never claim a page was viewed
unless it was rendered and looked at.

## Session log
- 2026-10-11: ChatGPT session started
