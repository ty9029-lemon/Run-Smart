import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { fileURLToPath } from 'node:url';
import { PRODUCTION_HOSTNAME } from './src/constants/analytics';

/** 서버리스 함수(api/*.ts) 요청 경로. 개발 서버는 이 함수를 실행하지 못한다 */
const API_PATH_PREFIX = '/api';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  server: {
    // 개발 서버(npm run dev)에서는 서버리스 함수를 실행할 수 없어 운영 함수로 넘긴다
    proxy: {
      [API_PATH_PREFIX]: { target: `https://${PRODUCTION_HOSTNAME}`, changeOrigin: true },
    },
  },
  test: { environment: 'node' },
});
