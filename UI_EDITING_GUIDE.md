# Panduan Edit UI / Tampilan Website PMN

**Versi**: 1.0  
**Tanggal**: 28 Mei 2026

Dokumen ini menjelaskan cara bekerja dengan bagian **tampilan dan interaksi** website PMN. Berbeda dengan konten naskah (yang datang dari Word), mengubah tampilan website memerlukan pemahaman terhadap tiga file utama.

---

## Filosofi Singkat

Sistem PMN memisahkan dua hal yang berbeda:

- **Konten** (isi naskah) → Sangat sering berubah → Diatur melalui Word + pipeline JSON.
- **UI / Tampilan** (cara konten ditampilkan + interaksi) → Jarang berubah → Diatur melalui tiga file di bawah.

Karena perubahan UI jauh lebih jarang, alur kerja harian difokuskan pada konten. Namun ketika kamu memang perlu mengubah tampilan, kamu harus bekerja dengan ketiga file berikut.

---

## Tiga File Utama UI

### 1. `index.ui.html` — Kerangka Struktural (Paling Penting untuk Dipahami)

**Apa isinya?**
- Struktur dasar halaman (HTML skeleton).
- Tempat-tempat di mana konten akan dimasukkan (container seperti `#prose`, `#sidebar`, `#reader-view`, dll).
- Beberapa script kecil inline yang mengatur tema dan inisialisasi awal.
- Placeholder untuk CSS dan JavaScript utama.

**Kapan kamu perlu edit file ini?**
- Menambah atau mengubah struktur halaman (misalnya menambah section baru, mengubah urutan elemen).
- Menambah container baru yang nanti akan diisi oleh JavaScript.
- Mengubah cara data dimasukkan ke halaman (meski jarang).

**Catatan penting**:
File ini adalah "tulang" dari tampilan. Banyak perubahan visual sebenarnya bisa dilakukan hanya di CSS, tanpa menyentuh file ini.

---

### 2. `style.css` — Desain Visual

**Apa isinya?**
- Semua aturan tampilan (warna, font, spacing, layout, animasi, dark/light mode, dll).
- CSS variables yang mengatur tema keseluruhan.
- Styling untuk komponen-komponen (tombol, kartu, popover, dll).

**Kapan kamu perlu edit file ini?**
- Mengubah warna, tipografi, atau jarak antar elemen.
- Menambah atau mengubah tampilan komponen tertentu.
- Memperbaiki masalah responsif atau kontras.
- Menambah variasi tema (misalnya mode baru).

**Ini biasanya file yang paling sering disentuh** ketika orang bilang "mau ubah tampilan".

---

### 3. `app.js` — Logika Interaktif

**Apa isinya?**
- Semua perilaku dinamis website:
  - Pencarian
  - AI Terminal / Dialectical Synthesis
  - Popover untuk cross-reference
  - Command Palette (Ctrl+K)
  - Tema gelap/terang
  - Partikel, scroll behavior, dll.
- Cara data dari JSON dimasukkan dan dirender ke halaman.
- Event listener dan interaksi pengguna.

**Kapan kamu perlu edit file ini?**
- Menambah fitur interaktif baru.
- Mengubah cara pencarian atau navigasi bekerja.
- Memperbaiki bug pada perilaku yang sudah ada.
- Menambah integrasi baru (misalnya dengan localStorage, atau fitur AI lain).

**Catatan**: File ini adalah yang paling "berat" secara teknis. Perubahan di sini biasanya memerlukan pemahaman JavaScript yang lebih baik.

---

## Hubungan Antar Ketiga File

```
index.ui.html  (struktur)
       ↓
   style.css   (tampilan visual)
       ↓
    app.js     (perilaku & interaksi)
```

- `index.ui.html` mendefinisikan "ada apa saja di halaman ini".
- `style.css` mengatur "bagaimana semuanya terlihat".
- `app.js` mengatur "apa yang terjadi ketika user berinteraksi".

Mengubah satu file tanpa memahami dua file lainnya sering menyebabkan hasil yang tidak konsisten.

---

## Rekomendasi Cara Kerja Saat Edit UI

### 1. Mulai dari yang Paling Aman
- Hampir selalu **mulai dari `style.css`** dulu.
- Banyak perubahan visual bisa diselesaikan hanya di CSS tanpa menyentuh dua file lain.

### 2. Baru Sentuh `index.ui.html` Jika Benar-Benar Perlu
- Hanya jika kamu perlu menambah elemen baru atau mengubah struktur dasar.
- Hindari mengubah container utama (`#prose`, `#reader-view`, dll) kecuali kamu sudah paham bagaimana `app.js` menggunakannya.

### 3. `app.js` adalah Pilihan Terakhir
- Edit file ini hanya jika kamu memang ingin mengubah perilaku, bukan hanya tampilan.
- Perubahan di sini paling berisiko memecah fungsi yang sudah ada.

---

## Tips Praktis

- **Gunakan Dev Server** (menu 5 atau 6 di console) saat mengedit UI. Jangan hanya edit lalu langsung compile.
- **Backup dulu** (`index.ui.html.bak`, `style.css.bak`, `app.js.bak`) sebelum melakukan perubahan besar. Ada menu Restore Stable Backup untuk ini.
- **Jangan ubah data di dalam tag `<script id="d-parts">`** di `index.html` secara manual. Data itu dihasilkan otomatis dari JSON parts saat compile.
- Jika kamu menambah elemen baru di `index.ui.html`, biasanya kamu juga perlu menambahkan styling di `style.css`, dan mungkin logika di `app.js`.

---

## Kapan Sebaiknya Tidak Mengubah UI?

- Kalau tujuannya hanya update isi naskah → **jangan sentuh ketiga file ini**.
- Kalau kamu hanya ingin memperbaiki typo atau menambah paragraf → cukup edit file di `data/parts/`.

Hanya sentuh UI ketika kamu memang ingin mengubah **cara website terlihat atau berperilaku**, bukan isinya.

---

## Ringkasan

| Kebutuhan                          | File yang Biasanya Disentuh          | Seberapa Sering |
|------------------------------------|--------------------------------------|-----------------|
| Update isi naskah                  | `data/parts/*.json`                  | Sangat sering   |
| Ubah warna / layout dasar          | `style.css`                          | Jarang          |
| Tambah elemen baru di halaman      | `index.ui.html` + `style.css`        | Sangat jarang   |
| Tambah fitur interaktif baru       | `app.js` + `index.ui.html` + CSS     | Paling jarang   |

---

**Dokumen ini dibuat agar siapa pun yang ingin mengubah tampilan PMN tidak perlu menebak-nebak lagi file mana yang harus disentuh dan bagaimana hubungannya.**

Jangan ragu untuk membaca ketiga file tersebut secara berdampingan ketika kamu ingin melakukan perubahan UI.