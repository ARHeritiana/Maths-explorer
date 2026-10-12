# Hand-off: Maths Explorer (start here)

Branch `redesign/2026-10-11`; no PR, `main` and the other branches are untouched. The native PDF migration (B4/B5)
is complete and verified; see "12 October 2026 (continuation)" at the end, which supersedes the earlier checkpoints.
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
- Page counts (student/teacher, FR = EN, 12 October): Automatismes 27/47, STMG 151/192, Seconde 94/98, Première 134/223,
  Terminale 123/289, Enrichment 37/49 sheets. 0 overfull boxes, 0 undefined references. Slides: 47 decks, 1,045 slides.
- Measured: full compile 622 s at baseline, about 4 min now (French and English compiled in parallel); rebuilt PDFs that
  differ only in their random /ID keep the committed copy (no binary churn).

## Next steps (in order)
1. B4/B5: done (12 October). Optional: precompiled format, figure externalisation (measure first; the class
   preamble loads in about 1.3 s).
2. Run `/simplify` and `/code-review` over Phase B, fix findings.
3. Phase C (site and design system): audit every route at 360/768/1280 px in FR and EN (viewed, not only scripted),
   then tokens, merged CSS, `app.js` split into route modules, catalogue view from the manifest. See `docs/REDESIGN_PLAN.md`.
   The lab and canvas defects listed here earlier were fixed on 12 October (see the end of this document).
4. Phase D (content integrity): curriculum map `content/data/curriculum.json`, English proof-read through the tables
   (status `reviewed`; 16 of about 10,800 segments are reviewed), resolve the [VERIFY] list below.
5. Final report to the owner: what changed, how it was verified (viewed vs scripted), what was not done, [VERIFY] flags,
   before/after numbers (baseline in `docs/REPO_AUDIT.md`).

## Open questions for the owner ([VERIFY])
- The one-page-per-resource rule grew Première to 134/223 and Terminale to 123/289 pages; Première and Terminale covers
  now use the shared cover (their individual title pages, including the Première parabola, were dropped).
- Owner, school and place names remain in git history (removing them needs a history rewrite and force-push). Owner
  answer (12 October): decide later.
- Programme scope (owner, 12 October): sampling fluctuation 2σ/√n, Newton's method and Euler's method are not in the
  Première programme of BO n°14 of 2 April 2026. Course mentions are now in "Hors programme / Beyond the syllabus"
  boxes (`beyond` environment, never in slides); the QCM items, automatismes R058/R067, the EV3-T2 question, the
  research activity of C09 and the programming annex no longer use them; matrix rows BO165/BO166 removed.

Owner decisions of 12 October 2026 (applied): English notation 1,500 / 12.5% / {1,…,n} accepted; Terminale PDFs use
the site chapter numbers (cross-references are `\ref{ch:N}`, labels keep the former textbook numbers as names);
`terminale-fluency-*` and `terminale-methods-*` removed; STMG "Pour prolonger" boxes removed (and the textbook line in
the STMG sources); Terminale E6 counts its questions with `\mxcount`/`\mxcounted`; E7 model answer is a full
sentence; "domaine disjoint" rewritten as a union of disjoint intervals; "Year 11 (seconde)" gloss replaced.

Self-maintaining counts and notation (12 October, after the owner's remark that obvious defects must be fixed without
being asked): every count in prose was checked against the content. Counts within one paper or list are now printed by
TeX (`\mxcount`, `\mxCount`, `\mxTallied`; Terminale paper headers, E6, Première QCM and diagnostic headings, the STMG
diagnostic list); book-wide claims are enforced by `tests/count_claims.py` (in `make check`), which also checks every
Terminale and Première paper's points. Defects found on the way and fixed: the STMG diagnostic activity announced
14 questions that did not exist (written, answers checked); 315 hand-written comma tuples printed (1,2,2) in French
(now `\pt`, also in the enrichment converter, its web editions and the authored Terminale slides); C(n,k) in the
enrichment units is now $\binom{n}{k}$; $\mathcal B(10,\num{0,3})$ printed "B(10, 0,3)" in French; the English STMG c02
"increasing??" (a guard in `tests/twin_parity.py` now catches doubled marks); slides printed count keys and showed
teacher answers (`\mxblank`) in plain view; long lists now continue on a second slide with their answers on demand.

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
- 2026-10-12: Claude Code session: migration completed and verified, Terminale teacher mapping fixed, slides and site work

## 12 October 2026 (continuation): native PDF migration completed

Supersedes the "unfinished checkpoint" notes of the same day. Commits on this branch: `ed85c4d` (PDF fixes and full
rebuild), `60c9e81` (slides and site), then this hand-off.

- Root cause of the 98 wrong local counters: `mxbuild.enrichment.build` split its books with a raw `insert_pdf`, so
  every enrichment resource (and the quadratic presentation) kept the book counter. It now uses `mxbuild.pdf.excerpt`.
- Found during review: Terminale teacher excerpts were one chapter late (the teacher book gained the bookmark
  "Écarts entre les sources à arbitrer" and `FIRST_CHAPTER_ENTRY` was hard-coded): `terminale-N/teacher.pdf` and
  `corrections.pdf` held chapter N-1, and the algorithms/proofs/oral/assessments teacher appendices were shifted.
  This predates the migration (the previous committed PDFs had it). Teacher bookmarks are now matched by title.
- Full forced build (5 min 33 s), then Terminale and Première rebuilt after the fix. 0 undefined references, 0 overfull
  boxes; page counts unchanged (see Status).
- `tests/pdf_parity.py`: 330 FR/EN pairs, equal page counts, local counters `1 / N`, safe links.
- French body text compared token by token with the previous committed PDFs (330 resources, 1,803 pages, header and
  footer bands excluded): no text inserted or replaced. The only removals are old running heads and the
  "Maths Explorer | ... Page du livret N" stamps. (The Terminale teacher fix then changed those PDFs deliberately.)
- Rendered and viewed: enrichment Bayes notes FR/EN, STMG 05 activities, Terminale 09 notes FR/EN and corrections,
  first pages of Terminale 01/02/09/14 teacher and corrections, the four Terminale teacher appendices.
- `make check`: all 17 pipeline checks plus the Drive-link grep pass. The "18 checks" in older notes counts that grep.
- Slides: new canvases `cobweb` (terminale-01), `limit` (terminale-03), `convex` (terminale-06), `lineplane`
  (terminale-13, 3D); widget readouts follow the language notation; function explorer labels fixed. 47 decks,
  1,044 slides. New widgets viewed in FR and EN; every handle dragged to extremes in each mode.
- Site: vectors/complex labs fit their frame to the vectors; `site/styles/tokens.css` and the purple second accent
  removed; narrow-screen nav fade and current link scrolled into view; library count fixed; vector symbol glyph;
  "2 + i" instead of "2 + 1i"; Terminale 09 guide dot product written xx′ + yy′ + zz′. Routes viewed at 360 and
  1280 px in FR and EN: lab (quadratic, vectors, complex), resources, library, slides, chapter, workshop, challenges,
  pack, pathways, sources. No horizontal overflow or console error at 360/768/1280 on any route.
- Not done: the private preview Site was not synchronised (this session has no access to that hosting). Phase C items
  still open: merged CSS (six stylesheets remain; only colours moved to tokens), `app.js` split into route modules,
  `docs/DESIGN_SYSTEM.md`, catalogue view from the manifest, teacher mode. In this container the MathML "(" glyph
  is very wide (font fallback), so "f(x)" in the quadratic workshop looks spaced here; not reproduced elsewhere.

Next: Phase B quality review (`/simplify`, `/code-review`), the rest of Phase C above, Phase D. The [VERIFY] list
above was updated with the owner decisions of 12 October; the Terminale chapter numbers now match the site.
