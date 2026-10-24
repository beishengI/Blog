import { works } from './works';
import { wikiDocs } from '../content/wiki';
import type { Post } from './posts';

/**
 * 调阅面板命令注册表：纯数据层，不感知 UI。
 * 与「检索抽屉」互补——抽屉做全文检索，面板做键盘流「跳转 + 动作」。
 */
export type CommandGroup = '作品' | '文章' | '知识库' | '动作';
export type CommandAction = 'theme' | 'sound' | 'resume' | 'email' | 'github';

export interface Command {
  id: string;
  group: CommandGroup;
  title: string;
  hint?: string;
  keywords: string;
  to?: string;
  href?: string;
  action?: CommandAction;
}

export const COMMAND_GROUPS: CommandGroup[] = ['动作', '作品', '文章', '知识库'];

const PAGES: { title: string; to: string; hint: string }[] = [
  { title: '读片台 · 首页', to: '/', hint: 'HOME' },
  { title: '检查列表 · 全部项目', to: '/work', hint: 'WORK' },
  { title: '知识库 · 30 篇', to: '/wiki', hint: 'WIKI' },
  { title: '问题日志 · 全部文章', to: '/posts', hint: 'POSTS' },
  { title: '归档', to: '/archive', hint: 'ARCHIVE' },
  { title: '标签', to: '/tags', hint: 'TAGS' },
  { title: '简历 · 在线版', to: '/resume', hint: 'CV' },
  { title: '关于我', to: '/about', hint: 'ABOUT' },
];

export function buildCommands(posts: Post[]): Command[] {
  const pageCommands: Command[] = PAGES.map(page => ({
    id: `page:${page.to}`,
    group: '动作',
    title: page.title,
    hint: page.hint,
    keywords: `${page.title} ${page.hint}`.toLowerCase(),
    to: page.to,
  }));

  const actionCommands: Command[] = [
    { id: 'action:theme', group: '动作', title: '切换日间 / 夜间模式', hint: 'THEME', keywords: '主题 日夜 夜间 日间 dark light theme 切换'.toLowerCase(), action: 'theme' },
    { id: 'action:sound', group: '动作', title: '开关界面声音', hint: 'SOUND', keywords: '声音 音效 sound 开关'.toLowerCase(), action: 'sound' },
    { id: 'action:resume', group: '动作', title: '下载简历 PDF', hint: 'PDF', keywords: '简历 下载 resume cv pdf'.toLowerCase(), action: 'resume' },
    { id: 'action:email', group: '动作', title: '复制邮箱地址', hint: 'EMAIL', keywords: '邮箱 邮件 联系 email 复制'.toLowerCase(), action: 'email' },
    { id: 'action:github', group: '动作', title: '打开 GitHub', hint: 'GITHUB', keywords: 'github 代码 仓库'.toLowerCase(), action: 'github' },
  ];

  const workCommands: Command[] = works.map(work => ({
    id: `work:${work.slug}`,
    group: '作品',
    title: `${work.no} ${work.title}`,
    hint: work.metrics[0] ? work.metrics[0].value : work.period,
    keywords: `${work.no} ${work.title} ${work.shortTitle ?? ''} ${work.tagline} ${work.stack.join(' ')}`.toLowerCase(),
    to: `/work/${work.slug}`,
  }));

  const postCommands: Command[] = posts.map(post => ({
    id: `post:${post.id}`,
    group: '文章',
    title: post.title,
    hint: post.date,
    keywords: `${post.title} ${post.excerpt} ${post.category}`.toLowerCase(),
    to: `/posts/${post.id}`,
  }));

  const wikiCommands: Command[] = wikiDocs.map(doc => ({
    id: `wiki:${doc.slug}`,
    group: '知识库',
    title: doc.title,
    hint: doc.layer,
    keywords: `${doc.title} ${doc.layer} ${doc.description} ${doc.slug}`.toLowerCase(),
    to: `/wiki/${doc.slug}`,
  }));

  return [...pageCommands, ...actionCommands, ...workCommands, ...postCommands, ...wikiCommands];
}

/** 空查询时作品优先（页面跳转只保留首页）；检索时每组最多 8 条 */
export function filterCommands(commands: Command[], query: string): Command[] {
  const keyword = query.trim().toLowerCase();
  if (!keyword) {
    const order: CommandGroup[] = ['作品', '文章', '知识库', '动作'];
    const limits: Record<CommandGroup, number> = { 作品: 8, 文章: 4, 知识库: 4, 动作: 6 };
    const defaults = commands.filter(
      command => command.group !== '动作' || command.action || command.id === 'page:/'
    );
    return order.flatMap(group =>
      defaults.filter(command => command.group === group).slice(0, limits[group])
    );
  }
  const terms = keyword.split(/\s+/);
  return COMMAND_GROUPS.flatMap(group =>
    commands
      .filter(command => command.group === group && terms.every(term => command.keywords.includes(term)))
      .slice(0, 8)
  );
}
