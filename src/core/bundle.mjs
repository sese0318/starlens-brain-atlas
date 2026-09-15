const finite = values => values.every(Number.isFinite);
export function validateBundle(data){
  if(!data||!['synthetic','research-aggregate'].includes(data.kind))throw new Error('Use a DopaTeam aggregate bundle with a declared data kind.');
  if(!Array.isArray(data.regions)||data.regions.length!==82)throw new Error('Expected exactly 82 aligned regions.');
  if(!Array.isArray(data.profiles)||data.profiles.length<1||data.profiles.length>20||!Array.isArray(data.maps)||data.maps.length<1||data.maps.length>100)throw new Error('Invalid profile or reference map count.');
  const ids=data.regions.map(x=>x.id); if(new Set(ids).size!==82||ids.some(x=>typeof x!=='string'))throw new Error('Region identifiers must be unique strings.');
  for(const rows of [data.profiles,data.maps]){if(new Set(rows.map(x=>x.id)).size!==rows.length)throw new Error('Profile and map identifiers must be unique.');for(const row of rows){if(typeof row.id!=='string'||!Array.isArray(row.values)||row.values.length!==82||!finite(row.values))throw new Error('Each map needs 82 finite values in region order.');}}
  for(const region of data.regions){if(typeof region.label!=='string')throw new Error('Region labels must be text.');}
  for(const profile of data.profiles){if(typeof profile.label!=='string')throw new Error('Profile labels must be text.');}
  for(const map of data.maps){if(typeof map.name!=='string')throw new Error('Map names must be text.');}
  if(data.source!==undefined){if(!data.source||typeof data.source!=='object'||Array.isArray(data.source))throw new Error('Source metadata must be an object.');for(const key of ['verification','title','license']){if(data.source[key]!==undefined&&typeof data.source[key]!=='string')throw new Error('Source descriptions must be text.');}}
  return data;
}
