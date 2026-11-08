// Foundations page ("Les bases", #basics): the lessons, grouped, as data; the index page, the lesson page with its
// previous/next links, and the iframe bridge (theme and height). Neighbours and numbers are derived from the data.
// Foundation lessons are deliberately distinct from official curriculum chapters. Lesson files: resources/basics/<id>[.en].html.
const L = (id, title, description, does, frameTitle, extra = {}) => ({ id, title, description, does, frameTitle, ...extra });
export const BASICS_GROUPS = [
  { id: "numbers", title: ["Numération et calcul", "Numbers and calculation"],
    description: ["Des jetons aux quatre opérations : comment s’écrit un nombre, puis comment on additionne, soustrait, multiplie et partage.", "From counters to the four operations: how a number is written, then how we add, subtract, multiply and share."],
    lessons: [
      L("place-value", ["Numération et regroupements", "Place value and grouping"],
        ["Construire les nombres avec des jetons, échanger les unités contre des dizaines et découvrir les bases.", "Build numbers with counters, group place values, and explore different bases."],
        ["placer des jetons, échanger dix contre un et changer de base", "place counters, trade ten for one and change base"],
        ["Activité interactive sur la numération", "Interactive place-value activity"]),
      L("addition", ["Addition et retenues", "Addition and carrying"],
        ["Additionner colonne par colonne, puis comprendre la retenue comme un regroupement, même dans d’autres bases.", "Add column by column and see how regrouping creates a carry in different bases."],
        ["additionner colonne par colonne et suivre chaque retenue", "add column by column and follow every carry"],
        ["Activité interactive sur l’addition et les retenues", "Interactive addition and carrying activity"]),
      L("subtraction", ["Soustraction et emprunts", "Subtraction and borrowing"],
        ["Retirer des jetons colonne par colonne et comprendre les emprunts comme des dégroupements, même dans d’autres bases.", "Subtract counters column by column and understand borrowing as ungrouping in different bases."],
        ["retirer colonne par colonne et dégrouper pour emprunter", "subtract column by column and ungroup to borrow"],
        ["Activité interactive sur la soustraction et les emprunts", "Interactive subtraction and borrowing activity"]),
      L("multiplication", ["Multiplication par regroupements", "Multiplication as grouping"],
        ["Construire les produits avec des jetons, puis comprendre les produits partiels et les retenues.", "Use counters to understand partial products, place value, and carrying."],
        ["construire des produits partiels et suivre les retenues", "build partial products and follow the carries"],
        ["Activité interactive sur la multiplication", "Interactive multiplication activity"]),
      L("division", ["Division par partage", "Division as sharing"],
        ["Partager les jetons équitablement, échanger les restes et découvrir le quotient et le reste.", "Share counters equally, trade leftovers, and discover the quotient and remainder."],
        ["partager des jetons, échanger les restes et lire le quotient", "share counters, trade the leftovers and read the quotient"],
        ["Activité interactive sur le partage et la division", "Interactive division and sharing activity"]),
    ] },
  { id: "fractions", title: ["Fractions", "Fractions"],
    description: ["Quand le partage ne tombe pas juste : des parts d’un tout, à construire, comparer et calculer.", "When sharing does not come out even: parts of a whole to build, compare and calculate with."],
    lessons: [
      L("fractions", ["Le laboratoire des fractions", "The fractions lab"],
        ["Construire, comparer et calculer avec des fractions : barres, droite graduée, aires et six défis guidés.", "Build, compare and calculate with fractions using bars, a number line, areas and six guided challenges."],
        ["modifier des barres, une droite graduée et des aires, puis relever six défis", "change bars, a number line and areas, then take on six challenges"],
        ["Laboratoire interactif des fractions", "Interactive fractions lab"]),
    ] },
  { id: "logic", title: ["Ensembles et logique", "Sets and logic"],
    description: ["Le langage des démonstrations : des ensembles, puis les propositions, l’implication, les quantificateurs et les types de raisonnement.", "The language of proofs: sets, then propositions, implication, quantifiers and types of reasoning."],
    lessons: [
      L("sets", ["Ensembles", "Sets and operations"],
        ["Manipuler des ensembles avec des diagrammes de Venn, découvrir réunion, intersection, différence et complémentaire, puis s’exercer.", "Explore sets with Venn diagrams: union, intersection, difference and complement, then practise."],
        ["modifier des ensembles, choisir une opération, colorier un diagramme à trois ensembles", "edit sets, choose an operation, shade a three-set diagram"],
        ["Activité interactive sur les ensembles et leurs opérations", "Interactive sets and operations activity"]),
      L("logic-propositions", ["Propositions et connecteurs", "Propositions and connectives"],
        ["Vrai ou faux, non, et, ou : tables de vérité, lois de De Morgan et lien avec les opérations sur les ensembles.", "True or false, not, and, or: truth tables, De Morgan’s laws and the link with set operations."],
        ["basculer P et Q, lire des tables de vérité, colorier un diagramme de Venn", "flip P and Q, read truth tables, shade a Venn diagram"],
        ["Activité interactive sur les propositions et les connecteurs logiques", "Interactive propositions and logical connectives activity"],
        { discovery: { topics: ["foundations/reasoning", "foundations/sets"], concepts: ["logic", "propositions", "truth-tables"] }, links: ["#basics/sets"] }),
      L("logic-implication", ["Implication et équivalence", "Implication and equivalence"],
        ["Si P alors Q : table de vérité, contre-exemples, réciproque, contraposée et équivalence.", "If P then Q: truth table, counterexamples, converse, contrapositive and equivalence."],
        ["tester une promesse puis des implications sur les entiers de 1 à 20, écrire réciproque et contraposée", "test a promise then implications on the integers 1 to 20, write the converse and contrapositive"],
        ["Activité interactive sur l’implication, la réciproque et la contraposée", "Interactive implication, converse and contrapositive activity"],
        { discovery: { topics: ["foundations/reasoning"], concepts: ["logic", "implication", "contrapositive"] } }),
      L("logic-quantifiers", ["Quantificateurs : ∀ et ∃", "Quantifiers: ∀ and ∃"],
        ["Pour tout, il existe : les tester sur un univers que l’on modifie, les nier, et chercher des contre-exemples.", "For all, there exists: test them on a universe you edit, negate them and hunt for counterexamples."],
        ["modifier un univers, cocher une relation à deux variables, construire une négation, jouer au contre-exemple", "edit a universe, tick a two-variable relation, build a negation, play the counterexample game"],
        ["Activité interactive sur les quantificateurs et leur négation", "Interactive quantifiers and negation activity"],
        { discovery: { topics: ["foundations/reasoning"], concepts: ["logic", "quantifiers", "counterexample"] } }),
      L("logic-reasoning", ["Types de raisonnement", "Types of reasoning"],
        ["Démonstration directe, contraposée, contre-exemple, disjonction de cas, absurde et récurrence, sur de petits exemples guidés.", "Direct proof, contrapositive, counterexample, proof by cases, contradiction and induction, on small guided examples."],
        ["reconstituer des démonstrations dans l’ordre, faire tomber des dominos, choisir la bonne méthode", "rebuild proofs in order, knock down dominoes, choose the right method"],
        ["Activité interactive sur les types de raisonnement", "Interactive types of reasoning activity"],
        { discovery: { topics: ["foundations/reasoning"], concepts: ["logic", "proof", "induction", "contradiction"] } }),
    ] },
];
const flat = BASICS_GROUPS.flatMap(g => g.lessons.map(l => ({ ...l, group: g.id })));
// Flat list in reading order; number, previous and next come from that order.
export const basicsLessons = flat.map((l, i) => ({ ...l, number: String(i + 1).padStart(2, "0"), previous: flat[i - 1]?.id || null, next: flat[i + 1]?.id || null }));
export const basicsLesson = id => basicsLessons.find(l => l.id === id) || null;
export const basicsGroupOf = id => BASICS_GROUPS.find(g => g.id === basicsLesson(id)?.group) || null;
export const isBasicsRoute = id => !id || !!basicsLesson(id);
// Lessons placed in the topic browser (those that name topics).
export const discoveryLessons = () => basicsLessons.filter(l => l.discovery).map(l => ({ id: l.id, title: l.title, summary: l.description, ...l.discovery, links: l.links || [] }));

export function basicsPage(id, { t, pair, lang, assetHref }) {
  if (!id) {
    const groups = BASICS_GROUPS.map(g => {
      const rows = g.lessons.map(l => basicsLesson(l.id));
      return `<section class="foundation-group" aria-labelledby="fg-${g.id}"><h2 id="fg-${g.id}">${t(g.title)} <span class="foundation-count">${rows.length} ${pair(rows.length > 1 ? "leçons" : "leçon", rows.length > 1 ? "lessons" : "lesson")}</span></h2><p class="foundation-group-desc">${t(g.description)}</p><ol class="foundation-list">${rows.map(l => `<li><a href="#basics/${l.id}"><span class="chapter-row-number">${l.number}</span><span><strong>${t(l.title)}</strong><small>${t(l.description)}</small><small class="foundation-does"><b>${pair("Tu vas", "You will")}</b> ${t(l.does)}.</small></span><span class="chapter-row-arrow" aria-hidden="true">→</span></a></li>`).join("")}</ol></section>`;
    }).join("");
    return `<main id="main" class="page foundations-page" tabindex="-1"><h1>${pair("Les bases des mathématiques", "Mathematical foundations")}</h1><p class="page-intro">${pair("Choisis une idée à comprendre en manipulant. Les leçons sont rangées par thème et se suivent dans l’ordre.", "Choose an idea to understand through exploration. Lessons are grouped by theme and follow each other in order.")}</p>${groups}</main>`;
  }
  const lesson = basicsLesson(id);
  if (!lesson) return "";
  const group = basicsGroupOf(id), prev = basicsLesson(lesson.previous), next = basicsLesson(lesson.next);
  const steps = `<nav class="foundation-steps" aria-label="${pair("Leçons voisines", "Neighbouring lessons")}">${prev ? `<a href="#basics/${prev.id}">${pair("Leçon précédente : ", "Previous lesson: ")}${t(prev.title)}</a>` : ""}${next ? `<a href="#basics/${next.id}">${pair("Leçon suivante : ", "Next lesson: ")}${t(next.title)}</a>` : ""}</nav>`;
  const src = assetHref("./resources/basics/" + lesson.id + (lang === "en" ? ".en" : "") + ".html");
  return `<main id="main" class="page foundations-lesson" tabindex="-1"><nav class="foundation-crumbs" aria-label="${pair("Fil d’Ariane", "Breadcrumb")}"><a class="backlink" href="#basics">${pair("Toutes les bases", "All foundations")}</a><span aria-hidden="true"> / </span><span>${t(group.title)}</span></nav>${steps}<iframe id="basics-frame" lang="${lang}" title="${t(lesson.frameTitle)}" src="${src}" style="width:100%;display:block;border:1px solid var(--line);background:var(--surface);min-height:560px" scrolling="no" allow="fullscreen"></iframe>${steps}</main>`;
}
// Theme and height of the embedded lesson follow the host page.
export function bindBasics({ $, currentTheme }) {
  const frame = $("#basics-frame"); if (!frame) return () => {};
  let alive = true;
  const sync = () => { try { const d = frame.contentDocument; if (!d) return; d.documentElement.dataset.theme = currentTheme() === "nuit" ? "dark" : "light"; const h = d.documentElement.scrollHeight; if (h > 0 && Math.abs(h - frame.getBoundingClientRect().height) > 3) frame.style.height = h + "px"; } catch {} };
  const message = e => { if (e.origin !== location.origin || e.source !== frame.contentWindow || e.data?.type !== "mx-basics-size") return; if (alive && Number.isFinite(e.data.height) && e.data.height > 0 && e.data.height < 20000) frame.style.height = e.data.height + "px"; };
  const load = () => sync(); frame.addEventListener("load", load); window.addEventListener("message", message);
  const obs = typeof MutationObserver === "undefined" ? null : new MutationObserver(sync); obs?.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  return () => { alive = false; window.removeEventListener("message", message); frame.removeEventListener("load", load); obs?.disconnect(); };
}
