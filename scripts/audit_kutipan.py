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
    sys.stdout.reconfigure(encoding="utf-8", line_buffering=True)
    seksi = muat()
    badan = rata(" ".join(t for _i, _j, t in seksi))
    kutipan = json.load(io.open(AKAR + r"\data\quotes.json", encoding="utf-8"))

    print("=== A. quotes.json vs naskah ===")
    print("kutipan pilihan: %d" % len(kutipan))
    hilang = []
    # Ambil irisan dari badan yang sudah diratakan (instan, tanpa alokasi berulang)
    step = 100
    irisan = [badan[i:i + 100] for i in range(0, len(badan) - 100, step)]
    for q in kutipan:
        badan_q = rata(q.get("body", ""))
        if badan_q and badan_q in badan:
            continue
        potongan = badan_q[:70]
        kata_q = set(potongan.split())
        kandidat = [s for s in irisan if len(kata_q.intersection(s.split())) >= max(1, int(len(kata_q) * 0.4))]
        mirip = difflib.get_close_matches(potongan, kandidat, n=1, cutoff=0.6) if kandidat else []
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
        len_a = len(a)
        kata_a = set(a.split())
        for b in kunci[i + 1:]:
            len_b = len(b)
            if abs(len_a - len_b) > int(max(len_a, len_b) * 0.12):
                continue
            if len(kata_a.intersection(b.split())) < len(kata_a) * 0.7:
                continue
            sm = difflib.SequenceMatcher(None, a, b)
            r = sm.ratio()
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
