import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  root: './frontend',
  plugins: [react()],
  server: {
    port: 5173
  },
  build: {
    outDir: path.resolve(__dirname, 'dist-frontend'),
    emptyOutDir: true,
    rollupOptions: {
      output: {
        dir: path.resolve(__dirname, 'dist-frontend')
      }
    }
  },
});
