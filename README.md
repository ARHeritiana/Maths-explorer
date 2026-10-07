# Maths Explorer

An independent **experimental mathematics laboratory for high school students**, in French and English. This project is unrelated to private tutoring.

Students start with a working experiment: change a parameter, observe a pattern, formulate a conjecture, and connect it to a mathematical explanation. There is no account, API key, build service, or runtime dependency to configure.

## Run locally

Requires Node.js 18 or later.

```sh
npm start
```

Open **http://localhost:4173**. Set `PORT` to use another port. The server is intended for local development. Any static web server can serve the `dist/` directory in production. Opening `index.html` directly with `file://` is not supported because the application uses ES modules.

## Included in this version

- **Nine functioning experiments:** quadratic functions, trigonometry, arithmetic/geometric sequences, binomial probability, derivatives, integration, vectors, descriptive statistics, and complex numbers.
- **Learning time:** prerequisites, estimated activity duration, three investigation prompts, a numerical check, and an explanation for each experiment. The duration is an estimate, not a countdown.
- **History boxes:** concise historical context with links to the University of St Andrews MacTutor archive.
- **Eight challenges:** four recreational problems and four Olympiad-style problems, each with two progressive hints, a worked solution, and an extension. These are adapted classic problems, not claimed as official competition questions.
- **Three curriculum pathways:** Malagasy, French, and IB, with course/stream limitations and official reference links.
- **Complete French/English switching**, responsive layouts, keyboard-operable native controls, accessible form labels, numeric equivalents for chart results, reduced-motion support, and print styles.
- **Device-local progress:** successful check answers and language persist in this browser. They do not sync between devices and do not constitute mastery assessment. Invalid or unavailable storage is handled without blocking the laboratory.

Curriculum pathways are **indicative topic guides**, not comprehensive syllabus coverage or certified alignment. In particular, the Malagasy streams, French options, and IB AA/AI SL/HL requirements differ. See [the design and learning plan](docs/DESIGN_PLAN.md) and [curriculum references](docs/CURRICULUM.md).

## Project structure

```text
dist/
  index.html          Semantic document, metadata, embedded favicon
  style.css           Responsive visual system and print styles
  js/
    app.js            Navigation, controls, SVG graphs, learning flows
    math.js           Pure numerical operations and validated parsing
    content.js        Bilingual lessons, challenges, curriculum pathways
scripts/serve.mjs     Dependency-free local static server
tests/math.test.mjs   Numerical edge cases and content integrity
tests/browser.py     Browser interaction and responsive checks
docs/                Design plan, curriculum scope, validation notes
```

Hash routes work on static hosts and under a repository subpath, for example `/#lab/probability`, `/#challenges/doors`, and `/#pathways`. All asset paths are relative. `dist/` is the source for the deployed site; it is intentionally committed rather than generated.

## Validation

```sh
npm run check
npm test
```

Optional browser checks use Python Playwright. Start the site in another terminal, then run:

```sh
python -m pip install playwright
python -m playwright install chromium
python tests/browser.py
```

`PLAYWRIGHT_CHROMIUM_PATH` can select an installed Chromium executable. `MATHS_EXPLORER_URL` can select a different local server. The test checks both languages, all experiments and challenges, slider boundaries, simulation accumulation/reset, invalid data, persistence, filters, four viewport widths, and enlarged text.

GitHub Actions runs syntax and numerical/content checks on pushes and pull requests. Browser tests remain an explicit local check; no browser package is required to run the site.

## Adding content

Keep every translatable field as `[French, English]` in `content.js`. Add a unique stable ID, prerequisites, investigation steps, a check with an explanation, and a sourced history note. For a new mathematical model, implement the pure operation in `math.js`, connect its controls and accessible results in `app.js`, and test its domain boundaries. Add curriculum placements only after reviewing the relevant official syllabus, stream, and year.

The optional WebMCP integration is feature-detected. It exposes experiment listing and validated slider configuration in browsers that implement `document.modelContext`; it is not required for any user-facing feature. Unsupported browsers simply use the ordinary interface.

## En français

**Maths Explorer** est un laboratoire autonome de mathématiques pour les lycéens. Les neuf expériences, les activités « Learning time », les notices historiques, les huit défis et les trois parcours sont disponibles en français et en anglais.

Lancer `npm start`, puis ouvrir **http://localhost:4173**. Aucun compte ni service externe n’est nécessaire. Les résultats de vérification réussis restent dans le navigateur de l’élève. Les parcours sont des repères pédagogiques indicatifs, et non des programmes complets ou une garantie d’alignement officiel.
