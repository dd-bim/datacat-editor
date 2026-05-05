import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import { analyzer } from 'vite-bundle-analyzer';
import { resolve } from 'path';
import monacoEditorPlugin from 'vite-plugin-monaco-editor';

export default defineConfig(({ mode }) => ({
  plugins: [
    react(),
    // Monaco is REQUIRED by GraphiQL 5.x - cannot be removed
    monacoEditorPlugin({
      // Expose global monaco and ensure standalone services are wired
      globalAPI: true,
      languageWorkers: ['editorWorkerService', 'json'],
      customWorkers: [
        {
          label: 'graphql',
          entry: 'monaco-graphql/esm/graphql.worker',
        },
      ],
    }),
    // Bundle analyzer nur für Analyse-Mode
    ...(mode === 'analyze' ? [analyzer({ 
      analyzerMode: 'server',
      openAnalyzer: true
    })] : []),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        // Exclude large JS bundles from precache to avoid size limit errors
        globPatterns: ['**/*.{css,html,ico,png,svg,woff,woff2,ttf}'],
        // Still allow reasonably large assets if any slip in
        maximumFileSizeToCacheInBytes: 10 * 1024 * 1024, // 10 MB
        navigateFallback: null, // Verhindert Probleme mit SPA Routing
      },
      includeAssets: ['datacat_icon.ico', 'logo192.png', 'logo512.png'],
      manifest: {
        name: 'DataCat Editor',
        short_name: 'DataCat',
        description: 'DataCat Editor Application',
        theme_color: '#000000',
        icons: [
          {
            src: 'datacat_icon.ico',
            sizes: '64x64 32x32 24x24 16x16',
            type: 'image/x-icon'
          },
          {
            src: 'logo192.png',
            type: 'image/png',
            sizes: '192x192'
          },
          {
            src: 'logo512.png',
            type: 'image/png',
            sizes: '512x512'
          }
        ]
      }
    })
  ],
  server: {
    host: '0.0.0.0',
    port: 4000,
    open: true,
    middlewareMode: false,
  },
  build: {
    outDir: 'build',
    sourcemap: true,
    rollupOptions: {
      // Let Vite handle chunking automatically to avoid circular dependency issues
      maxParallelFileOps: 1,
      treeshake: {
        preset: 'smallest',
      },
    },
    chunkSizeWarningLimit: 600, // Reduced from Monaco size
    minify: 'esbuild',
    target: 'es2020',
    cssMinify: 'esbuild',
    reportCompressedSize: false,
    assetsInlineLimit: 0,
    commonjsOptions: {
      transformMixedEsModules: true,
    },
  },
  resolve: {
    alias: [
      { find: '@', replacement: resolve(__dirname, 'src') },
    ],
    // Ensure single instance of Monaco
    dedupe: ['graphql', 'react', 'react-dom'],
  },
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      '@mui/material',
      '@mui/icons-material',
      '@apollo/client',
      'react-router-dom',
      'graphiql',
      'nullthrows',
      '@graphiql/react',
      'graphql',
    ],
    exclude: [
      // Don't pre-bundle Monaco - let plugin handle it
      'monaco-editor',
      'monaco-graphql',
    ],
    esbuildOptions: {
      plugins: [],
    },
  },
  worker: {
    format: 'es',
  },
}));