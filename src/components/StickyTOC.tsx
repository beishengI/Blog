import { Heading } from '../utils/toc';

interface Props {
  headings: Heading[];
  activeId: string | null;
  progress?: number;
}

/** 右侧目录轨：高亮当前章节，底部带阅读进度。 */
export default function StickyTOC({ headings, activeId, progress = 0 }: Props) {
  return (
    <nav className="toc-rail" aria-label="文章目录">
      <p className="toc-rail__title">CONTENTS / 目录</p>
      {headings.map(heading => (
        <a
          key={heading.id}
          href={`#${heading.id}`}
          aria-current={activeId === heading.id ? 'true' : undefined}
          className={activeId === heading.id ? 'is-active' : ''}
          data-depth={heading.level}
        >
          {heading.text}
        </a>
      ))}
      <div className="toc-rail__bar" aria-hidden="true">
        <span style={{ width: `${Math.min(100, Math.max(0, progress))}%` }} />
      </div>
    </nav>
  );
}
