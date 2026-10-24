/**
 * 体切片着色器。
 * 有真实数据时采样 8x8 切片图集（R=T1c 强度，G=标签*80）；
 * 图集尚未加载或不可用时退回程序化体数据。两者共用同一套设计令牌色阶。
 */

export const sliceVertex = /* glsl */ `
  attribute float aIndex;
  varying vec2 vUv;
  varying float vIndex;

  void main() {
    vUv = uv;
    vIndex = aIndex;
    vec4 mvPosition = modelViewMatrix * instanceMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * mvPosition;
  }
`;

export const sliceFragment = /* glsl */ `
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
`;

export const scanVertex = /* glsl */ `
  varying vec2 vUv;

  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export const scanFragment = /* glsl */ `
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
`;
