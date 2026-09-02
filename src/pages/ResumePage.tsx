import { useRef } from 'react';
import { useSEO } from '../hooks/useSEO';

/**
 * 简历页：内嵌 public/resume-doc.html（A4 打印样式独立维护，改简历无需动 React 代码）。
 * 注意静态文件不能叫 resume.html——GitHub Pages 的干净 URL 特性会让 /resume
 * 直接命中静态文件,遮蔽本 SPA 路由。iframe 同源,可调用其打印。
 */
export default function ResumePage() {
  const frameRef = useRef<HTMLIFrameElement>(null);
  useSEO({ title: '简历', description: '北省 · AI 应用开发工程师 · 个人简历' });

  const printResume = () => frameRef.current?.contentWindow?.print();

  return (
    <div className="content-max mx-auto space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="font-heading text-2xl font-bold">简历</h1>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => window.open(`${import.meta.env.BASE_URL}resume-doc.html`, '_blank')}
            className="rounded-brand border border-border px-3 py-2 text-sm hover:border-primary hover:text-primary"
          >
            新窗口打开
          </button>
          <button
            type="button"
            onClick={printResume}
            className="rounded-brand bg-primary px-3 py-2 text-sm text-white"
          >
            打印 / 导出 PDF
          </button>
        </div>
      </div>
      <iframe
        ref={frameRef}
        src={`${import.meta.env.BASE_URL}resume-doc.html`}
        title="简历"
        className="h-[80vh] w-full rounded-brand border border-border bg-white"
      />
    </div>
  );
}
