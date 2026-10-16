// Original GLSL, using Three.js ShaderMaterial (MIT). No third-party shader copied.
export const sandVertex = /* glsl */ `
attribute vec3 aTorus;
attribute vec3 aVortex;
attribute vec3 aDunes;
attribute vec4 aClifford;
attribute vec3 aRandom;
uniform float weights[5];
uniform float time;
uniform float rotation4;
uniform float tilt4;
uniform float dispersion;
uniform float turbulence;
uniform float lift;
uniform float energy;
uniform float dpr;
uniform vec3 pointer;
uniform float pointerStrength;
varying float grain;
varying float heightColor;
varying float depth;
vec3 project4(vec4 q) {
  float a=rotation4+time*.11, b=tilt4+sin(time*.09)*.22;
  float x=q.x*cos(a)-q.w*sin(a), w=q.x*sin(a)+q.w*cos(a);
  q.x=x;q.w=w;
  float y=q.y*cos(b)-q.w*sin(b);w=q.y*sin(b)+q.w*cos(b);
  q.y=y;q.w=w;
  return q.xyz*(2.25/max(.15,2.6-q.w));
}
void main(){
  vec3 p=project4(aClifford)*1.75*weights[0]+aTorus*weights[1]+aVortex*weights[2]+aDunes*weights[3]+position*weights[4];
  vec3 flow=vec3(sin(p.y*3.2+time*.7+aRandom.x*6.),cos(p.z*3.7-time*.5+aRandom.y*6.),sin(p.x*3.6+time*.6+aRandom.z*6.));
  p+=flow*turbulence*.22;
  p+=(aRandom-.5)*dispersion*1.5;
  p.y+=lift*(.22+.25*sin(p.x*2.+p.z*2.+time*.35));
  p*=1.+energy*.16;
  vec3 delta=p-pointer;float influence=exp(-dot(delta,delta)*2.2)*pointerStrength;
  p+=vec3(-delta.z,delta.y*.65,delta.x)*influence*.9+normalize(delta+vec3(.001))*influence*.17;
  vec4 mv=modelViewMatrix*vec4(p,1.);
  gl_Position=projectionMatrix*mv;
  gl_PointSize=clamp((1.5+aRandom.z*1.3)*dpr*4.8/max(1.,-mv.z),1.,8.);
  grain=aRandom.y;heightColor=clamp(p.y*.23+.5,0.,1.);depth=clamp((-mv.z-2.)/10.,0.,1.);
}`;
export const sandFragment = /* glsl */ `
uniform vec3 warm;
uniform vec3 pearl;
uniform vec3 cool;
varying float grain;
varying float heightColor;
varying float depth;
void main(){
  vec2 uv=gl_PointCoord-.5;float r=length(uv);
  if(r>.5)discard;
  float core=1.-smoothstep(.08,.5,r);
  vec3 color=mix(warm,pearl,smoothstep(.28,.88,grain));
  color=mix(color,cool,smoothstep(.72,1.,heightColor)*.52);
  color*=.62+core*.7;
  float alpha=core*(.58+grain*.35)*(1.-depth*.45);
  gl_FragColor=vec4(color,alpha);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}`;
