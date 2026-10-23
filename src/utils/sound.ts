/**
 * 个人符号系统的声音部分：一个 3 音「扫描动机」。
 * - 只在用户开启声音后播放，且只由用户操作触发（切换检查项 / 播放影片）。
 * - 默认关闭；关闭时不创建 AudioContext。
 * - 不用音频文件，避免额外请求与版权问题。
 */

const KEY = 'bs-sound';

let enabled = false;
let ctx: AudioContext | null = null;
let lastPlay = 0;

try {
  enabled = localStorage.getItem(KEY) === 'on';
} catch {
  /* ignore */
}

export function isSoundEnabled(): boolean {
  return enabled;
}

export function setSoundEnabled(next: boolean): void {
  enabled = next;
  try {
    localStorage.setItem(KEY, next ? 'on' : 'off');
  } catch {
    /* ignore */
  }
  if (!next && ctx) {
    void ctx.close();
    ctx = null;
  }
}

function ensureCtx(): AudioContext | null {
  if (!enabled || typeof window === 'undefined') return null;
  if (!ctx) {
    const Ctor = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return null;
    ctx = new Ctor();
  }
  if (ctx.state === 'suspended') void ctx.resume();
  return ctx;
}

/**
 * 播放扫描动机。kind 决定音高/长度：
 * - tick: 切换检查项，两个短音
 * - open: 打开影片/重要动作，三个音
 */
export function playScanTone(kind: 'tick' | 'open' = 'tick'): void {
  const audio = ensureCtx();
  if (!audio) return;
  const now = audio.currentTime;
  if (now - lastPlay < 0.06) return;
  lastPlay = now;

  const notes = kind === 'open' ? [523.25, 783.99, 1046.5] : [659.25, 987.77];
  notes.forEach((freq, index) => {
    const osc = audio.createOscillator();
    const gain = audio.createGain();
    const start = now + index * 0.075;
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, start);
    gain.gain.setValueAtTime(0, start);
    gain.gain.linearRampToValueAtTime(0.045, start + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.18);
    osc.connect(gain);
    gain.connect(audio.destination);
    osc.start(start);
    osc.stop(start + 0.2);
  });
}
