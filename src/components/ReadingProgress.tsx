/** 顶部固定阅读进度条。 */
export default function ReadingProgress({ progress }: { progress: number }) {
  return (
    <div className="read-progress" aria-hidden="true">
      <span style={{ width: `${Math.min(100, Math.max(0, progress))}%` }} />
    </div>
  );
}
