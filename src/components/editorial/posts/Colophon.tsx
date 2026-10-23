import { Link } from 'react-router-dom';
import { notebook } from '../../../data/editorial';

const SWATCHES: Array<{ name: string; className: string }> = [
  { name: 'PAPER', className: 'jp-colorbar__swatch--paper' },
  { name: 'INK', className: 'jp-colorbar__swatch--ink' },
  { name: 'CINNABAR', className: 'jp-colorbar__swatch--cinnabar' },
  { name: 'BLUE', className: 'jp-colorbar__swatch--blue' },
  { name: 'JADE', className: 'jp-colorbar__swatch--jade' },
  { name: 'AMBER', className: 'jp-colorbar__swatch--amber' },
  { name: 'GRAPHITE', className: 'jp-colorbar__swatch--graphite' },
];

/** 卷末行：本刊无广告 / 编辑信息 / 朱印 / 印刷色条 / 页码 */
export default function Colophon({ articleCount, totalMinutes }: { articleCount: number; totalMinutes: number }) {
  return (
    <footer className="jp-colophon" aria-label="卷末">
      <div className="jp-colophon__head">
        <span className="ed-label">09 / COLOPHON / 卷末</span>
        <span className="ed-label">ISSUE 07 — END OF ISSUE</span>
      </div>
      <div className="jp-colophon__main">
        <div className="jp-colophon__left">
          <h2 className="jp-colophon__statement">本刊无广告。</h2>
          <p className="jp-colophon__hand ed-hand">{notebook.colophon}</p>
          <p className="jp-colophon__info">
            编辑 张栋栋（北省）· 武汉 · 2026 秋<br />
            本期 {articleCount} 篇 · 共 {totalMinutes} 分钟 · 按故事重量排版，不按日期
          </p>
          <nav className="jp-colophon__links" aria-label="卷末索引">
            <Link to="/work">项目</Link>
            <Link to="/wiki">知识库</Link>
            <Link to="/archive">归档</Link>
            <Link to="/tags">标签</Link>
            <Link to="/posts">回到目录 ↑</Link>
          </nav>
        </div>
        <div className="jp-colophon__right">
          <span className="ed-seal jp-colophon__seal" aria-hidden="true">张栋栋<br />北省</span>
          <p className="jp-colophon__next ed-hand">下一期：{notebook.unsent[1]}。</p>
          <div className="jp-colorbar" aria-hidden="true">
            {SWATCHES.map(item => (
              <span className="jp-colorbar__item" key={item.name}>
                <i className={'jp-colorbar__swatch ' + item.className} />
                <em>{item.name}</em>
              </span>
            ))}
          </div>
          <p className="jp-colophon__pno jp-mono">P.04 / 04 · 完</p>
        </div>
      </div>
    </footer>
  );
}
