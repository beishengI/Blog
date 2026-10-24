import * as THREE from 'three';
import { scanFragment, scanVertex, sliceFragment, sliceVertex } from './volume-shaders';

export interface VolumeTheme {
  graphite: string;
  bone: string;
  red: string;
  jade: string;
  amber: string;
}

export interface VolumeSceneOptions {
  slices?: number;
  maxDpr?: number;
  /** 真实切片图集；缺省或加载失败时退回程序化体数据 */
  atlas?: { url: string; grid: number };
  /** 图集解码完成、真实数据真正上屏时回调 */
  onDataReady?: () => void;
}

export interface VolumeScene {
  setTheme(theme: VolumeTheme): void;
  /** null = 恢复自动往返扫描；0..1 = 手动锁定扫描深度 */
  setScan(value: number | null): void;
  /** 拖拽增量（像素），带惯性收敛 */
  nudge(dx: number, dy: number): void;
  /** time 单位为秒；减动效下只调用一次即为静态帧 */
  render(time: number): void;
  resize(): void;
  dispose(): void;
}

// 高度/宽度 ≈ 0.65，对应真实 BraTS 体积 155/240，避免把脑体积拉成「蛋糕」
const HALF_HEIGHT = 0.72;
const SPIN_SPEED = (Math.PI * 2) / 18; // 自转周期 18s，慢到「活着」但不抢戏

/**
 * 纯 three 工厂：不感知 React 生命周期，便于替换与测试。
 * 单 InstancedMesh + 共享 ShaderMaterial，实例数即真实切片层数。
 */
export function createVolumeScene(
  canvas: HTMLCanvasElement,
  options: VolumeSceneOptions = {}
): VolumeScene {
  const count = options.slices ?? 64;
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: false,
    powerPreference: 'low-power',
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, options.maxDpr ?? 2));

  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#12100d');

  const camera = new THREE.PerspectiveCamera(33, 1, 0.1, 60);
  camera.position.set(0, 3.9, 4.3); // 约 42° 俯角：能看清每一层切片，而不是侧视一团雾
  camera.lookAt(0, 0, 0);

  const group = new THREE.Group();
  scene.add(group);

  const geometry = new THREE.PlaneGeometry(2.2, 2.2);
  geometry.rotateX(-Math.PI / 2); // 平放到 XZ，沿 Y 堆叠成体积

  const indices = new Float32Array(count);
  // 1x1 占位纹理：图集加载完成前着色器也能安全采样（走程序化分支）
  const placeholder = new THREE.DataTexture(new Uint8Array([255, 255, 255, 255]), 1, 1);
  placeholder.needsUpdate = true;
  const material = new THREE.ShaderMaterial({
    vertexShader: sliceVertex,
    fragmentShader: sliceFragment,
    uniforms: {
      uBone: { value: new THREE.Color('#ede4d3') },
      uRed: { value: new THREE.Color('#d4633f') },
      uBase: { value: new THREE.Color('#12100d') },
      uJade: { value: new THREE.Color('#4f6f5e') },
      uAmber: { value: new THREE.Color('#b98431') },
      uScan: { value: 0.5 },
      uOpacity: { value: 1 },
      uAtlas: { value: placeholder },
      uHasData: { value: 0 },
      uSlices: { value: count },
      uGrid: { value: options.atlas?.grid ?? 8 },
    },
    // 实体片堆：alphaTest 裁切轮廓 + 深度遮挡，近处切片挡住远处，
    // 每一层都清晰可读；不用加法混合（48 层叠加必然成一团雾）。
    transparent: false,
    alphaTest: 0.5,
    alphaToCoverage: false,
    depthWrite: true,
    blending: THREE.NormalBlending,
    side: THREE.DoubleSide,
  });

  const slices = new THREE.InstancedMesh(geometry, material, count);
  const matrix = new THREE.Matrix4();
  for (let i = 0; i < count; i += 1) {
    const t = count === 1 ? 0.5 : i / (count - 1);
    indices[i] = t;
    matrix.makeTranslation(0, -HALF_HEIGHT + t * HALF_HEIGHT * 2, 0);
    slices.setMatrixAt(i, matrix);
  }
  geometry.setAttribute('aIndex', new THREE.InstancedBufferAttribute(indices, 1));
  slices.instanceMatrix.needsUpdate = true;
  slices.frustumCulled = false;
  group.add(slices);

  const scanMaterial = new THREE.ShaderMaterial({
    vertexShader: scanVertex,
    fragmentShader: scanFragment,
    uniforms: {
      uRed: { value: new THREE.Color('#d4633f') },
      uBone: { value: new THREE.Color('#ede4d3') },
      uOpacity: { value: 0 },
    },
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
  });
  const scanMesh = new THREE.Mesh(geometry.clone(), scanMaterial);
  scanMesh.geometry.deleteAttribute('aIndex');
  group.add(scanMesh);

  // 体积外框：极淡的墨线，让「一块体积」的轮廓可读
  const frame = new THREE.LineSegments(
    new THREE.EdgesGeometry(new THREE.BoxGeometry(2.24, HALF_HEIGHT * 2 + 0.06, 2.24)),
    new THREE.LineBasicMaterial({ color: '#ede4d3', transparent: true, opacity: 0.16 })
  );
  group.add(frame);

  // 真实切片图集：异步加载，成功后切到 uHasData 分支；失败则保持程序化体数据
  let atlasTexture: THREE.Texture | null = null;
  let disposed = false;
  if (options.atlas) {
    new THREE.TextureLoader().load(
      options.atlas.url,
      texture => {
        if (disposed) {
          texture.dispose();
          return;
        }
        texture.flipY = false; // 第 0 层在图片左上角，与实例 0（最下层）对齐
        texture.minFilter = THREE.LinearFilter;
        texture.magFilter = THREE.LinearFilter;
        texture.generateMipmaps = false;
        texture.wrapS = THREE.ClampToEdgeWrapping;
        texture.wrapT = THREE.ClampToEdgeWrapping;
        material.uniforms.uAtlas.value = texture;
        material.uniforms.uHasData.value = 1;
        atlasTexture = texture;
        placeholder.dispose();
        options.onDataReady?.();
      },
      undefined,
      () => console.warn('[volume] 切片图集加载失败，回退程序化体数据')
    );
  }

  let manualScan: number | null = null;
  let scan = 0.5;
  let targetYaw = 0;
  let targetPitch = 0;
  let yaw = 0;
  let pitch = 0;

  return {
    setTheme(theme) {
      scene.background = new THREE.Color(theme.graphite);
      material.uniforms.uBase.value = new THREE.Color(theme.graphite);
      material.uniforms.uBone.value = new THREE.Color(theme.bone);
      material.uniforms.uRed.value = new THREE.Color(theme.red);
      material.uniforms.uJade.value = new THREE.Color(theme.jade);
      material.uniforms.uAmber.value = new THREE.Color(theme.amber);
      scanMaterial.uniforms.uRed.value = new THREE.Color(theme.red);
      scanMaterial.uniforms.uBone.value = new THREE.Color(theme.bone);
    },

    setScan(value) {
      manualScan = value === null ? null : Math.min(1, Math.max(0, value));
    },

    nudge(dx, dy) {
      targetYaw += dx * 0.005;
      targetPitch = Math.min(0.4, Math.max(-0.4, targetPitch + dy * 0.003));
    },

    render(time) {
      const auto = (time * 0.14) % 2;
      const target = manualScan ?? (auto < 1 ? auto : 2 - auto);
      scan += (target - scan) * 0.12;
      yaw += (targetYaw - yaw) * 0.08;
      pitch += (targetPitch - pitch) * 0.08;

      material.uniforms.uScan.value = scan;
      // 淡入由 CSS 负责（.volume__canvas），着色器始终保持满强度，静态帧也可直接出图
      material.uniforms.uOpacity.value = 1;
      scanMaterial.uniforms.uOpacity.value = 1;
      scanMesh.position.y = -HALF_HEIGHT + scan * HALF_HEIGHT * 2;
      group.rotation.y = time * SPIN_SPEED + yaw;
      group.rotation.x = pitch;
      renderer.render(scene, camera);
    },

    resize() {
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      if (width <= 0 || height <= 0) return;
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    },

    dispose() {
      disposed = true;
      slices.dispose();
      geometry.dispose();
      scanMesh.geometry.dispose();
      material.dispose();
      scanMaterial.dispose();
      frame.geometry.dispose();
      (frame.material as THREE.Material).dispose();
      placeholder.dispose();
      atlasTexture?.dispose();
      renderer.dispose();
    },
  };
}
