
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // 這裡設定為 './' 確保在 GitHub Pages 的子路徑下資源路徑正確
  base: './',
  build: {
    outDir: 'dist',
  },
  define: {
    // 讓代碼中的 process.env.API_KEY 能正確運作
    'process.env.API_KEY': JSON.stringify(process.env.API_KEY),
  },
});
