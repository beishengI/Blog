import { useEffect, useMemo, useRef, useState, type ChangeEvent, type ReactNode } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Post } from '../data/posts';
import { usePosts } from '../context/PostsContext';
import { renderMarkdown } from '../utils/markdown';

const MAX_TITLE = 100;
const MAX_EXCERPT = 200;
const MAX_TAGS = 8;
const MAX_AI_SUMMARY = 200;
/** 本地存储配额估算上限（JSON 字符数） */
const QUOTA_LIMIT = 4_000_000;
/** 超过该大小的图片插入前需二次确认（字节） */
const IMAGE_SIZE_WARN = 500 * 1024;
/** 预览防抖延迟（ms），要求 ≤300 */
const PREVIEW_DEBOUNCE = 150;

interface FormState {
  title: string;
  excerpt: string;
  category: string;
  tagsText: string;
  date: string;
  cover: string;
  aiSummary: string;
  termsText: string;
  draft: boolean;
  content: string;
}

interface FormErrors {
  title?: string;
  excerpt?: string;
  category?: string;
  tags?: string;
  aiSummary?: string;
  content?: string;
}

function today(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/** 逗号/中文逗号分隔 → trim 去空、去重 */
function parseList(text: string): string[] {
  return Array.from(new Set(text.split(/[,，]/).map((s) => s.trim()).filter(Boolean)));
}

function emptyForm(): FormState {
  return {
    title: '',
    excerpt: '',
    category: '',
    tagsText: '',
    date: today(),
    cover: '',
    aiSummary: '',
    termsText: '',
    draft: false,
    content: '',
  };
}

function formFromPost(p: Post): FormState {
  return {
    title: p.title,
    excerpt: p.excerpt,
    category: p.category,
    tagsText: p.tags.join(', '),
    date: p.date,
    cover: p.cover ?? '',
    aiSummary: p.aiSummary,
    termsText: p.terms.join(', '),
    draft: p.draft === true,
    content: p.content,
  };
}

/** 编辑模式守卫：文章不存在 / 内置文章不可编辑（复用管理台空态样式） */
function EditorGuard({ message }: { message: string }) {
  return (
    <div className="rounded-brand border border-border bg-surface p-10 text-center">
      <p className="font-heading text-lg font-semibold">{message}</p>
      <p className="mt-2 text-sm text-muted">请返回文章管理台选择其他文章操作。</p>
      <Link
        to="/admin"
        className="mt-4 inline-block rounded-brand border border-border px-4 py-2 text-sm hover:border-primary hover:text-primary"
      >
        返回管理台
      </Link>
    </div>
  );
}

/** 表单字段外壳：label + 必填标记 + 内联错误文案 */
function Field({
  label,
  htmlFor,
  required,
  error,
  hint,
  className,
  children,
}: {
  label: string;
  htmlFor: string;
  required?: boolean;
  error?: string;
  hint?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={className}>
      <label htmlFor={htmlFor} className="mb-1 block text-sm font-medium">
        {label}
        {required && <span className="text-primary"> *</span>}
      </label>
      {children}
      {error ? (
        <p className="mt-1 text-xs text-muted" role="alert">
          {error}
        </p>
      ) : (
        hint && <p className="mt-1 text-xs text-muted">{hint}</p>
      )}
    </div>
  );
}

export default function EditorPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { allPostsIncludingDrafts, userPosts, getPost, isUserPost, addPost, updatePost } = usePosts();

  const editing = Boolean(id);
  const existing = id ? getPost(id) : undefined;

  const [form, setForm] = useState<FormState>(() =>
    id && existing ? formFromPost(existing) : emptyForm()
  );
  const [errors, setErrors] = useState<FormErrors>({});
  const [formError, setFormError] = useState('');
  // 预览防抖：内容变更 150ms 后刷新（≤300ms）
  const [preview, setPreview] = useState(form.content);

  const taRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  // 打开文件选择器前记录光标，插入 dataURI 时用（文件对话框会夺走焦点）
  const cursorRef = useRef<{ start: number; end: number }>({ start: 0, end: 0 });

  // 路由参数变化时重置表单（/admin/edit/A → /admin/edit/B 复用组件实例的场景）
  useEffect(() => {
    const post = id ? getPost(id) : undefined;
    setForm(id && post ? formFromPost(post) : emptyForm());
    setErrors({});
    setFormError('');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    const t = window.setTimeout(() => setPreview(form.content), PREVIEW_DEBOUNCE);
    return () => window.clearTimeout(t);
  }, [form.content]);

  const categories = useMemo(
    () => Array.from(new Set(allPostsIncludingDrafts.map((p) => p.category))).filter(Boolean),
    [allPostsIncludingDrafts]
  );

  const setField = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const inputCls = (hasError: boolean) =>
    `w-full rounded-brand border bg-bg px-3 py-2 text-sm outline-none focus:border-primary ${
      hasError ? 'border-primary' : 'border-border'
    }`;

  /** 在 [start, end) 处插入 before+body+after；无选中时用 placeholder 并选中它，保持焦点。 */
  const applyEdit = (
    start: number,
    end: number,
    before: string,
    after: string,
    placeholder: string
  ) => {
    const value = form.content;
    const sel = value.slice(start, end);
    const body = sel || placeholder;
    setForm((f) => ({
      ...f,
      content: value.slice(0, start) + before + body + after + value.slice(end),
    }));
    const selStart = start + before.length;
    const selEnd = selStart + body.length;
    requestAnimationFrame(() => {
      const ta = taRef.current;
      if (!ta) return;
      ta.focus();
      ta.setSelectionRange(selStart, selEnd);
    });
  };

  /** 取当前选区做插入/包裹（工具栏按钮入口） */
  const wrap = (before: string, after: string, placeholder: string) => {
    const ta = taRef.current;
    const start = ta ? ta.selectionStart : form.content.length;
    const end = ta ? ta.selectionEnd : form.content.length;
    applyEdit(start, end, before, after, placeholder);
  };

  /** 在当前行行首插入前缀（标题/引用/列表） */
  const prefixLine = (prefix: string) => {
    const ta = taRef.current;
    if (!ta) return;
    const { selectionStart: s, selectionEnd: e } = ta;
    const lineStart = form.content.lastIndexOf('\n', s - 1) + 1;
    setForm((f) => ({
      ...f,
      content: f.content.slice(0, lineStart) + prefix + f.content.slice(lineStart),
    }));
    requestAnimationFrame(() => {
      ta.focus();
      ta.setSelectionRange(s + prefix.length, e + prefix.length);
    });
  };

  const toolbar: { label: string; aria: string; run: () => void }[] = [
    { label: '加粗', aria: '插入加粗文本', run: () => wrap('**', '**', '加粗文本') },
    { label: '斜体', aria: '插入斜体文本', run: () => wrap('*', '*', '斜体文本') },
    { label: '标题', aria: '插入二级标题', run: () => prefixLine('## ') },
    {
      label: '链接',
      aria: '插入链接',
      run: () => wrap('[', '](https://)', '链接文本'),
    },
    {
      label: '图片',
      aria: '插入图片语法',
      run: () => wrap('![', '](https://)', '图片描述'),
    },
    { label: '行内代码', aria: '插入行内代码', run: () => wrap('`', '`', '代码') },
    {
      label: '代码块',
      aria: '插入代码块',
      run: () => wrap('```ts\n', '\n```', '// 在此输入代码'),
    },
    { label: '引用', aria: '插入引用', run: () => prefixLine('> ') },
    { label: '列表', aria: '插入无序列表项', run: () => prefixLine('- ') },
  ];

  const handleUploadClick = () => {
    const ta = taRef.current;
    if (ta) cursorRef.current = { start: ta.selectionStart, end: ta.selectionEnd };
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = ''; // 允许重复选择同一文件
    if (!file) return;
    if (file.size > IMAGE_SIZE_WARN) {
      const kb = Math.round(file.size / 1024);
      if (!window.confirm(`图片较大（${kb} KB），将显著占用本地存储，确定插入吗？`)) return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result !== 'string') return;
      const desc = file.name.replace(/\.[^.]+$/, '');
      const { start, end } = cursorRef.current;
      applyEdit(start, end, '![', `](${reader.result})`, desc);
    };
    reader.readAsDataURL(file);
  };

  const validate = (): FormErrors => {
    const errs: FormErrors = {};
    const title = form.title.trim();
    if (!title) errs.title = '标题不能为空';
    else if (title.length > MAX_TITLE) errs.title = `标题不能超过 ${MAX_TITLE} 字`;
    const excerpt = form.excerpt.trim();
    if (!excerpt) errs.excerpt = '摘要不能为空';
    else if (excerpt.length > MAX_EXCERPT) errs.excerpt = `摘要不能超过 ${MAX_EXCERPT} 字`;
    if (!form.category.trim()) errs.category = '分类不能为空';
    if (parseList(form.tagsText).length > MAX_TAGS)
      errs.tags = `标签最多 ${MAX_TAGS} 个`;
    if (form.aiSummary.trim().length > MAX_AI_SUMMARY)
      errs.aiSummary = `AI 摘要不能超过 ${MAX_AI_SUMMARY} 字`;
    if (!form.content.trim()) errs.content = '正文不能为空';
    return errs;
  };

  /** 保存前估算 localStorage 占用：现有用户文章体积 + 本次内容增量 */
  const exceedsQuota = (nextContent: string): boolean => {
    const delta = nextContent.length - (existing?.content.length ?? 0);
    return JSON.stringify(userPosts).length + delta > QUOTA_LIMIT;
  };

  const handleSave = () => {
    const errs = validate();
    setErrors(errs);
    setFormError('');
    if (Object.keys(errs).length > 0) return;

    if (exceedsQuota(form.content)) {
      setFormError('本地存储空间不足，请精简内容或压缩图片');
      return;
    }

    // 阅读时长粗估公式与 PostsContext.addPost 同源（内容长度 / 400）；
    // 编辑路径随 patch 显式携带，避免详情页展示过期的「N 分钟阅读」
    const readingTime = Math.max(1, Math.round(form.content.length / 400));

    const payload = {
      title: form.title.trim(),
      excerpt: form.excerpt.trim(),
      category: form.category.trim(),
      tags: parseList(form.tagsText),
      date: form.date || today(),
      readingTime,
      aiSummary: form.aiSummary.trim(),
      terms: parseList(form.termsText),
      content: form.content,
      cover: form.cover.trim() || undefined,
      draft: form.draft,
    };

    if (editing && existing) {
      updatePost(existing.id, { ...payload, updatedAt: today() });
    } else {
      addPost(payload);
    }
    navigate('/admin');
  };

  // 编辑模式守卫：不存在 / 非用户文章（内置文章）不得进入编辑表单
  if (editing) {
    if (!existing) return <EditorGuard message="文章不存在" />;
    if (!isUserPost(existing.id)) return <EditorGuard message="内置文章不可编辑" />;
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-heading text-2xl font-bold">{editing ? '编辑文章' : '新建文章'}</h1>
        <p className="mt-1 text-sm text-muted">
          {editing ? '修改后保存将记录更新时间' : '使用 Markdown 撰写，右侧实时预览'}
        </p>
      </div>

      {formError && (
        <p className="rounded-brand border border-border bg-surface px-4 py-2 text-sm text-muted" role="alert">
          {formError}
        </p>
      )}

      {/* 表单字段区 */}
      <div className="grid gap-4 rounded-brand border border-border bg-surface p-4 md:grid-cols-2 md:p-6">
        <Field label="标题" htmlFor="field-title" required error={errors.title}>
          <input
            id="field-title"
            type="text"
            value={form.title}
            onChange={(e) => setField('title', e.target.value)}
            placeholder="文章标题"
            className={inputCls(!!errors.title)}
          />
        </Field>

        <Field label="分类" htmlFor="field-category" required error={errors.category}>
          <input
            id="field-category"
            type="text"
            list="category-options"
            value={form.category}
            onChange={(e) => setField('category', e.target.value)}
            placeholder="如：医学影像"
            className={inputCls(!!errors.category)}
          />
          <datalist id="category-options">
            {categories.map((c) => (
              <option key={c} value={c} />
            ))}
          </datalist>
        </Field>

        <Field
          label="摘要"
          htmlFor="field-excerpt"
          required
          error={errors.excerpt}
          hint={`1-${MAX_EXCERPT} 字`}
          className="md:col-span-2"
        >
          <textarea
            id="field-excerpt"
            rows={2}
            value={form.excerpt}
            onChange={(e) => setField('excerpt', e.target.value)}
            placeholder="一句话概括本文要点"
            className={`${inputCls(!!errors.excerpt)} resize-y`}
          />
        </Field>

        <Field
          label="标签"
          htmlFor="field-tags"
          error={errors.tags}
          hint="逗号分隔，最多 8 个，如：深度学习, 医学影像"
        >
          <input
            id="field-tags"
            type="text"
            value={form.tagsText}
            onChange={(e) => setField('tagsText', e.target.value)}
            className={inputCls(!!errors.tags)}
          />
        </Field>

        <Field label="日期" htmlFor="field-date" required>
          <input
            id="field-date"
            type="date"
            value={form.date}
            onChange={(e) => setField('date', e.target.value)}
            className={inputCls(false)}
          />
        </Field>

        <Field label="封面图 URL（选填）" htmlFor="field-cover">
          <input
            id="field-cover"
            type="text"
            value={form.cover}
            onChange={(e) => setField('cover', e.target.value)}
            placeholder="留空则按主题色自动生成"
            className={inputCls(false)}
          />
        </Field>

        <Field
          label="AI 摘要（选填）"
          htmlFor="field-ai-summary"
          error={errors.aiSummary}
          hint={`不超过 ${MAX_AI_SUMMARY} 字`}
        >
          <input
            id="field-ai-summary"
            type="text"
            value={form.aiSummary}
            onChange={(e) => setField('aiSummary', e.target.value)}
            className={inputCls(!!errors.aiSummary)}
          />
        </Field>

        <Field label="术语（选填）" htmlFor="field-terms" hint="逗号分隔，如：U-Net, Dice">
          <input
            id="field-terms"
            type="text"
            value={form.termsText}
            onChange={(e) => setField('termsText', e.target.value)}
            className={inputCls(false)}
          />
        </Field>

        <div className="md:col-span-2">
          <label htmlFor="field-draft" className="flex cursor-pointer items-center gap-2 text-sm">
            <input
              id="field-draft"
              type="checkbox"
              checked={form.draft}
              onChange={(e) => setField('draft', e.target.checked)}
              className="accent-primary"
            />
            保存为草稿（勾选后仅管理台可见，不会出现在公开列表）
          </label>
        </div>
      </div>

      {/* Markdown 编辑区：lg 双栏，窄屏堆叠 */}
      <div className="grid gap-4 lg:grid-cols-2">
        <div>
          <div className="mb-2 flex flex-wrap gap-1.5" role="toolbar" aria-label="Markdown 格式工具栏">
            {toolbar.map((b) => (
              <button
                key={b.aria}
                type="button"
                aria-label={b.aria}
                title={b.aria}
                onClick={b.run}
                className="rounded-brand border border-border px-2.5 py-1 text-xs hover:border-primary hover:text-primary"
              >
                {b.label}
              </button>
            ))}
            <button
              type="button"
              aria-label="上传图片并插入"
              title="上传图片并插入"
              onClick={handleUploadClick}
              className="rounded-brand border border-border px-2.5 py-1 text-xs hover:border-primary hover:text-primary"
            >
              上传图片
            </button>
          </div>

          {/* 隐藏的图片选择器：由「上传图片」按钮触发 */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
            aria-hidden="true"
            tabIndex={-1}
          />

          <label htmlFor="field-content" className="mb-1 block text-sm font-medium">
            正文（Markdown）
          </label>
          <textarea
            id="field-content"
            ref={taRef}
            value={form.content}
            onChange={(e) => setField('content', e.target.value)}
            placeholder="使用 Markdown 撰写正文……"
            aria-label="Markdown 正文编辑区"
            className={`${inputCls(!!errors.content)} [font-family:var(--font-mono)] min-h-[50vh] resize-y leading-relaxed`}
          />
          {errors.content && (
            <p className="mt-1 text-xs text-muted" role="alert">
              {errors.content}
            </p>
          )}
        </div>

        <div className="min-w-0">
          <p className="mb-2 text-sm font-medium">实时预览</p>
          <div className="min-h-[50vh] overflow-auto rounded-brand border border-border bg-surface p-4">
            {preview.trim() ? (
              <div
                className="article-content"
                aria-live="polite"
                dangerouslySetInnerHTML={{ __html: renderMarkdown(preview) }}
              />
            ) : (
              <p className="text-sm text-muted">开始输入后此处显示实时预览</p>
            )}
          </div>
        </div>
      </div>

      {/* 保存 / 取消 */}
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={handleSave}
          className="rounded-brand bg-primary px-5 py-2 text-sm font-medium text-white hover:opacity-90"
        >
          保存文章
        </button>
        <Link
          to="/admin"
          className="rounded-brand border border-border px-5 py-2 text-sm hover:border-primary hover:text-primary"
        >
          取消
        </Link>
        {editing && <span className="text-xs text-muted">保存后更新时间将记为 {today()}</span>}
      </div>
    </div>
  );
}
