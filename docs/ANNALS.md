# Self-hosted annales bank

The bank lives at #bank/annales, with stable per-exercise links. Chapter bank pages include the exercises whose publisher tags map to that chapter. Untagged records stay in the complete catalogue; no chapter alignment is invented.

Source: CoopMaths' publicly indexed Bac, EAM and E3C documents, transcribed and corrected by APMEP contributors. CoopMaths makes its texts available under CC BY-SA: https://coopmaths.fr/www/about/. This bank retains that licence, independently of the site's general content licence. Credits accompany the online bank and downloadable sources.

The manifest key annalsBank owns source metadata, chapter links and availability. The files content/tex/annals/*.tex are imported French source fragments, not native course units. Formatting errors encountered during conversion were repaired without changing question data. Proposed source corrections remain identified as such; missing corrections are never invented. Obvious transcription errors repaired during import include a derivative sign, a table total (60 euros), the first annual rent total (7,800 euros), and explicit vector-coordinate notation, and, in the corrected answer to `bac_2026_05_sujet2_ameriquenord_3`, a modifier circumflex (U+02C6) typed instead of an exponent sign (`1ˆ2` read as `1^2`, November 2026). This is not a mathematical certification of all source solutions.

The script build-annals.py converts question hierarchy, tables and maths to HTML, compiles original diagrams to SVG, and packages local LaTeX. The script build-annals-pdf.py compiles statement and correction books through the site's native class, using vector PDF figures to preserve both PSTricks and TikZ graphics. All reader requests use local files. Exercise contents load only when opened.

Build requirements: Pandoc, Python with PyMuPDF and BeautifulSoup, and TeX Live with French, latex-extra, science, pstricks, plain-generic, plus Ghostscript and dvips. Rebuild with make site. Integrity checks use the generated receipts in content/data/annals-build.json and content/data/annals-pdf-build.json.

The bank reuses the existing bank cards, MathJax, folded corrections and print path. MathJax 3.2.2's complete TeX bundle is served locally, including the extensions used by the annales.
