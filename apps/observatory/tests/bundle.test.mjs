import test from 'node:test';
import assert from 'node:assert/strict';
import {validateBundle} from '../src/core/bundle.mjs';
import {syntheticBundle} from '../src/data/synthetic.mjs';
test('aligned synthetic bundle is accepted without altering its values',()=>{const b=structuredClone(syntheticBundle);assert.equal(validateBundle(b),b);assert.deepEqual(b,syntheticBundle);});
test('misaligned map, profile and duplicated region identifiers are rejected',()=>{
 for(const change of [b=>b.maps[0].values.pop(),b=>b.profiles[0].values.pop(),b=>b.regions[1].id=b.regions[0].id]){const b=structuredClone(syntheticBundle);change(b);assert.throws(()=>validateBundle(b));}
});
test('invalid values and duplicate map identifiers cannot enter the model',()=>{
 for(const change of [b=>b.maps[0].values[0]=NaN,b=>b.maps[0].values[0]=Infinity,b=>b.maps[1].id=b.maps[0].id,b=>b.profiles[0].values[0]='1']){const b=structuredClone(syntheticBundle);change(b);assert.throws(()=>validateBundle(b));}
});
test('a data kind and valid source descriptions are required',()=>{
 for(const change of [b=>delete b.kind,b=>b.kind='patient',b=>b.source.title={},b=>b.regions[0].label=3]){const b=structuredClone(syntheticBundle);change(b);assert.throws(()=>validateBundle(b));}
});
