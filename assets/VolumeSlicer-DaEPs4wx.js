import{r as c,N as X,O as J,Q as O,a as F,j as r}from"./index-DEkidlMn.js";import{W as q,S as K,C as l,P as Q,G as Z,a as ee,D as te,b as z,c as k,N as ae,I as ne,M as re,d as se,A as oe,e as ie,L as le,E as ce,B as ue,f as de,T as fe,g as W,h as $}from"./three-Cw-bJvCs.js";const me=`
  attribute float aIndex;
  varying vec2 vUv;
  varying float vIndex;

  void main() {
    vUv = uv;
    vIndex = aIndex;
    vec4 mvPosition = modelViewMatrix * instanceMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * mvPosition;
  }
`,ve=`
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
`,pe=`
  varying vec2 vUv;

  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`,he=`
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
`,I=.72,xe=Math.PI*2/18;function ge(f,i={}){var U;const o=i.slices??64,m=new q({canvas:f,antialias:!0,alpha:!1,powerPreference:"low-power"});m.setPixelRatio(Math.min(window.devicePixelRatio||1,i.maxDpr??2));const n=new K;n.background=new l("#12100d");const x=new Q(33,1,.1,60);x.position.set(0,3.9,4.3),x.lookAt(0,0,0);const s=new Z;n.add(s);const g=new ee(2.2,2.2);g.rotateX(-Math.PI/2);const A=new Float32Array(o),_=new te(new Uint8Array([255,255,255,255]),1,1);_.needsUpdate=!0;const u=new z({vertexShader:me,fragmentShader:ve,uniforms:{uBone:{value:new l("#ede4d3")},uRed:{value:new l("#d4633f")},uBase:{value:new l("#12100d")},uJade:{value:new l("#4f6f5e")},uAmber:{value:new l("#b98431")},uScan:{value:.5},uOpacity:{value:1},uAtlas:{value:_},uHasData:{value:0},uSlices:{value:o},uGrid:{value:((U=i.atlas)==null?void 0:U.grid)??8}},transparent:!1,alphaTest:.5,alphaToCoverage:!1,depthWrite:!0,blending:ae,side:k}),h=new ne(g,u,o),v=new re;for(let e=0;e<o;e+=1){const t=o===1?.5:e/(o-1);A[e]=t,v.makeTranslation(0,-I+t*I*2,0),h.setMatrixAt(e,v)}g.setAttribute("aIndex",new se(A,1)),h.instanceMatrix.needsUpdate=!0,h.frustumCulled=!1,s.add(h);const w=new z({vertexShader:pe,fragmentShader:he,uniforms:{uRed:{value:new l("#d4633f")},uBone:{value:new l("#ede4d3")},uOpacity:{value:0}},transparent:!0,depthWrite:!1,blending:oe,side:k}),S=new ie(g.clone(),w);S.geometry.deleteAttribute("aIndex"),s.add(S);const j=new le(new ce(new ue(2.24,I*2+.06,2.24)),new de({color:"#ede4d3",transparent:!0,opacity:.16}));s.add(j);let p=null,N=!1;i.atlas&&new fe().load(i.atlas.url,e=>{var t;if(N){e.dispose();return}e.flipY=!1,e.minFilter=W,e.magFilter=W,e.generateMipmaps=!1,e.wrapS=$,e.wrapT=$,u.uniforms.uAtlas.value=e,u.uniforms.uHasData.value=1,p=e,_.dispose(),(t=i.onDataReady)==null||t.call(i)},void 0,()=>console.warn("[volume] 切片图集加载失败，回退程序化体数据"));let L=null,b=.5,P=0,y=0,E=0,T=0;return{setTheme(e){n.background=new l(e.graphite),u.uniforms.uBase.value=new l(e.graphite),u.uniforms.uBone.value=new l(e.bone),u.uniforms.uRed.value=new l(e.red),u.uniforms.uJade.value=new l(e.jade),u.uniforms.uAmber.value=new l(e.amber),w.uniforms.uRed.value=new l(e.red),w.uniforms.uBone.value=new l(e.bone)},setScan(e){L=e===null?null:Math.min(1,Math.max(0,e))},nudge(e,t){P+=e*.005,y=Math.min(.4,Math.max(-.4,y+t*.003))},render(e){const t=e*.14%2,a=L??(t<1?t:2-t);b+=(a-b)*.12,E+=(P-E)*.08,T+=(y-T)*.08,u.uniforms.uScan.value=b,u.uniforms.uOpacity.value=1,w.uniforms.uOpacity.value=1,S.position.y=-I+b*I*2,s.rotation.y=e*xe+E,s.rotation.x=T,m.render(n,x)},resize(){const e=f.clientWidth,t=f.clientHeight;e<=0||t<=0||(m.setSize(e,t,!1),x.aspect=e/t,x.updateProjectionMatrix())},dispose(){N=!0,h.dispose(),g.dispose(),S.geometry.dispose(),u.dispose(),w.dispose(),j.geometry.dispose(),j.material.dispose(),_.dispose(),p==null||p.dispose(),m.dispose()}}}const we="/showcase/volume/brats-atlas.png",V="/showcase/volume/brats-atlas.json",Y={on:"拖拽旋转 · 聚焦后滚轮 / 方向键切换层面",static:"静态帧 · 已尊重减动效偏好",off:"WEBGL 不可用 · 图版模式"};function H(){const f=getComputedStyle(document.documentElement),i=(o,m)=>f.getPropertyValue(o).trim()||m;return{graphite:i("--graphite","#12100d"),bone:i("--bone","#ede4d3"),red:i("--red-2","#d4633f"),jade:i("--jade","#4f6f5e"),amber:i("--amber","#b98431")}}function _e(){const f=c.useRef(null),i=c.useRef(null),o=c.useRef(null),m=c.useRef(null),[n,x]=c.useState(()=>X()?J()?"static":"on":"off"),[s,g]=c.useState(null),[A,_]=c.useState(!1),[u,h]=c.useState(!1),[v,w]=c.useState(null),S=n==="on"&&O(),j=(s==null?void 0:s.slices)??48,p=e=>{var a,d;const t=e===null?null:Math.min(1,Math.max(0,e));w(t),(a=o.current)==null||a.setScan(t),n==="static"&&((d=o.current)==null||d.render(1))};c.useEffect(()=>{let e=!1;const t=async a=>{try{const d=F(a?`${V}?v=${Date.now()}`:V),M=await fetch(d,{cache:"no-store"});if(!M.ok)throw new Error(String(M.status));return await M.json()}catch{return a>=1?null:(await new Promise(d=>window.setTimeout(d,1200)),t(a+1))}};return t(0).then(a=>{e||(g(a),_(!0))}),()=>{e=!0}},[]),c.useEffect(()=>{if(n==="off"||!A)return;const e=i.current;if(!e)return;let t=null;h(!1);try{t=ge(e,{slices:(s==null?void 0:s.slices)??48,maxDpr:O()?2:1.5,atlas:s?{url:F(we),grid:s.grid}:void 0,onDataReady:()=>h(!0)}),o.current=t,t.resize(),t.setTheme(H()),n==="static"&&t.setScan(.92),t.render(1)}catch{t==null||t.dispose(),o.current=null,x("off")}return()=>{o.current=null,t==null||t.dispose()}},[n,A,s]),c.useEffect(()=>{if(n==="off")return;const e=new MutationObserver(()=>{var t,a;(t=o.current)==null||t.setTheme(H()),n==="static"&&((a=o.current)==null||a.render(1))});return e.observe(document.documentElement,{attributes:!0,attributeFilter:["data-mode"]}),()=>e.disconnect()},[n]),c.useEffect(()=>{if(n==="off")return;const e=f.current;if(!e||typeof ResizeObserver>"u")return;const t=new ResizeObserver(()=>{var a,d;(a=o.current)==null||a.resize(),n==="static"&&((d=o.current)==null||d.render(1))});return t.observe(e),()=>t.disconnect()},[n]),c.useEffect(()=>{if(n!=="on")return;const e=f.current;if(!e)return;let t=0,a=!1,d=!1;const M=R=>{var D;(D=o.current)==null||D.render(R/1e3),a&&(t=window.requestAnimationFrame(M))},B=()=>{const R=d&&!document.hidden;R&&!a?(a=!0,t=window.requestAnimationFrame(M)):!R&&a&&(a=!1,window.cancelAnimationFrame(t))},C=()=>B(),G=new IntersectionObserver(R=>{var D;d=((D=R[0])==null?void 0:D.isIntersecting)??!1,B()});return G.observe(e),document.addEventListener("visibilitychange",C),()=>{a=!1,window.cancelAnimationFrame(t),G.disconnect(),document.removeEventListener("visibilitychange",C)}},[n]),c.useEffect(()=>{if(n!=="on")return;const e=f.current;if(!e)return;const t=a=>{e.contains(document.activeElement)&&(a.preventDefault(),p((v??.5)+(a.deltaY>0?.05:-.05)))};return e.addEventListener("wheel",t,{passive:!1}),()=>e.removeEventListener("wheel",t)},[n,v]);const N=e=>{var t;S&&((t=f.current)==null||t.focus(),m.current={x:e.clientX,y:e.clientY},e.currentTarget.setPointerCapture(e.pointerId))},L=e=>{var a;const t=m.current;t&&((a=o.current)==null||a.nudge(e.clientX-t.x,e.clientY-t.y),m.current={x:e.clientX,y:e.clientY})},b=()=>{m.current=null},P=e=>{const a={ArrowUp:.05,ArrowRight:.05,ArrowDown:-.05,ArrowLeft:-.05}[e.key];a!==void 0&&(e.preventDefault(),p((v??.5)+a))},y=!!(s&&u),E=y?"brats":"procedural",T=s?`BraTS2023 · ${s.modality} + 预测掩码 · 公开脱敏数据`:"程序化体数据 · 无真实患者数据",U=s?u?`${s.slices} SLICES / T1c + SEG`:`LOADING T1c · ${s.slices} SLICES`:"PROCEDURAL / GLSL";return r.jsxs("div",{ref:f,className:`volume volume--${n}`,"data-webgl":n,"data-source":E,role:"group","aria-label":`体切片扫描器：${j} 层${y?"真实 T1c 影像与 Lite-Mamba 预测掩码":"程序化影像"}切片堆叠成体积，朱红扫描面逐层切换。${Y[n]}`,tabIndex:n==="on"?0:void 0,onPointerDown:N,onPointerMove:L,onPointerUp:b,onPointerCancel:b,onKeyDown:P,children:[n!=="off"&&r.jsx("canvas",{ref:i,className:"volume__canvas","aria-hidden":"true"}),n==="off"&&r.jsxs("div",{className:"volume__fallback","aria-hidden":"true",children:[Array.from({length:7},(e,t)=>r.jsx("span",{style:{transform:`translateY(${(t-3)*14}px)`}},t)),r.jsx("i",{})]}),r.jsx("span",{className:"lightbox__corner lightbox__corner--tl","aria-hidden":"true"}),r.jsx("span",{className:"lightbox__corner lightbox__corner--tr","aria-hidden":"true"}),r.jsx("span",{className:"lightbox__corner lightbox__corner--bl","aria-hidden":"true"}),r.jsx("span",{className:"lightbox__corner lightbox__corner--br","aria-hidden":"true"}),r.jsxs("div",{className:"lightbox__top",children:[r.jsx("span",{children:"W-00 · VOLUME STUDY"}),r.jsx("span",{children:U})]}),r.jsxs("div",{className:"volume__hud",children:[r.jsx("span",{className:"volume__note",children:T}),y&&r.jsxs("span",{className:"volume__legend","aria-hidden":"true",children:[r.jsx("i",{className:"volume__swatch volume__swatch--net"})," NET",r.jsx("i",{className:"volume__swatch volume__swatch--ed"})," ED",r.jsx("i",{className:"volume__swatch volume__swatch--et"})," ET"]}),n!=="off"&&r.jsxs("div",{className:"volume__controls",children:[r.jsxs("label",{className:"volume__scan",children:[r.jsx("span",{children:"SCAN"}),r.jsx("input",{type:"range",min:0,max:100,value:Math.round((v??.5)*100),"aria-label":"扫描深度",onChange:e=>p(Number(e.target.value)/100)})]}),r.jsx("button",{type:"button",className:"volume__auto","aria-pressed":v===null,onClick:()=>p(null),children:v===null?"AUTO":"复位"})]}),r.jsx("span",{className:"volume__hint",children:Y[n]})]})]})}export{_e as default};
