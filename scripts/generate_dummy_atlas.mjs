import {readFile, writeFile} from 'node:fs/promises';
import {pathToFileURL} from 'node:url';

const UPSTREAM_COMMIT = 'befcfd9e5c2e32981e2dbdffda2aae457b2bf073';
const UPSTREAM_URL = `https://github.com/Rifelimo/DopaTeam/blob/${UPSTREAM_COMMIT}/src/core/molecular.mjs`;

// These weights are invented for visible interaction examples. They are not fitted
// to a paper, disease, patient, neurotransmitter map, or any measured brain value.
const TEMPORAL = {
  bankssts: .86, entorhinal: .97, fusiform: .78, inferiortemporal: .94,
  middletemporal: .88, parahippocampal: .90, superiortemporal: .79,
  temporalpole: .96, transversetemporal: .68,
};
const FRONTAL = {
  caudalmiddlefrontal: .83, lateralorbitofrontal: .86, medialorbitofrontal: .88,
  parsopercularis: .83, parsorbitalis: .89, parstriangularis: .86,
  rostralmiddlefrontal: .94, superiorfrontal: .91, frontalpole: .98,
  rostralanteriorcingulate: .72, caudalanteriorcingulate: .65,
};
const POSTERIOR = {
  cuneus: .81, inferiorparietal: .92, isthmuscingulate: .76,
  lateraloccipital: .86, lingual: .75, pericalcarine: .71,
  posteriorcingulate: .93, precuneus: .99, superiorparietal: .90,
  supramarginal: .87,
};

// Stable key-based variation makes generated values independent of array order.
function variation(key, salt) {
  let hash = 2166136261;
  for (const character of `${salt}|${key}`) {
    hash ^= character.charCodeAt(0);
    hash = Math.imul(hash, 16777619) >>> 0;
  }
  return ((hash % 1009) / 1008 - .5) * .045;
}
const bounded = value => Number(Math.max(.025, Math.min(1, value)).toFixed(4));

export function createDummyAssets(atlasRegions, rankMaps) {
  if (!Array.isArray(atlasRegions) || atlasRegions.length !== 68)
    throw new Error('Expected the 68 cortical regions in the existing atlas assets.');
  const ids = atlasRegions.map(region => region.key);
  if (new Set(ids).size !== 68 || atlasRegions.some(region =>
    !['lh', 'rh'].includes(region.hemisphere) ||
    region.key !== `ctx-${region.hemisphere}-${region.name}`))
    throw new Error('Every region must have an explicit anatomical key and hemisphere.');
  const names = new Set(atlasRegions.map(region => region.name));
  for (const name of [...Object.keys(TEMPORAL), ...Object.keys(FRONTAL), ...Object.keys(POSTERIOR)]) {
    if (!names.has(name)) throw new Error(`Pattern region is missing from the atlas: ${name}`);
  }
  const vector = (salt, value) => atlasRegions.map(region =>
    bounded(value(region) + variation(region.key, salt)));
  const profiles = [
    {id: 'dummy-temporal', label: 'Dummy Temporal emphasis',
      description: 'Fictional high values in selected temporal regions.',
      unit: 'Arbitrary units', values: vector('profile-temporal', region =>
        (TEMPORAL[region.name] ?? .08) * (region.hemisphere === 'lh' ? 1 : .88))},
    {id: 'dummy-frontal', label: 'Dummy Frontal emphasis',
      description: 'Fictional high values in selected frontal regions.',
      unit: 'Arbitrary units', values: vector('profile-frontal', region =>
        (FRONTAL[region.name] ?? .07) * (region.hemisphere === 'rh' ? 1 : .88))},
    {id: 'dummy-mixed', label: 'Dummy Mixed pattern',
      description: 'Fictional posterior emphasis with smaller frontal and temporal patches.',
      unit: 'Arbitrary units', values: vector('profile-mixed', region =>
        Math.max(POSTERIOR[region.name] ?? .07,
          (FRONTAL[region.name] ?? 0) * .53,
          (TEMPORAL[region.name] ?? 0) * .43))},
  ];
  const maps = [
    {id: 'synthetic-reference-a', name: 'Synthetic reference A',
      description: 'Artificial temporal-weighted reference pattern.',
      unit: 'Arbitrary units', values: vector('reference-a', region =>
        .09 + (TEMPORAL[region.name] ?? .02) * .75 + (POSTERIOR[region.name] ?? 0) * .10)},
    {id: 'synthetic-reference-b', name: 'Synthetic reference B',
      description: 'Artificial frontal-weighted reference pattern.',
      unit: 'Arbitrary units', values: vector('reference-b', region =>
        .08 + (FRONTAL[region.name] ?? .03) * .78 + (TEMPORAL[region.name] ?? 0) * .07)},
    {id: 'synthetic-reference-c', name: 'Synthetic reference C',
      description: 'Artificial posterior-weighted reference pattern.',
      unit: 'Arbitrary units', values: vector('reference-c', region =>
        .08 + (POSTERIOR[region.name] ?? .03) * .79 + (FRONTAL[region.name] ?? 0) * .08)},
  ];
  const source = {
    title: 'Synthetic demo inputs generated for the StarLens 3D atlas',
    license: 'Project-generated synthetic values. Existing atlas asset licenses remain separate.',
    valuesOrigin: 'Invented anatomical patterns in arbitrary units. No study results or patient measurements.',
    anatomyOrigin: 'Region keys and labels read from the existing fsaverage5 DK68 atlas assets.',
    generator: 'scripts/generate_dummy_atlas.mjs',
    numericalCode: {repository: 'Rifelimo/DopaTeam', commit: UPSTREAM_COMMIT,
      path: 'src/core/molecular.mjs', url: UPSTREAM_URL, function: 'rankMaps'},
  };
  const bundle = {
    schema: 'starlens-atlas-v1', atlas: 'fsaverage5-dk68', kind: 'synthetic', source,
    regions: atlasRegions.map(region => ({id: region.key,
      label: `${region.hemisphere === 'lh' ? 'Left' : 'Right'} ${region.label}`})),
    profiles, maps,
  };
  const results = profiles.flatMap(profile => rankMaps(profile.values, maps).map((map, index) => ({
    profileId: profile.id, profileLabel: profile.label,
    mapId: map.id, mapLabel: map.name, n: atlasRegions.length,
    rho: map.rho, rankByAbsoluteRho: index + 1,
  })));
  if (results.length !== 9 || results.some(result => !Number.isFinite(result.rho)))
    throw new Error('Expected nine finite descriptive associations for the dummy inputs.');
  const comparison = {
    schema: 'starlens-dummy-comparison-v1', atlas: bundle.atlas, kind: 'synthetic',
    source: {...source, input: 'public/atlas/dummy-atlas.json'},
    method: 'Spearman rank correlation, using DopaTeam rankMaps with its tied-rank implementation.',
    interpretation: 'Descriptive similarity between invented patterns. These values do not establish biological effects, statistical significance, diagnosis, or treatment response.',
    results,
  };
  return {bundle, comparison};
}

async function main() {
  const [left, right, {rankMaps}, {validateAtlasBundle}] = await Promise.all([
    readFile(new URL('../public/atlas/lh.json', import.meta.url), 'utf8').then(JSON.parse),
    readFile(new URL('../public/atlas/rh.json', import.meta.url), 'utf8').then(JSON.parse),
    import('../src/core/molecular.mjs'),
    import('../src/core/atlas.mjs'),
  ]);
  const regions = [...left.regions, ...right.regions];
  const {bundle, comparison} = createDummyAssets(regions, rankMaps);
  validateAtlasBundle(bundle, regions);
  await writeFile(new URL('../public/atlas/dummy-atlas.json', import.meta.url), JSON.stringify(bundle) + '\n');
  await writeFile(new URL('../public/atlas/dummy-comparison.json', import.meta.url), JSON.stringify(comparison) + '\n');
  console.log('Generated synthetic DK68 inputs and nine descriptive comparisons.');
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch(error => { console.error(error.message); process.exitCode = 1; });
}
