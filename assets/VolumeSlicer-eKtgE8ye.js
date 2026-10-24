import{r as f,N as V,O as Y,Q as L,a as D,j as s}from"./index-DszBXjHt.js";import{W as $,S as H,C as u,P as X,G as J,a as q,D as K,b as C,c as G,N as Q,I as Z,M as ee,d as te,A as ae,e as ne,L as re,E as se,B as oe,f as ie,T as le,g as O,h as F}from"./three-Cw-bJvCs.js";const ce=`
  attribute float aIndex;
  varying vec2 vUv;
  varying float vIndex;

  void main() {
    vUv = uv;
    vIndex = aIndex;
    vec4 mvPosition = modelViewMatrix * instanceMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * mvPosition;
  }
`,ue=`
  precision highp float;
  varying vec2 vUv;
  varying float vIndex;
  uniform vec3 uBone;
  uniform vec3 uRed;
  uniform vec3 uBase;
  uniform vec3 uJade;
  uniform vec3 uAmber;
  uniform float uScan;
  uniform float uOpacity;
  uniform sampler2D uAtlas;
  uniform float uHasData;
  uniform float uSlices;
  uniform float uGrid;

  float hash(vec3 p) {
    p = fract(p * 0.3183099 + vec3(0.1, 0.2, 0.3));
    p *= 17.0;
    return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
  }

  float noise(vec3 x) {
    vec3 i = floor(x);
    vec3 f = fract(x);
    f = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(mix(hash(i), hash(i + vec3(1, 0, 0)), f.x),
          mix(hash(i + vec3(0, 1, 0)), hash(i + vec3(1, 1, 0)), f.x), f.y),
      mix(mix(hash(i + vec3(0, 0, 1)), hash(i + vec3(1, 0, 1)), f.x),
          mix(hash(i + vec3(0, 1, 1)), hash(i + vec3(1, 1, 1)), f.x), f.y),
      f.z);
  }

  float fbm(vec3 p) {
    float value = 0.0;
    float amplitude = 0.5;
    for (int i = 0; i < 3; i++) {
      value += amplitude * noise(p);
      p = p * 2.03 + vec3(11.3);
      amplitude *= 0.5;
    }
    return value;
  }

  void main() {
    // 扫描面以上不渲染：滑杆就是「切到第几层」，露出的顶面即当前切片
    if (vIndex > uScan) discard;

    vec3 color;
    float alpha;

    if (uHasData > 0.5) {
      // 真实影像：行优先排列的图集，第 0 层在左上角（纹理 flipY=false）
      float index = floor(vIndex * (uSlices - 1.0) + 0.5);
      vec2 cell = vec2(mod(index, uGrid), floor(index / uGrid));
      vec2 uv = (cell + clamp(vUv, 0.004, 0.996)) / uGrid;
      vec4 texel = texture2D(uAtlas, uv);
      float intensity = texel.r;
      float label = floor(texel.g * 255.0 / 80.0 + 0.5);

      float body = smoothstep(0.04, 0.16, intensity);
      if (body < 0.02) discard;

      // 真实 T1c 的组织强度集中在 0.2–0.35，先做对比拉伸再映射到纸色阶
      float contrasted = clamp((intensity - 0.06) * 1.75, 0.0, 1.0);
      color = mix(uBase, uBone, 0.16 + contrasted * 0.86);
      if (label > 0.5) {
        vec3 tumor = label < 1.5 ? uJade : (label < 2.5 ? uAmber : uRed);
        color = mix(color, tumor, 0.9);
      }
      alpha = body;
    } else {
      // 程序化体数据：x/z 为切片内位置，y 为切片序号，切片之间连续
      vec3 p = vec3((vUv.x - 0.5) * 2.0, (vIndex - 0.5) * 2.0, (vUv.y - 0.5) * 2.0);
      float r = length(p.xz);
      float body = 1.0 - smoothstep(0.84, 1.0, r);
      if (body <= 0.001) discard;

      float tissue = fbm(p * 5.0 + vec3(4.7));
      float skull = smoothstep(0.7, 0.79, r) * (1.0 - smoothstep(0.79, 0.9, r));
      float rim = smoothstep(0.8, 0.87, r) * (1.0 - smoothstep(0.9, 1.0, r));
      float ventricle = (1.0 - smoothstep(0.05, 0.16, abs(abs(p.x) - 0.18))) * (1.0 - smoothstep(0.12, 0.3, abs(p.z)));
      float density = clamp(0.24 + tissue * 0.5 + skull * 0.45 - ventricle * 0.35, 0.0, 1.0);

      color = mix(uBase, uBone, 0.22 + density * 0.78 + rim * 0.12);
      alpha = body;
    }

    // 扫描面只染切片外沿：当前层保留真实影像，朱红勾边提示「这一层正在被扫」
    float rim = smoothstep(0.42, 0.5, max(abs(vUv.x - 0.5), abs(vUv.y - 0.5)));
    float d = abs(vIndex - uScan);
    float glow = exp(-d * d * 900.0);
    color = mix(color, uRed, glow * (0.1 + rim * 0.75));
    // 深度衰减：越深的切片越沉，压掉底缘掠射角的条纹噪声
    color *= mix(0.72, 1.0, vIndex / max(uScan, 0.001));
    color = mix(uBase, color, uOpacity);
    gl_FragColor = vec4(color, alpha);
  }
`,de=`
  varying vec2 vUv;

  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`,fe=`
  precision highp float;
  varying vec2 vUv;
  uniform vec3 uRed;
  uniform vec3 uBone;
  uniform float uOpacity;

  void main() {
    vec2 edgeCoord = abs(vUv - 0.5) * 2.0;
    float edge = smoothstep(0.978, 1.0, max(edgeCoord.x, edgeCoord.y));
    vec2 grid = abs(fract(vUv * 12.0) - 0.5);
    float line = smoothstep(0.47, 0.5, max(grid.x, grid.y));
    float alpha = (edge * 0.55 + line * 0.025) * uOpacity;
    gl_FragColor = vec4(mix(uRed, uBone, line * 0.25), alpha);
  }
`,T=.72,me=Math.PI*2/18;function ve(m,d={}){var n;const i=d.slices??64,v=new $({canvas:m,antialias:!0,alpha:!1,powerPreference:"low-power"});v.setPixelRatio(Math.min(window.devicePixelRatio||1,d.maxDpr??2));const r=new H;r.background=new u("#12100d");const h=new X(33,1,.1,60);h.position.set(0,3.9,4.3),h.lookAt(0,0,0);const o=new J;r.add(o);const x=new q(2.2,2.2);x.rotateX(-Math.PI/2);const M=new Float32Array(i),b=new K(new Uint8Array([255,255,255,255]),1,1);b.needsUpdate=!0;const c=new C({vertexShader:ce,fragmentShader:ue,uniforms:{uBone:{value:new u("#ede4d3")},uRed:{value:new u("#d4633f")},uBase:{value:new u("#12100d")},uJade:{value:new u("#4f6f5e")},uAmber:{value:new u("#b98431")},uScan:{value:.5},uOpacity:{value:1},uAtlas:{value:b},uHasData:{value:0},uSlices:{value:i},uGrid:{value:((n=d.atlas)==null?void 0:n.grid)??8}},transparent:!1,alphaTest:.5,alphaToCoverage:!1,depthWrite:!0,blending:Q,side:G}),g=new Z(x,c,i),N=new ee;for(let e=0;e<i;e+=1){const l=i===1?.5:e/(i-1);M[e]=l,N.makeTranslation(0,-T+l*T*2,0),g.setMatrixAt(e,N)}x.setAttribute("aIndex",new te(M,1)),g.instanceMatrix.needsUpdate=!0,g.frustumCulled=!1,o.add(g);const w=new C({vertexShader:de,fragmentShader:fe,uniforms:{uRed:{value:new u("#d4633f")},uBone:{value:new u("#ede4d3")},uOpacity:{value:0}},transparent:!0,depthWrite:!1,blending:ae,side:G}),p=new ne(x.clone(),w);p.geometry.deleteAttribute("aIndex"),o.add(p);const j=new re(new se(new oe(2.24,T*2+.06,2.24)),new ie({color:"#ede4d3",transparent:!0,opacity:.16}));o.add(j);let y=null;d.atlas&&new le().load(d.atlas.url,e=>{e.flipY=!1,e.minFilter=O,e.magFilter=O,e.generateMipmaps=!1,e.wrapS=F,e.wrapT=F,c.uniforms.uAtlas.value=e,c.uniforms.uHasData.value=1,y=e,b.dispose()},void 0,()=>console.warn("[volume] 切片图集加载失败，回退程序化体数据"));let A=null,_=.5,P=0,E=0,a=0,t=0;return{setTheme(e){r.background=new u(e.graphite),c.uniforms.uBase.value=new u(e.graphite),c.uniforms.uBone.value=new u(e.bone),c.uniforms.uRed.value=new u(e.red),c.uniforms.uJade.value=new u(e.jade),c.uniforms.uAmber.value=new u(e.amber),w.uniforms.uRed.value=new u(e.red),w.uniforms.uBone.value=new u(e.bone)},setScan(e){A=e===null?null:Math.min(1,Math.max(0,e))},nudge(e,l){P+=e*.005,E=Math.min(.4,Math.max(-.4,E+l*.003))},render(e){const l=e*.14%2,U=A??(l<1?l:2-l);_+=(U-_)*.12,a+=(P-a)*.08,t+=(E-t)*.08,c.uniforms.uScan.value=_,c.uniforms.uOpacity.value=1,w.uniforms.uOpacity.value=1,p.position.y=-T+_*T*2,o.rotation.y=e*me+a,o.rotation.x=t,v.render(r,h)},resize(){const e=m.clientWidth,l=m.clientHeight;e<=0||l<=0||(v.setSize(e,l,!1),h.aspect=e/l,h.updateProjectionMatrix())},dispose(){g.dispose(),x.dispose(),p.geometry.dispose(),c.dispose(),w.dispose(),j.geometry.dispose(),j.material.dispose(),b.dispose(),y==null||y.dispose(),v.dispose()}}}const pe="/showcase/volume/brats-atlas.png",z="/showcase/volume/brats-atlas.json",k={on:"拖拽旋转 · 聚焦后滚轮 / 方向键切换层面",static:"静态帧 · 已尊重减动效偏好",off:"WEBGL 不可用 · 图版模式"};function W(){const m=getComputedStyle(document.documentElement),d=(i,v)=>m.getPropertyValue(i).trim()||v;return{graphite:d("--graphite","#12100d"),bone:d("--bone","#ede4d3"),red:d("--red-2","#d4633f"),jade:d("--jade","#4f6f5e"),amber:d("--amber","#b98431")}}function ge(){const m=f.useRef(null),d=f.useRef(null),i=f.useRef(null),v=f.useRef(null),[r,h]=f.useState(()=>V()?Y()?"static":"on":"off"),[o,x]=f.useState(null),[M,b]=f.useState(!1),[c,g]=f.useState(null),N=r==="on"&&L(),w=(o==null?void 0:o.slices)??48,p=a=>{var n,e;const t=a===null?null:Math.min(1,Math.max(0,a));g(t),(n=i.current)==null||n.setScan(t),r==="static"&&((e=i.current)==null||e.render(1))};f.useEffect(()=>{let a=!1;const t=async n=>{try{const e=D(n?`${z}?v=${Date.now()}`:z),l=await fetch(e,{cache:"no-store"});if(!l.ok)throw new Error(String(l.status));return await l.json()}catch{return n>=1?null:(await new Promise(e=>window.setTimeout(e,1200)),t(n+1))}};return t(0).then(n=>{a||(x(n),b(!0))}),()=>{a=!0}},[]),f.useEffect(()=>{if(r==="off"||!M)return;const a=d.current;if(!a)return;let t=null;try{t=ve(a,{slices:(o==null?void 0:o.slices)??48,maxDpr:L()?2:1.5,atlas:o?{url:D(pe),grid:o.grid}:void 0}),i.current=t,t.resize(),t.setTheme(W()),r==="static"&&t.setScan(.92),t.render(1)}catch{t==null||t.dispose(),i.current=null,h("off")}return()=>{i.current=null,t==null||t.dispose()}},[r,M,o]),f.useEffect(()=>{if(r==="off")return;const a=new MutationObserver(()=>{var t,n;(t=i.current)==null||t.setTheme(W()),r==="static"&&((n=i.current)==null||n.render(1))});return a.observe(document.documentElement,{attributes:!0,attributeFilter:["data-mode"]}),()=>a.disconnect()},[r]),f.useEffect(()=>{if(r==="off")return;const a=m.current;if(!a||typeof ResizeObserver>"u")return;const t=new ResizeObserver(()=>{var n,e;(n=i.current)==null||n.resize(),r==="static"&&((e=i.current)==null||e.render(1))});return t.observe(a),()=>t.disconnect()},[r]),f.useEffect(()=>{if(r!=="on")return;const a=m.current;if(!a)return;let t=0,n=!1,e=!1;const l=S=>{var R;(R=i.current)==null||R.render(S/1e3),n&&(t=window.requestAnimationFrame(l))},U=()=>{const S=e&&!document.hidden;S&&!n?(n=!0,t=window.requestAnimationFrame(l)):!S&&n&&(n=!1,window.cancelAnimationFrame(t))},I=()=>U(),B=new IntersectionObserver(S=>{var R;e=((R=S[0])==null?void 0:R.isIntersecting)??!1,U()});return B.observe(a),document.addEventListener("visibilitychange",I),()=>{n=!1,window.cancelAnimationFrame(t),B.disconnect(),document.removeEventListener("visibilitychange",I)}},[r]),f.useEffect(()=>{if(r!=="on")return;const a=m.current;if(!a)return;const t=n=>{a.contains(document.activeElement)&&(n.preventDefault(),p((c??.5)+(n.deltaY>0?.05:-.05)))};return a.addEventListener("wheel",t,{passive:!1}),()=>a.removeEventListener("wheel",t)},[r,c]);const j=a=>{var t;N&&((t=m.current)==null||t.focus(),v.current={x:a.clientX,y:a.clientY},a.currentTarget.setPointerCapture(a.pointerId))},y=a=>{var n;const t=v.current;t&&((n=i.current)==null||n.nudge(a.clientX-t.x,a.clientY-t.y),v.current={x:a.clientX,y:a.clientY})},A=()=>{v.current=null},_=a=>{const n={ArrowUp:.05,ArrowRight:.05,ArrowDown:-.05,ArrowLeft:-.05}[a.key];n!==void 0&&(a.preventDefault(),p((c??.5)+n))},P=o?"brats":"procedural",E=o?`BraTS2023 · ${o.modality} + 预测掩码 · 公开脱敏数据`:"程序化体数据 · 无真实患者数据";return s.jsxs("div",{ref:m,className:`volume volume--${r}`,"data-webgl":r,"data-source":P,role:"group","aria-label":`体切片扫描器：${w} 层${o?"真实 T1c 影像与 Lite-Mamba 预测掩码":"程序化影像"}切片堆叠成体积，朱红扫描面逐层切换。${k[r]}`,tabIndex:r==="on"?0:void 0,onPointerDown:j,onPointerMove:y,onPointerUp:A,onPointerCancel:A,onKeyDown:_,children:[r!=="off"&&s.jsx("canvas",{ref:d,className:"volume__canvas","aria-hidden":"true"}),r==="off"&&s.jsxs("div",{className:"volume__fallback","aria-hidden":"true",children:[Array.from({length:7},(a,t)=>s.jsx("span",{style:{transform:`translateY(${(t-3)*14}px)`}},t)),s.jsx("i",{})]}),s.jsx("span",{className:"lightbox__corner lightbox__corner--tl","aria-hidden":"true"}),s.jsx("span",{className:"lightbox__corner lightbox__corner--tr","aria-hidden":"true"}),s.jsx("span",{className:"lightbox__corner lightbox__corner--bl","aria-hidden":"true"}),s.jsx("span",{className:"lightbox__corner lightbox__corner--br","aria-hidden":"true"}),s.jsxs("div",{className:"lightbox__top",children:[s.jsx("span",{children:"W-00 · VOLUME STUDY"}),s.jsx("span",{children:o?`${o.slices} SLICES / T1c + SEG`:"PROCEDURAL / GLSL"})]}),s.jsxs("div",{className:"volume__hud",children:[s.jsx("span",{className:"volume__note",children:E}),o&&s.jsxs("span",{className:"volume__legend","aria-hidden":"true",children:[s.jsx("i",{className:"volume__swatch volume__swatch--net"})," NET",s.jsx("i",{className:"volume__swatch volume__swatch--ed"})," ED",s.jsx("i",{className:"volume__swatch volume__swatch--et"})," ET"]}),r!=="off"&&s.jsxs("div",{className:"volume__controls",children:[s.jsxs("label",{className:"volume__scan",children:[s.jsx("span",{children:"SCAN"}),s.jsx("input",{type:"range",min:0,max:100,value:Math.round((c??.5)*100),"aria-label":"扫描深度",onChange:a=>p(Number(a.target.value)/100)})]}),s.jsx("button",{type:"button",className:"volume__auto","aria-pressed":c===null,onClick:()=>p(null),children:c===null?"AUTO":"复位"})]}),s.jsx("span",{className:"volume__hint",children:k[r]})]})]})}export{ge as default};
