import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist'
  },
  server: {
    // 開発サーバー設定
    host: '0.0.0.0',
    proxy: {
      '/api': {
        // 開発環境：Docker Composeのサービス名
        target: 'http://backend:8000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
  // 本番環境用の設定
  define: {
    // 環境変数を定義（ビルド時に置換される）
    __BACKEND_URL__: JSON.stringify(process.env.VITE_BACKEND_URL || '')
  }
})