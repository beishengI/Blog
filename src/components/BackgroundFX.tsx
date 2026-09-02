/** 极光背景：随主题色变化的悬浮色块，营造氛围而不抢内容。 */
export default function BackgroundFX() {
  return (
    <div className="fx-aurora" aria-hidden="true">
      <span className="fx-blob fx-blob-1" />
      <span className="fx-blob fx-blob-2" />
      <span className="fx-blob fx-blob-3" />
    </div>
  );
}
