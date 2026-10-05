import {describe,it,expect,vi,afterEach} from 'vitest';
import {viewportFrame,observeViewport} from './viewport';
afterEach(()=>vi.unstubAllGlobals());
describe('sheet visual viewport',()=>{
  it('uses visible height and pan offset once, without a second keyboard translation',()=>{
    expect(viewportFrame(852,852,0)).toEqual({height:852,top:0,keyboard:false});
    expect(viewportFrame(852,510,0)).toEqual({height:510,top:0,keyboard:true});
    const panned=viewportFrame(852,510,80)!;
    expect(panned.top+panned.height).toBe(590);
    expect(panned.keyboard).toBe(true);
  });
  it('does not classify browser chrome or an ordinary resized viewport as keyboard',()=>{
    expect(viewportFrame(852,780,0)?.keyboard).toBe(false);
    expect(viewportFrame(500,500,0)?.keyboard).toBe(false);
  });
  it('preserves pinch zoom and bounds invalid geometry',()=>{
    expect(viewportFrame(852,400,30,2)).toBeNull();
    expect(viewportFrame(852,0,-12)).toEqual({height:1,top:0,keyboard:true});
  });
  it('coalesces keyboard resize and pan into one frame and cancels pending work on teardown',()=>{
    const viewport=Object.assign(new EventTarget(),{height:852,offsetTop:0,scale:1});
    const win=Object.assign(new EventTarget(),{visualViewport:viewport,innerHeight:852});
    const values=new Map<string,string>(),dataset:Record<string,string>={};
    vi.stubGlobal('window',win);vi.stubGlobal('document',{documentElement:{style:{setProperty:(k:string,v:string)=>values.set(k,v)},dataset}});
    const raf=vi.fn(),cancel=vi.fn();let pending:FrameRequestCallback;
    raf.mockImplementation((cb:FrameRequestCallback)=>{pending=cb;return 7;});
    vi.stubGlobal('requestAnimationFrame',raf);vi.stubGlobal('cancelAnimationFrame',cancel);
    const stop=observeViewport();
    viewport.height=510;viewport.offsetTop=80;
    viewport.dispatchEvent(new Event('resize'));viewport.dispatchEvent(new Event('scroll'));
    expect(raf).toHaveBeenCalledTimes(1);pending!(0);
    expect(values.get('--viewport-height')).toBe('510px');expect(values.get('--viewport-top')).toBe('80px');expect(dataset.keyboard).toBe('true');
    viewport.dispatchEvent(new Event('resize'));stop();expect(cancel).toHaveBeenCalledWith(7);
    viewport.dispatchEvent(new Event('scroll'));expect(raf).toHaveBeenCalledTimes(2);
  });
});
