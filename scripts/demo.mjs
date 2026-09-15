import { rankMaps, looRange } from '../src/core/molecular.mjs';
import { syntheticBundle } from '../src/data/synthetic.mjs';

const profile = syntheticBundle.profiles[0];
const report = {
  project: 'DopaTeam',
  kind: 'synthetic',
  source: syntheticBundle.source,
  regionCount: syntheticBundle.regions.length,
  mapCount: syntheticBundle.maps.length,
  profile: {id: profile.id, label: profile.label},
  ranking: 'Descending absolute Spearman correlation; signed rho retained.',
  interpretation: 'Descriptive associations between invented patterns. Leave-one-out ranges are sensitivity summaries, not confidence intervals or p values. No biological or clinical inference.',
  topMaps: rankMaps(profile.values, syntheticBundle.maps).slice(0, 5).map(map => ({
    id: map.id,
    name: map.name,
    family: map.family,
    rho: map.rho,
    leaveOneOut: looRange(profile.values, map.values)
  }))
};
process.stdout.write(JSON.stringify(report, null, 2) + '\n');
