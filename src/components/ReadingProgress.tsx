/** 顶部固定阅读进度条。 */
export default function ReadingProgress({ progress }: { progress: number }) {
  return (
    <div className="reading-progress" style={{ width: `${progress}%` }} aria-hidden="true" />
  );
}
