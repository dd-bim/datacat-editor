import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import { analyzer } from 'vite-bundle-analyzer';
import { resolve } from 'path';

export default defineConfig(({ mode }) => ({
  plugins: [
    react(),
    // Bundle analyzer nur für Analyse-Mode
    ...(mode === 'analyze' ? [analyzer({ 
      analyzerMode: 'server',
      openAnalyzer: true
    })] : []),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}']
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
  define: {
    'import.meta.env.VITE_APP_VERSION': JSON.stringify(process.env.npm_package_version || '0.1.0'),
  },
  server: {
    host: '0.0.0.0',
    port: 3000,
    open: true,
  },
  build: {
    outDir: 'build',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          mui: ['@mui/material', '@mui/icons-material'],
          apollo: ['@apollo/client', 'graphql'],
          graphiql: ['graphiql'],
          router: ['react-router-dom'],
          forms: ['react-hook-form'],
        },
      },
    },
    chunkSizeWarningLimit: 1000,
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
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
  },
}));