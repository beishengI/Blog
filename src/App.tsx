import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import ArticleList from './pages/ArticleList';
import ArticleDetailPage from './pages/ArticleDetailPage';
import About from './pages/About';
import TagArchive from './pages/TagArchive';
import Wiki from './pages/Wiki';
import WikiDetail from './pages/WikiDetail';

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/posts" element={<ArticleList />} />
        <Route path="/posts/:id" element={<ArticleDetailPage />} />
        <Route path="/tags" element={<TagArchive />} />
        <Route path="/tags/:tag" element={<ArticleList />} />
        <Route path="/wiki" element={<Wiki />} />
        <Route path="/wiki/:slug" element={<WikiDetail />} />
        <Route path="/about" element={<About />} />
      </Routes>
    </Layout>
  );
}
