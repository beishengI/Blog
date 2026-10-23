import type { WritingStatus } from '../../../data/editorial';

/**
 * 页边「写作状态」贴纸（⑨）：常驻信息 + hover / focus 展开过程痕迹。
 * 主体信息不依赖 hover 就可见；触摸端与 reduced-motion 直接展开，不丢内容。
 */
export default function WritingStatusSticker({ status }: { status?: WritingStatus }) {
  if (!status) return null;

  const { updatedLabel, deletedChars, draftVersion, listening, trace } = status;

  return (
    <div
      className="ja-status"
      tabIndex={0}
      role="group"
      aria-label={
        '写作状态：修改于' +
        updatedLabel +
        '，删掉' +
        deletedChars +
        ' 字，第' +
        draftVersion +
        '版' +
        (listening ? '，在听 ' + listening.artist + ' 的 ' + listening.track : '')
      }
    >
      <span className="ja-status__tape" aria-hidden="true" />
      <span className="ja-status__label">DRAFT TRACE / 写作状态</span>
      <p className="ja-status__main">
        修改于 {updatedLabel}
        <br />
        删掉 {deletedChars} 字 · 第 {draftVersion} 版
      </p>
      {listening && (
        <p className="ja-status__listen">
          在听 · {listening.artist}
          <span aria-hidden="true">「</span>
          {listening.track}
          <span aria-hidden="true">」</span>
        </p>
      )}
      {trace.length > 0 && (
        <ul className="ja-status__trace">
          {trace.map((line, index) => (
            <li key={index}>{line}</li>
          ))}
        </ul>
      )}
      {trace.length > 0 && (
        <span className="ja-status__hint" aria-hidden="true">
          悬停 / 聚焦看过程
        </span>
      )}
    </div>
  );
}
