# -*- coding: utf-8 -*-
"""Audit glosarium PMN terhadap naskah yang sedang berjalan.

Menggantikan find_glossary_candidates.py, yang memakai heuristik "frasa
berhuruf kapital yang sering muncul" sehingga keluarannya dikuasai artefak
bibliografi: "University Press" 29x, "Chicago Press", "United States",
"Ibn Khaldun". Dari 20 kandidat teratasnya hanya sekitar 5 yang konsep
sungguhan.

Alat ini bersandar pada penanda yang dibuat penulis sendiri - JUDUL SEKSI -
bukan pada kapitalisasi. Setiap seksi bernomor adalah konsep yang sudah
diformalkan; kalau sebuah judul seksi tidak punya entri glosarium, itu
kandidat yang jauh lebih layak dipertimbangkan daripada nama penerbit.

Empat sumbu yang diperiksa:
  A. Entri yang sudah TIDAK ADA lagi di naskah
  B. Entri yang tidak bisa dipetakan ke seksi sumber
  C. Mutu definisi (melingkar, terlalu pendek, kembar, kosong)
  D. Entri tanpa kategori - punya definisi tapi tak pernah tampil
  E. Kandidat yang SEBAIKNYA masuk tapi belum
  F. Kategori yang mencurigakan (terlalu kecil / tumpang tindih)

Jalankan dari folder public/:
    D:\\Master-Universe\\.venv\\Scripts\\python.exe scripts/audit_glossary.py
    ... --markdown laporan.md      (tulis laporan ke berkas)
"""
import argparse
import io
import json
import re
import sys
from pathlib import Path

AKAR = Path(__file__).resolve().parent.parent
DATA = AKAR / "public_static" / "data"

# Kata yang menandai artefak bibliografi / nama diri, bukan konsep.
BUKAN_KONSEP = re.compile(
    r"\b(press|university|journal|review|books?|publish|edition|trans\.|"
    r"vol\.|ed\.|routledge|verso|harvard|oxford|cambridge|chicago|princeton)\b",
    re.I,
)


def muat():
    parts = json.load(io.open(DATA / "parts.json", encoding="utf-8"))
    gl = json.load(io.open(DATA / "gl.json", encoding="utf-8"))
    glg = json.load(io.open(DATA / "glg.json", encoding="utf-8"))
    return parts, gl, glg


def teks_polos(parts):
    """Seluruh isi naskah sebagai satu string huruf kecil, tag dibuang."""
    potongan = []
    for p in parts:
        for s in p.get("subs", []):
            potongan.append(re.sub(r"<[^>]+>", " ", s.get("html") or s.get("text") or ""))
    return re.sub(r"\s+", " ", " ".join(potongan)).lower()


def peta_seksi(parts):
    """[(id, judul, indeks_part, indeks_seksi)] untuk seluruh seksi."""
    keluar = []
    for pi, p in enumerate(parts):
        for si, s in enumerate(p.get("subs", [])):
            keluar.append((s.get("id", ""), s.get("title", ""), pi, si))
    return keluar


def cari_sumber(term, definisi, seksi):
    """Tiru logika aplikasi (ContentsView.findSourceForTerm), lalu longgarkan.

    Aplikasi hanya menerima dua hal: ID seksi yang disebut dalam kurung di
    definisi, atau judul seksi yang PERSIS sama dengan istilah. Fungsi ini
    melaporkan keduanya terpisah, supaya jelas mana yang butuh perbaikan
    DATA (menambah sitasi) dan mana yang butuh perbaikan KODE (mencocokkan
    lebih longgar).
    """
    m = re.search(r"\((\d+\.\d+[a-z\-]*)\)", definisi or "")
    if m:
        sid = m.group(1)
        for (i, judul, pi, si) in seksi:
            if i == sid:
                return "sitasi", judul
    t = term.strip().lower()
    for (i, judul, pi, si) in seksi:
        if judul.strip().lower() == t:
            return "judul-persis", judul
    # Longgar: istilah termuat di judul atau sebaliknya.
    for (i, judul, pi, si) in seksi:
        j = judul.strip().lower()
        if len(t) >= 6 and (t in j or j in t):
            return "judul-longgar", judul
    return None, None


def audit():
    parts, gl, glg = muat()
    naskah = teks_polos(parts)
    seksi = peta_seksi(parts)
    laporan = []

    def bab(judul):
        laporan.append("")
        laporan.append("## " + judul)
        laporan.append("")

    laporan.append("# Audit Glosarium PMN")
    laporan.append("")
    laporan.append(f"- Istilah dengan definisi (`gl.json`): **{len(gl)}**")
    kategori_terisi = set()
    for v in glg.values():
        if isinstance(v, list):
            kategori_terisi.update(str(x).lower() for x in v)
    laporan.append(f"- Kategori (`glg.json`): **{len(glg)}**")
    laporan.append(f"- Seksi naskah: **{len(seksi)}**")

    # ---------- A. entri mati ----------
    bab("A. Entri yang frasanya sudah tidak ada di naskah")
    laporan.append(
        "Pencocokan frasa persis. Konsepnya belum tentu hilang - labelnya bisa "
        "saja beda dari kalimat di naskah. Tapi konsekuensinya nyata: tooltip "
        "glosarium tidak akan pernah menyala untuk istilah ini."
    )
    laporan.append("")
    def normalkan(t):
        # Buang akhiran simbol dalam kurung, mis. 'institutional
        # fragmentation (If)' -> 'institutional fragmentation'. Tanpa ini
        # entri yang sehat dilaporkan mati hanya karena naskah menulis
        # namanya tanpa simbol.
        return re.sub(r"\s*\([^)]{1,4}\)\s*$", "", t).strip().lower()

    # Judul seksi ikut dihitung sebagai "ada di naskah". Sebuah istilah yang
    # namanya persis judul seksi jelas bukan istilah mati - tapi badan teks
    # tidak selalu mengulang judulnya sendiri, sehingga pemeriksaan yang
    # hanya melihat badan teks melaporkan positif palsu.
    judul_gabung = " | ".join((j or "").lower() for (_i, j, _p, _s) in seksi)
    mati = [t for t in gl
            if normalkan(t) not in naskah and normalkan(t) not in judul_gabung]
    if mati:
        for t in sorted(mati):
            laporan.append(f"- `{t}`")
    else:
        laporan.append("_Tidak ada._")
    laporan.append("")
    laporan.append(f"**{len(mati)} dari {len(gl)}**")

    # ---------- B. tanpa sumber ----------
    bab("B. Entri yang tidak bisa dipetakan ke seksi sumber")
    laporan.append(
        "Aplikasi hanya menerima dua jalur: ID seksi dalam kurung di definisi "
        "(mis. `(1.5)`), atau judul seksi yang PERSIS sama dengan istilah. "
        "Kolom cara-temu di bawah memisahkan mana yang perlu perbaikan DATA "
        "(tambah sitasi) dan mana yang perlu perbaikan KODE (cocokkan longgar)."
    )
    laporan.append("")
    hitung = {"sitasi": 0, "judul-persis": 0, "judul-longgar": 0, "tidak-ketemu": 0}
    longgar, hilang = [], []
    for t, d in gl.items():
        cara, judul = cari_sumber(t, d, seksi)
        if cara is None:
            hitung["tidak-ketemu"] += 1
            hilang.append(t)
        else:
            hitung[cara] += 1
            if cara == "judul-longgar":
                longgar.append((t, judul))
    for k in ("sitasi", "judul-persis", "judul-longgar", "tidak-ketemu"):
        laporan.append(f"- {k}: **{hitung[k]}**")
    laporan.append("")
    laporan.append(
        f"Aplikasi sekarang hanya mengenali {hitung['sitasi'] + hitung['judul-persis']} "
        f"entri. Mencocokkan lebih longgar akan menambah **{hitung['judul-longgar']}** "
        "lagi tanpa menyentuh data sama sekali:"
    )
    laporan.append("")
    for t, judul in sorted(longgar)[:40]:
        laporan.append(f"- `{t}` -> seksi \u201c{judul}\u201d")
    laporan.append("")
    laporan.append(f"**Benar-benar tanpa sumber: {len(hilang)}**")
    laporan.append("")
    for t in sorted(hilang)[:40]:
        laporan.append(f"- `{t}`")

    # ---------- C. mutu definisi ----------
    bab("C. Mutu definisi")
    melingkar, pendek, kosong = [], [], []
    kembar = {}
    for t, d in gl.items():
        d = (d or "").strip()
        if not d or d.lower() in {"definition pending.", "tbd", "-"}:
            kosong.append(t)
            continue
        if len(d) < 60:
            pendek.append((t, len(d), d))
        inti = re.sub(r"^(the|a|an)\s+", "", t.lower()).strip()
        awal = d.lower()[: max(40, len(inti) + 12)]
        if inti and inti in awal:
            melingkar.append((t, d[:90]))
        kembar.setdefault(d.lower(), []).append(t)

    laporan.append("### Melingkar - definisi mengulang istilahnya di awal kalimat")
    laporan.append("")
    if melingkar:
        for t, d in sorted(melingkar):
            laporan.append(f"- `{t}` -> \u201c{d}...\u201d")
    else:
        laporan.append("_Tidak ada._")

    laporan.append("")
    laporan.append("### Terlalu pendek (di bawah 60 karakter)")
    laporan.append("")
    if pendek:
        for t, n, d in sorted(pendek, key=lambda x: x[1]):
            laporan.append(f"- `{t}` ({n} kar.) -> \u201c{d}\u201d")
    else:
        laporan.append("_Tidak ada._")

    laporan.append("")
    laporan.append("### Definisi kembar - dua istilah berbagi teks yang sama")
    laporan.append("")
    ada = False
    for d, ts in kembar.items():
        if len(ts) > 1:
            ada = True
            laporan.append(f"- {', '.join('`%s`' % x for x in ts)}")
    if not ada:
        laporan.append("_Tidak ada._")

    laporan.append("")
    laporan.append("### Kosong / placeholder")
    laporan.append("")
    laporan.append(", ".join("`%s`" % t for t in kosong) if kosong else "_Tidak ada._")

    # ---------- D. tanpa kategori ----------
    bab("D. Entri tanpa kategori - punya definisi tapi tak pernah tampil")
    laporan.append(
        "Halaman glosarium merender dari `glg.json` (kategori), bukan dari "
        "`gl.json` (kamus). Istilah yang tidak masuk kategori mana pun tidak "
        "akan pernah terlihat di sana."
    )
    laporan.append("")
    tanpa = [t for t in gl if t.lower() not in kategori_terisi]
    for t in sorted(tanpa):
        laporan.append(f"- `{t}`")
    laporan.append("")
    laporan.append(f"**{len(tanpa)} dari {len(gl)}**")

    # ---------- E. kandidat masuk ----------
    bab("E. Kandidat yang sebaiknya masuk tapi belum")
    laporan.append(
        "Diambil dari JUDUL SEKSI, bukan dari kapitalisasi. Tiap seksi bernomor "
        "adalah konsep yang sudah diformalkan penulis. Diurutkan menurun "
        "berdasarkan berapa kali frasa judulnya muncul di seluruh naskah - "
        "makin sering diulang, makin layak punya entri."
    )
    laporan.append("")
    import unicodedata

    def norm_judul(x):
        """Huruf kecil, diakritik dibuang, subjudul setelah titik dua dipotong."""
        x = x.split(":")[0]
        x = unicodedata.normalize("NFKD", x)
        x = "".join(c for c in x if not unicodedata.combining(c))
        return x.strip().lower()

    gl_lower = {t.lower() for t in gl}
    gl_norm = {norm_judul(t) for t in gl}

    # Sebuah seksi terhitung SUDAH TERTUTUP bila ada definisi yang
    # menyitasi ID-nya. Ini ukuran yang benar; mencocokkan JUDUL saja
    # gagal karena nama istilah sering sengaja berbeda dari judul seksi -
    # "formula limits" untuk seksi berjudul "What the Formulas Cannot Do".
    # Tanpa ini, seksi yang sudah diberi entri tetap dihitung sebagai
    # kandidat, dan angka sisa kandidat jadi menyesatkan.
    tersitasi = set()
    for definisi in gl.values():
        for m in re.finditer(r"\((\d+\.\d+[a-z\-]*(?:-[ivx]+)?)\)", definisi or ""):
            tersitasi.add(m.group(1))
        # Sitasi rentang "(1.8-1.12)" tidak tertangkap pola di atas, sehingga
        # kedua ujungnya terhitung belum tertutup padahal sudah disitasi.
        for m in re.finditer(r"\((\d+\.\d+)-(\d+\.\d+)\)", definisi or ""):
            tersitasi.update(m.groups())

    kandidat = []
    for (sid, judul, pi, si) in seksi:
        j = judul.strip()
        if not j or len(j) < 6:
            continue
        # Normalkan sebelum membandingkan. Tanpa ini judul seksi
        # "Anti-Naive Universalism: What the Universal Standard Actually
        # Requires" tidak cocok dengan istilah "anti-naive universalism"
        # karena DIAKRITIK dan SUBJUDUL setelah titik dua - kandidat
        # duplikat pun lolos. Ketahuan saat penjaga assert gelombang kedua
        # menolak entri yang ternyata sudah ada.
        # Bandingkan KEDUA sisi titik dua. Istilah yang bermakna sering
        # justru ada SESUDAH titik dua: "From Description to Evaluation:
        # The Is-Ought Bridge" - yang jadi istilah adalah bagian kedua.
        # Membandingkan bagian pertama saja membuat entri yang sudah ada
        # tetap muncul sebagai kandidat.
        sisi = [norm_judul(bagian) for bagian in j.split(":")]
        sisi = [x for x in sisi if len(x) >= 6]
        if any(x in gl_norm for x in sisi):
            continue
        if any(x in t or t in x for x in sisi for t in gl_norm if len(t) >= 6):
            continue
        jl = norm_judul(j)
        if BUKAN_KONSEP.search(j):
            continue
        if sid in tersitasi:
            continue
        # Hitung dari judul PENUH, bukan dari bentuk ternormalkan. Bentuk
        # ternormalkan memotong subjudul setelah titik dua, sehingga
        # "The Framework: Adaptive Naturalism" menyusut jadi "the framework"
        # dan tercatat muncul 1.270 kali. Normalisasi untuk MEMBANDINGKAN
        # duplikat; penghitungan tetap memakai judul apa adanya.
        n = naskah.count(j.strip().lower())
        kandidat.append((n, sid, j))
    kandidat.sort(reverse=True)
    laporan.append("| muncul | seksi | judul |")
    laporan.append("|---|---|---|")
    for n, sid, j in kandidat:
        laporan.append(f"| {n} | `{sid}` | {j} |")
    laporan.append("")
    laporan.append(f"**{len(kandidat)} judul seksi tanpa entri glosarium.**")

    # ---------- F. kategori mencurigakan ----------
    bab("F. Kategori yang perlu ditinjau")
    laporan.append(
        "Kategori berisi satu atau dua istilah biasanya pecahan tak sengaja "
        "dari kategori yang lebih besar."
    )
    laporan.append("")
    for k, v in glg.items():
        n = len(v) if isinstance(v, list) else 0
        if n <= 2:
            isi = ", ".join("`%s`" % x for x in v) if isinstance(v, list) else ""
            laporan.append(f"- **{k}** ({n}): {isi}")
    laporan.append("")
    laporan.append("Seluruh kategori:")
    laporan.append("")
    for k, v in sorted(glg.items(), key=lambda x: -(len(x[1]) if isinstance(x[1], list) else 0)):
        laporan.append(f"- {k}: {len(v) if isinstance(v, list) else 0}")

    # ---------- G. glosarium kanonik di dalam naskah ----------
    bab("G. Glosarium kanonik di dalam naskah (seksi 15.0b)")
    laporan.append(
        "Naskah memuat seksinya sendiri berjudul “Canonical Term "
        "Definitions” yang menyatakan definisi di sana bersifat kanonik dan "
        "rujukan silang harus kembali ke situ untuk menyelesaikan ambiguitas. "
        "Glosarium situs dipelihara MANUAL dan tidak menarik apa pun dari "
        "sana. Selama keduanya terpisah, keduanya bisa berbeda tanpa ada "
        "yang tahu."
    )
    laporan.append("")
    kanon_html = ""
    for pp in parts:
        for sx in pp.get("subs", []):
            if sx.get("id") == "15.0b":
                kanon_html = sx.get("html") or ""
    kanon_teks = re.sub(r"\s+", " ", re.sub(r"<[^>]+>", " ", kanon_html))
    pola_kanon = re.compile(
        r"([A-Za-z][A-Za-z0-9_]{0,3})\s*[–—-]\s*([A-Z][A-Za-z ,'-]{3,45}?):\s"
    )
    kanon = [(m.group(1), m.group(2).strip()) for m in pola_kanon.finditer(kanon_teks)]
    gl_l2 = {k.lower() for k in gl}
    laporan.append("| simbol | istilah kanonik | punya entri glosarium? |")
    laporan.append("|---|---|---|")
    belum_kanon = 0
    for sim, nama in kanon:
        ada = nama.lower() in gl_l2 or any(
            nama.lower() in k or k in nama.lower() for k in gl_l2 if len(k) > 5
        )
        if not ada:
            belum_kanon += 1
        laporan.append("| `%s` | %s | %s |" % (sim, nama, "ya" if ada else "**BELUM**"))
    laporan.append("")
    laporan.append("**%d istilah kanonik terdeteksi, %d belum punya entri.**"
                   % (len(kanon), belum_kanon))
    laporan.append("")
    laporan.append(
        "Rekomendasi struktural: jadikan seksi 15.0b sumber kebenaran dan "
        "hasilkan bagian glosarium itu dari naskah, bukan memeliharanya "
        "terpisah. Yang tidak ada di 15.0b tetap boleh dipelihara manual, "
        "tapi yang kanonik jangan sampai punya dua versi."
    )
    laporan.append("")
    return "\n".join(laporan), {
        "mati": len(mati),
        "tanpa_sumber": len(hilang),
        "bisa_dilonggarkan": hitung["judul-longgar"],
        "tanpa_kategori": len(tanpa),
        "kandidat": len(kandidat),
    }


def main():
    ap = argparse.ArgumentParser(description="Audit glosarium PMN")
    ap.add_argument("--markdown", metavar="BERKAS", help="tulis laporan ke berkas")
    args = ap.parse_args()

    teks, ringkas = audit()
    if args.markdown:
        io.open(args.markdown, "w", encoding="utf-8").write(teks + "\n")
        print("Laporan ditulis ke", args.markdown)
    else:
        print(teks)

    print()
    print("=== RINGKASAN ===")
    for k, v in ringkas.items():
        print("  %-20s %d" % (k, v))
    return 0


if __name__ == "__main__":
    sys.exit(main())
