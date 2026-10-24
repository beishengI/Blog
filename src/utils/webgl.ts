/**
 * 运行环境探测：WebGL 可用性（缓存）、减动效、精确指针。
 * 全部在异常时安全回退，供主视觉与默认 tab 计算共用。
 */

let cached: boolean | null = null;

export function detectWebGL(): boolean {
  if (cached !== null) return cached;
  try {
    if (typeof document === 'undefined') {
      cached = false;
      return cached;
    }
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl2') ?? canvas.getContext('webgl');
    cached = Boolean(gl);
    // 探测用上下文立即释放，避免占用浏览器的 WebGL 上下文配额
    gl?.getExtension('WEBGL_lose_context')?.loseContext();
  } catch {
    cached = false;
  }
  return cached;
}

export function prefersReducedMotion(): boolean {
  try {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  } catch {
    return false;
  }
}

export function hasFinePointer(): boolean {
  try {
    return window.matchMedia('(pointer: fine)').matches;
  } catch {
    return false;
  }
}
