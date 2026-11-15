import { choice, P } from "../common/helpers.js";
import { svg } from "../common/icon.js";
import { FIVE_ROOM_EDGES, ROOM_NAMES, eulerCriteria } from "./maths.js";
export { activity } from "./activity.js";
export { diagram } from "./solution.js";
export const card = { id: "rooms", type: "play", title: P("Cinq pièces et des portes", "Five rooms and their doors"), topic: P("Graphes", "Graph theory"), difficulty: 2, minutes: 15, extension: P("Une même pièce peut-elle être visitée plusieurs fois ? Compare un parcours des portes à un parcours des pièces.", "May a room be visited several times? Compare a tour of doors with a tour of rooms.") };
export const edgesFor = (q) => q.layout === "closed-door" ? FIVE_ROOM_EDGES.slice(1) : FIVE_ROOM_EDGES;
export const variant = {
  params: [choice("layout", "Plan", "Plan", [["original", "16 portes", "16 doors"], ["closed-door", "Une porte fermée", "One door closed"]], "original")],
  open: true,   // open challenge: "can you pass every door once?", with a reason; the site checks nothing
  answer: (q) => q.layout === "closed-door" ? 0 : 1,   // doors to close: a fact used by the tests, not asked
  prompt: (q) => P(`Cinq pièces A à E et l’extérieur O sont reliés par ${edgesFor(q).length} portes. Peut-on passer exactement une fois par chaque porte, en commençant et en terminant où l’on veut ? Essaie, puis justifie ta réponse pour ce plan, et pour un plan que tu inventes.`, `Five rooms A to E and the outside O are joined by ${edgesFor(q).length} doors. Can you pass through every door exactly once, starting and finishing wherever you like? Try it, then justify your answer for this plan, and for a plan of your own.`),
  solution: (q) => {
    const c = eulerCriteria(edgesFor(q)), names = (vs) => vs.map((v) => ROOM_NAMES[v]).join(", "), list = c.degrees.map((d, v) => `${ROOM_NAMES[v]} ${d}`).join(", ");
    const after = q.layout === "closed-door" ? c : eulerCriteria(edgesFor(q).slice(1));
    const fr = [`Comptons les portes de chaque lieu (O est l’extérieur) : ${list}. ${c.odd.length} lieux en ont un nombre impair : ${names(c.odd)}.`,
      "Chaque fois que la promenade traverse un lieu, elle y entre par une porte et en sort par une autre : les portes de ce lieu s’utilisent deux par deux. Seuls le lieu de départ et le lieu d’arrivée peuvent garder une porte seule.",
      "Une promenade qui passe une fois par chaque porte exige donc au plus deux lieux avec un nombre impair de portes.",
      q.layout === "closed-door" ? `Ici il n’y en a que deux : la promenade est possible en partant de l’un et en finissant à l’autre (l’animation en montre une).`
        : `Ici il y en a ${c.odd.length} : c’est impossible. Pour que cela devienne possible, il suffit de fermer une porte : fermer une porte enlève une porte à deux lieux seulement ; fermer la porte entre A et B, deux lieux impairs, n’en laisse que deux (${names(after.odd)}), et la promenade devient possible.`,
      "Une même pièce peut être traversée plusieurs fois : c’est chaque porte qui doit être franchie une seule fois."];
    const en = [`Count the doors of each place (O is the outside): ${list}. ${c.odd.length} places have an odd number: ${names(c.odd)}.`,
      "Each time the walk passes through a place, it comes in by one door and leaves by another: the doors of that place are used two by two. Only the starting place and the finishing place can keep a door on its own.",
      "So a walk through every door exactly once needs at most two places with an odd number of doors.",
      q.layout === "closed-door" ? "Here there are only two: the walk is possible, starting at one and finishing at the other (the animation shows one)."
        : `Here there are ${c.odd.length}: it is impossible. Closing a single door is enough to make it possible: closing a door takes one door away from two places only; closing the door between A and B, two odd places, leaves just two (${names(after.odd)}), and the walk becomes possible.`,
      "A room may be crossed several times: it is each door that must be passed exactly once."];
    return P(fr.join(" "), en.join(" "));
  },
};
export const icon = svg('<path d="M8 12h48v40H8zM8 32h48M32 12v20M24 32v20M40 32v20"/><path d="M12 22h8M36 22h8M12 42h6M28 42h6M44 42h6" stroke-dasharray="2 3"/>');
