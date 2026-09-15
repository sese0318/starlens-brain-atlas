import React,{useEffect,useMemo,useState} from 'react';
import BrainScene from './BrainScene.jsx';
import AtlasColorKey from './AtlasColorKey.jsx';
import AtlasHelp from './AtlasHelp.jsx';
import {ATLAS_ID,regionKey,validateAtlasBundle,makeAtlasExample,matchUpstreamBundle,association,downloadJSON} from '../core/atlas.mjs';
import '../brain.css';
import '../color-guide.css';

const nice=name=>name.replace(/([a-z])([A-Z])/g,'$1 $2').replaceAll('_',' ');
const valueText=v=>Number.isFinite(v)?v.toFixed(3):'No value';

export default function BrainView({bundle,cinematic=false}) {
  const [panel,setPanel]=useState('none');
  const [deepMeshes,setDeepMeshes]=useState([]),[showDeep,setShowDeep]=useState(true);
  const [surfaces,setSurfaces]=useState(null),[error,setError]=useState(''),[selected,setSelected]=useState(''),[search,setSearch]=useState('');
  const [mode,setMode]=useState('anatomy'),[hemisphere,setHemisphere]=useState('both'),[separation,setSeparation]=useState(0),[opacity,setOpacity]=useState(1),[borders,setBorders]=useState(!cinematic),[rotate,setRotate]=useState(false);
  const [preset,setPreset]=useState({name:'oblique'}),[focus,setFocus]=useState(0),[dataset,setDataset]=useState(null),[profileIndex,setProfileIndex]=useState(0),[mapIndex,setMapIndex]=useState(0),[notice,setNotice]=useState('');
  useEffect(()=>{const abort=new AbortController();Promise.all(['lh','rh','subcortex'].map(h=>fetch(`${import.meta.env.BASE_URL}atlas/${h}.json`,{signal:abort.signal}).then(r=>{if(!r.ok)throw new Error('The anatomical model could not be loaded.');return r.json();}))).then(data=>{setSurfaces(data.slice(0,2));setDeepMeshes(data[2].meshes);}).catch(e=>{if(e.name!=='AbortError')setError(e.message);});return()=>abort.abort();},[]);
  const corticalRegions=useMemo(()=>surfaces ? surfaces.flatMap((s,i)=>s.regions.map(r=>({...r,key:regionKey(r,i===0?'lh':'rh'),hemisphere:i===0?'lh':'rh',label:r.label||nice(r.name)}))).filter(r=>!['unknown','corpuscallosum','medialwall','medial_wall'].includes(r.name.toLowerCase())&&r.id>0) : [],[surfaces]);
  const regions=useMemo(()=>[...corticalRegions,...deepMeshes.map(m=>({...m,type:'subcortex'}))],[corticalRegions,deepMeshes]);
  const upstream=useMemo(()=>matchUpstreamBundle(bundle,corticalRegions),[bundle,corticalRegions]);
  useEffect(()=>{if(regions.length&&!selected)setSelected(regions.find(r=>r.name==='superiortemporal')?.key||regions[0].key);},[regions,selected]);
  const region=regions.find(r=>r.key===selected),regionIndex=regions.findIndex(r=>r.key===selected);
  const profile=dataset?.profiles[profileIndex],map=dataset?.maps[mapIndex];
  const values=mode==='profile'?profile?.values:mode==='reference'?map?.values:null;
  const activeLayer=mode==='profile'?profile:map;
  const stats=profile&&map?association(profile.values,map.values):null;
  const loadedCount=(mode==='anatomy'?profile?.values:values)?.filter(Number.isFinite).length||0;
  const visible=regions.filter(r=>(hemisphere==='both'||r.hemisphere===hemisphere)&&`${r.label} ${r.key}`.toLowerCase().includes(search.toLowerCase()));
  function ensureCorticalSelection(){if(region?.type==='subcortex')setSelected(corticalRegions.find(r=>r.name==='superiortemporal')?.key||corticalRegions[0]?.key);}
  function load(data,message){setDataset(data);setProfileIndex(0);setMapIndex(0);setMode('profile');setNotice(message);if(cinematic){resetCamera();ensureCorticalSelection();}}
  function showNumericLayer(layer){setMode(layer);setNotice('');setOpacity(1);if(cinematic){ensureCorticalSelection();if(region?.type==='subcortex')resetCamera();}}
  async function demoColors(){
    try {
      const response=await fetch(`${import.meta.env.BASE_URL}atlas/dummy-atlas.json`);
      if(!response.ok)throw new Error('The dummy data file could not be loaded. Please try again.');
      const data=validateAtlasBundle(await response.json(),corticalRegions);
      load(data,'Dummy data loaded. All values are fictional. Change Profile in Data & evidence to compare three patterns.');
      setPanel('none');
    } catch(e){setNotice(e.message);}
  }
  async function importFile(event){const file=event.target.files?.[0];if(!file)return;try{if(file.size>1000000)throw new Error('Use an aggregate JSON smaller than 1 MB.');load(validateAtlasBundle(JSON.parse(await file.text()),corticalRegions),'Values loaded by anatomical ID. The file stays in this browser.');}catch(e){setNotice(`File rejected. ${e.message}`);}event.target.value='';}
  function resetCamera(){setPreset({name:'oblique'});setSeparation(0);setOpacity(1);setHemisphere('both');setRotate(false);}
  const dataState=mode==='anatomy'?'Template anatomy':dataset?.kind==='synthetic'?'Synthetic example':'Imported aggregate';
  function inside(){setNotice('');setMode('anatomy');setSelected('Left-Hippocampus');setOpacity(.15);setShowDeep(true);setRotate(false);setHemisphere('both');setSeparation(16);setFocus(n=>n+1);setPanel('none');}
  if(error)return <section className="brain-load" role="alert"><h2>Brain model unavailable</h2><p>{error}</p><button className="outline" onClick={()=>window.location.reload()}>Reload</button></section>;
  if(!surfaces)return <section className="brain-load" role="status"><span className="brain-loader"/><h2>Loading the anatomical atlas</h2><p>Preparing the left and right cortical surfaces.</p></section>;
  return <section className={`brain-app${cinematic?' observatory-app':''}`} data-panel={panel} data-layer={mode} aria-label="StarLens 3D brain atlas" onKeyDown={e=>{if(e.key==='Escape')setPanel('none');}}>
    {cinematic&&<nav className="observatory-nav" aria-label="Observatory tools"><a href="./prototype.html" className="observatory-brand"><span className="observatory-symbol">✳</span> STARLENS <small>NEURAL OBSERVATORY</small></a><div><button aria-pressed={panel==='regions'} onClick={()=>setPanel(panel==='regions'?'none':'regions')}>Explore regions</button><button aria-pressed={panel==='data'} onClick={()=>setPanel(panel==='data'?'none':'data')}>Data & evidence</button><button aria-pressed={panel==='help'} onClick={()=>setPanel(panel==='help'?'none':'help')}>How to use</button><button aria-pressed={panel==='about'} onClick={()=>setPanel(panel==='about'?'none':'about')}>About</button><button onClick={async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else await document.documentElement.requestFullscreen();}catch{setNotice('Full screen is unavailable here. The atlas remains interactive.');}}}>Full screen</button></div></nav>}
    <div className="brain-title-row"><div><p className="brain-eyebrow">{cinematic?'ANATOMY, IN A NEW LIGHT':'STARLENS ATLAS'}</p><h1>{cinematic?<>Neural<br/><em>Observatory.</em></>:'Explore the brain in 3D'}</h1>{cinematic&&<><p className="observatory-intro">Click a region to select it.<br/>Load dummy data to see values.</p><button className="observatory-help-trigger" onClick={()=>setPanel('help')}>Start here</button></>}</div><div className="brain-source-badges"><span>fsaverage5 · DK68</span><span className={mode!=='anatomy'&&dataset?.kind==='synthetic'?'demo-tag':''}>{dataState}</span> </div></div>
    {cinematic&&<><div className="observatory-layer-picker" role="group" aria-label="Color display"><button aria-pressed={mode==='anatomy'} onClick={()=>{setMode('anatomy');setNotice('');}}>Anatomy</button><button className={!dataset?'demo-color-cta':''} aria-pressed={mode==='profile'} onClick={()=>dataset?showNumericLayer('profile'):demoColors()}>{dataset?'Regional values':'Load dummy data'}</button><button aria-pressed={mode==='reference'} disabled={!dataset} onClick={()=>showNumericLayer('reference')}>Reference map</button></div><button className="observatory-source-card" onClick={()=>setPanel('data')} aria-label="View data source"><strong>{!dataset?'No study data connected':dataset.kind==='synthetic'?'Dummy data · fictional values':'User-provided aggregate'}</strong><span>{!dataset?'Standard anatomy only':`${loadedCount} of 68 cortical values${mode==='anatomy'?' loaded, not displayed':''}`}</span><small>{!dataset?'Use Load dummy data to begin':dataset.source.title}</small></button></>}
    {cinematic&&<><div className="observatory-chapters" aria-label="Guided exploration"><button onClick={()=>{resetCamera();ensureCorticalSelection();setNotice('');setMode('anatomy');setPanel('regions');}}><small>01</small> Explore the surface <span>↗</span></button><button onClick={inside}><small>02</small> Look inside <span>↗</span></button><button onClick={demoColors}><small>03</small> Load a dummy map <span>↗</span></button></div><div className="observatory-selected" aria-live="polite"><span>{region?.hemisphere==='lh'?'LEFT':'RIGHT'} {region?.type==='subcortex'?'DEEP STRUCTURE':'CORTEX'}</span><strong>{region?.label}</strong><small>{region?.type==='subcortex'?'Anatomy only · no measurement':mode==='anatomy'?'Cyan highlights your selection':`${valueText(values?.[regionIndex])} · ${activeLayer?.unit||'Units not supplied'}`}</small></div></>}
    <div className="brain-layout">
      <aside className="brain-left" aria-label="Atlas controls" hidden={cinematic&&panel!=='regions'}>
        <div className="brain-section-title"><h2>Layers</h2>{cinematic?<button className="close-atlas-panel" aria-label="Close regions" onClick={()=>setPanel('none')}>×</button>:<span>01</span>}</div>
        <div className="brain-layers" role="group" aria-label="Display layer">
          {[['anatomy','Anatomy','Select a region, not a value'],['profile','Regional profile','The profile values'],['reference','Reference map','The comparison values']].map(([id,title,sub])=><button key={id} aria-pressed={mode===id} disabled={id!=='anatomy'&&!dataset} className={mode===id?'selected':''} onClick={()=>{if(id==='anatomy'){setMode(id);setNotice('');}else showNumericLayer(id);}}><span className={`layer-dot ${id}`}/><span><b>{title}</b><small>{sub}</small></span></button>)}
        </div>
        <div className="brain-section-title"><h2>Regions</h2><span>{visible.length} of {regions.length}</span></div>
        <label className="brain-search"><span>Find a brain region</span><input type="search" value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search name or ID"/></label>
        <div className="brain-region-list" aria-label="Brain regions">{visible.map(r=><button key={r.key} aria-pressed={selected===r.key} onClick={()=>{setSelected(r.key);if(r.type==='subcortex'){setShowDeep(true);setOpacity(.2);}}} className={selected===r.key?'selected':''}><i style={{background:`rgb(${r.color.join(',')})`}}/><span>{r.label}</span><small>{r.hemisphere==='lh'?'L':'R'}</small></button>)}{!visible.length&&<p>No matching region. Try an anatomical name such as hippocampus.</p>}</div>
        <p className="brain-small-note">68 cortical parcels and 14 deep structures. Standard anatomy, not an individual scan.</p>
      </aside>
      <div className="brain-stage-column">
        <div className="brain-stage">
          <div className="brain-stage-top"><span>{mode==='anatomy'?'Cortical parcellation':activeLayer?.label||activeLayer?.name}</span><span>{hemisphere==='both'?'Both hemispheres':hemisphere==='lh'?'Left hemisphere':'Right hemisphere'}</span></div>
          <BrainScene cinematic={cinematic} surfaces={surfaces} deepMeshes={deepMeshes} showDeep={showDeep} regions={regions} selected={selected} onSelect={setSelected} exportLabel={mode==='anatomy'?'Standard atlas. Not a patient scan.':dataset?.kind==='synthetic'?'Synthetic values. Not study findings.':'Imported aggregate. Source supplied by uploader.'} values={values} anatomical={mode==='anatomy'} hemisphere={hemisphere} separation={separation} opacity={opacity} showBorders={borders} autoRotate={rotate} preset={preset} focusToken={focus}/>
          <div className="brain-stage-bottom"><span>Drag to rotate · Scroll to zoom · Click to select</span><span>Template surface, not a patient scan</span></div>
          <div className="brain-axis-label">RAS anatomy</div>
        </div>
        <div className="brain-camera-controls" role="group" aria-label="Camera views">{[['oblique','3D'],['left','Left'],['right','Right'],['top','Top'],['front','Front'],['back','Back']].map(([id,label])=><button key={id} onClick={()=>{setPreset({name:id});setRotate(false);}} aria-pressed={preset.name===id}>{label}</button>)}<button onClick={resetCamera}>Reset view</button></div>
        <div className="brain-view-controls">
          <label>Hemisphere<select value={hemisphere} onChange={e=>setHemisphere(e.target.value)}><option value="both">Both</option><option value="lh">Left</option><option value="rh">Right</option></select></label>
          <label>Separate <output>{separation} mm</output><input aria-label="Hemisphere separation" type="range" min="0" max="65" step="1" value={separation} onChange={e=>setSeparation(Number(e.target.value))}/></label>
          <label>Opacity <output>{Math.round(opacity*100)}%</output><input aria-label="Surface opacity" type="range" min={cinematic?.1:.2} max="1" step=".05" value={opacity} onChange={e=>setOpacity(Number(e.target.value))}/></label>
          <div className="brain-switches"><label><input type="checkbox" checked={showDeep} onChange={e=>setShowDeep(e.target.checked)}/> Deep structures</label><label><input type="checkbox" checked={borders} onChange={e=>setBorders(e.target.checked)}/> Borders</label><label><input type="checkbox" checked={rotate} onChange={e=>setRotate(e.target.checked)}/> Auto rotate</label></div>
        </div>
        {(cinematic||mode!=='anatomy')&&<AtlasColorKey anatomy={mode==='anatomy'} values={values} label={activeLayer?.label||activeLayer?.name} unit={activeLayer?.unit} selectedValue={values?.[regionIndex]} selectedLabel={region?.label} opacity={opacity} onRestore={()=>setOpacity(1)}/>}
      </div>
      <aside className="brain-right" aria-label="Selected region and data" hidden={cinematic&&panel!=='data'}>
        <div className="brain-section-title"><h2>Selected region</h2>{cinematic?<button className="close-atlas-panel" aria-label="Close data" onClick={()=>setPanel('none')}>×</button>:<span>02</span>}</div>
        {region&&<div className="brain-region-detail"><p className="brain-eyebrow">{region.hemisphere==='lh'?'LEFT':'RIGHT'} {region.type==='subcortex'?'DEEP STRUCTURE':'CORTEX'}</p><h3>{region.label}</h3><code>{region.key}</code><button onClick={()=>{setHemisphere('both');setRotate(false);if(region.type==='subcortex'){setShowDeep(true);setOpacity(.2);}setFocus(n=>n+1);}}>Focus on region</button><dl><div><dt>Regional profile</dt><dd>{valueText(profile?.values[regionIndex])}</dd></div><div><dt>Reference map</dt><dd>{valueText(map?.values[regionIndex])}</dd></div></dl></div>}
        <div className="brain-section-title"><h2>Data connection</h2><span>03</span></div>
        <p className="brain-data-truth">{dataset?.kind==='research-aggregate'?'Values come from the file you supplied. Anatomical IDs and numeric format are checked. The measurements and image registration are not verified.':'Paper-derived study data are not connected. Demo colors use invented values, not measured atrophy or neurotransmitter levels.'}</p>
        <details><summary>Connect a research-workspace bundle</summary>
          <p className="brain-small-note">This checks the separate research-workspace input, not the atlas file currently displayed.</p>
          <p className="brain-connection">Workspace input <b>{upstream.matched} of {corticalRegions.length} cortical IDs matched</b></p>
          {upstream.bundle?<button className="brain-action" onClick={()=>load(upstream.bundle,`Loaded ${upstream.matched} explicitly matched cortical regions. Other regions remain empty.`)}>Use matched DopaTeam values</button>:<p className="brain-small-note">{upstream.error||'No exact cortical IDs match this bundle. Its region names need a verified atlas crosswalk. Values are never assigned by row number.'}</p>}
        </details>
        <label className="brain-file-button">Open atlas JSON<input aria-label="Open atlas JSON" type="file" accept=".json,application/json" onChange={importFile}/></label>
        <div className="brain-data-actions"><button onClick={()=>downloadJSON(makeAtlasExample(corticalRegions,true),'starlens-atlas-template.json')}>Get data template</button><button onClick={demoColors}>Load dummy data</button></div>
        <p className="brain-small-note">The ready-to-use dummy file has three fictional profiles and three artificial reference maps on 68 named cortical regions. DopaTeam's comparison functions calculate their associations. No MRI processing is needed.</p>
        <p className="brain-small-note"><a href={`${import.meta.env.BASE_URL}atlas/dummy-atlas.json`} download="starlens-dummy-atlas.json">Download dummy JSON</a> · <a href={`${import.meta.env.BASE_URL}atlas/dummy-comparison.json`} download="starlens-dummy-comparison.json">Download dummy comparison results</a></p>
        {dataset&&<div className="brain-data-loaded"><label>Profile<select value={profileIndex} onChange={e=>{setProfileIndex(Number(e.target.value));showNumericLayer('profile');}}>{dataset.profiles.map((p,i)=><option key={p.id} value={i}>{p.label||p.name}</option>)}</select></label><label>Reference<select value={mapIndex} onChange={e=>{setMapIndex(Number(e.target.value));showNumericLayer('reference');}}>{dataset.maps.map((m,i)=><option key={m.id} value={i}>{m.name||m.label}</option>)}</select></label><p className="brain-data-source">{dataset.source?.title}</p><div className="brain-association"><span>Spatial pattern association</span><strong>{stats?.rho===null?'Unavailable':stats?.rho.toFixed(3)}</strong><small>Spearman ρ · {stats?.n} paired regions</small></div><p className="brain-small-note">Descriptive only. No spatial null test, diagnostic accuracy, or treatment prediction.</p><button className="brain-action" onClick={()=>downloadJSON(dataset,'starlens-atlas-session.json')}>Save atlas data JSON</button><button className="brain-clear" onClick={()=>{setDataset(null);setMode('anatomy');setNotice('Overlay cleared. Showing anatomical regions.');}}>Clear overlay</button></div>}
      </aside>
    </div>
    {cinematic&&<button className="observatory-view-toggle" aria-pressed={panel==='view'} onClick={()=>setPanel(panel==='view'?'none':'view')}>{panel==='view'?'Close view controls':'View controls'}</button>}
    {cinematic&&panel==='help'&&<AtlasHelp onClose={()=>setPanel('none')} onDemo={demoColors} onRegions={()=>setPanel('regions')} onData={()=>setPanel('data')}/>}
    {notice&&<p className="brain-notice" role="status">{notice}{cinematic&&<button aria-label="Dismiss message" onClick={()=>setNotice('')}>×</button>}</p>}
    <details className="brain-provenance" open={cinematic?panel==="about":undefined} hidden={cinematic&&panel!=="about"}><summary>Model sources, data boundaries and integration</summary><div>{cinematic&&<p>The exhibition stage was authored with Higgsfield 3D Jutsu. Lighting and surface shading are presentation effects. Anatomical positions and region IDs remain from the original atlas.</p>}<p>The geometry is the fsaverage5 standard cortical surface. Parcel labels come from the Desikan–Killiany atlas. The selection boundary uses the majority vertex label of each mesh triangle. Deep meshes come from a separate fsaverage segmentation with approximately 0.91 mm median surface difference to the cortical source. Their overlay is illustrative standard anatomy, not a precise patient registration.</p><p>This viewer has 68 cortical parcels with numeric overlays and 14 deep structures for anatomy only. It does not reproduce the 83-area MRI analysis in the supplied 2025 paper or the upstream 82-region synthetic example. A receptor reference map describes an external reference population, not this individual’s neurotransmitter levels. No measured atrophy, receptor or gene-expression study values are bundled. Changing the overlay does not change the standard brain shape or locate tissue loss in a patient.</p><p>Sources and redistribution notices are included in <a href={`${import.meta.env.BASE_URL}atlas/PROVENANCE.md`} target="_blank" rel="noreferrer">the model provenance</a>. The data template uses explicit anatomical IDs and null for missing values. The original DopaTeam descriptive correlation code is reused.</p></div></details>
  </section>;
}
