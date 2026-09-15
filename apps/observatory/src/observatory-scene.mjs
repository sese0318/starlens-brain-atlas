import * as THREE from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {RoomEnvironment} from 'three/addons/environments/RoomEnvironment.js';
import {EffectComposer} from 'three/addons/postprocessing/EffectComposer.js';
import {RenderPass} from 'three/addons/postprocessing/RenderPass.js';
import {UnrealBloomPass} from 'three/addons/postprocessing/UnrealBloomPass.js';
import {OutputPass} from 'three/addons/postprocessing/OutputPass.js';

function disposeTree(root) {
  const materials=new Set(),geometries=new Set(),textures=new Set();
  root.traverse(o=>{if(o.geometry)geometries.add(o.geometry);for(const m of [o.material].flat().filter(Boolean)){materials.add(m);for(const v of Object.values(m))if(v?.isTexture)textures.add(v);}});
  textures.forEach(t=>{t.source?.data?.close?.();t.dispose();});
  geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());
}

export function createObservatory(scene,camera,renderer,onState) {
  renderer.setClearColor('#090f12');renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.08;
  scene.fog=new THREE.FogExp2('#050a0d',.0013);
  const pmrem=new THREE.PMREMGenerator(renderer),room=new RoomEnvironment();
  const lighting=pmrem.fromScene(room,.035);room.dispose();pmrem.dispose();
  scene.environment=lighting.texture;scene.environmentIntensity=.25;
  const ambient=new THREE.HemisphereLight('#b7d0ce','#19232a',.32);scene.add(ambient);
  const key=new THREE.DirectionalLight('#ffe4cb',2.4);key.position.set(-170,240,170);scene.add(key);
  const rim=new THREE.DirectionalLight('#72b9c1',2.3);rim.position.set(180,70,-130);scene.add(rim);
  const fill=new THREE.DirectionalLight('#c7d8e3',.75);fill.position.set(70,50,210);scene.add(fill);
  const composer=new EffectComposer(renderer);
  const renderPass=new RenderPass(scene,camera),bloom=new UnrealBloomPass(new THREE.Vector2(1,1),.19,.42,1.05),output=new OutputPass();
  composer.addPass(renderPass);composer.addPass(bloom);composer.addPass(output);renderer.setClearColor(new THREE.Color(.001,.002,.003));
  let disposed=false,stage=null;
  new GLTFLoader().load(`${import.meta.env.BASE_URL}observatory/stage.glb`,gltf=>{
    if(disposed){disposeTree(gltf.scene);return;}
    stage=gltf.scene;
    // The scene is authored in metres. The existing atlas renderer uses millimetres.
    stage.scale.setScalar(100);stage.position.y=-108;
    const lights=[];stage.traverse(o=>{if(o.isLight||o.isCamera)lights.push(o);for(const m of [o.material].flat().filter(Boolean)){if(m.roughness!==undefined)m.roughness=Math.max(.5,m.roughness);}});lights.forEach(o=>o.removeFromParent());
    scene.add(stage);onState('ready');
  },undefined,()=>{if(!disposed)onState('unavailable');});
  return {
    render:()=>composer.render(),
    resize:(w,h)=>composer.setSize(w,h),
    setDataMode:(value)=>{bloom.enabled=!value;renderer.toneMapping=value?THREE.NoToneMapping:THREE.ACESFilmicToneMapping;},
    dispose(){disposed=true;if(stage){scene.remove(stage);disposeTree(stage);}lighting.dispose();scene.environment=null;for(const l of [ambient,key,rim,fill])scene.remove(l);for(const p of composer.passes)p.dispose?.();composer.dispose();}
  };
}

// Local curvature controls presentation shading only. It never alters positions or data.
export function corticalCavityColors(position,normal,faces) {
  const n=position.count,neighbours=new Float32Array(n*3),counts=new Uint16Array(n);
  for(let i=0;i<faces.length;i+=3)for(let j=0;j<3;j++){
    const a=faces[i+j];for(let k=1;k<=2;k++){const b=faces[i+(j+k)%3];counts[a]++;for(let d=0;d<3;d++)neighbours[a*3+d]+=position.array[b*3+d];}
  }
  const colors=new Float32Array(n*3);
  for(let i=0;i<n;i++){
    let curvature=0;for(let d=0;d<3;d++)curvature+=(neighbours[i*3+d]/Math.max(counts[i],1)-position.array[i*3+d])*normal.array[i*3+d];
    const shade=THREE.MathUtils.clamp(1-Math.max(0,curvature)*.44,.5,1);colors.fill(shade,i*3,i*3+3);
  }
  return new THREE.BufferAttribute(colors,3);
}
