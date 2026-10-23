import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import { SliceMark } from './components/report/primitives';

const ArticleList = lazy(() => import('./pages/ArticleList'));
const ArticleDetailPage = lazy(() => import('./pages/ArticleDetailPage'));
const About = lazy(() => import('./pages/About'));
const TagArchive = lazy(() => import('./pages/TagArchive'));
const ArchivePage = lazy(() => import('./pages/ArchivePage'));
const Wiki = lazy(() => import('./pages/Wiki'));
const WikiDetail = lazy(() => import('./pages/WikiDetail'));
const AdminPage = lazy(() => import('./pages/AdminPage'));
const EditorPage = lazy(() => import('./pages/EditorPage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));
const ResumePage = lazy(() => import('./pages/ResumePage'));
const WorkPage = lazy(() => import('./pages/WorkPage'));
const WorkDetailPage = lazy(() => import('./pages/WorkDetailPage'));

function PageFallback() {
  return (
    <div className="page-loading" role="status" aria-live="polite">
      <SliceMark label="…" size="sm" ghost />
      <span className="mono-label">LOADING / 正在调阅</span>
    </div>
  );
}

export default function App() {
  return (
    <Layout>
      <Suspense fallback={<PageFallback />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/posts" element={<ArticleList />} />
          <Route path="/posts/:id" element={<ArticleDetailPage />} />
          <Route path="/tags" element={<TagArchive />} />
          <Route path="/archive" element={<ArchivePage />} />
          <Route path="/tags/:tag" element={<ArticleList />} />
          <Route path="/wiki" element={<Wiki />} />
          <Route path="/wiki/:slug" element={<WikiDetail />} />
          <Route path="/about" element={<About />} />
          <Route path="/work" element={<WorkPage />} />
          <Route path="/work/:slug" element={<WorkDetailPage />} />
          <Route path="/resume" element={<ResumePage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/admin/new" element={<EditorPage />} />
          <Route path="/admin/edit/:id" element={<EditorPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
    </Layout>
  );
}
