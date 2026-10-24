import { P } from "../common/helpers.js";
import { ROOM_NAMES, eulerCriteria } from "./maths.js";
import { edgesFor } from "./index.js";
export const diagram = {
  size: [520, 300],
  steps: (q) => [P("Chaque porte est une arête ; chaque pièce et l’extérieur sont des sommets.", "Each door is an edge; each room and the outside are vertices."), P("Une arrivée et un départ utilisent deux portes. Seuls le début et la fin échappent à cet appariement.", "Arrival and departure use two doors. Only start and finish escape this pairing."), P(`${eulerCriteria(edgesFor(q)).odd.length} degrés sont impairs. Vérifie aussi la connexité des lieux portant des portes.`, `${eulerCriteria(edgesFor(q)).odd.length} degrees are odd. Also check connectivity of places with doors.`)],
  draw(c, step, p, q) { const d = eulerCriteria(edgesFor(q)).degrees; d.forEach((degree, i) => { const x = 45 + i * 84; c.circ(x, 110, 24, { fill: step > 0 && degree % 2 ? "var(--accent-soft)" : "var(--surface)", stroke: "var(--ink)", "stroke-width": 2 }); c.text(x, 117, ROOM_NAMES[i], { "text-anchor": "middle", fill: "var(--ink)", "font-size": 22 }); if (step > 0) { const count = Math.ceil(degree * Math.min(1, p * 2)); for (let j = 0; j < count; j++) c.line(x - 18 + j * 8, 160, x - 18 + j * 8, 184, { stroke: "var(--accent)", "stroke-width": 4 }); c.text(x, 215, degree, { "text-anchor": "middle", fill: "var(--ink)", "font-size": 18 }); } }); },
};
