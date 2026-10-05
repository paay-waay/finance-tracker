import {entryMoney} from './format';
import {ReplaceInput} from './ReplaceInput';
import {useId} from 'react';
import {evaluateAmount,isAmountFormula} from './amount';
import {translator} from './i18n';
import type {Language} from './model';
export function MoneyInput({name,value,set,placeholder='',busy=false,required=false,language}:{name:string,value:string,set:(v:string)=>void,placeholder?:string,busy?:boolean,required?:boolean,language:Language}) {
  const id=useId(),t=translator(language);let result='';
  if(isAmountFormula(value)){try{result='= '+entryMoney(evaluateAmount(value)!);}catch{result=t('公式无效或未完成','Invalid or incomplete formula');}}
  return <span className="money-input"><ReplaceInput aria-label={name} aria-describedby={id} type="text" inputMode="text" autoComplete="off" autoCorrect="off" autoCapitalize="off" spellCheck={false} maxLength={256} readOnly={busy} required={required} value={value} placeholder={placeholder} set={set}/><span id={id} className="formula-result" aria-live="polite">{result||'+ − × ÷ ( )'}</span></span>;
}
