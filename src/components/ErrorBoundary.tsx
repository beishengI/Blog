import { Component, type ReactNode } from 'react';

interface Props { children: ReactNode }
interface State { error: Error | null }

/**
 * 顶层错误边界：任何布局渲染抛错时给出可读错误与「重置配置」按钮，
 * 避免"点了没反应 / 白屏"这类无法定位的问题。
 */
export default class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  render() {
    if (this.state.error) {
      return (
        <div className="min-h-screen p-8" style={{ background: 'var(--color-bg)', color: 'var(--color-text)' }}>
          <div className="mx-auto max-w-2xl rounded-brand border p-6" style={{ borderColor: 'var(--color-border)', background: 'var(--color-surface)' }}>
            <p className="text-lg font-bold" style={{ color: 'var(--color-primary)' }}>
              运行时错误 —— 请复制下方信息反馈
            </p>
            <pre className="mt-3 whitespace-pre-wrap break-words text-sm" style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}>
              {this.state.error.message}
              {'\n\n'}
              {this.state.error.stack}
            </pre>
            <button
              className="mt-5 rounded-brand px-4 py-2 text-sm text-white"
              style={{ background: 'var(--color-primary)' }}
              onClick={() => {
                try { localStorage.removeItem('medai-blog-config'); } catch { /* ignore */ }
                window.location.reload();
              }}
            >
              重置配置并刷新
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
