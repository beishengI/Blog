import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import ErrorBoundary from './components/ErrorBoundary';
import { ConfigProvider } from './context/ConfigContext';
import { PostsProvider } from './context/PostsContext';
import './styles/globals.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ConfigProvider>
      <PostsProvider>
        {/* basename 跟随 Vite base:本地/普通构建为 /,GitHub Pages 构建为 /Blog/ */}
        <BrowserRouter basename={import.meta.env.BASE_URL} future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <ErrorBoundary>
            <App />
          </ErrorBoundary>
        </BrowserRouter>
      </PostsProvider>
    </ConfigProvider>
  </React.StrictMode>
);
