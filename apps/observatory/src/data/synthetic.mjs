import { standardize } from '../core/molecular.mjs';
// Original deterministic functions, not patient measurements, anatomical coordinates or receptor estimates.
const regional=Array.from({length:82},(_,i)=>Math.sin(i*.38)+.62*Math.cos(i*.19)+.27*Math.sin(i*1.08));
export const syntheticBundle={
 kind:'synthetic',
 source:{title:'Deterministic synthetic observation and reference library',repo:'Original DopaTeam code',verification:'Mathematical illustration only. No biological measurements.',license:'Original synthetic values; no source cohort data.'},
 regions:Array.from({length:82},(_,i)=>({id:`r${String(i+1).padStart(2,'0')}`,label:`Synthetic region ${i+1}`})),
 profiles:[{id:'synthetic',label:'Synthetic structural pattern',values:standardize(regional)}],
 maps:Array.from({length:30},(_,j)=>({id:`reference-${j+1}`,name:`Synthetic reference ${String(j+1).padStart(2,'0')}`,family:'Synthetic',values:standardize(regional.map((x,i)=>Math.sin(i*(.14+j*.013)+j*.5)+.35*Math.cos(i*.09+j)+((j%4===0)?x*.6:0)))}))
};
