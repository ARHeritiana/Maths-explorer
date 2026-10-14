import { C, view, axes, curve, dot, text, slider, choice, snap, clamp, fmt, inl, rich, tpt, tiv, tpoly, tshift, tpar, sgn } from "./widgets.js";

const set = (o, html) => rich(o.readout, html);
const lines = (...a) => a.filter(Boolean).join("<br>");
// Readouts are prose with TeX formulas between \( and \): inl() wraps one formula, tpoly/tshift/tpt/tiv build TeX.



export const W2 = {
  // Two draggable points define a line: slope, direction vector, equations (Seconde droites, Premiere geometrie).
  line(o) {
    let A = [-2, 1], B = [3, 3]; const v = () => view(o, -6, 6, -5, 5);
    return {
      handles() { const V = v(); return [A, B].map(p => ({ x: V.X(p[0]), y: V.Y(p[1]), cur: "grab", move(X, Y) { p[0] = clamp(snap(V.iX(X)), -6, 6); p[1] = clamp(snap(V.iY(Y)), -5, 5); } })); },
      draw(g) {
        const V = v(); axes(g, V, { lang: o.L });
        const dx = B[0] - A[0], dy = B[1] - A[1];
        if (dx === 0 && dy === 0) { dot(o, V.X(A[0]), V.Y(A[1]), C.acc, "A=B"); set(o, o.pair(`${inl("A")} et ${inl("B")} sont confondus : pas de droite.`, `${inl("A")} and ${inl("B")} coincide: no line.`)); return; }
        g.save(); g.strokeStyle = C.acc; g.lineWidth = 3; g.beginPath();
        const t = 40; g.moveTo(V.X(A[0] - t * dx), V.Y(A[1] - t * dy)); g.lineTo(V.X(A[0] + t * dx), V.Y(A[1] + t * dy)); g.stroke(); g.restore();
        g.save(); g.strokeStyle = C.warn; g.lineWidth = 2.5; g.beginPath(); g.moveTo(V.X(A[0]), V.Y(A[1])); g.lineTo(V.X(B[0]), V.Y(B[1])); g.stroke(); g.restore();
        dot(o, V.X(A[0]), V.Y(A[1]), C.acc, "A"); dot(o, V.X(B[0]), V.Y(B[1]), C.acc, "B");
        const a = dy, b = -dx, c = -(a * A[0] + b * A[1]), N = o.tn;
        const red = dx === 0 ? `x=${N(A[0])}` : `y=${tpoly([[dy / dx, "x"], [A[1] - dy / dx * A[0], ""]], N)}`;
        set(o, lines(inl(`\\overrightarrow{AB}=${tpt(o, dx, dy)}`), o.pair(`Équation cartésienne : ${inl(`${tpoly([[a, "x"], [b, "y"], [c, ""]], N)}=0`)}`, `Cartesian equation: ${inl(`${tpoly([[a, "x"], [b, "y"], [c, ""]], N)}=0`)}`), dx === 0 ? o.pair("Droite verticale.", "Vertical line.") : o.pair(`Équation réduite : ${inl(red)}`, `Slope-intercept form: ${inl(red)}`), dx === 0 ? "" : o.pair(`Pente ${inl(`m=${N(dy / dx)}`)}`, `Slope ${inl(`m=${N(dy / dx)}`)}`)));
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
        const N = o.tn, b = -2 * a * al, c = a * al * al + be, d = b * b - 4 * a * c;
        const canon = (a === 1 ? "" : a === -1 ? "-" : N(a)) + tshift("x", al, N) + "^2" + (Math.abs(be) < 1e-9 ? "" : (be < 0 ? "-" : "+") + N(Math.abs(be)));
        const ordered = d > 1e-9 ? [(-b-Math.sqrt(d))/(2*a),(-b+Math.sqrt(d))/(2*a)].sort((x,y)=>x-y) : [al];
        const roots = d < -1e-9 ? o.pair("aucune racine réelle", "no real root") : d < 1e-9 ? inl(`x=${N(al)}`) : inl(`x_1=${N(ordered[0])},\\ x_2=${N(ordered[1])}`);
        set(o, lines(o.pair(`Forme canonique : ${inl(`f(x)=${canon}`)}`, `Canonical form: ${inl(`f(x)=${canon}`)}`), inl(`f(x)=${tpoly([[a, "x^2"], [b, "x"], [c, ""]], N)}`), o.spec.showDelta === false ? "" : inl(`\\Delta=${N(d)}`), o.pair("Zéros (intersections) : ", "Zeros (intersections): ") + roots, a > 0 ? o.pair(`Minimum en ${inl("\\alpha")}.`, `Minimum at ${inl("\\alpha")}.`) : o.pair(`Maximum en ${inl("\\alpha")}.`, `Maximum at ${inl("\\alpha")}.`)));
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
        const V = v(), N = o.tn; axes(g, V, { lang: o.L, sx: mode === "log" ? 2 : 1 });
        if (mode === "exp") {
          curve(g, V, x => C0 * b ** x, -4, 4); dot(o, V.X(0), V.Y(C0), C.acc, "A", "grab", true, -1); dot(o, V.X(1), V.Y(C0 * b), C.warn, "B");
          set(o, lines(inl(`f(x)=${N(C0)}\\times ${tpar(N, b)}^x`), `${inl(`A${tpt(o, 0, C0)}`)} · ${inl(`B${tpt(o, 1, C0 * b)}`)}`, o.pair(`Raison ${inl(`b=${N(b)}`)} : ${b > 1 ? "croissante" : b < 1 ? "décroissante" : "constante"}`, `Base ${inl(`b=${N(b)}`)}: ${b > 1 ? "increasing" : b < 1 ? "decreasing" : "constant"}`), o.pair(`Taux d’évolution par unité : ${inl(`${N((b - 1) * 100)}\\,\\%`)}`, `Rate of change per unit: ${inl(`${N((b - 1) * 100)}\\,\\%`)}`)));
        } else if (mode === "log") {
          curve(g, V, x => Math.log10(x), .001, 12); const x = 10 ** tx;
          g.save(); g.strokeStyle = C.warn; g.setLineDash([6, 5]); g.beginPath(); g.moveTo(V.X(x), V.Y(0)); g.lineTo(V.X(x), V.Y(tx)); g.lineTo(V.X(0), V.Y(tx)); g.stroke(); g.restore();
          dot(o, V.X(x), V.Y(tx), C.acc, "M");
          set(o, lines(inl(`x=${N(x)}`), inl(`\\log(x)=${N(tx)}`), inl(`10^{${N(tx)}}=${N(x)}`), o.pair(`${inl("\\log 10=1")}, ${inl("\\log 1=0")} : le logarithme croît lentement.`, `${inl("\\log 10=1")}, ${inl("\\log 1=0")}: the logarithm grows slowly.`)));
        } else {
          curve(g, V, x => (x < -.12 || x > .12 ? k / x : NaN), -6, -.12); curve(g, V, x => k / x, .12, 6);
          dot(o, V.X(1), V.Y(k), C.warn, "k"); const y = k / tx2; dot(o, V.X(tx2), V.Y(y), C.acc, "M");
          set(o, lines(inl(`f(x)=\\dfrac{${N(k)}}{x}`), `${inl(`M${tpt(o, tx2, y)}`)} : ${inl(`x\\times y=${N(tx2 * y)}`)}`, k > 0 ? o.pair(`Décroissante sur ${inl(tiv(o, "-\\infty", 0, false, false))} et sur ${inl(tiv(o, 0, "+\\infty", false, false))}.`, `Decreasing on ${inl(tiv(o, "-\\infty", 0, false, false))} and on ${inl(tiv(o, 0, "+\\infty", false, false))}.`) : o.pair("Croissante sur chaque intervalle.", "Increasing on each interval."), o.pair(`Asymptotes : ${inl("x=0")} et ${inl("y=0")}.`, `Asymptotes: ${inl("x=0")} and ${inl("y=0")}.`)));
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
        for (let n = 0; n <= N; n++) { const y = f(n); if (y > V.y1 + 2 || y < V.y0 - 2) continue; dot(o, V.X(n), V.Y(y), n < 2 ? C.acc : C.muted, n === 0 ? inl("u_0") : n === 1 ? inl("u_1") : "", "grab", n < 2); }
        const Nn = o.tn;
        set(o, geo ? lines(o.pair(`Raison ${inl(`q=\\dfrac{u_1}{u_0}=${Nn(q)}`)}`, `Common ratio ${inl(`q=\\dfrac{u_1}{u_0}=${Nn(q)}`)}`), inl(`u_n=${u0 === 1 ? "" : Nn(u0) + "\\times "}${tpar(Nn, q)}^n`), inl(`u_{10}=${Nn(f(10))}`)) : lines(o.pair(`Raison ${inl(`r=u_1-u_0=${Nn(r)}`)}`, `Common difference ${inl(`r=u_1-u_0=${Nn(r)}`)}`), inl(`u_n=${tpoly([[u0, ""], [r, "n"]], Nn)}`), inl(`u_{10}=${Nn(f(10))}`), o.pair("Les points sont alignés.", "The points are collinear.")));
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
        const u = [B[0] - A[0], B[1] - A[1]], w = [Cc[0] - A[0], Cc[1] - A[1]], N = o.tn;
        const dp = u[0] * w[0] + u[1] * w[1], det = u[0] * w[1] - u[1] * w[0], nu = Math.hypot(...u), nw = Math.hypot(...w);
        const ang = nu && nw ? Math.acos(clamp(dp / (nu * nw), -1, 1)) * 180 / Math.PI : NaN;
        const nd = o.spec.noDot;
        const AB = "\\overrightarrow{AB}", AC = "\\overrightarrow{AC}";
        set(o, lines(inl(`${AB}=${tpt(o, u[0], u[1])},\\ ${AC}=${tpt(o, w[0], w[1])}`), nd ? "" : o.pair(`${inl(`${AB}\\cdot${AC}=${N(dp)}`)} ${dp === 0 ? `${inl("\\Rightarrow")} orthogonaux` : ""}`, `${inl(`${AB}\\cdot${AC}=${N(dp)}`)} ${dp === 0 ? `${inl("\\Rightarrow")} orthogonal` : ""}`), o.pair(`Déterminant ${inl(`\\det(${AB},${AC})=${N(det)}`)} ${det === 0 ? `${inl("\\Rightarrow")} colinéaires` : ""}`, `Determinant ${inl(`\\det(${AB},${AC})=${N(det)}`)} ${det === 0 ? `${inl("\\Rightarrow")} collinear` : ""}`), inl(`\\lVert ${AB}\\rVert=${N(nu)},\\ \\lVert ${AC}\\rVert=${N(nw)}`), nd ? "" : o.pair(`Angle ${inl("\\widehat{BAC}")} : ${Number.isNaN(ang) ? "—" : inl(`${N(ang, 1)}^\\circ`)}`, `Angle ${inl("\\widehat{BAC}")}: ${Number.isNaN(ang) ? "—" : inl(`${N(ang, 1)}^\\circ`)}`)));
      },
    };
  },

  // Recurrence u(n+1) = a u(n) + b drawn as a cobweb: drag u0 on the x-axis, B = (0 ; b) and S on the line to change a.
  cobweb(o) {
    let a = .5, b = 2, u0 = 0; const xs = 7; const v = () => view(o, -2.5, 10, -2.5, 10);
    return {
      handles() {
        const V = v();
        return [{ x: V.X(u0), y: V.Y(0), cur: "ew-resize", move(X) { u0 = clamp(snap(V.iX(X), .25), -2, 9.5); } },
          { x: V.X(0), y: V.Y(b), cur: "ns-resize", move(X, Y) { b = clamp(snap(V.iY(Y), .25), -2, 6); } },
          { x: V.X(xs), y: V.Y(a * xs + b), cur: "ns-resize", move(X, Y) { a = clamp(snap((V.iY(Y) - b) / xs, .05), -1.5, 1.5); } }];
      },
      draw(g) {
        const V = v(), N = o.tn, f = x => a * x + b; axes(g, V, { lang: o.L, sx: 2, sy: 2 });
        g.save(); g.beginPath(); g.rect(V.pad, V.pad, o.W - 2 * V.pad, o.H - 2 * V.pad); g.clip();
        curve(g, V, x => x, -2.5, 10, C.muted, 1.5); curve(g, V, f, -2.5, 10, C.acc, 3);
        const u = [u0]; for (let n = 0; n < 40; n++) u.push(f(u[n]));
        g.strokeStyle = C.warn; g.lineWidth = 1.8; g.beginPath(); g.moveTo(V.X(u0), V.Y(0));
        for (let n = 0; n < 14 && Math.abs(u[n]) < 60; n++) { g.lineTo(V.X(u[n]), V.Y(u[n + 1])); g.lineTo(V.X(u[n + 1]), V.Y(u[n + 1])); }
        g.stroke(); g.restore();
        for (let n = 1; n < 4; n++) if (u[n] > -2.5 && u[n] < 10) { dot(o, V.X(u[n]), V.Y(0), C.muted, "", "default", false); text(g, inl(`u_${n}`), V.X(u[n]), V.Y(0) + 30, C.muted, 15, "center"); }
        dot(o, V.X(u0), V.Y(0), C.warn, inl("u_0")); dot(o, V.X(0), V.Y(b), C.acc, "B", "grab", true, -1); dot(o, V.X(xs), V.Y(f(xs)), C.acc, "S");
        const out = [inl(`u_{n+1}=f(u_n),\\ f(x)=${tpoly([[a, "x"], [b, ""]], N)}`), [0, 1, 2, 3].map(n => inl(`u_${n}=${N(u[n])}`)).join(" , ")];
        if (Math.abs(a - 1) < 1e-9) out.push(o.pair(`${inl("a=1")} : suite arithmétique de raison ${inl(N(b))}.`, `${inl("a=1")}: arithmetic sequence with common difference ${inl(N(b))}.`));
        else {
          const l = b / (1 - a); out.push(o.pair(`Point fixe ${inl(`\\ell=\\dfrac{b}{1-a}=${N(l)}`)} : ${inl("f(\\ell)=\\ell")}.`, `Fixed point ${inl(`\\ell=\\dfrac{b}{1-a}=${N(l)}`)}: ${inl("f(\\ell)=\\ell")}.`));
          out.push(inl(`u_n-\\ell=${tpar(N, a)}^n\\times(u_0-\\ell)`));
          if (Math.abs(u0 - l) < 1e-9) out.push(o.pair(`${inl("u_0=\\ell")} : la suite est constante.`, `${inl("u_0=\\ell")}: the sequence is constant.`));
          else if (Math.abs(a) < 1) out.push(o.pair(`${inl("|a|<1")} : ${inl(`u_n\\to\\ell=${N(l)}`)}.`, `${inl("|a|<1")}: ${inl(`u_n\\to\\ell=${N(l)}`)}.`));
          else if (Math.abs(a + 1) < 1e-9) out.push(o.pair(`${inl("a=-1")} : les termes alternent entre deux valeurs.`, `${inl("a=-1")}: the terms alternate between two values.`));
          else out.push(o.pair(`${inl("|a|>1")} : ${inl("|u_n-\\ell|")} tend vers ${inl("+\\infty")}.`, `${inl("|a|>1")}: ${inl("|u_n-\\ell|")} tends to ${inl("+\\infty")}.`));
        }
        if (a > 0 && Math.abs(u[1] - u0) > 1e-9) { const up = u[1] > u0, le = inl(`u_n${up ? "\\leqslant " : "\\geqslant "}u_{n+1}`), fl = inl(`f(u_n)${up ? "\\leqslant " : "\\geqslant "}f(u_{n+1})`); out.push(o.pair(`${inl("f")} est croissante : si ${le} alors ${fl}. Par récurrence, la suite est ${up ? "croissante" : "décroissante"}.`, `${inl("f")} is increasing: if ${le} then ${fl}. By induction, the sequence is ${up ? "increasing" : "decreasing"}.`)); }
        else if (a < 0) out.push(o.pair(`${inl("f")} est décroissante : les termes se placent alternativement de part et d’autre de ${inl("\\ell")}.`, `${inl("f")} is decreasing: the terms fall alternately on either side of ${inl("\\ell")}.`));
        set(o, lines(...out));
      },
    };
  },

  // Limit of a sequence: drag the band half-width ε, the limit ℓ and u0; the threshold rank N is read off the plot.
  limit(o) {
    let mode = "harm", l = 2, c = 4, eps = .5, A = 40; const M = 30;
    const v = () => (mode === "inf" ? view(o, -.5, M + .5, -6, 100) : view(o, -.5, M + .5, -4, 8));
    const u = n => (mode === "harm" ? l + c / (n + 1) : mode === "geo" ? l + c * (-.8) ** n : n * n / 10);
    choice(o, [["harm", inl("\\ell+\\tfrac{c}{n+1}"), inl("\\ell+\\tfrac{c}{n+1}")], ["geo", inl("\\ell+c(-0{,}8)^n"), inl("\\ell+c(-0.8)^n")], ["inf", inl("\\tfrac{n^2}{10}"), inl("\\tfrac{n^2}{10}")]], mode, m => { mode = m; o.redraw(); });
    // |u(n) − ℓ| decreases and n²/10 increases, so the first rank that works is valid for every later rank.
    const rank = () => { for (let n = 0; n <= 400; n++) if (mode === "inf" ? u(n) > A : Math.abs(u(n) - l) < eps) return n; return null; };
    return {
      handles() {
        const V = v();
        if (mode === "inf") return [{ x: V.X(M - 1), y: V.Y(A), cur: "ns-resize", move(X, Y) { A = clamp(snap(V.iY(Y), 1), 0, 90); } }];
        return [{ x: V.X(0), y: V.Y(l + c), cur: "ns-resize", move(X, Y) { c = clamp(snap(V.iY(Y) - l, .25), -5, 5); } },
          { x: V.X(M - 1), y: V.Y(l), cur: "ns-resize", move(X, Y) { l = clamp(snap(V.iY(Y), .25), -2, 5); } },
          { x: V.X(M - 4), y: V.Y(l + eps), cur: "ns-resize", move(X, Y) { eps = clamp(snap(V.iY(Y) - l, .05), .05, 3); } }];
      },
      draw(g) {
        const V = v(), N = o.tn, r = rank(); axes(g, V, { lang: o.L, sx: 5, sy: mode === "inf" ? 20 : 2 }); const rk = r === null ? "?" : r;
        g.save(); g.beginPath(); g.rect(V.pad, V.pad, o.W - 2 * V.pad, o.H - 2 * V.pad); g.clip();
        if (mode === "inf") { g.fillStyle = "rgba(111,211,176,.12)"; g.fillRect(V.X(-.5), V.Y(100), V.X(M + .5) - V.X(-.5), V.Y(A) - V.Y(100)); curve(g, V, () => A, -.5, M + .5, C.acc, 2); }
        else { g.fillStyle = "rgba(111,211,176,.14)"; g.fillRect(V.X(-.5), V.Y(l + eps), V.X(M + .5) - V.X(-.5), V.Y(l - eps) - V.Y(l + eps)); curve(g, V, () => l, -.5, M + .5, C.acc, 2); }
        if (r !== null && r <= M) { g.strokeStyle = C.blue; g.setLineDash([6, 5]); g.lineWidth = 1.5; g.beginPath(); g.moveTo(V.X(r), V.Y(V.y0)); g.lineTo(V.X(r), V.Y(V.y1)); g.stroke(); g.setLineDash([]); text(g, inl("N"), V.X(r) + 6, V.pad + 18, C.blue, 16); }
        for (let n = 0; n <= M; n++) { const y = u(n), inside = mode === "inf" ? y > A : Math.abs(y - l) < eps; g.fillStyle = inside ? C.acc : C.warn; g.beginPath(); g.arc(V.X(n), V.Y(y), 4.5, 0, 7); g.fill(); }
        g.restore();
        if (mode === "inf") { dot(o, V.X(M - 1), V.Y(A), C.acc, "A", "grab", true, -1); set(o, lines(inl("u_n=\\dfrac{n^2}{10}"), inl(`A=${N(A)}`), o.pair(`${inl("u_n>A")} pour tout ${inl(`n\\geqslant N=${rk}`)}.`, `${inl("u_n>A")} for every ${inl(`n\\geq N=${rk}`)}.`), o.pair(`Tout seuil ${inl("A")} est dépassé à partir d’un certain rang : ${inl("u_n\\to+\\infty")}.`, `Every threshold ${inl("A")} is exceeded from some rank on: ${inl("u_n\\to+\\infty")}.`))); return; }
        dot(o, V.X(0), V.Y(l + c), C.warn, inl("u_0")); dot(o, V.X(M - 1), V.Y(l), C.acc, inl("\\ell"), "grab", true, -1); dot(o, V.X(M - 4), V.Y(l + eps), C.blue, inl("\\varepsilon"), "grab", true, -1);
        set(o, lines(inl(mode === "harm" ? `u_n=${N(l)}${sgn(c)}\\dfrac{${N(Math.abs(c))}}{n+1}` : `u_n=${N(l)}${sgn(c)}${N(Math.abs(c))}\\times(${N(-.8)})^n`), inl(`\\varepsilon=${N(eps)}`),
          o.pair(`Tous les termes sont dans ${inl(tiv(o, l - eps, l + eps, false, false))} dès ${inl(`n\\geqslant N=${rk}`)}.`, `All terms lie in ${inl(tiv(o, l - eps, l + eps, false, false))} for ${inl(`n\\geq N=${rk}`)}.`),
          o.pair(`Réduisez ${inl("\\varepsilon")} : ${inl("N")} augmente, mais il existe toujours. C’est la définition de ${inl("u_n\\to\\ell")}.`, `Shrink ${inl("\\varepsilon")}: ${inl("N")} grows, but it always exists. This is the definition of ${inl("u_n\\to\\ell")}.`)));
      },
    };
  },

  // Convexity: tangent at M and chord AB on three model functions; the strip under the plot shows the sign of f″.
  convex(o) {
    let mode = "cubic", m = -1.5, xa = -3, xb = -.5;
    const F = { cubic: [x => x ** 3 / 4 - x, x => 3 * x * x / 4 - 1, x => 1.5 * x, [-4, 4, -4, 4], "f(x)=\\dfrac{x^3}{4}-x"], exp: [Math.exp, Math.exp, Math.exp, [-3, 2.5, -1, 8], "f(x)=\\mathrm{e}^x"], ln: [Math.log, x => 1 / x, x => -1 / (x * x), [-.5, 8, -3, 3], "f(x)=\\ln x"] };
    const reset = () => { [m, xa, xb] = mode === "cubic" ? [-1.5, -3, -.5] : mode === "exp" ? [0, -2, 1.5] : [2, .5, 6]; };
    choice(o, [["cubic", inl("\\tfrac{x^3}{4}-x"), inl("\\tfrac{x^3}{4}-x")], ["exp", inl("\\exp"), inl("\\exp")], ["ln", inl("\\ln"), inl("\\ln")]], mode, k => { mode = k; reset(); o.redraw(); });
    const lo = () => (mode === "ln" ? .2 : F[mode][3][0] + .25), hi = () => F[mode][3][1] - .25;
    return {
      handles() {
        const [f] = F[mode], V = view(o, ...F[mode][3]), x = X => clamp(snap(V.iX(X), .1), lo(), hi());
        return [{ x: V.X(m), y: V.Y(f(m)), cur: "ew-resize", move(X) { m = x(X); } }, { x: V.X(xa), y: V.Y(f(xa)), cur: "ew-resize", move(X) { xa = Math.min(x(X), xb - .2); } }, { x: V.X(xb), y: V.Y(f(xb)), cur: "ew-resize", move(X) { xb = Math.max(x(X), xa + .2); } }];
      },
      draw(g) {
        const [f, df, d2f, box, name] = F[mode], V = view(o, ...box), N = o.tn; axes(g, V, { lang: o.L });
        const a0 = mode === "ln" ? .02 : box[0];
        for (let i = 0; i < 200; i++) { const x = a0 + (box[1] - a0) * (i + .5) / 200; g.fillStyle = d2f(x) > 1e-9 ? C.acc : d2f(x) < -1e-9 ? C.warn : C.muted; g.fillRect(V.X(x), o.H - V.pad + 8, (V.X(box[1]) - V.X(a0)) / 200 + .5, 6); }
        g.save(); g.beginPath(); g.rect(V.pad, V.pad, o.W - 2 * V.pad, o.H - 2 * V.pad); g.clip();
        curve(g, V, x => (mode === "ln" && x <= 0 ? NaN : f(x)), a0, box[1]);
        curve(g, V, x => f(m) + df(m) * (x - m), box[0], box[1], C.blue, 2);
        const slope = (f(xb) - f(xa)) / (xb - xa), chord = x => f(xa) + slope * (x - xa); curve(g, V, chord, xa, xb, C.warn, 2.5); g.restore();
        if (mode === "cubic") { dot(o, V.X(0), V.Y(0), C.muted, "I", "default", false); }
        dot(o, V.X(m), V.Y(f(m)), C.blue, "M"); dot(o, V.X(xa), V.Y(f(xa)), C.warn, "A", "grab", true, -1); dot(o, V.X(xb), V.Y(f(xb)), C.warn, "B");
        let above = 0, below = 0; for (let i = 1; i < 100; i++) { const x = xa + (xb - xa) * i / 100, d = f(x) - chord(x); if (d > 1e-9) above++; else if (d < -1e-9) below++; }
        const k = d2f(m);
        const kk = inl(`f''(${N(m)})=${N(k)}`), MM = inl("M"), AA = inl("A"), BB = inl("B"), iv_ = inl(tiv(o, "x_A", "x_B")), ff = inl("f");
        set(o, lines(inl(name), o.pair(`${kk} : ${k > 1e-9 ? `convexe près de ${MM}, courbe au-dessus de la tangente` : k < -1e-9 ? `concave près de ${MM}, courbe au-dessous de la tangente` : `${inl("f''")} s’annule en ${MM}`}.`, `${kk}: ${k > 1e-9 ? `convex near ${MM}, curve above the tangent` : k < -1e-9 ? `concave near ${MM}, curve below the tangent` : `${inl("f''")} vanishes at ${MM}`}.`),
          above && below ? o.pair(`Entre ${AA} et ${BB}, la courbe traverse la corde : ${ff} change de convexité sur ${iv_}.`, `Between ${AA} and ${BB} the curve crosses the chord: the convexity of ${ff} changes on ${iv_}.`) : below ? o.pair(`Entre ${AA} et ${BB}, la courbe est au-dessous de la corde (convexe sur cet intervalle).`, `Between ${AA} and ${BB} the curve lies below the chord (convex on this interval).`) : o.pair(`Entre ${AA} et ${BB}, la courbe est au-dessus de la corde (concave sur cet intervalle).`, `Between ${AA} and ${BB} the curve lies above the chord (concave on this interval).`),
          mode === "cubic" ? o.pair(`${inl(`I${tpt(o, 0, 0)}`)} : ${inl("f''")} s’annule en changeant de signe (point d’inflexion).`, `${inl(`I${tpt(o, 0, 0)}`)}: ${inl("f''")} vanishes and changes sign (inflection point).`) : "",
          o.pair(`Bande : vert ${inl("f''>0")}, orange ${inl("f''<0")}.`, `Strip: green ${inl("f''>0")}, orange ${inl("f''<0")}.`)));
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
        line(df(a), C.acc, 2.5); line(m, C.warn, 2.5); dot(o, V.X(a), V.Y(f(a)), C.acc, "M"); dot(o, V.X(a + h), V.Y(f(a + h)), C.warn, "N"); const N = o.tn;
        set(o, lines(o.pair(`Taux d’accroissement : ${inl(`\\dfrac{f(a+h)-f(a)}{h}=${N(m)}`)}`, `Rate of change: ${inl(`\\dfrac{f(a+h)-f(a)}{h}=${N(m)}`)}`), inl(`f'(${N(a)})=${N(df(a))}`), o.pair(`Rapprochez ${inl("N")} de ${inl("M")} : la sécante tend vers la tangente.`, `Move ${inl("N")} towards ${inl("M")}: the secant tends to the tangent.`), inl("f(x)=\\dfrac{x^3}{4}-x")));
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
        const N = o.tn, deg = th * 180 / Math.PI, k = Math.round(deg / 15), fr = (a, b) => { const g_ = (p, q) => q ? g_(q, p % q) : p, d = g_(a, b); a /= d; b /= d; return b === 1 ? (a === 1 ? "\\pi" : `${a}\\pi`) : `\\dfrac{${a === 1 ? "" : a}\\pi}{${b}}`; };
        const rad = k === 0 ? "0" : fr(k, 12);
        set(o, lines(o.pair(`Angle ${inl("\\theta")} : ${inl(`${N(deg, 0)}^\\circ=${rad}\\ \\mathrm{rad}`)}`, `Angle ${inl("\\theta")}: ${inl(`${N(deg, 0)}^\\circ=${rad}\\ \\mathrm{rad}`)}`), inl(`\\cos\\theta=${N(x)}`), inl(`\\sin\\theta=${N(y)}`), inl(`\\cos^2\\theta+\\sin^2\\theta=${N(x * x + y * y)}`), Math.abs(x) < 1e-9 ? o.pair(`${inl("\\tan\\theta")} : non définie`, `${inl("\\tan\\theta")}: undefined`) : inl(`\\tan\\theta=${N(y / x)}`)));
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
        const N = o.tn; let txt;
        if (sxx > 1e-9) { const a = sxy / sxx, b = my - a * mx; curve(g, V, x => a * x + b, 0, 8, C.warn, 2.5); const r = syy > 1e-9 ? sxy / Math.sqrt(sxx * syy) : NaN; txt = lines(o.pair(`Droite de régression : ${inl(`y=${tpoly([[a, "x"], [b, ""]], N)}`)}`, `Regression line: ${inl(`y=${tpoly([[a, "x"], [b, ""]], N)}`)}`), o.pair(`Coefficient de corrélation ${inl(`r=${N(r, 3)}`)}`, `Correlation coefficient ${inl(`r=${N(r, 3)}`)}`), o.pair(`Point moyen ${inl(`G${tpt(o, mx, my)}`)}`, `Mean point ${inl(`G${tpt(o, mx, my)}`)}`)); }
        else txt = o.pair("Tous les x sont égaux : pas de droite de régression.", "All x are equal: no regression line.");
        P.forEach((p, i) => dot(o, V.X(p[0]), V.Y(p[1]), C.acc, "")); dot(o, V.X(mx), V.Y(my), C.ink, "G", "default", false); set(o, txt);
      },
    };
  },

  // Probability tree: draggable bars set P(A), P_A(B), P_notA(B).
  tree(o) {
    let pa = .6, pb1 = .7, pb2 = .2; const rows = () => [[60, "P(A)"], [200, "P_A(B)"], [340, "P_{\\overline{A}}(B)"]];
    const bx = 60, bw = o.W - 120;
    return {
      handles() { const bw_ = o.W - 120; return rows().map(([y], i) => ({ x: bx + [pa, pb1, pb2][i] * bw_, y: y + 18, cur: "ew-resize", move(X) { const val = clamp(snap((X - bx) / bw_, .05), 0, 1); if (i === 0) pa = val; else if (i === 1) pb1 = val; else pb2 = val; } })); },
      draw(g) {
        const bw_ = o.W - 120, N = o.tn;
        rows().forEach(([y, l], i) => { const val = [pa, pb1, pb2][i]; text(g, inl(`${l}=${N(val)}`), bx, y - 8, C.ink, 20); g.fillStyle = C.grid; g.fillRect(bx, y, bw_, 36); g.fillStyle = C.acc; g.fillRect(bx, y, val * bw_, 36); dot(o, bx + val * bw_, y + 18, C.warn); });
        const p = [pa * pb1, pa * (1 - pb1), (1 - pa) * pb2, (1 - pa) * (1 - pb2)], y0 = 400;
        p.forEach((q, i) => { const w = q * bw_; const x = bx + p.slice(0, i).reduce((s, z) => s + z, 0) * bw_; g.fillStyle = i % 2 ? C.warn : C.acc; g.globalAlpha = .55 + .1 * (i % 2); g.fillRect(x, y0, w, 30); g.globalAlpha = 1; });
        text(g, o.pair("Aire = probabilité du chemin", "Area = probability of the path"), bx, y0 + 52, C.muted, 16);
        const pB = p[0] + p[2];
        set(o, lines(inl(`P(A\\cap B)=${N(p[0], 3)}`), inl(`P(A\\cap\\overline{B})=${N(p[1], 3)}`), inl(`P(\\overline{A}\\cap B)=${N(p[2], 3)}`), inl(`P(\\overline{A}\\cap\\overline{B})=${N(p[3], 3)}`), o.pair(`Probabilités totales : ${inl(`P(B)=${N(pB, 3)}`)}`, `Total probability: ${inl(`P(B)=${N(pB, 3)}`)}`), pB > 0 ? inl(`P_B(A)=${N(p[0] / pB, 3)}`) : ""));
      },
    };
  },

  // Binomial distribution: draggable p, n slider (terminale / STMG only).
  binom(o) {
    let n = 10, p = .3; slider(o, inl("n"), 2, 30, 1, n, v => { n = v; o.redraw(); });
    const ch = k => { let r = 1; for (let i = 1; i <= k; i++) r = r * (n - k + i) / i; return r; };
    const v = () => view(o, -.5, n + .5, 0, 1, 40);
    return {
      handles() { const bw = o.W - 80; return [{ x: 40 + p * bw, y: o.H - 12, r: 26, cur: "ew-resize", move(X) { p = clamp(snap((X - 40) / bw, .01), .01, .99); } }]; },
      draw(g) {
        const pr = Array.from({ length: n + 1 }, (_, k) => ch(k) * p ** k * (1 - p) ** (n - k)), mx = Math.max(...pr) * 1.15, V = view(o, -.5, n + .5, 0, mx, 40);
        axes(g, { ...V, y1: mx }, { lang: o.L, sx: Math.max(1, Math.round(n / 10)), sy: 1e9, noLabels: false });
        pr.forEach((q, k) => { const x = V.X(k), w = Math.max(3, (V.X(1) - V.X(0)) * .7); g.fillStyle = C.acc; g.fillRect(x - w / 2, V.Y(q), w, V.Y(0) - V.Y(q)); });
        g.fillStyle = C.grid; g.fillRect(40, o.H - 18, o.W - 80, 6); g.fillStyle = C.acc; g.fillRect(40, o.H - 18, p * (o.W - 80), 6); dot(o, 40 + p * (o.W - 80), o.H - 15, C.warn, "p");
        const N = o.tn; set(o, lines(inl(`X\\sim\\mathcal{B}${tpt(o, n, p)}`), o.pair(`Espérance ${inl(`E(X)=np=${N(n * p)}`)}`, `Expected value ${inl(`E(X)=np=${N(n * p)}`)}`), o.pair(`Variance ${inl(`V(X)=np(1-p)=${N(n * p * (1 - p))}`)}`, `Variance ${inl(`V(X)=np(1-p)=${N(n * p * (1 - p))}`)}`)));
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
        g.save(); g.strokeStyle = C.ink; g.setLineDash([6, 5]); g.beginPath(); g.moveTo(V.X(E), V.Y(0)); g.lineTo(V.X(E), V.Y(1)); g.stroke(); g.restore(); text(g, inl("E(X)"), V.X(E) + 6, V.Y(.95), C.ink, 16);
        const N = o.tn; set(o, lines(p.map((q, i) => inl(`P(X=${xs[i]})=${N(q, 3)}`)).join("<br>"), inl(`E(X)=${N(E, 3)}`), inl(`V(X)=${N(Vr, 3)}`), inl(`\\sigma(X)=${N(Math.sqrt(Vr), 3)}`)));
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
        D.forEach(d => dot(o, V.X(d), V.Y(.62), C.acc)); const N = o.tn;
        set(o, lines(o.pair(`Moyenne ${inl(`\\bar{x}=${N(mean)}`)} (pointillés orange)`, `Mean ${inl(`\\bar{x}=${N(mean)}`)} (orange dashes)`), o.pair(`Médiane : ${inl(N(med))}`, `Median: ${inl(N(med))}`), inl(`Q_1=${N(q1)},\\ Q_3=${N(q3)}`), o.pair(`Écart interquartile : ${inl(N(q3 - q1))}`, `Interquartile range: ${inl(N(q3 - q1))}`), o.pair(`Écart type ${inl(`\\sigma=${N(sd)}`)}`, `Standard deviation ${inl(`\\sigma=${N(sd)}`)}`)));
      },
    };
  },

  // Percentage change: draggable rate handles on two successive changes.
  pct(o) {
    let t1 = .2, t2 = -.2; const bx = 60; const Y1 = () => o.H * .17, Y2 = () => o.H * .38;
    return {
      handles() { const s = (o.W - 120) / 1.0; return [{ x: bx + (t1 + .5) * s, y: Y1(), cur: "ew-resize", move(X) { t1 = clamp(snap((X - bx) / s - .5, .01), -.5, .5); } }, { x: bx + (t2 + .5) * s, y: Y2(), cur: "ew-resize", move(X) { t2 = clamp(snap((X - bx) / s - .5, .01), -.5, .5); } }]; },
      draw(g) {
        const s = o.W - 120, N = o.tn; [[t1, Y1(), "t_1"], [t2, Y2(), "t_2"]].forEach(([t, y, l]) => { g.fillStyle = C.grid; g.fillRect(bx, y - 4, s, 8); g.fillStyle = C.axis; g.fillRect(bx + s / 2 - 1, y - 14, 2, 28); dot(o, bx + (t + .5) * s, y, C.acc); text(g, inl(`${l}=${N(t * 100, 0)}\\,\\%`), bx, y - 26, C.ink, 20); });
        const cm = (1 + t1) * (1 + t2); const y0 = o.H * .56, step = o.H * .1, bh = o.H * .07; [["100", 100], [o.num(100 * (1 + t1), 1), 100 * (1 + t1)], [o.num(100 * cm, 1), 100 * cm]].forEach(([l, v], i) => { const w = v / 150 * s; g.fillStyle = i === 2 ? C.warn : C.acc; g.globalAlpha = .8; g.fillRect(bx, y0 + i * step, w, bh); g.globalAlpha = 1; text(g, l, bx + w + 10, y0 + i * step + bh * .75, C.ink, 18); });
        set(o, lines(inl(`CM_1=1${sgn(t1)}${N(Math.abs(t1), 2)}=${N(1 + t1, 3)}`), inl(`CM_2=1${sgn(t2)}${N(Math.abs(t2), 2)}=${N(1 + t2, 3)}`), o.pair(`Coefficient global : ${inl(N(cm, 4))}`, `Overall multiplier: ${inl(N(cm, 4))}`), o.pair(`Évolution globale : ${inl(`${N((cm - 1) * 100, 2)}\\,\\%`)}`, `Overall change: ${inl(`${N((cm - 1) * 100, 2)}\\,\\%`)}`), Math.abs(cm - 1) > 1e-9 ? o.pair(`Taux réciproque : ${inl(`${N((1 / cm - 1) * 100, 2)}\\,\\%`)}`, `Reverse rate: ${inl(`${N((1 / cm - 1) * 100, 2)}\\,\\%`)}`) : ""));
      },
    };
  },

  // Reference functions: draggable point on the curve; image, preimages.
  ref(o) {
    let kind = "square", x0 = 1.5; const F = { square: x => x * x, inverse: x => 1 / x, sqrt: x => Math.sqrt(x), cube: x => x ** 3, abs: x => Math.abs(x), affine: x => 0.5 * x + 1 }; const v = () => view(o, -5, 5, -5, 5);
    choice(o, [["square", inl("x^2"), inl("x^2")], ["inverse", inl("\\tfrac{1}{x}"), inl("\\tfrac{1}{x}")], ["sqrt", inl("\\sqrt{x}"), inl("\\sqrt{x}")], ["cube", inl("x^3"), inl("x^3")], ["abs", inl("|x|"), inl("|x|")], ["affine", inl("ax+b"), inl("ax+b")]], kind, k => { kind = k; x0 = k === "sqrt" ? 2 : 1.5; o.redraw(); });
    return {
      handles() { const V = v(), y = F[kind](x0); return Number.isFinite(y) ? [{ x: V.X(x0), y: V.Y(clamp(y, -5, 5)), cur: "ew-resize", move(X) { let t = snap(V.iX(X), .25); if (kind === "inverse" && Math.abs(t) < .25) t = t < 0 ? -.25 : .25; if (kind === "sqrt") t = Math.max(0, t); x0 = clamp(t, -4.75, 4.75); } }] : []; },
      draw(g) {
        const V = v(), f = F[kind], N = o.tn; axes(g, V, { lang: o.L });
        if (kind === "inverse") { curve(g, V, f, -5, -.1); curve(g, V, f, .1, 5); } else curve(g, V, f, kind === "sqrt" ? 0 : -5, 5);
        const y = f(x0); g.save(); g.strokeStyle = C.warn; g.setLineDash([6, 5]); g.lineWidth = 2; g.beginPath(); g.moveTo(V.X(x0), V.Y(0)); g.lineTo(V.X(x0), V.Y(clamp(y, -5, 5))); g.lineTo(V.X(0), V.Y(clamp(y, -5, 5))); g.stroke(); g.restore(); dot(o, V.X(x0), V.Y(clamp(y, -5, 5)), C.acc, "M");
        let pre; if (kind === "square") pre = y > 0 ? [-Math.sqrt(y), Math.sqrt(y)] : [0]; else if (kind === "abs") pre = y > 0 ? [-y, y] : [0]; else if (kind === "inverse") pre = [1 / y]; else if (kind === "sqrt") pre = [y * y]; else if (kind === "cube") pre = [Math.cbrt(y)]; else pre = [(y - 1) / .5];
        set(o, lines(o.pair(`Image de ${inl(N(x0))} : ${inl(`f(${N(x0)})=${N(y, 3)}`)}`, `Image of ${inl(N(x0))}: ${inl(`f(${N(x0)})=${N(y, 3)}`)}`), o.pair(`Antécédent(s) de ${inl(N(y, 3))} : ${pre.map(q => inl(N(q, 3))).join(" ; ")}`, `Preimage(s) of ${inl(N(y, 3))}: ${pre.map(q => inl(N(q, 3))).join(", ")}`), kind === "square" ? o.pair(`Décroissante sur ${inl(tiv(o, "-\\infty", 0, false, true))}, croissante sur ${inl(tiv(o, 0, "+\\infty", true, false))}.`, `Decreasing on ${inl(tiv(o, "-\\infty", 0, false, true))}, increasing on ${inl(tiv(o, 0, "+\\infty", true, false))}.`) : kind === "inverse" ? o.pair(`Décroissante sur chaque intervalle, définie sur ${inl("\\mathbb{R}^*")}.`, `Decreasing on each interval, defined on ${inl("\\mathbb{R}\\setminus\\{0\\}")}.`) : ""));
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
        const N = o.tn, br = tiv(o, a, b), br2 = tiv(o, c, d), cx = (a + b) / 2, xc = Math.abs(cx) < 1e-9 ? "x" : `x${cx < 0 ? "+" : "-"}${N(Math.abs(cx))}`;
        set(o, lines(inl(`I=${br}`), inl(`J=${br2}`), inl(`I\\cap J=${lo <= hi ? tiv(o, lo, hi) : "\\varnothing"}`), inl(lo <= hi ? `I\\cup J=${tiv(o, Math.min(a, c), Math.max(b, d))}` : `I\\cup J=${br}\\cup ${br2}`), o.pair(`${inl(`|${xc}|\\leqslant ${N((b - a) / 2)}`)} décrit ${inl("I")}`, `${inl(`|${xc}|\\leq ${N((b - a) / 2)}`)} describes ${inl("I")}`)));
      },
    };
  },
  // Riemann sums for f(x) = 0.25x^2 - x + 2 with draggable bounds and a slider for the number of rectangles.
  integral(o) {
    const f = x => x * x / 4 - x + 2, F = x => x ** 3 / 12 - x * x / 2 + 2 * x; let a = 0.5, b = 4.5, n = 6; const v = () => view(o, -1, 7, -1, 6);
    slider(o, inl("n"), 1, 40, 1, n, q => { n = q; o.redraw(); });
    return {
      handles() { const V = v(); return [{ x: V.X(a), y: V.Y(0), cur: "ew-resize", move(X) { a = clamp(snap(V.iX(X), .25), -.75, b - .5); } }, { x: V.X(b), y: V.Y(0), cur: "ew-resize", move(X) { b = clamp(snap(V.iX(X), .25), a + .5, 6.75); } }];},
      draw(g) {
        const V = v(); axes(g, V, { lang: o.L }); const w = (b - a) / n; let S = 0;
        for (let i = 0; i < n; i++) { const x = a + i * w, y = f(x + w / 2); S += y * w; g.fillStyle = "rgba(111,211,176,.28)"; g.strokeStyle = C.acc; g.lineWidth = 1; g.fillRect(V.X(x), V.Y(y), V.X(x + w) - V.X(x), V.Y(0) - V.Y(y)); g.strokeRect(V.X(x), V.Y(y), V.X(x + w) - V.X(x), V.Y(0) - V.Y(y)); }
        curve(g, V, f, -1, 7); dot(o, V.X(a), V.Y(0), C.warn, "a"); dot(o, V.X(b), V.Y(0), C.warn, "b"); const N = o.tn, I = F(b) - F(a);
        set(o, lines(inl("f(x)=\\dfrac{x^2}{4}-x+2"), o.pair(`Somme de Riemann (milieux) : ${inl(N(S, 4))}`, `Riemann sum (midpoints): ${inl(N(S, 4))}`), inl(`\\int_a^b f(x)\\,\\mathrm{d}x=F(b)-F(a)=${N(I, 4)}`), o.pair(`Écart : ${inl(N(Math.abs(S - I), 4))}`, `Gap: ${inl(N(Math.abs(S - I), 4))}`)));
      },
    };
  },
};
