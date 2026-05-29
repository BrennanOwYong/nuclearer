import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
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
