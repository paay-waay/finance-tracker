/** Arithmetic only: no eval, variables, functions, or access to browser state. */
type Fraction = {n:bigint,d:bigint};
const fraction=(n:bigint,d=1n):Fraction=>{
  if(d===0n)throw new Error('amount');
  if(d<0n){n=-n;d=-d;}
  let a=n<0n?-n:n,b=d;while(b){const r=a%b;a=b;b=r;}
  return {n:n/a,d:d/a};
};
export const isAmountFormula=(s:string)=>/[+*/()×÷=]|\d\s*[-−]/.test(s);
export function evaluateAmount(raw:string,nullable=false):number|null {
  let s=raw.trim();if(!s&&nullable)return null;
  if(!s||s.length>256)throw new Error('amount');
  s=s.replace(/×/g,'*').replace(/÷/g,'/').replace(/−/g,'-');
  if(s.startsWith('='))s=s.slice(1);
  let at=0,depth=0;
  const space=()=>{while(/\s/.test(s[at]??'')&&at<s.length)at++;};
  const primary=():Fraction=>{
    space();if(++depth>32)throw new Error('amount');
    let v:Fraction;
    if(s[at]==='+'||s[at]==='-'){const sign=s[at++];v=primary();if(sign==='-')v={n:-v.n,d:v.d};}
    else if(s[at]==='('){at++;v=expression();space();if(s[at++]!==')')throw new Error('amount');}
    else {const number=/^(?:\d+(?:\.\d*)?|\.\d+)/.exec(s.slice(at))?.[0];if(!number)throw new Error('amount');at+=number.length;const [whole,decimal='']=number.split('.');v=fraction(BigInt((whole||'0')+decimal),10n**BigInt(decimal.length));}
    depth--;return v;
  };
  const term=():Fraction=>{
    let v=primary();space();while(s[at]==='*'||s[at]==='/'){const op=s[at++],r=primary();v=op==='*'?fraction(v.n*r.n,v.d*r.d):fraction(v.n*r.d,v.d*r.n);space();}return v;
  };
  const expression=():Fraction=>{
    let v=term();space();while(s[at]==='+'||s[at]==='-'){const op=s[at++],r=term();v=fraction(v.n*r.d+(op==='+'?r.n:-r.n)*v.d,v.d*r.d);space();}return v;
  };
  const v=expression();space();if(at!==s.length)throw new Error('amount');
  // Round once, to cents; exact decimal arithmetic also handles negative half cents.
  const sign=v.n<0n?-1n:1n,n=(v.n<0n?-v.n:v.n)*100n;
  const result=sign*((n*2n+v.d)/(v.d*2n));
  if(result>1000000000000n||result< -1000000000000n)throw new Error('amount');
  return Number(result);
}
