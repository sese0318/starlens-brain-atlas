import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {compactIndexedGeometry, partitionCortex, boundaryPositions, explosionOffset, translatedBounds} from '../src/core/studio-geometry.mjs';

test('a compact parcel excludes unrelated vertices from its geometry and bounds', () => {
  const positions = [10000, 10000, 10000, -2, 3, 4, -1, 3, 4, -2, 5, 6];
  const result = compactIndexedGeometry(positions, [1, 2, 3]);
  assert.deepEqual(result.sourceVertexIndices, [1, 2, 3]);
  assert.deepEqual(result.indices, [0, 1, 2]);
  assert.deepEqual(result.bounds, {min: [-2, 4, -5], max: [-1, 6, -3]});
  assert.equal(positions[0], 10000);
});

test('parcel boundaries omit a shared triangle edge', () => {
  const boundary = boundaryPositions([0,0,0, 1,0,0, 1,1,0, 0,1,0], [0,1,2, 0,2,3]);
  assert.equal(boundary.length, 4 * 2 * 3);
});

test('exploded geometry restores exactly without mutating anatomical coordinates', () => {
  const center = [-30, 15, 20], original = [...center];
  assert.ok(explosionOffset(center, 'lh', false, 1)[0] < 0);
  assert.ok(explosionOffset([30,15,20], 'rh', false, 1)[0] > 0);
  for (const amount of [1, .2, .9, 0]) explosionOffset(center, 'lh', false, amount);
  assert.deepEqual(explosionOffset(center, 'lh', false, 0), [0,0,0]);
  assert.deepEqual(center, original);
  const bounds = {min: [-2,0,1], max: [3,4,5]};
  assert.deepEqual(translatedBounds(bounds, [0,0,0]), bounds);
});

test('real bilateral anatomy preserves all 68 named IDs and every source triangle', () => {
  const keys = [];
  for (const hemisphere of ['lh', 'rh']) {
    const surface = JSON.parse(readFileSync(new URL(`../public/atlas/${hemisphere}.json`, import.meta.url)));
    const initial = surface.positions.slice(0, 9);
    const parts = partitionCortex(surface, hemisphere);
    const named = parts.filter(part => !part.neutral);
    assert.equal(named.length, 34);
    assert.equal(parts.reduce((sum, part) => sum + part.indices.length, 0), surface.faces.length);
    assert.deepEqual(new Set(named.map(part => part.key)), new Set(surface.regions.map(region => region.key)));
    for (const part of parts) {
      keys.push(part.key);
      assert.ok(part.positions.length > 0);
      assert.ok(part.indices.every(index => index >= 0 && index < part.positions.length / 3));
      assert.deepEqual(explosionOffset(part.center, hemisphere, false, 0), [0,0,0]);
    }
    assert.deepEqual(surface.positions.slice(0, 9), initial);
  }
  assert.equal(new Set(keys.filter(key => !key.startsWith('neutral-'))).size, 68);
});
