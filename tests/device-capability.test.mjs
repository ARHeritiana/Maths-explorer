// The decision about what a device can afford: pure numbers in, a tier out. Nothing above a device's proven ability is offered.
import test from 'node:test';
import assert from 'node:assert/strict';
import {TIERS, LIMITS, decide, measure, readEnvironment, capability, upTo} from '../site/js/device-capability.js';
const base = {cores: 8, memoryGB: 8, saveData: false, coarsePointer: false, smallScreen: false, workers: true, webgl2: true, floatBuffer: true, battery: null};
test('a fast desktop with float GPU buffers reaches the extreme tier; a slow one does not', () => {
  assert.equal(decide(base, 8e6).tier, 'extreme');
  assert.equal(decide(base, 2e5).tier, 'high');
  assert.equal(decide(base, 5e4).tier, 'standard');
  assert.equal(decide(base, 1e3).tier, 'basic');
});
test('every blocking fact caps the tier, whatever the speed', () => {
  const fast = 1e8;
  assert.equal(decide({...base, webgl2: false}, fast).tier, 'basic');
  assert.equal(decide({...base, floatBuffer: false}, fast).tier, 'basic');
  assert.equal(decide({...base, saveData: true}, fast).tier, 'standard');
  assert.equal(decide({...base, battery: {level: 0.1, charging: false}}, fast).tier, 'standard');
  assert.equal(decide({...base, battery: {level: 0.1, charging: true}}, fast).tier, 'extreme');
  assert.equal(decide({...base, workers: false}, fast).tier, 'standard');
  assert.equal(decide({...base, coarsePointer: true, smallScreen: true, cores: 6}, fast).tier, 'standard');
  assert.equal(decide({...base, coarsePointer: true, smallScreen: true, cores: 8}, fast).tier, 'high');
  assert.equal(decide(base, NaN).tier, 'basic');
  assert.equal(decide(base, 0).tier, 'basic');
});
test('memory caps the tier: little memory never reaches high or extreme even when fast', () => {
  assert.equal(decide({...base, memoryGB: 1}, 1e8).tier, 'basic');
  assert.equal(decide({...base, memoryGB: 2}, 1e8).tier, 'standard');
  assert.equal(decide({...base, memoryGB: 4}, 1e8).tier, 'standard');
  assert.equal(decide({...base, memoryGB: 8}, 1e8).tier, 'extreme');
  assert.ok(decide({...base, memoryGB: null, cores: 4}, 1e8).tier !== 'extreme', 'unknown memory on a small machine is treated as 4 GB');
});
test('ceilings grow with the tier and the result carries its reasons and workers', () => {
  for (let i = 1; i < TIERS.length; i++) for (const k of ['rays', 'bounces', 'segments', 'trialsPerSecond']) assert.ok(LIMITS[TIERS[i]][k] > LIMITS[TIERS[i - 1]][k], k);
  const d = decide({...base, saveData: true}, 1e8);
  assert.ok(d.reasons.includes('data saver')); assert.ok(d.workers <= LIMITS.standard.workers);
  assert.equal(decide({...base, cores: 1}, 1e8).workers <= 1, true);
  assert.equal(decide({...base, cores: 2}, 1e8).tier, 'standard', 'one spare core: nothing heavy');
  assert.equal(decide({...base, cores: 4}, 1e8).tier, 'high', 'three spare cores: not extreme');
  assert.equal(decide({...base, cores: 6}, 1e8).tier, 'extreme');
});
test('measure returns units per second from the clock it is given', () => {
  let t = 0; const rate = measure(() => { t += 5; return 100; }, 40, () => t);
  assert.ok(Math.abs(rate - 20000) < 1e-6);
});
test('readEnvironment reads only what exists and defaults safely', () => {
  const e = readEnvironment({navigator: {hardwareConcurrency: 12, deviceMemory: 8, connection: {saveData: true}}, screen: {width: 1920, height: 1080}, matchMedia: () => ({matches: false}), Worker: function () {}});
  assert.deepEqual(e, {cores: 12, memoryGB: 8, saveData: true, coarsePointer: false, smallScreen: false, workers: true});
  const bare = readEnvironment({});
  assert.equal(bare.cores, 2); assert.equal(bare.memoryGB, null); assert.equal(bare.workers, false); assert.equal(bare.saveData, false);
});
test('capability measures once, caches for the session and survives blocked storage', async () => {
  const store = new Map(), storage = {getItem: (k) => store.get(k) ?? null, setItem: (k, v) => store.set(k, v)};
  const env = {navigator: {hardwareConcurrency: 8, deviceMemory: 8}, screen: {width: 1920, height: 1080}, matchMedia: () => ({matches: false}), Worker: function () {}, performance: {now: (() => { let t = 0; return () => (t += 1); })()}, storage};
  let runs = 0; const work = () => { runs++; return 1e5; };
  const a = await capability({kind: 'test', work, env, storage, floatProbe: () => ({webgl2: true, floatBuffer: true})});
  const b = await capability({kind: 'test', work, env, storage, floatProbe: () => ({webgl2: true, floatBuffer: true})});
  assert.deepEqual(a, b); assert.ok(runs > 0); const after = runs; await capability({kind: 'test', work, env, storage}); assert.equal(runs, after, 'cached');
  const blocked = {getItem() { throw new Error('blocked'); }, setItem() { throw new Error('blocked'); }};
  const c = await capability({kind: 'other', work, env, storage: blocked, floatProbe: () => ({webgl2: false})});
  assert.equal(c.tier, 'basic');
});
test('upTo drops the choices above the ceiling', () => { assert.deepEqual(upTo([1, 24, 1440, 5000, 50000], 1440), [1, 24, 1440]); });
