import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { viteSingleFile } from 'vite-plugin-singlefile';

/**
 * Hai target, một codebase:
 * - mặc định (`vite build`): web tĩnh cho Vercel, BrowserRouter, dữ liệu mẫu.
 * - `--mode artifact`: gộp toàn bộ JS/CSS/font/ảnh vào một HTML để xuất bản làm Claude
 *   artifact (CSP của artifact chặn mọi file ngoài); `scripts/build-artifact.mjs` cắt
 *   phần khung html/head/body mà nền tảng tự bọc.
 */
export default defineConfig(({ mode }) => {
  const artifact = mode === 'artifact';
  return {
    plugins: [react(), ...(artifact ? [viteSingleFile()] : [])],
    define: { __ARTIFACT__: JSON.stringify(artifact) },
    // Core DS mang theo React riêng trong cây phụ thuộc — ép dùng chung một bản để hook không lỗi.
    resolve: { dedupe: ['react', 'react-dom'] },
    build: artifact
      ? { outDir: 'dist-artifact', assetsInlineLimit: 100_000_000, cssCodeSplit: false, chunkSizeWarningLimit: 20_000 }
      : {},
  };
});
