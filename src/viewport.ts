/** One visual-viewport coordinate system; never add a keyboard bottom offset as well. */
export function viewportFrame(layoutHeight:number,visibleHeight:number,offsetTop:number,scale=1) {
  if(scale>1.05)return null; // Preserve native pinch zoom rather than repositioning beneath it.
  const height=Math.max(1,visibleHeight),top=Math.max(0,offsetTop);
  return {height,top,keyboard:layoutHeight-height-top>100};
}
export function observeViewport() {
  const root=document.documentElement,vv=window.visualViewport;
  let frame=0;
  const update=()=>{
    frame=0;
    const v=viewportFrame(window.innerHeight,vv?.height??window.innerHeight,vv?.offsetTop??0,vv?.scale??1);
    if(!v)return;
    root.style.setProperty('--viewport-top',`${v.top}px`);
    root.style.setProperty('--viewport-height',`${v.height}px`);
    root.dataset.keyboard=String(v.keyboard);
  };
  const schedule=()=>{if(!frame)frame=requestAnimationFrame(update);};
  update();vv?.addEventListener('resize',schedule);vv?.addEventListener('scroll',schedule);window.addEventListener('resize',schedule);
  return()=>{cancelAnimationFrame(frame);vv?.removeEventListener('resize',schedule);vv?.removeEventListener('scroll',schedule);window.removeEventListener('resize',schedule);};
}
