import { Link } from 'react-router-dom';
import { usePosts } from '../context/PostsContext';
import ArticleCard from '../components/ArticleCard';
import SiteAvatar from '../components/SiteAvatar';
import { BlogConfig } from '../types';

/** 01 · 经典网格：卡片墙，秩序、稳定、信息密度均衡。 */
export default function GridHome({ config }: { config: BlogConfig }) {
  const posts = usePosts().allPosts;
  return (
    <div className="space-y-[var(--gap)]">
      <section className="rounded-brand border border-border bg-surface p-6 md:p-8">
        <div className="flex items-start gap-5">
          <SiteAvatar size="md" className="hidden sm:block" />
          <div className="min-w-0">
            <p className="text-sm text-primary">{config.site.author} 的技术笔记</p>
            <h1 className="font-heading mt-2 text-3xl font-bold md:text-4xl">{config.site.title}</h1>
            <p className="read-max mt-3 text-muted">{config.site.bio}</p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link to="/posts" className="rounded-brand bg-primary px-4 py-2 text-sm text-white">浏览文章</Link>
              <Link to="/about" className="rounded-brand border border-border px-4 py-2 text-sm">关于我</Link>
            </div>
          </div>
        </div>
      </section>

      <section>
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <h2 className="font-heading text-xl font-semibold">最新文章</h2>
          <Link to="/posts" className="text-sm text-primary">全部 →</Link>
        </div>
        <div className="grid-auto">
          {posts.map((p) => <ArticleCard key={p.id} post={p} />)}
        </div>
      </section>
    </div>
  );
}
