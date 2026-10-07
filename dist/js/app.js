import { labs, challenges, pathways } from "./content.js";
import {
  quadratic,
  sequence,
  binomial,
  sampleBinomial,
  statistics,
  parseData,
  riemann,
  isAnswer,
} from "./math.js";

const $ = (s, root = document) => root.querySelector(s);
const esc = (x) =>
  String(x).replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
let saved = {};
try {
  saved = JSON.parse(localStorage.getItem("maths-explorer-v1") || "{}") || {};
} catch {}
let lang = saved.lang === "en" ? "en" : "fr";
const completed = new Set(
  Array.isArray(saved.completed)
    ? saved.completed.filter((id) =>
        [...labs, ...challenges].some((x) => x.id === id),
      )
    : [],
);
const states = {};
let challengeFilter = "all";
let currentLab = "quadratic";
let storageWorks = true;
const t = (pair) => pair[lang === "fr" ? 0 : 1];
const fmt = (n, d = 3) =>
  Math.abs(n) < 1e-10
    ? "0"
    : new Intl.NumberFormat(lang, { maximumFractionDigits: d }).format(n);
const pair = (fr, en) => t([fr, en]);
function save() {
  try {
    localStorage.setItem(
      "maths-explorer-v1",
      JSON.stringify({ lang, completed: [...completed] }),
    );
  } catch {
    storageWorks = false;
  }
}
function state(lab) {
  return (states[lab.id] ??= {
    values: lab.params.map((p) => p[4]),
    mode: "arithmetic",
    bins: null,
    trials: 0,
    data: "2 3 4 4 5 6 9",
    answer: "",
    result: null,
  });
}
function route() {
  const parts = location.hash.slice(1).split("/");
  return { page: parts[0] || "lab", id: parts[1] };
}
function link(page, id = "") {
  return "#" + page + (id ? "/" + id : "");
}
function header(page) {
  return `<header class="topbar"><a class="brand" href="#lab"><span class="brandmark" aria-hidden="true">∿</span><span>maths<span class="brandlight">explorer</span><small>${pair("LE LABORATOIRE DES IDÉES", "THE LABORATORY OF IDEAS")}</small></span></a><nav aria-label="${pair("Navigation principale", "Main navigation")}">${[
    ["lab", "Laboratoire", "Laboratory"],
    ["challenges", "Défis", "Challenges"],
    ["pathways", "Parcours", "Pathways"],
  ]
    .map(
      ([id, fr, en]) =>
        `<a href="#${id}" ${page === id ? 'aria-current="page"' : ""}>${pair(fr, en)}</a>`,
    )
    .join(
      "",
    )}</nav><div class="language" role="group" aria-label="${pair("Langue", "Language")}"><button data-lang="fr" aria-pressed="${lang === "fr"}" lang="fr">FR</button><span aria-hidden="true">/</span><button data-lang="en" aria-pressed="${lang === "en"}" lang="en">EN</button></div></header>`;
}
function footer() {
  return `<footer><span>Maths Explorer <span aria-hidden="true">·</span> ${pair("Observer. Conjecturer. Démontrer.", "Observe. Conjecture. Prove.")}</span><span>${storageWorks ? pair("Progression enregistrée sur cet appareil.", "Progress saved on this device.") : pair("Stockage indisponible : progression conservée pour cette session.", "Storage unavailable: progress kept for this session.")} <a href="#pathways">${pair("Programmes & sources", "Curricula & sources")}</a></span></footer>`;
}
function render() {
  const r = route();
  document.documentElement.lang = lang;
  document.title = pair(
    "Maths Explorer · Laboratoire de mathématiques",
    "Maths Explorer · Mathematics laboratory",
  );
  const valid = ["lab", "challenges", "pathways"].includes(r.page);
  const page = valid ? r.page : "missing";
  $("#app").innerHTML =
    header(page) +
    (page === "lab"
      ? labPage(r.id)
      : page === "challenges"
        ? challengePage(r.id)
        : page === "pathways"
          ? pathwayPage()
          : `<main id="main" tabindex="-1" class="page"><h1>${pair("Page introuvable", "Page not found")}</h1><a href="#lab">${pair("Ouvrir le laboratoire", "Open the laboratory")}</a></main>`) +
    footer();
  if (page === "lab" && $("#plot")) updateLab();
  bindCommon();
  if (page === "lab") bindLab();
  if (page === "challenges") bindChallenges();
}
function bindCommon() {
  document.querySelectorAll("[data-lang]").forEach((b) =>
    b.addEventListener("click", () => {
      lang = b.dataset.lang;
      save();
      render();
      $(`[data-lang="${lang}"]`).focus();
    }),
  );
}
const navLabs = [...labs].sort(
  (a, b) =>
    ["Algèbre", "Géométrie", "Données & hasard", "Analyse"].indexOf(
      a.group[0],
    ) -
    ["Algèbre", "Géométrie", "Données & hasard", "Analyse"].indexOf(b.group[0]),
);
function labPage(id) {
  const lab = labs.find((x) => x.id === id) || labs[0];
  currentLab = lab.id;
  const s = state(lab);
  return `<div class="lab-layout"><aside class="sidebar" aria-label="${pair("Expériences", "Experiments")}"><div class="side-title">${pair("EXPLORER", "EXPLORE")} <span>09</span></div><div class="lab-links">${navLabs.map((x, i) => `${i === 0 || t(x.group) !== t(navLabs[i - 1].group) ? `<p class="group-label">${t(x.group)}</p>` : ""}<a href="${link("lab", x.id)}" class="lab-link ${x.id === lab.id ? "selected" : ""}" ${x.id === lab.id ? 'aria-current="page"' : ""}><span class="lab-symbol" aria-hidden="true">${x.symbol}</span><span>${t(x.short)}</span>${completed.has(x.id) ? '<span class="check" aria-label="' + pair("Question réussie", "Check completed") + '">✓</span>' : ""}</a>`).join("")}</div><div class="side-note"><span aria-hidden="true">✧</span><p>${pair("Une question est un bon point de départ.", "A question is a good place to start.")}</p></div></aside>
 <main id="main" class="lab-main" tabindex="-1"><div class="breadcrumb">${pair("LE LABORATOIRE", "THE LABORATORY")}<span>/</span>${t(lab.group)}</div><div class="lab-heading"><div><h1>${t(lab.title)}</h1><p>${t(lab.intro)}</p></div><span class="level">${t(lab.level)}</span></div>
 <div class="workbench"><section class="experiment" aria-label="${pair("Expérience interactive", "Interactive experiment")}"><div class="experiment-top"><span class="eyebrow">${pair("À TOI D’EXPÉRIMENTER", "YOUR TURN TO EXPERIMENT")}</span><button id="reset" class="text-button">${pair("Réinitialiser", "Reset")}</button></div><div class="formula" id="formula">${lab.formula}</div><div id="plot" class="plot"></div><div class="plot-caption" id="plot-caption"></div><div class="controls">
 ${
   lab.id === "sequences"
     ? `<fieldset class="mode"><legend>${pair("Type de suite", "Sequence type")}</legend>${[
         ["arithmetic", "Arithmétique", "Arithmetic"],
         ["geometric", "Géométrique", "Geometric"],
       ]
         .map(
           ([v, fr, en]) =>
             `<label><input type="radio" name="mode" value="${v}" ${s.mode === v ? "checked" : ""}>${pair(fr, en)}</label>`,
         )
         .join("")}</fieldset>`
     : ""
 }
 ${lab.params.map(([name, min, max, step], i) => `<label class="slider-control" for="param-${i}"><span>${name}<output id="value-${i}">${fmt(s.values[i])}${name === "θ" ? "°" : ""}</output></span><input id="param-${i}" data-param="${i}" type="range" min="${min}" max="${max}" step="${step}" value="${s.values[i]}"><span class="range-limits"><span>${fmt(min)}</span><span>${fmt(max)}</span></span></label>`).join("")}
 ${lab.id === "statistics" ? `<label class="data-label" for="data-input">${pair("Tes données", "Your data")}</label><textarea id="data-input" rows="2" aria-describedby="data-help data-error">${esc(s.data)}</textarea><p id="data-help" class="muted">${pair("1 à 100 valeurs séparées par des espaces ou des points-virgules. Décimales : 2,5 ou 2.5. Valeurs entre −10 000 et 10 000.", "1–100 values separated by spaces or semicolons. Decimals: 2.5 or 2,5. Values between −10,000 and 10,000.")}</p><p id="data-error" class="error" role="alert"></p>` : ""}
 ${lab.id === "probability" ? `<div class="simulation"><button class="primary" data-sim="100">${pair("Simuler 100 expériences", "Simulate 100 experiments")}</button><button class="secondary" data-sim="1000">${pair("En ajouter 1 000", "Add 1,000")}</button><p id="sim-status" class="muted" aria-live="polite"></p></div>` : ""}</div><div id="results" class="results" aria-live="polite" aria-atomic="true"></div></section>
 <aside class="learning"><div class="learning-label"><span aria-hidden="true">◷</span> Learning time <span>${lab.duration} min</span></div><h2>${pair("De l’intuition à l’idée", "From intuition to insight")}</h2><p class="prereq"><strong>${pair("Avant de commencer", "Before you begin")}</strong><br>${t(lab.prereq)}</p><ol class="steps">${lab.steps.map((x) => `<li>${t(x)}</li>`).join("")}</ol><div class="checkpoint"><span class="eyebrow">${pair("LE PETIT DÉCLIC", "CHECK YOUR UNDERSTANDING")}</span><form id="lab-quiz"><label for="quiz-answer">${t(lab.quiz)}</label><div class="answer-row"><input id="quiz-answer" name="answer" type="text" inputmode="text" autocomplete="off" placeholder="${pair("Ta réponse", "Your answer")}" required value="${esc(s.answer)}"><button class="primary" type="submit">${pair("Vérifier", "Check")}</button></div></form><p id="quiz-feedback" class="feedback" role="status">${s.result === true ? pair("Bien vu ! ", "That’s right! ") + t(lab.explain) : s.result === false ? pair("Pas encore. Reprends l’expérience et essaie à nouveau.", "Not yet. Revisit the experiment and try again.") : ""}</p><details><summary>${pair("Comprendre la réponse", "Understand the answer")}</summary><p>${t(lab.explain)}</p></details></div></aside></div>
 <section class="history"><div class="history-icon" aria-hidden="true">H</div><div class="history-title"><span class="eyebrow">HISTORY BOX</span><h2>${t(lab.history)}</h2></div><div><p>${t(lab.story)}</p><a href="${lab.source}" target="_blank" rel="noopener noreferrer">${pair("En savoir plus · MacTutor (anglais)", "Read more · MacTutor")} <span class="sr-only">${pair("(nouvel onglet)", "(new tab)")}</span></a></div></section></main></div>`;
}

// SVG is used only for mathematical diagrams and data visualization.
function chart({
  xmin = -6,
  xmax = 6,
  ymin = -5,
  ymax = 7,
  label = "",
  equal = false,
  draw,
}) {
  const W = 720,
    H = 350,
    L = 48,
    R = 22,
    T = 22,
    B = 36,
    pw = W - L - R,
    ph = H - T - B;
  if (equal) {
    const mid = (xmin + xmax) / 2,
      half = ((ymax - ymin) * pw) / ph / 2;
    xmin = mid - half;
    xmax = mid + half;
  }
  const X = (x) => L + ((x - xmin) / (xmax - xmin)) * pw,
    Y = (y) => H - B - ((y - ymin) / (ymax - ymin)) * ph;
  let grid = "";
  const tick = (min, max) => {
    const rough = (max - min) / 8,
      exp = 10 ** Math.floor(Math.log10(rough));
    return [1, 2, 5, 10].map((v) => v * exp).find((v) => v >= rough);
  };
  const dx = tick(xmin, xmax),
    dy = tick(ymin, ymax);
  for (let x = Math.ceil(xmin / dx) * dx; x <= xmax + 1e-9; x += dx)
    grid += `<path d="M${X(x)} ${T}V${H - B}" class="gridline"/><text x="${X(x)}" y="${H - 12}" text-anchor="middle">${fmt(x, 2)}</text>`;
  for (let y = Math.ceil(ymin / dy) * dy; y <= ymax + 1e-9; y += dy)
    grid += `<path d="M${L} ${Y(y)}H${W - R}" class="gridline"/><text x="${L - 9}" y="${Y(y) + 4}" text-anchor="end">${fmt(y, 2)}</text>`;
  const line = (x1, y1, x2, y2, color = "teal", dash = false) =>
    `<line x1="${X(x1)}" y1="${Y(y1)}" x2="${X(x2)}" y2="${Y(y2)}" class="curve ${color}" ${dash ? 'stroke-dasharray="7 5"' : ""}/>`;
  const point = (x, y, color = "teal", r = 5) =>
    `<circle cx="${X(x)}" cy="${Y(y)}" r="${r}" class="point ${color}"/>`;
  const path = (fn, color = "teal") => {
    let d = "";
    for (let i = 0; i <= 400; i++) {
      const x = xmin + ((xmax - xmin) * i) / 400;
      const y = fn(x);
      if (Number.isFinite(y))
        d += `${i ? "L" : "M"}${X(x).toFixed(2)},${Y(y).toFixed(2)} `;
    }
    return `<path d="${d}" class="curve ${color}"/>`;
  };
  const rect = (x, y, w, h, color = "teal") =>
    `<rect x="${X(x)}" y="${Y(y + h)}" width="${Math.max(0.1, (w * pw) / (xmax - xmin))}" height="${Math.max(0, (h * ph) / (ymax - ymin))}" class="bar ${color}"/>`;
  return `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(label)}"><title>${esc(label)}</title><defs><clipPath id="plot-clip"><rect x="${L}" y="${T}" width="${pw}" height="${ph}"/></clipPath></defs>${grid}<g clip-path="url(#plot-clip)">${xmin <= 0 && xmax >= 0 ? `<path d="M${X(0)} ${T}V${H - B}" class="axis"/>` : ""}${ymin <= 0 && ymax >= 0 ? `<path d="M${L} ${Y(0)}H${W - R}" class="axis"/>` : ""}${draw({ X, Y, line, point, path, rect, pw, ph })}</g></svg>`;
}
function metric(label, value) {
  return `<div><span>${label}</span><strong>${value}</strong></div>`;
}
function updateLab() {
  const lab = labs.find((x) => x.id === currentLab),
    s = state(lab),
    v = s.values;
  v.forEach((x, i) => {
    $(`#value-${i}`).textContent =
      fmt(x) + (lab.params[i][0] === "θ" ? "°" : "");
    $(`#param-${i}`).setAttribute(
      "aria-valuetext",
      fmt(x) + (lab.params[i][0] === "θ" ? "°" : ""),
    );
  });
  let plot = "",
    results = "",
    caption = "",
    formula = lab.formula;
  if (lab.id === "quadratic") {
    const [a, b, c] = v,
      q = quadratic(a, b, c);
    formula = `f(x) = ${fmt(a)}x² ${b < 0 ? "−" : "+"} ${fmt(Math.abs(b))}x ${c < 0 ? "−" : "+"} ${fmt(Math.abs(c))}`;
    plot = chart({
      label: pair(
        "Courbe de la fonction et racines réelles",
        "Function graph and real roots",
      ),
      draw: ({ path, point }) =>
        path((x) => a * x * x + b * x + c) +
        q.roots.map((x) => point(x, 0, "orange")).join("") +
        (q.vertex ? point(...q.vertex) : ""),
    });
    results =
      metric(
        pair("Racines réelles", "Real roots"),
        q.allReal
          ? "ℝ"
          : q.roots.length
            ? q.roots.map((x) => fmt(x)).join(" ; ")
            : pair("Aucune", "None"),
      ) +
      metric(
        q.kind === "quadratic" ? "Δ" : pair("Type", "Type"),
        q.kind === "quadratic"
          ? fmt(q.discriminant)
          : q.kind === "linear"
            ? pair("Affine", "Linear")
            : pair("Constante", "Constant"),
      ) +
      metric(
        pair("Sommet", "Vertex"),
        q.vertex ? `(${fmt(q.vertex[0])} ; ${fmt(q.vertex[1])})` : "—",
      );
    caption = pair(
      "Fenêtre fixe : x ∈ [−6 ; 6], y ∈ [−5 ; 7]. Certaines racines ou le sommet peuvent être hors champ.",
      "Fixed window: x ∈ [−6, 6], y ∈ [−5, 7]. Some roots or the vertex may be outside the view.",
    );
  } else if (lab.id === "trig") {
    const theta = (v[0] * Math.PI) / 180,
      c = Math.cos(theta),
      si = Math.sin(theta);
    const cx = 185,
      cy = 171,
      r = 115,
      px = cx + r * c,
      py = cy - r * si;
    plot = `<svg viewBox="0 0 720 350" role="img" aria-label="${pair("Cercle unité et valeurs du sinus et du cosinus", "Unit circle and sine and cosine values")}"><circle cx="${cx}" cy="${cy}" r="${r}" class="circle-grid"/><path d="M40 ${cy}H330M${cx} 30V315" class="axis"/><path d="M${cx} ${cy}L${px} ${py}" class="curve teal"/><path d="M${cx} ${cy}H${px}" class="curve orange"/><path d="M${px} ${cy}V${py}" class="curve blue"/><circle cx="${px}" cy="${py}" r="7" class="point teal"/><text x="305" y="193">1</text><text x="196" y="55">1</text><text x="${cx + 12}" y="${cy - 12}">${fmt(v[0])}°</text><text x="380" y="70" class="svg-heading">P = (cos θ, sin θ)</text><text x="380" y="115" class="svg-value">(${fmt(c)} ; ${fmt(si)})</text><path d="M380 170H680M380 245H680" class="gridline"/><path d="M530 155V265" class="axis"/><path d="M530 170H${530 + c * 140}" class="curve orange"/><path d="M530 245H${530 + si * 140}" class="curve blue"/><text x="380" y="155">cos θ</text><text x="380" y="230">sin θ</text></svg>`;
    results =
      metric("cos θ", fmt(c)) +
      metric("sin θ", fmt(si)) +
      metric(pair("Angle en radians", "Angle in radians"), fmt(theta));
    caption = pair(
      "Orange : cosinus (horizontal). Bleu : sinus (vertical). Le rayon vaut 1.",
      "Orange: cosine (horizontal). Blue: sine (vertical). The radius is 1.",
    );
  } else if (lab.id === "sequences") {
    const [first, step, n] = v,
      values = sequence(first, step, n, s.mode === "geometric"),
      lo = Math.min(0, ...values),
      hi = Math.max(1, ...values),
      pad = (hi - lo) * 0.12;
    plot = chart({
      xmin: -0.5,
      xmax: n - 0.5,
      ymin: lo - pad,
      ymax: hi + pad,
      label: pair(
        "Termes de la suite, indices de 0 à N − 1",
        "Sequence terms, indices 0 to N − 1",
      ),
      draw: ({ point }) => values.map((y, i) => point(i, y)).join(""),
    });
    formula =
      s.mode === "geometric"
        ? `uₙ = ${fmt(first)} × (${fmt(step)})ⁿ`
        : `uₙ = ${fmt(first)} + n × (${fmt(step)})`;
    results =
      metric("u₀", fmt(first)) +
      metric(`u${n - 1}`, fmt(values.at(-1))) +
      metric(
        pair("Somme des N termes", "Sum of N terms"),
        fmt(values.reduce((a, b) => a + b, 0)),
      );
    caption = pair(
      "N termes, à partir de u₀. Les points sont discrets ; l’échelle verticale s’adapte.",
      "N terms, starting at u₀. Points are discrete; the vertical scale adjusts.",
    );
  } else if (lab.id === "probability") {
    const [n, p] = v,
      probs = binomial(n, p),
      freq = s.bins ? s.bins.map((x) => x / s.trials) : [],
      max = Math.max(...probs, ...freq, 0.1);
    plot = chart({
      xmin: -0.75,
      xmax: n + 0.75,
      ymin: 0,
      ymax: max * 1.18,
      label: pair(
        "Probabilités binomiales et fréquences simulées",
        "Binomial probabilities and simulated frequencies",
      ),
      draw: ({ rect }) =>
        probs
          .map(
            (y, k) =>
              rect(k - 0.32, 0, 0.3, y) +
              (s.bins ? rect(k + 0.02, 0, 0.3, freq[k], "orange") : ""),
          )
          .join(""),
    });
    results =
      metric("E(X) = np", fmt(n * p)) +
      metric(
        pair("Écart-type théorique", "Theoretical standard deviation"),
        fmt(Math.sqrt(n * p * (1 - p))),
      ) +
      metric(
        pair("Expériences simulées", "Simulated experiments"),
        fmt(s.trials, 0),
      );
    caption = pair(
      "Vert : probabilité théorique. Orange : fréquence observée. Axe horizontal : nombre de succès.",
      "Green: theoretical probability. Orange: observed frequency. Horizontal axis: number of successes.",
    );
    $("#sim-status").textContent = s.trials
      ? pair(
          "Les expériences s’ajoutent. Changer n ou p remet la simulation à zéro.",
          "Experiments accumulate. Changing n or p resets the simulation.",
        )
      : pair(
          "Lance la simulation pour comparer.",
          "Run the simulation to compare.",
        );
  } else if (lab.id === "derivative") {
    const [x, h] = v,
      m = 2 * x + h;
    plot = chart({
      xmin: -4,
      xmax: 5,
      ymin: -3,
      ymax: Math.max(12, (x + h) ** 2 + 2),
      label: pair(
        "Parabole, sécante et tangente",
        "Parabola, secant and tangent",
      ),
      draw: ({ path, point }) =>
        path((t) => t * t) +
        path((t) => x * x + m * (t - x), "orange") +
        path((t) => x * x + 2 * x * (t - x), "blue") +
        point(x, x * x) +
        point(x + h, (x + h) ** 2, "orange"),
    });
    results =
      metric(pair("Pente de la sécante", "Secant slope"), fmt(m)) +
      metric(pair("Pente de la tangente", "Tangent slope"), fmt(2 * x)) +
      metric(pair("Écart des pentes", "Slope difference"), fmt(h));
    caption = pair(
      "Vert : f(x) = x². Orange : sécante. Bleu : tangente. Ici h > 0 ; la dérivée exige une limite des deux côtés.",
      "Green: f(x) = x². Orange: secant. Blue: tangent. Here h > 0; differentiability requires a two-sided limit.",
    );
  } else if (lab.id === "integral") {
    const n = v[0],
      area = riemann(n);
    plot = chart({
      xmin: 0,
      xmax: 1.05,
      ymin: 0,
      ymax: 1.15,
      label: pair(
        "Rectangles à gauche sous la courbe de x² entre 0 et 1",
        "Left rectangles under x² between 0 and 1",
      ),
      draw: ({ rect, path }) =>
        Array.from({ length: n }, (_, i) =>
          rect(i / n, 0, 1 / n, (i / n) ** 2),
        ).join("") + path((x) => x * x, "orange"),
    });
    results =
      metric(pair("Somme des rectangles", "Rectangle sum"), fmt(area, 5)) +
      metric(pair("Aire exacte", "Exact area"), "1/3 ≈ " + fmt(1 / 3, 5)) +
      metric(pair("Erreur absolue", "Absolute error"), fmt(1 / 3 - area, 5));
    caption = pair(
      "Une approximation par défaut : x² est croissante sur [0 ; 1].",
      "A lower estimate: x² is increasing on [0, 1].",
    );
  } else if (lab.id === "vectors") {
    const [a, b, c, d] = v,
      norms = Math.hypot(a, b) * Math.hypot(c, d),
      dot = a * c + b * d,
      angle = norms
        ? (Math.acos(Math.max(-1, Math.min(1, dot / norms))) * 180) / Math.PI
        : null;
    plot = chart({
      xmin: -9,
      xmax: 9,
      ymin: -9,
      ymax: 9,
      equal: true,
      label: pair("Vecteurs u, v et leur somme", "Vectors u, v and their sum"),
      draw: ({ line, point }) =>
        line(0, 0, a, b) +
        line(0, 0, c, d, "orange") +
        line(a, b, a + c, b + d, "orange", true) +
        line(c, d, a + c, b + d, "teal", true) +
        line(0, 0, a + c, b + d, "blue") +
        point(a, b) +
        point(c, d, "orange") +
        point(a + c, b + d, "blue"),
    });
    results =
      metric("u + v", `(${fmt(a + c)} ; ${fmt(b + d)})`) +
      metric("u · v", fmt(dot)) +
      metric(
        pair("Angle entre u et v", "Angle between u and v"),
        angle === null
          ? pair("Indéfini (vecteur nul)", "Undefined (zero vector)")
          : fmt(angle, 1) + "°",
      );
    caption = pair(
      "Vert : u. Orange : v. Bleu : u + v. Les deux axes utilisent la même échelle.",
      "Green: u. Orange: v. Blue: u + v. Both axes use the same scale.",
    );
  } else if (lab.id === "statistics") {
    try {
      const values = parseData(s.data),
        stats = statistics(values),
        range = Math.max(1, stats.max - stats.min),
        counts = {};
      values.forEach((x) => (counts[x] = (counts[x] || 0) + 1));
      const maxCount = Math.max(...Object.values(counts));
      plot = chart({
        xmin: stats.min - range * 0.15,
        xmax: stats.max + range * 0.15,
        ymin: 0,
        ymax: maxCount + 1,
        label: pair("Diagramme de points des données", "Dot plot of the data"),
        draw: ({ point, line }) =>
          Object.entries(counts)
            .map(([x, n]) =>
              Array.from({ length: n }, (_, i) => point(+x, i + 1)).join(""),
            )
            .join("") +
          line(stats.mean, 0, stats.mean, maxCount + 0.5, "orange", true) +
          line(stats.median, 0, stats.median, maxCount + 0.5, "blue", true),
      });
      results =
        metric(pair("Moyenne", "Mean"), fmt(stats.mean)) +
        metric(pair("Médiane", "Median"), fmt(stats.median)) +
        metric(
          pair("Écart-type (population)", "Standard deviation (population)"),
          fmt(stats.sd),
        );
      caption = pair(
        "Un point par observation. Orange : moyenne. Bleu : médiane. Écart-type avec division par n.",
        "One dot per observation. Orange: mean. Blue: median. Standard deviation divides by n.",
      );
      $("#data-error").textContent = "";
      $("#data-input").removeAttribute("aria-invalid");
    } catch {
      $("#data-error").textContent = pair(
        "Saisis de 1 à 100 nombres valides entre −10 000 et 10 000. Sépare-les par des espaces ou des points-virgules.",
        "Enter 1–100 valid numbers between −10,000 and 10,000. Separate them with spaces or semicolons.",
      );
      $("#data-input").setAttribute("aria-invalid", "true");
      plot = `<div class="plot-empty">${pair("Ajoute des données valides pour afficher le graphique.", "Add valid data to display the chart.")}</div>`;
      results = metric(pair("Données", "Data"), "—");
    }
  } else if (lab.id === "complex") {
    const [a, b] = v;
    plot = chart({
      xmin: -5,
      xmax: 5,
      ymin: -5,
      ymax: 5,
      equal: true,
      label: pair(
        "Nombres complexes z et iz dans le plan",
        "Complex numbers z and iz in the plane",
      ),
      draw: ({ line, point }) =>
        line(0, 0, a, b) +
        line(0, 0, -b, a, "orange") +
        point(a, b) +
        point(-b, a, "orange"),
    });
    results =
      metric("z", `${fmt(a)} ${b < 0 ? "−" : "+"} ${fmt(Math.abs(b))}i`) +
      metric("iz", `${fmt(-b)} ${a < 0 ? "−" : "+"} ${fmt(Math.abs(a))}i`) +
      metric("|z|", fmt(Math.hypot(a, b)));
    caption = pair(
      "Vert : z. Orange : iz. La multiplication par i donne une rotation de 90° ; les axes ont la même échelle.",
      "Green: z. Orange: iz. Multiplication by i gives a 90° rotation; both axes use the same scale.",
    );
  }
  $("#plot").innerHTML = plot;
  $("#results").innerHTML = results;
  $("#plot-caption").textContent = caption;
  $("#formula").textContent = formula;
}
function bindLab() {
  const lab = labs.find((x) => x.id === currentLab),
    s = state(lab);
  document.querySelectorAll("[data-param]").forEach((input) =>
    input.addEventListener("input", () => {
      s.values[+input.dataset.param] = +input.value;
      s.bins = null;
      s.trials = 0;
      updateLab();
    }),
  );
  $("#reset")?.addEventListener("click", () => {
    delete states[lab.id];
    render();
    $("#reset").focus();
  });
  document.querySelectorAll('[name="mode"]').forEach((input) =>
    input.addEventListener("change", () => {
      s.mode = input.value;
      updateLab();
    }),
  );
  $("#data-input")?.addEventListener("input", (e) => {
    s.data = e.target.value;
    updateLab();
  });
  document.querySelectorAll("[data-sim]").forEach((b) =>
    b.addEventListener("click", () => {
      const count = +b.dataset.sim,
        bins = sampleBinomial(...s.values, count);
      s.bins = bins.map((x, i) => x + (s.bins?.[i] || 0));
      s.trials += count;
      updateLab();
    }),
  );
  $("#quiz-answer")?.addEventListener(
    "input",
    (e) => (s.answer = e.target.value),
  );
  $("#lab-quiz")?.addEventListener("submit", (e) => {
    e.preventDefault();
    s.result = isAnswer(s.answer, lab.answer);
    if (s.result) {
      completed.add(lab.id);
      save();
    }
    $("#quiz-feedback").textContent = s.result
      ? pair("Bien vu ! ", "That’s right! ") + t(lab.explain)
      : pair(
          "Pas encore. Reprends l’expérience et essaie à nouveau. Tu peux écrire une fraction, comme 1/3.",
          "Not yet. Revisit the experiment and try again. You can enter a fraction, such as 1/3.",
        );
    $("#quiz-feedback").classList.toggle("success", s.result);
  });
}
function challengePage(id) {
  const c = challenges.find((x) => x.id === id);
  if (c) return challengeDetail(c);
  const filtered = challenges.filter(
    (x) => challengeFilter === "all" || x.type === challengeFilter,
  );
  return `<main id="main" class="page" tabindex="-1"><div class="section-kicker">${pair("LE TERRAIN DE JEU", "THE PLAYGROUND")}</div><div class="page-heading"><div><h1>${pair("À chaque problème, une découverte.", "A discovery in every problem.")}</h1><p>${pair("Prends un crayon. Essaie une idée. Les indices sont là si tu en as besoin.", "Grab a pencil. Try an idea. Hints are here when you need them.")}</p></div><div class="progress-badge"><strong>${challenges.filter((x) => completed.has(x.id)).length} / ${challenges.length}</strong><span>${pair("réponses trouvées", "answers found")}</span></div></div><div class="filter-row" role="group" aria-label="${pair("Type de défi", "Challenge type")}">${[
    ["all", "Tous les défis", "All challenges"],
    ["play", "Maths récréatives", "Recreational maths"],
    ["olympiad", "Esprit olympiade", "Olympiad thinking"],
  ]
    .map(
      ([v, fr, en]) =>
        `<button class="filter" data-filter="${v}" aria-pressed="${challengeFilter === v}">${pair(fr, en)}</button>`,
    )
    .join(
      "",
    )}</div><div class="challenge-grid">${filtered.map((x, i) => `<a class="challenge-card" href="${link("challenges", x.id)}"><div class="card-top"><span class="tag ${x.type}">${x.type === "play" ? pair("RÉCRÉATIF", "RECREATIONAL") : pair("OLYMPIADE", "OLYMPIAD")}</span><span class="card-number">${String(challenges.indexOf(x) + 1).padStart(2, "0")}</span></div><span class="challenge-motif" aria-hidden="true">${["∑", "□", "▦", "⋮", "≡", "n³", "≥", "n²"][challenges.indexOf(x)]}</span><h2>${t(x.title)}</h2><p>${t(x.topic)}</p><div class="card-bottom"><span>${"●".repeat(x.difficulty)}${"○".repeat(3 - x.difficulty)} <span class="sr-only">${pair("Difficulté", "Difficulty")} ${x.difficulty}/3</span></span><span>${completed.has(x.id) ? pair("✓ Réponse trouvée", "✓ Answer found") : x.minutes + " min"}</span></div></a>`).join("")}</div><p class="editorial-note">${pair("Problèmes classiques reformulés pour le laboratoire. « Esprit olympiade » désigne le type de raisonnement, pas une provenance officielle. Une réponse numérique ne remplace pas une preuve.", "Classic problems adapted for the laboratory. “Olympiad thinking” describes the reasoning style, not official contest provenance. A numerical answer does not replace a proof.")}</p></main>`;
}
function challengeDetail(c) {
  return `<main id="main" class="page challenge-detail" tabindex="-1"><a class="backlink" href="#challenges">${pair("Tous les défis", "All challenges")}</a><div class="challenge-columns"><article><span class="section-kicker">${t(c.topic)} · ${c.minutes} MIN</span><h1>${t(c.title)}</h1><p class="problem">${t(c.prompt)}</p><div class="proof-callout"><strong>${pair("Pense comme un mathématicien", "Think like a mathematician")}</strong><p>${pair("Teste un petit exemple, cherche une régularité, puis explique pourquoi elle est vraie.", "Test a small example, look for a pattern, then explain why it is true.")}</p></div><form id="challenge-form" data-id="${c.id}"><label for="challenge-answer">${pair("Ta réponse numérique", "Your numerical answer")}</label><div class="answer-row"><input type="text" id="challenge-answer" inputmode="text" required autocomplete="off" placeholder="${pair("Nombre ou fraction", "Number or fraction")}"><button class="primary">${pair("Vérifier", "Check")}</button></div><p id="challenge-feedback" class="feedback" role="status">${completed.has(c.id) ? pair("Tu as déjà trouvé cette réponse. Essaie maintenant de rédiger la preuve.", "You have already found this answer. Now try writing the proof.") : ""}</p></form></article><aside class="hint-panel"><h2>${pair("Un coup de pouce ?", "A little nudge?")}</h2>${c.hints.map((h, i) => `<details><summary>${pair("Indice", "Hint")} ${i + 1}</summary><p>${t(h)}</p></details>`).join("")}<details class="solution"><summary>${pair("Voir la solution expliquée", "See the worked solution")}</summary><p>${t(c.solution)}</p></details><div class="extension"><span class="eyebrow">${pair("POUR ALLER PLUS LOIN", "TAKE IT FURTHER")}</span><p>${t(c.extension)}</p></div></aside></div></main>`;
}
function bindChallenges() {
  document.querySelectorAll("[data-filter]").forEach((b) =>
    b.addEventListener("click", () => {
      challengeFilter = b.dataset.filter;
      render();
      $(`[data-filter="${challengeFilter}"]`).focus();
    }),
  );
  $("#challenge-form")?.addEventListener("submit", (e) => {
    e.preventDefault();
    const c = challenges.find((x) => x.id === e.target.dataset.id),
      correct = isAnswer($("#challenge-answer").value, c.answer);
    if (correct) {
      completed.add(c.id);
      save();
    }
    $("#challenge-feedback").textContent = correct
      ? pair(
          "C’est la bonne valeur. Maintenant, justifie-la : la solution t’aide à comparer ton raisonnement.",
          "That is the correct value. Now justify it: use the solution to compare your reasoning.",
        )
      : pair(
          "Pas encore. Essaie un cas plus simple ou ouvre le premier indice.",
          "Not yet. Try a simpler case or open the first hint.",
        );
    $("#challenge-feedback").classList.toggle("success", correct);
  });
}
function pathwayPage() {
  return `<main id="main" class="page" tabindex="-1"><div class="section-kicker">${pair("CHOISIR SON CHEMIN", "CHOOSE YOUR PATH")}</div><h1>${pair("Les mêmes idées, plusieurs parcours.", "Shared ideas, different pathways.")}</h1><p class="page-intro">${pair("Pars de ton programme ou suis simplement ta curiosité. Chaque expérience précise ses prérequis.", "Start with your curriculum or simply follow your curiosity. Each experiment lists its prerequisites.")}</p><div class="pathway-grid">${pathways
    .map(
      (p) =>
        `<section class="pathway-card"><div class="pathway-label">${p.label}</div><h2>${t(p.name)}</h2><p>${t(p.intro)}</p>${p.stages
          .map(
            (s) =>
              `<div class="stage"><h3>${t(s.name)}</h3><ul>${s.ids
                .map((id) => {
                  const l = labs.find((x) => x.id === id);
                  return `<li><a href="${link("lab", id)}"><span aria-hidden="true">${l.symbol}</span>${t(l.short)}${completed.has(id) ? '<span class="check">✓</span>' : ""}</a></li>`;
                })
                .join("")}</ul></div>`,
          )
          .join(
            "",
          )}<a class="source-link" href="${p.source}" target="_blank" rel="noopener noreferrer">${t(p.sourceName)} <span class="sr-only">${pair("(nouvel onglet)", "(new tab)")}</span></a></section>`,
    )
    .join(
      "",
    )}</div><section class="curriculum-note"><h2>${pair("À propos de ces repères", "About these pathways")}</h2><p>${pair("Ce laboratoire est une sélection d’explorations, pas un programme exhaustif ni une certification d’alignement. Les placements sont pédagogiques et indicatifs ; vérifie la série, l’option et l’année avec ton enseignant. Les références ont été consultées en octobre 2026.", "This laboratory is a selection of explorations, not a complete syllabus or a certification of alignment. Placements are pedagogical suggestions; check your stream, option and year with your teacher. References were consulted in October 2026.")}</p><p>${pair("France : les programmes évoluent à partir de 2026. IB : une nouvelle version sera enseignée à partir de 2027, avec une première évaluation en 2029. Madagascar : les documents du ministère distinguent plusieurs séries ; les extensions scientifiques ne s’appliquent pas à toutes.", "France: curricula are changing from 2026. IB: a new version will be taught from 2027, with first assessment in 2029. Madagascar: ministry documents distinguish several streams; scientific extensions do not apply to all of them.")}</p><p>${pair("Les History boxes renvoient aux notices du MacTutor History of Mathematics Archive de l’université de St Andrews. Aucune donnée personnelle n’est envoyée : les réponses réussies et la langue sont conservées uniquement dans ce navigateur.", "History boxes link to the University of St Andrews MacTutor History of Mathematics Archive. No personal data is sent: completed answers and language are stored only in this browser.")}</p></section></main>`;
}

window.addEventListener("hashchange", () => {
  render();
  $("#main")?.focus({ preventScroll: true });
  window.scrollTo(0, 0);
});
render();

// Optional browser-standard agent access; ordinary browsers need no polyfill or service.
if (document.modelContext?.registerTool) {
  const lifecycle = new AbortController();
  const register = (tool) => {
    try {
      Promise.resolve(
        document.modelContext.registerTool(tool, { signal: lifecycle.signal }),
      ).catch(() => {});
    } catch {}
  };
  register({
    name: "list_math_experiments",
    description: "List the available mathematics experiments.",
    inputSchema: {
      type: "object",
      properties: {},
      additionalProperties: false,
    },
    annotations: { readOnlyHint: true },
    execute: () => labs.map((l) => ({ id: l.id, title: t(l.title) })),
  });
  register({
    name: "configure_math_experiment",
    description:
      "Open an experiment and optionally set its numeric sliders. This does not submit a learning answer.",
    inputSchema: {
      type: "object",
      properties: {
        id: { type: "string", enum: labs.map((l) => l.id) },
        values: { type: "array", items: { type: "number" } },
      },
      required: ["id"],
      additionalProperties: false,
    },
    annotations: { readOnlyHint: false },
    execute: (input) => {
      const l = labs.find((x) => x.id === input?.id);
      if (!l) throw new Error("Unknown experiment");
      if (input.values !== undefined) {
        if (
          !Array.isArray(input.values) ||
          input.values.length !== l.params.length ||
          input.values.some(
            (v, i) =>
              !Number.isFinite(v) ||
              v < l.params[i][1] ||
              v > l.params[i][2] ||
              Math.abs(
                (v - l.params[i][1]) / l.params[i][3] -
                  Math.round((v - l.params[i][1]) / l.params[i][3]),
              ) > 1e-7,
          )
        )
          throw new Error("Invalid slider values");
        state(l).values = [...input.values];
        state(l).bins = null;
        state(l).trials = 0;
      }
      history.replaceState(null, "", link("lab", l.id));
      render();
      return { id: l.id, values: state(l).values };
    },
  });
  window.addEventListener("pagehide", () => lifecycle.abort(), { once: true });
}
