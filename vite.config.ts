import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import { analyzer } from 'vite-bundle-analyzer';
import { resolve } from 'path';
import monacoEditorPlugin from 'vite-plugin-monaco-editor';

export default defineConfig(({ mode }) => ({
  plugins: [
    react(),
    monacoEditorPlugin({
      languageWorkers: ['editorWorkerService', 'json'],
      customWorkers: [
        {
          label: 'graphql',
          entry: 'monaco-graphql/esm/graphql.worker'
        }
      ],
      customDistPath: (root: string, buildOutDir: string) => {
        return `${root}/${buildOutDir}/monacoeditorwork`
      }
    }),
    // Bundle analyzer nur für Analyse-Mode
    ...(mode === 'analyze' ? [analyzer({ 
      analyzerMode: 'server',
      openAnalyzer: true
    })] : []),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
        // Erhöhe das Limit für große Dateien wie Monaco Editor
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024, // 5 MB
        // Monaco Editor vom Precaching ausschließen (große Datei)
        dontCacheBustURLsMatching: /assets\/monaco-editor-.*\.js$/,
        // Große Dateien vom Precaching ausschließen
        manifestTransforms: [
          (manifestEntries) => ({
            manifest: manifestEntries.filter(
              entry => !entry.url.includes('monaco-editor') || entry.size <= 2 * 1024 * 1024
            )
          })
        ],
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
    port: 3000,
    open: true,
    middlewareMode: false,
  },
  build: {
    outDir: 'build',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          // Core React
          vendor: ['react', 'react-dom'],
          // UI Framework (aufgeteilt für kleinere Chunks)
          muiCore: ['@mui/material', '@mui/system'],
          muiIcons: ['@mui/icons-material'], 
          muiDataGrid: ['@mui/x-data-grid'],
          muiTreeView: ['@mui/x-tree-view'],
          // GraphQL (aufgeteilt)
          apolloCore: ['@apollo/client'],
          graphqlLib: ['graphql'],
          // Monaco Editor - handled by vite-plugin-monaco-editor
          // GraphiQL with Monaco support
          graphiqlLib: ['graphiql'],
          // Document Processing (aufgeteilt)
          docProcessing: ['docx-preview', 'mammoth'],
          excelLib: ['exceljs'],
          // PDF (aufgeteilt)
          pdfCanvas: ['html2canvas'],
          pdfLib: ['jspdf'],
          // Smaller libraries
          router: ['react-router-dom'],
          forms: ['react-hook-form'],
          utils: ['dayjs', 'file-saver', 'uuid', 'react-markdown'],
        },
      },
      // Aggressive Memory-Optimierungen
      maxParallelFileOps: 1,
      treeshake: {
        preset: 'smallest',
      },
    },
    chunkSizeWarningLimit: 1000, // Monaco is large, increase limit
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
    alias: {
      '@': resolve(__dirname, 'src'),
    },
    dedupe: ['graphql'],
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
    ],
    esbuildOptions: {
      plugins: [],
    },
  },
}));