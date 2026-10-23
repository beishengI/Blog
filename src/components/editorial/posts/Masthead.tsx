import { asset } from '../../../showcase/parts';
import { notebook } from '../../../data/editorial';
import { pad2 } from './helpers';

/**
 * 刊头（小版）：刊物名 + 巨型「目录」+ 半调肖像 / 朱印 / 篇数 + 卷首语。
 * 身份是「《读片》VOL.07 本期目录」，不是站点首页 hero。
 */
export default function Masthead({ count, totalMinutes }: { count: number; totalMinutes: number }) {
  return (
    <header className="jp-mast" aria-label="本期目录刊头">
      <div className="jp-mast__top">
        <p className="jp-mast__eyebrow">
          <span>《读片》READING REPORT</span>
          <span className="jp-sep" aria-hidden="true">·</span>
          <span>VOL.07</span>
          <span className="jp-sep" aria-hidden="true">·</span>
          <span>本期目录 / CONTENTS</span>
        </p>
        <p className="jp-mast__issue">ISSUE 07 · 2026 秋 · 武汉 · P.01</p>
      </div>

      <div className="jp-mast__grid">
        <div className="jp-mast__type">
          <div className="jp-mast__kicker">
            <span className="ed-label">01 / 本期目录</span>
            <span className="ed-label">SEVEN ARTICLES · TOTAL {totalMinutes} MIN</span>
          </div>
          <div className="jp-mast__titlewrap">
            <h1 className="jp-mast__title" aria-label="目录">目录</h1>
            <span className="jp-mast__hand ed-hand" aria-hidden="true">{notebook.contentsNote}</span>
          </div>
          <p className="jp-mast__lead">{notebook.editorial}</p>
          <p className="jp-mast__sign ed-hand">{notebook.signature}</p>
        </div>

        <aside className="jp-mast__side" aria-label="本期信息">
          <figure className="jp-portrait">
            <span className="jp-tape jp-portrait__tape" aria-hidden="true" />
            <span className="jp-clip jp-portrait__clip" aria-hidden="true">
              <svg viewBox="0 0 18 46" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round">
                <path d="M12 8 C 15 13, 15 18, 12 24 L 8 36 C 6 41, 3 41, 3 37 C 3 32, 7 22, 8 16 C 9 11, 7 8, 5 9 C 3 10, 2 15, 3 19" />
              </svg>
            </span>
            <img
              src={asset('/portrait-halftone.webp')}
              alt="张栋栋的半调网点肖像"
              width={800}
              height={1000}
              loading="lazy"
            />
            <figcaption>
              <span>北省 / 2026.10</span>
              <span className="jp-mono">BS-07</span>
            </figcaption>
          </figure>
          <span className="ed-seal jp-mast__seal" aria-hidden="true">读片<br />07</span>
          <div className="jp-mast__count">
            <b>{pad2(count)}</b>
            <span>篇 / {count} ARTICLES</span>
          </div>
          <p className="jp-mast__total jp-mono">READING TIME / {totalMinutes} MIN</p>
        </aside>
      </div>
    </header>
  );
}
