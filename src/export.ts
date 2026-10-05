import {validateBook,MONTHS,type Book} from './model';
const HEADER=['VEWU Finance CSV','2','path','type','value'];
const forbidden=new Set(['__proto__','constructor','prototype']);
const quote=(s:string)=>'"'+s.replaceAll('"','""')+'"';
function flatten(value:unknown,path:string,rows:string[][]) {
  if(value===null){rows.push(['DATA','2',path,'null','']);return;}
  if(Array.isArray(value)){rows.push(['DATA','2',path,'array',String(value.length)]);value.forEach((v,i)=>flatten(v,`${path}/${i}`,rows));return;}
  if(typeof value==='object'){rows.push(['DATA','2',path,'object','']);for(const key of Object.keys(value as object).sort()){if(forbidden.has(key))throw new Error('csv');flatten((value as Record<string,unknown>)[key],`${path}/${key.replaceAll('~','~0').replaceAll('/','~1')}`,rows);}return;}
  if(typeof value==='string'){const escaped=/^[\s]*[=+\-@]|^[\t\r]/.test(value);rows.push(['DATA','2',path,escaped?'escaped text':'text',escaped?"'"+value:value]);return;}
  if(typeof value==='number'&&Number.isFinite(value)){rows.push(['DATA','2',path,'number',String(value)]);return;}
  if(typeof value==='boolean'){rows.push(['DATA','2',path,'boolean',String(value)]);return;}
  throw new Error('csv');
}
export function csv(book:Book):string {
  validateBook(book);const rows=[HEADER];flatten(book,'',rows);return '\uFEFF'+rows.map(row=>row.map(quote).join(',')).join('\r\n')+'\r\n';
}
export function parseCSV(text:string):string[][] {
  const rows:string[][]=[];let row:string[]=[],cell='',quoted=false,closed=false;
  text=text.replace(/^\uFEFF/,'');
  for(let i=0;i<text.length;i++){const c=text[i];
    if(quoted){if(c==='"'){if(text[i+1]==='"'){cell+='"';i++;}else{quoted=false;closed=true;}}else cell+=c;continue;}
    if(c==='"'){if(cell||closed)throw new Error('csv');quoted=true;continue;}
    if(c===','||c==='\n'||c==='\r'){row.push(cell);cell='';closed=false;if(c!==','){if(c==='\r'&&text[i+1]==='\n')i++;rows.push(row);row=[];}continue;}
    if(closed)throw new Error('csv');cell+=c;
  }
  if(quoted)throw new Error('csv');if(cell||row.length||closed){row.push(cell);rows.push(row);}return rows;
}
export function importCSV(text:string):Book {
  if(text.length>20_000_000)throw new Error('large');const rows=parseCSV(text);
  if(JSON.stringify(rows.shift())!==JSON.stringify(HEADER))throw new Error('csvVersion');
  const seen=new Set<string>(),containers=new Map<string,unknown>();let root:unknown;
  for(const row of rows){if(row.length!==5||row[0]!=='DATA'||row[1]!=='2'||seen.has(row[2]))throw new Error('csv');
    const [, ,path,type,raw]=row;seen.add(path);let value:unknown;
    if(type==='object'&&raw==='')value={};
    else if(type==='array'&&/^\d+$/.test(raw)&&Number(raw)<=100000)value=new Array(Number(raw));
    else if(type==='null'&&raw==='')value=null;
    else if(type==='text')value=raw;
    else if(type==='escaped text'&&raw.startsWith("'"))value=raw.slice(1);
    else if(type==='number'&&/^-?(?:0|[1-9]\d*)(?:\.\d+)?(?:e[+-]?\d+)?$/i.test(raw)&&Number.isFinite(Number(raw)))value=Number(raw);
    else if(type==='boolean'&&['true','false'].includes(raw))value=raw==='true';
    else throw new Error('csv');
    if(path===''){if(root!==undefined)throw new Error('csv');root=value;}else{
      if(!path.startsWith('/'))throw new Error('csv');const split=path.lastIndexOf('/'),parent=containers.get(path.slice(0,split)),key=path.slice(split+1).replaceAll('~1','/').replaceAll('~0','~');
      if(!parent||typeof parent!=='object'||forbidden.has(key))throw new Error('csv');
      if(Array.isArray(parent)){if(!/^(0|[1-9]\d*)$/.test(key)||Number(key)>=parent.length)throw new Error('csv');parent[Number(key)]=value;}else (parent as Record<string,unknown>)[key]=value;
    }
    if(value&&typeof value==='object')containers.set(path,value);
  }
  for(const value of containers.values())if(Array.isArray(value))for(let i=0;i<value.length;i++)if(!(i in value))throw new Error('csv');
  const b=validateBook(root);if(b.schema!==2)throw new Error('csvVersion');return b;
}
export function prepareBackup(book:Book,now=new Date()):{book:Book,text:string} {
  const b=structuredClone(book);b.lastBackup=now.toISOString();b.backedUpRevision=b.dataRevision!;
  for(const id of MONTHS){b.months[id].exportedRevision=b.months[id].revision;b.months[id].exportedAt=b.lastBackup;}
  const text=csv(b);if(csv(importCSV(text))!==text)throw new Error('csv');return {book:b,text};
}
export function download(data:string,name:string):string {
  const url=URL.createObjectURL(new Blob([data],{type:'text/csv;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download=name;document.body.append(a);a.click();a.remove();return url;
}
