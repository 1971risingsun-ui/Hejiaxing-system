import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // 必須與您的 GitHub 倉庫路徑一致：https://1971risingsun-ui.github.io/Hejiaxing-system/
  base: '/Hejiaxing-system/',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    emptyOutDir: true,
  },
  define: {
    'process.env.API_KEY': JSON.stringify(process.env.API_KEY || ''),
  },
});