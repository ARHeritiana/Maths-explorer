#!/usr/bin/env python3
"""Package the MIT licensed certified polytope, with full contact geometry and a lighter drawing mesh.

Usage: python scripts/build-gomboc.py SOURCE_CHECKOUT CERTIFICATE_DIRECTORY
The certificate directory must be a completed local reproduction of the source verifier.
No networking or changes to the source checkout are performed.
"""
import hashlib
import json
from pathlib import Path
import shutil
import struct
import sys

import numpy as np
from scipy.spatial import ConvexHull

ROOT = Path(__file__).resolve().parents[1]


def build(source, certified):
    data = np.load(source / 'data/polytope_F56946.npz')
    normals, offs = data['normals'], data['offs']
    digest = hashlib.sha256(normals.astype('<f8').tobytes() + offs.astype('<f8').tobytes()).hexdigest()
    certificate = json.loads((certified / 'CERTIFICATE.json').read_text())
    if certificate['input_sha256'] != digest or [certificate[k] for k in ('S', 'H', 'U')] != [1, 0, 1]:
        raise ValueError('A completed certificate bound to this input is required')
    complex_ = np.load(certified / 'complex_certified.npz')
    if str(complex_['hs_hash']) != digest:
        raise ValueError('Boundary complex does not match the certified input')
    vertices, edges, simp = complex_['Vdbl'], complex_['edges'], complex_['simp']
    adjacency = [[] for _ in vertices]
    for a, b, _, _ in edges:
        adjacency[a].append(int(b)); adjacency[b].append(int(a))
    if any(len(a) != 3 for a in adjacency):
        raise ValueError('The certified simple-vertex graph must have degree three')
    incident = [[] for _ in normals]
    for v, planes in enumerate(simp):
        for p in planes:
            incident[p].append(v)
    volume = 0.; first = np.zeros(3); second = np.zeros((3, 3))
    for points in incident:
        chosen = set(points); cycle = [points[0]]; prev = -1
        while True:
            nxt = next((v for v in adjacency[cycle[-1]] if v in chosen and v != prev), None)
            if nxt == cycle[0]:
                break
            if nxt is None or nxt in cycle:
                raise ValueError('Broken face cycle')
            prev = cycle[-1]; cycle.append(nxt)
        if len(cycle) != len(points):
            raise ValueError('Incomplete face cycle')
        face = vertices[cycle]
        if np.linalg.det(face[:3]) < 0:
            face = face[::-1]
        a = face[0]
        for j in range(1, len(face) - 1):
            tet = np.array([a, face[j], face[j+1]])
            vol = np.linalg.det(tet) / 6
            if vol <= 0:
                raise ValueError('Invalid tetrahedron orientation')
            total = tet.sum(axis=0)
            volume += vol; first += vol * total / 4
            second += vol * (tet.T @ tet + np.outer(total, total)) / 20
    centroid = first / volume
    if abs(volume - certificate['volume'][0]) > 1e-10:
        raise ValueError('Integrated volume disagrees with the exact certificate')
    central_second = second / volume - np.outer(centroid, centroid)
    inertia = np.trace(central_second) * np.eye(3) - central_second
    if min(np.linalg.eigvalsh(inertia)) <= 0:
        raise ValueError('Inertia must be positive definite')
    centered = vertices - centroid
    # The smaller hull is for drawing only. The contact solver uses every original vertex.
    # Deterministic far-spaced input indices also retain both certified equilibrium supports.
    stable = int(certificate['stable_plane'][0]); unstable = int(certificate['unstable_vertex_oracle_index'][0])
    drawing_ids = np.unique(np.r_[np.linspace(0, len(vertices)-1, 1700).astype(int), incident[stable], unstable])
    hull = ConvexHull(centered[drawing_ids])
    drawing_ids = drawing_ids.astype('<u4')
    triangles = hull.simplices.astype('<u4')
    for i, tri in enumerate(triangles):
        p = centered[drawing_ids[tri]]
        if np.dot(np.cross(p[1]-p[0], p[2]-p[0]), p.mean(axis=0)) < 0:
            triangles[i] = tri[::-1]
    destination = ROOT / 'site/data/gomboc'
    destination.mkdir(parents=True, exist_ok=True)
    blob = (b'MXGOM01\0' + struct.pack('<III', len(vertices), len(drawing_ids), len(triangles)) + b'\0'*4
            + centered.astype('<f8').tobytes() + np.asarray(adjacency, dtype='<u4').tobytes()
            + drawing_ids.tobytes() + triangles.tobytes())
    (destination / 'body.bin').write_bytes(blob)
    meta = dict(version=1, vertices=len(vertices), faces=len(normals), edges=len(edges),
                drawingVertices=len(drawing_ids), drawingTriangles=len(triangles),
                volume=volume, centroid=centroid.tolist(), inertia=inertia.tolist(),
                stableNormal=normals[stable].tolist(), stableOffset=float(offs[stable]-normals[stable]@centroid),
                unstableVertex=unstable, stableVertex=int(incident[stable][0]),
                signature=dict(stable=1, saddle=0, unstable=1),
                exactInputSha256=digest, binarySha256=hashlib.sha256(blob).hexdigest(),
                source='https://github.com/Tancredi-Schettini-Gherardini/certified_gomboc',
                paper='https://arxiv.org/abs/2609.07827',
                drawingApproximation=True, contactVertices='full certified boundary complex, float64 vertex coordinates')
    (destination / 'body.json').write_text(json.dumps(meta, indent=2) + '\n')
    preview_ids = np.unique(np.r_[np.linspace(0, len(vertices)-1, 80).astype(int), incident[stable], unstable])
    preview = centered[preview_ids]
    preview_hull = ConvexHull(preview)
    (ROOT / 'site/js/gomboc-preview.js').write_text(
        '// GENERATED by scripts/build-gomboc.py. Lightweight visual hull, without an equilibrium claim.\n'
        + 'export const GOMBOC_PREVIEW = ' + json.dumps(dict(vertices=np.round(preview, 7).tolist(),
                                                           triangles=preview_hull.simplices.tolist()), separators=(',', ':')) + ';\n')
    shutil.copyfile(source / 'LICENSE', destination / 'LICENSE.txt')
    shutil.copyfile(source / 'data/polytope_F56946.npz', destination / 'polytope.npz')
    (destination / 'README.txt').write_text(
        'Data from T. Schettini Gherardini, An explicit mono-monostatic polyhedron (2026 preprint), MIT license.\n'
        'https://arxiv.org/abs/2609.07827\n'
        'https://github.com/Tancredi-Schettini-Gherardini/certified_gomboc\n'
        'polytope.npz defines the exact rational halfspaces. body.bin retains all float64 vertices and adjacency for numerical contacts.\n'
        'Its smaller display hull is an explicit visual approximation, with no equilibrium claim for that display hull.\n'
        'Reproduce packaging with scripts/build-gomboc.py SOURCE_CHECKOUT COMPLETED_CERTIFICATE_DIRECTORY.\n')
    print(json.dumps(meta))


if __name__ == '__main__':
    if len(sys.argv) != 3:
        raise SystemExit(__doc__)
    build(Path(sys.argv[1]), Path(sys.argv[2]))
