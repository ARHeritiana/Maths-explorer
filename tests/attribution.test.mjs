// Workstream H guard: no public credit or link for the two reference sites the owner asked to remove (JavaLab, Mathoutils)
// anywhere that is served or built into the site. The task register and the provenance audit under docs/ may name them.
import test from 'node:test';
import assert from 'node:assert/strict';
import {readdirSync, readFileSync, statSync} from 'node:fs';
import {join} from 'node:path';
const root = new URL('../', import.meta.url).pathname;
const NAMES = /java\s*lab|math\s*outils?/i;
const TEXT = /\.(js|mjs|css|html|json|md|txt|py|tex|sty|svg|yml|yaml)$/i;
function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    if (['node_modules', '.git', 'dist', 'vendor', 'fonts', 'private'].includes(name)) continue;
    const path = join(dir, name), s = statSync(path);
    if (s.isDirectory()) walk(path, out); else if (TEXT.test(name) && s.size < 3e6) out.push(path);
  }
  return out;
}
test('no JavaLab or Mathoutils credit in site/, content/, scripts/, build/, README or licences', () => {
  const files = ['site', 'content', 'scripts', 'build'].flatMap(d => walk(join(root, d)));
  for (const f of ['README.md', 'LICENSE.md', 'LICENSE-CODE', 'AGENTS.md']) { try { files.push(join(root, f)); } catch { /* optional */ } }
  const hits = [];
  for (const f of files) { let text; try { text = readFileSync(f, 'utf8'); } catch { continue; } if (NAMES.test(text)) hits.push(f.replace(root, '')); }
  assert.deepEqual(hits, []);
});
test('the built site carries none either', () => {
  const files = walk(join(root, 'dist')).filter(f => !/\/(resources|sources)\//.test(f.replace(root, '/')));
  const hits = files.filter(f => NAMES.test(readFileSync(f, 'utf8'))).map(f => f.replace(root, ''));
  assert.deepEqual(hits, []);
});
