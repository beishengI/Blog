/** 把 public/ 下的绝对路径拼上 Vite base（GitHub Pages 为 /Blog/）。 */
export function asset(path: string): string {
  if (!path) return '';
  if (/^(https?:|data:)/i.test(path)) return path;
  const base = import.meta.env.BASE_URL.replace(/\/+$/, '');
  if (base && (path === base || path.startsWith(`${base}/`))) return path;
  return `${base}${path.startsWith('/') ? path : `/${path}`}`;
}
