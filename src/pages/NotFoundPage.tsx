import { Link } from 'react-router-dom';
import { useSEO } from '../hooks/useSEO';

/** 站点级 404 页面（App.tsx 通配路由）。 */
export default function NotFoundPage() {
  useSEO({ title: '页面不存在', noindex: true });
  return (
    <div className="py-24 text-center">
      <p className="font-heading text-6xl font-bold text-primary">404</p>
      <h1 className="font-heading mt-4 text-2xl font-bold">页面不存在</h1>
      <p className="mt-2 text-sm text-muted">你访问的地址可能已被移动或删除。</p>
      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <Link to="/" className="rounded-brand bg-primary px-4 py-2 text-sm text-white">
          返回首页
        </Link>
        <Link
          to="/posts"
          className="rounded-brand border border-border px-4 py-2 text-sm hover:border-primary hover:text-primary"
        >
          浏览文章
        </Link>
        <Link
          to="/wiki"
          className="rounded-brand border border-border px-4 py-2 text-sm hover:border-primary hover:text-primary"
        >
          LLM Wiki
        </Link>
      </div>
    </div>
  );
}
