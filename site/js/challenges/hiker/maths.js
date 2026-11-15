// Pure mathematics of the hiker challenge (no DOM), checked by a minute-by-minute search in tests/hiker.test.mjs.
// Day 1: he leaves the foot at 08:00 and climbs at a steady pace for T1 hours. Day 2: he leaves the summit at 08:00
// and comes down the same trail at a steady pace in T2 hours. Positions are fractions of the trail (0 foot, 1 summit).

// Pairs (T1, T2) in hours for which the meeting falls on a whole minute.
export const PAIRS = ["12,6", "12,4", "12,3", "12,12", "10,10", "10,6", "10,5", "9,6", "8,8", "6,3"];
export const pairOf = (id) => String(id).split(",").map(Number);

export const up = (h, T1) => Math.min(1, Math.max(0, h / T1));        // h: hours after 08:00
export const down = (h, T2) => Math.max(0, Math.min(1, 1 - h / T2));

// The moment when the two days put him at the same place: h/T1 = 1 - h/T2, so h = T1 T2 / (T1 + T2).
export const meetHours = (T1, T2) => (T1 * T2) / (T1 + T2);
export const meetMinutes = (T1, T2) => (60 * T1 * T2) / (T1 + T2);

// "12 h 00" style clock for a number of minutes after 08:00 (French and English use the same 24-hour digits).
export const clock = (min, lang = "fr") => { const m = Math.round(480 + min), hh = Math.floor(m / 60) % 24, mm = String(m % 60).padStart(2, "0"); return lang === "fr" ? `${hh} h ${mm}` : `${String(hh).padStart(2, "0")}:${mm}`; };
