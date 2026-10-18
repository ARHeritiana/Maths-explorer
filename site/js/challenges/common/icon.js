// Building blocks of the challenge emblems (challenge-icons): an SVG frame drawn in currentColor, a soft fill and a dot.

export const svg = (body) => `<svg class="ci" viewBox="0 0 64 64" width="64" height="64" aria-hidden="true" focusable="false"><g fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">${body}</g></svg>`;

export const soft = 'fill="currentColor" fill-opacity=".22"';

export const dot = (x, y, r = 3.4, cls = "") => `<circle class="${cls}" cx="${x}" cy="${y}" r="${r}" fill="currentColor" stroke="none"/>`;
