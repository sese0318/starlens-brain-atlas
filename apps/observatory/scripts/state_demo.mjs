import {defaults,evaluate,transitionTime,measurementScores,rankMaps} from '../src/core/model.mjs';
import {syntheticBundle} from '../src/data/synthetic.mjs';
const result=evaluate(defaults);
console.log(JSON.stringify({
  project:'DopaTeam',
  status:'Synthetic model example. Not a reproduction of the research article.',
  units:'Normalized illustrative model units; time is not measured in years.',
  parameters:defaults,
  structuralObservation:'The same synthetic regional vector and fixed reference maps are used for both states.',
  strongestReferences:rankMaps(syntheticBundle.profiles[0].values,syntheticBundle.maps).slice(0,5).map(({id,rho})=>({id,rho})),
  states:result,
  transitionTime:{a:transitionTime(defaults.substrate,defaults.gainA,defaults.threshold,defaults.rate),b:transitionTime(defaults.substrate,defaults.gainB,defaults.threshold,defaults.rate)},
  measurementComparison:measurementScores(defaults),
  interpretation:'Under the stated assumptions, identical structural inputs can accompany different functional outputs. This is a model illustration, not evidence of an effective treatment.'
},null,2));
