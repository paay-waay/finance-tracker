import {useEffect,useLayoutEffect,useRef,type ReactNode} from 'react';
import {motion,useIsPresent,useReducedMotion} from 'motion/react';
import {X} from 'lucide-react';
import {translator} from './i18n';
import type {Language} from './model';

/** Static geometry and opacity-only transitions: no body scroll-lock relayout. */
export function Sheet({title,close,children,language,contentKey=title}:{title:string,close:()=>void,children:ReactNode,language:Language,contentKey?:string}) {
  const ref=useRef<HTMLDialogElement>(null),frame=useRef<HTMLDivElement>(null),body=useRef<HTMLDivElement>(null);
  const reduced=useReducedMotion(),present=useIsPresent();
  useLayoutEffect(()=>{
    const dialog=ref.current!,opener=document.activeElement as HTMLElement|null;
    dialog.setAttribute('autofocus','');dialog.showModal();dialog.focus({preventScroll:true});
    return()=>{dialog.close();if(opener?.isConnected)opener.focus({preventScroll:true});};
  },[]);
  useLayoutEffect(()=>{
    if(present){frame.current?.style.removeProperty('top');frame.current?.style.removeProperty('height');ref.current?.focus({preventScroll:true});if(body.current)body.current.scrollTop=0;}
    else if(frame.current){const s=getComputedStyle(document.documentElement);frame.current.style.top=s.getPropertyValue('--viewport-top');frame.current.style.height=s.getPropertyValue('--viewport-height');(document.activeElement as HTMLElement|null)?.blur();}
  },[contentKey,present]);
  useEffect(()=>{
    if(present||!import.meta.env.DEV||!location.search.includes('ui-qa'))return;
    let last=performance.now(),max=0,count=0,raf=0;
    const sample=(now:number)=>{max=Math.max(max,now-last);last=now;count++;raf=requestAnimationFrame(sample);};
    raf=requestAnimationFrame(sample);
    return()=>{cancelAnimationFrame(raf);requestAnimationFrame(now=>{max=Math.max(max,now-last);document.documentElement.dataset.dismissFrameMax=max.toFixed(1);document.documentElement.dataset.dismissFrames=String(count+1);});};
  },[present]);
  return <dialog ref={ref} aria-label={title} onCancel={e=>{e.preventDefault();close();}} onClick={e=>{if(e.target===ref.current||e.target===frame.current)close();}}>
    <div className="sheet-frame" ref={frame}>
      <motion.section className="sheet glass" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} transition={{duration:reduced ? .1 : .15,ease:'easeOut'}}>
        <header><h2>{title}</h2><button className="round" onClick={close} aria-label={translator(language)('关闭','Close')}><X size={20}/></button></header>
        <div className="sheet-body" ref={body} key={contentKey}>{children}</div>
      </motion.section>
    </div>
  </dialog>;
}
