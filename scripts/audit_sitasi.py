# -*- coding: utf-8 -*-
"""Audit integritas sitasi PMN.

Dua arah, dua pertanyaan berbeda:
  A. Sitasi dalam teks yang tidak punya entri di Bibliography.
  B. Entri Bibliography yang tidak pernah disitasi di mana pun.

Keduanya bisa dibuktikan dari naskah itu sendiri. Yang TIDAK diperiksa di sini:
apakah sumbernya benar-benar mendukung klaimnya - itu di luar jangkauan alat.
"""
import collections
import glob
import io
import json
import re
import sys
import unicodedata

AKAR = r"D:\Master-Universe\pmn-workspace\public"

# Kurung yang memuat tahun empat digit. Dipecah pada ';' karena sitasi
# majemuk lazim: "(Olson 1965; Stigler 1971)".
KURUNG = re.compile(r"\(([^()]{0,300}?(?:1[5-9]|20)\d{2}[^()]{0,120}?)\)")
SATUAN = re.compile(
    r"^(?P<nama>[A-Z][\w\u00c0-\u017f'’-]+"
    r"(?:\s+(?:and|&|et\s+al\.?)\s+[A-Z][\w\u00c0-\u017f'’-]+)?"
    r"(?:\s+[A-Z][\w\u00c0-\u017f'’-]+)?)"
    r"[,\s]+(?P<tahun>(?:1[5-9]|20)\d{2})[a-z]?\b")


def muat():
    seksi = []
    for f in sorted(glob.glob(AKAR + r"\data\parts\part_*.json")):
        for s in json.load(io.open(f, encoding="utf-8")):
            raw = s["html"] or ""
            t = re.sub(r"</?p[^>]*>", "\n", raw)
            t = re.sub(r"<[^>]+>", " ", t)
            t = (t.replace("&amp;", "&").replace("&#x27;", "'")
                  .replace("&quot;", '"').replace("&lt;", "<")
                  .replace("&gt;", ">").replace("&nbsp;", " ")
                  .replace("\u2019", "'"))
            seksi.append((s["id"], s["title"], t))
    return seksi


def entri_bibliografi(teks):
    """Nama belakang + tahun tiap entri Bibliography.

    Entri dipotong pada batas "Nama, " di awal paragraf lebih dulu, baru tahunnya
    diambil di dalam potongan. Mengikat pencocokan ke awal baris mencegah
    nama penerjemah di tengah entri (mis. "Trans. Anne Cohler, Basia Miller, Harold Stone")
    terbaca sebagai penulis bibliografi tersendiri.
    """
    # Lookahead HARUS menerima kapital beraksen. "Durkheim, \u00c9mile. 1912"
    # terlewat sama sekali karena \u00c9 tidak termasuk [A-Z], sehingga entri yang
    # jelas ada dilaporkan hilang.
    batas = [m for m in re.finditer(
        r"(?:^|\n)\s*([A-Z\u00c0-\u00de][\w\u00c0-\u017f'-]{2,}),\s+(?=[A-Z\u00c0-\u00de])", teks)]
    hasil = collections.defaultdict(set)
    for i, m in enumerate(batas):
        akhir = batas[i + 1].start() if i + 1 < len(batas) else len(teks)
        potong = teks[m.end():akhir]
        tahun = re.findall(r"\b((?:1[5-9]|20)\d{2})[a-z]?\b", potong)
        if tahun:
            hasil[m.group(1).lower()].update(tahun[:1])

    # Lintasan kedua untuk entri tanpa koma setelah nama belakang, mis.
    # "Luthfi Assyaukanie. 2009.", "John Paul II. 1987.", "Zhao Tingyang. 2005."
    # Mengikat pencocokan ke awal baris memastikan hanya nama pembuka entri
    # yang diambil, bukan frase di tengah teks.
    longgar = collections.defaultdict(set)
    for m in re.finditer(
            r"(?:^|\n)\s*([A-Z\u00c0-\u00de][\w\u00c0-\u017f'\s-]+?)\.\s+((?:1[5-9]|20)\d{2})[a-z]?\.", teks):
        for t in m.group(1).lower().split():
            longgar[t].add(m.group(2))
    return hasil, longgar


def sitasi_dalam_teks(seksi):
    hasil = collections.defaultdict(set)
    for sid, _j, teks in seksi:
        if sid == "bibliography":
            continue
        for m in KURUNG.finditer(teks):
            for bagian in m.group(1).split(";"):
                b = bagian.strip().lstrip("see ").strip()
                s = SATUAN.match(b)
                if s:
                    nama = s.group("nama").strip()
                    hasil[(nama, s.group("tahun"))].add(sid)
    return hasil


def token_nama(nama):
    """SEMUA token nama yang layak dicocokkan ke bibliografi.

    Mengambil token terakhir saja salah untuk sitasi dua penulis: bibliografi
    mengurutkan pada penulis pertama, jadi "Prigogine and Stengers 1984"
    dicari sebagai "stengers" dan dilaporkan hilang padahal entrinya ada.
    Hal yang sama untuk "Tversky and Kahneman" dan "Berger and Luckmann".
    """
    return [p.lower() for p in re.split(r"\s+", nama)
            if p.lower() not in ("and", "&", "et", "al", "al.")]


def main():
    sys.stdout.reconfigure(encoding="utf-8")
    seksi = muat()
    bib_teks = next((t for i, _j, t in seksi if i == "bibliography"), "")
    ketat, longgar = entri_bibliografi(bib_teks)
    # Arah A memakai indeks gabungan supaya tidak memberi alarm palsu; arah B
    # hanya indeks ketat, karena indeks longgar penuh nama depan.
    bib = collections.defaultdict(set)
    for sumber in (ketat, longgar):
        for k, v in sumber.items():
            bib[k].update(v)
    kut = sitasi_dalam_teks(seksi)

    print("entri bibliografi (nama belakang): %d" % len(ketat))
    print("sitasi dalam teks unik           : %d" % len(kut))

    print("\n=== A. Disitasi tapi tidak ada di Bibliography ===")
    kurang = []
    for (nama, tahun), sumber in sorted(kut.items()):
        tokens = token_nama(nama)
        ada_nama = [t for t in tokens if t in bib]
        # Cocok bila salah satu token namanya ada DAN tahunnya cocok. Nama
        # ada tapi tahun beda dilaporkan terpisah - itu keliru tahun, bukan
        # sumber yang hilang.
        if not ada_nama:
            kurang.append(("nama tidak ada", nama, tahun, sorted(sumber)))
        elif not any(tahun in bib[t] for t in ada_nama):
            punya = sorted({y for t in ada_nama for y in bib[t]})
            kurang.append(("tahun beda (bib: %s)" % ",".join(punya),
                           nama, tahun, sorted(sumber)))
    if not kurang:
        print("  (tidak ada)")
    for jenis, nama, tahun, sumber in kurang:
        print("  %-28s %s %s  <- %s" % (jenis, nama, tahun, ", ".join(sumber[:4])))

    print("\n=== B. Ada di Bibliography tapi namanya tidak muncul sama sekali ===")
    # Versi pertama pemeriksaan ini mendaftar nama yang tak pernah muncul
    # sebagai sitasi kurung, dan itu SALAH sebagai temuan: sebagian besar
    # nama - Foucault, Aquinas, Machiavelli, Hayek - memang dibahas dalam
    # prosa tanpa sitasi kurung, dan itu lazim dalam tulisan filsafat.
    # Yang benar-benar berarti hanya nama yang tidak muncul di badan naskah
    # mana pun.
    # Diakritik harus diratakan lebih dulu: bibliografi menulis "Rockstrom"
    # sementara badan naskah menulis "Rockström", dan tanpa perataan entri
    # yang jelas dipakai dilaporkan yatim.
    def rata(s):
        return "".join(c for c in unicodedata.normalize("NFKD", s)
                       if not unicodedata.combining(c)).lower()

    badan = rata(" ".join(t for i, _j, t in seksi if i != "bibliography"))
    nganggur = sorted(
        k for k in ketat
        if not re.search(r"\b" + re.escape(rata(k)) + r"\b", badan))
    print("  %d dari %d nama" % (len(nganggur), len(ketat)))
    for k in nganggur:
        print("   " + k)


if __name__ == "__main__":
    main()
