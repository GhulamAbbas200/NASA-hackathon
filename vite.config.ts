import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    rollupOptions: {
      output: {
        // Static imports keep all local views (including Emergency) available
        // after the app loads, while caching the larger libraries separately.
        manualChunks(id) {
          const path = id.replaceAll('\\', '/');
          if (/\/node_modules\/(react|react-dom|react-is|scheduler)\//.test(path)) return 'react-vendor';
          if (/\/node_modules\/(react-body-map|ramda)\//.test(path)) return 'body-map';
          if (path.includes('/node_modules/recharts/')) return 'charts';
        },
      },
    },
  },
});
