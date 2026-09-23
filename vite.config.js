import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'
import { readFileSync } from 'node:fs'
import { createHash } from 'node:crypto'

// Content-Security-Policy, sebagai <meta> karena GitHub Pages tidak bisa
// mengirim header sendiri.
//
// Isi naskah dirender lewat dangerouslySetInnerHTML. Kalau suatu hari data
// itu (atau apa pun yang disuntikkan) membawa <script> atau onerror=, CSP ini
// yang menolaknya: skrip hanya boleh dari situs ini sendiri, dan skrip
// inline hanya yang hash-nya dihitung di sini dari HTML final.
//
// Diinventaris 2026-09-23 sebelum ditulis: satu-satunya fetch adalah
// ./data/*.json; api.anthropic.com dan situs AI lain di bundle hanya contoh
// kode dan tautan (navigasi tidak diatur CSP); gambar hanya data: SVG di CSS;
// tidak ada eval/new Function. style-src tetap 'unsafe-inline' karena React
// memakai atribut style={{…}} di banyak komponen.
//
// Hanya saat build: dev server Vite menyuntik skrip inline dan websocket HMR
// yang akan ditolak kebijakan ini.
function contentSecurityPolicy() {
  return {
    name: 'pmn-csp',
    apply: 'build',
    transformIndexHtml: {
      order: 'post',
      handler(html) {
        const hash = [...html.matchAll(/<script(?![^>]*\bsrc=)([^>]*)>([\s\S]*?)<\/script>/g)]
          .filter(([, attrs]) => !/type=["']application\/(ld\+)?json["']/.test(attrs))
          .map(([, , body]) => `'sha256-${createHash('sha256').update(body).digest('base64')}'`)
        const policy = [
          "default-src 'self'",
          `script-src 'self' ${hash.join(' ')}`.trim(),
          "style-src 'self' 'unsafe-inline'",
          "img-src 'self' data:",
          "font-src 'self'",
          "connect-src 'self'",
          "manifest-src 'self'",
          "worker-src 'self'",
          "object-src 'none'",
          "base-uri 'self'",
          "form-action 'none'",
          'upgrade-insecure-requests',
        ].join('; ')
        // A policy that silently fails to land is worse than none: it reads
        // as protected. So the build stops instead.
        if (!/<meta charset="UTF-8" \/>/.test(html)) {
          throw new Error('pmn-csp: <meta charset="UTF-8" /> not found in index.html')
        }
        return html.replace(/(<meta charset="UTF-8" \/>)/,
          `$1\n    <meta http-equiv="Content-Security-Policy" content="${policy}" />`)
      },
    },
  }
}

// Isi statis untuk <div id="root"> di index.html.
//
// Halaman utama tadinya hanya cangkang 2,9 KB: teksnya datang lewat JS, jadi
// crawler dan fetcher AI yang tidak menjalankan JS tidak melihat apa pun.
// Daftar ini ditulis dari parts.json saat build (jadi tidak bisa basi) dan
// menunjuk ke edisi statis read/ serta teks polos txt/ yang dibuat
// scripts/build_ai_surfaces.py. React (createRoot) mengganti seluruh isi
// #root saat mount; bagi pengunjung ber-JS blok ini disembunyikan sejak
// <head> lewat kelas "js", jadi tidak ada kilatan.
function staticFallback() {
  const esc = (t) => String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
  return {
    name: 'pmn-static-fallback',
    transformIndexHtml(html) {
      const parts = JSON.parse(readFileSync('public_static/data/parts.json', 'utf8'))
      const { version } = JSON.parse(readFileSync('public_static/data/version.json', 'utf8'))
      const nama = (p) => (p.part === p.title ? p.title
        : (/^[IVXLC]+$/.test(p.part) ? 'Part ' + p.part : p.part) + ': ' + p.title)
      const daftar = parts.map((p) =>
        `<li><a href="read/${esc(p.subs[0].id)}.html">${esc(nama(p))}</a></li>`).join('')
      const blok = `<div id="static-fallback">
      <h1>Progressive Materialist Naturalism (PMN) ${esc(version)}</h1>
      <p>A naturalist philosophical framework by Nova Dharma: ${parts.length} Parts, ${parts.reduce((n, p) => n + p.subs.length, 0)} sections, about 330,000 words. This page is an interactive reader that needs JavaScript. The same manuscript is available without it:</p>
      <ul>
        <li><a href="read/">Static edition, one HTML page per section</a></li>
        <li><a href="txt/index.txt">Plain-text index: every section as its own small .txt file</a></li>
        <li><a href="llms.txt">llms.txt</a> and <a href="llms-full.txt">llms-full.txt (everything in one file, 2.4 MB)</a></li>
        <li><a href="PMN_Latest.pdf">PDF</a></li>
      </ul>
      <h2>Contents</h2>
      <ul>${daftar}</ul>
    </div>`
      return html.replace('<!-- STATIC_FALLBACK -->', blok)
    },
  }
}

export default defineConfig({
  base: '/pmn-framework/',
  publicDir: 'public_static',
  plugins: [
    react(),
    tailwindcss(),
    staticFallback(),
    contentSecurityPolicy(),
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
        // woff2 ditambahkan 2026-09-17. Tipografi dilayani sendiri sejak hari
        // itu, tetapi tanpa pola ini font tak ikut ter-precache: PWA menyatakan
        // mampu luring sementara teksnya jatuh ke font sistem begitu jaringan
        // hilang. Menyatakan luring tanpa menyimpan apa yang dibutuhkan untuk
        // merender bukan luring.
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        // read/ = 236 halaman statis untuk crawler (build_ai_surfaces.py).
        // Tak boleh ikut precache (~3,5 MB), dan navigasi ke sana tak boleh
        // dibelokkan SW ke cangkang SPA.
        globIgnores: ['read/**', 'txt/**'],
        navigateFallbackDenylist: [
          /\.(txt|md|pdf|json|xml|docx|png|jpg|jpeg|svg|webp|ico)$/i,
          /\/data\//,
          /\/read\//,
        ],
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
