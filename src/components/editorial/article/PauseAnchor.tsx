import type { ArticleAnchor } from '../../../data/editorial';

/**
 * 情绪锚点 A（S04）：插在「三层架构」与「规则体系」之间。
 * 暖灰全幅、90vh、只留一句话；不劫持滚动（普通文档流 + 静态底色），
 * 滚动动效只是 view() 时间线上的轻微揭示，reduced-motion 下直接成立。
 */
export default function PauseAnchor({ anchor }: { anchor: ArticleAnchor }) {
  return (
    <section className="ja-pause" aria-label="情绪锚点：停一下">
      <div className="ja-pause__inner">
        <div className="ja-pause__meta">
          <span className="ja-pause__label">{anchor.label}</span>
          <span className="ja-pause__star" aria-hidden="true">
            ✳
          </span>
          <span className="ja-pause__note">{anchor.note}</span>
        </div>
        <p className="ja-pause__quote">
          <span className="ja-pause__line">{anchor.quote}</span>
        </p>
        <div className="ja-pause__foot">
          <span className="ja-pause__hand" aria-hidden="true">
            只留一句。别加东西。
          </span>
          <span className="ja-pause__rule" aria-hidden="true" />
          <span className="ja-pause__pageno" aria-hidden="true">
            PAUSE A
          </span>
        </div>
      </div>
    </section>
  );
}
