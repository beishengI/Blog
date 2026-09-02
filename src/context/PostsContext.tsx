import { createContext, useContext, useEffect, useMemo, useState, ReactNode } from 'react';
import { Post, posts } from '../data/posts';

export const POSTS_STORAGE_KEY = 'medai-blog-posts';

/** 新建/编辑文章的输入：除 id 外的 Post 字段（id 可选，缺省自动生成）。 */
export type PostDraft = Omit<Post, 'id'> & { id?: string };

interface PostsCtx {
  /** 全量文章 = 用户文章 + 内置文章，按 date 降序（同日期时内置文章在后）。 */
  allPosts: Post[];
  /** 用户创建/编辑的文章（localStorage 持久化，内部保持插入序）。 */
  userPosts: Post[];
  getPost: (id: string) => Post | undefined;
  isUserPost: (id: string) => boolean;
  addPost: (input: PostDraft) => Post;
  updatePost: (id: string, patch: Partial<Post>) => void;
  deletePost: (id: string) => void;
  toggleDraft: (id: string) => void;
}

const PostsContext = createContext<PostsCtx | null>(null);

/** 纯函数：草稿判定（draft !== true 即视为已发布），供后续任务过滤列表使用。 */
export function isPublished(post: Post): boolean {
  return post.draft !== true;
}

function loadUserPosts(): Post[] {
  try {
    const raw = localStorage.getItem(POSTS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (p): p is Post => !!p && typeof p === 'object' && typeof (p as Post).id === 'string'
    );
  } catch {
    return [];
  }
}

function today(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/** 生成用户文章 id：u-<YYYYMMDDHHmmss>-<3位随机>，与现有 id 去重保证唯一。 */
function genId(existing: Post[]): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  const ts = `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`;
  let id = '';
  do {
    id = `u-${ts}-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`;
  } while (existing.some((p) => p.id === id));
  return id;
}

export function PostsProvider({ children }: { children: ReactNode }) {
  const [userPosts, setUserPosts] = useState<Post[]>(loadUserPosts);

  useEffect(() => {
    // 隐私模式 / 沙箱 iframe 等场景 setItem 可能抛错；持久化失败不应影响运行期使用
    try {
      localStorage.setItem(POSTS_STORAGE_KEY, JSON.stringify(userPosts));
    } catch {
      /* ignore */
    }
  }, [userPosts]);

  const value = useMemo<PostsCtx>(() => {
    // [...userPosts, ...posts] + 稳定排序：date 相同时用户文章在前、内置文章在后
    const allPosts = [...userPosts, ...posts].sort((a, b) =>
      a.date < b.date ? 1 : a.date > b.date ? -1 : 0
    );

    const isUserPost = (id: string) => userPosts.some((p) => p.id === id);

    const addPost = (input: PostDraft): Post => {
      const post: Post = {
        ...input,
        id: input.id ?? genId(userPosts),
        draft: input.draft ?? false,
        date: input.date ?? today(),
        readingTime: input.readingTime ?? Math.max(1, Math.round(input.content.length / 400)),
      };
      setUserPosts((prev) => [post, ...prev]);
      return post;
    };

    // 以下操作仅作用于用户文章；内置文章为 no-op
    const updatePost = (id: string, patch: Partial<Post>) => {
      if (!isUserPost(id)) return;
      setUserPosts((prev) => prev.map((p) => (p.id === id ? { ...p, ...patch } : p)));
    };

    const deletePost = (id: string) => {
      if (!isUserPost(id)) return;
      setUserPosts((prev) => prev.filter((p) => p.id !== id));
    };

    const toggleDraft = (id: string) => {
      if (!isUserPost(id)) return;
      setUserPosts((prev) =>
        prev.map((p) => (p.id === id ? { ...p, draft: !(p.draft === true) } : p))
      );
    };

    return {
      allPosts,
      userPosts,
      getPost: (id) => allPosts.find((p) => p.id === id),
      isUserPost,
      addPost,
      updatePost,
      deletePost,
      toggleDraft,
    };
  }, [userPosts]);

  return <PostsContext.Provider value={value}>{children}</PostsContext.Provider>;
}

export function usePosts() {
  const ctx = useContext(PostsContext);
  if (!ctx) throw new Error('usePosts 必须在 PostsProvider 内使用');
  return ctx;
}
