import type { ArticleSectionData } from '../../../utils/articleSections';

/** 移动端 / 平板：文章头下方的横向可滑章节胶囊（桌面墨线目录的替身）。 */
export default function ChapterPills({
  sections,
  activeId,
}: {
  sections: ArticleSectionData[];
  activeId: string | null;
}) {
  if (sections.length === 0) return null;

  return (
    <nav className="ja-pills" aria-label="章节快速跳转">
      <span className="ja-pills__label">CONTENTS / 目录</span>
      <div className="ja-pills__scroll">
        {sections.map((section, index) => {
          const active = section.id === activeId;
          return (
            <a
              key={section.id}
              href={'#' + section.id}
              className={'ja-pills__item' + (active ? ' is-active' : '')}
              aria-current={active ? 'location' : undefined}
            >
              <span className="ja-pills__no">{String(index + 1).padStart(2, '0')}</span>
              {section.shortTitle}
            </a>
          );
        })}
      </div>
    </nav>
  );
}
