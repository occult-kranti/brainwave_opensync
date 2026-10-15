/** Original parametric sculpture. 4D rotations are spatial, not a claim about consciousness. */
export const fieldVertex = `
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
}`;
export const fieldFragment = `
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
}`;
