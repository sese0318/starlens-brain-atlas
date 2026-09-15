import test from 'node:test';
import assert from 'node:assert/strict';
import {execFileSync,spawnSync} from 'node:child_process';
import {mkdtempSync,writeFileSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {syntheticBundle} from '../src/data/synthetic.mjs';
const cwd=new URL('../',import.meta.url);
const run=(args=[])=>JSON.parse(execFileSync(process.execPath,['scripts/compare_bundle.mjs',...args],{cwd,encoding:'utf8'}));
test('parcel 03 preserves parcel 01 results on the same portable inputs',()=>{
 const initial=JSON.parse(execFileSync(process.execPath,['scripts/demo.mjs'],{cwd,encoding:'utf8'}));
 const current=run();
 assert.equal(current.regionCount,initial.regionCount);assert.equal(current.mapCount,initial.mapCount);
 assert.deepEqual(current.topMaps,initial.topMaps.map(({family,...map})=>map));
});
test('loading an invented bundle preserves its result and explicit profile selection',()=>{
 const dir=mkdtempSync(join(tmpdir(),'dopateam-compare-'));
 try{
  const input=join(dir,'invented.json');writeFileSync(input,JSON.stringify(syntheticBundle));
  assert.deepEqual(run(['--input',input,'--profile','synthetic']),run());
  const unknown=spawnSync(process.execPath,['scripts/compare_bundle.mjs','--input',input,'--profile','missing'],{cwd,encoding:'utf8'});
  assert.equal(unknown.status,1);assert.equal(unknown.stdout,'');assert.match(unknown.stderr,/profile is not present/);
 }finally{rmSync(dir,{recursive:true,force:true});}
});
test('misaligned JSON fails before publishing a comparison result',()=>{
 const dir=mkdtempSync(join(tmpdir(),'dopateam-reject-'));
 try{
  const input=join(dir,'misaligned.json'),bundle=structuredClone(syntheticBundle);bundle.maps[0].values.pop();writeFileSync(input,JSON.stringify(bundle));
  const invalid=spawnSync(process.execPath,['scripts/compare_bundle.mjs','--input',input],{cwd,encoding:'utf8'});
  assert.equal(invalid.status,1);assert.equal(invalid.stdout,'');assert.match(invalid.stderr,/82 finite values/);
  writeFileSync(input,'not JSON');const malformed=spawnSync(process.execPath,['scripts/compare_bundle.mjs','--input',input],{cwd,encoding:'utf8'});
  assert.equal(malformed.status,1);assert.equal(malformed.stdout,'');
 }finally{rmSync(dir,{recursive:true,force:true});}
});
