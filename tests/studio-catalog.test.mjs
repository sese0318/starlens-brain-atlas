import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {buildCatalog, LOBE_COLORS, visibleRegionKeys, searchedRegions} from '../src/core/studio-catalog.mjs';
import {validateAtlasBundle} from '../src/core/atlas.mjs';

const readAtlas = name => JSON.parse(readFileSync(new URL(`../public/atlas/${name}.json`, import.meta.url), 'utf8'));
const surfaces = ['lh', 'rh'].map(readAtlas);
const deepMeshes = readAtlas('subcortex').meshes;
const regions = buildCatalog(surfaces, deepMeshes);

test('catalog preserves all 68 cortical data indexes followed by 14 anatomical deep structures', () => {
  assert.equal(regions.length, 82);
  assert.equal(new Set(regions.map(region => region.key)).size, 82);
  const cortex = regions.filter(region => region.type === 'cortex');
  assert.equal(cortex.length, 68);
  assert.equal(regions.filter(region => region.type === 'subcortex').length, 14);
  assert.deepEqual(cortex.map(region => region.key), readAtlas('dummy-atlas').regions.map(region => region.id));
  assert.deepEqual(regions.slice(68).map(region => region.key), deepMeshes.map(mesh => mesh.key));
  assert.deepEqual(validateAtlasBundle(readAtlas('dummy-atlas'), cortex).profiles[0].values,
    readAtlas('dummy-atlas').profiles[0].values);
  for (const region of regions) {
    assert.ok(Object.hasOwn(LOBE_COLORS, region.lobe));
    assert.match(LOBE_COLORS[region.lobe], /^#[0-9a-f]{6}$/i);
    assert.ok(region.key && region.name && region.label);
  }
});

test('excluded annotations never become selectable anatomical regions', () => {
  const extra = ['unknown', 'corpuscallosum', 'medialwall', 'medial_wall'].map((name, index) =>
    ({id: 9000 + index, name, key: `excluded-${index}`}));
  const altered = [{...surfaces[0], regions: [...surfaces[0].regions, ...extra]}, surfaces[1]];
  assert.deepEqual(buildCatalog(altered, deepMeshes).map(region => region.key), regions.map(region => region.key));
});

test('hemisphere and structure filters keep the original stable IDs', () => {
  assert.equal(visibleRegionKeys(regions).size, 82);
  assert.equal(visibleRegionKeys(regions, {hemisphere: 'lh'}).size, 41);
  assert.equal(visibleRegionKeys(regions, {hemisphere: 'rh'}).size, 41);
  assert.equal(visibleRegionKeys(regions, {structure: 'cortex'}).size, 68);
  assert.equal(visibleRegionKeys(regions, {structure: 'deep'}).size, 14);
  assert.equal(visibleRegionKeys(regions, {hemisphere: 'lh', structure: 'deep'}).size, 7);
});

test('hide and isolate compose without restoring an explicitly hidden structure', () => {
  const key = 'Left-Hippocampus';
  assert.equal(visibleRegionKeys(regions, {hidden: [key]}).size, 81);
  assert.equal(visibleRegionKeys(regions, {hidden: new Set([key])}).has(key), false);
  assert.deepEqual([...visibleRegionKeys(regions, {isolate: key})], [key]);
  assert.equal(visibleRegionKeys(regions, {isolate: key, hidden: [key]}).size, 0);
  assert.equal(visibleRegionKeys(regions, {isolate: key, hemisphere: 'rh'}).size, 0);
  assert.equal(visibleRegionKeys(regions, {isolate: key, structure: 'cortex'}).size, 0);
  assert.equal(visibleRegionKeys(regions, {isolate: null, hidden: []}).size, 82);
});

test('search finds anatomy by phrase, hemisphere or exact ID without reordering it', () => {
  assert.deepEqual(searchedRegions(regions, 'left hippocampus').map(region => region.key), ['Left-Hippocampus']);
  assert.equal(searchedRegions(regions, '  TEMPORAL  LEFT ').every(region => region.hemisphere === 'lh'), true);
  assert.deepEqual(searchedRegions(regions, 'ctx-rh-insula').map(region => region.key), ['ctx-rh-insula']);
  assert.deepEqual(searchedRegions(regions, ''), regions);
  assert.deepEqual(searchedRegions(regions, 'no-such-structure'), []);
});
