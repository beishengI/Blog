import type { ArticleSectionData } from '../../../utils/articleSections';

/**
 * 左侧墨线目录（⑤）：真实 nav + 原生锚点跳转；当前章节由 useActiveHeading 决定。
 * 墨线延伸用 CSS animation-timeline: scroll(root)（不支持时静态线），
 * 全程不监听 scroll 事件。
 */
export default function InkRail({
  sections,
  activeId,
}: {
  sections: ArticleSectionData[];
  activeId: string | null;
}) {
  if (sections.length === 0) return null;

  const activeIndex = Math.max(
    0,
    sections.findIndex(section => section.id === activeId)
  );
  const total = String(sections.length).padStart(2, '0');
  const current = String(activeIndex + 1).padStart(2, '0');

  return (
    <nav className="ja-rail" aria-label="文章目录">
      <div className="ja-rail__head">
        <span className="ja-rail__label">CONTENTS</span>
        <span className="ja-rail__hint" aria-hidden="true">线会长，章会圈</span>
      </div>

      <div className="ja-rail__track">
        <svg
          className="ja-rail__ink"
          viewBox="0 0 24 100"
          preserveAspectRatio="none"
          aria-hidden="true"
          focusable="false"
        >
          <path
            className="ja-rail__ink-bleed"
            pathLength="1"
            d="M 12 2 C 8 14, 17 24, 13 34 S 6 54, 13 66 S 8 86, 12 98"
          />
          <path
            className="ja-rail__ink-base"
            pathLength="1"
            d="M 12 2 C 7 14, 16 24, 12 34 S 5 54, 12 66 S 7 86, 12 98"
          />
        </svg>

        <ol className="ja-rail__list">
          {sections.map((section, index) => {
            const active = section.id === activeId;
            return (
              <li key={section.id}>
                <a
                  className={'ja-rail__link' + (active ? ' is-active' : '')}
                  href={'#' + section.id}
                  aria-current={active ? 'location' : undefined}
                >
                  <span className="ja-rail__no">{String(index + 1).padStart(2, '0')}</span>
                  <span className="ja-rail__name">{section.shortTitle}</span>
                </a>
              </li>
            );
          })}
        </ol>
      </div>

      <div className="ja-rail__foot">
        <span className="ja-rail__page-label">PAGE</span>
        <span className="ja-rail__page" aria-hidden="true">
          P.{current} / {total}
        </span>
      </div>
    </nav>
  );
}
