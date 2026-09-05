# -*- coding: utf-8 -*-
"""Audit isi naskah PMN: rujukan silang, definisi kanonik, dan angka yang
menyebut jumlah.

Ini BUKAN audit gaya. Yang dicari hanya hal yang bisa dibuktikan salah dari
naskah itu sendiri: rujukan ke seksi yang tidak ada, definisi kanonik yang
tidak dipatuhi glosarium, dan klaim jumlah yang tidak cocok dengan isinya.
"""
import collections
import glob
import io
import json
import os
import re
import sys

AKAR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

ANGKA = {"two": 2, "three": 3, "four": 4, "five": 5, "six": 6, "seven": 7,
         "eight": 8, "nine": 9, "ten": 10, "eleven": 11, "twelve": 12}


def muat():
    seksi = []
    for f in sorted(glob.glob(AKAR + r"\data\parts\part_*.json")):
        for s in json.load(io.open(f, encoding="utf-8")):
            t = re.sub(r"<[^>]+>", " ", s["html"] or "")
            t = (t.replace("&amp;", "&").replace("&#x27;", "'")
                  .replace("&quot;", '"').replace("&lt;", "<")
                  .replace("&gt;", ">").replace("&nbsp;", " "))
            seksi.append((s["id"], s["title"], re.sub(r"\s+", " ", t)))
    return seksi


def rujukan_menggantung(seksi):
    """Rujukan (x.y) yang tidak menunjuk seksi mana pun."""
    ada = {sid for sid, _j, _t in seksi}
    pola = re.compile(r"\((?:see\s+|sections?\s+)?(\d+\.\d+[a-z]*(?:-[ivx]+)?)\)", re.I)
    hasil = collections.defaultdict(list)
    for sid, _j, teks in seksi:
        for m in pola.finditer(teks):
            if m.group(1) not in ada:
                hasil[m.group(1)].append(sid)
    return hasil


def klaim_jumlah(seksi):
    """Klaim 'the five-stage X' / 'seven Y' yang bisa dihitung di tempat."""
    hasil = []
    pola = re.compile(
        r"\b(two|three|four|five|six|seven|eight|nine|ten|eleven|twelve)"
        r"[- ](stage|step|dimension|principle|question|diagnostic|position|"
        r"tension|criteri\w+|type|failure|trigger|deficit)\w*\b", re.I)
    for sid, judul, teks in seksi:
        for m in pola.finditer(teks):
            kata, benda = m.group(1).lower(), m.group(2).lower()
            n = ANGKA[kata]
            # Hanya daftar dengan penanda BERLABEL yang bisa dihitung dengan
            # aman, mis. "Stage 3 - ...". Versi longgar yang menghitung
            # penanda ordinal atau bernomor di mana pun dalam seksi
            # menghasilkan puluhan positif palsu, karena satu seksi lazim
            # memuat beberapa daftar sekaligus.
            if benda not in ("stage", "step"):
                continue
            label = benda.capitalize()
            nomor = {int(x) for x in
                     re.findall(r"\b" + label + r" (\d)\b\s*[-—:.)]", teks)}
            # Satu penanda saja bukan daftar - itu rujukan sambil lalu.
            if len(nomor) >= 2 and len(nomor) != n:
                hasil.append((sid, judul, m.group(0), n, len(nomor)))
    return hasil


def definisi_kanonik(seksi):
    """Ambil definisi kanonik 15.0b lalu bandingkan namanya dengan gl.json."""
    teks = next((t for i, _j, t in seksi if i == "15.0b"), "")
    pola = re.compile(r"\b([A-Z][a-z]?(?:c)?)\s+[-\u2014]\s+([A-Z][A-Za-z /-]{2,44}?):")
    kanon = [(m.group(1), m.group(2).strip()) for m in pola.finditer(teks)]
    gl = json.load(io.open(AKAR + r"\data\gl.json", encoding="utf-8"))
    kunci = {k.lower(): k for k in gl}

    # Ambil badan definisi kanonik tiap istilah supaya isinya, bukan hanya
    # namanya, bisa dibandingkan. 15.0b menyatakan dirinya kanonik, jadi
    # glosarium yang berbunyi lain adalah cacat - bukan variasi gaya.
    potong = list(pola.finditer(teks))
    badan = {}
    for i, m in enumerate(potong):
        akhir = potong[i + 1].start() if i + 1 < len(potong) else len(teks)
        badan[m.group(2).strip().lower()] = teks[m.end():akhir].strip()

    def kata(s):
        return {w for w in re.findall(r"[a-z]{5,}", s.lower())}

    hilang, ada, menyimpang = [], [], []
    for simbol, nama in kanon:
        n = nama.lower()
        # Urutan preferensi penting: tanpa ini 'Visibility Suppression'
        # tersambung ke 'meritocracy as visibility suppression' hanya karena
        # kunci itu kebetulan memuat namanya.
        cocok = ([k for k in kunci if k == n]
                 or [k for k in kunci if k.startswith(n + " (")]
                 or [k for k in kunci if n in k])
        if not cocok:
            hilang.append((simbol, nama, []))
            continue
        ada.append((simbol, nama, cocok[:2]))
        k_kanon, k_gl = kata(badan.get(n, "")), kata(gl[kunci[cocok[0]]])
        if k_kanon and k_gl:
            # Arah perbandingan penting. Mengukur berapa banyak KANON yang
            # terulang di glosarium akan menghukum ringkasan yang padat -
            # entri yang benar sekalipun hanya memuat sebagian kecil dari
            # badan kanonik yang panjang. Yang perlu ditanyakan sebaliknya:
            # berapa banyak isi glosarium yang TIDAK ada di kanon, karena di
            # situlah definisi tandingan dan pertentangan muncul.
            himpit = len(k_gl & k_kanon) / len(k_gl)
            if himpit < 0.45:
                menyimpang.append((simbol, nama, kunci[cocok[0]], himpit))
    return kanon, ada, hilang, menyimpang


def main():
    sys.stdout.reconfigure(encoding="utf-8")
    seksi = muat()
    print("seksi:", len(seksi))

    print("\n=== A. Rujukan silang yang menggantung ===")
    gantung = rujukan_menggantung(seksi)
    if not gantung:
        print("  (tidak ada)")
    for target, sumber in sorted(gantung.items()):
        print("  (%s) tidak ada -- dirujuk dari: %s" % (target, ", ".join(sorted(set(sumber)))))

    print("\n=== B. Klaim jumlah yang tidak cocok ===")
    klaim = klaim_jumlah(seksi)
    if not klaim:
        print("  (tidak ada)")
    for sid, judul, frasa, disebut, nyata in klaim:
        print("  %-8s %-46s '%s' -> disebut %d, ada %d" % (sid, judul[:46], frasa, disebut, nyata))

    print("\n=== C. Definisi kanonik 15.0b vs glosarium ===")
    kanon, ada, hilang, menyimpang = definisi_kanonik(seksi)
    print("  istilah kanonik ditemukan: %d | ada di glosarium: %d | belum: %d"
          % (len(kanon), len(ada), len(hilang)))
    for simbol, nama, _c in hilang:
        print("    BELUM      %-4s %s" % (simbol, nama))
    for simbol, nama, k, himpit in menyimpang:
        print("    MENYIMPANG %-4s %-30s entri '%s' (himpitan kata %.0f%%)"
              % (simbol, nama, k, himpit * 100))
    if not hilang and not menyimpang:
        print("  semua definisi kanonik terwakili dan sejalan.")


if __name__ == "__main__":
    main()
