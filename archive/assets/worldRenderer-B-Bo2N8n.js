import{W as ke,c as Ee,d as Ge,e as je,l as ee,F as Pe,p as Re,V as Be,k as te,B as F,q as Fe,L as Ce,h as W,m as Se,f as oe,A as ie,n as Ae,D as Ie}from"./three.module-DrryIutn.js";import{w as ze,c as qe}from"./worldGeometry-DIUb-kqp.js";const re=`
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
`,De=`
  ${re}
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
`,Oe=`
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
`,Xe=`
  ${re}
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
`,Ne=`
  uniform float uCool;
  uniform float uOpacity;
  varying vec3 vNormal;
  varying vec3 vEye;
  varying vec3 vPosition;
  void main(){
    float fresnel=pow(1.-abs(dot(normalize(vNormal),normalize(vEye))),2.8);
    float light=max(0.,dot(normalize(vNormal),normalize(vec3(-0.5,0.9,0.6))));
    vec3 color=mix(vec3(0.45,0.18,0.09),vec3(0.12,0.38,0.48),uCool);
    color=mix(color,vec3(0.9,0.75,0.6),pow(light,12.)*0.7);
    gl_FragColor=vec4(color+fresnel*vec3(0.25,0.35,0.38),(0.05+fresnel*0.28)*uOpacity);
  }
`,Ue=`
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
`,_e=`
  uniform float uOpacity;
  varying float vSeed;
  varying float vFade;
  void main(){
    float r=length(gl_PointCoord-0.5)*2.;
    if(r>1.)discard;
    vec3 color=mix(vec3(0.85,0.36,0.14),vec3(0.37,0.66,0.8),step(0.55,vSeed));
    gl_FragColor=vec4(color,pow(1.-r,2.)*vFade*uOpacity);
  }
`,He=`
  ${re}
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
`,Ye=`
  varying vec3 vWorld;
  void main(){
    vec4 p=modelMatrix*vec4(position,1.); vWorld=p.xyz;
    gl_Position=projectionMatrix*viewMatrix*p;
  }
`,$e=`
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
`,Je=`
  varying vec2 vUv;
  void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}
`,Ke=`
  varying vec2 vUv;
  uniform vec3 uColor;
  uniform float uOpacity;
  void main(){
    vec2 p=(vUv-.5)*2.;
    float halo=exp(-dot(p,p)*4.)*(1.-smoothstep(0.7,1.,length(p)));
    gl_FragColor=vec4(uColor,halo*uOpacity);
  }
`,v=Math.PI*2,Qe=3e6;function tt(L,C,S,Te,Ve,We){const m=new ke({canvas:L,alpha:!0,antialias:!1,powerPreference:"low-power"});m.setClearColor(395534,0),m.outputColorSpace=Ee;const d=new Ge,w=new je(43,1,.1,45),r=ze(C.clientWidth,S.quality,window.devicePixelRatio),c=new ee,k=[],E=[];for(let e=0;e<r.strands;e++){const t=e/r.strands*v;for(let o=0;o<r.segments;o++)for(const s of[o,o+1]){const P=s/r.segments*v;k.push(0,0,0),E.push(P,t+.12*Math.sin(P*3+e*.025))}}for(let e=0;e<20;e++){const t=e/20*v;for(let o=0;o<r.segments;o++)for(const s of[o,o+1])k.push(0,0,0),E.push(t,s/r.segments*v)}c.setAttribute("position",new Pe(k,3)),c.setAttribute("parameter",new Pe(E,2)),c.boundingSphere=new Re(new Be,4);const h=new te(1,1,72,40),A=h.getAttribute("uv"),G=new Float32Array(A.count*2);for(let e=0;e<A.count;e++)G[e*2]=A.getX(e)*v,G[e*2+1]=A.getY(e)*v;h.setAttribute("parameter",new F(G,2)),h.boundingSphere=c.boundingSphere.clone();const x=new ee,j=new Float32Array(r.particles*2);for(let e=0;e<r.particles;e++)j[e*2]=e*.61803398875%1*v,j[e*2+1]=e*.41421356237%1*v;x.setAttribute("position",new F(new Float32Array(r.particles*3),3)),x.setAttribute("parameter",new F(j,2)),x.boundingSphere=c.boundingSphere.clone();const u={uTime:{value:0},uFourth:{value:S.fourth*Math.PI/180},uDimension:{value:S.dimension==="4d"?1:0},uMotif:{value:0},uCool:{value:.2},uOpacity:{value:.48},uDpr:{value:r.dpr}};function M(e,t,o){return new oe({vertexShader:e,fragmentShader:t,uniforms:{...u,uOpacity:{value:o}},transparent:!0,depthWrite:!1,blending:ie,side:Ie})}const R=M(De,Oe,.48),ae=M(Xe,Ne,.6),B=M(He,_e,.85),ne=M(De,Oe,.065),p=new Fe,f=new Fe,se=new Ce(c,R),le=new W(h,ae),ce=new Se(x,B);p.add(le,se,ce),f.add(new Ce(c,ne)),d.add(p,f);const I=new te(40,40);I.rotateX(-Math.PI/2);const ue=new oe({vertexShader:Ye,fragmentShader:$e,uniforms:{uCool:u.uCool},transparent:!0,depthWrite:!1,blending:ie}),ve=new W(I,ue);ve.position.y=-2.2,d.add(ve);const X=new te(16,12),N=new oe({vertexShader:Je,fragmentShader:Ke,uniforms:{uColor:{value:new Ae(.2,.37,.46)},uOpacity:{value:.18}},transparent:!0,depthWrite:!1,blending:ie}),me=new W(X,N);me.position.set(3,1,-5),d.add(me);const z=N.clone();z.uniforms.uColor.value=new Ae(.5,.18,.08),z.uniforms.uOpacity.value=.14;const pe=new W(X,z);pe.position.set(-4,-1,-3),d.add(pe);const q=new ee,U=r.particles/2,de=new Float32Array(U*3),fe=new Float32Array(U);for(let e=0;e<U;e++){const t=e*.61803398875%1,o=e*.75487766625%1,s=e*.56984029099%1;de.set([(t-.5)*22,(o-.5)*9,-s*15],e*3),fe[e]=s}q.setAttribute("position",new F(de,3)),q.setAttribute("seed",new F(fe,1));const ge=M(Ue,_e,.42);d.add(new Se(q,ge));let i=S,H=Te,g=!1,Y=!1,a=0,D=0,y=0,l=1,O=1,$=0,J=0,_=0,T=0;const n=qe(H);let ye={...n},b=!0;function we(){l=Math.max(1,C.clientWidth),O=Math.max(1,C.clientHeight);const e=ze(l,i.quality,window.devicePixelRatio).dpr,t=Math.min(e,Math.sqrt(Qe/(l*O)));m.setPixelRatio(t),m.setSize(l,O,!1),u.uDpr.value=t,w.aspect=l/O,w.updateProjectionMatrix(),b=!0,Q()}function Le(){const e=qe(H);return Ve?{...e,x:0,y:.25,scale:l<700?1.1:1.65}:l<700?{...e,x:.7,y:.9,scale:1.15}:e}function K(e){if(a=0,Y||document.hidden)return;const t=i.motion&&!g;if(t&&e-D<1e3/r.fps){a=requestAnimationFrame(K);return}const o=Math.min(.05,Math.max(0,(e-D)/1e3));D=e,t&&(y+=o),ye=Le();const s=t?.055:1;for(const Z of Object.keys(n))n[Z]+=(ye[Z]-n[Z])*s;_+=((t?$:0)-_)*.04,T+=((t?J:0)-T)*.04,u.uTime.value=y,u.uFourth.value=i.fourth*Math.PI/180+y*.045,u.uDimension.value=i.dimension==="4d"?1:0,u.uMotif.value=n.motif,u.uCool.value=n.cool;const P=i.rotation+n.turn+y*.025,V=n.scale*i.zoom;p.position.set(n.x,n.y+Math.sin(y*.18)*.06,0),p.rotation.set(n.tilt,P,-.18),p.scale.setScalar(V),f.position.set(p.position.x,-4.4-p.position.y,0),f.rotation.set(-n.tilt,P,.18),f.scale.set(V,-V,V),se.visible=i.material!=="particles",le.visible=i.material==="silk",ce.visible=!0,R.uniforms.uOpacity.value=i.material==="threads"?.62:.44,B.uniforms.uOpacity.value=i.material==="particles"?1:.62,f.visible=i.material!=="particles",w.position.set(_*.13,1.25+T*.1,l<700?8.7:8.4),w.lookAt(0,l<700?.3:.15,0),m.render(d,w),b=!1,t&&(a=requestAnimationFrame(K))}function Q(){!a&&!Y&&!document.hidden&&(b||i.motion&&!g)&&(a=requestAnimationFrame(K))}function he(e){!i.motion||g||($=e.clientX/Math.max(1,window.innerWidth)*2-1,J=e.clientY/Math.max(1,window.innerHeight)*2-1)}function xe(){document.hidden?(cancelAnimationFrame(a),a=0):(D=performance.now(),b=!0,Q())}function Me(e){e.preventDefault(),cancelAnimationFrame(a),a=0,We()}const be=new ResizeObserver(we);return be.observe(C),window.addEventListener("pointermove",he,{passive:!0}),document.addEventListener("visibilitychange",xe),L.addEventListener("webglcontextlost",Me),we(),{update(e,t,o){const s=g;e.resetToken!==i.resetToken&&(y=0,$=0,J=0,_=0,T=0),i=e,H=t,g=o,g&&!s&&(cancelAnimationFrame(a),a=0),b=!0,Q()},dispose(){Y=!0,cancelAnimationFrame(a),be.disconnect(),window.removeEventListener("pointermove",he),document.removeEventListener("visibilitychange",xe),L.removeEventListener("webglcontextlost",Me);for(const e of[c,h,x,I,X,q])e.dispose();for(const e of[R,ae,B,ne,ue,N,z,ge])e.dispose();m.dispose(),m.forceContextLoss()}}}export{tt as createWorldRenderer};
