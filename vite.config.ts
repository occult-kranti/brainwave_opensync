/// <reference types="vitest/config" />
import path from 'path'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

/**
 * Deploy base path. Local dev/preview serve from `/`; the GitHub Pages
 * workflow sets VITE_BASE=/brainwave_opensync/ so router basename, asset
 * URLs (previews, stimulus pack) and the PWA scope all agree.
 */
const base = (() => {
  const raw = (process.env.VITE_BASE ?? '/').trim()
  const withLead = raw.startsWith('/') ? raw : `/${raw}`
  return withLead.endsWith('/') ? withLead : `${withLead}/`
})()

// https://vite.dev/config/
export default defineConfig({
  base,
  plugins: [
    react(),
    VitePWA({
      registerType: 'prompt',
      // Serve/precache the app shell only; the ~100 MB of preview and stimulus
      // WAVs are cached at runtime (cache-first, capped) when first played.
      // globPatterns already covers icons/favicon; social/crawler files are not
      // part of the offline shell.
      manifest: {
        name: 'Open Sync — Evidence-Honest Brainwave Audio Lab',
        short_name: 'Open Sync',
        description:
          'Binaural / monaural / isochronic audio laboratory with A–D evidence grades, blinded self-experiments and a graded research archive. Runs entirely in your browser.',
        theme_color: '#0B0C0D',
        background_color: '#0B0C0D',
        display: 'standalone',
        orientation: 'any',
        start_url: base,
        scope: base,
        categories: ['health', 'music', 'education'],
        icons: [
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icons/icon-512-maskable.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,json,woff2}'],
        globIgnores: ['previews/**', 'stimulus_pack/**', 'icons/og-image.png', 'robots.txt', 'sitemap.xml'],
        navigateFallback: `${base}index.html`,
        navigateFallbackDenylist: [/\/previews\//, /\/stimulus_pack\//],
        maximumFileSizeToCacheInBytes: 3 * 1024 * 1024,
        runtimeCaching: [
          {
            urlPattern: ({ url }) => /\/(previews|stimulus_pack)\/.+\.wav$/.test(url.pathname),
            handler: 'CacheFirst',
            options: {
              cacheName: 'open-sync-audio',
              expiration: { maxEntries: 24, maxAgeSeconds: 30 * 24 * 3600 },
              cacheableResponse: { statuses: [0, 200] },
              // HTMLAudioElement fetches WAVs with Range headers; without this
              // plugin a cached full copy is never served to ranged requests.
              rangeRequests: true,
            },
          },
          {
            urlPattern: ({ url }) => url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com',
            handler: 'StaleWhileRevalidate',
            options: { cacheName: 'open-sync-fonts', expiration: { maxEntries: 16, maxAgeSeconds: 365 * 24 * 3600 } },
          },
        ],
      },
    }),
  ],
  server: {
    port: 3000,
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Framework + interaction vendor chunks shared by all route chunks.
          vendor: ['react', 'react-dom', 'react-router'],
          motion: ['framer-motion'],
          icons: ['lucide-react'],
        },
      },
    },
  },
  worker: {
    format: 'es',
  },
  test: {
    // Default environment stays node (pure DSP/data suites); UI suites opt
    // into happy-dom per file via `// @vitest-environment happy-dom`.
    setupFiles: ['./src/test/setup.ts'],
    coverage: {
      provider: 'v8',
      include: ['src/**/*.{ts,tsx}'],
      exclude: ['src/**/__tests__/**', 'src/test/**', 'src/components/ui/**'],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
