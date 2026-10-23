import type { Post } from '../../../data/posts';
import type { ArticleMarginalia, WritingStatus } from '../../../data/editorial';
import { findSectionIndex, type ArticleSectionData } from '../../../utils/articleSections';
import WritingStatusSticker from './WritingStatusSticker';

/**
 * 右侧页边（S01 / 阅读全程）：写作状态、TL;DR、术语、手写批注。
 * 桌面 sticky 在视口下方；窄屏时自然落到正文下方（不删内容）。
 */
export default function ArticleMargin({
  post,
  status,
  marginalia,
  sections,
}: {
  post: Post;
  status?: WritingStatus;
  marginalia: ArticleMarginalia[];
  sections: ArticleSectionData[];
}) {
  return (
    <aside className="ja-margin" aria-label="页边：摘要、术语与批注">
      <WritingStatusSticker status={status} />

      <section className="ja-margin__block">
        <h2 className="ja-margin__label">摘要 / TL;DR</h2>
        <p className="ja-margin__text">{post.aiSummary}</p>
      </section>

      {post.terms.length > 0 && (
        <section className="ja-margin__block">
          <h2 className="ja-margin__label">术语 / TERMS</h2>
          <ul className="ja-margin__terms">
            {post.terms.map(term => (
              <li key={term}>{term}</li>
            ))}
          </ul>
        </section>
      )}

      {marginalia.length > 0 && (
        <section className="ja-margin__block">
          <h2 className="ja-margin__label">MARGINALIA / 页边批注</h2>
          <ul className="ja-marginalia">
            {marginalia.map((item, index) => {
              const sectionIndex = findSectionIndex(sections, item.afterHeading);
              const target = sectionIndex >= 0 ? sections[sectionIndex] : undefined;
              const meta = item.meta ?? 'MARGINALIA ' + String(index + 1).padStart(2, '0');
              return (
                <li
                  key={meta + index}
                  className={'ja-marginalia__item ja-marginalia__item--' + item.tone}
                >
                  {target ? (
                    <a className="ja-marginalia__head" href={'#' + target.id}>
                      <span className="ja-marginalia__meta">{meta}</span>
                      <span className="ja-marginalia__section">{target.shortTitle}</span>
                    </a>
                  ) : (
                    <span className="ja-marginalia__head">
                      <span className="ja-marginalia__meta">{meta}</span>
                      <span className="ja-marginalia__section">{item.afterHeading}</span>
                    </span>
                  )}
                  <p className="ja-marginalia__text">{item.text}</p>
                </li>
              );
            })}
          </ul>
        </section>
      )}
    </aside>
  );
}
