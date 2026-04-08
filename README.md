# PMN Framework — Nova Dharma

**Progressive Materialist Naturalism**  
*A Framework for Navigating Material Reality*

Site publikasi untuk framework PMN. Dibuat dengan React + Vite, di-host di GitHub Pages.

---

## Setup Pertama Kali

### 1. Fork / Clone repo ini

```bash
git clone https://github.com/USERNAME/pmn-framework.git
cd pmn-framework
```

### 2. Edit nama repo di `vite.config.js`

Buka `vite.config.js` dan ganti `pmn-framework` dengan nama repo GitHub kamu:

```js
base: '/nama-repo-kamu/',
```

### 3. Push ke GitHub

```bash
git add .
git commit -m "Initial setup"
git push origin main
```

### 4. Aktifkan GitHub Pages

1. Buka repo di GitHub → **Settings** → **Pages**
2. Di bagian **Source**, pilih: **GitHub Actions**
3. Tunggu ~2 menit → site live di:  
   `https://USERNAME.github.io/pmn-framework/`

---

## Cara Update Versi Baru

1. Buka site → klik **Admin ↗** (pojok kanan atas)
2. Login dengan akun admin kamu
3. Klik **Publikasikan Versi Baru**
4. Isi form: nomor versi, tanggal, ringkasan, changelog, URL PDF
5. Klik **Publikasikan**

> **Catatan:** Data versi tersimpan di `localStorage` browser. Artinya:
> - Tersimpan permanen di browser yang sama
> - Jika ingin pindah perangkat, export data dulu (fitur bisa ditambahkan)
> - Untuk setup multi-admin, pertimbangkan backend sederhana

---

## Backend Migration

Scaffold Phase 1 untuk migrasi ke Supabase sudah ditambahkan:

- `.env.example`
- `src/lib/supabase.js`
- `src/lib/pmn-backend.js`
- `supabase/schema.sql`
- `docs/supabase-phase1.md`

App saat ini masih berjalan dengan mode lokal yang lama. Scaffold ini disiapkan supaya migrasi ke backend bisa dilakukan bertahap tanpa mematahkan flow yang sudah ada.

---

## Development Lokal

```bash
npm install
npm run dev
```

Buka `http://localhost:5173/pmn-framework/`

---

## Struktur Proyek

```
pmn-framework/
├── src/
│   ├── App.jsx          ← Semua komponen UI
│   └── main.jsx         ← Entry point
├── index.html
├── vite.config.js       ← ⚠️ Ganti base sesuai nama repo
├── package.json
└── .github/
    └── workflows/
        └── deploy.yml   ← Auto-deploy ke GitHub Pages
```
