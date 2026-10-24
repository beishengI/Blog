import{r as f,N as W,O as V,Q as L,a as D,j as s}from"./index-B7xFv512.js";import{W as Y,S as H,C as c,P as $,G as X,a as J,D as q,b as C,c as G,N as K,I as Q,M as Z,d as ee,A as te,e as ae,L as ne,E as re,B as se,f as oe,T as ie,g as O,h as F}from"./three-Cw-bJvCs.js";const le=`
  attribute float aIndex;
  varying vec2 vUv;
  varying float vIndex;

  void main() {
    vUv = uv;
    vIndex = aIndex;
    vec4 mvPosition = modelViewMatrix * instanceMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * mvPosition;
  }
`,ce=`
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
`,ue=`
  varying vec2 vUv;

  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`,de=`
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
`,T=.72,fe=Math.PI*2/18;function me(m,d={}){var r;const i=d.slices??64,v=new Y({canvas:m,antialias:!0,alpha:!1,powerPreference:"low-power"});v.setPixelRatio(Math.min(window.devicePixelRatio||1,d.maxDpr??2));const n=new H;n.background=new c("#12100d");const x=new $(33,1,.1,60);x.position.set(0,3.9,4.3),x.lookAt(0,0,0);const o=new X;n.add(o);const h=new J(2.2,2.2);h.rotateX(-Math.PI/2);const M=new Float32Array(i),w=new q(new Uint8Array([255,255,255,255]),1,1);w.needsUpdate=!0;const l=new C({vertexShader:le,fragmentShader:ce,uniforms:{uBone:{value:new c("#ede4d3")},uRed:{value:new c("#d4633f")},uBase:{value:new c("#12100d")},uJade:{value:new c("#4f6f5e")},uAmber:{value:new c("#b98431")},uScan:{value:.5},uOpacity:{value:1},uAtlas:{value:w},uHasData:{value:0},uSlices:{value:i},uGrid:{value:((r=d.atlas)==null?void 0:r.grid)??8}},transparent:!1,alphaTest:.5,alphaToCoverage:!1,depthWrite:!0,blending:K,side:G}),g=new Q(h,l,i),N=new Z;for(let a=0;a<i;a+=1){const u=i===1?.5:a/(i-1);M[a]=u,N.makeTranslation(0,-T+u*T*2,0),g.setMatrixAt(a,N)}h.setAttribute("aIndex",new ee(M,1)),g.instanceMatrix.needsUpdate=!0,g.frustumCulled=!1,o.add(g);const b=new C({vertexShader:ue,fragmentShader:de,uniforms:{uRed:{value:new c("#d4633f")},uBone:{value:new c("#ede4d3")},uOpacity:{value:0}},transparent:!0,depthWrite:!1,blending:te,side:G}),p=new ae(h.clone(),b);p.geometry.deleteAttribute("aIndex"),o.add(p);const j=new ne(new re(new se(2.24,T*2+.06,2.24)),new oe({color:"#ede4d3",transparent:!0,opacity:.16}));o.add(j);let y=null;d.atlas&&new ie().load(d.atlas.url,a=>{a.flipY=!1,a.minFilter=O,a.magFilter=O,a.generateMipmaps=!1,a.wrapS=F,a.wrapT=F,l.uniforms.uAtlas.value=a,l.uniforms.uHasData.value=1,y=a,w.dispose()},void 0,()=>console.warn("[volume] 切片图集加载失败，回退程序化体数据"));let A=null,_=.5,P=0,E=0,t=0,e=0;return{setTheme(a){n.background=new c(a.graphite),l.uniforms.uBase.value=new c(a.graphite),l.uniforms.uBone.value=new c(a.bone),l.uniforms.uRed.value=new c(a.red),l.uniforms.uJade.value=new c(a.jade),l.uniforms.uAmber.value=new c(a.amber),b.uniforms.uRed.value=new c(a.red),b.uniforms.uBone.value=new c(a.bone)},setScan(a){A=a===null?null:Math.min(1,Math.max(0,a))},nudge(a,u){P+=a*.005,E=Math.min(.4,Math.max(-.4,E+u*.003))},render(a){const u=a*.14%2,U=A??(u<1?u:2-u);_+=(U-_)*.12,t+=(P-t)*.08,e+=(E-e)*.08,l.uniforms.uScan.value=_,l.uniforms.uOpacity.value=1,b.uniforms.uOpacity.value=1,p.position.y=-T+_*T*2,o.rotation.y=a*fe+t,o.rotation.x=e,v.render(n,x)},resize(){const a=m.clientWidth,u=m.clientHeight;a<=0||u<=0||(v.setSize(a,u,!1),x.aspect=a/u,x.updateProjectionMatrix())},dispose(){g.dispose(),h.dispose(),p.geometry.dispose(),l.dispose(),b.dispose(),j.geometry.dispose(),j.material.dispose(),w.dispose(),y==null||y.dispose(),v.dispose()}}}const ve="/showcase/volume/brats-atlas.png",pe="/showcase/volume/brats-atlas.json",z={on:"拖拽旋转 · 聚焦后滚轮 / 方向键切换层面",static:"静态帧 · 已尊重减动效偏好",off:"WEBGL 不可用 · 图版模式"};function k(){const m=getComputedStyle(document.documentElement),d=(i,v)=>m.getPropertyValue(i).trim()||v;return{graphite:d("--graphite","#12100d"),bone:d("--bone","#ede4d3"),red:d("--red-2","#d4633f"),jade:d("--jade","#4f6f5e"),amber:d("--amber","#b98431")}}function ge(){const m=f.useRef(null),d=f.useRef(null),i=f.useRef(null),v=f.useRef(null),[n,x]=f.useState(()=>W()?V()?"static":"on":"off"),[o,h]=f.useState(null),[M,w]=f.useState(!1),[l,g]=f.useState(null),N=n==="on"&&L(),b=(o==null?void 0:o.slices)??48,p=t=>{var r,a;const e=t===null?null:Math.min(1,Math.max(0,t));g(e),(r=i.current)==null||r.setScan(e),n==="static"&&((a=i.current)==null||a.render(1))};f.useEffect(()=>{let t=!1;return fetch(D(pe)).then(e=>e.ok?e.json():Promise.reject(new Error(String(e.status)))).then(e=>{t||h(e)}).catch(()=>{t||h(null)}).finally(()=>{t||w(!0)}),()=>{t=!0}},[]),f.useEffect(()=>{if(n==="off"||!M)return;const t=d.current;if(!t)return;let e=null;try{e=me(t,{slices:(o==null?void 0:o.slices)??48,maxDpr:L()?2:1.5,atlas:o?{url:D(ve),grid:o.grid}:void 0}),i.current=e,e.resize(),e.setTheme(k()),n==="static"&&e.setScan(.92),e.render(1)}catch{e==null||e.dispose(),i.current=null,x("off")}return()=>{i.current=null,e==null||e.dispose()}},[n,M,o]),f.useEffect(()=>{if(n==="off")return;const t=new MutationObserver(()=>{var e,r;(e=i.current)==null||e.setTheme(k()),n==="static"&&((r=i.current)==null||r.render(1))});return t.observe(document.documentElement,{attributes:!0,attributeFilter:["data-mode"]}),()=>t.disconnect()},[n]),f.useEffect(()=>{if(n==="off")return;const t=m.current;if(!t||typeof ResizeObserver>"u")return;const e=new ResizeObserver(()=>{var r,a;(r=i.current)==null||r.resize(),n==="static"&&((a=i.current)==null||a.render(1))});return e.observe(t),()=>e.disconnect()},[n]),f.useEffect(()=>{if(n!=="on")return;const t=m.current;if(!t)return;let e=0,r=!1,a=!1;const u=S=>{var R;(R=i.current)==null||R.render(S/1e3),r&&(e=window.requestAnimationFrame(u))},U=()=>{const S=a&&!document.hidden;S&&!r?(r=!0,e=window.requestAnimationFrame(u)):!S&&r&&(r=!1,window.cancelAnimationFrame(e))},I=()=>U(),B=new IntersectionObserver(S=>{var R;a=((R=S[0])==null?void 0:R.isIntersecting)??!1,U()});return B.observe(t),document.addEventListener("visibilitychange",I),()=>{r=!1,window.cancelAnimationFrame(e),B.disconnect(),document.removeEventListener("visibilitychange",I)}},[n]),f.useEffect(()=>{if(n!=="on")return;const t=m.current;if(!t)return;const e=r=>{t.contains(document.activeElement)&&(r.preventDefault(),p((l??.5)+(r.deltaY>0?.05:-.05)))};return t.addEventListener("wheel",e,{passive:!1}),()=>t.removeEventListener("wheel",e)},[n,l]);const j=t=>{var e;N&&((e=m.current)==null||e.focus(),v.current={x:t.clientX,y:t.clientY},t.currentTarget.setPointerCapture(t.pointerId))},y=t=>{var r;const e=v.current;e&&((r=i.current)==null||r.nudge(t.clientX-e.x,t.clientY-e.y),v.current={x:t.clientX,y:t.clientY})},A=()=>{v.current=null},_=t=>{const r={ArrowUp:.05,ArrowRight:.05,ArrowDown:-.05,ArrowLeft:-.05}[t.key];r!==void 0&&(t.preventDefault(),p((l??.5)+r))},P=o?"brats":"procedural",E=o?`BraTS2023 · ${o.modality} + 预测掩码 · 公开脱敏数据`:"程序化体数据 · 无真实患者数据";return s.jsxs("div",{ref:m,className:`volume volume--${n}`,"data-webgl":n,"data-source":P,role:"group","aria-label":`体切片扫描器：${b} 层${o?"真实 T1c 影像与 Lite-Mamba 预测掩码":"程序化影像"}切片堆叠成体积，朱红扫描面逐层切换。${z[n]}`,tabIndex:n==="on"?0:void 0,onPointerDown:j,onPointerMove:y,onPointerUp:A,onPointerCancel:A,onKeyDown:_,children:[n!=="off"&&s.jsx("canvas",{ref:d,className:"volume__canvas","aria-hidden":"true"}),n==="off"&&s.jsxs("div",{className:"volume__fallback","aria-hidden":"true",children:[Array.from({length:7},(t,e)=>s.jsx("span",{style:{transform:`translateY(${(e-3)*14}px)`}},e)),s.jsx("i",{})]}),s.jsx("span",{className:"lightbox__corner lightbox__corner--tl","aria-hidden":"true"}),s.jsx("span",{className:"lightbox__corner lightbox__corner--tr","aria-hidden":"true"}),s.jsx("span",{className:"lightbox__corner lightbox__corner--bl","aria-hidden":"true"}),s.jsx("span",{className:"lightbox__corner lightbox__corner--br","aria-hidden":"true"}),s.jsxs("div",{className:"lightbox__top",children:[s.jsx("span",{children:"W-00 · VOLUME STUDY"}),s.jsx("span",{children:o?`${o.slices} SLICES / T1c + SEG`:"PROCEDURAL / GLSL"})]}),s.jsxs("div",{className:"volume__hud",children:[s.jsx("span",{className:"volume__note",children:E}),o&&s.jsxs("span",{className:"volume__legend","aria-hidden":"true",children:[s.jsx("i",{className:"volume__swatch volume__swatch--net"})," NET",s.jsx("i",{className:"volume__swatch volume__swatch--ed"})," ED",s.jsx("i",{className:"volume__swatch volume__swatch--et"})," ET"]}),n!=="off"&&s.jsxs("div",{className:"volume__controls",children:[s.jsxs("label",{className:"volume__scan",children:[s.jsx("span",{children:"SCAN"}),s.jsx("input",{type:"range",min:0,max:100,value:Math.round((l??.5)*100),"aria-label":"扫描深度",onChange:t=>p(Number(t.target.value)/100)})]}),s.jsx("button",{type:"button",className:"volume__auto","aria-pressed":l===null,onClick:()=>p(null),children:l===null?"AUTO":"复位"})]}),s.jsx("span",{className:"volume__hint",children:z[n]})]})]})}export{ge as default};
