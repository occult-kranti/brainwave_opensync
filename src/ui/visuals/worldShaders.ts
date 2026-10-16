/** Original GLSL; Three.js supplies only the renderer and primitive buffers. */
export const worldForm = `
  uniform float uTime;
  uniform float uFourth;
  uniform float uDimension;
  uniform float uMotif;
  vec3 form(vec2 p) {
    float u=p.x, v=p.y;
    if (uDimension > 0.5) {
      vec4 q=vec4(cos(u),sin(u),cos(v),sin(v))*0.70710678118;
      float a=uFourth;
      q.xw=mat2(cos(a),sin(a),-sin(a),cos(a))*q.xw;
      a*=0.7;
      q.yz=mat2(cos(a),sin(a),-sin(a),cos(a))*q.yz;
      return q.xyz*2.3/(1.75-q.w);
    }
    float twist=v+0.3*sin(u*3.+uMotif);
    float r=0.42+0.055*sin(u*7.+v*3.+uMotif);
    float ring=1.03+0.12*sin(u*3.+uMotif);
    return vec3((ring+r*cos(twist))*cos(u),(ring+r*cos(twist))*sin(u),r*sin(twist)+0.1*sin(u*3.));
  }
`;
export const filamentVertex = `
  ${worldForm}
  attribute vec2 parameter;
  varying vec3 vPosition;
  varying vec2 vParameter;
  varying float vDepth;
  void main(){
    vec3 p=form(parameter);
    vPosition=p; vParameter=parameter;
    vec4 eye=modelViewMatrix*vec4(p,1.);
    vDepth=-eye.z;
    gl_Position=projectionMatrix*eye;
  }
`;
export const filamentFragment = `
  uniform float uTime;
  uniform float uCool;
  uniform float uOpacity;
  varying vec3 vPosition;
  varying vec2 vParameter;
  varying float vDepth;
  void main(){
    vec3 copper=vec3(1.,0.46,0.24);
    vec3 ice=vec3(0.37,0.73,0.87);
    vec3 pearl=vec3(0.97,0.91,0.8);
    float sweep=0.5+0.5*sin(vParameter.x*2.+vParameter.y*0.7-uTime*0.13);
    vec3 color=mix(copper,ice,smoothstep(0.45,0.85,sweep)*0.72+uCool*0.2);
    float gleam=pow(max(0.,sin(vParameter.y*2.+vParameter.x*3.-uTime*0.08)),12.);
    color=mix(color,pearl,gleam*0.75);
    float fade=clamp(1.4-vDepth*0.09,0.16,1.);
    gl_FragColor=vec4(color*(0.75+0.8*gleam),uOpacity*fade);
  }
`;
export const silkVertex = `
  ${worldForm}
  attribute vec2 parameter;
  varying vec3 vNormal;
  varying vec3 vEye;
  varying vec3 vPosition;
  void main(){
    vec3 p=form(parameter);
    vec3 du=form(parameter+vec2(0.005,0.))-p;
    vec3 dv=form(parameter+vec2(0.,0.005))-p;
    vNormal=normalize(normalMatrix*normalize(cross(du,dv)));
    vec4 eye=modelViewMatrix*vec4(p,1.);
    vEye=normalize(-eye.xyz); vPosition=p;
    gl_Position=projectionMatrix*eye;
  }
`;
export const silkFragment = `
  uniform float uCool;
  uniform float uOpacity;
  varying vec3 vNormal;
  varying vec3 vEye;
  varying vec3 vPosition;
  void main(){
    vec3 V=normalize(vEye);
    vec3 N=normalize(vNormal);
    if(dot(N,V)<0.)N=-N;
    vec3 R=reflect(-V,N);
    float facing=max(0.,dot(N,V));
    float fresnel=pow(1.-facing,3.);
    float diffuse=max(0.,dot(N,normalize(vec3(-0.55,0.8,0.65))));
    // Analytic studio light panels make curvature legible without environment textures.
    float softbox=pow(max(0.,dot(R,normalize(vec3(-0.45,0.75,0.4)))),10.);
    float rimbox=pow(max(0.,dot(R,normalize(vec3(0.7,0.25,0.6)))),22.);
    float ribbon=exp(-pow((R.y-0.23)*8.,2.))*smoothstep(-0.8,0.4,R.x);
    float tallbox=exp(-pow((R.x+0.62)*8.,2.))*smoothstep(-0.65,0.6,R.y);
    float underside=smoothstep(-0.7,0.5,N.y);
    vec3 copper=vec3(0.48,0.19,0.085);
    vec3 blue=vec3(0.105,0.255,0.31);
    vec3 metal=mix(copper,blue,clamp(uCool*0.65+smoothstep(-0.5,0.9,vPosition.z)*0.28,0.,0.75));
    vec3 color=metal*(0.18+diffuse*0.7)*(0.5+underside*0.5);
    color+=vec3(0.93,0.83,0.69)*(softbox*0.68+tallbox*0.5);
    color+=vec3(0.49,0.78,0.88)*(rimbox*0.55+ribbon*0.36);
    color+=fresnel*mix(vec3(0.48,0.24,0.11),vec3(0.37,0.6,0.69),uCool)*0.55;
    // A restrained brushed finish retains the fine-thread sculpture character.
    color*=0.985+0.015*sin(vPosition.z*110.+vPosition.x*16.);
    gl_FragColor=vec4(color,(0.84+fresnel*0.12)*uOpacity);
  }
`;
export const dustVertex = `
  uniform float uTime;
  uniform float uDpr;
  attribute float seed;
  varying float vSeed;
  varying float vFade;
  void main(){
    vec3 p=position;
    p.x+=sin(uTime*0.04+seed*14.)*0.13;
    p.y+=sin(uTime*0.06+seed*32.)*0.12;
    vec4 eye=modelViewMatrix*vec4(p,1.);
    vSeed=seed;
    vFade=clamp(1.-(-eye.z)/24.,0.,1.);
    gl_PointSize=clamp((6.+seed*7.)*uDpr/max(1.,-eye.z),1.,4.);
    gl_Position=projectionMatrix*eye;
  }
`;
export const dustFragment = `
  uniform float uOpacity;
  varying float vSeed;
  varying float vFade;
  void main(){
    float r=length(gl_PointCoord-0.5)*2.;
    if(r>1.)discard;
    vec3 color=mix(vec3(0.85,0.36,0.14),vec3(0.37,0.66,0.8),step(0.55,vSeed));
    gl_FragColor=vec4(color,pow(1.-r,2.)*vFade*uOpacity);
  }
`;
export const surfacePointsVertex = `
  ${worldForm}
  uniform float uDpr;
  attribute vec2 parameter;
  varying float vSeed;
  varying float vFade;
  void main(){
    vec3 p=form(parameter);
    vec4 eye=modelViewMatrix*vec4(p,1.);
    vSeed=fract(parameter.x*0.71+parameter.y*0.31);
    vFade=clamp(1.25-(-eye.z)*0.07,0.2,1.);
    gl_PointSize=clamp(14.*uDpr/max(1.,-eye.z),1.,4.);
    gl_Position=projectionMatrix*eye;
  }
`;
export const floorVertex = `
  varying vec3 vWorld;
  void main(){
    vec4 p=modelMatrix*vec4(position,1.); vWorld=p.xyz;
    gl_Position=projectionMatrix*viewMatrix*p;
  }
`;
export const floorFragment = `
  varying vec3 vWorld;
  uniform float uCool;
  void main(){
    vec2 p=vWorld.xz;
    vec2 q=p*0.8;
    vec2 grid=abs(fract(q-0.5)-0.5)/max(fwidth(q),vec2(0.001));
    float line=1.-min(min(grid.x,grid.y),1.);
    float rings=abs(fract(length(p-vec2(2.,0.))*1.1-0.5)-0.5)/max(fwidth(length(p)*1.1),0.001);
    float ring=(1.-min(rings,1.))*0.25;
    float fade=exp(-length(p)*0.14)*(1.-smoothstep(3.,16.,abs(p.y)));
    float glow=exp(-length((p-vec2(2.,0.))*vec2(0.7,0.4)))*0.12;
    vec3 hue=mix(vec3(0.42,0.22,0.13),vec3(0.15,0.36,0.41),uCool);
    gl_FragColor=vec4(hue,(line*0.2+ring+glow)*fade);
  }
`;
export const haloVertex = `
  varying vec2 vUv;
  void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}
`;
export const haloFragment = `
  varying vec2 vUv;
  uniform vec3 uColor;
  uniform float uOpacity;
  void main(){
    vec2 p=(vUv-.5)*2.;
    float halo=exp(-dot(p,p)*4.)*(1.-smoothstep(0.7,1.,length(p)));
    gl_FragColor=vec4(uColor,halo*uOpacity);
  }
`;
