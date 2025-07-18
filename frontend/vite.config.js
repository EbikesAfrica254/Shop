// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // anything that starts with /api → forward to the back-end
      '/api': 'http://localhost:5000'
    }
  }
});
