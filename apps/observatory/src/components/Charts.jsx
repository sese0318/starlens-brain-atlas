import React from 'react';
import {standardize} from '../core/model.mjs';
const W=660,H=345,L=56,R=15,T=32,B=45;
function linePath(values,min,max){return values.map((v,i)=>`${i?'L':'M'}${L+i*(W-L-R)/(values.length-1)},${T+(max-v)*(H-T-B)/(max-min)}`).join(' ');}
export function RegionalChart({values}){
 const vals=standardize(values);const min=-3,max=3;
 return <svg className="regional-chart" viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Two identical regional observation curves across 82 regions. Model A and Model B overlap exactly.">
  {[-3,-2,-1,0,1,2,3].map(v=><g key={v}><line className="grid" x1={L} x2={W-R} y1={T+(max-v)*(H-T-B)/6} y2={T+(max-v)*(H-T-B)/6}/><text x={L-13} y={T+(max-v)*(H-T-B)/6+4} textAnchor="end">{v}</text></g>)}
  <path className="axis" d={`M${L},${T}V${H-B}H${W-R}`}/>
  {[1,20,40,60,82].map((v)=><text key={v} x={L+(v-1)*(W-L-R)/81} y={H-B+25} textAnchor="middle">{v}</text>)}
  <path d={linePath(vals,min,max)} fill="none" stroke="#00a6c1" strokeWidth="4"/>
  <path d={linePath(vals,min,max)} fill="none" stroke="#ef665c" strokeWidth="2" strokeDasharray="7 4"/>
  <text transform={`translate(16,${(H-B+T)/2}) rotate(-90)`} textAnchor="middle">Standardized structural pattern</text>
  <text x={(L+W-R)/2} y={H-2} textAnchor="middle">Brain regions (index, not distance)</text>
 </svg>;
}
export function ScatterChart({x,y,regions}){
 const sx=standardize(x),sy=standardize(y);const lim=Math.max(3,...sx.map(Math.abs),...sy.map(Math.abs))+.2;
 const px=v=>L+(v+lim)*(W-L-R)/(2*lim),py=v=>T+(lim-v)*(H-T-B)/(2*lim);
 return <svg className="scatter-chart" viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Regional scatterplot of the selected structural pattern against the reference map. This is a descriptive association.">
  <path className="axis" d={`M${L},${T}V${H-B}H${W-R}`}/>
  <line className="grid" x1={px(0)} x2={px(0)} y1={T} y2={H-B}/><line className="grid" x1={L} x2={W-R} y1={py(0)} y2={py(0)}/>
  {sx.map((v,i)=><circle key={i} cx={px(v)} cy={py(sy[i])} r="4.8" fill="#007e87" opacity=".65"><title>{regions[i].label}: reference {x[i].toFixed(4)}, structural {y[i].toFixed(4)}</title></circle>)}
  <text x={(L+W-R)/2} y={H-3} textAnchor="middle">Reference map (standardized)</text>
  <text transform={`translate(17,${(H-B+T)/2}) rotate(-90)`} textAnchor="middle">Structural pattern (standardized)</text>
 </svg>;
}
export function DistributionChart({assay}){
 const sigma=assay.noise;const min=Math.min(assay.a,assay.b)-4*sigma,max=Math.max(assay.a,assay.b)+4*sigma;
 const density=mean=>Array.from({length:161},(_,i)=>{const v=min+(max-min)*i/160;return [v,Math.exp(-.5*((v-mean)/sigma)**2)];});
 const path=mean=>density(mean).map(([x,y],i)=>`${i?'L':'M'}${L+(x-min)*(W-L-R)/(max-min)},${H-B-y*(H-T-B)}`).join(' ');
 return <svg className="distribution-chart" viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`Assumed Gaussian measurement distributions. Separation ${assay.separation.toFixed(2)} noise standard deviations.`}>
  <path className="axis" d={`M${L},${T}V${H-B}H${W-R}`}/>
  <path d={path(assay.a)} stroke="#007e87" strokeWidth="3" fill="none"/><path d={path(assay.b)} stroke="#ef665c" strokeWidth="3" strokeDasharray="8 4" fill="none"/>
  {Array.from({length:5},(_,i)=>min+(max-min)*i/4).map((v,i)=><text key={i} x={L+i*(W-L-R)/4} y={H-B+24} textAnchor="middle">{v.toFixed(2)}</text>)}
  <text transform={`translate(17,${(H-B+T)/2}) rotate(-90)`} textAnchor="middle">Relative density</text><text x={(L+W-R)/2} y={H-2} textAnchor="middle">Assumed measurement (arbitrary units)</text>
 </svg>;
}
export function FunctionBars({a,b,threshold}){
 const max=Math.max(1.5,a.output,b.output,threshold)*1.05;
 return <div className="function-bars"><div className="threshold-label">Threshold ({threshold.toFixed(2)})</div><div className="bar-area">{[a,b].map((s,i)=><div className="function-row" key={i}><span>Model {i?'B':'A'}</span><div className="bar-track"><div className="threshold-line" style={{left:`${threshold/max*100}%`}}/><div className={i?'bar-fill coral':'bar-fill'} style={{width:`${s.output/max*100}%`}}/></div><span>{s.output.toFixed(2)}</span></div>)}</div></div>;
}
