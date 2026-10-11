// Banned-content check for Node tests; same rules as tests/banned.py (hashed phrases, links, e-mail addresses).
import {createHash} from 'node:crypto';
import {readFileSync} from 'node:fs';
const spec = JSON.parse(readFileSync(new URL('./banned-sha256.json', import.meta.url)));
const hashes = new Set(spec.sha256);
export const PERSONAL = /(?:drive|docs)\.google\.com|dropbox\.com|onedrive|sharepoint/i;
const EMAIL = /(?<![\\\w.+-])[\w.+-]+@[\w-]+\.[A-Za-z][\w.]*/g;
const EMAIL_OK = /noreply@anthropic\.com|@(?:users\.noreply\.github\.com|example\.(?:com|org))$/;
const words = t => t.toLowerCase().normalize('NFKD').replace(/\p{M}/gu, '').match(/[a-z0-9]+/g) || [];
// Short reasons only; a matched banned phrase is never echoed.
export function findings(text) {
  const out = [];
  if (PERSONAL.test(text)) out.push('personal-space link');
  if ((text.match(EMAIL) || []).some(m => !EMAIL_OK.test(m))) out.push('e-mail address');
  const w = words(text);
  for (let n = 1; n <= spec.maxWords; n++)
    for (let i = 0; i + n <= w.length; i++)
      if (hashes.has(createHash('sha256').update(w.slice(i, i + n).join(' ')).digest('hex'))) return [...out, 'banned phrase'];
  return out;
}
