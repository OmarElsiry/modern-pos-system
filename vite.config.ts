import { defineConfig } from 'vite';
import path from 'path';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { Plugin } from 'vite';

// Plugin to fix HTML for Electron
const fixHtmlForElectron = (): Plugin => ({
  name: 'fix-html-for-electron',
  transformIndexHtml(html) {
    // Remove type="module"
    html = html.replace(/type="module"\s*/g, '');

    // Find script tag and move it to end of body
    const scriptMatch = html.match(/<script\s+crossorigin\s+src="([^"]+)"><\/script>/);
    if (scriptMatch) {
      const scriptSrc = scriptMatch[1];
      // Remove script from head
      html = html.replace(scriptMatch[0], '');
      // Add script before </body>
      html = html.replace(/<\/body>/, `  <script src="${scriptSrc}"></script>\n</body>`);
    }

    return html;
  },
});

// Plugin to externalize Node.js modules in dev mode
const externalizeNodeModules = (): Plugin => ({
  name: 'externalize-node-modules',
  enforce: 'pre',
  resolveId(id) {
    // Externalize better-sqlite3 and other Node.js modules
    if (id === 'better-sqlite3' || id.startsWith('better-sqlite3/')) {
      return { id, external: true };
    }
    if (id === 'electron' || id.startsWith('electron/')) {
      return { id, external: true };
    }
    return null;
  },
});

export default defineConfig(({ mode }) => ({
  plugins: [
    tailwindcss(),
    react(),
    externalizeNodeModules(),
    // Only apply HTML fix for Electron builds, not for browser dev
    mode === 'electron' ? fixHtmlForElectron() : null
  ].filter(Boolean),
  base: process.env.VERCEL ? '/' : './',
  build: {
    outDir: process.env.VERCEL ? 'dist' : 'dist/react',
    target: 'esnext',
    minify: false, // Don't minify for debugging
    rollupOptions: {
      external: mode === 'electron' ? ['better-sqlite3', 'electron'] : [],
      output: {
        format: mode === 'electron' ? 'cjs' : 'iife',
        entryFileNames: 'assets/index.js',
        chunkFileNames: 'assets/[name].js',
        assetFileNames: 'assets/[name].[ext]',
        globals: mode === 'electron' ? {
          'better-sqlite3': 'require("better-sqlite3")',
          'electron': 'require("electron")'
        } : {}
      }
    }
  },
  optimizeDeps: {
    exclude: ['better-sqlite3', 'electron']
  },
  resolve: {
    alias: {
      // Prevent Vite from trying to bundle Node.js built-ins
      util: 'util',
      path: 'path',
      fs: 'fs',
      "@": path.resolve(__dirname, "./src"),
    }
  }
}));
