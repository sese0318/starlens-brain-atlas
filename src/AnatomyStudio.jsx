import React,{useEffect,useMemo,useRef,useState} from 'react';
import StudioScene from './components/StudioScene.jsx';
import {buildCatalog,LOBE_COLORS,visibleRegionKeys,searchedRegions} from './core/studio-catalog.mjs';
import {validateAtlasBundle,association,downloadJSON,makeAtlasExample} from './core/atlas.mjs';
import {ATLAS_GRADIENT,ATLAS_COLORS} from './atlas-colors.mjs';

const fmt=v=>Number.isFinite(v)?v.toFixed(3):'No value';
const short=r=>r?.label?.replace(/^(Left|Right) /,'')||'Select a structure';
const title=l=>l?.label||l?.name||'';
function Mark(){return <svg viewBox="0 0 32 32" aria-hidden="true"><path d="M16 2 20 12 30 16 20 20 16 30 12 20 2 16 12 12Z" fill="currentColor"/><circle cx="16" cy="16" r="4" fill="#111418"/></svg>;}
function Scatter({profile,map,regions,selected,onSelect}){
 const pairs=regions.map((r,i)=>({r,x:profile.values[i],y:map.values[i]})).filter(p=>Number.isFinite(p.x)&&Number.isFinite(p.y));
 if(!pairs.length)return <p>No paired values.</p>;
 const xs=pairs.map(p=>p.x),ys=pairs.map(p=>p.y),x0=Math.min(...xs),x1=Math.max(...xs),y0=Math.min(...ys),y1=Math.max(...ys);
 return <figure className="scatter"><svg viewBox="0 0 280 206" role="group" aria-label="Profile versus reference. Select a dot to select its region.">
 {[0,.5,1].map(t=><g key={t}><path d={`M34 ${34+t*140}H252`} stroke="#30363d"/><text x="27" y={38+t*140} textAnchor="end">{(y1-t*(y1-y0)).toFixed(2)}</text></g>)}
 <path d="M34 30V174H255" fill="none" stroke="#68717c"/>
 {pairs.map(p=><circle key={p.r.key} cx={34+(p.x-x0)/(x1-x0||1)*218} cy={174-(p.y-y0)/(y1-y0||1)*140} r={selected===p.r.key?5.5:3.2} fill={selected===p.r.key?'#00e5dc':'#b1bbc7'} opacity={selected===p.r.key?1:.65} tabIndex="0" role="button" aria-label={`${p.r.label}, profile ${fmt(p.x)}, reference ${fmt(p.y)}`} onClick={()=>onSelect(p.r.key)} onKeyDown={e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();onSelect(p.r.key);}}}><title>{p.r.label} · {fmt(p.x)} · {fmt(p.y)}</title></circle>)}
 <text x="34" y="191">{x0.toFixed(2)}</text><text x="252" y="191" textAnchor="end">{x1.toFixed(2)}</text>
 </svg><figcaption>Horizontal = profile · Vertical = reference<br/>Select a dot to locate its region.</figcaption></figure>;
}
export default function Studio(){
 const [assets,setAssets]=useState(null),[error,setError]=useState(''),[selected,setSelected]=useState('ctx-lh-superiortemporal');
 const [mode,setMode]=useState('anatomy'),[explode,setExplode]=useState(0),[opacity,setOpacity]=useState(1),[borders,setBorders]=useState(false),[rotate,setRotate]=useState(false),[colorByLobe,setColorByLobe]=useState(false);
 const [hemisphere,setHemisphere]=useState('both'),[structure,setStructure]=useState('all'),[hidden,setHidden]=useState([]),[isolate,setIsolate]=useState(null),[query,setQuery]=useState('');
 const [preset,setPreset]=useState({name:'oblique',nonce:0}),[focusToken,setFocusToken]=useState(0),[dataset,setDataset]=useState(null),[profileIndex,setProfileIndex]=useState(0),[mapIndex,setMapIndex]=useState(0),[notice,setNotice]=useState(''),[panel,setPanel]=useState('none');
 const help=useRef(),file=useRef(),anatomyPanel=useRef(),dataPanel=useRef();
 useEffect(()=>{const abort=new AbortController();Promise.all(['lh','rh','subcortex'].map(n=>fetch(`./atlas/${n}.json`,{signal:abort.signal}).then(r=>{if(!r.ok)throw Error('The anatomical assets could not be loaded.');return r.json();}))).then(([lh,rh,deep])=>setAssets({surfaces:[lh,rh],deepMeshes:deep.meshes})).catch(e=>{if(e.name!=='AbortError')setError(e.message);});return()=>abort.abort();},[]);
 const regions=useMemo(()=>assets?buildCatalog(assets.surfaces,assets.deepMeshes):[],[assets]);
 const cortex=useMemo(()=>regions.filter(r=>r.type==='cortex'),[regions]);
 const visibleKeys=useMemo(()=>Array.from(visibleRegionKeys(regions,{hemisphere,structure,hidden,isolate})),[regions,hemisphere,structure,hidden,isolate]);
 const visibleSet=useMemo(()=>new Set(visibleKeys),[visibleKeys]);
 const region=regions.find(r=>r.key===selected),ri=cortex.findIndex(r=>r.key===selected);
 const profile=dataset?.profiles[profileIndex],map=dataset?.maps[mapIndex],layer=mode==='profile'?profile:mode==='reference'?map:null,values=layer?.values||null;
 const finite=values?.filter(Number.isFinite)||[],min=finite.length?Math.min(...finite):null,max=finite.length?Math.max(...finite):null;
 const stats=profile&&map?association(profile.values,map.values):null,filtered=searchedRegions(regions,query);
 function view(name){setPreset(p=>({name,nonce:p.nonce+1}));setRotate(false);}
 function select(key){setSelected(key);const r=regions.find(r=>r.key===key);setHidden(h=>h.filter(k=>k!==key));setIsolate(null);if(r&&hemisphere!=='both'&&hemisphere!==r.hemisphere)setHemisphere('both');if(r?.type==='subcortex'){setStructure('all');setOpacity(.16);}else if(structure==='deep')setStructure('all');}
 function toggleVisibility(key){
  if(visibleSet.has(key)){setHidden(h=>h.includes(key)?h:[...h,key]);return;}
  const r=regions.find(r=>r.key===key);if(!r)return;
  setHidden(h=>h.filter(k=>k!==key));setIsolate(null);
  if(hemisphere!=='both'&&hemisphere!==r.hemisphere)setHemisphere('both');
  if((structure==='deep'&&r.type==='cortex')||(structure==='cortex'&&r.type==='subcortex'))setStructure('all');
  if(r.type==='subcortex')setOpacity(.16);
  if(isolate)view('oblique');
 }
 function restore(){setHidden([]);setIsolate(null);setHemisphere('both');setStructure('all');setOpacity(1);}
 function toggleIsolation(){
  if(isolate===selected){restore();view('oblique');return;}
  setHidden(h=>h.filter(k=>k!==selected));setHemisphere('both');setStructure('all');setOpacity(1);setIsolate(selected);setFocusToken(t=>t+1);
 }
 function reset(){restore();setExplode(0);setMode('anatomy');setColorByLobe(false);setBorders(false);setQuery('');view('oblique');setNotice('Original arrangement restored. Loaded data is retained.');}
 function reveal(){restore();setMode('anatomy');setExplode(.55);setOpacity(.12);setSelected('Left-Hippocampus');setBorders(false);view('oblique');setNotice('Deep structures revealed. The outer cortex is transparent.');}
 function explodeView(){restore();setMode('anatomy');setExplode(.7);setColorByLobe(true);setBorders(true);view('oblique');setNotice('Surface patches are separated for inspection. This is a display transformation.');}
 function load(data,message){
  const validated=validateAtlasBundle(data,cortex);
  setDataset(validated);setProfileIndex(0);setMapIndex(0);restore();setMode('profile');
  if(region?.type!=='cortex')setSelected(cortex.find(r=>r.name==='superiortemporal')?.key||cortex[0]?.key);
  view('oblique');setNotice(message);
 }
 async function dummy(){try{const r=await fetch('./atlas/dummy-atlas.json');if(!r.ok)throw Error('Could not load the demo.');load(await r.json(),'Synthetic demo loaded. All values are fictional, in arbitrary units.');}catch(e){setNotice(e.message);}}
 async function importFile(e){const f=e.target.files?.[0];if(!f)return;try{if(f.size>1000000)throw Error('Use an aggregate JSON smaller than 1 MB.');load(JSON.parse(await f.text()),'Loaded by anatomical ID. The file stays in your browser.');}catch(err){setNotice('File rejected. '+err.message);}e.target.value='';}
 function showMode(m){
  setMode(m);if(m==='anatomy')return;
  setOpacity(1);
  const visibleCortex=cortex.filter(r=>visibleSet.has(r.key));
  if(!visibleCortex.length){restore();setSelected(cortex.find(r=>r.name==='superiortemporal')?.key||cortex[0]?.key);view('oblique');}
  else if(region?.type!=='cortex'){setSelected(visibleCortex[0].key);view('oblique');}
 }
 function focus(){if(!region)return;setHidden(h=>h.filter(k=>k!==selected));setHemisphere('both');setStructure('all');setIsolate(null);if(region.type==='subcortex')setOpacity(.12);setFocusToken(t=>t+1);}
 function togglePanel(next){setPanel(next);requestAnimationFrame(()=>requestAnimationFrame(()=>{if(next==='none')window.scrollTo({top:0,behavior:'smooth'});else (next==='anatomy'?anatomyPanel:dataPanel).current?.scrollIntoView({behavior:'smooth',block:'start'});}));}
 const state=mode==='anatomy'?'Standard anatomy':dataset?.kind==='synthetic'?'Synthetic demo':'Imported aggregate';
 if(error)return <main className="loading"><h1>Atlas unavailable</h1><p role="alert">{error}</p><button onClick={()=>location.reload()}>Reload</button></main>;
 if(!assets)return <main className="loading"><Mark/><h1>Preparing the brain atlas</h1><p>Loading 68 cortical parcels and 14 deep structures.</p></main>;
 return <div className="studio" data-mobile-panel={panel}>
 <header className="masthead"><a className="brand" href="./"><Mark/><span>STARLENS <small>ANATOMY STUDIO</small></span></a><div className="edition">AN INDEPENDENT EXPLORER <span>01</span></div><div className="header-actions"><button onClick={()=>help.current.showModal()}>How to use</button><a href="./observatory.html" target="_blank" rel="noreferrer">Original atlas ↗</a><button onClick={reset}>Reset view</button></div></header>
 <div className="workspace">
 <aside ref={anatomyPanel} className="anatomy-panel" aria-label="Anatomy browser"><div className="panel-heading"><span className="eyebrow">STRUCTURE LIBRARY</span><strong>{regions.length}</strong></div><h2>A brain, in parts.</h2><label className="search"><input type="search" placeholder="Find a structure or lobe…" aria-label="Search structures" value={query} onChange={e=>setQuery(e.target.value)}/><span aria-hidden="true">⌕</span></label>
 <div className="filter-row"><label>Hemisphere<select value={hemisphere} onChange={e=>setHemisphere(e.target.value)}><option value="both">Both sides</option><option value="lh">Left side</option><option value="rh">Right side</option></select></label><label>Layer<select value={structure} onChange={e=>setStructure(e.target.value)}><option value="all">All anatomy</option><option value="cortex">Cortex</option><option value="deep">Deep structures</option></select></label></div>
 <div className="library-status"><span>{visibleKeys.length} visible</span><button onClick={restore}>Restore all</button></div>
 <div className="structure-list">{Object.keys(LOBE_COLORS).map(group=>{const rows=filtered.filter(r=>r.lobe===group);return rows.length?<details key={group} open={query?true:undefined} className="structure-group"><summary><i style={{background:LOBE_COLORS[group]}}/>{group}<small>{rows.length}</small></summary><div>{rows.map(r=><div className={`structure-row ${selected===r.key?'selected':''}`} key={r.key}><button className="region-select" aria-pressed={selected===r.key} onClick={()=>select(r.key)}><small>{r.hemisphere==='lh'?'L':'R'}</small><span>{short(r)}</span></button><button className="visibility" aria-label={`${visibleSet.has(r.key)?'Hide':'Show'} ${r.label}`} onClick={()=>toggleVisibility(r.key)}>{visibleSet.has(r.key)?'◉':'○'}</button></div>)}</div></details>:null;})}{!filtered.length&&<p className="empty">No match. Try “hippocampus” or “temporal”.</p>}</div>
 <footer className="library-footer"><span>68 cortical parcels · 14 deep structures</span><button onClick={()=>help.current.showModal()}>Sources and model limits ↗</button></footer></aside>
 <main className="viewer" aria-label="Interactive anatomy workspace"><div className="viewer-heading"><div><span className="eyebrow">EXPLORE WHAT LIES WITHIN</span><h1>The anatomy of connection.</h1></div><span className={`status-badge ${mode!=='anatomy'?'data-badge':''}`}><i/>{state}</span></div>
 <div className="view-pills" role="group" aria-label="Camera views">{['oblique','front','back','left','right','top'].map(name=><button key={name} aria-pressed={preset.name===name} onClick={()=>view(name)}>{name==='oblique'?'3D':name[0].toUpperCase()+name.slice(1)}</button>)}</div>
 <div className="canvas-wrap"><StudioScene {...assets} regions={regions} selected={selected} onSelect={select} visibleKeys={visibleKeys} values={values} mode={mode} explode={explode} opacity={opacity} borders={borders} rotate={rotate} preset={preset} focusToken={focusToken} colorByLobe={colorByLobe} lobeColors={LOBE_COLORS}/></div>
 <div className="canvas-bottom"><div className="selection-caption"><span className="selection-dot"/><div><small>{region?.hemisphere==='lh'?'LEFT':'RIGHT'} · {region?.lobe?.toUpperCase()}</small><strong>{short(region)}</strong></div></div><p>Drag to orbit · Scroll to zoom<br/>Click a structure to inspect</p></div>
 {mode!=='anatomy'&&<div className="color-legend"><div><strong>{title(layer)}</strong><span>{layer?.unit||'Units not supplied'}</span></div>{finite.length?<><div className="numeric-ramp" style={{background:ATLAS_GRADIENT}}/><div><span>{fmt(min)}</span><span>{fmt((min+max)/2)}</span><span>{fmt(max)}</span></div></>:<p className="empty-layer">No numeric values in this layer.</p>}<small><i style={{background:ATLAS_COLORS.missing}}/>No value <i style={{background:ATLAS_COLORS.selected}}/>Selection outline · {finite.length} of 68 values</small></div>}
 {mode==='anatomy'&&colorByLobe&&<div className="color-legend anatomy-legend" aria-label="Anatomical navigation group colors"><div><strong>Anatomical groups</strong><span>Categorical colors</span></div><div className="lobe-legend-items">{Object.entries(LOBE_COLORS).map(([name,color])=><span className="lobe-legend-item" key={name}><i style={{background:color}} aria-hidden="true"/>{name}</span>)}</div><small><i style={{background:ATLAS_COLORS.selected}}/>Selection outline · Groups aid browsing, not measurement.</small></div>}
 <section className="decomposition" aria-label="Decomposition controls"><div className="decomposition-title"><label htmlFor="explode">Separate the structures</label><output htmlFor="explode">{Math.round(explode*100)}%</output></div><div className="explode-range"><span>Assembled</span><input id="explode" type="range" min="0" max="1" step=".01" value={explode} onChange={e=>setExplode(Number(e.target.value))}/><span>Exploded</span></div><div className="quick-actions"><button className="primary" onClick={explodeView}>Explore in parts ↗</button><button onClick={reveal}>Reveal deep structures</button><button onClick={()=>{setExplode(0);view('oblique');}}>Reassemble</button></div><p className="transform-note">Separation changes the display only. Anatomy and data IDs stay fixed.</p></section></main>
 <aside ref={dataPanel} className="inspector" aria-label="Structure inspector and data"><div className="panel-heading"><span className="eyebrow">INSPECT STRUCTURE</span><span className="cyan-mark">◈</span></div><h2>{short(region)}</h2><p className="location">{region?.hemisphere==='lh'?'Left':'Right'} hemisphere · {region?.type==='cortex'?'Cortical surface':'Deep structure'}</p><code className="region-id">{selected}</code>
 <div className="selection-actions"><button onClick={focus}>Focus</button><button aria-pressed={isolate===selected} onClick={toggleIsolation}>{isolate===selected?'Show all':'Isolate'}</button><button onClick={()=>toggleVisibility(selected)}>{visibleSet.has(selected)?'Hide':'Show'}</button></div>
 {!visibleSet.has(selected)&&<p className="inline-note">This structure is hidden by the current visibility settings.</p>}
 <section className="display-settings"><div className="section-title">Appearance</div><div className="segmented" role="group" aria-label="Appearance mode"><button aria-pressed={mode==='anatomy'&&!colorByLobe} onClick={()=>{setMode('anatomy');setColorByLobe(false);}}>Surface</button><button aria-pressed={mode==='anatomy'&&colorByLobe} onClick={()=>{setMode('anatomy');setColorByLobe(true);}}>Lobes</button><button aria-pressed={mode==='profile'} onClick={()=>dataset?showMode('profile'):dummy()}>Data</button></div><label className="range-label">Cortex opacity <output>{mode === 'anatomy' ? Math.round(opacity*100) : 100}%</output><input disabled={mode !== 'anatomy'} type="range" min=".05" max="1" step=".01" value={opacity} onChange={e=>setOpacity(Number(e.target.value))}/></label><div className="check-row"><label><input type="checkbox" checked={borders} onChange={e=>setBorders(e.target.checked)}/> Parcel borders</label><label><input type="checkbox" checked={rotate} onChange={e=>setRotate(e.target.checked)}/> Auto orbit</label></div></section>
 <section className="data-panel"><div className="panel-heading"><span className="eyebrow">REGIONAL COMPARISON</span><span className="data-count">DK68</span></div>
 {!dataset?<><h3>Connect anatomy to values.</h3><p>Load a small fictional dataset to compare regional patterns with reference maps.</p><button className="load-demo" onClick={dummy}>Load synthetic demo ↗</button><p className="fine">No patient or paper-derived atrophy data is bundled.</p></>:<>
 <div className="source-state">{dataset.kind==='synthetic'?'SYNTHETIC · FICTIONAL VALUES':'USER-PROVIDED AGGREGATE'}</div>
 <label>Profile<select value={profileIndex} onChange={e=>{setProfileIndex(Number(e.target.value));showMode('profile');}}>{dataset.profiles.map((p,i)=><option key={p.id} value={i}>{title(p)}</option>)}</select></label>
 <label>Reference<select value={mapIndex} onChange={e=>{setMapIndex(Number(e.target.value));showMode('reference');}}>{dataset.maps.map((m,i)=><option key={m.id} value={i}>{title(m)}</option>)}</select></label>
 <div className="segmented" role="group" aria-label="Data overlay"><button aria-pressed={mode==='profile'} onClick={()=>showMode('profile')}>Show profile</button><button aria-pressed={mode==='reference'} onClick={()=>showMode('reference')}>Show reference</button></div>
 <div className="selected-values"><div><small>Selected profile value</small><strong>{fmt(profile?.values[ri])}</strong><span>{region?.type==='subcortex'?'Anatomy only':profile?.unit||'Units not supplied'}</span></div><div><small>Reference value</small><strong>{fmt(map?.values[ri])}</strong><span>{region?.type==='subcortex'?'No numeric mapping':map?.unit||'Units not supplied'}</span></div></div>
 <div className="correlation"><div><small>Spatial pattern association</small><strong>{fmt(stats?.rho)} <span>ρ</span></strong></div><p>Spearman<br/>{stats?.n} paired regions</p></div>
 <Scatter profile={profile} map={map} regions={cortex} selected={selected} onSelect={select}/>
 <p className="fine">Descriptive correlation. No spatial null test, diagnosis or treatment prediction. Hiding structures does not change the comparison.</p>
 <details className="source-details"><summary>Data source and limits</summary><p>{dataset.source.title}</p><p>{dataset.source.license}</p><p>IDs and formats are validated. Measurements and registration are not verified.</p></details>
 <div className="data-actions"><button onClick={()=>downloadJSON(dataset,'starlens-atlas-data.json')}>Save data</button><button onClick={()=>{setDataset(null);setMode('anatomy');setNotice('Data cleared. Standard anatomy is visible.');}}>Clear data</button></div></>}
 <input className="sr-only" ref={file} type="file" accept=".json,application/json" aria-label="Import atlas JSON" onChange={importFile}/><div className="data-actions"><button onClick={()=>file.current.click()}>Import atlas JSON</button><button onClick={()=>downloadJSON(makeAtlasExample(cortex,true),'starlens-atlas-template.json')}>Get template</button></div><p className="fine">Explicit anatomical IDs required. Files stay in your browser.</p></section></aside>
 </div>
 <nav className="mobile-tools" aria-label="Mobile panels"><button aria-pressed={panel==='none'} onClick={()=>togglePanel('none')}>3D canvas</button><button aria-pressed={panel==='anatomy'} onClick={()=>togglePanel(panel==='anatomy'?'none':'anatomy')}>Anatomy</button><button aria-pressed={panel==='data'} onClick={()=>togglePanel(panel==='data'?'none':'data')}>Inspect & data</button></nav>
 {notice&&<div className="notice" role="status"><span>{notice}</span><button aria-label="Dismiss message" onClick={()=>setNotice('')}>×</button></div>}
 <dialog ref={help} className="help-dialog"><div className="help-heading"><div><span className="eyebrow">YOUR FIELD GUIDE</span><h2>Explore. Separate. Compare.</h2></div><button aria-label="Close guide" onClick={()=>help.current.close()}>×</button></div>
 <ol><li><strong>Explore the anatomy</strong><p>Drag the brain to rotate, scroll or pinch to zoom. Select a structure on the brain or in the searchable library. Focus brings it closer.</p></li><li><strong>Take it apart</strong><p>Move Separate the structures to spread the parts. Explore in parts also colors navigation groups. Reveal deep structures makes the cortex transparent. Isolate shows only your selection. Restore all reveals hidden structures. Reassemble returns parts to their original positions.</p></li><li><strong>Compare patterns</strong><p>Load synthetic demo adds three fictional profiles and three artificial references. Choose inputs and use Show profile or Show reference. Blue through orange shows values, gray means no value, and a cyan outline marks your selection. Hiding structures does not change the scale or comparison.</p></li><li><strong>Import aggregate data</strong><p>Get template provides the required 68 IDs. Fill in values, units and source, keeping null for missing values. Import atlas JSON validates and reorders by ID. It does not process MRI volumes or verify measurement accuracy. On a phone, use Anatomy or Inspect & data below the canvas to open a panel.</p></li></ol>
 <section><h3>What this model represents</h3><p>Standard FreeSurfer fsaverage anatomy, with 68 Desikan–Killiany cortical parcels and 14 deep structures. Cortical parcels are open surface patches, not solid tissue blocks. Decomposition is a display transformation, not dissection or tissue loss. The deep and cortical source templates have approximately 0.91 mm median surface difference and are not patient registration.</p><p>Deep structures have no numeric input in the DK68 contract. There are no cerebellum, brainstem, vessels or fiber tracts. Navigation groups are browsing conveniences, not a new scientific atlas. This model does not reproduce the reference tool's stated 263 meshes.</p><p>No measured atrophy, receptor or gene-expression data is bundled. An external reference pattern is not an individual's neurotransmitter amount. Correlation does not establish cause, diagnosis or treatment efficacy.</p></section>
 <section><h3>Sources and credits</h3><p>Geometry converted from FreeSurfer. <a href="./atlas/PROVENANCE.md" target="_blank" rel="noreferrer">Model provenance</a> · <a href="./atlas/LICENSE-FreeSurfer.txt" target="_blank" rel="noreferrer">FreeSurfer license</a>. Comparison uses <a href="https://github.com/Rifelimo/DopaTeam" target="_blank" rel="noreferrer">DopaTeam</a> functions.</p><p>The decomposition concept was inspired by Pierce B.'s educational tool as described by the user. Its code and assets are not included. This independent version uses the existing StarLens geometry.</p></section><button className="primary" onClick={()=>help.current.close()}>Start exploring</button>
 </dialog></div>;
}

