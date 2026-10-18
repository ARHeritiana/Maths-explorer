// Pure mathematics of the queens challenge (no DOM), checked by an independent method in tests/.

/* ---------------------------------------------------------------- queens */
// Squares that are neither occupied nor attacked (a queen's line of sight stops at the first piece).
export function unattacked(n, queens) {
  const occ = new Set(queens), out = [];
  for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) {
    if (occ.has(r * n + c)) continue;
    let hit = false;
    for (const q of queens) {
      const qr = Math.floor(q / n), qc = q % n, dr = r - qr, dc = c - qc;
      if (dr !== 0 && dc !== 0 && Math.abs(dr) !== Math.abs(dc)) continue;
      const sr = Math.sign(dr), sc = Math.sign(dc);
      let rr = qr + sr, cc = qc + sc, clear = true;
      while (rr !== r || cc !== c) { if (occ.has(rr * n + cc)) { clear = false; break; } rr += sr; cc += sc; }
      if (clear) { hit = true; break; }
    }
    if (!hit) out.push(r * n + c);
  }
  return out;
}

// Largest number of unattacked squares with k queens on an n × n board, with one placement reaching it (squares
// numbered row by row from 0). Found by exhaustive enumeration of every placement (see the tests).
export const QUEENS = {
  "4,1": [6, [0]], "4,2": [3, [0, 2]], "4,3": [2, [0, 1, 8]], "4,4": [1, [0, 1, 3, 5]],
  "5,1": [12, [0]], "5,2": [7, [0, 2]], "5,3": [5, [0, 1, 15]], "5,4": [4, [0, 2, 10, 12]], "5,5": [3, [1, 2, 6, 9, 14]],
  "6,1": [20, [0]], "6,2": [13, [0, 2]], "6,3": [9, [0, 1, 7]], "6,4": [8, [0, 2, 12, 14]], "6,5": [6, [0, 2, 3, 12, 14]], "6,6": [5, [0, 1, 7, 8, 24, 25]],
};

export const queensK = (n, k) => Math.min(Math.max(1, k), n);

export const queensBest = (n, k) => QUEENS[`${n},${queensK(n, k)}`][0];
