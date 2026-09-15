import {Color} from 'three';

// One linear palette drives both the meshes and the visible legend.
export const ATLAS_COLORS={low:'#1763ef',middle:'#fff1b6',high:'#f15320',missing:'#727981',selected:'#00e5dc'};
export const ATLAS_GRADIENT=`linear-gradient(90deg,${Array.from({length:21},(_,i)=>`${layerColor(i/20,0,1).getStyle()} ${i*5}%`).join(',')})`;
export function layerColor(value,min,max){
  if(!Number.isFinite(value))return new Color(ATLAS_COLORS.missing);
  const t=max===min?.5:Math.max(0,Math.min(1,(value-min)/(max-min)));
  return t<.5?new Color(ATLAS_COLORS.low).lerp(new Color(ATLAS_COLORS.middle),t*2):new Color(ATLAS_COLORS.middle).lerp(new Color(ATLAS_COLORS.high),(t-.5)*2);
}
