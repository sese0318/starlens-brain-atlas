import test from 'node:test';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {defaults,evaluate,rankMaps,transitionTime,measurementScores} from '../src/core/model.mjs';
import {syntheticBundle} from '../src/data/synthetic.mjs';

test('same observation supports distinct synthetic functions',()=>{const x=evaluate(defaults);assert.ok(Math.abs(x.a.output-1.008)<1e-12);assert.ok(Math.abs(x.b.output-.576)<1e-12);assert.ok(Math.abs(x.functionGap-.432)<1e-12);assert.equal(x.structuralGap,0);assert.notEqual(x.a.label,x.b.label);});
test('all 30 spatial descriptors remain invariant across 81 alternate gains',()=>{const p=syntheticBundle.profiles[0].values;const base=rankMaps(p,syntheticBundle.maps).map(m=>m.rho);for(let i=0;i<=80;i++){evaluate({...defaults,gainB:.2+i*.02});assert.deepEqual(rankMaps(p,syntheticBundle.maps).map(m=>m.rho),base);}});
test('functional measurement separates pair; same gain removes separation',()=>{assert.ok(Math.abs(measurementScores(defaults)[2].separation-4.32)<1e-12);assert.equal(measurementScores(defaults)[0].separation,0);assert.equal(measurementScores({...defaults,gainB:defaults.gainA})[2].separation,0);});
test('doubling hypothetical noise halves separation',()=>{assert.equal(measurementScores({...defaults,noise:.2})[2].separation,measurementScores(defaults)[2].separation/2);});
test('time depends on unspecified rate and cannot be inferred from the observation',()=>{const a=transitionTime(.72,1.4,.8,.08);assert.ok(Math.abs(a-2.888896512)<=1e-8);assert.equal(transitionTime(.72,1.4,.8,.16),a/2);assert.equal(transitionTime(.72,.8,.8,.08),0);assert.throws(()=>transitionTime(.72,1.4,.8,0));});
test("threshold attainment is dysfunction compatible and time zero",()=>{const p={...defaults,substrate:.8,gainA:1};assert.equal(evaluate(p).a.label,"Dysfunction compatible");assert.equal(transitionTime(.8,1,.8,.1),0);});
test("equal functional output has an explicit nonseparation caveat",()=>{assert.match(measurementScores({...defaults,gainB:defaults.gainA})[2].limit,/indistinguishable/);});
test("default temporal scenario matches independent reference",()=>{assert.equal(defaults.rate,.1);assert.ok(Math.abs(transitionTime(.72,1.4,.8,defaults.rate)-2.3111172096338657)<1e-12);});

test('JavaScript results agree with the independent Python reference', () => {
  const ref = JSON.parse(execFileSync(process.env.PYTHON || (process.platform === 'win32' ? 'python' : 'python3'), ['scripts/reference.py'], {cwd: new URL('../', import.meta.url), encoding:'utf8'}));
  const result = evaluate(defaults);
  const close = (a,b) => assert.ok(Math.abs(a-b)<1e-12, `${a} differs from ${b}`);
  close(result.a.output, ref.states.A.F);
  close(result.b.output, ref.states.B.F);
  close(result.normalizedSeparation, ref.assays.functional_output.delta_over_sigma);
  close(transitionTime(defaults.substrate,defaults.gainA,defaults.threshold,defaults.rate),ref.states.A.transition_time);
  close(transitionTime(defaults.substrate,defaults.gainB,defaults.threshold,defaults.rate),ref.states.B.transition_time);
});

test('missing and nonfinite model parameters fail instead of producing NaN', () => {
  for (const name of Object.keys(defaults)) {
    const missing={...defaults}; delete missing[name];
    assert.throws(()=>evaluate(missing), /present and finite/);
    for (const value of [undefined, NaN, Infinity, '0.1']) {
      assert.throws(()=>evaluate({...defaults,[name]:value}), /present and finite/);
    }
  }
  assert.throws(()=>evaluate(null), /present and finite/);
});

test('large finite ratios have finite transition times and overflow is rejected', () => {
  const actual=transitionTime(1e300,1,1e-300,1);
  const reference=Number(execFileSync(process.env.PYTHON || (process.platform === 'win32' ? 'python' : 'python3'),['-c',
    'import sys; sys.path.insert(0,"scripts"); from reference import transition_time; print(transition_time(1e300,1,1e-300,1))'],
    {cwd:new URL('../',import.meta.url),encoding:'utf8'}));
  assert.ok(Number.isFinite(actual));
  assert.ok(Math.abs(actual-reference)<1e-12);
  assert.throws(()=>transitionTime(1e308,2,1,1), /numeric range/);
  assert.throws(()=>evaluate({...defaults,substrate:1e308,gainA:2}), /numeric range/);
  assert.throws(()=>evaluate({...defaults,noise:Number.MIN_VALUE}), /numeric range/);
});
