# Visual chapter workspace

The requested direction combines manipulable simulations, a clear lesson–exercise path and staged mathematical animation. The diagrams are browser-native SVG constructions inspired by the explanatory pacing of Manim; they are not rendered Manim videos.

The default route `#resources` organises the 47 French course chapters by course with accent-insensitive bilingual search. `#chapter/<id>/cours`, `/manipuler`, `/exercices` and `/documents` (the older `/prepare`, `/understand`, `/experiment`, `/practice`, `/review` still resolve) offer a companion lesson, worked example, visual experiment, reasoning exercise with deliberate hint/solution reveals and original French extracts. Shared central ideas reuse 30 concise companion guides, with 26 parameterised visual models. Guides explicitly point to the original chapter for the full set of topics.

Animations start paused. Controls allow play/pause, previous/next, a three-stage timeline and restart; native sliders change the mathematical parameter. The diagram and numeric table use the same model. Reduced motion turns playback into manual steps; hidden tabs pause and navigation removes the timer and listeners. No user-entered expression is executed and no proof is automatically marked. Practice notes stay only in session memory.

The existing `#library` remains the detailed file catalogue, including its 39 bilingual starting sheets, printable separate lesson/exercise/problem/solution files, all resource-type/language/pathway filters and existing stable links. Each new chapter documents view links to its classified files; existing chapter pages link back to the visual guide, experiment and practice. All nine direct-manipulation labs remain available and link to related chapters.

The complete resource catalogue from source `99ffeeaf4afe2883bbc8f35ef31b8dd7908575cd` was preserved. Of 144 companion PDF references, 120 reuse existing assets and 24 are additional extracts. Extra preparation collections separate annual assessments, fluency banks, reasoning, algorithms, oral workshops, proof indexes and formula references from the final chapters. Administrative appendices and the Seconde class diagnostic appendix are excluded from the new extracts. Corrections are teaching aids within the owner's private site, not a separate access boundary.

`dist/js/resources-data.js` stores source modification dates, physical PDF ranges and file sizes. `content/data/RESOURCE_PROVENANCE.json` hashes every companion extract. The source PDFs form a snapshot from 7 October 2026; there is no automatic synchronisation. Première student and teacher editions have different modification dates, surfaced in the interface before comparing solutions.

The companion catalogue (`dist/js/resources-data.js`) is generated from `content/data/manifest.json` by `make catalog` (11 October 2026; the former `build-companion-resources.py` needed the original intake PDFs and was retired).

The helper retains existing nested library assets. It does not fetch external files, change source-booklet mathematics or alter access. The original import and study-sheet generation remain documented in `RESOURCE_LIBRARY.md`. Validation and remaining browser/device limits are recorded in `VALIDATION.md`.
