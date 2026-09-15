import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { ranks, pearson, spearman, standardize, rankMaps, looRange } from '../src/core/molecular.mjs';
import { syntheticBundle } from '../src/data/synthetic.mjs';

const close = (actual, expected) => assert.ok(Math.abs(actual - expected) < 1e-12, `${actual} != ${expected}`);

test('ranks average ties and restore original observation order', () => {
  assert.deepEqual(ranks([40, 10, 20, 20]), [4, 1, 2.5, 2.5]);
  assert.deepEqual(ranks([8, 8, 8]), [2, 2, 2]);
  assert.throws(() => ranks([1, NaN, 2]), /finite/);
  assert.throws(() => ranks('123'), /finite/);
});

test('known Pearson and Spearman fixtures preserve correlation sign', () => {
  close(pearson([1, 2, 3], [5, 7, 9]), 1);
  close(pearson([1, 2, 3], [9, 7, 5]), -1);
  close(spearman([1, 2, 3, 4], [1, 4, 9, 16]), 1);
  close(spearman([1, 2, 3, 4], [16, 9, 4, 1]), -1);
  // Hand-ranked fixture: covariance -1.5, rank sums of squares 4.5 each.
  close(spearman([1, 2, 2, 3], [4, 1, 1, 2]), -1 / 3);
});

test('undefined correlations return null rather than invent a score', () => {
  for (const correlate of [pearson, spearman]) {
    for (const [a, b] of [
      [[1, 2], [1, 2]],
      [[1, 2, 3], [1, 2, 3, 4]],
      [[1, NaN, 3], [1, 2, 3]],
      [[1, 2, 3], [1, Infinity, 3]],
      [[1, 1, 1], [1, 2, 3]],
      [[1, 2, 3], [4, 4, 4]]
    ]) assert.equal(correlate(a, b), null);
  }
});

test('population standardization and constant handling match independent fixtures', () => {
  const normalized = standardize([2, 4, 6]);
  normalized.forEach((x, i) => close(x, [-Math.sqrt(1.5), 0, Math.sqrt(1.5)][i]));
  assert.deepEqual(standardize([7, 7, 7]), [0, 0, 0]);
});

test('map ranking uses absolute association while retaining signed scores', () => {
  const maps = [
    {id: 'z-positive', values: [1, 2, 3, 4]},
    {id: 'a-negative', values: [4, 3, 2, 1]},
    {id: 'middle', values: [1, 2, 4, 3]},
    {id: 'undefined', values: [1, 1, 1, 1]}
  ];
  const result = rankMaps([1, 2, 3, 4], maps);
  assert.deepEqual(result.map(m => m.id), ['a-negative', 'z-positive', 'middle', 'undefined']);
  close(result[0].rho, -1);
  close(result[2].rho, 0.8);
  assert.equal(result[3].rho, null);
  assert.equal(maps[0].rho, undefined);
});

test('leave-one-out sensitivity agrees with hand-enumerated three-point ranks', () => {
  const range = looRange([1, 2, 3, 4], [1, 2, 4, 3]);
  close(range.min, 0.5);
  close(range.max, 1);
  assert.equal(looRange([1, 2, 3], [1, 2, 3]), null);
  assert.equal(looRange([1, 1, 1, 1], [1, 2, 3, 4]), null);
});

test('synthetic generator aligns all finite vectors to 82 unique invented regions', () => {
  const bundle = syntheticBundle;
  assert.equal(bundle.kind, 'synthetic');
  assert.equal(bundle.regions.length, 82);
  assert.equal(bundle.maps.length, 30);
  assert.equal(bundle.profiles.length, 1);
  assert.equal(new Set(bundle.regions.map(r => r.id)).size, 82);
  assert.equal(new Set(bundle.maps.map(m => m.id)).size, 30);
  assert.equal(bundle.regions[0].id, 'r01');
  assert.equal(bundle.regions[81].id, 'r82');
  for (const row of [...bundle.profiles, ...bundle.maps]) {
    assert.equal(row.values.length, bundle.regions.length);
    assert.ok(row.values.every(Number.isFinite));
    close(row.values.reduce((sum, x) => sum + x, 0) / 82, 0);
    close(row.values.reduce((sum, x) => sum + x * x, 0) / 82, 1);
  }
});

test('CLI emits deterministic synthetic JSON and five usable sensitivity summaries', () => {
  const script = fileURLToPath(new URL('../scripts/demo.mjs', import.meta.url));
  const run = () => execFileSync(process.execPath, [script], {encoding: 'utf8'});
  const output = run();
  assert.equal(run(), output);
  const report = JSON.parse(output);
  assert.equal(report.kind, 'synthetic');
  assert.equal(report.regionCount, 82);
  assert.equal(report.mapCount, 30);
  assert.equal(report.topMaps.length, 5);
  assert.match(report.interpretation, /not confidence intervals/);
  let previous = Infinity;
  for (const map of report.topMaps) {
    assert.ok(Number.isFinite(map.rho));
    assert.ok(Math.abs(map.rho) <= previous);
    previous = Math.abs(map.rho);
    assert.ok(map.leaveOneOut.min >= -1 && map.leaveOneOut.max <= 1);
    assert.ok(map.leaveOneOut.min <= map.leaveOneOut.max);
  }
});
