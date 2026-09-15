import React,{useEffect,useRef,useState} from 'react';
import * as THREE from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {regionKey} from '../core/atlas.mjs';
import {createObservatory,corticalCavityColors} from '../observatory-scene.mjs';
import {ATLAS_COLORS,layerColor} from '../atlas-colors.mjs';

export default function BrainScene({surfaces,deepMeshes=[],showDeep=true,regions,selected,onSelect,values,anatomical,hemisphere,separation,opacity,showBorders,autoRotate,preset,focusToken,exportLabel,cinematic=false}) {
  const host=useRef(),sceneRef=useRef(),selectRef=useRef(onSelect),[error,setError]=useState(''),[stageState,setStageState]=useState('loading'),[exporting,setExporting]=useState(false),[exportError,setExportError]=useState('');
  selectRef.current=onSelect;
  useEffect(()=>{
    const el=host.current;
    let renderer;
    try {renderer=new THREE.WebGLRenderer({antialias:true,alpha:false,preserveDrawingBuffer:true});}
    catch {setError('3D rendering is unavailable in this browser. Enable hardware acceleration or open in Chrome. The region list remains available.');return;}
    renderer.setPixelRatio(Math.min(window.devicePixelRatio,cinematic?1.5:2));renderer.setClearColor('#10232c');
    renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.domElement.setAttribute('aria-label','Interactive anatomical brain. Drag to rotate, scroll to zoom, click a region. Keyboard region selection is in the region list.');
    renderer.domElement.setAttribute('role','img');el.appendChild(renderer.domElement);
    const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(35,1,1,2000);
    camera.position.set(...(cinematic?[-310,135,395]:[-230,100,260]));
    const controls=new OrbitControls(camera,renderer.domElement);controls.enableDamping=true;controls.dampingFactor=.09;controls.minDistance=110;controls.maxDistance=700;controls.autoRotateSpeed=.6;controls.target.set(0,10,0);
    const observatory=cinematic?createObservatory(scene,camera,renderer,setStageState):null;
    if(!cinematic){scene.add(new THREE.HemisphereLight('#ffffff','#6c8890',2));
    const light=new THREE.DirectionalLight('#fff0de',2.8);light.position.set(-150,250,200);scene.add(light);
    const fill=new THREE.DirectionalLight('#a6d5e6',1);fill.position.set(180,50,-150);scene.add(fill);}
    const groups=[],meshes=[],borders=[];
    for(const [index,surface] of surfaces.entries()) {
      const hemi=index===0?'lh':'rh',group=new THREE.Group();group.userData.hemi=hemi;scene.add(group);groups.push(group);
      const pos=new Float32Array(surface.positions.length);
      for(let i=0;i<pos.length;i+=3){pos[i]=surface.positions[i];pos[i+1]=surface.positions[i+2];pos[i+2]=-surface.positions[i+1];}
      const original=new THREE.BufferGeometry();original.setAttribute('position',new THREE.BufferAttribute(pos,3));original.setIndex(surface.faces);original.computeVertexNormals();
      const baseNormals=original.getAttribute('normal');
      const cavity=cinematic?corticalCavityColors(original.getAttribute('position'),baseNormals,surface.faces):null;
      const lookup=new Map(surface.regions.map(r=>[r.id,regionKey(r,hemi)]));
      const triangles=new Map();
      const boundary=[];
      for(let i=0;i<surface.faces.length;i+=3){
        const ids=surface.faces.slice(i,i+3),roi=ids.map(v=>surface.region_ids[v]);
        const label=roi[0]===roi[1]||roi[0]===roi[2]?roi[0]:roi[1]===roi[2]?roi[1]:roi[0];
        const key=lookup.get(label)||'unknown';if(!triangles.has(key))triangles.set(key,[]);triangles.get(key).push(...ids);
        for(let j=0;j<3;j++){const a=ids[j],b=ids[(j+1)%3];if(surface.region_ids[a]!==surface.region_ids[b]){boundary.push(...pos.slice(a*3,a*3+3),...pos.slice(b*3,b*3+3));}}
      }
      for(const [key,indices] of triangles){
        const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.BufferAttribute(pos,3));geometry.setAttribute('normal',baseNormals);geometry.setIndex(indices);
        if(cavity)geometry.setAttribute('color',cavity);
        const material=cinematic?new THREE.MeshPhysicalMaterial({color:'#ceb7ad',vertexColors:true,roughness:.46,metalness:0,clearcoat:.17,clearcoatRoughness:.55,side:THREE.DoubleSide}):new THREE.MeshStandardMaterial({color:'#d4d6ce',roughness:.78,metalness:.03,side:THREE.DoubleSide});
        const mesh=new THREE.Mesh(geometry,material);mesh.anatomyMaterial=material;mesh.dataMaterial=new THREE.MeshBasicMaterial({side:THREE.DoubleSide,toneMapped:false,fog:false});mesh.userData={key,hemi};group.add(mesh);meshes.push(mesh);
      }
      const linesGeom=new THREE.BufferGeometry();linesGeom.setAttribute('position',new THREE.Float32BufferAttribute(boundary,3));
      const lines=new THREE.LineSegments(linesGeom,new THREE.LineBasicMaterial({color:'#273d44',transparent:true,opacity:.24,depthWrite:false}));group.add(lines);borders.push(lines);
      original.dispose();
    }
    for(const data of deepMeshes){
      const positions=new Float32Array(data.positions.length);
      for(let i=0;i<positions.length;i+=3){positions[i]=data.positions[i];positions[i+1]=data.positions[i+2];positions[i+2]=-data.positions[i+1];}
      const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.BufferAttribute(positions,3));geometry.setIndex(data.faces);geometry.computeVertexNormals();
      const material=new THREE.MeshStandardMaterial({color:`rgb(${data.color.join(',')})`,roughness:cinematic?.4:.75,side:THREE.DoubleSide});
      const mesh=new THREE.Mesh(geometry,material);mesh.anatomyMaterial=material;mesh.dataMaterial=new THREE.MeshBasicMaterial({side:THREE.DoubleSide,toneMapped:false,fog:false});mesh.userData={key:data.key,hemi:data.hemisphere,deep:true};groups.find(g=>g.userData.hemi===data.hemisphere)?.add(mesh);meshes.push(mesh);
    }
    const raycaster=new THREE.Raycaster(),pointer=new THREE.Vector2();let down=null;
    function hit(event){const rect=renderer.domElement.getBoundingClientRect();pointer.set((event.clientX-rect.left)/rect.width*2-1,-(event.clientY-rect.top)/rect.height*2+1);raycaster.setFromCamera(pointer,camera);const candidates=meshes.filter(m=>m.visible&&m.parent?.visible);const transparent=meshes.find(m=>!m.userData.deep)?.material.opacity<.5;if(transparent){const deepHit=raycaster.intersectObjects(candidates.filter(m=>m.userData.deep),false)[0];if(deepHit)return deepHit;}return raycaster.intersectObjects(candidates,false)[0];}
    const onDown=e=>{down=[e.clientX,e.clientY];if(sceneRef.current)sceneRef.current.transition=null;};
    const onUp=e=>{if(down&&Math.hypot(e.clientX-down[0],e.clientY-down[1])<5){const h=hit(e);if(h&&regions.some(r=>r.key===h.object.userData.key))selectRef.current(h.object.userData.key);}down=null;};
    renderer.domElement.addEventListener('pointerdown',onDown);renderer.domElement.addEventListener('pointerup',onUp);
    const resize=()=>{const {width,height}=el.getBoundingClientRect();if(!width||!height)return;renderer.setSize(width,Math.max(height,1));observatory?.resize(width,height);camera.aspect=width/Math.max(height,1);const portrait=cinematic&&camera.aspect<1;camera.fov=portrait?60:35;if(portrait)camera.setViewOffset(width,height,0,height*.06,width,height);else camera.clearViewOffset();camera.updateProjectionMatrix();};
    const observer=new ResizeObserver(resize);observer.observe(el);resize();
    const draw=()=>observatory?observatory.render():renderer.render(scene,camera);
    const selectionLine=new THREE.LineSegments(new THREE.BufferGeometry(),new THREE.LineBasicMaterial({color:'#f4ebcf',transparent:true,opacity:.9,depthWrite:false,toneMapped:false,fog:false}));selectionLine.name='Selected region boundary';selectionLine.renderOrder=3;
    const move=(position,target)=>{if(!cinematic||window.matchMedia('(prefers-reduced-motion: reduce)').matches){camera.position.copy(position);controls.target.copy(target);controls.update();}else sceneRef.current.transition={start:performance.now(),from:camera.position.clone(),to:position,fromTarget:controls.target.clone(),toTarget:target};};
    sceneRef.current={renderer,scene,camera,controls,meshes,groups,borders,observatory,draw,move,selectionLine,transition:null};
    let frame;function render(){frame=requestAnimationFrame(render);if(el.offsetWidth&&!document.hidden){const t=sceneRef.current?.transition;if(t){const p=Math.min(1,(performance.now()-t.start)/1000),ease=1-Math.pow(1-p,3);camera.position.lerpVectors(t.from,t.to,ease);controls.target.lerpVectors(t.fromTarget,t.toTarget,ease);if(p===1)sceneRef.current.transition=null;}controls.update();draw();}}render();
    return()=>{cancelAnimationFrame(frame);observer.disconnect();controls.dispose();renderer.domElement.removeEventListener('pointerdown',onDown);renderer.domElement.removeEventListener('pointerup',onUp);selectionLine.geometry.dispose();selectionLine.material.dispose();meshes.forEach(m=>{m.geometry.dispose();m.anatomyMaterial.dispose();m.dataMaterial.dispose();});borders.forEach(m=>{m.geometry.dispose();m.material.dispose();});observatory?.dispose();renderer.dispose();renderer.domElement.remove();sceneRef.current=null;};
  },[surfaces,regions,deepMeshes,cinematic]);
  useEffect(()=>{
    const s=sceneRef.current;if(!s)return;
    const finite=values?.filter(Number.isFinite)||[],min=Math.min(...finite),max=Math.max(...finite);
    for(const mesh of s.meshes){const i=regions.findIndex(r=>r.key===mesh.userData.key),r=regions[i];
      mesh.material=!anatomical?mesh.dataMaterial:mesh.anatomyMaterial;
      const color=anatomical&&r?(cinematic?new THREE.Color(mesh.userData.deep?'#a3917c':'#ceb7ad'):new THREE.Color(`rgb(${r.color.join(',')})`)):values&&r?layerColor(values[i],min,max):new THREE.Color('#c8ccc5');
      const highlighted=cinematic&&anatomical&&mesh.userData.key===selected;
      mesh.material.color.copy(highlighted?new THREE.Color(ATLAS_COLORS.selected):color);if(mesh.material.emissive){mesh.material.emissive.set(highlighted?ATLAS_COLORS.selected:mesh.userData.key===selected?'#65c9b5':'#000000');mesh.material.emissiveIntensity=mesh.userData.key===selected?(highlighted?.55:.32):0;}
      mesh.visible=!mesh.userData.deep||showDeep;
      const actualOpacity=mesh.userData.deep?1:opacity;
      mesh.material.opacity=actualOpacity;mesh.material.transparent=actualOpacity<1;mesh.material.depthWrite=actualOpacity>=.95;
    }
    s.groups.forEach(g=>{g.visible=hemisphere==='both'||hemisphere===g.userData.hemi;g.position.x=(g.userData.hemi==='lh'?-1:1)*separation;});
    const selectedMesh=s.meshes.find(m=>m.userData.key===selected);
    if(selectedMesh&&s.selectionLine.userData.key!==selected){s.selectionLine.geometry.dispose();s.selectionLine.geometry=new THREE.EdgesGeometry(selectedMesh.geometry,180);selectedMesh.add(s.selectionLine);s.selectionLine.userData.key=selected;}
    s.selectionLine.visible=cinematic||!anatomical;
    s.borders.forEach(b=>b.visible=showBorders);s.controls.autoRotate=autoRotate;s.observatory?.setDataMode(!anatomical);
  },[values,anatomical,selected,hemisphere,separation,opacity,showBorders,autoRotate,regions,surfaces,deepMeshes,showDeep,cinematic]);
  useEffect(()=>{const s=sceneRef.current;if(!s)return;const points={oblique:cinematic?[-310,135,395]:[-230,100,260],left:[-330,10,0],right:[330,10,0],top:[0,350,1],front:[0,10,-350],back:[0,10,350]};s.camera.up.set(0,1,0);s.move(new THREE.Vector3(...(points[preset.name]||points.oblique)),new THREE.Vector3(0,10,0));},[preset,surfaces,deepMeshes,cinematic]);
  useEffect(()=>{const s=sceneRef.current;if(!s||!focusToken)return;const mesh=s.meshes.find(m=>m.userData.key===selected);if(!mesh)return;
    // Index subsets share positions; compute the selected region's centroid from its indices.
    const p=mesh.geometry.getAttribute('position'),idx=mesh.geometry.index.array,center=new THREE.Vector3();for(const i of idx)center.add(new THREE.Vector3().fromBufferAttribute(p,i));center.divideScalar(idx.length);mesh.localToWorld(center);s.move(center.clone().add(new THREE.Vector3(mesh.userData.hemi==='lh'?-190:190,80,130)),center);
  },[focusToken]);
  function capture(){const s=sceneRef.current;if(!s)return;s.draw();const output=document.createElement('canvas');output.width=s.renderer.domElement.width;output.height=s.renderer.domElement.height;const ctx=output.getContext('2d');ctx.drawImage(s.renderer.domElement,0,0);const scale=output.width/800;ctx.fillStyle='#10232c';ctx.fillRect(0,output.height-65*scale,output.width,65*scale);ctx.fillStyle='#e1eeee';ctx.font=`${14*scale}px Arial`;ctx.fillText(`StarLens · ${anatomical?'Anatomical regions':'Regional overlay'} · ${regions.find(r=>r.key===selected)?.label||''}`,18*scale,output.height-39*scale);ctx.fillStyle='#aec7cf';ctx.font=`${12*scale}px Arial`;ctx.fillText(exportLabel||'Standard atlas. Not a patient scan.',18*scale,output.height-17*scale);const link=document.createElement('a');link.download='starlens-atlas.png';link.href=output.toDataURL('image/png');link.click();}
  async function exportModel(){
    const s=sceneRef.current;if(!s)return;setExporting(true);setExportError('');
    try{
      const {GLTFExporter}=await import('three/addons/exporters/GLTFExporter.js');
      const licenseResponse=await fetch(`${import.meta.env.BASE_URL}atlas/LICENSE-FreeSurfer.txt`);if(!licenseResponse.ok)throw new Error('The required source license could not be loaded.');
      const sourceLicense=await licenseResponse.text();
      const root=new THREE.Group();root.name='StarLens_Neural_Observatory';root.scale.setScalar(.001);
      root.userData={atlas:'fsaverage5-dk68',context:exportLabel,geometry:'Standard anatomy, not an individual scan',environment:'Higgsfield 3D Jutsu',coordinates:'Y up, metres; display hemisphere separation may be applied',license:sourceLicense};
      for(const child of s.scene.children)root.add(child.clone(true));root.updateMatrixWorld(true);
      // glTF readers apply COLOR_0 even when the source material disables vertex colors.
      // Remove anatomy-only shading on private export copies, never the live geometry.
      const exportGeometries=[];root.traverse(node=>{if(node.isMesh&&node.geometry.hasAttribute('color')&&!node.material.vertexColors){node.geometry=node.geometry.clone();node.geometry.deleteAttribute('color');exportGeometries.push(node.geometry);}});
      let binary;try{binary=await new GLTFExporter().parseAsync(root,{binary:true,onlyVisible:true});}finally{exportGeometries.forEach(g=>g.dispose());}
      const url=URL.createObjectURL(new Blob([binary],{type:'model/gltf-binary'}));const a=document.createElement('a');a.href=url;a.download='starlens-neural-observatory.glb';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
    }catch(e){setExportError(`Model export failed. ${e.message}`);}finally{setExporting(false);}
  }
  return <><div ref={host} className="brain-canvas" data-environment={cinematic?stageState:undefined}/>{cinematic&&stageState==="unavailable"&&<p className="stage-warning" role="status">Presentation stage unavailable. Brain anatomy is still interactive.</p>}{exportError&&<p className="stage-warning" role="status">{exportError}</p>}{error&&<div className="brain-render-error" role="alert">{error}</div>}<button className="brain-capture" onClick={capture} disabled={!!error}>Save view PNG</button>{cinematic&&<button className="brain-model-export" onClick={exportModel} disabled={!!error||exporting||stageState!=='ready'}>{exporting?'Preparing model…':'Download 3D model'}</button>}</>;
}
