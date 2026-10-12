# Design prototype (not deployed)

Static reference for the Maths Explorer v2 design. Reads `PROJECT_BRIEF.md`, section 6.

Run: `python3 -m http.server 4311` in this folder, open http://localhost:4311 (a server is needed for `chapters.json`).

- `style.css`: tokens for three themes (Marine, Charbon, Jour), one 10 px radius, no shadows.
- `index.html`, `app.js`: hero parabola (draggable roots, slider for a), determinant figure, level tabs, five-part sequence. Pointer and keyboard (arrows, Shift for larger steps) control.
- `fonts/`: Atkinson Hyperlegible and STIX Two Text, both OFL, self-hosted with licences.
- `chapters.json`: real chapter titles from the current site data.
