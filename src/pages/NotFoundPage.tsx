import { Link } from 'react-router-dom';
import { useSEO } from '../hooks/useSEO';
import { SliceMark } from '../components/report/primitives';

export default function NotFoundPage() {
  useSEO({ title: '页面不存在', noindex: true });
  return (
    <div className="not-found">
      <div className="not-found__code">404</div>
      <h1 className="not-found__title">这份报告不在卷内</h1>
      <p className="not-found__text">地址可能已移动或删除。你可以从下面任意一处继续。</p>
      <div className="not-found__actions">
        <Link to="/" className="btn btn--primary">回到读片台</Link>
        <Link to="/work" className="btn btn--ghost">检查列表</Link>
        <Link to="/posts" className="btn btn--ghost">文章</Link>
        <Link to="/wiki" className="btn btn--ghost">知识库</Link>
      </div>
      <div className="not-found__mark">
        <SliceMark label="404" size="lg" ghost />
      </div>
    </div>
  );
}
