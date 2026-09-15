import React from 'react';
import {ATLAS_COLORS,ATLAS_GRADIENT,layerColor} from '../atlas-colors.mjs';

export default function AtlasColorKey({anatomy,values,label,unit,selectedValue,selectedLabel,opacity,onRestore}){
  if(anatomy)return <div className="brain-color-key anatomy-key" aria-label="Selection color"><span className="color-swatch" style={{background:ATLAS_COLORS.selected}}/><span><b>{selectedLabel}</b><small>Cyan = selected region<br/> Not a measured value</small></span></div>;
  const finite=values?.filter(Number.isFinite)||[],min=Math.min(...finite),max=Math.max(...finite);
  const position=max===min?50:(selectedValue-min)/(max-min)*100;
  return <div className="brain-color-key" aria-label="Map color scale">
    <div className="color-key-heading"><b>{label}</b><span>{unit||'Units not supplied'}</span></div>
    {finite.length>0?<><div className="color-key-ends">{min===max?<span>All values equal</span>:<><span>Blue · Lower</span><span>Orange · Higher</span></>}</div><div className="color-key-ramp" style={{background:min===max?ATLAS_COLORS.middle:ATLAS_GRADIENT}}>{Number.isFinite(selectedValue)&&<i style={{left:`${position}%`}} aria-label={`Selected value ${selectedValue}`}/>}</div><div className="color-key-ticks"><span>{min.toFixed(3)}</span>{min!==max&&<><span>{((min+max)/2).toFixed(3)}</span><span>{max.toFixed(3)}</span></>}</div></>:<p>No numeric values in this layer.</p>}
    <div className="color-key-selection"><span className="color-swatch" style={{background:layerColor(selectedValue,min,max).getStyle()}}/><span>{selectedLabel} <b>{Number.isFinite(selectedValue)?selectedValue.toFixed(3):'No value'}</b></span></div>
    <small><i className="missing-swatch" style={{background:ATLAS_COLORS.missing}}/> Gray = no value · White outline = selected region</small>
    {opacity<1&&<button className="restore-colors" onClick={onRestore}>Transparency is on · Restore full color</button>}
  </div>;
}
