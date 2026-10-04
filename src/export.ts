import {MONTHS,FUNDS,KEYS,LABELS,actual,calc,position,dollars,type Book,type MonthId} from './model';
export function snapshotRows(b:Book):(string|number)[][] {
 const rows:(string|number)[][]=[['record_type','month','key','value','date','item','category','amount','fund','revision']];
 const add=(m:string,k:string,v:string|number,revision=0)=>rows.push(['METRIC',m,k,v,'','','','','',revision]);
 add('','schema',1);add('','book',b.id);
 for(const id of MONTHS){const m=b.months[id],c=calc(b,id),p=position(b,id);const a=(k:string,v:number)=>add(id,k,dollars(v),m.revision);
 for(const k of KEYS){a('plan.'+k,m.plan[k]);a('actual.'+k,actual(m,k));}
 for(const k of ['surplus','surplusPlan','savings','savingPlan','remaining','totalFundSpend','ledgerCheck'] as const)a(k,c[k]);
 add(id,'closed',m.closed?1:0,m.revision);a('savings.opening',p.savingsOpening);a('savings.closing',p.savings);a('receivables',p.receivables);
 add(id,'dca',m.assets.dca===null?'':dollars(m.assets.dca),m.revision);add(id,'mm',m.assets.mm===null?'':dollars(m.assets.mm),m.revision);
 for(const f of FUNDS){add(id,f+'.share',m.shares[f]/100,m.revision);a(f+'.planned',p.planned[f]);a(f+'.opening',p.opening[f]);a(f+'.allocation',p.allocation[f]);a(f+'.spend',c.spent[f]);a(f+'.closing',p.closing[f]);}
 for(const t of m.transactions)rows.push(['TRANSACTION',id,t.id,'',Math.round(Date.parse(t.date+'T00:00:00Z')/86400000)+25569,t.item,t.category,dollars(t.amount),t.fund,m.revision]);
 }return rows;
}
export function csv(b:Book){return '\uFEFF'+snapshotRows(b).map(row=>row.map(v=>{let s=String(v);if(typeof v==='string'&&/^[=+\-@\t\r]/.test(s))s="'"+s;return '"'+s.replaceAll('"','""')+'"';}).join(',')).join('\r\n');}
export function download(data:Blob|string,name:string,type='application/json'){const url=URL.createObjectURL(typeof data==='string'?new Blob([data],{type}):data);const a=document.createElement('a');a.href=url;a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),60000);}
export async function archive(b:Book,id:MonthId){
 const [{default:ExcelJS},{default:JSZip}]=await Promise.all([import('exceljs'),import('jszip')]);
 const wb=new ExcelJS.Workbook();wb.creator='VEWU Finance';const ws=wb.addWorksheet(id,{views:[{showGridLines:false}]});
 ws.columns=[{width:4},{width:30},{width:18},{width:18},{width:18},{width:18}];
 ws.addRow(['','VEWU FINANCE · '+id]);ws.addRow(['',b.months[id].closed?'CLOSED · v'+b.months[id].revision:'PREVIEW']);ws.addRow([]);ws.addRow(['','MONTHLY BUDGET','PLAN','ACTUAL','REMAINING']);
 for(const k of KEYS)ws.addRow(['',LABELS[k],dollars(b.months[id].plan[k]),dollars(actual(b.months[id],k)),dollars(b.months[id].plan[k]-actual(b.months[id],k))]);
 const c=calc(b,id),p=position(b,id);ws.addRow([]);ws.addRow(['','Household surplus',dollars(c.surplusPlan),dollars(c.surplus)]);ws.addRow(['','MV Savings',dollars(c.savingPlan),dollars(c.savings)]);ws.addRow([]);ws.addRow(['','FUNDS','OPENING','ALLOCATION','SPENDING','CLOSING']);
 for(const f of FUNDS)ws.addRow(['',f,dollars(p.opening[f]),dollars(p.allocation[f]),dollars(c.spent[f]),dollars(p.closing[f])]);
 ws.addRow([]);ws.addRow(['','Receivables',dollars(p.receivables)]);ws.addRow(['','DCA',b.months[id].assets.dca===null?'Unconfirmed':dollars(b.months[id].assets.dca)]);ws.addRow(['','Money Market',b.months[id].assets.mm===null?'Unconfirmed':dollars(b.months[id].assets.mm)]);ws.eachRow((r,n)=>{r.height=23;r.eachCell(cell=>{cell.font={name:'Courier New',size:10};if(typeof cell.value==='number')cell.numFmt='"$"#,##0.00;[Red]("$"#,##0.00)';});if([1,4,KEYS.length+9].includes(n)){r.font={name:'Courier New',size:10,bold:true};r.eachCell(cell=>{cell.fill={type:'pattern',pattern:'solid',fgColor:{argb:'FFF6E7A7'}};});}});
 const tx=wb.addWorksheet('Daily Spending',{views:[{showGridLines:false}]});tx.columns=[{header:'Date',width:15},{header:'Item',width:32},{header:'Category',width:20},{header:'Amount',width:16},{header:'Fund',width:16}];for(const t of b.months[id].transactions)tx.addRow([t.date,t.item,t.category,dollars(t.amount),t.fund]);tx.eachRow(r=>r.eachCell(cell=>{cell.font={name:'Courier New',size:10};if(typeof cell.value==='number')cell.numFmt='"$"#,##0.00';}));
 const zip=new JSZip();zip.file(id+'-report.xlsx',await wb.xlsx.writeBuffer());zip.file('App Import.csv',csv(b));zip.file('VEWU-backup.json',JSON.stringify(b,null,2));zip.file('存档说明.txt','Google Sheets → App Import → 文件 > 导入 > 上传 CSV → 替换当前工作表。不要选择替换电子表格。每次导入完整季度快照，重复导入不会追加交易。确认 Oct/Nov/Dec 与汇总页后，在应用中标记已存档。');
 return zip.generateAsync({type:'blob'});
}
