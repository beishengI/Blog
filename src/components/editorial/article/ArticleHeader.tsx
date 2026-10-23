import { Link } from 'react-router-dom';
import type { Post } from '../../../data/posts';
import type { ArticleSectionData } from '../../../utils/articleSections';
import { SliceMark } from '../../report/primitives';
import ChapterPills from './ChapterPills';

/** 标题按第一个冒号拆成「主标题 + 副标题」，与分镜的稿件式标题一致。 */
function splitTitle(title: string): { main: string; colon: string; tail: string } | null {
  const match = title.match(/^([^:：]{1,80}?)([:：])(.+)$/);
  if (!match) return null;
  return { main: match[1].trim(), colon: match[2], tail: match[3].trim() };
}

/**
 * 文章头（S01）：眉标 + 超大宋体标题（允许压过页边）+ lead + 标签 + 返回目录；
 * 移动端在这里接横向章节胶囊。
 */
export default function ArticleHeader({
  post,
  views,
  kicker,
  hand,
  sections,
  activeId,
  showReadingTime,
}: {
  post: Post;
  views: number;
  kicker?: string;
  hand?: string;
  sections: ArticleSectionData[];
  activeId: string | null;
  showReadingTime: boolean;
}) {
  const parts = splitTitle(post.title);

  return (
    <header className="ja-head">
      <span className="ja-head__seal ed-seal" aria-hidden="true">
        读片
        <br />
        VOL.07
      </span>

      <div className="ja-head__eyebrow">
        <SliceMark label="ART" size="sm" />
        {kicker ? (
          <span className="ja-head__kicker">{kicker}</span>
        ) : (
          <>
            <span className="ja-head__issue">ISSUE 07</span>
            <span className="ja-head__sep" aria-hidden="true">·</span>
            <span>{post.category}</span>
          </>
        )}
        <span className="ja-head__sep" aria-hidden="true">·</span>
        <time className="ja-head__date" dateTime={post.date}>
          {post.date}
        </time>
        {showReadingTime && (
          <>
            <span className="ja-head__sep" aria-hidden="true">·</span>
            <span>{post.readingTime} MIN</span>
          </>
        )}
        <span className="ja-head__sep" aria-hidden="true">·</span>
        <span>{views} 次阅读</span>
        {post.draft === true && <span className="stamp stamp--pending">草稿</span>}
      </div>

      <h1 className="ja-head__title" id="ja-title">
        {parts ? (
          <>
            <span className="ja-head__title-main">
              {parts.main}
              <span className="ja-head__colon">{parts.colon}</span>
            </span>
            <span className="ja-head__title-tail">{parts.tail}</span>
          </>
        ) : (
          post.title
        )}
      </h1>

      <p className="ja-head__lead">{post.excerpt}</p>
      {hand && <p className="ja-head__hand">{hand}</p>}

      <div className="ja-head__foot">
        <div className="tag-row">
          {post.tags.map(tag => (
            <span key={tag} className="tag">
              {tag}
            </span>
          ))}
        </div>
        <Link to="/posts" className="ja-head__back">
          ← 返回文章目录 / INDEX
        </Link>
      </div>

      <ChapterPills sections={sections} activeId={activeId} />
    </header>
  );
}
