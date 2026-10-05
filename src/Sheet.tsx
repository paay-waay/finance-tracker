import {useLayoutEffect,useRef,type ReactNode} from 'react';
import {motion,useDragControls,useIsPresent,useReducedMotion} from 'motion/react';
import {X} from 'lucide-react';
import {translator} from './i18n';
import type {Language} from './model';

const spring={type:'spring' as const,stiffness:420,damping:42};
export function Sheet({title,close,children,language,contentKey=title}:{title:string,close:()=>void,children:ReactNode,language:Language,contentKey?:string}) {
  const ref=useRef<HTMLDialogElement>(null),frame=useRef<HTMLDivElement>(null),body=useRef<HTMLDivElement>(null);
  const drag=useDragControls(),reduced=useReducedMotion(),present=useIsPresent();
  useLayoutEffect(()=>{
    const dialog=ref.current!,page=document.body,root=document.documentElement;
    const x=window.scrollX,y=window.scrollY,opener=document.activeElement as HTMLElement|null;
    const saved={position:page.style.position,top:page.style.top,left:page.style.left,width:page.style.width,overflow:page.style.overflow};
    const rootOverflow=root.style.overflow;
    // iOS can scroll an overflow-hidden page when native input focus changes.
    Object.assign(page.style,{position:'fixed',top:`${-y}px`,left:`${-x}px`,width:'100%',overflow:'hidden'});
    root.style.overflow='hidden';
    // Focus the stationary dialog, never a button inside a moving sheet.
    dialog.setAttribute('autofocus','');
    dialog.showModal();dialog.focus({preventScroll:true});
    return()=>{
      dialog.close();Object.assign(page.style,saved);root.style.overflow=rootOverflow;
      opener?.isConnected&&opener.focus({preventScroll:true});
      window.scrollTo({left:x,top:y,behavior:'instant'});
    };
  },[]);
  useLayoutEffect(()=>{
    if(present){
      if(frame.current){frame.current.style.removeProperty('top');frame.current.style.removeProperty('height');}
      ref.current?.focus({preventScroll:true});if(body.current)body.current.scrollTop=0;
    }
  },[contentKey,present]);
  useLayoutEffect(()=>{
    if(!present&&frame.current){
      // Keep the exit in its current coordinate system as the keyboard dismisses.
      const style=getComputedStyle(document.documentElement);
      frame.current.style.top=style.getPropertyValue('--viewport-top');
      frame.current.style.height=style.getPropertyValue('--viewport-height');
      (document.activeElement as HTMLElement|null)?.blur();
    }
  },[present]);
  return <dialog ref={ref} aria-label={title} onCancel={e=>{e.preventDefault();close();}} onClick={e=>{if(e.target===ref.current||e.target===frame.current)close();}}>
    <div className="sheet-frame" ref={frame}>
      <motion.div className="sheet-motion" initial={{opacity:0,y:reduced?0:28}} animate={{opacity:1,y:0}} exit={{opacity:0,y:reduced?0:28}} transition={reduced?{duration:.12}:spring}>
        <motion.section className="sheet" drag={reduced||!present?false:'y'} dragControls={drag} dragListener={false} dragConstraints={{top:0,bottom:0}} dragElastic={{top:0,bottom:.35}} onDragEnd={(_,info)=>{if(info.offset.y+info.velocity.y*.12>110)close();}}>
          <div className="handle" onPointerDown={e=>drag.start(e)}><i/></div>
          <header><h2>{title}</h2><button className="round" onClick={close} aria-label={translator(language)('关闭','Close')}><X size={20}/></button></header>
          <div className="sheet-body" ref={body} key={contentKey}>{children}</div>
        </motion.section>
      </motion.div>
    </div>
  </dialog>;
}
