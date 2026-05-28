# UI Edit Quick Reference — PMN

**Tiga File Utama**

| File              | Tanggung Jawab Utama                     | Kapan Disentuh?                  | Risiko |
|-------------------|------------------------------------------|----------------------------------|--------|
| `index.ui.html`   | Struktur halaman & container konten      | Jarang (hanya struktur baru)     | Sedang |
| `style.css`       | Semua desain visual (warna, layout, font)| Paling sering untuk ubah tampilan| Rendah |
| `app.js`          | Logika interaktif (search, AI, popover)  | Hanya untuk fitur/perilaku baru  | Tinggi |

---

**Aturan Cepat**

- **Hanya ubah warna / spacing / ukuran** → Edit **hanya `style.css`**.
- **Tambah elemen baru di halaman** → Edit `index.ui.html` + `style.css`.
- **Tambah fitur interaktif** → Edit ketiganya (paling kompleks).
- **Update konten naskah** → Jangan sentuh ketiganya. Edit file di `data/parts/`.

---

**Workflow yang Disarankan**

1. Selalu mulai dari `style.css` (paling aman).
2. Baru sentuh `index.ui.html` kalau struktur benar-benar perlu diubah.
3. `app.js` adalah pilihan terakhir.

**Tips**
- Selalu gunakan Dev Server saat menguji perubahan UI.
- Backup dulu sebelum perubahan besar (menu 5: Restore Stable Backup).
- Baca `UI_EDITING_GUIDE.md` untuk penjelasan lengkap.

---

**Versi ringkas dari UI_EDITING_GUIDE.md**  
Dicetak untuk referensi cepat saat bekerja.