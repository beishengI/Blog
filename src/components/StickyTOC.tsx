import { Heading } from '../utils/toc';

interface Props {
  headings: Heading[];
  activeId: string | null;
  progress?: number;
}

/** 吸顶目录：滚动后固定在 Header 下方，高亮当前章节，底部带阅读进度。 */
export default function StickyTOC({ headings, activeId, progress = 0 }: Props) {
  return (
    <nav className="toc-sticky">
      <div className="toc-sticky__list">
        {headings.map((h) => (
          <a
            key={h.id}
            href={`#${h.id}`}
            className={`toc-sticky__link ${activeId === h.id ? 'active' : ''} level-${h.level}`}
          >
            {h.text}
          </a>
        ))}
      </div>
      <div className="toc-sticky__bar" style={{ width: `${progress}%` }} aria-hidden="true" />
    </nav>
  );
}
