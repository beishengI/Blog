import { Link } from 'react-router-dom';
import type { Post } from '../../../data/posts';
import { postEditorial, writingStatus } from '../../../data/editorial';
import {
  CoverTile,
  SpineTile,
  ImageTile,
  StatusTile,
  SmallTile,
  IndexCardTile,
  TicketTile,
  DrawerTile,
  NoteTile,
  QuoteTile,
} from './tiles';

function findPost(posts: Post[], id: string): Post | undefined {
  return posts.find(post => post.id === id);
}

/**
 * 非对称 Bento 拼贴：12 列 × 行单元 88 / gap 20（≤1024 六列，≤768 单列）。
 * 尺寸 = 故事权重：A 封面长文 7 列，碎片只配票根 / 索引卡。
 * 边角料（写作状态、知识库抽屉、拉引）嵌在 Bento 里，不在下面另起一列。
 */
export default function BentoGrid({ posts }: { posts: Post[] }) {
  const cover = findPost(posts, 'contract-preaudit-agent');
  const spine = findPost(posts, 'jiayu-lowcode-migration');
  const image = findPost(posts, 'cnn-ct-segmentation');
  const rag = findPost(posts, 'rag-clinical-qa');
  const gradcam = findPost(posts, 'gradcam-interpretability');
  const deploy = findPost(posts, 'deploy-fastapi');
  const study = findPost(posts, 'study-notes-ml');
  const status = writingStatus['contract-preaudit-agent'];

  return (
    <section className="jp-bento" aria-label="拼贴目录">
      <div className="jp-divider">
        <svg className="jp-divider__line" viewBox="0 0 1300 56" preserveAspectRatio="none" aria-hidden="true">
          <path d="M-6 33 C 96 19, 178 43, 268 31 S 468 16, 608 33 S 858 44, 1012 26 S 1198 15, 1294 34" />
          <path d="M1258 15 L 1297 34 L 1252 47" />
        </svg>
        <span className="jp-divider__note ed-hand">从这里开始，不按顺序读也行 ↗</span>
      </div>

      <div className="jp-bento__head">
        <span className="ed-label">03 / THE ISSUE</span>
        <h2 className="jp-bento__title">拼贴目录</h2>
        <span className="ed-label">COLLAGE INDEX</span>
        <span className="jp-bento__count jp-mono">7 ARTICLES / 3 MARGINALIA</span>
      </div>
      <p className="jp-bento__note ed-hand">尺寸 = 故事权重，不是发布日期。长文占 7 列，碎片只配一张票根。</p>

      <div className="jp-bento__grid">
        {cover ? <CoverTile post={cover} ed={postEditorial[cover.id]} index={1} /> : null}
        {spine ? <SpineTile post={spine} ed={postEditorial[spine.id]} index={2} /> : null}
        {image ? <ImageTile post={image} ed={postEditorial[image.id]} index={3} /> : null}
        {status ? <StatusTile status={status} /> : null}
        {gradcam ? <SmallTile post={gradcam} ed={postEditorial[gradcam.id]} index={5} /> : null}
        {rag ? <IndexCardTile post={rag} ed={postEditorial[rag.id]} index={4} /> : null}
        {deploy ? <TicketTile post={deploy} ed={postEditorial[deploy.id]} index={6} /> : null}
        <DrawerTile />
        {study ? <NoteTile post={study} ed={postEditorial[study.id]} index={7} /> : null}
        {cover ? <QuoteTile post={cover} ed={postEditorial[cover.id]} /> : null}
      </div>

      <nav className="jp-appendix" aria-label="别册索引">
        <span className="jp-appendix__title">别册 / APPENDIX</span>
        <span className="jp-appendix__sep" aria-hidden="true">｜</span>
        <Link to="/work" className="jp-appendix__link">项目 7 项</Link>
        <span className="jp-appendix__sep" aria-hidden="true">/</span>
        <Link to="/wiki" className="jp-appendix__link">知识库 30 篇</Link>
        <span className="jp-appendix__sep" aria-hidden="true">/</span>
        <Link to="/archive" className="jp-appendix__link">归档</Link>
        <span className="jp-appendix__sep" aria-hidden="true">/</span>
        <Link to="/tags" className="jp-appendix__link">标签</Link>
        <span className="jp-appendix__sep" aria-hidden="true">/</span>
        <a href={import.meta.env.BASE_URL + 'rss.xml'} className="jp-appendix__link" target="_blank" rel="noreferrer">RSS ↗</a>
        <span className="jp-appendix__end jp-mono">READING REPORT / VOL.07</span>
      </nav>
    </section>
  );
}
