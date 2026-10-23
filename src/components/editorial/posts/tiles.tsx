import { useRef, useState } from 'react';
import type { KeyboardEvent as ReactKeyboardEvent } from 'react';
import { Link } from 'react-router-dom';
import type { Post } from '../../../data/posts';
import type { PostEditorial, WritingStatus } from '../../../data/editorial';
import { notebook } from '../../../data/editorial';
import { asset } from '../../../showcase/parts';
import DodgeTitle from './DodgeTitle';
import StampButton from './StampButton';
import { coverTitleLines, fmtDate, pad2 } from './helpers';

export interface TileProps {
  post: Post;
  ed: PostEditorial;
  index: number;
}

function paperclip() {
  return (
    <svg viewBox="0 0 18 46" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" aria-hidden="true" focusable="false">
      <path d="M12 8 C 15 13, 15 18, 12 24 L 8 36 C 6 41, 3 41, 3 37 C 3 32, 7 22, 8 16 C 9 11, 7 8, 5 9 C 3 10, 2 15, 3 19" />
    </svg>
  );
}

/* ------------------------------------------------------------
   A 封面长文 · 7 列 × 5 行
   标题压在纸上；悬停标题时字符躲避并浮出拍立得；底部印章。
   ------------------------------------------------------------ */
export function CoverTile({ post, ed, index }: TileProps) {
  return (
    <article className="jp-tile jp-tile--a jp-cover">
      <Link to={'/posts/' + post.id} className="jp-cover__link" aria-label={'阅读：' + post.title}>
        <span className="jp-cover__meta jp-mono">
          <span className="jp-cover__num">{pad2(index)} / {ed.eyebrow}</span>
          <span className="jp-cover__cat">{post.category}</span>
          <span>{post.readingTime} MIN</span>
          <span>{fmtDate(post.date)}</span>
        </span>

        <div className="jp-cover__titlewrap">
          <DodgeTitle lines={coverTitleLines(post.title)} />
          <span className="jp-polaroid" aria-hidden="true">
            <span className="jp-tape jp-polaroid__tape" />
            <img src={asset('/portrait-halftone.webp')} alt="" width={800} height={1000} loading="lazy" />
            <span className="jp-polaroid__cap ed-hand">{ed.hand}</span>
          </span>
        </div>

        <p className="jp-cover__excerpt">{post.excerpt}</p>
        <span className="jp-cover__tags jp-mono">
          {post.tags.map(tag => <span key={tag}>{tag}</span>)}
        </span>

        {ed.image ? (
          <figure className="jp-cover__evidence">
            <img
              src={asset(ed.image.src)}
              alt={ed.image.alt}
              width={1600}
              height={900}
              loading="lazy"
              style={ed.image.position ? { objectPosition: ed.image.position } : undefined}
            />
            <figcaption className="jp-mono">
              <span>FIG.01</span> 判定结论页 · 局部去饱和 · 200%
            </figcaption>
          </figure>
        ) : null}

        <span className="jp-cover__foot">
          <span className="jp-cover__quote ed-hand">{ed.quote ?? post.aiSummary}</span>
          <span className="jp-cover__more jp-mono">阅读全文 ↗</span>
        </span>
      </Link>
      <span className="jp-cover__stampcap ed-hand" aria-hidden="true">有用就盖章</span>
      <StampButton postId={post.id} />
    </article>
  );
}

/* ------------------------------------------------------------
   B 书脊 · 2 列 × 5 行 · 竖排 / 旋转 1.5°
   ------------------------------------------------------------ */
export function SpineTile({ post, ed, index }: TileProps) {
  const breakAt = post.title.indexOf(':');
  const titleHead = breakAt > 0 ? post.title.slice(0, breakAt + 1) : post.title;
  const titleTail = breakAt > 0 ? post.title.slice(breakAt + 1) : '';
  return (
    <article className="jp-tile jp-tile--b jp-spine">
      <Link to={'/posts/' + post.id} className="jp-spine__link" aria-label={'阅读：' + post.title}>
        <span
          className="jp-spine__texture"
          aria-hidden="true"
          style={ed.image ? { backgroundImage: 'url(' + asset(ed.image.src) + ')' } : undefined}
        />
        <span className="jp-spine__meta jp-mono">{pad2(index)} / {post.category} / {post.readingTime} MIN / {fmtDate(post.date)}</span>
        <h2 className="jp-spine__title">
          {titleHead}
          {titleTail ? <br /> : null}
          {titleTail}
        </h2>
        <span className="jp-spine__nums jp-mono">3594 FILES<br />219 S</span>
        <span className="ed-seal jp-spine__seal" aria-hidden="true">迁移</span>
        <span className="jp-spine__brand jp-mono">读片 · VOL.07 · P.03</span>
        <span className="jp-spine__anno ed-hand" aria-hidden="true">2 列 / 竖排 / 1.5°</span>
      </Link>
    </article>
  );
}

/* ------------------------------------------------------------
   C 影像方块 · 3 列 × 3 行 · 图像先于标题
   ------------------------------------------------------------ */
export function ImageTile({ post, ed, index }: TileProps) {
  return (
    <article className="jp-tile jp-tile--c jp-image">
      <Link to={'/posts/' + post.id} className="jp-image__link" aria-label={'阅读：' + post.title}>
        {ed.image ? (
          <img
            src={asset(ed.image.src)}
            alt={ed.image.alt}
            width={1600}
            height={533}
            loading="lazy"
            style={{ objectPosition: '12% 50%' }}
          />
        ) : null}
        <span className="jp-image__fig jp-mono">FIG.02 / IMAGE</span>
        <span className="jp-image__label">
          <span className="jp-tape jp-image__tape" aria-hidden="true" />
          <span className="ed-label">{pad2(index)} / {post.category} · {post.readingTime} MIN · {fmtDate(post.date)}</span>
          <h2 className="jp-image__title">{post.title}</h2>
          <span className="jp-image__meta jp-mono">{post.tags.join(' / ')}</span>
        </span>
      </Link>
      {ed.hand ? <p className="jp-image__hand ed-hand" role="note">{ed.hand}</p> : null}
    </article>
  );
}

/* ------------------------------------------------------------
   C2 写作状态 · 3 列 × 2 行 · hover / focus 展开过程痕迹
   ------------------------------------------------------------ */
export function StatusTile({ status }: { status: WritingStatus }) {
  const [open, setOpen] = useState(false);
  const timeMatch = status.updatedLabel.match(/[0-9]{2}:[0-9]{2}/);
  const time = timeMatch ? timeMatch[0] : status.updatedLabel;
  const dayLabel = timeMatch ? status.updatedLabel.replace(time, '').trim() : status.updatedLabel;

  return (
    <aside className="jp-tile jp-tile--c2 jp-status" aria-label="写作状态：合同预审智能体">
      <span className="jp-tape jp-status__tape" aria-hidden="true" />
      <span className="ed-label">09 / WRITING STATUS / 边角料</span>
      <p className="jp-status__title ed-hand">还在改。</p>
      <dl className="jp-status__rows">
        <div className="jp-status__row">
          <dt className="jp-mono">{time}</dt>
          <dd>修改于 {dayLabel} · 第 {status.draftVersion} 版</dd>
        </div>
        <div className="jp-status__row">
          <dt className="jp-mono">删 / 留</dt>
          <dd>删掉 {status.deletedChars} 字，留下 1 个没想通的问题</dd>
        </div>
        {status.listening ? (
          <div className="jp-status__row jp-status__row--listen">
            <dt className="jp-mono">在听</dt>
            <dd>
              <span className="jp-eq" aria-hidden="true"><i /><i /><i /></span>
              {status.listening.artist} — {status.listening.track}
            </dd>
          </div>
        ) : null}
      </dl>
      <button
        type="button"
        className="jp-status__toggle jp-mono"
        aria-expanded={open}
        aria-controls="jp-status-trace"
        onClick={() => setOpen(value => !value)}
      >
        看完整过程 {open ? '▴' : '▾'}
      </button>
      <ul id="jp-status-trace" className={'jp-status__trace' + (open ? ' is-open' : '')}>
        {status.trace.map(line => <li key={line}>{line}</li>)}
      </ul>
      <p className="jp-status__note ed-hand" aria-hidden="true">删掉的是解释，留下的是问题。</p>
    </aside>
  );
}

/* ------------------------------------------------------------
   D1 小方块 · 3 列 × 2 行 · CSS 热力图
   ------------------------------------------------------------ */
export function SmallTile({ post, ed, index }: TileProps) {
  return (
    <article className="jp-tile jp-tile--d1 jp-small">
      <Link to={'/posts/' + post.id} className="jp-small__link" aria-label={'阅读：' + post.title}>
        <span className="ed-label">{pad2(index)} / {post.category} · {post.readingTime} MIN</span>
        <h2 className="jp-small__title">{post.title}</h2>
        <span className="jp-small__bottom">
          <span className="jp-small__heat">
            <img src={asset('/showcase/projects/lite-mamba.webp')} alt="Grad-CAM 热力图示意：模型注视区域" width={1600} height={533} loading="lazy" style={{ objectPosition: '18% 50%' }} />
            <span className="jp-small__heatlayer" aria-hidden="true" />
          </span>
          <span className="jp-small__capwrap">
            <span className="jp-small__cap ed-hand">{ed.hand}</span>
            <span className="jp-small__meta jp-mono">{fmtDate(post.date)} · {post.readingTime} MIN</span>
          </span>
        </span>
      </Link>
    </article>
  );
}

/* ------------------------------------------------------------
   D2 索引卡 · 3 列 × 3 行 · 下移 36px / −1.2°
   ------------------------------------------------------------ */
export function IndexCardTile({ post, ed, index }: TileProps) {
  return (
    <article className="jp-tile jp-tile--d2 jp-index">
      <p className="jp-index__anno ed-hand" aria-hidden="true">↓ 下移 36px，错位是排版，不是失误。</p>
      <Link to={'/posts/' + post.id} className="jp-index__card" aria-label={'阅读：' + post.title}>
        <span className="jp-clip jp-index__clip" aria-hidden="true">{paperclip()}</span>
        <span className="ed-label jp-index__label">{pad2(index)} / INDEX CARD · {post.category}</span>
        <h2 className="jp-index__title">{post.title}</h2>
        <p className="jp-index__excerpt">{post.excerpt}</p>
        <p className="jp-index__formula ed-hand">检索增强 ＞ 直接微调</p>
        <span className="jp-index__ghost" aria-hidden="true">{pad2(index)}</span>
        <span className="jp-index__meta jp-mono">{post.readingTime} MIN · {fmtDate(post.date)} · {post.tags.join(' / ')}</span>
      </Link>
    </article>
  );
}

/* ------------------------------------------------------------
   D3 票根 · 2 列 × 2 行 · ADMIT ONE
   ------------------------------------------------------------ */
export function TicketTile({ post, ed, index }: TileProps) {
  return (
    <article className="jp-tile jp-tile--d3 jp-ticket">
      <Link to={'/posts/' + post.id} className="jp-ticket__link" aria-label={'阅读：' + post.title}>
        <span className="jp-ticket__top jp-mono"><span>{pad2(index)} / {post.category}</span><span>{fmtDate(post.date)}</span></span>
        <h2 className="jp-ticket__title">{post.title}</h2>
        {ed.hand ? <span className="jp-ticket__hand ed-hand" aria-hidden="true">{ed.hand}</span> : null}
        <span className="jp-ticket__perf" aria-hidden="true" />
        <span className="jp-ticket__stub jp-mono"><span>ADMIT ONE</span><span>{post.readingTime} MIN</span></span>
      </Link>
    </article>
  );
}

/* ------------------------------------------------------------
   E 边角料 · 4 列 × 4 行 · 索引卡抽屉（tab 键盘可操作，点卡片抽出）
   ------------------------------------------------------------ */
interface DrawerTab {
  key: string;
  label: string;
  count: number;
  title: string;
  num: string;
  items: string[];
  foot: string;
  link?: string;
  linkLabel?: string;
}

const DRAWER_TABS: DrawerTab[] = [
  {
    key: 'knowledge',
    label: '知识库',
    count: 30,
    title: '知识库 · 30 篇',
    num: '4 层 / 3 条阅读路径',
    items: notebook.knowledge,
    foot: 'KNOWLEDGE BASE / 30 NOTES',
    link: '/wiki',
    linkLabel: '全部',
  },
  {
    key: 'read',
    label: '在读',
    count: 3,
    title: '最近在读',
    num: '3 / 3',
    items: notebook.reads,
    foot: 'READING / 2026.10',
  },
  {
    key: 'unsent',
    label: '没寄出',
    count: 3,
    title: '没寄出的稿',
    num: '3 / 3',
    items: notebook.unsent,
    foot: 'UNSENT / 未寄出',
  },
];

export function DrawerTile() {
  const [active, setActive] = useState(0);
  const [pulled, setPulled] = useState(false);
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);

  const select = (next: number) => {
    setActive(next);
    setPulled(false);
  };

  const onTabKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    const key = event.key;
    let next = -1;
    if (key === 'ArrowRight') next = (active + 1) % DRAWER_TABS.length;
    else if (key === 'ArrowLeft') next = (active - 1 + DRAWER_TABS.length) % DRAWER_TABS.length;
    else if (key === 'Home') next = 0;
    else if (key === 'End') next = DRAWER_TABS.length - 1;
    if (next < 0) return;
    event.preventDefault();
    select(next);
    tabRefs.current[next]?.focus();
  };

  const onDrawerKeyDown = (event: ReactKeyboardEvent<HTMLElement>) => {
    if (event.key === 'Escape' && pulled) {
      event.stopPropagation();
      setPulled(false);
    }
  };

  const current = DRAWER_TABS[active];

  return (
    <article className="jp-tile jp-tile--e jp-drawer" onKeyDown={onDrawerKeyDown} aria-label="边角料：知识库、在读与没寄出的稿">
      <div className="jp-drawer__head">
        <span className="ed-label">08 / MARGINALIA / 边角料</span>
        <span className="jp-drawer__hand ed-hand" aria-hidden="true">抽屉</span>
      </div>

      <div className="jp-drawer__tabs" role="tablist" aria-label="边角料索引卡" onKeyDown={onTabKeyDown}>
        {DRAWER_TABS.map((tab, index) => (
          <button
            key={tab.key}
            ref={node => { tabRefs.current[index] = node; }}
            type="button"
            role="tab"
            id={'jp-tab-' + tab.key}
            className="jp-drawer__tab"
            aria-selected={index === active}
            aria-controls={'jp-panel-' + tab.key}
            tabIndex={index === active ? 0 : -1}
            onClick={() => select(index)}
          >
            {tab.label} <b>{tab.count}</b>
          </button>
        ))}
      </div>

      <div className="jp-drawer__stack">
        {DRAWER_TABS.map((tab, index) => (
          <div
            key={tab.key}
            id={'jp-panel-' + tab.key}
            role="tabpanel"
            aria-labelledby={'jp-tab-' + tab.key}
            hidden={index !== active}
            className="jp-drawer__panel"
          >
            <span className="jp-drawer__behind" aria-hidden="true" />
            <span className="jp-drawer__behind jp-drawer__behind--two" aria-hidden="true" />
            <button
              type="button"
              className={'jp-drawer__card' + (pulled ? ' is-pulled' : '')}
              aria-expanded={pulled}
              onClick={() => setPulled(value => !value)}
            >
              <span className="jp-drawer__cardhead">
                <span className="jp-drawer__cardtitle">{tab.title}</span>
                <span className="jp-drawer__cardnum jp-mono">{tab.num}</span>
              </span>
              <span className="jp-drawer__list">
                {tab.items.map((item, itemIndex) => (
                  <span className="jp-drawer__item" key={item}>
                    <em className="jp-mono">{pad2(itemIndex + 1)}</em>
                    <span className={tab.key === 'unsent' ? 'is-struck' : undefined}>{item}</span>
                  </span>
                ))}
              </span>
              <span className="jp-drawer__cardfoot">
                <span className="jp-mono">{tab.foot}</span>
                <span>{pulled ? '放回 ↺' : '抽一张 →'}</span>
              </span>
            </button>
          </div>
        ))}
      </div>

      <p className="jp-drawer__hint ed-hand">点标签，卡会自己换一张；点卡片，抽出来看看。</p>
      <p className="jp-drawer__anno">
        <span className="jp-drawer__num" aria-hidden="true">4</span>
        点一下，抽屉里抽出一张索引卡（非线性下拉）。
      </p>
      {current.link ? (
        <Link className="jp-drawer__all jp-mono" to={current.link}>{current.linkLabel} ↗</Link>
      ) : null}
    </article>
  );
}

/* ------------------------------------------------------------
   F 页底便签 · 6 列 × 2 行 · 横向手写
   ------------------------------------------------------------ */
export function NoteTile({ post, ed, index }: TileProps) {
  return (
    <article className="jp-tile jp-tile--f jp-note">
      <Link to={'/posts/' + post.id} className="jp-note__link" aria-label={'阅读：' + post.title}>
        <span className="jp-tape jp-note__tape jp-note__tape--one" aria-hidden="true" />
        <span className="jp-tape jp-note__tape jp-note__tape--two" aria-hidden="true" />
        <span className="ed-label">{pad2(index)} / 随笔 · NOTES · {post.readingTime} MIN</span>
        <h2 className="jp-note__title ed-hand">{post.title}</h2>
        <p className="jp-note__excerpt">{post.excerpt}</p>
        <span className="jp-note__meta jp-mono">{fmtDate(post.date)} · {post.tags.join(' / ')}</span>
        {ed.hand ? <span className="jp-note__hand ed-hand" aria-hidden="true">{ed.hand}</span> : null}
      </Link>
    </article>
  );
}

/* ------------------------------------------------------------
   G 拉引 · 2 列 × 2 行
   ------------------------------------------------------------ */
export function QuoteTile({ post, ed }: { post: Post; ed: PostEditorial }) {
  const shortTitle = post.title.split(':')[0];
  return (
    <article className="jp-tile jp-tile--g jp-quote">
      <Link to={'/posts/' + post.id} className="jp-quote__link" aria-label={'阅读：' + post.title}>
        <span className="jp-quote__mark ed-hand" aria-hidden="true">「</span>
        <blockquote className="jp-quote__text">{ed.quote ?? post.excerpt}</blockquote>
        <svg className="jp-quote__underline" viewBox="0 0 220 14" aria-hidden="true">
          <path d="M3 9 C 44 4, 98 12, 152 6 S 198 5, 217 9" />
        </svg>
        <span className="jp-quote__source jp-mono">—《{shortTitle}》· S04</span>
        <span className="jp-quote__note ed-hand" aria-hidden="true">这里故意空着，让眼睛休息。</span>
      </Link>
    </article>
  );
}
