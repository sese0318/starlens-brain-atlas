import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createDummyAssets} from '../scripts/generate_dummy_atlas.mjs';
import {rankMaps} from '../src/core/molecular.mjs';
import {validateAtlasBundle,association} from '../src/core/atlas.mjs';

const json=path=>JSON.parse(readFileSync(new URL(path,import.meta.url),'utf8'));
const regions=['lh','rh'].flatMap(h=>json(`../public/atlas/${h}.json`).regions);
const bundle=json('../public/atlas/dummy-atlas.json');
const comparison=json('../public/atlas/dummy-comparison.json');

test('downloadable dummy is an explicit-ID synthetic input with three distinct scenarios',()=>{
  const parsed=validateAtlasBundle(bundle,regions);
  assert.equal(parsed.kind,'synthetic');
  assert.equal(parsed.profiles.length,3);assert.equal(parsed.maps.length,3);
  assert.equal(new Set(parsed.profiles.map(p=>JSON.stringify(p.values))).size,3);
  assert.ok(parsed.regions.every(r=>/^ctx-(lh|rh)-/.test(r.id)));
  assert.ok(parsed.profiles.every(p=>p.unit==='Arbitrary units'&&p.label.startsWith('Dummy')));
  assert.ok(parsed.maps.every(m=>m.unit==='Arbitrary units'&&m.name.startsWith('Synthetic')));
  const index=name=>parsed.regions.findIndex(r=>r.id===`ctx-lh-${name}`);
  assert.ok(parsed.profiles[0].values[index('entorhinal')]>parsed.profiles[0].values[index('superiorfrontal')]);
  assert.ok(parsed.profiles[1].values[index('superiorfrontal')]>parsed.profiles[1].values[index('entorhinal')]);
});

test('all nine saved comparisons agree with the exact inputs displayed by the viewer',()=>{
  const parsed=validateAtlasBundle(bundle,regions);
  assert.equal(comparison.kind,'synthetic');assert.equal(comparison.results.length,9);
  const seen=new Set();
  for(const result of comparison.results){
    const pair=`${result.profileId}:${result.mapId}`;assert.ok(!seen.has(pair));seen.add(pair);
    const profile=parsed.profiles.find(p=>p.id===result.profileId);
    const map=parsed.maps.find(m=>m.id===result.mapId);
    assert.deepEqual(association(profile.values,map.values),{n:result.n,rho:result.rho});
  }
});

test('dummy values follow anatomical IDs after generation order changes and a JSON round trip',()=>{
  const shuffled=createDummyAssets([...regions].reverse(),rankMaps).bundle;
  const normalized=validateAtlasBundle(JSON.parse(JSON.stringify(shuffled)),regions);
  assert.deepEqual(normalized.profiles,bundle.profiles);
  assert.deepEqual(normalized.maps,bundle.maps);
  assert.deepEqual(normalized.source,bundle.source);
});

test('checked-in dummy files reproduce exactly from the generator and reject non-anatomical IDs',()=>{
  assert.deepEqual(createDummyAssets(regions,rankMaps),{bundle,comparison});
  const wrong=regions.map(r=>({...r}));wrong[0].key='r01';
  assert.throws(()=>createDummyAssets(wrong,rankMaps));
});
