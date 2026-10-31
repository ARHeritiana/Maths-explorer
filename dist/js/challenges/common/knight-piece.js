// The chess knight silhouette (a horse's head on a base) shared by the knight's tour activity, its solution and its emblem.
// Drawn in a 64 x 64 box facing left; `knightPiece` returns SVG markup of the piece scaled into a size x size square.
export const KNIGHT_BODY = "M18 52C17 43 21 37 27 32C24 32 20 34 16 38C13 40 9 39 9 36C9 32 14 27 18 23L21 12L27 18C31 15 36 14 40 15C49 18 54 30 52 52Z";
export const KNIGHT_BASE = "M15 52h40v6H15z";
export const knightInner = '<path d="' + KNIGHT_BODY + '"/><path d="' + KNIGHT_BASE + '"/><circle cx="22" cy="27" r="1.8" fill="var(--ink)" stroke="none"/><path d="M13 36.5l3-1" fill="none"/>';
export const knightPiece = (x, y, size, fill = "var(--accent)", extra = "") => `<g transform="translate(${x} ${y}) scale(${size / 64})" fill="${fill}" stroke="var(--ink)" stroke-width="${Math.max(1.6, 64 / size * 1.4)}" stroke-linejoin="round" stroke-linecap="round" ${extra}>${knightInner}</g>`;
