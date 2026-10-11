import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, readdir, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { findings } from './banned.mjs';

const dist = fileURLToPath(new URL('../dist/', import.meta.url));

async function walk(dir) {
  const out = [];
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...await walk(p)); else out.push(p);
  }
  return out;
}

test('published LaTeX sources match their manifest', async () => {
  const manifest = JSON.parse(await readFile(path.join(dist, 'sources/manifest.json'), 'utf8'));
  assert.ok(manifest.courses.length >= 2);
  for (const course of manifest.courses) {
    assert.ok(course.files.length > 0, course.id);
    for (const f of course.files) {
      assert.equal((await stat(path.join(dist, 'sources', f.path))).size, f.bytes, f.path);
    }
  }
});

test('sources and vendored libraries carry no personal data', async () => {
  for (const file of await walk(path.join(dist, 'sources'))) {
    if (!/\.(tex|sty|cls|bib|md|json)$/.test(file)) continue;
    const text = await readFile(file, 'utf8');
    assert.deepEqual(findings(text), [], path.relative(dist, file));
  }
});

test('every French source file with an English twin keeps the same figure inputs', async () => {
  const manifest = JSON.parse(await readFile(path.join(dist, 'sources/manifest.json'), 'utf8'));
  const premiere = manifest.courses.find(c => c.id === 'premiere');
  const names = new Set(premiere.files.map(f => f.path));
  for (const f of premiere.files.filter(f => f.path.endsWith('-en.tex') && f.path.includes('/chapitres/'))) {
    const fr = f.path.replace('-en.tex', '.tex');
    assert.ok(names.has(fr), `French twin missing for ${f.path}`);
    const inputs = s => [...s.matchAll(/\\input\{([^}]+)\}/g)].map(m => m[1].replace(/-en(\.tex)?$/, '').replace(/\.tex$/, '')).sort();
    const [a, b] = await Promise.all([readFile(path.join(dist, 'sources', fr), 'utf8'), readFile(path.join(dist, 'sources', f.path), 'utf8')]);
    assert.deepEqual(inputs(b), inputs(a), f.path);
  }
});
