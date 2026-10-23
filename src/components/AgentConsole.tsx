import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { works, workStatusLabels, findWork } from '../data/works';
import { resumeHero } from '../data/resume';
import TypedText from './TypedText';

/**
 * Agent Console · 作品墙签名交互
 *
 * 概念（Josh Comeau × Rauno）：访客不是「滚动看卡片」，而是向一个迷你 agent
 * 下指令——/works 列出作品，/open 1 以工具调用状态「加载」作品卡。
 * 回放的是真实数据（works.ts），不是假动画；控制台下方始终保留普通列表入口，
 * 探索是加分项，不是阅读门槛。
 *
 * 输出全部落在同一会话流里：作品卡作为 inline 节点插入，点击整卡进入
 * /work/:slug，与下方普通卡片列表入口等价。
 */

type Line =
  | { id: number; role: 'sys' | 'in' | 'out'; text: string }
  | { id: number; role: 'card'; slug: string };
type CardLine = Extract<Line, { role: 'card' }>;

const BOOT: Line[] = [
  { id: -2, role: 'sys', text: `work.log v1 · agent replay console · host=${resumeHero.github}` },
  { id: -1, role: 'sys', text: `connected · ${works.length} works indexed · type /help` },
];

const WELCOME: Line = {
  id: 0,
  role: 'out',
  text:
    '输入 /works 列出全部作品，/open <编号|slug> 现场加载一个。' +
    '嫌打字麻烦就点下面的快捷指令——探索是彩蛋不是门槛，作品卡片列表就在控制台下方。',
};

const HINTS = ['/works', '/open 1', '/open llm-wiki', '/about'];

let uid = 0;
const nid = () => ++uid;

export default function AgentConsole() {
  const [lines, setLines] = useState<Line[]>([...BOOT, WELCOME]);
  const [typingId, setTypingId] = useState<number | null>(WELCOME.id);
  const [input, setInput] = useState('');
  const [deferred, setDeferred] = useState<CardLine | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const busy = typingId !== null;

  // 新行 / 打字进度都保持滚动到底部
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [lines, deferred]);
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => { el.scrollTop = el.scrollHeight; });
    ro.observe(el.firstElementChild ?? el);
    return () => ro.disconnect();
  }, []);

  // 输出打字结束后，延迟一拍把作品卡 morph 进记录流（先见文字、再见卡片）
  useEffect(() => {
    if (!deferred || busy) return;
    const t = window.setTimeout(() => {
      setLines(prev => [...prev, deferred]);
      setDeferred(null);
    }, 420);
    return () => window.clearTimeout(t);
  }, [deferred, busy]);

  /** 输入一行指令 → 回显 + 生成输出（文本先打字，卡片等打字完成再落位） */
  const run = (raw: string) => {
    const cmd = raw.trim();
    if (!cmd) return;
    const inLine: Line = { id: nid(), role: 'in', text: cmd };
    const lower = cmd.replace(/^\//, '').toLowerCase();

    let outText = '';
    let card: string | null = null;

    if (lower === 'help' || lower === 'h') {
      outText = [
        '可用指令：',
        '  /works        列出全部作品',
        '  /open <n|slug>  加载一件作品（如 /open 1 或 /open llm-wiki）',
        '  /about        作者速览',
        '  /clear        清空重连',
      ].join('\n');
    } else if (lower === 'works' || lower === 'ls' || lower === 'ls -l' || lower === 'list') {
      outText = works
        .map((w, i) => `  ${i + 1}  ${w.slug.padEnd(18, ' ')} ${workStatusLabels[w.status]}  ${w.title}`)
        .join('\n');
    } else if (lower === 'about' || lower === 'whoami') {
      outText = `${resumeHero.name} · ${resumeHero.facts}\n完整履历走 /resume，作品背后的思考走 /work。`;
    } else if (lower === 'clear') {
      setLines(BOOT);
      setTypingId(null);
      setInput('');
      return;
    } else if (lower.startsWith('open') || /^\d+$/.test(lower)) {
      const arg = /^\d+$/.test(lower) ? lower : lower.slice(4).trim();
      const byNo = Number(arg);
      const target = Number.isFinite(byNo) && String(byNo) === arg
        ? works[byNo - 1]
        : findWork(arg);
      if (target) {
        outText = `load_work("${target.slug}") ✓ · ${target.date} · ${target.stack.join(' / ')}\n${target.tagline}`;
        card = target.slug;
      } else {
        outText = `work not found: "${arg}" · 输入 /works 查看编号与 slug`;
      }
    } else {
      outText = `command not found: ${cmd} · 指令以 / 开头，试试 /help`;
    }

    const outLine: Line = { id: nid(), role: 'out', text: outText };
    setLines(prev => [...prev, inLine, outLine]);
    setTypingId(outLine.id);
    if (card) setDeferred({ id: nid(), role: 'card', slug: card });
    setInput('');
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!busy) run(input);
  };

  return (
    <section aria-label="作品控制台" className="font-mono">
      <div className="overflow-hidden rounded-brand border border-border">
        {/* 窗口条（与终端布局同款质感） */}
        <div className="flex items-center gap-2 border-b border-border bg-surface-alt px-4 py-2">
          <span className="h-2.5 w-2.5 rounded-full" style={{ background: 'var(--color-primary)', opacity: 0.8 }} />
          <span className="h-2.5 w-2.5 rounded-full" style={{ background: 'var(--color-accent)', opacity: 0.8 }} />
          <span className="h-2.5 w-2.5 rounded-full" style={{ background: 'var(--color-text-muted)', opacity: 0.8 }} />
          <span className="ml-2 truncate text-xs text-muted">~/works — agent console</span>
          <span className="ml-auto hidden text-xs text-muted sm:inline">{works.length} works · /help</span>
        </div>

        {/* 记录区 */}
        <div
          ref={scrollRef}
          className="max-h-[52vh] overflow-y-auto px-4 py-4 text-[13px] leading-relaxed md:px-5"
          aria-live="polite"
        >
          <div className="space-y-1.5">
            {lines.map(line => <ConsoleLine key={line.id} line={line} typing={line.id === typingId} onTyped={() => {
              setTypingId(null);
            }} />)}
            {deferred && !busy && (
              <div className="anim-pop py-1">
                <WorkCardInline slug={deferred.slug} />
              </div>
            )}
          </div>
        </div>

        {/* 输入行 */}
        <form onSubmit={submit} className="flex items-center gap-2 border-t border-border bg-surface-alt px-4 py-2.5">
          <span className="select-none text-sm text-primary">λ</span>
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onFocus={e => { if (!busy) e.currentTarget.select(); }}
            disabled={busy}
            placeholder={busy ? '— working —' : '输入 /works · /open 1 · /about'}
            aria-label="控制台指令输入"
            spellCheck={false}
            autoComplete="off"
            className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted disabled:opacity-50"
          />
          <kbd className="hidden rounded border border-border px-1.5 py-0.5 text-[10px] text-muted sm:inline">Enter</kbd>
        </form>
      </div>

      {/* 快捷指令：点一下等于敲一次 */}
      <div className="mt-3 flex flex-wrap gap-2">
        {HINTS.map(h => (
          <button
            key={h}
            onClick={() => { if (!busy) run(h); }}
            disabled={busy}
            className="rounded-full border border-border px-3 py-1 font-mono text-xs text-muted transition-colors hover:border-primary hover:text-primary disabled:opacity-40"
          >
            {h}
          </button>
        ))}
      </div>
    </section>
  );
}

function ConsoleLine({ line, typing, onTyped }: { line: Line; typing: boolean; onTyped: () => void }) {
  if (line.role === 'card') {
    return (
      <div className="py-1">
        <WorkCardInline slug={line.slug} />
      </div>
    );
  }
  if (line.role === 'sys') {
    return <p className="text-xs text-muted">// {line.text}</p>;
  }
  if (line.role === 'in') {
    return (
      <p className="text-fg">
        <span className="mr-2 select-none text-primary">$</span>
        {line.text}
      </p>
    );
  }
  return (
    <p className="whitespace-pre-wrap text-muted">
      <span className="mr-2 select-none text-accent">↳</span>
      {typing ? <TypedText text={line.text} onDone={onTyped} /> : line.text}
    </p>
  );
}

/** 控制台内嵌的作品卡：morph 落位后就是可点击的真卡片 */
function WorkCardInline({ slug }: { slug: string }) {
  const w = findWork(slug);
  if (!w) return null;
  return (
    <Link
      to={`/work/${w.slug}`}
      className="glare group block rounded-brand border border-border bg-surface p-4 transition-colors hover:border-primary"
    >
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <span className="font-heading text-base font-bold group-hover:text-primary">{w.title}</span>
        <span className="text-xs text-muted">{w.date} · {workStatusLabels[w.status]}</span>
      </div>
      <p className="mt-1.5 text-[13px] leading-relaxed text-muted">{w.tagline}</p>
      <p className="mt-2 text-xs text-primary">
        打开作品档案 <span className="inline-block transition-transform group-hover:translate-x-1">→</span>
      </p>
    </Link>
  );
}
