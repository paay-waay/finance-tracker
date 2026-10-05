export const MONTHS = ['2026-10', '2026-11', '2026-12'] as const;
export type MonthId = typeof MONTHS[number];
export const FUNDS = ['General', 'Travel', 'Pet', 'Irregular'] as const;
export type Fund = typeof FUNDS[number];
export const CATEGORIES = ['Groceries', 'Charging/407', 'Entertainment', 'Misc', 'Funded'] as const;
export type Category = typeof CATEGORIES[number];
export const GROUPS = {
  income: ['pw', 'mv', 'leo'], personal: ['pwPersonal', 'mvPersonal', 'investment'],
  fixed: ['insurance', 'condo', 'tax', 'internet', 'mortgage', 'car', 'ikea', 'streaming'],
  daily: ['groceries', 'charging', 'entertainment', 'misc'],
} as const;
export const LABELS: Record<string, string> = {pw:'PW Salary',mv:'MV Income',leo:'Leo Repayment',pwPersonal:'PW Personal',mvPersonal:'MV Personal',investment:'Investment',insurance:'Insurance',condo:'Condo Admin',tax:'Property Tax',internet:'Internet',mortgage:'Mortgage',car:'Car Payment',ikea:'Ikea Payment',groceries:'Groceries',charging:'Charging/407',entertainment:'Entertainment',misc:'Misc',streaming:'Streaming'};
export const KEYS = Object.values(GROUPS).flat() as string[];
export const DAILY: Record<string, Category> = {groceries:'Groceries',charging:'Charging/407',entertainment:'Entertainment',misc:'Misc'};
export type Language = 'zh' | 'en';
export type Scope = 'month' | 'future';
export type Transaction = {id:string,date:string,item:string,category:Category,amount:number,fund:Fund|''};
// Legacy fields remain in storage and history so upgrades never discard V1 records.
export type Month = {plan:Record<string,number>,actual:Record<string,number|null>,shares:Record<Fund,number>,transactions:Transaction[],checks:Record<'income'|'fixed'|'ledger'|'assets',boolean>,assets:{dca:number|null,mm:number|null},closed:boolean,revision:number,closedAt:string|null,exportedRevision:number|null,archivedRevision:number|null,needsArchive:boolean,exportedAt?:string|null,archivedAt?:string|null};
export type Book = {schema:1|2,currency:'CAD',id:string,opening:{funds:Record<Fund,number>,savings:number,receivables:number,dca:number,mm:number},rules:{mvBaseline:number},months:Record<MonthId,Month>,history:{month:MonthId,revision:number,closedAt:string,snapshot:Month}[],settings:{theme:'system'|'light'|'dark',glass:number,reduceMotion:boolean,reduceTransparency:boolean,language?:Language},lastBackup:string|null,dataRevision?:number,backedUpRevision?:number|null,reminderDismissedOn?:string|null};
export const cents = (n:number) => Math.round((n + Number.EPSILON) * 100);
export const dollars = (n:number) => n / 100;
export const money = (n:number) => new Intl.NumberFormat('en-CA',{style:'currency',currency:'CAD',maximumFractionDigits:0,minimumFractionDigits:0}).format(n/100);
export const shortMonth = (m:MonthId) => ({'2026-10':'October','2026-11':'November','2026-12':'December'}[m]);
export const monthLabel = (m:MonthId) => `${Number(m.slice(5))}月`;
export function blankBook():Book {
  const months = {} as Book['months'];
  for (const m of MONTHS) months[m] = {plan:Object.fromEntries(KEYS.map(k=>[k,0])),actual:Object.fromEntries(KEYS.filter(k=>!DAILY[k]).map(k=>[k,null])),shares:{General:70,Travel:30,Pet:0,Irregular:0},transactions:[],checks:{income:false,fixed:false,ledger:false,assets:false},assets:{dca:null,mm:null},closed:false,revision:1,closedAt:null,exportedRevision:null,archivedRevision:null,needsArchive:false};
  return {schema:2,currency:'CAD',id:crypto.randomUUID(),opening:{funds:{General:0,Travel:0,Pet:0,Irregular:0},savings:0,receivables:0,dca:0,mm:0},rules:{mvBaseline:200000},months,history:[],settings:{theme:'system',glass:65,reduceMotion:false,reduceTransparency:false,language:'zh'},lastBackup:null,dataRevision:1,backedUpRevision:null,reminderDismissedOn:null};
}
const sum = (xs:number[]) => xs.reduce((a,b)=>a+b,0);
export function actual(m:Month,k:string):number {return DAILY[k]?sum(m.transactions.filter(t=>t.category===DAILY[k]&&!t.fund).map(t=>t.amount)):m.actual[k]??m.plan[k];}
export function calc(book:Book,id:MonthId) {
  const m=book.months[id], total=(keys:readonly string[],mode:'plan'|'actual')=>sum(keys.map(k=>mode==='plan'?m.plan[k]:actual(m,k)));
  const savingPlan=Math.max(0,m.plan.mv-book.rules.mvBaseline), savings=Math.max(0,actual(m,'mv')-book.rules.mvBaseline);
  const incomePlan=total(GROUPS.income,'plan'), income=total(GROUPS.income,'actual');
  const expensesPlan=total([...GROUPS.personal,...GROUPS.fixed,...GROUPS.daily],'plan'), expenses=total([...GROUPS.personal,...GROUPS.fixed,...GROUPS.daily],'actual');
  const surplusPlan=incomePlan-expensesPlan-savingPlan, surplus=income-expenses-savings;
  const spent=Object.fromEntries(FUNDS.map(f=>[f,sum(m.transactions.filter(t=>t.fund===f).map(t=>t.amount))])) as Record<Fund,number>;
  return {incomePlan,income,savingPlan,savings,surplusPlan,surplus,spent,totalFundSpend:sum(Object.values(spent)),remaining:total(GROUPS.daily,'plan')-total(GROUPS.daily,'actual'),household:actual(m,'mv')-actual(m,'mvPersonal')-savings,cash:surplus-sum(Object.values(spent)),ledgerCheck:sum(m.transactions.map(t=>t.amount))-sum(Object.keys(DAILY).map(k=>actual(m,k)))-sum(Object.values(spent))};
}
export function allocate(amount:number,shares:Record<Fund,number>) {
  if(!shares||FUNDS.some(f=>!Number.isFinite(shares[f])||shares[f]<0)||Math.abs(sum(FUNDS.map(f=>shares[f]))-100)>0.000001) throw new Error('shares');
  const a={General:0,Travel:0,Pet:0,Irregular:0};
  if(amount<=0){a.General=amount;return a;}
  for(const f of FUNDS)a[f]=Math.floor(amount*shares[f]/100);
  const left=amount-sum(Object.values(a));
  const order=FUNDS.map((f,i)=>({f,i,remainder:amount*shares[f]/100-a[f]})).sort((x,y)=>y.remainder-x.remainder||x.i-y.i);
  for(let i=0;i<left;i++)a[order[i%4].f]++;
  return a;
}
export function position(book:Book,id:MonthId) {
  const funds={...book.opening.funds};let savings=book.opening.savings,receivables=book.opening.receivables;
  for(const mi of MONTHS){const m=book.months[mi],c=calc(book,mi),opening={...funds},savingsOpening=savings,receivablesOpening=receivables;
    const allocation=allocate(m.closed?c.surplus:0,m.shares),planned=allocate(c.surplusPlan,m.shares);
    for(const f of FUNDS)funds[f]+=allocation[f]-c.spent[f];
    if(m.closed){savings+=c.savings;receivables-=actual(m,'leo');}
    if(mi===id)return {opening,closing:{...funds},allocation,planned,savingsOpening,savings,receivablesOpening,receivables};
  }throw new Error('month');
}
const cash=(x:unknown):x is number=>typeof x==='number'&&Number.isSafeInteger(x)&&Math.abs(x)<=1e12;
const iso=(x:unknown)=>typeof x==='string'&&Number.isFinite(Date.parse(x));
export function validateTransaction(t:Transaction,month:MonthId) {
  if(!t||typeof t.id!=='string'||!t.id||typeof t.item!=='string'||!t.item.trim()||t.item.length>200)throw new Error('item');
  if(!/^2026-(10|11|12)-\d{2}$/.test(t.date)||t.date.slice(0,7)!==month||new Date(t.date+'T12:00:00Z').toISOString().slice(0,10)!==t.date)throw new Error('date');
  if(!cash(t.amount)||t.amount===0)throw new Error('amount');
  if(!CATEGORIES.includes(t.category)||t.fund!==''&&!FUNDS.includes(t.fund))throw new Error('category');
  if(t.category==='Funded'&&!t.fund)throw new Error('fund');
}
function validateMonth(m:Month,id:MonthId) {
  if(!m||!KEYS.every(k=>cash(m.plan?.[k]))||!m.actual||!m.checks||!m.assets||!Array.isArray(m.transactions)||typeof m.closed!=='boolean'||!Number.isSafeInteger(m.revision)||m.revision<1)throw new Error('invalidBook');
  for(const k of KEYS.filter(k=>!DAILY[k]))if(m.actual[k]!==null&&!cash(m.actual[k]))throw new Error('amount');
  if(![m.assets.dca,m.assets.mm].every(x=>x===null||cash(x)))throw new Error('amount');
  for(const k of ['income','fixed','ledger','assets'] as const)if(typeof m.checks[k]!=='boolean')throw new Error('invalidBook');
  allocate(0,m.shares);
  if(m.closed&&(!Object.values(m.checks).every(Boolean)||m.assets.dca===null||m.assets.mm===null||!iso(m.closedAt)))throw new Error('checks');
  const ids=new Set<string>();for(const t of m.transactions){validateTransaction(t,id);if(ids.has(t.id))throw new Error('duplicate');ids.add(t.id);}
  for(const r of [m.exportedRevision,m.archivedRevision])if(r!==null&&(!Number.isSafeInteger(r)||r<1))throw new Error('invalidBook');
}
export function validateBook(v:unknown):Book {
  const b=v as Book;
  if(!b||![1,2].includes(b.schema)||b.currency!=='CAD'||typeof b.id!=='string'||!b.id||!b.settings||!Array.isArray(b.history))throw new Error('invalidBook');
  if(!b.opening||!b.opening.funds||![...FUNDS.map(f=>b.opening.funds[f]),b.opening.savings,b.opening.receivables,b.opening.dca,b.opening.mm,b.rules?.mvBaseline].every(cash))throw new Error('invalidBook');
  const ids=new Set<string>();let priorClosed=true;
  for(const id of MONTHS){const m=b.months?.[id];validateMonth(m,id);if(m.closed&&!priorClosed)throw new Error('sequence');priorClosed=m.closed;for(const t of m.transactions){if(ids.has(t.id))throw new Error('duplicate');ids.add(t.id);}}
  if(!['system','light','dark'].includes(b.settings.theme)||!Number.isFinite(b.settings.glass)||b.settings.glass<0||b.settings.glass>100)throw new Error('invalidBook');
  for(const h of b.history){if(!MONTHS.includes(h.month)||!Number.isSafeInteger(h.revision)||!iso(h.closedAt))throw new Error('invalidBook');validateMonth(h.snapshot,h.month);}
  if(b.lastBackup!==null&&!iso(b.lastBackup))throw new Error('invalidBook');
  if(b.schema===2&&(!Number.isSafeInteger(b.dataRevision)||b.dataRevision!<1||b.backedUpRevision!==null&&(!Number.isSafeInteger(b.backedUpRevision)||b.backedUpRevision!<1)||!['zh','en'].includes(b.settings.language||'')||b.reminderDismissedOn!==null&&!/^\d{4}-\d{2}-\d{2}$/.test(b.reminderDismissedOn||'')))throw new Error('invalidBook');
  return structuredClone(b);
}
export function migrateV1(value:unknown):Book {
  const b=validateBook(value);if(b.schema===2)return b;
  b.schema=2;b.settings.language='zh';b.dataRevision=1;b.backedUpRevision=null;b.reminderDismissedOn=null;
  // Group membership changed in code only: no amount, nullable Actual, or snapshot is rewritten.
  return validateBook(b);
}
export function touch(book:Book):Book {const b=structuredClone(book);b.dataRevision=(b.dataRevision??1)+1;return b;}
export function editMonth(book:Book,id:MonthId,change:(m:Month)=>void):Book {
  if(book.months[id].closed)throw new Error('closed');const b=touch(book),m=b.months[id];change(m);m.revision++;m.exportedRevision=null;m.checks={income:false,fixed:false,ledger:false,assets:false};return validateBook(b);
}
export function applyScoped(book:Book,id:MonthId,scope:Scope,change:(m:Month)=>void):Book {
  let b=book;for(const mi of MONTHS.slice(MONTHS.indexOf(id),scope==='month'?MONTHS.indexOf(id)+1:undefined))if(mi===id||!b.months[mi].closed)b=editMonth(b,mi,change);return b;
}
export function closeMonth(book:Book,id:MonthId) {
  const b=touch(book),m=b.months[id],idx=MONTHS.indexOf(id);
  if(m.closed)throw new Error('closed');if(idx>0&&!b.months[MONTHS[idx-1]].closed)throw new Error('sequence');
  if(!Object.values(m.checks).every(Boolean)||m.assets.dca===null||m.assets.mm===null)throw new Error('checks');
  if(calc(b,id).ledgerCheck!==0)throw new Error('reconcile');
  m.revision++;m.exportedRevision=null;m.closed=true;m.closedAt=new Date().toISOString();
  b.history.push({month:id,revision:m.revision,closedAt:m.closedAt,snapshot:structuredClone(m)});return validateBook(b);
}
export function reopenMonth(book:Book,id:MonthId) {
  const b=touch(book);for(const mi of MONTHS.slice(MONTHS.indexOf(id))){const m=b.months[mi];m.closed=false;m.closedAt=null;m.exportedRevision=null;m.revision++;m.checks={income:false,fixed:false,ledger:false,assets:false};}return validateBook(b);
}
export function localDate(now=new Date()):string {
  const parts=new Intl.DateTimeFormat('en-CA',{timeZone:'America/Toronto',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(now);const p=(t:string)=>parts.find(x=>x.type===t)?.value;return `${p('year')}-${p('month')}-${p('day')}`;
}
export function todayIn(month:MonthId){const date=localDate();return date.startsWith(month)?date:`${month}-01`;}
export function backupStale(book:Book,now=new Date()){return !book.lastBackup||now.getTime()-Date.parse(book.lastBackup)>7*86400000;}
export function reminder(book:Book,now=new Date()):{month:MonthId,reason:'close'|'backup'}|null {
  const date=localDate(now);if(Number(date.slice(8))>7||book.reminderDismissedOn===date)return null;
  const previous=new Date(`${date.slice(0,7)}-01T12:00:00Z`);previous.setUTCMonth(previous.getUTCMonth()-1);const id=previous.toISOString().slice(0,7) as MonthId;
  if(!MONTHS.includes(id))return null;const m=book.months[id];if(!m.closed)return {month:id,reason:'close'};
  if(!book.lastBackup||m.exportedRevision!==m.revision)return {month:id,reason:'backup'};return null;
}
export function parseAmount(s:string,nullable=false):number|null {s=s.trim();if(!s&&nullable)return null;if(!/^-?\d+(\.\d{1,2})?$/.test(s))throw new Error('amount');const n=cents(Number(s));if(!cash(n))throw new Error('amount');return n;}

export function investmentPosition(book:Book,id:MonthId) {let dca=book.opening.dca,mm=book.opening.mm;for(const mi of MONTHS){if(mi===id)return {dca,mm};const m=book.months[mi];if(m.closed){if(m.assets.dca!==null)dca=m.assets.dca;if(m.assets.mm!==null)mm=m.assets.mm;}}throw new Error('month');}
export function createBook():Book {
  const book=blankBook();
  for(const id of MONTHS)Object.assign(book.months[id].plan,{mv:200000,pwPersonal:100000,mvPersonal:100000,investment:cents(65*26/12)});
  return book;
}
