import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'node:path';

export default defineConfig({
  plugins: [react()],
  base: process.env.GITHUB_ACTIONS ? '/nuclearer/' : '/',
  build: {
    rollupOptions: {
      input: {
        index: resolve(__dirname, 'docs/index.html'),
        demo: resolve(__dirname, 'demo/index.html'),
      },
    },
  },
  server: {
    port: 5173,
    // WSL/Windows mount (/mnt/c) doesn't deliver inotify events — poll so HMR fires.
    watch: { usePolling: true, interval: 300 },
    proxy: {
      '/api': {
        target: 'http://localhost:8787',
        changeOrigin: true,
      },
    },
  },
});
