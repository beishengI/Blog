import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    // 本地开发不在工具写文件时自动弹浏览器；QA 脚本/构建产物不参与 HMR watch，
    // 避免 Windows 上原子写入的临时目录触发 EBUSY 导致 dev server 崩溃。
    open: false,
    watch: {
      ignored: [
        '**/scripts/**',
        '**/.verify/**',
        '**/docs/**',
        '**/video/**',
        '**/dist/**',
        // The editor writes atomically through a temp directory; watching it on
        // Windows can throw EBUSY and crash Vite.
        '**/*.tmpdir/**',
        '**/.*.tmpdir/**',
        '**/*.tmp',
      ],
    },
  },
});
