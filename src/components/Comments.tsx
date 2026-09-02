import { FormEvent, useEffect, useId, useState } from 'react';
import {
  Comment,
  loadComments,
  addComment,
  deleteComment,
  loadLastCommenter,
  saveLastCommenter,
} from '../utils/comments';

/** ISO 时间 → YYYY-MM-DD HH:mm */
function formatTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/**
 * 文章评论区（发表 / 展示 / 删除）。
 * 评论内容一律经 React 文本节点渲染（自动转义即 XSS 防线），严禁 dangerouslySetInnerHTML。
 */
export default function Comments({ postId }: { postId: string }) {
  const uid = useId();
  const nicknameId = `${uid}-nickname`;
  const contentId = `${uid}-content`;

  const [comments, setComments] = useState<Comment[]>([]);
  const [nickname, setNickname] = useState('');
  const [content, setContent] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    setComments(loadComments(postId));
    setNickname(loadLastCommenter());
  }, [postId]);

  // 新评论在前（createdAt 降序）
  const sorted = [...comments].sort((a, b) =>
    a.createdAt < b.createdAt ? 1 : a.createdAt > b.createdAt ? -1 : 0
  );

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const created = addComment(postId, { nickname, content });
      setComments(loadComments(postId));
      setContent('');
      setError('');
      saveLastCommenter(created.nickname);
    } catch (err) {
      setError(err instanceof Error ? err.message : '发表失败，请稍后再试');
    }
  };

  const handleDelete = (commentId: string) => {
    if (!window.confirm('确定删除这条评论吗？')) return;
    deleteComment(postId, commentId);
    setComments(loadComments(postId));
  };

  return (
    <section aria-label="评论区">
      <h2 className="font-heading text-xl font-bold">评论（{comments.length}）</h2>

      <form onSubmit={handleSubmit} className="mt-4 space-y-3" noValidate={false}>
        <div>
          <label htmlFor={nicknameId} className="mb-1 block text-sm text-muted">
            昵称
          </label>
          <input
            id={nicknameId}
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            required
            maxLength={20}
            placeholder="1-20 字"
            className="w-full rounded border border-border bg-surface px-3 py-2 text-sm text-fg"
          />
        </div>
        <div>
          <label htmlFor={contentId} className="mb-1 block text-sm text-muted">
            评论内容
          </label>
          <textarea
            id={contentId}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
            maxLength={500}
            rows={4}
            placeholder="说点什么吧（1-500 字）"
            className="w-full resize-y rounded border border-border bg-surface px-3 py-2 text-sm text-fg"
          />
          <div className="mt-1 text-right text-xs text-muted">{content.length}/500</div>
        </div>
        {error && (
          <p
            role="alert"
            className="rounded border border-border bg-surface px-3 py-2 text-sm text-muted"
          >
            {error}
          </p>
        )}
        <button
          type="submit"
          aria-label="发表评论"
          className="rounded-brand bg-primary px-4 py-2 text-sm text-white hover:opacity-90"
        >
          发表评论
        </button>
      </form>

      <ul className="mt-6 space-y-4">
        {sorted.map((c) => (
          <li key={c.id} className="rounded-brand border border-border bg-surface p-4">
            <div className="flex items-center justify-between gap-3">
              <span className="font-heading font-bold">{c.nickname}</span>
              <button
                type="button"
                onClick={() => handleDelete(c.id)}
                aria-label="删除评论"
                className="inline-flex min-h-9 shrink-0 items-center rounded border border-border px-2.5 py-0.5 text-xs text-muted hover:border-primary hover:text-primary"
              >
                删除
              </button>
            </div>
            <time dateTime={c.createdAt} className="mt-1 block text-xs text-muted">
              {formatTime(c.createdAt)}
            </time>
            <p className="mt-2 whitespace-pre-wrap text-sm">{c.content}</p>
          </li>
        ))}
      </ul>

      {comments.length === 0 && (
        <p className="mt-6 text-sm text-muted">还没有评论，来说两句吧</p>
      )}
    </section>
  );
}
