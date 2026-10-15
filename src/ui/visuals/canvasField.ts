import { projectPoint, resonancePoint } from './resonanceGeometry';
import type { FieldRenderer } from './webglField';
import type { SpatialSettings } from './spatialState';
/** Lightweight interactive projection when GPU access is unavailable. */
export function createCanvasField(canvas: HTMLCanvasElement, host: HTMLElement, initial: SpatialSettings): FieldRenderer | null {
 const ctx=canvas.getContext('2d'); if(!ctx) return null;
 let settings=initial, width=0, height=0, elapsed=0, raf=0, last=0, visible=true, disposed=false;
 const draw=()=>{
  if(disposed||!visible||document.hidden||!width||!height) return;
  ctx.clearRect(0,0,width,height);
  const scale=Math.min(width*.29,height*.36)*settings.zoom;
  const color=getComputedStyle(host).getPropertyValue('--field-color').trim()||'173,207,205';
  const lines=settings.quality==='light'?34:54, steps=settings.quality==='light'?48:72;
  const rotation=settings.rotation+elapsed*.14, fourth=settings.fourth*Math.PI/180+elapsed*.11;
  const points=settings.material==='particles';
  for(let i=0;i<lines;i++) {
   ctx.beginPath(); let depth=0;
   for(let j=0;j<=steps;j++) {
    const p=projectPoint(resonancePoint(j/steps*Math.PI*2,i/lines*Math.PI*2,rotation,settings.dimension,fourth),scale);
    const x=width/2+p.x,y=height/2+p.y; depth+=p.z;
    if(points) { if(j%2===0) { ctx.moveTo(x,y);ctx.arc(x,y,1,0,Math.PI*2); } }
    else if(j===0)ctx.moveTo(x,y);else ctx.lineTo(x,y);
   }
   const alpha=Math.max(.1,Math.min(.8,.48-depth/(steps+1)*.18));
   ctx.strokeStyle=`rgba(${color},${alpha})`;ctx.fillStyle=ctx.strokeStyle;ctx.lineWidth=settings.material==='silk'?1:.6;
   if(points)ctx.fill();else ctx.stroke();
  }
 };
 const canAnimate=()=>settings.motion&&visible&&!document.hidden&&!disposed;
 const tick=(time:number)=>{raf=0;if(!canAnimate())return;if(time-last>=1000/20){elapsed+=Math.min(time-last,80)/1000;last=time;draw();}raf=requestAnimationFrame(tick);};
 const schedule=()=>{if(canAnimate()&&!raf){last=performance.now();raf=requestAnimationFrame(tick);}};
 const resize=()=>{const r=host.getBoundingClientRect();width=r.width;height=r.height;const dpr=Math.min(window.devicePixelRatio||1,settings.quality==='light'?1:1.5);canvas.width=Math.round(width*dpr);canvas.height=Math.round(height*dpr);ctx.setTransform(dpr,0,0,dpr,0,0);draw();};
 const observer=typeof ResizeObserver==='undefined'?null:new ResizeObserver(resize);observer?.observe(host);
 const intersection=typeof IntersectionObserver==='undefined'?null:new IntersectionObserver(entries=>{visible=entries[0]?.isIntersecting??false;if(visible){draw();schedule();}else{cancelAnimationFrame(raf);raf=0;}});intersection?.observe(host);
 const visibility=()=>{if(document.hidden){cancelAnimationFrame(raf);raf=0;}else{draw();schedule();}};
 const theme=new MutationObserver(draw);theme.observe(document.documentElement,{attributes:true,attributeFilter:['data-archive-theme']});document.addEventListener('visibilitychange',visibility);
 resize();schedule();
 return {update(next){const reset=next.resetToken!==settings.resetToken,quality=next.quality!==settings.quality;settings=next;if(reset)elapsed=0;if(!canAnimate()){cancelAnimationFrame(raf);raf=0;}if(quality)resize();draw();schedule();},dispose(){disposed=true;cancelAnimationFrame(raf);observer?.disconnect();intersection?.disconnect();theme.disconnect();document.removeEventListener('visibilitychange',visibility);}};
}
