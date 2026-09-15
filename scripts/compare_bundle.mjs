import {parseArgs} from 'node:util';
import {readFileSync,statSync} from 'node:fs';
import {validateBundle} from '../src/core/bundle.mjs';
import {rankMaps,looRange} from '../src/core/molecular.mjs';
import {syntheticBundle} from '../src/data/synthetic.mjs';

try {
  const {values}=parseArgs({options:{input:{type:'string'},profile:{type:'string'}}});
  let raw=syntheticBundle;
  if(values.input){
    if(statSync(values.input).size>1000000)throw new Error('Use a bundle smaller than 1 MB.');
    raw=JSON.parse(readFileSync(values.input,'utf8'));
  }
  const bundle=validateBundle(raw);
  const profile=values.profile?bundle.profiles.find(p=>p.id===values.profile):bundle.profiles[0];
  if(!profile)throw new Error('Requested profile is not present in the bundle.');
  const report={
    project:'DopaTeam',dataKind:bundle.kind,
    regionCount:bundle.regions.length,mapCount:bundle.maps.length,
    profile:{id:profile.id,label:profile.label},
    ranking:'Descending absolute Spearman correlation; signed rho retained.',
    interpretation:'Descriptive regional comparison. Sensitivity ranges are not confidence intervals. No cell state or treatment inference.',
    topMaps:rankMaps(profile.values,bundle.maps).slice(0,5).map(m=>({id:m.id,name:m.name,rho:m.rho,leaveOneOut:looRange(profile.values,m.values)}))
  };
  process.stdout.write(JSON.stringify(report,null,2)+'\n');
}catch(error){
  process.stderr.write(`Comparison rejected: ${error.message}\n`);
  process.exitCode=1;
}
