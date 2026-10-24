import{r as m,N as K,O as Q,Q as $,a as O,j as i}from"./index-BdX_44wq.js";import{W as Z,S as ee,C as d,P as ae,G as te,a as ne,D as z,b as k,c as V,N as se,I as re,M as oe,d as ie,A as le,e as ce,L as ue,E as de,B as fe,f as me,T as ve,g as W,h as Y,i as H}from"./three-DaAuezZt.js";const pe=`
  attribute float aIndex;
  varying vec2 vUv;
  varying float vIndex;

  void main() {
    vUv = uv;
    vIndex = aIndex;
    vec4 mvPosition = modelViewMatrix * instanceMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * mvPosition;
  }
`,he=`
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
  uniform sampler2D uLabels;
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
      float intensity = texture2D(uAtlas, uv).r;
      // 标签图集为 0/1/2/3 的灰度 PNG，NEAREST 采样不会串层
      float label = floor(texture2D(uLabels, uv).r * 255.0 + 0.5);

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
`,xe=`
  varying vec2 vUv;

  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`,ge=`
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
`,I=.72,be=Math.PI*2/18;function we(p,c={}){var x;const l=c.slices??64,h=new Z({canvas:p,antialias:!0,alpha:!1,powerPreference:"low-power"});h.setPixelRatio(Math.min(window.devicePixelRatio||1,c.maxDpr??2));const s=new ee;s.background=new d("#12100d");const b=new ae(33,1,.1,60);b.position.set(0,3.9,4.3),b.lookAt(0,0,0);const o=new te;s.add(o);const w=new ne(2.2,2.2);w.rotateX(-Math.PI/2);const N=new Float32Array(l),S=new z(new Uint8Array([255,255,255,255]),1,1);S.needsUpdate=!0;const y=new z(new Uint8Array([0,0,0,255]),1,1);y.needsUpdate=!0;const f=new k({vertexShader:pe,fragmentShader:he,uniforms:{uBone:{value:new d("#ede4d3")},uRed:{value:new d("#d4633f")},uBase:{value:new d("#12100d")},uJade:{value:new d("#4f6f5e")},uAmber:{value:new d("#b98431")},uScan:{value:.5},uOpacity:{value:1},uAtlas:{value:S},uLabels:{value:y},uHasData:{value:0},uSlices:{value:l},uGrid:{value:((x=c.atlas)==null?void 0:x.grid)??8}},transparent:!1,alphaTest:.5,alphaToCoverage:!1,depthWrite:!0,blending:se,side:V}),v=new re(w,f,l),P=new oe;for(let a=0;a<l;a+=1){const r=l===1?.5:a/(l-1);N[a]=r,P.makeTranslation(0,-I+r*I*2,0),v.setMatrixAt(a,P)}w.setAttribute("aIndex",new ie(N,1)),v.instanceMatrix.needsUpdate=!0,v.frustumCulled=!1,o.add(v);const _=new k({vertexShader:xe,fragmentShader:ge,uniforms:{uRed:{value:new d("#d4633f")},uBone:{value:new d("#ede4d3")},uOpacity:{value:0}},transparent:!0,depthWrite:!1,blending:le,side:V}),R=new ce(w.clone(),_);R.geometry.deleteAttribute("aIndex"),o.add(R);const g=new ue(new de(new fe(2.24,I*2+.06,2.24)),new me({color:"#ede4d3",transparent:!0,opacity:.16}));o.add(g);let M=null,E=null,A=!1,L=0;const j=()=>{var a;L-=1,!(L>0)&&(f.uniforms.uHasData.value=1,(a=c.onDataReady)==null||a.call(c))},B=(a,r)=>{a.flipY=!1,a.minFilter=r?W:Y,a.magFilter=r?W:Y,a.generateMipmaps=!1,a.wrapS=H,a.wrapT=H};if(c.atlas){L=2;const a=new ve;a.load(c.atlas.intensityUrl,r=>{if(A){r.dispose();return}B(r,!1),f.uniforms.uAtlas.value=r,M=r,S.dispose(),j()},void 0,()=>console.warn("[volume] 强度图集加载失败，回退程序化体数据")),a.load(c.atlas.labelsUrl,r=>{if(A){r.dispose();return}B(r,!0),f.uniforms.uLabels.value=r,E=r,y.dispose(),j()},void 0,()=>console.warn("[volume] 标签图集加载失败，回退程序化体数据"))}let C=null,U=.5,t=0,e=0,n=0,u=0;return{setTheme(a){s.background=new d(a.graphite),f.uniforms.uBase.value=new d(a.graphite),f.uniforms.uBone.value=new d(a.bone),f.uniforms.uRed.value=new d(a.red),f.uniforms.uJade.value=new d(a.jade),f.uniforms.uAmber.value=new d(a.amber),_.uniforms.uRed.value=new d(a.red),_.uniforms.uBone.value=new d(a.bone)},setScan(a){C=a===null?null:Math.min(1,Math.max(0,a))},nudge(a,r){t+=a*.005,e=Math.min(.4,Math.max(-.4,e+r*.003))},render(a){const r=a*.14%2,G=C??(r<1?r:2-r);U+=(G-U)*.12,n+=(t-n)*.08,u+=(e-u)*.08,f.uniforms.uScan.value=U,f.uniforms.uOpacity.value=1,_.uniforms.uOpacity.value=1,R.position.y=-I+U*I*2,o.rotation.y=a*be+n,o.rotation.x=u,h.render(s,b)},resize(){const a=p.clientWidth,r=p.clientHeight;a<=0||r<=0||(h.setSize(a,r,!1),b.aspect=a/r,b.updateProjectionMatrix())},dispose(){A=!0,v.dispose(),w.dispose(),R.geometry.dispose(),f.dispose(),_.dispose(),g.geometry.dispose(),g.material.dispose(),S.dispose(),y.dispose(),M==null||M.dispose(),E==null||E.dispose(),h.dispose()}}}const F="/showcase/volume",X=`${F}/brats-atlas.json`,J={on:"拖拽旋转 · 聚焦后滚轮 / 方向键切换层面",static:"静态帧 · 已尊重减动效偏好",off:"WEBGL 不可用 · 图版模式"};function q(){const p=getComputedStyle(document.documentElement),c=(l,h)=>p.getPropertyValue(l).trim()||h;return{graphite:c("--graphite","#12100d"),bone:c("--bone","#ede4d3"),red:c("--red-2","#d4633f"),jade:c("--jade","#4f6f5e"),amber:c("--amber","#b98431")}}function Se(){const p=m.useRef(null),c=m.useRef(null),l=m.useRef(null),h=m.useRef(null),[s,b]=m.useState(()=>K()?Q()?"static":"on":"off"),[o,w]=m.useState(null),[N,S]=m.useState(!1),[y,f]=m.useState(!1),[v,P]=m.useState(null),_=s==="on"&&$(),R=(o==null?void 0:o.slices)??48,g=t=>{var n,u;const e=t===null?null:Math.min(1,Math.max(0,t));P(e),(n=l.current)==null||n.setScan(e),s==="static"&&((u=l.current)==null||u.render(1))};m.useEffect(()=>{let t=!1;const e=async n=>{try{const u=O(n?`${X}?v=${Date.now()}`:X),x=await fetch(u,{cache:"no-store"});if(!x.ok)throw new Error(String(x.status));return await x.json()}catch{return n>=1?null:(await new Promise(u=>window.setTimeout(u,1200)),e(n+1))}};return e(0).then(n=>{t||(w(n),S(!0))}),()=>{t=!0}},[]),m.useEffect(()=>{if(s==="off"||!N)return;const t=c.current;if(!t)return;let e=null;f(!1);try{e=we(t,{slices:(o==null?void 0:o.slices)??48,maxDpr:$()?2:1.5,atlas:o?{intensityUrl:O(`${F}/${o.files.intensity}`),labelsUrl:O(`${F}/${o.files.labels}`),grid:o.grid}:void 0,onDataReady:()=>f(!0)}),l.current=e,e.resize(),e.setTheme(q()),s==="static"&&e.setScan(.92),e.render(1)}catch{e==null||e.dispose(),l.current=null,b("off")}return()=>{l.current=null,e==null||e.dispose()}},[s,N,o]),m.useEffect(()=>{if(s==="off")return;const t=new MutationObserver(()=>{var e,n;(e=l.current)==null||e.setTheme(q()),s==="static"&&((n=l.current)==null||n.render(1))});return t.observe(document.documentElement,{attributes:!0,attributeFilter:["data-mode"]}),()=>t.disconnect()},[s]),m.useEffect(()=>{if(s==="off")return;const t=p.current;if(!t||typeof ResizeObserver>"u")return;const e=new ResizeObserver(()=>{var n,u;(n=l.current)==null||n.resize(),s==="static"&&((u=l.current)==null||u.render(1))});return e.observe(t),()=>e.disconnect()},[s]),m.useEffect(()=>{if(s!=="on")return;const t=p.current;if(!t)return;let e=0,n=!1,u=!1;const x=D=>{var T;(T=l.current)==null||T.render(D/1e3),n&&(e=window.requestAnimationFrame(x))},a=()=>{const D=u&&!document.hidden;D&&!n?(n=!0,e=window.requestAnimationFrame(x)):!D&&n&&(n=!1,window.cancelAnimationFrame(e))},r=()=>a(),G=new IntersectionObserver(D=>{var T;u=((T=D[0])==null?void 0:T.isIntersecting)??!1,a()});return G.observe(t),document.addEventListener("visibilitychange",r),()=>{n=!1,window.cancelAnimationFrame(e),G.disconnect(),document.removeEventListener("visibilitychange",r)}},[s]),m.useEffect(()=>{if(s!=="on")return;const t=p.current;if(!t)return;const e=n=>{t.contains(document.activeElement)&&(n.preventDefault(),g((v??.5)+(n.deltaY>0?.05:-.05)))};return t.addEventListener("wheel",e,{passive:!1}),()=>t.removeEventListener("wheel",e)},[s,v]);const M=t=>{var e;_&&((e=p.current)==null||e.focus(),h.current={x:t.clientX,y:t.clientY},t.currentTarget.setPointerCapture(t.pointerId))},E=t=>{var n;const e=h.current;e&&((n=l.current)==null||n.nudge(t.clientX-e.x,t.clientY-e.y),h.current={x:t.clientX,y:t.clientY})},A=()=>{h.current=null},L=t=>{const n={ArrowUp:.05,ArrowRight:.05,ArrowDown:-.05,ArrowLeft:-.05}[t.key];n!==void 0&&(t.preventDefault(),g((v??.5)+n))},j=!!(o&&y),B=j?"brats":"procedural",C=o?`BraTS2023 · ${o.modality} + 预测掩码 · 公开脱敏数据`:"程序化体数据 · 无真实患者数据",U=o?y?`${o.slices} SLICES / T1c + SEG`:`LOADING T1c · ${o.slices} SLICES`:"PROCEDURAL / GLSL";return i.jsxs("div",{ref:p,className:`volume volume--${s}`,"data-webgl":s,"data-source":B,role:"group","aria-label":`体切片扫描器：${R} 层${j?"真实 T1c 影像与 Lite-Mamba 预测掩码":"程序化影像"}切片堆叠成体积，朱红扫描面逐层切换。${J[s]}`,tabIndex:s==="on"?0:void 0,onPointerDown:M,onPointerMove:E,onPointerUp:A,onPointerCancel:A,onKeyDown:L,children:[s!=="off"&&i.jsx("canvas",{ref:c,className:"volume__canvas","aria-hidden":"true"}),s==="off"&&i.jsxs("div",{className:"volume__fallback","aria-hidden":"true",children:[Array.from({length:7},(t,e)=>i.jsx("span",{style:{transform:`translateY(${(e-3)*14}px)`}},e)),i.jsx("i",{})]}),i.jsx("span",{className:"lightbox__corner lightbox__corner--tl","aria-hidden":"true"}),i.jsx("span",{className:"lightbox__corner lightbox__corner--tr","aria-hidden":"true"}),i.jsx("span",{className:"lightbox__corner lightbox__corner--bl","aria-hidden":"true"}),i.jsx("span",{className:"lightbox__corner lightbox__corner--br","aria-hidden":"true"}),i.jsxs("div",{className:"lightbox__top",children:[i.jsx("span",{children:"W-00 · VOLUME STUDY"}),i.jsx("span",{children:U})]}),i.jsxs("div",{className:"volume__hud",children:[i.jsx("span",{className:"volume__note",children:C}),j&&i.jsxs("span",{className:"volume__legend","aria-hidden":"true",children:[i.jsx("i",{className:"volume__swatch volume__swatch--net"})," NET",i.jsx("i",{className:"volume__swatch volume__swatch--ed"})," ED",i.jsx("i",{className:"volume__swatch volume__swatch--et"})," ET"]}),s!=="off"&&i.jsxs("div",{className:"volume__controls",children:[i.jsxs("label",{className:"volume__scan",children:[i.jsx("span",{children:"SCAN"}),i.jsx("input",{type:"range",min:0,max:100,value:Math.round((v??.5)*100),"aria-label":"扫描深度",onChange:t=>g(Number(t.target.value)/100)})]}),i.jsx("button",{type:"button",className:"volume__auto","aria-pressed":v===null,onClick:()=>g(null),children:v===null?"AUTO":"复位"})]}),i.jsx("span",{className:"volume__hint",children:J[s]})]})]})}export{Se as default};
