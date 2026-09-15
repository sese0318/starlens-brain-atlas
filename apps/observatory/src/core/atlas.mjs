import {spearman} from './molecular.mjs';

export const ATLAS_ID = 'fsaverage5-dk68';
export const SCHEMA = 'starlens-atlas-v1';

// Explicit anatomical identifiers only. The upstream r01...r82 order is not anatomical.
export function regionKey(region, hemisphere) {
  return region.key || `ctx-${hemisphere}-${region.name}`;
}

export function validateAtlasBundle(data, atlasRegions) {
  if (!data || data.schema !== SCHEMA || data.atlas !== ATLAS_ID)
    throw new Error('This file needs the starlens-atlas-v1 schema and fsaverage5-dk68 atlas. DopaTeam r01…r82 have no anatomical mapping.');
  if (!['synthetic', 'research-aggregate'].includes(data.kind)) throw new Error('Declare synthetic or research-aggregate data.');
  const expected = atlasRegions.map(r => r.key), known = new Set(expected);
  if (!Array.isArray(data.regions) || data.regions.length !== expected.length) throw new Error(`Expected all ${expected.length} cortical region IDs. Use null for a missing measurement.`);
  const ids = data.regions.map(r => r?.id);
  if (new Set(ids).size !== expected.length || ids.some(id => !known.has(id))) throw new Error('Unknown or duplicated anatomical region ID. Array position alone cannot locate a brain region.');
  if (!data.source || typeof data.source.title !== 'string' || !data.source.title.trim()) throw new Error('Add a source title for the values.');
  const order = expected.map(id => ids.indexOf(id));
  function rows(items, label, limit) {
    if (!Array.isArray(items) || !items.length || items.length > limit) throw new Error(`Provide 1 to ${limit} ${label}.`);
    if (new Set(items.map(row => row?.id)).size !== items.length) throw new Error('Repeated layer ID.');
    return items.map(row => {
      if (typeof row?.id !== 'string' || !row.id || typeof (row.label || row.name) !== 'string' || !Array.isArray(row.values) || row.values.length !== expected.length || row.values.some(v => v !== null && !Number.isFinite(v))) throw new Error('Every layer needs an ID, label, and a finite number or null per region.');
      for(const key of ['label','name','unit']) if(row[key]!==undefined && typeof row[key]!=='string') throw new Error('Layer labels, names and units must be text.');
      return {...row, values: order.map(i => row.values[i])};
    });
  }
  return {...data, source:{...data.source,license:typeof data.source.license === 'string' ? data.source.license : 'Not supplied'}, regions:atlasRegions.map(r => ({id:r.key,label:r.label})), profiles:rows(data.profiles,'profiles',20), maps:rows(data.maps,'reference maps',100)};
}

export function makeAtlasExample(regions, blank = false) {
  // Deliberately generated demo values, unrelated to published atrophy or receptor results.
  const profile = regions.map((r,i) => blank ? null : Number((Math.sin(i*1.71)*.75 + Math.cos(i*.43)*.25).toFixed(4)));
  const reference = regions.map((r,i) => blank ? null : Number((Math.cos(i*1.13)*.6 + Math.sin(i*.43)*.4).toFixed(4)));
  return {schema:SCHEMA,atlas:ATLAS_ID,kind:blank?'research-aggregate':'synthetic',source:{title:blank?'Replace with your aggregate data source':'Procedural demo values, not study findings',license:blank?'Specify data reuse conditions':'Demo generated in the browser'},regions:regions.map(r=>({id:r.key,label:r.label})),profiles:[{id:'regional-profile',label:blank?'Regional profile':'Synthetic regional profile',unit:blank?'Specify units':'Arbitrary units',values:profile}],maps:[{id:'reference-pattern',name:blank?'Reference pattern':'Synthetic reference pattern',unit:blank?'Specify units':'Arbitrary units',values:reference}]};
}

export function matchUpstreamBundle(bundle, atlasRegions) {
  const lookup = new Map(bundle.regions.map((r,i)=>[r.id,i]));
  const matched = atlasRegions.filter(r=>lookup.has(r.key)).length;
  if (!matched) return {matched:0,total:atlasRegions.length,bundle:null};
  const remap = row => ({...row,values:atlasRegions.map(r=>lookup.has(r.key)?row.values[lookup.get(r.key)]:null)});
  try { return {matched,total:atlasRegions.length,bundle:validateAtlasBundle({schema:SCHEMA,atlas:ATLAS_ID,kind:bundle.kind,source:{...bundle.source,title:bundle.source?.title?.trim()||'Imported DopaTeam bundle'},regions:atlasRegions.map(r=>({id:r.key,label:r.label})),profiles:bundle.profiles.map(remap),maps:bundle.maps.map(remap)},atlasRegions)}; }
  catch(error){return {matched,total:atlasRegions.length,bundle:null,error:error.message};}
}

export function association(profile, reference) {
  const pairs=profile.map((x,i)=>[x,reference[i]]).filter(([x,y])=>Number.isFinite(x)&&Number.isFinite(y));
  return {n:pairs.length,rho:pairs.length>=3?spearman(pairs.map(p=>p[0]),pairs.map(p=>p[1])):null};
}

export function downloadJSON(value, filename) {
  const link=document.createElement('a'), url=URL.createObjectURL(new Blob([JSON.stringify(value,null,2)],{type:'application/json'}));
  link.href=url;link.download=filename;link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
}
