import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  base: '/pmn-framework/',
  publicDir: 'public_static',
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icons/pwa-192.png', 'icons/pwa-512.png'],
      manifest: {
        name: 'Progressive Materialist Naturalism',
        short_name: 'PMN',
        description: 'PMN Framework — Manuscript Reader',
        theme_color: '#0d0d0d',
        background_color: '#0d0d0d',
        display: 'standalone',
        start_url: '/pmn-framework/',
        scope: '/pmn-framework/',
        icons: [
          { src: 'icons/pwa-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icons/pwa-512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' },
        ],
      },
      workbox: {
        // Cache app shell (JS/CSS/HTML)
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
        // Data JSON: stale-while-revalidate so reader gets offline access
        // but new content loads when online
        runtimeCaching: [
          {
            urlPattern: /\/pmn-framework\/data\/.*\.json$/,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'pmn-data',
              expiration: { maxEntries: 30, maxAgeSeconds: 7 * 24 * 60 * 60 },
            },
          },
        ],
      },
    }),
  ],
  build: {
    rollupOptions: {
      input: {
        main: 'index.html',
      }
    }
  }
})
