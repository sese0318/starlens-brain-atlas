import {regionKey} from './atlas.mjs';

// Navigation groups for this educational viewer, not a new scientific atlas.
// Boundary-spanning regions are placed in one group for browsing convenience.
export const LOBE_COLORS = Object.freeze({
  Frontal: '#cc8f8a',
  Parietal: '#84b6b0',
  Temporal: '#b9a0ca',
  Occipital: '#90abc9',
  Limbic: '#c4ae79',
  Insula: '#a3b987',
  'Deep structures': '#c2a896',
});

const LOBE_NAMES = {
  Frontal: ['caudalmiddlefrontal', 'lateralorbitofrontal', 'medialorbitofrontal',
    'paracentral', 'parsopercularis', 'parsorbitalis', 'parstriangularis',
    'precentral', 'rostralmiddlefrontal', 'superiorfrontal', 'frontalpole'],
  Parietal: ['inferiorparietal', 'postcentral', 'precuneus', 'superiorparietal',
    'supramarginal'],
  Temporal: ['bankssts', 'fusiform', 'inferiortemporal', 'middletemporal',
    'superiortemporal', 'temporalpole', 'transversetemporal'],
  Occipital: ['cuneus', 'lateraloccipital', 'lingual', 'pericalcarine'],
  Limbic: ['caudalanteriorcingulate', 'entorhinal', 'isthmuscingulate',
    'parahippocampal', 'posteriorcingulate', 'rostralanteriorcingulate'],
  Insula: ['insula'],
};
const LOBE_BY_NAME = new Map(Object.entries(LOBE_NAMES)
  .flatMap(([lobe, names]) => names.map(name => [name, lobe])));
const EXCLUDED = new Set(['unknown', 'corpuscallosum', 'medialwall', 'medial_wall']);
const readable = name => name.replace(/([a-z])([A-Z])/g, '$1 $2').replaceAll('_', ' ');

/**
 * Keep the original BrainView order: left cortex, right cortex, deep meshes.
 * The first 68 entries therefore keep the existing imported-value indexes.
 * `color` remains the source RGB array; LOBE_COLORS supplies categorical hex.
 */
export function buildCatalog(surfaces = [], deepMeshes = []) {
  const cortex = (surfaces || []).flatMap((surface, index) => {
    const hemisphere = index === 0 ? 'lh' : 'rh';
    return surface.regions.filter(region => region.id > 0 &&
      !EXCLUDED.has(region.name.toLowerCase())).map(region => {
      const lobe = LOBE_BY_NAME.get(region.name.toLowerCase());
      if (!lobe) throw new Error(`No educational group is configured for ${region.name}.`);
      return {...region, key: regionKey(region, hemisphere),
        label: region.label || readable(region.name), hemisphere, type: 'cortex', lobe};
    });
  });
  return [...cortex, ...(deepMeshes || []).map(mesh => ({...mesh,
    label: mesh.label || readable(mesh.name), type: 'subcortex', lobe: 'Deep structures'}))];
}

/** Return visible IDs in catalog order. Hidden accepts an array or Set of IDs.
 * Isolation intersects the current filters, including explicit hiding.
 * This never reorders or removes values from a research dataset.
 */
export function visibleRegionKeys(regions, {
  hemisphere = 'both', structure = 'all', hidden = [], isolate = null,
} = {}) {
  const hiddenKeys = hidden instanceof Set ? hidden : new Set(hidden);
  return new Set(regions.filter(region =>
    (hemisphere === 'both' || region.hemisphere === hemisphere) &&
    (structure === 'all' || (structure === 'deep' ? region.type === 'subcortex' : region.type === 'cortex')) &&
    !hiddenKeys.has(region.key) && (!isolate || region.key === isolate)
  ).map(region => region.key));
}

/** Search labels, atlas IDs, navigation groups and written hemisphere names. */
export function searchedRegions(regions, query = '') {
  const words = String(query).trim().toLowerCase().split(/\s+/).filter(Boolean);
  return regions.filter(region => {
    const text = `${region.label} ${region.name} ${region.key} ${region.lobe} ${region.hemisphere === 'lh' ? 'left' : 'right'}`.toLowerCase();
    return words.every(word => text.includes(word));
  });
}
