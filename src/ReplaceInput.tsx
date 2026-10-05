import {useRef,useState,type InputHTMLAttributes} from 'react';
/** Keep the accepted value until the user actually types; Enter can save it untouched. */
export function ReplaceInput({value,set,placeholder,required,onFocus,onBlur,...props}:Omit<InputHTMLAttributes<HTMLInputElement>,'value'|'onChange'> & {value:string,set:(value:string)=>void}) {
  const original=useRef('');const [editing,setEditing]=useState(false),[pristine,setPristine]=useState(true);
  const showingOriginal=editing&&pristine&&value===original.current&&original.current!=='';
  return <input {...props} value={showingOriginal?'':value} placeholder={showingOriginal?original.current:placeholder} required={required&&!showingOriginal}
    onFocus={e=>{if(!props.readOnly){original.current=value;setPristine(true);setEditing(true);}onFocus?.(e);}}
    onBlur={e=>{setEditing(false);onBlur?.(e);}}
    onChange={e=>{setPristine(false);set(e.target.value);}}/>;
}
