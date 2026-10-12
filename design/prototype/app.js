/* Maths Explorer v2 prototype. No dependencies. */
(function () {
  "use strict";
  var NS = "http://www.w3.org/2000/svg";
  var MINUS = "−";

  function el(name, attrs, parent) {
    var n = document.createElementNS(NS, name);
    for (var k in attrs) n.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(n);
    return n;
  }
  function fmt(x) { // French number: decimal comma, true minus
    var r = Math.round(x * 100) / 100;
    var s = String(r).replace(".", ",");
    return s.charAt(0) === "-" ? MINUS + s.slice(1) : s;
  }
  function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }
  function debounce(fn, ms) { var t; return function () { var a = arguments; clearTimeout(t); t = setTimeout(function () { fn.apply(null, a); }, ms); }; }

  /* ---------- Menu and themes ---------- */
  var root = document.documentElement;
  var menuBtn = document.querySelector(".menu-btn");
  var panel = document.getElementById("panel");
  menuBtn.addEventListener("click", function () {
    var open = panel.classList.toggle("open");
    menuBtn.setAttribute("aria-expanded", String(open));
  });
  panel.addEventListener("click", function (e) {
    if (e.target.closest("nav a")) { panel.classList.remove("open"); menuBtn.setAttribute("aria-expanded", "false"); }
  });

  var themeBtns = document.querySelectorAll("[data-theme-btn]");
  function setTheme(t) {
    root.setAttribute("data-theme", t);
    themeBtns.forEach(function (b) { b.setAttribute("aria-pressed", String(b.dataset.themeBtn === t)); });
    try { localStorage.setItem("me-theme", t); } catch (e) {}
  }
  themeBtns.forEach(function (b) { b.addEventListener("click", function () { setTheme(b.dataset.themeBtn); }); });
  setTheme(root.getAttribute("data-theme") || "marine");

  /* ---------- Generic draggable handle (pointer + keyboard) ---------- */
  function makeHandle(parent, opts) {
    // opts: label, cls, onMove(dx,dy) for keyboard, onDrag(svgPoint)
    var g = el("g", { "class": "handle " + (opts.cls || ""), tabindex: "0", role: "slider", "aria-label": opts.label }, parent);
    el("circle", { "class": "hit", r: 26 }, g);
    el("circle", { "class": "ring", r: 15 }, g);
    el("circle", { "class": "dot", r: 9 }, g);
    var svg = parent.ownerSVGElement;
    function pt(e) {
      var p = svg.createSVGPoint(); p.x = e.clientX; p.y = e.clientY;
      return p.matrixTransform(svg.getScreenCTM().inverse());
    }
    g.addEventListener("pointerdown", function (e) {
      g.setPointerCapture(e.pointerId); g.focus({ preventScroll: true });
      g._drag = true; opts.onDrag(pt(e)); e.preventDefault();
    });
    g.addEventListener("pointermove", function (e) { if (g._drag) opts.onDrag(pt(e)); });
    function end() { g._drag = false; }
    g.addEventListener("pointerup", end); g.addEventListener("pointercancel", end);
    g.addEventListener("keydown", function (e) {
      var s = e.shiftKey ? 4 : 1, d = null;
      if (e.key === "ArrowLeft") d = [-s, 0]; else if (e.key === "ArrowRight") d = [s, 0];
      else if (e.key === "ArrowUp") d = [0, s]; else if (e.key === "ArrowDown") d = [0, -s];
      if (d) { opts.onKey(d[0], d[1]); e.preventDefault(); }
    });
    return g;
  }

  /* ---------- Parabola ---------- */
  (function () {
    var svg = document.getElementById("parabola");
    var X0 = 320, Y0 = 280, U = 50, V = 40; // origin px, px per unit
    var sx = function (x) { return X0 + x * U; }, sy = function (y) { return Y0 - y * V; };
    var gridG = document.getElementById("p-grid");
    var curveG = document.getElementById("p-curve-g");
    var signsG = document.getElementById("p-signs");
    var handG = document.getElementById("p-handles");
    var state = { a: 1, x1: -2, x2: 3 };

    for (var x = -6; x <= 6; x++) el("line", { "class": "g-grid", x1: sx(x), y1: 0, x2: sx(x), y2: 460 }, gridG);
    for (var y = -6; y <= 8; y++) el("line", { "class": "g-grid", x1: 0, y1: sy(y), x2: 640, y2: sy(y) }, gridG);
    el("line", { "class": "g-axis", x1: 0, y1: Y0, x2: 640, y2: Y0 }, gridG);
    el("line", { "class": "g-axis", x1: X0, y1: 0, x2: X0, y2: 460 }, gridG);
    [-5, -3, -1, 1, 3, 5].forEach(function (t) {
      var tx = el("text", { "class": "g-tick", x: sx(t), y: Y0 + 34, "text-anchor": "middle" }, gridG);
      tx.textContent = fmt(t);
    });

    var curve = el("path", { "class": "g-curve" }, curveG);
    var bandIn = el("line", { "class": "g-curve g-band", y1: Y0, y2: Y0 }, signsG);
    var bandL = el("line", { "class": "g-curve g-band", y1: Y0, y2: Y0 }, signsG);
    var bandR = el("line", { "class": "g-curve g-band", y1: Y0, y2: Y0 }, signsG);
    var sgnL = el("text", { "class": "g-sign", y: Y0 + 66 }, signsG);
    var sgnM = el("text", { "class": "g-sign", y: Y0 + 66 }, signsG);
    var sgnR = el("text", { "class": "g-sign", y: Y0 + 66 }, signsG);
    sgnL.textContent = sgnM.textContent = sgnR.textContent = "";
    // Hidden sign marks are drawn only if roots are apart.
    var h1 = makeHandle(handG, {
      label: "Première racine", cls: "",
      onDrag: function (p) { state.x1 = snap(p.x); render(); },
      onKey: function (dx) { state.x1 = clamp(state.x1 + dx * 0.5, -5.5, 5.5); render(); }
    });
    var h2 = makeHandle(handG, {
      label: "Deuxième racine", cls: "ink",
      onDrag: function (p) { state.x2 = snap(p.x); render(); },
      onKey: function (dx) { state.x2 = clamp(state.x2 + dx * 0.5, -5.5, 5.5); render(); }
    });
    function snap(px) { return clamp(Math.round(((px - X0) / U) * 2) / 2, -5.5, 5.5); }

    var range = document.getElementById("a-range"), aOut = document.getElementById("a-out");
    range.addEventListener("input", function () {
      var v = parseFloat(range.value);
      if (v === 0) v = 0.5;
      state.a = v; render();
    });

    function term(c, v) { // coefficient c with variable v, simplified
      if (c === 0) return "";
      var abs = Math.abs(c), sign = c < 0 ? MINUS : "+";
      var num = abs === 1 && v ? "" : fmt(abs);
      return { sign: sign, body: num + v };
    }
    function poly(a, b, c) {
      var parts = [term(a, "x²"), term(b, "x"), term(c, "")].filter(Boolean);
      if (!parts.length) return "0";
      var s = "";
      parts.forEach(function (p, i) {
        if (i === 0) s += (p.sign === MINUS ? MINUS : "") + p.body;
        else s += " " + p.sign + " " + p.body;
      });
      return s;
    }
    function factor() {
      var a = state.a, r1 = state.x1, r2 = state.x2;
      function lin(r) { return r === 0 ? "x" : "(x " + (r < 0 ? "+" : MINUS) + " " + fmt(Math.abs(r)) + ")"; }
      var pre = a === 1 ? "" : a === -1 ? MINUS : fmt(a);
      return "f(x) = " + pre + lin(r1) + lin(r2);
    }
    var announce = debounce(function (t) { document.getElementById("p-live").textContent = t; }, 400);

    function render() {
      var a = state.a, s = state.x1 + state.x2, p = state.x1 * state.x2;
      var b = -a * s, c = a * p, delta = b * b - 4 * a * c;
      aOut.textContent = fmt(a);
      // curve
      var d = "";
      for (var px = 0; px <= 640; px += 4) {
        var x = (px - X0) / U, y = a * (x - state.x1) * (x - state.x2);
        d += (px === 0 ? "M" : "L") + px + " " + sy(y).toFixed(1);
      }
      curve.setAttribute("d", d);
      var lo = Math.min(state.x1, state.x2), hi = Math.max(state.x1, state.x2);
      // position handles
      h1.setAttribute("transform", "translate(" + sx(state.x1) + " " + Y0 + ")");
      h2.setAttribute("transform", "translate(" + sx(state.x2) + " " + Y0 + ")");
      h1.setAttribute("aria-valuenow", state.x1); h2.setAttribute("aria-valuenow", state.x2);
      h1.setAttribute("aria-valuetext", "x = " + fmt(state.x1)); h2.setAttribute("aria-valuetext", "x = " + fmt(state.x2));
      // sign bands: where f is positive (green) or negative (red) along the axis
      var insideNeg = a > 0; // between roots f has the sign of -a
      function band(line, x1, x2, positive) {
        line.setAttribute("x1", clamp(sx(x1), 0, 640)); line.setAttribute("x2", clamp(sx(x2), 0, 640));
        line.setAttribute("class", "g-curve g-band " + (positive ? "g-pos" : "g-neg"));
        line.style.display = x2 > x1 ? "" : "none";
      }
      band(bandIn, lo, hi, !insideNeg);
      band(bandL, -7, lo, insideNeg);
      band(bandR, hi, 7, insideNeg);
      var gap = sx(hi) - sx(lo);
      function sign(t, x, positive) {
        t.setAttribute("x", clamp(x, 20, 620));
        t.textContent = positive ? "+" : MINUS;
        t.setAttribute("class", "g-sign " + (positive ? "pos" : "neg"));
      }
      sign(sgnL, (sx(lo) + 0) / 2 > 30 ? sx(lo) / 2 : 24, insideNeg);
      sign(sgnR, (sx(hi) + 640) / 2, insideNeg);
      sign(sgnM, (sx(lo) + sx(hi)) / 2, !insideNeg);
      sgnM.style.display = gap > 36 ? "" : "none";
      sgnL.style.display = sx(lo) > 60 ? "" : "none";
      sgnR.style.display = sx(hi) < 580 ? "" : "none";
      // readout
      document.getElementById("r-fact").textContent = factor();
      document.getElementById("r-dev").textContent = "f(x) = " + poly(a, b, c);
      var dd = document.getElementById("r-delta");
      var kind = delta > 0 ? "deux racines distinctes" : delta === 0 ? "une racine double" : "";
      dd.innerHTML = "";
      dd.appendChild(document.createTextNode("Δ = " + fmt(delta) + ", "));
      var sp = document.createElement("span"); sp.className = delta === 0 ? "warn" : "ok"; sp.textContent = delta === 0 ? "racine double" : "deux racines distinctes";
      dd.appendChild(sp);
      announce(factor() + ". Discriminant " + fmt(delta) + ", " + kind + ".");
    }
    render();
  })();

  /* ---------- Determinant ---------- */
  (function () {
    var X0 = 320, Y0 = 210, U = 50;
    var sx = function (x) { return X0 + x * U; }, sy = function (y) { return Y0 - y * U; };
    var gridG = document.getElementById("d-grid"), shapeG = document.getElementById("d-shape"), handG = document.getElementById("d-handles");
    var st = { ux: 3, uy: 1, vx: 1, vy: 2 };
    for (var x = -6; x <= 6; x++) el("line", { "class": "g-grid", x1: sx(x), y1: 0, x2: sx(x), y2: 420 }, gridG);
    for (var y = -4; y <= 4; y++) el("line", { "class": "g-grid", x1: 0, y1: sy(y), x2: 640, y2: sy(y) }, gridG);
    el("line", { "class": "g-axis", x1: 0, y1: Y0, x2: 640, y2: Y0 }, gridG);
    el("line", { "class": "g-axis", x1: X0, y1: 0, x2: X0, y2: 420 }, gridG);

    var area = el("polygon", { "class": "g-area" }, shapeG);
    var vu = el("line", { "class": "g-vec g-vec-u" }, shapeG);
    var vv = el("line", { "class": "g-vec g-vec-v" }, shapeG);
    var hu = makeHandle(handG, {
      label: "Vecteur u", cls: "",
      onDrag: function (p) { setFromPoint("u", p); },
      onKey: function (dx, dy) { st.ux = clamp(st.ux + dx, -5, 5); st.uy = clamp(st.uy + dy, -3, 3); render(); }
    });
    var hv = makeHandle(handG, {
      label: "Vecteur v", cls: "ink",
      onDrag: function (p) { setFromPoint("v", p); },
      onKey: function (dx, dy) { st.vx = clamp(st.vx + dx, -5, 5); st.vy = clamp(st.vy + dy, -3, 3); render(); }
    });
    function setFromPoint(w, p) {
      var gx = clamp(Math.round((p.x - X0) / U), -5, 5), gy = clamp(Math.round((Y0 - p.y) / U), -3, 3);
      if (w === "u") { st.ux = gx; st.uy = gy; } else { st.vx = gx; st.vy = gy; }
      render();
    }
    var announce = debounce(function (t) { document.getElementById("d-live").textContent = t; }, 400);

    function render() {
      var det = st.ux * st.vy - st.uy * st.vx;
      var P = [[0, 0], [st.ux, st.uy], [st.ux + st.vx, st.uy + st.vy], [st.vx, st.vy]].map(function (q) { return sx(q[0]) + "," + sy(q[1]); }).join(" ");
      area.setAttribute("points", P);
      area.style.fillOpacity = det === 0 ? 0 : .2;
      vu.setAttribute("x1", sx(0)); vu.setAttribute("y1", sy(0)); vu.setAttribute("x2", sx(st.ux)); vu.setAttribute("y2", sy(st.uy));
      vv.setAttribute("x1", sx(0)); vv.setAttribute("y1", sy(0)); vv.setAttribute("x2", sx(st.vx)); vv.setAttribute("y2", sy(st.vy));
      hu.setAttribute("transform", "translate(" + sx(st.ux) + " " + sy(st.uy) + ")");
      hv.setAttribute("transform", "translate(" + sx(st.vx) + " " + sy(st.vy) + ")");
      hu.setAttribute("aria-valuetext", "(" + fmt(st.ux) + " ; " + fmt(st.uy) + ")");
      hv.setAttribute("aria-valuetext", "(" + fmt(st.vx) + " ; " + fmt(st.vy) + ")");
      hu.setAttribute("aria-valuenow", st.ux); hv.setAttribute("aria-valuenow", st.vx);
      document.getElementById("d-vec").textContent = "u(" + fmt(st.ux) + " ; " + fmt(st.uy) + "), v(" + fmt(st.vx) + " ; " + fmt(st.vy) + ")";
      var dEl = document.getElementById("d-det");
      dEl.textContent = fmt(st.ux) + " × " + fmt(st.vy) + " " + MINUS + " " + (st.uy < 0 ? "(" + fmt(st.uy) + ")" : fmt(st.uy)) + " × " + (st.vx < 0 ? "(" + fmt(st.vx) + ")" : fmt(st.vx)) + " = " + fmt(det);
      var aEl = document.getElementById("d-area");
      aEl.textContent = det === 0 ? "0 : vecteurs colinéaires" : fmt(Math.abs(det)) + (det > 0 ? " (sens direct)" : " (sens indirect)");
      aEl.className = det === 0 ? "warn" : "ok";
      announce("Déterminant " + fmt(det) + (det === 0 ? ", les vecteurs sont colinéaires." : "."));
    }
    render();
  })();

  /* ---------- Chapters ---------- */
  (function () {
    var tabsEl = document.getElementById("tabs"), list = document.getElementById("chap-list");
    var data = null, cur = 0, tabs = [];
    function paint() {
      var lvl = data[cur];
      list.innerHTML = "";
      lvl.items.forEach(function (it) { var li = document.createElement("li"); li.textContent = it.title; list.appendChild(li); });
      list.setAttribute("aria-label", lvl.label);
      tabs.forEach(function (b, i) { b.setAttribute("aria-selected", String(i === cur)); b.tabIndex = i === cur ? 0 : -1; });
    }
    function build() {
      data.forEach(function (lvl, i) {
        var b = document.createElement("button");
        b.type = "button"; b.setAttribute("role", "tab");
        b.appendChild(document.createTextNode(lvl.label));
        var c = document.createElement("span"); c.className = "count"; c.textContent = String(lvl.items.length); b.appendChild(c);
        b.addEventListener("click", function () { cur = i; paint(); });
        tabsEl.appendChild(b); tabs.push(b);
      });
      tabsEl.addEventListener("keydown", function (e) {
        var d = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
        if (!d) return;
        cur = (cur + d + tabs.length) % tabs.length; paint(); tabs[cur].focus(); e.preventDefault();
      });
      paint();
    }
    fetch("chapters.json").then(function (r) { return r.json(); }).then(function (j) { data = j; build(); })
      .catch(function () { list.innerHTML = "<li>Liste indisponible hors serveur. Lancez un serveur local.</li>"; });
  })();
})();
