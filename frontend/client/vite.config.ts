import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom', 'zustand'],
          'ui-libs': ['framer-motion', 'gsap', '@studio-freight/lenis', 'lenis'],
          'utils': ['axios', 'socket.io-client']
        }
      }
    }
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5002',
        changeOrigin: true
      }
    }
  }
});
