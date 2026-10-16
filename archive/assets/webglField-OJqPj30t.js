import{W as T,d as U,e as _,k as N,n as O,f as k,D as E,h as G,m as W,c as j}from"./three.module-BjcmM2Lq.js";const B=`
uniform float uTime, uRotation, uFourth, uDimension, uPointSize;
varying vec2 vUv;
varying vec3 vNormal, vPosition;
const float PI = 3.14159265359;
vec3 surface(vec2 uv) {
 float u=uv.x*2.0*PI, v=uv.y*2.0*PI;
 if(uDimension>0.5) {
   vec4 p=vec4(cos(u),sin(u),cos(v),sin(v))*.70710678118;
   float a=uFourth+uTime*.11, b=a*.7;
   float x=p.x*cos(a)-p.w*sin(a), w=p.x*sin(a)+p.w*cos(a);
   float y=p.y*cos(b)-p.z*sin(b), z=p.y*sin(b)+p.z*cos(b);
   return vec3(x,y,z)*1.8/(1.7-w);
 }
 float r=.36+.045*cos(u*6.0+v*3.0);
 float t=v+.24*sin(u*3.0);
 return vec3((1.0+r*cos(t))*cos(u),(1.0+r*cos(t))*sin(u),r*sin(t));
}
vec3 rotate(vec3 p) {
 float tilt=.93, a=uRotation+uTime*.14;
 p=vec3(p.x,p.y*cos(tilt)-p.z*sin(tilt),p.y*sin(tilt)+p.z*cos(tilt));
 return vec3(p.x*cos(a)+p.z*sin(a),p.y,-p.x*sin(a)+p.z*cos(a));
}
void main() {
 vUv=uv;
 vec3 p=rotate(surface(uv));
 vec3 a=rotate(surface(uv+vec2(.0005,0.0)))-p;
 vec3 b=rotate(surface(uv+vec2(0.0,.0005)))-p;
 vNormal=normalize(normalMatrix*normalize(cross(a,b)));
 vec4 mv=modelViewMatrix*vec4(p,1.0); vPosition=mv.xyz;
 gl_Position=projectionMatrix*mv;
 gl_PointSize=clamp(uPointSize*6.0/-mv.z,1.0,4.0);
}`,V=`
uniform vec3 uColor;
uniform float uMaterial;
varying vec2 vUv;
varying vec3 vNormal, vPosition;
void main() {
 vec3 n=normalize(vNormal); if(!gl_FrontFacing) n=-n;
 vec3 eye=normalize(-vPosition);
 float rim=pow(1.0-abs(dot(n,eye)),2.4);
 float light=.18+.62*abs(dot(n,normalize(vec3(-.7,1.0,1.0))));
 float spec=pow(max(0.0,dot(reflect(normalize(vec3(.7,-1.0,-1.0)),n),eye)),24.0);
 float thread=.5+.5*cos(vUv.y*2.0*3.14159265359*88.0+sin(vUv.x*18.0)*.5);
 vec3 color=uColor*(light*.65+rim*.5+thread*.12)+vec3(.9,.88,.8)*spec*.55;
 float alpha=1.0;
 if(uMaterial>1.5) {
   float d=length(gl_PointCoord-.5); if(d>.5) discard;
   alpha=(1.0-smoothstep(.15,.5,d))*.8; color=uColor*(.65+rim*.6);
 } else if(uMaterial>.5) {
   float line=abs(fract(vUv.y*64.0)-.5)/max(fwidth(vUv.y*64.0),.002);
   alpha=(1.0-smoothstep(.4,1.3,line))*.8;
   if(alpha<.02) discard; color=uColor*(.45+light*.4+rim*.5);
 }
 gl_FragColor=vec4(color,alpha);
 #include <tonemapping_fragment>
 #include <colorspace_fragment>
}`;function J(p,l,c,I,q=!1){const r=new T({canvas:p,alpha:!0,antialias:!0,powerPreference:"low-power"});r.setClearColor(0,0);const z=new U,i=new _(36,1,.1,30);i.position.z=5.5;const f=new N(1,1,128,72),a={uTime:{value:0},uRotation:{value:c.rotation},uFourth:{value:c.fourth*Math.PI/180},uDimension:{value:c.dimension==="4d"?1:0},uPointSize:{value:1.6},uMaterial:{value:0},uColor:{value:new O("#b8cfca")}},u=new k({vertexShader:B,fragmentShader:V,uniforms:a,transparent:!0,side:E,depthWrite:!0}),h=new G(f,u),x=new W(f,u);z.add(h,x);let t=c,o=0,v=0,b=0,m=!0,g=!1,y=!1;const D=()=>{const n=getComputedStyle(l).getPropertyValue("--field-color").trim().split(",").map(Number);n.length===3&&n.every(Number.isFinite)&&a.uColor.value.setRGB(n[0]/255,n[1]/255,n[2]/255,j)},s=()=>{g||y||document.hidden||!m||(a.uTime.value=b,a.uRotation.value=t.rotation,a.uFourth.value=t.fourth*Math.PI/180,a.uDimension.value=t.dimension==="4d"?1:0,a.uMaterial.value=t.material==="particles"?2:t.material==="threads"?1:0,h.visible=t.material!=="particles",x.visible=!h.visible,u.depthWrite=t.material==="silk",i.zoom=t.zoom,i.updateProjectionMatrix(),D(),r.render(z,i))},P=()=>t.motion&&m&&!document.hidden&&!g&&!y,F=e=>{if(o=0,!P())return;const n=t.quality==="light"||q?1e3/20:1e3/30;e-v>=n&&(b+=Math.min(e-v,80)/1e3,v=e,s()),o=requestAnimationFrame(F)},d=()=>{P()&&!o&&(v=performance.now(),o=requestAnimationFrame(F))},w=()=>{const e=l.getBoundingClientRect();!e.width||!e.height||(r.setPixelRatio(Math.min(window.devicePixelRatio||1,t.quality==="light"?1:1.5)),r.setSize(e.width,e.height,!1),i.aspect=e.width/e.height,i.position.z=i.aspect<1?5.5/i.aspect:5.5,i.updateProjectionMatrix(),s())},M=typeof ResizeObserver>"u"?null:new ResizeObserver(w);M?.observe(l);const C=typeof IntersectionObserver>"u"?null:new IntersectionObserver(e=>{m=e[0]?.isIntersecting??!1,m?(s(),d()):(cancelAnimationFrame(o),o=0)});C?.observe(l);const R=()=>{document.hidden?(cancelAnimationFrame(o),o=0):(s(),d())},S=e=>{e.preventDefault(),y=!0,cancelAnimationFrame(o),o=0,I()};p.addEventListener("webglcontextlost",S),document.addEventListener("visibilitychange",R);const A=new MutationObserver(()=>s());return A.observe(document.documentElement,{attributes:!0,attributeFilter:["data-archive-theme"]}),w(),d(),{update(e){const n=e.resetToken!==t.resetToken,L=e.quality!==t.quality;t=e,n&&(b=0),t.motion||(cancelAnimationFrame(o),o=0),L&&w(),s(),d()},dispose(){g=!0,cancelAnimationFrame(o),M?.disconnect(),C?.disconnect(),A.disconnect(),p.removeEventListener("webglcontextlost",S),document.removeEventListener("visibilitychange",R),f.dispose(),u.dispose(),r.dispose(),r.forceContextLoss()}}}export{J as createFieldRenderer};
