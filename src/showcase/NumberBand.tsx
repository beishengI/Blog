import CountUp from '../components/CountUp';

const NUMBERS = [
  { value: '−83.9', unit: '%', label: 'Lite-Mamba 参数量削减', meta: '67.7M → 10.9M · Dice 0.879' },
  { value: '100', unit: '%', label: '合同预审判定确定性', meta: '规则引擎 · 单字段 <100ms' },
  { value: '92', unit: '表', label: '出租车平台迁移', meta: '88 表对账 src_only=0 · 零丢失' },
  { value: '412', unit: 'ms', label: 'Qwen3 首字时延', meta: '32B 单卡 · SSE 流式' },
];

/** Full-bleed red data band: four numbers that carry the whole story. */
export default function NumberBand() {
  return (
    <section className="number-band" aria-label="四个关键数字">
      <div className="number-band__top">
        <span>EVIDENCE / FOUR NUMBERS</span>
        <span>全部可在简历 / README / 代码中找到</span>
      </div>
      <div className="number-band__grid">
        {NUMBERS.map((item, index) => (
          <div className="number-band__item" key={item.label}>
            <span className="number-band__index">{String(index + 1).padStart(2, '0')}</span>
            <div className="number-band__value">
              <CountUp value={item.value} />
              <small>{item.unit}</small>
            </div>
            <div className="number-band__label">{item.label}</div>
            <div className="number-band__meta">{item.meta}</div>
          </div>
        ))}
      </div>
      <div className="number-band__strip" aria-hidden="true">
        <span>ALGORITHM</span><i>→</i><span>SERVICE</span><i>→</i><span>DELIVERY</span><i>→</i><span>EVIDENCE</span>
      </div>
    </section>
  );
}
