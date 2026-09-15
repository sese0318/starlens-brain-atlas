import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {validateAtlasBundle,makeAtlasExample,matchUpstreamBundle,association} from '../src/core/atlas.mjs';
import {syntheticBundle} from '../src/data/synthetic.mjs';
const surfaces=['lh','rh'].map(h=>JSON.parse(readFileSync(new URL(`../public/atlas/${h}.json`,import.meta.url))));
const regions=surfaces.flatMap(s=>s.regions);

test('anatomical surfaces contain 68 unique cortical IDs and valid indexed triangles',()=>{
 assert.equal(regions.length,68);assert.equal(new Set(regions.map(r=>r.key)).size,68);
 for(const [i,s] of surfaces.entries()){assert.equal(s.positions.length/3,10242);assert.equal(s.faces.length/3,20480);assert.equal(s.region_ids.length,10242);assert.ok(s.faces.every(n=>Number.isInteger(n)&&n>=0&&n<10242));assert.ok(s.positions.every(Number.isFinite));assert.ok(s.regions.every(r=>r.key.startsWith(i===0?'ctx-lh-':'ctx-rh-')));}
});
test('atlas values follow explicit IDs when the import order is reversed',()=>{
 const original=makeAtlasExample(regions),input=structuredClone(original);input.regions.reverse();input.profiles[0].values.reverse();input.maps[0].values.reverse();
 const parsed=validateAtlasBundle(input,regions);assert.deepEqual(parsed.profiles[0].values,original.profiles[0].values);assert.deepEqual(parsed.maps[0].values,original.maps[0].values);
});
test('unknown IDs, duplicates, infinity and false numeric strings are rejected',()=>{
 for(const change of [d=>d.regions[0].id='r01',d=>d.regions[0].id=d.regions[1].id,d=>d.profiles[0].values[0]=Infinity,d=>d.profiles[0].values[0]='0.7']){const d=makeAtlasExample(regions);change(d);assert.throws(()=>validateAtlasBundle(d,regions));}
});
test('missing values remain null and are excluded from paired correlation',()=>{
 const d=makeAtlasExample(regions,true),validated=validateAtlasBundle(d,regions);assert.ok(validated.profiles[0].values.every(v=>v===null));assert.deepEqual(association([1,null,2,3],[2,99,4,6]),{n:3,rho:1});assert.deepEqual(association([null,2],[1,4]),{n:1,rho:null});
});
test('upstream synthetic region order never binds to cortical anatomy',()=>{assert.deepEqual(matchUpstreamBundle(syntheticBundle,regions),{matched:0,total:68,bundle:null});});
test('partial upstream match uses ID and leaves unavailable regions empty',()=>{
 const b=structuredClone(syntheticBundle);b.regions[12].id=regions[0].key;const result=matchUpstreamBundle(b,regions);assert.equal(result.matched,1);assert.equal(result.bundle.profiles[0].values[0],b.profiles[0].values[12]);assert.ok(result.bundle.profiles[0].values.slice(1).every(v=>v===null));
});
test('invalid display metadata cannot enter React and source evidence is retained',()=>{
 for(const key of ['name','label','unit']){const data=makeAtlasExample(regions);data.maps[0][key]={invalid:true};assert.throws(()=>validateAtlasBundle(data,regions));}
 const d=makeAtlasExample(regions);d.source.url='https://example.org/test-fixture';d.source.version='test-v1';assert.deepEqual(validateAtlasBundle(d,regions).source,d.source);
});
test('atlas data exports round trip, including upstream source without a title',()=>{
 const b=structuredClone(syntheticBundle);b.source={verification:'Test fixture'};b.regions[0].id=regions[0].key;
 const data=matchUpstreamBundle(b,regions).bundle;assert.deepEqual(validateAtlasBundle(JSON.parse(JSON.stringify(data)),regions),data);
 b.maps[0].unit={invalid:true};assert.equal(matchUpstreamBundle(b,regions).bundle,null);
});
