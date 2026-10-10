import { C, view, axes, curve, dot, text, slider, choice, snap, clamp, fmt } from "./widgets.js";

const set = (o, html) => { o.readout.innerHTML = html; };
const lines = (...a) => a.filter(Boolean).join("<br>");

export const W2 = {
  // Two draggable points define a line: slope, direction vector, equations (Seconde droites, Premiere geometrie).
  line(o) {
    let A = [-2, 1], B = [3, 3]; const v = () => view(o, -6, 6, -5, 5);
    return {
      handles() { const V = v(); return [A, B].map(p => ({ x: V.X(p[0]), y: V.Y(p[1]), cur: "grab", move(X, Y) { p[0] = clamp(snap(V.iX(X)), -6, 6); p[1] = clamp(snap(V.iY(Y)), -5, 5); } })); },
      draw(g) {
        const V = v(); axes(g, V, { lang: o.L });
        const dx = B[0] - A[0], dy = B[1] - A[1];
        if (dx === 0 && dy === 0) { dot(o, V.X(A[0]), V.Y(A[1]), C.acc, "A=B"); set(o, o.pair("A et B sont confondus : pas de droite.", "A and B coincide: no line.")); return; }
        g.save(); g.strokeStyle = C.acc; g.lineWidth = 3; g.beginPath();
        const t = 40; g.moveTo(V.X(A[0] - t * dx), V.Y(A[1] - t * dy)); g.lineTo(V.X(A[0] + t * dx), V.Y(A[1] + t * dy)); g.stroke(); g.restore();
        g.save(); g.strokeStyle = C.warn; g.lineWidth = 2.5; g.beginPath(); g.moveTo(V.X(A[0]), V.Y(A[1])); g.lineTo(V.X(B[0]), V.Y(B[1])); g.stroke(); g.restore();
        dot(o, V.X(A[0]), V.Y(A[1]), C.acc, "A"); dot(o, V.X(B[0]), V.Y(B[1]), C.acc, "B");
        const a = dy, b = -dx, c = -(a * A[0] + b * A[1]), N = n => o.num(n);
        const red = dx === 0 ? `x = ${N(A[0])}` : `y = ${N(dy / dx)}x ${((A[1] - dy / dx * A[0]) < 0 ? "− " : "+ ") + N(Math.abs(A[1] - dy / dx * A[0]))}`;
        set(o, lines(`AB = (${N(dx)} ; ${N(dy)})`, o.pair(`Équation cartésienne : ${N(a)}x ${b < 0 ? "−" : "+"} ${N(Math.abs(b))}y ${c < 0 ? "−" : "+"} ${N(Math.abs(c))} = 0`, `Cartesian equation: ${N(a)}x ${b < 0 ? "−" : "+"} ${N(Math.abs(b))}y ${c < 0 ? "−" : "+"} ${N(Math.abs(c))} = 0`), dx === 0 ? o.pair("Droite verticale.", "Vertical line.") : o.pair(`Équation réduite : ${red}`, `Slope-intercept form: ${red}`), dx === 0 ? "" : o.pair(`Pente m = ${N(dy / dx)}`, `Slope m = ${N(dy / dx)}`)));
      },
    };
  },

  // Quadratic in canonical form: draggable vertex and a point fixing the coefficient a.
  quad(o) {
    let al = 1, be = -2, a = 1; const v = () => view(o, -6, 6, -6, 8);
    return {
      handles() { const V = v(); return [{ x: V.X(al), y: V.Y(be), cur: "move", move(X, Y) { al = clamp(snap(V.iX(X)), -5, 5); be = clamp(snap(V.iY(Y)), -5, 7); } }, { x: V.X(al + 1), y: V.Y(a + be), cur: "ns-resize", move(X, Y) { const t = snap(V.iY(Y) - be, .25); a = t === 0 ? a : clamp(t, -4, 4); } }]; },
      draw(g) {
        const V = v(); axes(g, V, { lang: o.L }); curve(g, V, x => a * (x - al) ** 2 + be, -6, 6);
        dot(o, V.X(al), V.Y(be), C.acc, "S"); dot(o, V.X(al + 1), V.Y(a + be), C.warn);
        const N = o.num, b = -2 * a * al, c = a * al * al + be, d = b * b - 4 * a * c;
        const roots = d < -1e-9 ? o.pair("aucune racine réelle", "no real root") : d < 1e-9 ? `x = ${N(al)}` : `x₁ = ${N((-b - Math.sqrt(d)) / (2 * a))}, x₂ = ${N((-b + Math.sqrt(d)) / (2 * a))}`;
        set(o, lines(o.pair(`Forme canonique : f(x) = ${N(a)}(x − ${N(al)})² + ${N(be)}`, `Canonical form: f(x) = ${N(a)}(x − ${N(al)})² + ${N(be)}`), `f(x) = ${N(a)}x² + ${N(b)}x + ${N(c)}`, `Δ = ${N(d)}`, o.pair("Racines : ", "Roots: ") + roots, a > 0 ? o.pair("Minimum en α.", "Minimum at α.") : o.pair("Maximum en α.", "Maximum at α.")));
      },
    };
  },

  // Exponential C*b^x, common logarithm and reciprocal function share one canvas with a mode switch.
  fn(o) {
    let mode = o.spec.mode || "exp", C0 = 1, b = 1.5, k = 2, tx = 1, tx2 = 2; const v = () => (mode === "exp" ? view(o, -4, 4, -1, 8) : mode === "log" ? view(o, -1, 12, -3, 3) : view(o, -6, 6, -6, 6));
    choice(o, [["exp", "Exponentielle", "Exponential"], ["log", "Logarithme décimal", "Common logarithm"], ["inv", "Inverse", "Reciprocal"]].filter(m => !o.spec.modes || o.spec.modes.includes(m[0])), mode, m => { mode = m; o.redraw(); });
    return {
      handles() {
        const V = v();
        if (mode === "exp") return [{ x: V.X(0), y: V.Y(C0), cur: "ns-resize", move(X, Y) { C0 = clamp(snap(V.iY(Y), .25), .25, 6); } }, { x: V.X(1), y: V.Y(C0 * b), cur: "ns-resize", move(X, Y) { b = clamp(snap(V.iY(Y) / C0, .05), .1, 3); } }];
        if (mode === "log") return [{ x: V.X(10 ** tx), y: V.Y(tx), cur: "ew-resize", move(X) { tx = clamp(Math.log10(Math.max(.1, V.iX(X))), -1, 1.08); } }];
        return [{ x: V.X(1), y: V.Y(k), cur: "ns-resize", move(X, Y) { k = clamp(snap(V.iY(Y), .5), -5, 5) || .5; } }, { x: V.X(tx2), y: V.Y(k / tx2), cur: "ew-resize", move(X) { tx2 = clamp(snap(V.iX(X), .25), -5.5, 5.5) || .25; } }];
      },
      draw(g) {
        const V = v(), N = o.num; axes(g, V, { lang: o.L, sx: mode === "log" ? 2 : 1 });
        if (mode === "exp") {
          curve(g, V, x => C0 * b ** x, -4, 4); dot(o, V.X(0), V.Y(C0), C.acc, "(0 ; C)"); dot(o, V.X(1), V.Y(C0 * b), C.warn, "(1 ; Cb)");
          set(o, lines(`f(x) = ${N(C0)} × ${N(b)}ˣ`, o.pair(`Raison b = ${N(b)} : ${b > 1 ? "croissante" : b < 1 ? "décroissante" : "constante"}`, `Base b = ${N(b)}: ${b > 1 ? "increasing" : b < 1 ? "decreasing" : "constant"}`), o.pair(`Taux d'évolution par unité : ${N((b - 1) * 100)} %`, `Rate of change per unit: ${N((b - 1) * 100)} %`)));
        } else if (mode === "log") {
          curve(g, V, x => Math.log10(x), .001, 12); const x = 10 ** tx;
          g.save(); g.strokeStyle = C.warn; g.setLineDash([6, 5]); g.beginPath(); g.moveTo(V.X(x), V.Y(0)); g.lineTo(V.X(x), V.Y(tx)); g.lineTo(V.X(0), V.Y(tx)); g.stroke(); g.restore();
          dot(o, V.X(x), V.Y(tx), C.acc, "M");
          set(o, lines(`x = ${N(x)}`, `log(x) = ${N(tx)}`, `10^${N(tx)} = ${N(x)}`, o.pair("log(10) = 1, log(1) = 0, log croît lentement.", "log(10) = 1, log(1) = 0, log grows slowly.")));
        } else {
          curve(g, V, x => (x < -.12 || x > .12 ? k / x : NaN), -6, -.12); curve(g, V, x => k / x, .12, 6);
          dot(o, V.X(1), V.Y(k), C.warn, "k"); const y = k / tx2; dot(o, V.X(tx2), V.Y(y), C.acc, "M");
          set(o, lines(`f(x) = ${N(k)} / x`, `M(${N(tx2)} ; ${N(y)}) : x × y = ${N(tx2 * y)}`, k > 0 ? o.pair("Décroissante sur ]−∞ ; 0[ et sur ]0 ; +∞[.", "Decreasing on ]−∞ ; 0[ and on ]0 ; +∞[.") : o.pair("Croissante sur chaque intervalle.", "Increasing on each interval."), o.pair("Asymptotes : x = 0 et y = 0.", "Asymptotes: x = 0 and y = 0.")));
        }
      },
    };
  },

  // Arithmetic or geometric sequence: draggable first two terms.
  seq(o) {
    let geo = o.spec.geo ?? false, u0 = 2, u1 = 3; const N = 12; const v = () => view(o, -.5, N + .5, geo ? -1 : -4, geo ? 30 : 16);
    choice(o, [["a", "Arithmétique", "Arithmetic"], ["g", "Géométrique", "Geometric"]], geo ? "g" : "a", m => { geo = m === "g"; u0 = 2; u1 = geo ? 3 : 3; o.redraw(); });
    return {
      handles() { const V = v(); return [{ x: V.X(0), y: V.Y(u0), cur: "ns-resize", move(X, Y) { u0 = clamp(snap(V.iY(Y), .5), geo ? .5 : -3, geo ? 8 : 14); } }, { x: V.X(1), y: V.Y(u1), cur: "ns-resize", move(X, Y) { u1 = clamp(snap(V.iY(Y), .5), geo ? .5 : -3, geo ? 20 : 15); } }]; },
      draw(g) {
        const V = v(), q = u1 / u0, r = u1 - u0, f = n => geo ? u0 * q ** n : u0 + r * n; axes(g, V, { lang: o.L });
        for (let n = 0; n <= N; n++) { const y = f(n); if (y > V.y1 + 2 || y < V.y0 - 2) continue; dot(o, V.X(n), V.Y(y), n < 2 ? C.acc : C.muted, n === 0 ? "u₀" : n === 1 ? "u₁" : "", "grab", n < 2); }
        const Nn = o.num;
        set(o, geo ? lines(o.pair(`Raison q = u₁/u₀ = ${Nn(q)}`, `Common ratio q = u₁/u₀ = ${Nn(q)}`), `uₙ = ${Nn(u0)} × ${Nn(q)}ⁿ`, `u₁₀ = ${Nn(f(10))}`) : lines(o.pair(`Raison r = u₁ − u₀ = ${Nn(r)}`, `Common difference r = u₁ − u₀ = ${Nn(r)}`), `uₙ = ${Nn(u0)} ${r < 0 ? "−" : "+"} ${Nn(Math.abs(r))}n`, `u₁₀ = ${Nn(f(10))}`, o.pair("Les points sont alignés.", "The points are collinear.")));
      },
    };
  },

  // Vectors from three draggable points: components, norms, dot product, angle, determinant.
  vec(o) {
    let A = [-3, -1], B = [2, 1], Cc = [0, 4]; const v = () => view(o, -6, 6, -4, 6);
    return {
      handles() { const V = v(); return [A, B, Cc].map(p => ({ x: V.X(p[0]), y: V.Y(p[1]), cur: "grab", move(X, Y) { p[0] = clamp(snap(V.iX(X)), -6, 6); p[1] = clamp(snap(V.iY(Y)), -4, 6); } })); },
      draw(g) {
        const V = v(); axes(g, V, { lang: o.L });
        const arrow = (P, Q, col) => { g.save(); g.strokeStyle = g.fillStyle = col; g.lineWidth = 3; const a = [V.X(P[0]), V.Y(P[1])], b = [V.X(Q[0]), V.Y(Q[1])]; g.beginPath(); g.moveTo(...a); g.lineTo(...b); g.stroke(); const t = Math.atan2(b[1] - a[1], b[0] - a[0]); g.beginPath(); g.moveTo(...b); g.lineTo(b[0] - 14 * Math.cos(t - .4), b[1] - 14 * Math.sin(t - .4)); g.lineTo(b[0] - 14 * Math.cos(t + .4), b[1] - 14 * Math.sin(t + .4)); g.fill(); g.restore(); };
        arrow(A, B, C.acc); arrow(A, Cc, C.warn);
        dot(o, V.X(A[0]), V.Y(A[1]), C.ink, "A"); dot(o, V.X(B[0]), V.Y(B[1]), C.acc, "B"); dot(o, V.X(Cc[0]), V.Y(Cc[1]), C.warn, "C");
        const u = [B[0] - A[0], B[1] - A[1]], w = [Cc[0] - A[0], Cc[1] - A[1]], N = o.num;
        const dp = u[0] * w[0] + u[1] * w[1], det = u[0] * w[1] - u[1] * w[0], nu = Math.hypot(...u), nw = Math.hypot(...w);
        const ang = nu && nw ? Math.acos(clamp(dp / (nu * nw), -1, 1)) * 180 / Math.PI : NaN;
        const nd = o.spec.noDot;
        set(o, lines(`AB = (${N(u[0])} ; ${N(u[1])}), AC = (${N(w[0])} ; ${N(w[1])})`, nd ? "" : o.pair(`AB·AC = ${N(dp)} ${dp === 0 ? "→ orthogonaux" : ""}`, `AB·AC = ${N(dp)} ${dp === 0 ? "→ orthogonal" : ""}`), o.pair(`déterminant = ${N(det)} ${det === 0 ? "→ colinéaires" : ""}`, `determinant = ${N(det)} ${det === 0 ? "→ collinear" : ""}`), `‖AB‖ = ${N(nu)}, ‖AC‖ = ${N(nw)}`, nd ? "" : o.pair(`angle BAC = ${Number.isNaN(ang) ? "—" : N(ang, 1) + "°"}`, `angle BAC = ${Number.isNaN(ang) ? "—" : N(ang, 1) + "°"}`)));
      },
    };
  },

  // Secant sliding to the tangent: two draggable points on y = f(x) = x^3/4 - x.
  tangent(o) {
    const f = x => x ** 3 / 4 - x, df = x => 3 * x * x / 4 - 1; let a = -1, h = 1.5; const v = () => view(o, -4, 4, -4, 4);
    return {
      handles() { const V = v(); return [{ x: V.X(a), y: V.Y(f(a)), cur: "ew-resize", move(X) { a = clamp(snap(V.iX(X), .1), -3, 3); } }, { x: V.X(a + h), y: V.Y(f(a + h)), cur: "ew-resize", move(X) { const t = snap(V.iX(X) - a, .1); h = t === 0 ? .1 : clamp(t, -3, 3); } }]; },
      draw(g) {
        const V = v(); axes(g, V, { lang: o.L }); curve(g, V, f, -4, 4);
        const m = (f(a + h) - f(a)) / h, line = (s, col, w) => { g.save(); g.strokeStyle = col; g.lineWidth = w; g.beginPath(); g.moveTo(V.X(-4), V.Y(f(a) + s * (-4 - a))); g.lineTo(V.X(4), V.Y(f(a) + s * (4 - a))); g.stroke(); g.restore(); };
        line(df(a), C.acc, 2.5); line(m, C.warn, 2.5); dot(o, V.X(a), V.Y(f(a)), C.acc, "M"); dot(o, V.X(a + h), V.Y(f(a + h)), C.warn, "N"); const N = o.num;
        set(o, lines(o.pair(`Taux d'accroissement (MN) = ${N(m)}`, `Rate of change (MN) = ${N(m)}`), o.pair(`f′(${N(a)}) = ${N(df(a))}`, `f′(${N(a)}) = ${N(df(a))}`), o.pair("Rapprochez N de M : la sécante tend vers la tangente.", "Move N towards M: the secant tends to the tangent."), `f(x) = x³/4 − x`));
      },
    };
  },

  // Unit circle: draggable angle gives cos, sin, tan, radians.
  circle(o) {
    let th = Math.PI / 3; const v = () => view(o, -1.6, 1.6, -1.35, 1.35, 20);
    return {
      handles() { const V = v(); return [{ x: V.X(Math.cos(th)), y: V.Y(Math.sin(th)), r: 28, cur: "grab", move(X, Y) { let t = Math.atan2(-(Y - V.Y(0)), X - V.X(0)); t = Math.round(t / (Math.PI / 12)) * (Math.PI / 12); th = (t + 2 * Math.PI) % (2 * Math.PI); } }]; },
      draw(g) {
        const V = v(); axes(g, V, { lang: o.L, sx: .5, sy: .5, noLabels: true }); const R = V.X(1) - V.X(0);
        g.save(); g.strokeStyle = C.muted; g.lineWidth = 2; g.beginPath(); g.arc(V.X(0), V.Y(0), R, 0, 7); g.stroke(); g.strokeStyle = C.acc; g.lineWidth = 4; g.beginPath(); g.arc(V.X(0), V.Y(0), R * .22, 0, -th, true); g.stroke();
        const x = Math.cos(th), y = Math.sin(th); g.strokeStyle = C.warn; g.lineWidth = 3; g.beginPath(); g.moveTo(V.X(0), V.Y(0)); g.lineTo(V.X(x), V.Y(y)); g.stroke();
        g.setLineDash([5, 5]); g.strokeStyle = C.blue; g.beginPath(); g.moveTo(V.X(x), V.Y(y)); g.lineTo(V.X(x), V.Y(0)); g.stroke(); g.strokeStyle = C.acc; g.beginPath(); g.moveTo(V.X(x), V.Y(y)); g.lineTo(V.X(0), V.Y(y)); g.stroke(); g.restore();
        dot(o, V.X(x), V.Y(y), C.warn, "M");
        const N = o.num, deg = th * 180 / Math.PI, k = Math.round(deg / 15), fr = (a, b) => { const g_ = (p, q) => q ? g_(q, p % q) : p, d = g_(a, b); a /= d; b /= d; return b === 1 ? (a === 1 ? "π" : `${a}π`) : `${a === 1 ? "" : a}π/${b}`; };
        const rad = k === 0 ? "0" : fr(k, 12);
        set(o, lines(o.pair(`Angle : ${N(deg, 0)}° = ${rad} rad`, `Angle: ${N(deg, 0)}° = ${rad} rad`), `cos = ${N(x)}  (x)`, `sin = ${N(y)}  (y)`, `cos² + sin² = ${N(x * x + y * y)}`, Math.abs(x) < 1e-9 ? "tan : ∞" : `tan = ${N(y / x)}`));
      },
    };
  },

  // Scatter plot with draggable points: least-squares line and correlation (STMG, Seconde stats).
  scatter(o) {
    const P = [[1, 2], [2, 3], [3, 3.5], [4, 5], [5, 5.5], [6, 7]]; const v = () => view(o, 0, 8, 0, 10);
    return {
      handles() { const V = v(); return P.map(p => ({ x: V.X(p[0]), y: V.Y(p[1]), cur: "move", move(X, Y) { p[0] = clamp(snap(V.iX(X), .25), .25, 7.75); p[1] = clamp(snap(V.iY(Y), .25), .25, 9.75); } })); },
      draw(g) {
        const V = v(); axes(g, V, { lang: o.L }); const n = P.length, mx = P.reduce((s, p) => s + p[0], 0) / n, my = P.reduce((s, p) => s + p[1], 0) / n;
        const sxx = P.reduce((s, p) => s + (p[0] - mx) ** 2, 0), sxy = P.reduce((s, p) => s + (p[0] - mx) * (p[1] - my), 0), syy = P.reduce((s, p) => s + (p[1] - my) ** 2, 0);
        const N = o.num; let txt;
        if (sxx > 1e-9) { const a = sxy / sxx, b = my - a * mx; curve(g, V, x => a * x + b, 0, 8, C.warn, 2.5); const r = syy > 1e-9 ? sxy / Math.sqrt(sxx * syy) : NaN; txt = lines(o.pair(`Droite de régression : y = ${N(a)}x ${b < 0 ? "−" : "+"} ${N(Math.abs(b))}`, `Regression line: y = ${N(a)}x ${b < 0 ? "−" : "+"} ${N(Math.abs(b))}`), o.pair(`Coefficient de corrélation r = ${N(r, 3)}`, `Correlation coefficient r = ${N(r, 3)}`), o.pair(`Point moyen G(${N(mx)} ; ${N(my)})`, `Mean point G(${N(mx)} ; ${N(my)})`)); }
        else txt = o.pair("Tous les x sont égaux : pas de droite de régression.", "All x are equal: no regression line.");
        P.forEach((p, i) => dot(o, V.X(p[0]), V.Y(p[1]), C.acc, "")); dot(o, V.X(mx), V.Y(my), C.ink, "G", "default", false); set(o, txt);
      },
    };
  },

  // Probability tree: draggable bars set P(A), P_A(B), P_notA(B).
  tree(o) {
    let pa = .6, pb1 = .7, pb2 = .2; const rows = () => [[60, "P(A)"], [200, "P_A(B)"], [340, "P_Ā(B)"]];
    const bx = 60, bw = o.W - 120;
    return {
      handles() { const bw_ = o.W - 120; return rows().map(([y], i) => ({ x: bx + [pa, pb1, pb2][i] * bw_, y: y + 18, cur: "ew-resize", move(X) { const val = clamp(snap((X - bx) / bw_, .05), 0, 1); if (i === 0) pa = val; else if (i === 1) pb1 = val; else pb2 = val; } })); },
      draw(g) {
        const bw_ = o.W - 120, N = o.num;
        rows().forEach(([y, l], i) => { const val = [pa, pb1, pb2][i]; text(g, l + " = " + N(val), bx, y - 8, C.ink, 20); g.fillStyle = C.grid; g.fillRect(bx, y, bw_, 36); g.fillStyle = C.acc; g.fillRect(bx, y, val * bw_, 36); dot(o, bx + val * bw_, y + 18, C.warn); });
        const p = [pa * pb1, pa * (1 - pb1), (1 - pa) * pb2, (1 - pa) * (1 - pb2)], y0 = 400;
        const lab4 = ["A∩B", "A∩B̄", "Ā∩B", "Ā∩B̄"]; p.forEach((q, i) => { const w = q * bw_; const x = bx + p.slice(0, i).reduce((s, z) => s + z, 0) * bw_; g.fillStyle = i % 2 ? C.warn : C.acc; g.globalAlpha = .55 + .1 * (i % 2); g.fillRect(x, y0, w, 30); g.globalAlpha = 1; });
        text(g, o.pair("Aire = probabilité du chemin", "Area = probability of the path"), bx, y0 + 52, C.muted, 16);
        const pB = p[0] + p[2];
        set(o, lines(`P(A∩B) = ${N(p[0], 3)}`, `P(A∩B̄) = ${N(p[1], 3)}`, `P(Ā∩B) = ${N(p[2], 3)}`, `P(Ā∩B̄) = ${N(p[3], 3)}`, o.pair(`Probabilités totales : P(B) = ${N(pB, 3)}`, `Total probability: P(B) = ${N(pB, 3)}`), pB > 0 ? o.pair(`P_B(A) = ${N(p[0] / pB, 3)}`, `P_B(A) = ${N(p[0] / pB, 3)}`) : ""));
      },
    };
  },

  // Binomial distribution: draggable p, n slider (terminale / STMG only).
  binom(o) {
    let n = 10, p = .3; slider(o, "n", 2, 30, 1, n, v => { n = v; o.redraw(); });
    const ch = k => { let r = 1; for (let i = 1; i <= k; i++) r = r * (n - k + i) / i; return r; };
    const v = () => view(o, -.5, n + .5, 0, 1, 40);
    return {
      handles() { const bw = o.W - 80; return [{ x: 40 + p * bw, y: o.H - 12, r: 26, cur: "ew-resize", move(X) { p = clamp(snap((X - 40) / bw, .01), .01, .99); } }]; },
      draw(g) {
        const pr = Array.from({ length: n + 1 }, (_, k) => ch(k) * p ** k * (1 - p) ** (n - k)), mx = Math.max(...pr) * 1.15, V = view(o, -.5, n + .5, 0, mx, 40);
        axes(g, { ...V, y1: mx }, { lang: o.L, sx: Math.max(1, Math.round(n / 10)), sy: 1e9, noLabels: false });
        pr.forEach((q, k) => { const x = V.X(k), w = Math.max(3, (V.X(1) - V.X(0)) * .7); g.fillStyle = C.acc; g.fillRect(x - w / 2, V.Y(q), w, V.Y(0) - V.Y(q)); });
        g.fillStyle = C.grid; g.fillRect(40, o.H - 18, o.W - 80, 6); g.fillStyle = C.acc; g.fillRect(40, o.H - 18, p * (o.W - 80), 6); dot(o, 40 + p * (o.W - 80), o.H - 15, C.warn, "p");
        const N = o.num; set(o, lines(`X ~ B(${n} ; ${N(p)})`, o.pair(`Espérance E(X) = np = ${N(n * p)}`, `Expected value E(X) = np = ${N(n * p)}`), o.pair(`Variance V(X) = np(1−p) = ${N(n * p * (1 - p))}`, `Variance V(X) = np(1−p) = ${N(n * p * (1 - p))}`)));
      },
    };
  },

  // Distribution of a discrete random variable with four values: draggable bar tops, normalised.
  rv(o) {
    const xs = [0, 1, 2, 3]; const w = [1, 2, 2, 1]; const v = () => view(o, -.7, 3.7, 0, 1, 44);
    return {
      handles() { const V = v(), s = w.reduce((a, b) => a + b, 0); return w.map((q, i) => ({ x: V.X(xs[i]), y: V.Y(q / s), cur: "ns-resize", move(X, Y) { const others = s - q, t = clamp(V.iY(Y), .02, .9); w[i] = Math.max(.1, (t * others) / (1 - t)); } })); },
      draw(g) {
        const V = v(), s = w.reduce((a, b) => a + b, 0); axes(g, V, { lang: o.L, sx: 1, sy: .25 });
        const p = w.map(q => q / s), E = p.reduce((a, q, i) => a + q * xs[i], 0), Vr = p.reduce((a, q, i) => a + q * (xs[i] - E) ** 2, 0);
        p.forEach((q, i) => { g.fillStyle = C.acc; const bw = (V.X(1) - V.X(0)) * .5; g.fillRect(V.X(xs[i]) - bw / 2, V.Y(q), bw, V.Y(0) - V.Y(q)); dot(o, V.X(xs[i]), V.Y(q), C.warn); });
        g.save(); g.strokeStyle = C.ink; g.setLineDash([6, 5]); g.beginPath(); g.moveTo(V.X(E), V.Y(0)); g.lineTo(V.X(E), V.Y(1)); g.stroke(); g.restore(); text(g, "E(X)", V.X(E) + 6, V.Y(.95), C.ink, 16);
        const N = o.num; set(o, lines(p.map((q, i) => `P(X=${xs[i]}) = ${N(q, 3)}`).join("<br>"), o.pair(`E(X) = ${N(E, 3)}`, `E(X) = ${N(E, 3)}`), `V(X) = ${N(Vr, 3)}`, o.pair(`σ(X) = ${N(Math.sqrt(Vr), 3)}`, `σ(X) = ${N(Math.sqrt(Vr), 3)}`)));
      },
    };
  },

  // Data on a number line: draggable values, mean, median, quartiles, box plot (Seconde).
  stats(o) {
    const D = [3, 5, 6, 8, 9, 12, 14]; const v = () => view(o, 0, 16, 0, 1, 40);
    return {
      handles() { const V = v(); return D.map((d, i) => ({ x: V.X(d), y: V.Y(.62), cur: "ew-resize", move(X) { D[i] = clamp(snap(V.iX(X), .5), 0, 16); } })); },
      draw(g) {
        const V = v(); const s = [...D].sort((a, b) => a - b), n = s.length, q = p => s[Math.ceil(p * n) - 1], med = n % 2 ? s[(n - 1) / 2] : (s[n / 2 - 1] + s[n / 2]) / 2;
        const mean = s.reduce((a, b) => a + b, 0) / n, sd = Math.sqrt(s.reduce((a, b) => a + (b - mean) ** 2, 0) / n), q1 = q(.25), q3 = q(.75);
        axes(g, { ...V }, { lang: o.L, sx: 2, sy: 1e9, noLabels: false });
        const y = V.Y(.25); g.save(); g.strokeStyle = C.acc; g.lineWidth = 3; g.strokeRect(V.X(q1), y - 22, V.X(q3) - V.X(q1), 44); g.beginPath(); g.moveTo(V.X(s[0]), y); g.lineTo(V.X(q1), y); g.moveTo(V.X(q3), y); g.lineTo(V.X(s[n - 1]), y); g.moveTo(V.X(med), y - 22); g.lineTo(V.X(med), y + 22); g.stroke(); g.restore();
        g.save(); g.strokeStyle = C.warn; g.lineWidth = 2; g.setLineDash([5, 5]); g.beginPath(); g.moveTo(V.X(mean), V.Y(.1)); g.lineTo(V.X(mean), V.Y(.75)); g.stroke(); g.restore();
        D.forEach(d => dot(o, V.X(d), V.Y(.62), C.acc)); const N = o.num;
        set(o, lines(o.pair(`Moyenne = ${N(mean)} (pointillés orange)`, `Mean = ${N(mean)} (orange dashes)`), o.pair(`Médiane = ${N(med)}`, `Median = ${N(med)}`), `Q₁ = ${N(q1)}, Q₃ = ${N(q3)}`, o.pair(`Écart interquartile = ${N(q3 - q1)}`, `Interquartile range = ${N(q3 - q1)}`), o.pair(`Écart type σ = ${N(sd)}`, `Standard deviation σ = ${N(sd)}`)));
      },
    };
  },

  // Percentage change: draggable rate handles on two successive changes.
  pct(o) {
    let t1 = .2, t2 = -.2; const bx = 60;
    return {
      handles() { const s = (o.W - 120) / 1.0; return [{ x: bx + (t1 + .5) * s, y: 120, cur: "ew-resize", move(X) { t1 = clamp(snap((X - bx) / s - .5, .01), -.5, .5); } }, { x: bx + (t2 + .5) * s, y: 250, cur: "ew-resize", move(X) { t2 = clamp(snap((X - bx) / s - .5, .01), -.5, .5); } }]; },
      draw(g) {
        const s = o.W - 120, N = o.num; [[t1, 120, "t₁"], [t2, 250, "t₂"]].forEach(([t, y, l]) => { g.fillStyle = C.grid; g.fillRect(bx, y - 4, s, 8); g.fillStyle = C.axis; g.fillRect(bx + s / 2 - 1, y - 14, 2, 28); dot(o, bx + (t + .5) * s, y, C.acc); text(g, `${l} = ${N(t * 100, 0)} %`, bx, y - 26, C.ink, 20); });
        const cm = (1 + t1) * (1 + t2); const y0 = 340; [["100", 100], [N(100 * (1 + t1), 1), 100 * (1 + t1)], [N(100 * cm, 1), 100 * cm]].forEach(([l, v], i) => { const w = v / 150 * s; g.fillStyle = i === 2 ? C.warn : C.acc; g.globalAlpha = .8; g.fillRect(bx, y0 + i * 44, w, 30); g.globalAlpha = 1; text(g, l, bx + w + 10, y0 + i * 44 + 22, C.ink, 18); });
        set(o, lines(`CM₁ = 1 ${t1 < 0 ? "−" : "+"} ${N(Math.abs(t1), 2)} = ${N(1 + t1, 3)}`, `CM₂ = ${N(1 + t2, 3)}`, o.pair(`Coefficient global = ${N(cm, 4)}`, `Overall multiplier = ${N(cm, 4)}`), o.pair(`Évolution globale = ${N((cm - 1) * 100, 2)} %`, `Overall change = ${N((cm - 1) * 100, 2)} %`), Math.abs(cm - 1) > 1e-9 ? o.pair(`Taux réciproque = ${N((1 / cm - 1) * 100, 2)} %`, `Reverse rate = ${N((1 / cm - 1) * 100, 2)} %`) : ""));
      },
    };
  },

  // Reference functions: draggable point on the curve; image, preimages.
  ref(o) {
    let kind = "square", x0 = 1.5; const F = { square: x => x * x, inverse: x => 1 / x, sqrt: x => Math.sqrt(x), cube: x => x ** 3, abs: x => Math.abs(x), affine: x => 0.5 * x + 1 }; const v = () => view(o, -5, 5, -5, 5);
    choice(o, [["square", "x²", "x²"], ["inverse", "1/x", "1/x"], ["sqrt", "√x", "√x"], ["cube", "x³", "x³"], ["abs", "|x|", "|x|"], ["affine", "ax+b", "ax+b"]], kind, k => { kind = k; x0 = k === "sqrt" ? 2 : 1.5; o.redraw(); });
    return {
      handles() { const V = v(), y = F[kind](x0); return Number.isFinite(y) ? [{ x: V.X(x0), y: V.Y(clamp(y, -5, 5)), cur: "ew-resize", move(X) { let t = snap(V.iX(X), .25); if (kind === "inverse" && Math.abs(t) < .25) t = t < 0 ? -.25 : .25; if (kind === "sqrt") t = Math.max(0, t); x0 = clamp(t, -4.75, 4.75); } }] : []; },
      draw(g) {
        const V = v(), f = F[kind], N = o.num; axes(g, V, { lang: o.L });
        if (kind === "inverse") { curve(g, V, f, -5, -.1); curve(g, V, f, .1, 5); } else curve(g, V, f, kind === "sqrt" ? 0 : -5, 5);
        const y = f(x0); g.save(); g.strokeStyle = C.warn; g.setLineDash([6, 5]); g.lineWidth = 2; g.beginPath(); g.moveTo(V.X(x0), V.Y(0)); g.lineTo(V.X(x0), V.Y(clamp(y, -5, 5))); g.lineTo(V.X(0), V.Y(clamp(y, -5, 5))); g.stroke(); g.restore(); dot(o, V.X(x0), V.Y(clamp(y, -5, 5)), C.acc, "M");
        let pre; if (kind === "square") pre = y > 0 ? [-Math.sqrt(y), Math.sqrt(y)] : [0]; else if (kind === "abs") pre = y > 0 ? [-y, y] : [0]; else if (kind === "inverse") pre = [1 / y]; else if (kind === "sqrt") pre = [y * y]; else if (kind === "cube") pre = [Math.cbrt(y)]; else pre = [(y - 1) / .5];
        set(o, lines(o.pair(`Image de ${N(x0)} : ${N(y, 3)}`, `Image of ${N(x0)}: ${N(y, 3)}`), o.pair(`Antécédent(s) de ${N(y, 3)} : ${pre.map(q => N(q, 3)).join(" ; ")}`, `Preimage(s) of ${N(y, 3)}: ${pre.map(q => N(q, 3)).join(" ; ")}`), kind === "square" ? o.pair("Décroissante sur ]−∞;0], croissante sur [0;+∞[.", "Decreasing on ]−∞;0], increasing on [0;+∞[.") : kind === "inverse" ? o.pair("Décroissante sur chaque intervalle, définie sur ℝ*.", "Decreasing on each interval, defined on ℝ*.") : ""));
      },
    };
  },

  // Intervals: two draggable intervals on a number line, with intersection and union.
  interval(o) {
    const I = [-3, 2], J = [0, 5]; const incl = [true, true, false, true]; const v = () => view(o, -8, 8, 0, 1, 40);
    return {
      handles() { const V = v(); return [[I, 0, .7], [I, 1, .7], [J, 0, .4], [J, 1, .4]].map(([a, k, y]) => ({ x: V.X(a[k]), y: V.Y(y), cur: "ew-resize", move(X) { a[k] = clamp(snap(V.iX(X), .5), -7.5, 7.5); } })); },
      draw(g) {
        const V = v(); axes(g, V, { lang: o.L, sx: 1, sy: 1e9 });
        const [a, b] = [Math.min(...I), Math.max(...I)], [c, d] = [Math.min(...J), Math.max(...J)];
        const seg = (x0, x1, y, col) => { g.save(); g.strokeStyle = col; g.lineWidth = 6; g.beginPath(); g.moveTo(V.X(x0), V.Y(y)); g.lineTo(V.X(x1), V.Y(y)); g.stroke(); g.restore(); };
        seg(a, b, .7, C.acc); seg(c, d, .4, C.warn); const lo = Math.max(a, c), hi = Math.min(b, d); if (lo <= hi) seg(lo, hi, .15, C.ink);
        [[I, .7, C.acc], [J, .4, C.warn]].forEach(([arr, y, col]) => arr.forEach(e => dot(o, V.X(e), V.Y(y), col)));
        const N = o.num, br = `[${N(a)} ; ${N(b)}]`, br2 = `[${N(c)} ; ${N(d)}]`;
        set(o, lines(`I = ${br}`, `J = ${br2}`, o.pair(`I ∩ J = ${lo <= hi ? `[${N(lo)} ; ${N(hi)}]` : "∅"}`, `I ∩ J = ${lo <= hi ? `[${N(lo)} ; ${N(hi)}]` : "∅"}`), lo <= hi ? `I ∪ J = [${N(Math.min(a, c))} ; ${N(Math.max(b, d))}]` : `I ∪ J = ${br} ∪ ${br2}`, o.pair(`|x − ${N((a + b) / 2)}| ≤ ${N((b - a) / 2)} décrit I`, `|x − ${N((a + b) / 2)}| ≤ ${N((b - a) / 2)} describes I`)));
      },
    };
  },
  // Riemann sums for f(x) = 0.25x^2 - x + 2 with draggable bounds and a slider for the number of rectangles.
  integral(o) {
    const f = x => x * x / 4 - x + 2, F = x => x ** 3 / 12 - x * x / 2 + 2 * x; let a = 0.5, b = 4.5, n = 6; const v = () => view(o, -1, 7, -1, 6);
    slider(o, "n", 1, 40, 1, n, q => { n = q; o.redraw(); });
    return {
      handles() { const V = v(); return [{ x: V.X(a), y: V.Y(0), cur: "ew-resize", move(X) { a = clamp(snap(V.iX(X), .25), -.75, b - .5); } }, { x: V.X(b), y: V.Y(0), cur: "ew-resize", move(X) { b = clamp(snap(V.iX(X), .25), a + .5, 6.75); } }];},
      draw(g) {
        const V = v(); axes(g, V, { lang: o.L }); const w = (b - a) / n; let S = 0;
        for (let i = 0; i < n; i++) { const x = a + i * w, y = f(x + w / 2); S += y * w; g.fillStyle = "rgba(111,211,176,.28)"; g.strokeStyle = C.acc; g.lineWidth = 1; g.fillRect(V.X(x), V.Y(y), V.X(x + w) - V.X(x), V.Y(0) - V.Y(y)); g.strokeRect(V.X(x), V.Y(y), V.X(x + w) - V.X(x), V.Y(0) - V.Y(y)); }
        curve(g, V, f, -1, 7); dot(o, V.X(a), V.Y(0), C.warn, "a"); dot(o, V.X(b), V.Y(0), C.warn, "b"); const N = o.num, I = F(b) - F(a);
        set(o, lines("f(x) = x²/4 − x + 2", o.pair(`Somme de Riemann (milieux) = ${N(S, 4)}`, `Riemann sum (midpoints) = ${N(S, 4)}`), `∫ f = F(b) − F(a) = ${N(I, 4)}`, o.pair(`Écart = ${N(Math.abs(S - I), 4)}`, `Gap = ${N(Math.abs(S - I), 4)}`)));
      },
    };
  },
};
