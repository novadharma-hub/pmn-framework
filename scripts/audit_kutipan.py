# -*- coding: utf-8 -*-
"""Audit kutipan PMN.

  A. Kutipan pilihan di quotes.json - apakah bunyinya masih ada di naskah?
     Kutipan pilihan dipetik manual, jadi ia bisa basi diam-diam ketika
     naskahnya direvisi. Tidak ada yang gagal, tidak ada yang merah; situs
     hanya menampilkan kalimat yang sudah tidak ada lagi di dalam buku.
  B. Kutipan berulang di dalam naskah yang bunyinya berbeda.

Yang TIDAK bisa diperiksa di sini: apakah kutipan ke sumber luar berbunyi
benar. Sumbernya tidak ada di repositori ini.
"""
import collections
import difflib
import glob
import io
import json
import re
import sys

AKAR = r"D:\Master-Universe\pmn-workspace\public"


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


def rata(s):
    """Ratakan tanda kutip dan tanda pisah supaya perbandingan tidak gagal
    hanya karena tipografi - naskah memakai kurva dan em-dash, JSON kerap
    memakai lurus."""
    s = (s.replace("\u2019", "'").replace("\u2018", "'")
          .replace("\u201c", '"').replace("\u201d", '"')
          .replace("\u2014", "-").replace("\u2013", "-"))
    return re.sub(r"\s+", " ", s).strip().lower()


def main():
    sys.stdout.reconfigure(encoding="utf-8")
    seksi = muat()
    badan = rata(" ".join(t for _i, _j, t in seksi))
    kutipan = json.load(io.open(AKAR + r"\data\quotes.json", encoding="utf-8"))

    print("=== A. quotes.json vs naskah ===")
    print("kutipan pilihan: %d" % len(kutipan))
    hilang = []
    for q in kutipan:
        badan_q = rata(q.get("body", ""))
        if badan_q and badan_q in badan:
            continue
        # Cari kalimat termirip supaya bisa dibedakan: benar-benar hilang,
        # atau hanya berubah sedikit.
        potongan = badan_q[:70]
        mirip = difflib.get_close_matches(
            potongan,
            [badan[i:i + 70] for i in range(0, len(badan) - 70, 40)],
            n=1, cutoff=0.6)
        hilang.append((q.get("title", "(tanpa judul)"), badan_q, mirip))
    if not hilang:
        print("  semua kutipan pilihan masih ada persis di naskah.")
    for judul, teks, mirip in hilang:
        print("\n  TIDAK COCOK: %s" % judul)
        print("    quotes.json : %s..." % teks[:110])
        print("    termirip    : %s" % (mirip[0][:110] + "..." if mirip else "(tak ada yang mirip)"))

    print("\n=== B. Kutipan berulang dengan bunyi berbeda ===")
    # Ambil teks di dalam tanda kutip ganda, panjang sedang, lalu cari
    # pasangan yang sangat mirip tapi tidak identik.
    petik = collections.defaultdict(set)
    for sid, _j, teks in seksi:
        for m in re.finditer(r"[\u201c\"]([^\u201c\u201d\"]{40,240})[\u201d\"]", teks):
            petik[rata(m.group(1))].add(sid)
    kunci = sorted(petik)
    print("kutipan dalam tanda petik (40-240 huruf): %d unik" % len(kunci))
    dilihat, temuan = set(), 0
    for i, a in enumerate(kunci):
        for b in kunci[i + 1:]:
            if abs(len(a) - len(b)) > 40:
                continue
            r = difflib.SequenceMatcher(None, a, b).ratio()
            if 0.88 <= r < 1.0 and (a, b) not in dilihat:
                dilihat.add((a, b))
                temuan += 1
                print("\n  mirip %.0f%%  %s  vs  %s" % (
                    r * 100, sorted(petik[a]), sorted(petik[b])))
                print("    A: %s" % a[:120])
                print("    B: %s" % b[:120])
    if not temuan:
        print("  tidak ada pasangan yang mirip-tapi-berbeda.")


if __name__ == "__main__":
    main()
