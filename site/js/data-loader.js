import { assetVersions } from './catalogue-data.js';

// A changed file gets a changed URL wherever it is linked or downloaded.
export function assetHref(path) {
  const [base, fragment] = String(path).split('#', 2);
  const key = base.split('?')[0].replace(/^\.\//, '');
  const version = assetVersions[key];
  if (!version) return path;
  return `${base}${base.includes('?') ? '&' : '?'}v=${version}${fragment === undefined ? '' : '#' + fragment}`;
}

export async function fetchJSON(path) {
  const response = await fetch(assetHref(path), { cache: 'no-store' });
  if (!response.ok) throw new Error(`Content could not be loaded: ${path} (${response.status})`);
  return response.json();
}
