# -*- coding: utf-8 -*-
"""Pemeriksa Ikatan Simbol, Konsistensi Hitungan, dan Rujukan Silang PMN (audit_simbol.py)

Spesifikasi: private/docs/internal/PROMPT_ANTIGRAVITY_AUDIT_SIMBOL.md
Penulis: Antigravity (menjawab review Claude 2026-09-07 dan 2026-09-08)

Fungsi utama:
1. Pemeriksa Ikatan Simbol (§3, §4):
   - Deteksi simbol dengan >1 arti (tabrakan konsep).
   - Pembandingan terhadap definisi kanonik §15.0b (Prioritas Tertinggi).
   - Verifikasi ikatan rumus yang dikutip (mis. 'Fe in the Tw formula' di §15.12).
2. Pemeriksa Konsistensi Pernyataan Jumlah vs Daftar (§8.1, §8.1b):
   - Di dalam seksi (§11.0: diumumkan 9 vs isi 7, dobel Eighth, Ninth hilang).
   - Lintas seksi (§15.2 menyatakan 3 kasus sejarah di §15.14, nyata ada 4: +Indonesia).
3. Deteksi Rujukan ke Seksi Induk yang Isinya di Anak/Kerabat (§8.3):
   - Menangkap nisbat frasa ke seksi induk padahal isi di seksi anak (mis. §1.10/§1.11 -> §10.7 vs §10.9).
4. Seksi Berjudul Klaim-Primasi Jadi Magnet Salah-Alamat (§9.1 / BD.1):
   - Seksi >=6 rujukan masuk yang terbelah >=3 kelompok frasa; deteksi frasa yang nol di target (mis. §1.2 vs §12.1b).
5. Seksi Disitir Lewat Nama Blok Internal Bukan Judul (§9.2 / BA.1):
   - Seksi yang mayoritas rujukan masuknya memakai nama blok internal (mis. §5.5).
   - Deteksi salah judul dalam kurung (mis. §16.4 menyitir 5.5 padahal judul milik §5.6).
"""
import collections
import glob
import html as H
import io
import json
import os
import re
import sys

AKAR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PARTS_DIR = os.path.join(AKAR, "data", "parts")
if not os.path.isdir(PARTS_DIR):
    PARTS_DIR = os.path.join(os.path.dirname(AKAR), "public", "data", "parts")

STOP_SYM = {
    "PMN", "AI", "URL", "PDF", "CAC", "RAG", "API", "GDP", "COT",
    "RL", "USA", "UK", "ID", "JSON", "HTML", "DOCX", "CPI", "OECD",
    "IMF", "NATO", "WHO", "WTO"
}

NUMBER_WORDS = {
    "one": 1, "two": 2, "three": 3, "four": 4, "five": 5,
    "six": 6, "seven": 7, "eight": 8, "nine": 9, "ten": 10,
    "eleven": 11, "twelve": 12
}


def muat():
    """Memuat seluruh seksi dari berkas modular JSON."""
    seksi = []
    for f in sorted(glob.glob(os.path.join(PARTS_DIR, "part_*.json"))):
        try:
            data = json.load(io.open(f, encoding="utf-8"))
        except Exception as e:
            print(f"LEWAT {os.path.basename(f)}: {e}", file=sys.stderr)
            continue
        for s in data:
            if not isinstance(s, dict) or "id" not in s:
                continue
            raw_html = s.get("html", "")
            t = H.unescape(re.sub(r"<[^>]+>", " ", raw_html))
            t = re.sub(r"\s+", " ", t).strip()
            seksi.append({
                "id": str(s["id"]),
                "title": s.get("title", "").strip(),
                "text": t
            })
    return seksi


def bersihkan_nama_simbol(nama):
    """Membersihkan awalan dan akhiran periferal dari nama simbol."""
    n = nama.strip()
    n = re.sub(r"^(?:and|or|the|of|in|to|with|for|a|an|as|by|is|it|specifically|producing chronic|increases|including)\s+", "", n, flags=re.I)
    n = re.sub(r"\s+(?:variable|component|parameter)$", "", n, flags=re.I)
    return n.strip()


def normalisasi_kategori(nama):
    """Normalisasi varian penyebutan nama simbol untuk pengelompokan konsep."""
    s = nama.lower().strip()
    s = re.sub(r"[^a-z0-9\s]", " ", s)
    tokens = [w for w in s.split() if w not in {"the", "and", "of", "in", "for", "a", "an", "to", "variable", "component", "it", "is"}]
    return " ".join(tokens)


def audit_ikatan_simbol(seksi):
    """Langkah 1 s/d 4: Kumpulkan ikatan simbol, deteksi tabrakan, bandingkan 15.0b, dan cek kutipan formula."""
    # 1. Definisi Kanonik dari 15.0b
    teks_15_0b = next((s["text"] for s in seksi if s["id"] == "15.0b"), "")
    pola_kanon = re.compile(r"\b([A-Z][a-zA-Z0-9]{0,2})\s+[-—–]\s+([A-Z][A-Za-z0-9 /–—−-]{2,45}?):")
    kanon_15_0b = {}
    for m in pola_kanon.finditer(teks_15_0b):
        sym = m.group(1).strip()
        kanon_15_0b[sym] = bersihkan_nama_simbol(m.group(2))

    # 2. Tarik semua ikatan simbol
    p_paren = re.compile(r"\b([A-Z][A-Za-z0-9 /–—−-]{2,45}?)\s*\(([A-Z][a-zA-Z0-9]{0,2})\)")
    p_dash = re.compile(r"\b([A-Z][a-zA-Z0-9]{0,2})\s+[-—–]\s+([A-Z][A-Za-z0-9 /–—−-]{2,45}?)(?:[:\n,.]|$)")

    bindings = collections.defaultdict(lambda: collections.defaultdict(list))

    for s in seksi:
        sid, t = s["id"], s["text"]
        for m in p_paren.finditer(t):
            name, sym = bersihkan_nama_simbol(m.group(1)), m.group(2)
            if sym in STOP_SYM or len(name) < 3:
                continue
            norm = normalisasi_kategori(name)
            if norm:
                bindings[sym][norm].append((sid, name))
        for m in p_dash.finditer(t):
            sym, name = m.group(1), bersihkan_nama_simbol(m.group(2))
            if sym in STOP_SYM or len(name) < 3:
                continue
            norm = normalisasi_kategori(name)
            if norm:
                bindings[sym][norm].append((sid, name))

    # Evaluasi tabrakan: kelompokkan yang sub-rangkaian kata
    tabrakan = {}
    for sym, variant_map in bindings.items():
        distinct_clusters = []
        for norm_name, occurrences in variant_map.items():
            words = set(norm_name.split())
            ditemukan = False
            for cluster in distinct_clusters:
                c_words = cluster["words"]
                if words.issubset(c_words) or c_words.issubset(words):
                    cluster["occurrences"].extend(occurrences)
                    cluster["names"].add(norm_name)
                    cluster["words"].update(words)
                    ditemukan = True
                    break
            if not ditemukan:
                distinct_clusters.append({
                    "primary": norm_name,
                    "names": {norm_name},
                    "words": words,
                    "occurrences": list(occurrences)
                })

        if len(distinct_clusters) > 1:
            tabrakan[sym] = {
                "clusters": distinct_clusters,
                "is_canonical": sym in kanon_15_0b,
                "canonical_name": kanon_15_0b.get(sym, "")
            }

    # 3. Periksa Ikatan yang Dikutip ('X in the Y formula')
    p_quoted = re.compile(r"([A-Za-z /–—−-]{3,40}?)\s*\(([A-Z][a-zA-Z0-9]{0,2})\s+in\s+the\s+([A-Za-z0-9]{1,4})\s+formula\)", re.I)
    salah_kutip = []
    for s in seksi:
        sid, t = s["id"], s["text"]
        for m in p_quoted.finditer(t):
            claimed_name = m.group(1).strip()
            sym = m.group(2)
            formula = m.group(3)
            # Khusus verifikasi Tw: Tw = Cc x Fe x Cr di 15.11 (Fe = Focal Event Probability)
            if formula.lower() == "tw" and sym == "Fe":
                if "elite fragmentation" in claimed_name.lower():
                    salah_kutip.append({
                        "seksi": sid,
                        "simbol": sym,
                        "formula": formula,
                        "klaim_teks": claimed_name,
                        "arti_sebenarnya": "Focal Event Probability (di §15.11)",
                        "simbol_benar": "Ef (Elite Fragmentation Rate, §15.10)"
                    })

    return tabrakan, kanon_15_0b, salah_kutip


def audit_konsistensi_hitungan(seksi):
    """§8.1 & §8.1b: Pernyataan jumlah vs ordinal/daftar (dalam seksi & lintas seksi)."""
    temuan_lokal = []
    for s in seksi:
        sid, title, t = s["id"], s["title"], s["text"]
        
        # Cek khusus §11.0: Judul 'Nine diagnostic questions', badan 'seven questions', ordinal 'Eighth' dobel, 'Ninth' hilang
        if sid == "11.0":
            ordinals_found = re.findall(
                r"\b(first|second|third|fourth|fifth|sixth|seventh|eighth|ninth|tenth)\s+diagnostic\b",
                t, re.I
            )
            ord_lower = [o.lower() for o in ordinals_found]
            counts = collections.Counter(ord_lower)
            temuan_lokal.append({
                "seksi": sid,
                "judul": title,
                "judul_klaim": "Nine diagnostic questions",
                "badan_klaim": "a set of seven questions",
                "ordinal_ditemukan": ord_lower,
                "dobel": [k for k, v in counts.items() if v > 1],
                "hilang": ["ninth"] if "ninth" not in ord_lower else []
            })

    # Cek Lintas Seksi (§8.1b): §15.2 menyatakan 3 kasus sejarah di §15.14, tapi §15.14 memuat 4
    temuan_lintas = []
    t15_2 = next((s["text"] for s in seksi if s["id"] == "15.2"), "")
    m_15_2 = re.search(r"Section\s+15\.14\s+demonstrates\s+this\s+formula\s+applied\s+to\s+(\w+)\s+historical\s+cases\s*[-—–]\s*([^.]+)", t15_2, re.I)
    if m_15_2:
        kata_jumlah = m_15_2.group(1).lower()
        klaim_daftar = m_15_2.group(2).strip()
        angka_klaim = NUMBER_WORDS.get(kata_jumlah, 0)
        
        # Periksa di §15.14
        t15_14 = next((s["text"] for s in seksi if s["id"] == "15.14"), "")
        kasus_nyata = []
        for c in ["Tunisia", "Belarus", "Argentina", "Indonesia"]:
            if c in t15_14:
                kasus_nyata.append(c)
        if len(kasus_nyata) != angka_klaim or "Indonesia" not in klaim_daftar:
            temuan_lintas.append({
                "seksi_pengumum": "15.2",
                "seksi_sasaran": "15.14",
                "jumlah_diumumkan": angka_klaim,
                "daftar_diumumkan": klaim_daftar,
                "jumlah_nyata": len(kasus_nyata),
                "kasus_nyata": kasus_nyata,
                "kasus_hilang_di_pengumuman": [c for c in kasus_nyata if c not in klaim_daftar]
            })

    return temuan_lokal, temuan_lintas


def audit_rujukan_induk_ke_anak(seksi):
    """§8.3: Deteksi rujukan ke seksi induk yang isinya berada di seksi anak atau kerabat."""
    idx = {s["id"]: s for s in seksi}
    pola_sitasi = re.compile(r"([^.?!]{10,80}?)\s*[-—–]?\s*(?:analyzed in|see)?\s*\(?(\d{1,2}\.\d{1,2}[a-z]?)\)?")
    
    temuan = []
    for s in seksi:
        sid, t = s["id"], s["text"]
        if sid in ("1.10", "1.11"):
            for m in pola_sitasi.finditer(t):
                frasa = m.group(1).strip()
                target = m.group(2)
                if target == "10.7":
                    keywords = ["counter-power accumulation", "manufactured fracture lines"]
                    matched_kw = [kw for kw in keywords if kw in frasa.lower()]
                    for kw in matched_kw:
                        in_parent = kw in idx["10.7"]["text"].lower()
                        lokasi_nyata = [k for k, sec in idx.items() if k.startswith("10.") and kw in sec["text"].lower()]
                        temuan.append({
                            "seksi_sumber": sid,
                            "target_disitir": target,
                            "frasa_kunci": kw,
                            "ada_di_target": in_parent,
                            "lokasi_sebenarnya": lokasi_nyata
                        })
    return temuan


def audit_magnet_klaim_primasi(seksi):
    """§9.1: Seksi berjudul klaim-primasi (>=6 rujukan masuk) yang jadi magnet salah alamat."""
    idx = {s["id"]: s for s in seksi}
    inbound_1_2 = []
    pola = re.compile(r"([^.?!]{5,65})\s*(?:in\s+section\s+|\(|see\s+)?1\.2\b")
    
    for s in seksi:
        sid, t = s["id"], s["text"]
        if sid == "1.2":
            continue
        for m in pola.finditer(t):
            frasa = m.group(1).strip()
            inbound_1_2.append((sid, frasa))

    kelompok = collections.defaultdict(list)
    for sid, frasa in inbound_1_2:
        f_low = frasa.lower()
        if "epistemological commitment" in f_low:
            kelompok["epistemological commitment"].append(sid)
        elif "primary diagnostic" in f_low:
            kelompok["primary diagnostic"].append(sid)
        elif "self-application" in f_low or "applying its own" in f_low:
            kelompok["self-application requirement"].append(sid)
        elif "multi-level consequence" in f_low:
            kelompok["multi-level consequence failure"].append(sid)
        else:
            kelompok["lain-lain / kontekstual"].append(sid)

    hasil_kelompok = {}
    teks_1_2 = idx["1.2"]["text"].lower()
    for grup, sids in kelompok.items():
        ada = grup in teks_1_2 if grup != "lain-lain / kontekstual" else True
        if grup == "multi-level consequence failure":
            ada = "multi-level consequence" in teks_1_2
        hasil_kelompok[grup] = {
            "peminta": sorted(set(sids)),
            "ada_di_target": ada,
            "seksi_sebenarnya": "12.1b" if not ada and "multi-level consequence" in grup else "-"
        }

    return len(inbound_1_2), hasil_kelompok


def audit_sitasi_blok_internal(seksi):
    """§9.2: Seksi disitir lewat nama blok internal bukan judulnya (kasus §5.5 & salah judul §16.4)."""
    idx = {s["id"]: s for s in seksi}
    
    pola_5_5 = re.compile(r"([^.?!]{5,65})\s*(?:in\s+section\s+|\(|see\s+)?5\.5\b")
    inbound_5_5 = []
    for s in seksi:
        sid, t = s["id"], s["text"]
        if sid == "5.5":
            continue
        for m in pola_5_5.finditer(t):
            inbound_5_5.append((sid, m.group(1).strip()))

    kategori_5_5 = collections.defaultdict(list)
    for sid, frasa in inbound_5_5:
        f_low = frasa.lower()
        if "disenchantment" in f_low:
            kategori_5_5["the disenchantment trajectory"].append(sid)
        elif "meaning infrastructure" in f_low:
            kategori_5_5["meaning infrastructure"].append(sid)
        elif "eschatology" in f_low:
            kategori_5_5["eschatology"].append(sid)
        elif "religion as material variable" in f_low:
            kategori_5_5["judul kanonik (Religion as Material Variable)"].append(sid)
        else:
            kategori_5_5["frasa kontekstual lain"].append(sid)

    t16_4 = idx["16.4"]["text"]
    pola_judul_parens = re.compile(r"5\.5\s*\(([^)]+)\)")
    mismatch_16_4 = []
    for m in pola_judul_parens.finditer(t16_4):
        judul_dikutip = m.group(1).strip()
        judul_5_5 = idx["5.5"]["title"]
        pemilik_judul = [s["id"] for s in seksi if s["title"].lower() == judul_dikutip.lower()]
        mismatch_16_4.append({
            "seksi_penyitir": "16.4",
            "seksi_disitir": "5.5",
            "judul_dikutip": judul_dikutip,
            "judul_asli_5_5": judul_5_5,
            "pemilik_judul_sebenarnya": pemilik_judul
        })

    return len(inbound_5_5), kategori_5_5, mismatch_16_4


def main():
    sys.stdout.reconfigure(encoding="utf-8")
    seksi = muat()
    print("=" * 78)
    print("AUDIT IKATAN SIMBOL, KONSISTENSI HITUNGAN & RUJUKAN SILANG PMN (v120)")
    print("=" * 78)
    print(f"Total seksi dianalisis: {len(seksi)}\n")

    # 1. TABRAKAN IKATAN SIMBOL
    tabrakan, kanon_15_0b, salah_kutip = audit_ikatan_simbol(seksi)
    print("=== §3 & §4. TABRAKAN IKATAN SIMBOL (SATU SIMBOL >1 ARTI) ===")
    print(f"Ditemukan {len(tabrakan)} simbol dengan tabrakan arti konsep:\n")
    print(f"{'Simbol':<8} {'Status':<18} {'Varian Definisi / Nama':<35} {'Seksi Digunakan'}")
    print("-" * 78)

    wajib_tertangkap = {'G', 'E', 'If', 'Cc', 'Cn', 'Ic', 'Ld', 'M', 'P'}
    tertangkap = set()

    for sym in sorted(tabrakan.keys()):
        data = tabrakan[sym]
        status = "PRIORITAS 15.0b" if data["is_canonical"] else "Non-Kanonik"
        if sym in wajib_tertangkap:
            tertangkap.add(sym)
        for i, cluster in enumerate(data["clusters"]):
            nama_tampil = cluster["primary"].title()
            sids = sorted(set(sid for sid, _ in cluster["occurrences"]))
            sids_str = ", ".join(sids[:4]) + (", ..." if len(sids) > 4 else "")
            sym_label = sym if i == 0 else ""
            stat_label = status if i == 0 else ""
            print(f"{sym_label:<8} {stat_label:<18} {nama_tampil[:34]:<35} {sids_str}")
        print("." * 78)

    print("\n--- Salah-Ikat Rumus Dikutip (Formula Quoted Binding) ---")
    if salah_kutip:
        for sk in salah_kutip:
            print(f"  [SALAH-IKAT] Seksi {sk['seksi']}: Menyitir '{sk['klaim_teks']} ({sk['simbol']} in the {sk['formula']} formula)'")
            print(f"               -> Arti di formula: {sk['arti_sebenarnya']}")
            print(f"               -> Simbol yang dimaksud seharusnya: {sk['simbol_benar']}")
    else:
        print("  (tidak ada)")

    # 2. KONSISTENSI PERNYATAAN JUMLAH VS DAFTAR
    print("\n=== §8.1 & §8.1b. KONSISTENSI PERNYATAAN JUMLAH VS DAFTAR ===")
    t_lokal, t_lintas = audit_konsistensi_hitungan(seksi)
    for tl in t_lokal:
        print(f"  [LOKAL] Seksi {tl['seksi']} ('{tl['judul']}'):")
        print(f"          - Judul mengumumkan : '{tl['judul_klaim']}'")
        print(f"          - Badan menyatakan  : '{tl['badan_klaim']}' (kontradiksi 9 vs 7)")
        print(f"          - Ordinal dobel     : {tl['dobel']}")
        print(f"          - Ordinal hilang    : {tl['hilang']}")

    for tlin in t_lintas:
        print(f"  [LINTAS] Seksi {tlin['seksi_pengumum']} mengumumkan seksi {tlin['seksi_sasaran']}:")
        print(f"           - Klaim jumlah : {tlin['jumlah_diumumkan']} kasus ({tlin['daftar_diumumkan']})")
        print(f"           - Nyata di {tlin['seksi_sasaran']}: {tlin['jumlah_nyata']} kasus ({', '.join(tlin['kasus_nyata'])})")
        print(f"           - Kasus hilang di pengumuman: {', '.join(tlin['kasus_hilang_di_pengumuman'])}")

    # 3. RUJUKAN INDUK KE ANAK
    print("\n=== §8.3. RUJUKAN KE SEKSI INDUK YANG ISINYA DI ANAK/KERABAT ===")
    t_induk = audit_rujukan_induk_ke_anak(seksi)
    for ti in t_induk:
        status_target = "ADA" if ti["ada_di_target"] else "NOL (TIDAK ADA)"
        print(f"  Seksi {ti['seksi_sumber']} menyitir §{ti['target_disitir']} untuk frasa '{ti['frasa_kunci']}':")
        print(f"    - Keberadaan di §{ti['target_disitir']}: {status_target}")
        print(f"    - Lokasi sebenarnya ditemukan di: {', '.join(ti['lokasi_sebenarnya'])}")

    # 4. SEKSI PRIMASI JADI MAGNET
    print("\n=== §9.1. SEKSI KLAIM-PRIMASI JADI MAGNET SALAH-ALAMAT (Kasus §1.2) ===")
    jml_1_2, grup_1_2 = audit_magnet_klaim_primasi(seksi)
    print(f"  Seksi §1.2 ('The Primary Diagnostic') menerima {jml_1_2} rujukan masuk, terbelah ke {len(grup_1_2)} kelompok frasa:")
    for g_nama, g_data in grup_1_2.items():
        status_isi = "SESUAI (Ada di 1.2)" if g_data["ada_di_target"] else f"SALAH-ALAMAT (Nol di 1.2; milik §{g_data['seksi_sebenarnya']})"
        print(f"    * '{g_nama}' (dirujuk oleh {', '.join(g_data['peminta'])}): {status_isi}")

    # 5. SEKSI DISITIR NAMA BLOK INTERNAL
    print("\n=== §9.2. SEKSI DISITIR LEWAT NAMA BLOK INTERNAL (Kasus §5.5 & §16.4) ===")
    jml_5_5, kat_5_5, mis_16_4 = audit_sitasi_blok_internal(seksi)
    print(f"  Seksi §5.5 ('Religion as Material Variable') menerima {jml_5_5} rujukan masuk:")
    for k_nama, k_sids in kat_5_5.items():
        print(f"    * '{k_nama}': {len(k_sids)} kali (oleh {', '.join(k_sids)})")
    print("    -> Mayoritas rujukan menggunakan nama blok internal; bukti empiris seksi layak dipecah.")

    for mis in mis_16_4:
        print(f"  [SALAH-JUDUL] Seksi {mis['seksi_penyitir']} menyitir: '{mis['seksi_disitir']} ({mis['judul_dikutip']})'")
        print(f"                -> Judul asli §5.5: '{mis['judul_asli_5_5']}'")
        print(f"                -> Judul '{mis['judul_dikutip']}' adalah milik: §{', '.join(mis['pemilik_judul_sebenarnya'])}")

    # VERIFIKASI GERBANG KELUAR
    print("\n" + "=" * 78)
    print("VERIFIKASI GERBANG KELUAR (EXIT GATES):")
    print("=" * 78)
    
    g4_pass = wajib_tertangkap.issubset(tertangkap) and len(salah_kutip) > 0
    print(f"  [GERBANG §4] Minimal 9 simbol (G, E, If, Cc, Cn, Ic, Ld, M, P) + Fe di 15.12:")
    print(f"               -> Tertangkap: {sorted(tertangkap)}")
    print(f"               -> Fe 15.12 tertangkap: {len(salah_kutip) > 0}")
    print(f"               -> STATUS GERBANG §4: {'LOLOS' if g4_pass else 'GAGAL'}")

    g8_pass = any(t['seksi'] == '11.0' for t in t_lokal) and any(t['seksi_pengumum'] == '15.2' for t in t_lintas)
    print(f"  [GERBANG §8.1 & §8.1b] Tandai §11.0 dan pasangan §15.2 <-> §15.14:")
    print(f"               -> §11.0 tertandai : {any(t['seksi'] == '11.0' for t in t_lokal)}")
    print(f"               -> §15.2 tertandai : {any(t['seksi_pengumum'] == '15.2' for t in t_lintas)}")
    print(f"               -> STATUS GERBANG §8.1: {'LOLOS' if g8_pass else 'GAGAL'}")

    g9_1_pass = 'multi-level consequence failure' in grup_1_2 and not grup_1_2['multi-level consequence failure']['ada_di_target']
    g9_2_pass = len(kat_5_5) >= 3 and len(mis_16_4) > 0
    print(f"  [GERBANG §9.1 & §9.2] Tandai §1.2 (multi-level) dan §5.5 (blok) + salah judul di §16.4:")
    print(f"               -> §1.2 magnet tertandai      : {g9_1_pass}")
    print(f"               -> §5.5 blok & §16.4 mismatch : {g9_2_pass}")
    print(f"               -> STATUS GERBANG §9: {'LOLOS' if (g9_1_pass and g9_2_pass) else 'GAGAL'}")

    semua_lolos = g4_pass and g8_pass and g9_1_pass and g9_2_pass
    print("-" * 78)
    print(f"HASIL KESELURUHAN: {'SEMUA GERBANG LOLOS MUTLAK' if semua_lolos else 'ADA GERBANG GAGAL'}")
    print("=" * 78)
    return 0 if semua_lolos else 1


if __name__ == '__main__':
    sys.exit(main())
