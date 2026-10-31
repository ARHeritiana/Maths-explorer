// Smooth display mesh of the certified Gömböc analogue (pure, no DOM; tested in tests/gomboc.test.mjs).
//
// The certified body is a convex polytope with 113,888 vertices, each joined to exactly three neighbours (it is "simple"),
// and 56,946 faces. The faces are recovered from that adjacency alone: at every vertex the three neighbours are put in
// counter-clockwise order (seen from outside, using the sign of the determinant of the three edges), and the face to the
// left of a directed edge u -> v continues with the neighbour of v that comes just before u in that order. Every face is
// then fan-triangulated, and each vertex gets one normal, the average of the normals of its three faces weighted by the
// angle each face makes at the vertex. Sharing that normal between faces is what hides the facets: the surface is drawn
// as the smooth body it approximates (the facets are far below the size of a pixel) and no edge appears.

export function buildSmoothMesh(body) {
  const n = body.count, V = body.vertices, N = body.neighbours;
  const vx = (i) => V[3 * i], vy = (i) => V[3 * i + 1], vz = (i) => V[3 * i + 2];
  // counter-clockwise order of the three neighbour slots at each vertex
  const order = new Uint8Array(n * 3);
  for (let v = 0; v < n; v++) {
    const e = [0, 1, 2].map((k) => { const j = N[3 * v + k]; return [vx(j) - vx(v), vy(j) - vy(v), vz(j) - vz(v)]; });
    const det = e[0][0] * (e[1][1] * e[2][2] - e[1][2] * e[2][1]) - e[0][1] * (e[1][0] * e[2][2] - e[1][2] * e[2][0]) + e[0][2] * (e[1][0] * e[2][1] - e[1][1] * e[2][0]);
    // det < 0: slots 0, 1, 2 are counter-clockwise seen from outside; otherwise swap two of them
    if (det < 0) { order[3 * v] = 0; order[3 * v + 1] = 1; order[3 * v + 2] = 2; } else { order[3 * v] = 0; order[3 * v + 1] = 2; order[3 * v + 2] = 1; }
  }
  const slotOf = (v, u) => { for (let k = 0; k < 3; k++) if (N[3 * v + k] === u) return k; return -1; };
  const posIn = (v, slot) => { for (let p = 0; p < 3; p++) if (order[3 * v + p] === slot) return p; return -1; };
  const seen = new Uint8Array(n * 3), faces = [];
  for (let u0 = 0; u0 < n; u0++) for (let k0 = 0; k0 < 3; k0++) {
    if (seen[3 * u0 + k0]) continue;
    const face = [];
    let u = u0, k = k0, guard = 0;
    do {
      seen[3 * u + k] = 1; face.push(u);
      const v = N[3 * u + k], back = slotOf(v, u), p = posIn(v, back);
      k = order[3 * v + ((p + 2) % 3)]; u = v;
      if (++guard > 5000) throw new Error('Face walk does not close');
    } while (u !== u0 || k !== k0);
    faces.push(face);
  }
  // normals: angle-weighted average of the face normals at each vertex
  const normals = new Float32Array(n * 3), acc = new Float64Array(n * 3);
  let triangles = 0;
  for (const f of faces) {
    triangles += f.length - 2;
    let nx = 0, ny = 0, nz = 0;   // Newell's normal of the face
    for (let i = 0; i < f.length; i++) {
      const a = f[i], b = f[(i + 1) % f.length];
      nx += (vy(a) - vy(b)) * (vz(a) + vz(b)); ny += (vz(a) - vz(b)) * (vx(a) + vx(b)); nz += (vx(a) - vx(b)) * (vy(a) + vy(b));
    }
    const len = Math.hypot(nx, ny, nz) || 1; nx /= len; ny /= len; nz /= len;
    for (let i = 0; i < f.length; i++) {
      const v = f[i], p = f[(i + f.length - 1) % f.length], q = f[(i + 1) % f.length];
      const ax = vx(p) - vx(v), ay = vy(p) - vy(v), az = vz(p) - vz(v), bx = vx(q) - vx(v), by = vy(q) - vy(v), bz = vz(q) - vz(v);
      const la = Math.hypot(ax, ay, az), lb = Math.hypot(bx, by, bz);
      const w = la && lb ? Math.acos(Math.max(-1, Math.min(1, (ax * bx + ay * by + az * bz) / (la * lb)))) : 0;
      acc[3 * v] += nx * w; acc[3 * v + 1] += ny * w; acc[3 * v + 2] += nz * w;
    }
  }
  for (let v = 0; v < n; v++) {
    const l = Math.hypot(acc[3 * v], acc[3 * v + 1], acc[3 * v + 2]) || 1;
    normals[3 * v] = acc[3 * v] / l; normals[3 * v + 1] = acc[3 * v + 1] / l; normals[3 * v + 2] = acc[3 * v + 2] / l;
  }
  const indices = new Uint32Array(triangles * 3);
  let at = 0;
  for (const f of faces) for (let i = 1; i + 1 < f.length; i++) { indices[at++] = f[0]; indices[at++] = f[i]; indices[at++] = f[i + 1]; }
  return { positions: Float32Array.from(V), normals, indices, faces: faces.length, vertices: n, triangles };
}
