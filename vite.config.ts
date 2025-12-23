import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // 必須與您的 GitHub 倉庫名稱完全一致
  base: '/Hejiaxing-system/',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
  define: {
    // 預防 API_KEY 未定義時導致 JS 報錯
    'process.env.API_KEY': JSON.stringify(process.env.API_KEY || ''),
  },
});