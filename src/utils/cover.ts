import { Post } from '../data/posts';
import { BlogConfig } from '../types';

/** 封面画布基准宽度与宽高比；所有装饰坐标按比例推导，改这两个值即可整体缩放。 */
const CANVAS_W = 640;
const ASPECT = 9 / 16; // 16:9

/** 为文章生成抽象渐变封面 SVG（data URI），跟随当前主题主色/强调色。 */
export function postCover(post: Post, config: BlogConfig): string {
  const primary = config.theme.primary;
  const accent = config.theme.accent;
  const letter = (post.category?.[0] ?? 'M').toUpperCase();
  // 用 id 生成稳定（非随机）的装饰旋转角，避免每次渲染跳动
  const seed = [...post.id].reduce((a, c) => a + c.charCodeAt(0), 0);
  const rot = seed % 360;

  const W = CANVAS_W;
  const H = Math.round(W * ASPECT);
  const cx = W / 2;
  const cy = H / 2;
  const fontSize = Math.round(H * 0.36);

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
    <defs>
      <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="${primary}"/>
        <stop offset="1" stop-color="${accent}"/>
      </linearGradient>
    </defs>
    <rect width="${W}" height="${H}" fill="url(#g)"/>
    <g transform="rotate(${rot} ${cx} ${cy})" fill="rgba(255,255,255,0.10)">
      <rect x="${Math.round(W * 0.656)}" y="${Math.round(H * 0.111)}" width="${Math.round(W * 0.188)}" height="${Math.round(H * 0.333)}" rx="${Math.round(W * 0.038)}"/>
      <circle cx="${Math.round(W * 0.25)}" cy="${Math.round(H * 0.778)}" r="${Math.round(H * 0.25)}"/>
    </g>
    <text x="${cx}" y="${Math.round(cy + fontSize * 0.35)}" font-family="Space Grotesk, Arial, sans-serif" font-size="${fontSize}" font-weight="800" fill="rgba(255,255,255,0.22)" text-anchor="middle" letter-spacing="-2">${letter}</text>
  </svg>`;

  const base64 = btoa(unescape(encodeURIComponent(svg)));
  return `data:image/svg+xml;base64,${base64}`;
}
