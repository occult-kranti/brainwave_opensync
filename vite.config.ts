/// <reference types="vitest/config" />
import path from 'path'
import { readFileSync } from 'node:fs'
import react from '@vitejs/plugin-react'
import { defineConfig, type Plugin } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

const pkg = JSON.parse(readFileSync(path.resolve(__dirname, 'package.json'), 'utf8')) as { version: string }

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

/**
 * Open Sync Everyday — the second entry (`app/index.html` → src/everyday/)
 * — gets its own web-app manifest so it installs as a separate icon with its
 * own scope/start_url under the same origin. Public files are copied
 * verbatim, so the manifest is emitted here with the deploy base baked in.
 * vite-plugin-pwa injects the LAB manifest link into every HTML entry; for
 * the everyday page that link is removed so the page keeps only its own.
 */
function everydayManifest(): Plugin {
  const manifest = {
    id: `${base}app/`,
    name: 'Open Sync Everyday',
    short_name: 'Open Sync',
    description: 'Sleep, focus, relax, meditate. A calm one-tap sound player: tones, noise, nature and singing bowls. Free, open source, offline, no account.',
    start_url: `${base}app/`,
    scope: `${base}app/`,
    display: 'standalone',
    orientation: 'portrait',
    theme_color: '#0B0C0D',
    background_color: '#0B0C0D',
    categories: ['health', 'music', 'lifestyle'],
    icons: [
      { src: `${base}icons/icon-192.png`, sizes: '192x192', type: 'image/png' },
      { src: `${base}icons/icon-512.png`, sizes: '512x512', type: 'image/png' },
      { src: `${base}icons/icon-512-maskable.png`, sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
    shortcuts: [
      { name: 'Sleep', url: `${base}app/#/?intent=sleep` },
      { name: 'Focus', url: `${base}app/#/?intent=focus` },
      { name: 'Relax', url: `${base}app/#/?intent=relax` },
      { name: 'Meditate', url: `${base}app/#/?intent=meditate` },
    ],
  }
  const json = JSON.stringify(manifest, null, 2)
  return {
    name: 'open-sync-everyday-manifest',
    // vite-plugin-pwa's build plugin is `enforce: 'post'`; this one is too and
    // sits after it in the plugin list, so its transform sees the injected tag.
    enforce: 'post',
    // Dev/preview: serve the manifest from memory at <base>app/manifest.webmanifest.
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.url?.split('?')[0] === `${base}app/manifest.webmanifest`) {
          res.setHeader('Content-Type', 'application/manifest+json')
          res.end(json)
          return
        }
        next()
      })
    },
    generateBundle(_options, bundle) {
      this.emitFile({ type: 'asset', fileName: 'app/manifest.webmanifest', source: json })
      // vite-plugin-pwa injects its <link rel="manifest"> as a tag, which Vite
      // appends after every string transform has run — so the lab link is
      // stripped here, on the emitted HTML asset, before the service-worker
      // precache manifest is computed in closeBundle.
      const html = bundle['app/index.html']
      if (html && html.type === 'asset' && typeof html.source === 'string') {
        html.source = html.source.replace(/<link rel="manifest" href="[^"]*manifest\.webmanifest"[^>]*>\s*/g, (m) =>
          m.includes('app/manifest.webmanifest') ? m : '',
        )
      }
    },
    transformIndexHtml: {
      order: 'post',
      handler(html, ctx) {
        const file = (ctx.filename ?? '').replace(/\\/g, '/')
        const isEveryday = ctx.path.startsWith('/app') || /(^|\/)app\/index\.html$/.test(file)
        if (!isEveryday) return html
        // Drop the lab manifest link injected by vite-plugin-pwa; keep ours.
        return html.replace(/<link rel="manifest" href="[^"]*manifest\.webmanifest"[^>]*>\s*/g, (m) => (m.includes('app/manifest.webmanifest') ? m : ''))
      },
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  base,
  define: {
    'import.meta.env.VITE_APP_VERSION': JSON.stringify(pkg.version),
  },
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
            // The preview manifest is small and changes with each preset render.
            urlPattern: ({ url }) => /\/previews\/manifest\.json$/.test(url.pathname),
            handler: 'NetworkFirst',
            options: { cacheName: 'open-sync-manifest', networkTimeoutSeconds: 3, cacheableResponse: { statuses: [0, 200] } },
          },
          {
            urlPattern: ({ url }) => url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com',
            handler: 'StaleWhileRevalidate',
            options: { cacheName: 'open-sync-fonts', expiration: { maxEntries: 16, maxAgeSeconds: 365 * 24 * 3600 } },
          },
        ],
      },
    }),
    // After VitePWA on purpose: its manifest-link injection must run first.
    everydayManifest(),
  ],
  server: {
    port: 3000,
  },
  build: {
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'index.html'),
        app: path.resolve(__dirname, 'app/index.html'),
      },
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
