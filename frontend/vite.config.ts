import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Dockerコンテナ内で実行する場合、外部からアクセスできるようにhostを設定
    host: '0.0.0.0',
    proxy: {
      // '/api' で始まるリクエストをプロキシの対象にする
      '/api': {
        // 転送先をDocker Composeのサービス名に変更
        target: 'http://backend:8000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
})
