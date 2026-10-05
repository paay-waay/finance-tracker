/** Display precision only; callers keep original integer cents for all calculations. */
const entryFormatter=new Intl.NumberFormat('en-CA',{style:'currency',currency:'CAD',minimumFractionDigits:2,maximumFractionDigits:2});
const totalFormatter=new Intl.NumberFormat('en-CA',{style:'currency',currency:'CAD',minimumFractionDigits:0,maximumFractionDigits:0});
const rounded=(n:number)=>{const magnitude=Math.round(Math.abs(n));return magnitude===0?0:n<0?-magnitude:magnitude;};
export const entryMoney=(cents:number)=>entryFormatter.format(cents===0?0:cents/100);
export const money=(cents:number)=>totalFormatter.format(rounded(cents/100));
export const percentage=(amount:number,total:number)=>total>0?`${rounded(amount/total*100)}%`:'—';
