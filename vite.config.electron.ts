import { defineConfig } from 'vite';
import path from 'path';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { Plugin } from 'vite';
import { visualizer } from 'rollup-plugin-visualizer';

const fixHtmlForElectron = (): Plugin => ({
  name: 'fix-html-for-electron',
  transformIndexHtml(html) {
    // Only remove crossorigin, keep type="module"
    return html.replace(/crossorigin/g, '');
  },
});

/**
 * Vite configuration for Electron builds
 * This config is used when building for Electron with Node.js integration
 * 
 * Performance optimizations enabled:
 * - Terser minification with console/debugger removal
 * - LightningCSS for faster CSS minification
 * - Chunk size warnings at 500KB
 * - Build caching for faster rebuilds
 */
export default defineConfig({
  plugins: [
    tailwindcss(),
    react(),
    fixHtmlForElectron(),
    // Bundle analyzer - generates stats.html for visualization
    visualizer({
      filename: 'dist/stats.html',
      open: false,
      gzipSize: true,
      brotliSize: true,
    }) as Plugin,
  ],
  base: './',
  cacheDir: '.vite-cache',
  build: {
    outDir: 'dist/react',
    target: 'chrome120',
    // Enable terser for better minification
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info', 'console.debug'],
      },
      mangle: true,
      format: {
        comments: false,
      },
    },
    // Use lightningcss for faster CSS processing
    cssMinify: 'lightningcss',
    cssCodeSplit: false,
    // Warn on large chunks
    chunkSizeWarningLimit: 500,
    commonjsOptions: {
      transformMixedEsModules: true,
    },
    rollupOptions: {
      external: ['better-sqlite3', 'electron'],
      output: {
        format: 'es',
        manualChunks: {
          'vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui': ['@radix-ui/react-dialog', '@radix-ui/react-slot', 'lucide-react'],
          'charts': ['recharts']
        }
      }
    }
  },
  optimizeDeps: {
    exclude: ['better-sqlite3', 'electron']
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    }
  },
  define: {
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'production'),
  }
});
