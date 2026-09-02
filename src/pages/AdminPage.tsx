import { Link } from 'react-router-dom';
import { Post } from '../data/posts';
import { usePosts, isPublished } from '../context/PostsContext';
import { getViewCount } from '../utils/stats';
import { useSEO } from '../hooks/useSEO';

/** 标签胶囊：最多展示 3 个，超出折叠为 +N。 */
function TagChips({ tags }: { tags: string[] }) {
  const shown = tags.slice(0, 3);
  const extra = tags.length - shown.length;
  return (
    <span className="flex flex-wrap gap-1.5">
      {shown.map((t) => (
        <span key={t} className="rounded-full border border-border px-2 py-0.5 text-xs text-muted">
          #{t}
        </span>
      ))}
      {extra > 0 && (
        <span className="rounded-full border border-border px-2 py-0.5 text-xs text-muted">
          +{extra}
        </span>
      )}
    </span>
  );
}

/** 状态徽章：草稿=muted，已发布=primary；内置文章额外带「内置」徽章。 */
function StatusBadge({ post, builtin }: { post: Post; builtin: boolean }) {
  return (
    <span className="flex flex-wrap gap-1.5">
      {post.draft === true ? (
        <span className="rounded-full border border-border px-2 py-0.5 text-xs text-muted">草稿</span>
      ) : (
        <span className="rounded-full bg-surface-alt px-2 py-0.5 text-xs text-primary">已发布</span>
      )}
      {builtin && (
        <span className="rounded-full border border-border px-2 py-0.5 text-xs text-muted">内置</span>
      )}
    </span>
  );
}

export default function AdminPage() {
  const { allPostsIncludingDrafts, userPosts, isUserPost, deletePost, toggleDraft } = usePosts();
  useSEO({ title: '管理后台', noindex: true });
  const draftCount = allPostsIncludingDrafts.filter((p) => p.draft === true).length;

  const handleDelete = (post: Post) => {
    if (window.confirm(`确定删除《${post.title}》吗？`)) deletePost(post.id);
  };

  return (
    <div className="space-y-4">
      {/* 顶部：标题 + 副标题 + 新建入口 */}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-heading text-2xl font-bold">文章管理</h1>
          <p className="mt-1 text-sm text-muted">
            管理文章、草稿与发布状态 · 共 {allPostsIncludingDrafts.length} 篇
            {draftCount > 0 ? ` · 含草稿 ${draftCount} 篇` : ''}
            （用户文章 {userPosts.length} 篇）
          </p>
        </div>
        <Link to="/admin/new" className="rounded-brand bg-primary px-4 py-2 text-sm text-white">
          ＋ 新建文章
        </Link>
      </div>

      {allPostsIncludingDrafts.length === 0 ? (
        <div className="rounded-brand border border-border bg-surface p-10 text-center text-muted">
          还没有任何文章 · <Link to="/admin/new" className="text-primary">创建第一篇</Link>
        </div>
      ) : (
        <div className="space-y-3">
          {userPosts.length === 0 && <p className="text-sm text-muted">暂无用户文章，下列为内置示例文章。</p>}

          {allPostsIncludingDrafts.map((p) => {
            const builtin = !isUserPost(p.id);
            return (
              <div
                key={p.id}
                className="flex flex-wrap items-center gap-x-4 gap-y-3 rounded-brand border border-border bg-surface p-4"
              >
                {/* 标题 + 分类 + 标签 + 日期 */}
                <div className="min-w-0 flex-1 basis-64">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="font-heading min-w-0 truncate text-base font-semibold">{p.title}</h2>
                    <span className="rounded-full bg-surface-alt px-2 py-0.5 text-xs text-primary">
                      {p.category}
                    </span>
                  </div>
                  <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-muted">
                    <span className="whitespace-nowrap">
                      {p.updatedAt ? `${p.date} · 更新于 ${p.updatedAt}` : p.date}
                    </span>
                    <span className="whitespace-nowrap">{getViewCount(p.id)} 次阅读</span>
                    <TagChips tags={p.tags} />
                  </div>
                </div>

                {/* 状态徽章 */}
                <StatusBadge post={p} builtin={builtin} />

                {/* 操作列：仅用户文章可编辑/删除/切换草稿；内置文章置灰禁用 */}
                <div className="flex flex-wrap items-center gap-2">
                  {builtin ? (
                    <span
                      aria-disabled
                      className="cursor-not-allowed rounded-brand border border-border px-3 py-2 text-sm text-muted opacity-50"
                    >
                      编辑
                    </span>
                  ) : (
                    <>
                      <Link
                        to={`/admin/edit/${p.id}`}
                        className="rounded-brand border border-border px-3 py-2 text-sm hover:border-primary hover:text-primary"
                      >
                        编辑
                      </Link>
                      <button
                        type="button"
                        onClick={() => toggleDraft(p.id)}
                        className="rounded-brand border border-border px-3 py-2 text-sm hover:border-primary hover:text-primary"
                      >
                        {isPublished(p) ? '转为草稿' : '发布'}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(p)}
                        className="rounded-brand border border-border px-3 py-2 text-sm text-muted hover:border-primary hover:text-primary"
                      >
                        删除
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
