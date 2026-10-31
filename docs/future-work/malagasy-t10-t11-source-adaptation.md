# Malagasy T10/T11 S: source-to-site adaptation checkpoint

**31 October 2026.** The owner changed the starting priority for Malagasy-course integration from T12 to the original owner-authored T10 and T11 material. This does not remove the still-pending T12 scope or override unrelated ongoing workstreams.

**Content transferred into public authoring sources** (not `dist/`): nine T10 chapters, nine T10 introduction activities, ten T10 solution files (one introductory plus nine chapter sets); twenty T11 S chapters and four T11 S part assessments. The original LaTeX is preserved for direct chapter-level adaptation and independent maths verification. A normalized chapter index records stable course IDs, topic and source references at `content/malagasy/chapters.json`. No finished PDF/HTML/Beamer editions have been generated, and no Malagasy chapter has been published.

**Next valuable units:** T10 chapter 1 (logic, propositions, truth tables, counterexamples, quantified claims) and T11 S chapter 1 (function image/preimage, domain and graphical exploration). Map the originals to Maths-explorer's experiment-first web/LaTeX/slides architecture, verify mathematical content and syllabus edition, build all products and secure two independent audit passes. Reuse topics and code sensibly across French curricula but do not swap their course labels or assume identical programme requirements.

**Rights:** Owner explicitly confirms sole authorship of T10/T11 works. Preserve general third-party source credit for any externally drawn material and keep owner identity absent from the Maths-explorer site. Do not extrapolate this ownership claim to T12 books.

**Release gate:** Not satisfied. Input source files are deliberately not in `content/data/manifest.json` and do not appear on the served website. Do not introduce placeholder links, fake PDFs or completed-course counts. The English curriculum lesson goal remains on standby.

**Coordination:** This is workstream D from `docs/ACTIVE_WORKSTREAMS.md`; A, B, C and E-H remain independent. The site cannot be safely published from a source-only connector session without compiling and checking its actual generated outputs.
