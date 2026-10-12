# Hand-off: Maths Explorer (start here)

Unfinished checkpoint on branch `redesign/2026-10-11`; no PR, `main` and the other branches are untouched.
The 12 October checkpoint below supersedes older completion and toolchain notes for the native PDF migration.
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

## Capability checkpoint (2026-10-11; continuation 2026-10-12)
- Step 0 resumed and verified. Step 1 (B4/B5) has not started; wait for the requested go-ahead.
- Prerequisite fixes: remove stray `center` and trailing blank lines from Terminale 02's final activity slide;
  restore its missing English figure caption; fix `tests/slides_check.py` so the default invocation actually checks
  all 14 authored decks. French/English maths and HTML structure now agree. No TeX content or resource PDFs changed.
- In the verified 11 October runtime, `make check` passed all 18 checks, including the bilingual browser suite and
  every slide in all 47 decks. Additional scan of PDF link annotations and SVGs: no prohibited content.
- pdfLaTeX (TeX Live 2023) compiled `content/tex/core/example.tex`; its page was rendered and viewed. All 31 external
  core packages resolved. Node 24.19.0, Python 3.12.14, PyMuPDF 1.26.6, Playwright 1.56.0 and Chromium 141.0.7390.37
  worked. Full `make tex FORCE=1` was not run. The documented optional `texlive-fonts-extra` and PSTricks packages
  were absent; no requested check was blocked. French and science packages were in the recovered local TeX tree.
  Browser tests used `PLAYWRIGHT_CHROMIUM_PATH=/opt/pw-browsers/chromium`.
- GitHub reads and branch writes are verified through the connected integration. The session-log commit is
  `0d0f2a41d96723689ee494a8426d9ac7c966086d`; it also removes the personal description from this document.
  Direct command-line Git has no GitHub credentials. Only `redesign/2026-10-11` is updated; no PR is opened.
- Complete private capability Site: https://maths-explorer-check-20261011.warmshrew4.chatgpt.site
  Active project: `appgprj_6acbc305fc488191a7e53ccd7a7dd959`; Site source commit:
  `894a37ac52a9db00ac774706fcb25ad1c59796f1`. The deployment archive contained all 1,722 `dist/` files, 149,278,140
  bytes, verified byte-for-byte, plus hosting metadata. Saved version:
  `appgprj_6acbc305fc488191a7e53ccd7a7dd959~appgver_6245e7edc0c08191a07fc15ed89f35a3`.
  The earlier repository hosting manifest points at a different project; reuse this capability Site for preview updates.
- Hosted home, resource library, chapter PDF download and `slides/player.html` were checked in French and English.
  The downloaded Seconde 01 PDFs matched the repository exactly. Both languages of all four samples were rendered
  and viewed; slide navigation and SVG loading passed. HTML, slide CSS/JS, slide JSON and SVG asset bytes matched.
  Browser QA used the runtime proxy with certificate bypass limited to that QA browser. No site code or access
  setting was changed for QA.
- Audience: private, current account only, no invited viewers or groups. Public access has not been requested.
- Continuation after the pause: the earlier checkout and its extracted toolchain are unavailable. GitHub and the
  published Site remain intact. The source fixes were reconstructed from the unchanged GitHub parent and compared
  with the exact tested slide deck recovered from the preserved deployment archive. Restore a full checkout and
  the toolchain before starting B4/B5 or claiming a fresh full build. The retained test results are from 11 October.

## Session log
- 2026-10-11: ChatGPT session started

## 12 October 2026: unfinished native PDF migration checkpoint

The owner explicitly requested this checkpoint be pushed after being told that validation is incomplete.
This is an exception for preserving unfinished work, not a claim that `make check` passed. Do not deploy this
checkpoint or treat it as the completed migration. The private capability Site remains on its last verified version.

- The full checkout and toolchain were restored. A forced full build completed with exit 0 and reported zero
  undefined references and zero overfull boxes for all six course books. Student/teacher page counts in each
  language were Automatismes 27/47, STMG 151/198, Seconde 94/98, Premiere 133/222, Terminale 123/289 and
  enrichment 37/49. This does not establish resource-level correctness.
- Attempted migration: `mx-layout.sty` now defines the header band, footer, palette and native empty frame pages;
  `mx-env.sty` preserves pale fills; new `build/mxbuild/pdf.py` assembles excerpts using TeX-compiled frames.
  Automatismes, STMG and general TeX-resource builders use it. The pipeline no longer invokes the Python PDF
  styler. Old styling scripts are retired and the style ledger is archived under `docs/history/`.
- The expanded PDF parity check FAILS: the latest run recorded 98 incorrect local-sheet-counter reports, including
  enrichment resources and the quadratic presentation. Direct extraction from the first page of the French
  Bayes notes returned `19 / 37`; an independent resource needs `1 / N`. Inspect all building paths, especially
  those that still extract source-book pages. The root cause has not been verified.
- An earlier build encountered a readable but empty cached 17-page frame. Cache writes were changed to atomic
  replacement with immutable-byte and page-count validation. The later full build succeeded; the original
  corruption cause remains unknown.
- French PDF text comparison against the prior committed/hosted copy is not established. The baseline comprises
  330 French resources and 1,803 pages. The diagnostic comparison was still running at hand-off. Retain the old
  committed PDFs before rebuilding, finish the comparison, and inspect differences rather than suppressing them.
- Actual development viewing covered native empty frames, Automatismes first student pages and an STMG chapter
  first page, in both languages. Final samples across Seconde, Premiere, Terminale, enrichment, teacher documents
  and mathematical diagrams remain to be rendered and actually viewed.
- Partial development checks passed: unit lint and twin parity for 204 units/pairs, and seven notation tests.
  The complete final `make check` has NOT run after the full rebuild. The working pipeline lists 17 check entries,
  whereas the owner requirement and earlier documentation say 18. Reconcile this discrepancy without inventing
  a check or overstating the pass count.
- Source units, translation tables and mathematical content were not intentionally edited. The source checkpoint
  was pushed and verified as `566e492e809ee6bdddc0c6ea4733d495ff7c8b35`. Source changes and generated text
  metadata are preserved there. The batch transfer of regenerated PDF binaries did not complete; those PDFs
  remain local and are NOT included in the pushed checkpoint. Rebuild them before resource validation. Generated
  catalogue/provenance metadata may therefore describe the local rebuild rather than the PDFs on the branch.
  No Site deployment was performed. Some immutable PDF blobs were uploaded, but no branch commit includes them.

Next: review this implementation, fix every resource's local counters, finish body-text comparison and final visual
inspection, run the complete checks, update this hand-off, commit/push the verified result and synchronize the
private Site. Then continue the Phase B quality review, Phase C visual route audit and Phase D integrity work.
