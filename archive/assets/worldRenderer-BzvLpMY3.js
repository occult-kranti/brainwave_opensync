import{W as je,c as Be,d as Ie,e as Ue,l as ae,F as Ce,p as Xe,V as He,k as ne,B as C,N as Se,q as Ae,L as ze,h as S,m as Oe,f as se,A as le,n as qe,D as Ye}from"./three.module-BjcmM2Lq.js";import{w as De,c as Ve}from"./worldGeometry-DIUb-kqp.js";const ce=`
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
`,Re=`
  ${ce}
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
`,_e=`
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
`,Ne=`
  ${ce}
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
`,We=`
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
`,$e=`
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
`,ke=`
  uniform float uOpacity;
  varying float vSeed;
  varying float vFade;
  void main(){
    float r=length(gl_PointCoord-0.5)*2.;
    if(r>1.)discard;
    vec3 color=mix(vec3(0.85,0.36,0.14),vec3(0.37,0.66,0.8),step(0.55,vSeed));
    gl_FragColor=vec4(color,pow(1.-r,2.)*vFade*uOpacity);
  }
`,Je=`
  ${ce}
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
`,Ke=`
  varying vec3 vWorld;
  void main(){
    vec4 p=modelMatrix*vec4(position,1.); vWorld=p.xyz;
    gl_Position=projectionMatrix*viewMatrix*p;
  }
`,Qe=`
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
`,Ze=`
  varying vec2 vUv;
  void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}
`,et=`
  varying vec2 vUv;
  uniform vec3 uColor;
  uniform float uOpacity;
  void main(){
    vec2 p=(vUv-.5)*2.;
    float halo=exp(-dot(p,p)*4.)*(1.-smoothstep(0.7,1.,length(p)));
    gl_FragColor=vec4(uColor,halo*uOpacity);
  }
`,v=Math.PI*2,tt=3e6;function rt(T,A,z,Te,Le,Ee){const m=new je({canvas:T,alpha:!0,antialias:!1,powerPreference:"low-power"});m.setClearColor(395534,0),m.outputColorSpace=Be;const f=new Ie,b=new Ue(43,1,.1,45),r=De(A.clientWidth,z.quality,window.devicePixelRatio),c=new ae,L=[],E=[];for(let e=0;e<r.strands;e++){const t=e/r.strands*v;for(let o=0;o<r.segments;o++)for(const s of[o,o+1]){const F=s/r.segments*v;L.push(0,0,0),E.push(F,t+.12*Math.sin(F*3+e*.025))}}for(let e=0;e<20;e++){const t=e/20*v;for(let o=0;o<r.segments;o++)for(const s of[o,o+1])L.push(0,0,0),E.push(t,s/r.segments*v)}c.setAttribute("position",new Ce(L,3)),c.setAttribute("parameter",new Ce(E,2)),c.boundingSphere=new Xe(new He,4);const g=new ne(1,1,72,40),O=g.getAttribute("uv"),G=new Float32Array(O.count*2);for(let e=0;e<O.count;e++)G[e*2]=O.getX(e)*v,G[e*2+1]=O.getY(e)*v;g.setAttribute("parameter",new C(G,2)),g.boundingSphere=c.boundingSphere.clone();const M=new ae,j=new Float32Array(r.particles*2);for(let e=0;e<r.particles;e++)j[e*2]=e*.61803398875%1*v,j[e*2+1]=e*.41421356237%1*v;M.setAttribute("position",new C(new Float32Array(r.particles*3),3)),M.setAttribute("parameter",new C(j,2)),M.boundingSphere=c.boundingSphere.clone();const u={uTime:{value:0},uFourth:{value:z.fourth*Math.PI/180},uDimension:{value:z.dimension==="4d"?1:0},uMotif:{value:0},uCool:{value:.2},uOpacity:{value:.48},uDpr:{value:r.dpr}};function y(e,t,o){return new se({vertexShader:e,fragmentShader:t,uniforms:{...u,uOpacity:{value:o}},transparent:!0,depthWrite:!1,blending:le,side:Ye})}const B=y(Re,_e,.48),p=y(Ne,We,1);p.blending=Se,p.depthWrite=!0,p.polygonOffset=!0,p.polygonOffsetFactor=1,p.polygonOffsetUnits=1;const I=y(Ne,We,.15);I.blending=Se;const U=y(Je,ke,.85),ue=y(Re,_e,.065),d=new Ae,h=new Ae,X=new ze(c,B),q=new S(g,p),H=new Oe(M,U),ve=new S(g,I);q.renderOrder=2,X.renderOrder=3,H.renderOrder=3,d.add(q,X,H),h.add(ve,new ze(c,ue)),f.add(d,h);const Y=new ne(40,40);Y.rotateX(-Math.PI/2);const me=new se({vertexShader:Ke,fragmentShader:Qe,uniforms:{uCool:u.uCool},transparent:!0,depthWrite:!1,blending:le}),pe=new S(Y,me);pe.position.y=-2.2,f.add(pe);const $=new ne(16,12),J=new se({vertexShader:Ze,fragmentShader:et,uniforms:{uColor:{value:new qe(.2,.37,.46)},uOpacity:{value:.18}},transparent:!0,depthWrite:!1,blending:le}),de=new S($,J);de.position.set(3,1,-5),f.add(de);const D=J.clone();D.uniforms.uColor.value=new qe(.5,.18,.08),D.uniforms.uOpacity.value=.14;const fe=new S($,D);fe.position.set(-4,-1,-3),f.add(fe);const V=new ae,K=r.particles/2,ge=new Float32Array(K*3),ye=new Float32Array(K);for(let e=0;e<K;e++){const t=e*.61803398875%1,o=e*.75487766625%1,s=e*.56984029099%1;ge.set([(t-.5)*22,(o-.5)*9,-s*15],e*3),ye[e]=s}V.setAttribute("position",new C(ge,3)),V.setAttribute("seed",new C(ye,1));const he=y($e,ke,.42);f.add(new Oe(V,he));let i=z,Q=Te,w=!1,Z=!1,a=0,R=0,x=0,l=1,_=1,ee=0,te=0,N=0,W=0;const n=Ve(Q);let we={...n},P=!0;function xe(){l=Math.max(1,A.clientWidth),_=Math.max(1,A.clientHeight);const e=De(l,i.quality,window.devicePixelRatio).dpr,t=Math.min(e,Math.sqrt(tt/(l*_)));m.setPixelRatio(t),m.setSize(l,_,!1),u.uDpr.value=t,b.aspect=l/_,b.updateProjectionMatrix(),P=!0,ie()}function Ge(){const e=Ve(Q);return Le?{...e,x:0,y:.25,scale:l<700?1.1:1.65}:l<700?{...e,x:.7,y:.9,scale:1.15}:e}function oe(e){if(a=0,Z||document.hidden)return;const t=i.motion&&!w;if(t&&e-R<1e3/r.fps){a=requestAnimationFrame(oe);return}const o=Math.min(.05,Math.max(0,(e-R)/1e3));R=e,t&&(x+=o),we=Ge();const s=t?.055:1;for(const re of Object.keys(n))n[re]+=(we[re]-n[re])*s;N+=((t?ee:0)-N)*.04,W+=((t?te:0)-W)*.04,u.uTime.value=x,u.uFourth.value=i.fourth*Math.PI/180+x*.045,u.uDimension.value=i.dimension==="4d"?1:0,u.uMotif.value=n.motif,u.uCool.value=n.cool;const F=i.rotation+n.turn+x*.025,k=n.scale*i.zoom;d.position.set(n.x,n.y+Math.sin(x*.18)*.06,0),d.rotation.set(n.tilt,F,-.18),d.scale.setScalar(k),h.position.set(d.position.x,-4.4-d.position.y,0),h.rotation.set(-n.tilt,F,.18),h.scale.set(k,-k,k),X.visible=i.material!=="particles",q.visible=i.material==="silk",ve.visible=q.visible,H.visible=!0,B.uniforms.uOpacity.value=i.material==="threads"?.62:.24,U.uniforms.uOpacity.value=i.material==="particles"?1:.62,h.visible=i.material!=="particles",b.position.set(N*.13,1.25+W*.1,l<700?8.7:8.4),b.lookAt(0,l<700?.3:.15,0),m.render(f,b),P=!1,t&&(a=requestAnimationFrame(oe))}function ie(){!a&&!Z&&!document.hidden&&(P||i.motion&&!w)&&(a=requestAnimationFrame(oe))}function be(e){!i.motion||w||(ee=e.clientX/Math.max(1,window.innerWidth)*2-1,te=e.clientY/Math.max(1,window.innerHeight)*2-1)}function Me(){document.hidden?(cancelAnimationFrame(a),a=0):(R=performance.now(),P=!0,ie())}function Pe(e){e.preventDefault(),cancelAnimationFrame(a),a=0,Ee()}const Fe=new ResizeObserver(xe);return Fe.observe(A),window.addEventListener("pointermove",be,{passive:!0}),document.addEventListener("visibilitychange",Me),T.addEventListener("webglcontextlost",Pe),xe(),{update(e,t,o){const s=w;e.resetToken!==i.resetToken&&(x=0,ee=0,te=0,N=0,W=0),i=e,Q=t,w=o,w&&!s&&(cancelAnimationFrame(a),a=0),P=!0,ie()},dispose(){Z=!0,cancelAnimationFrame(a),Fe.disconnect(),window.removeEventListener("pointermove",be),document.removeEventListener("visibilitychange",Me),T.removeEventListener("webglcontextlost",Pe);for(const e of[c,g,M,Y,$,V])e.dispose();for(const e of[B,p,I,U,ue,me,J,D,he])e.dispose();m.dispose(),m.forceContextLoss()}}}export{rt as createWorldRenderer};
