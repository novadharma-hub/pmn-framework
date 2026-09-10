#!/usr/bin/env python3
"""Importir Pilot Track C (F4) — DOCX v120 → sumber ber-provenance.

Spesifikasi: private/restrukturisasi/16E_PILOT_TRACK_C.md
Brief jalur:  private/docs/internal/PROMPT_ANTIGRAVITY_PILOT_TRACK_C.md

APA YANG BERKAS INI LAKUKAN
  Membaca DOCX v120 (READ-ONLY), memotongnya jadi seksi memakai JALUR KODE YANG
  SAMA dengan import_pmn_docx.py, mencatat w14:paraId tiap paragraf, lalu
  menulis sumber ber-provenance untuk 26 seksi Bagian VI + VII.

APA YANG BERKAS INI TIDAK LAKUKAN
  Tidak mengubah satu kata pun naskah. Tidak menyentuh public/data/.
  Tidak mengeksekusi catatan_tulis_ulang - ia dibawa sebagai penumpang (16E §5.3).
  Kalau importir ini "memperbaiki" sesuatu, G5 GAGAL - dan itu benar.

KENAPA MEREPLIKASI build_parts ALIH-ALIH MEMANGGILNYA
  build_parts() menggabung paragraf jadi satu string html dan MEMBUANG elemen
  XML-nya, sehingga paraId hilang. Kita butuh pasangan (paraId -> seksi).
  Replikasi ini karena itu WAJIB dibuktikan setara: --verifikasi membandingkan
  html hasil replikasi terhadap public/data/parts.json v120 seksi demi seksi.
  Kalau satu seksi saja berbeda, replikasinya salah dan importir menolak jalan.
"""

from __future__ import annotations

import argparse
import json
import re
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
SCRIPTS = HERE.parent
if str(SCRIPTS) not in sys.path:
    sys.path.insert(0, str(SCRIPTS))

import import_pmn_docx as imp  # noqa: E402
from pilot_schema import validate_corpus, validate_parts  # noqa: E402

W14_PARAID = "{http://schemas.microsoft.com/office/word/2010/wordml}paraId"

PILOT_PARTS = ("VI", "VII")

# Sumber: 16E §2 - Bagian VI dan VII keduanya Lapis 1 menurut aturan genre
# blueprint §5, dan tak satu pun 26 seksi masuk pengecualian bernama (16E §6).
PILOT_LAPIS = 1
PILOT_TOPIK = "kekuasaan, capture, legitimasi"


# --------------------------------------------------------------------------
# Replikasi build_parts yang mempertahankan paraId
# --------------------------------------------------------------------------
def build_parts_with_paraids(paragraphs, toc_headings, body_start):
    """Salinan setia imp.build_parts() yang mencatat paraId per paragraf.

    Setiap cabang kontrol di bawah ini mengikuti aslinya baris demi baris.
    Satu-satunya tambahan: mencatat (paraId, html, kelas) alih-alih html saja.
    """
    toc_by_title: dict[str, str] = {}
    toc_by_id: dict[str, str] = {}
    toc_full: set[str] = set()
    for heading in toc_headings:
        toc_full.add(heading)
        if imp.parse_part_heading(heading):
            continue
        section_id, section_title = imp.parse_section_heading(heading)
        toc_by_title[section_title] = heading
        toc_by_id[section_id] = heading

    body = paragraphs[body_start:]

    parts: list[dict] = []
    current_part: dict | None = None
    current_sub: dict | None = None
    current_rows: list[dict] = []

    def flush_sub() -> None:
        nonlocal current_rows
        if current_sub is not None:
            current_sub["html"] = "\n".join(r["html"] for r in current_rows if r["html"])
            current_sub["paragraf"] = current_rows
        current_rows = []

    def find_expected_heading(text: str) -> str | None:
        if text in toc_full:
            return text
        if text in toc_by_title:
            return toc_by_title[text]
        section_id, _ = imp.parse_section_heading(text)
        if section_id in toc_by_id:
            return toc_by_id[section_id]
        if re.match(r"^\d", text):
            for heading in toc_full:
                if text.startswith(f"{heading} —") or text.startswith(f"{heading}: "):
                    return heading
            for title, heading in toc_by_title.items():
                if text.startswith(f"{title} —") or text.startswith(f"{title}: "):
                    return heading
        return None

    def row(para):
        rendered = imp.paragraph_html(para.element)
        return {
            "paraId": para.element.get(W14_PARAID),
            "html": rendered,
            "kelas": imp.paragraph_class(para.element),
        }

    for para in body:
        heading = para.text
        expected_heading = find_expected_heading(heading)

        if imp.parse_part_heading(heading):
            flush_sub()
            part_code, title = imp.parse_part_heading(heading)
            current_part = imp.start_part(parts, part_code, title)
            current_part["preambul"] = []
            current_sub = None
            continue

        if heading in {"Preface", "How to Read This Document"}:
            flush_sub()
            if current_part is None:
                current_part = imp.start_part(parts, "Preface", "Preface")
            current_sub = imp.start_sub_from_match(current_part, expected_heading or heading, heading)
            continue

        if heading in imp.BACKMATTER_HEADINGS:
            flush_sub()
            current_part = imp.start_part(parts, heading, heading)
            current_sub = imp.start_sub_from_match(current_part, expected_heading or heading, heading)
            continue

        if expected_heading is not None:
            expected_id, _ = imp.parse_section_heading(expected_heading)
            is_title_only_repeat = (
                current_part is not None
                and not re.match(r"^\d", heading)
                and any(sub["id"] == expected_id for sub in current_part["subs"])
            )
            if is_title_only_repeat:
                r = row(para)
                if r["html"]:
                    current_rows.append(r)
                continue

            flush_sub()
            if current_part is None:
                raise ValueError(f"Encountered section before any part: {heading}")
            current_sub = imp.start_sub_from_match(current_part, expected_heading, heading)
            continue

        if current_sub is None:
            # DI SINILAH build_parts() ASLINYA MEMBUANG PARAGRAF.
            # Sesudah judul Bagian, current_sub = None. Paragraf yang berdiri
            # sebelum judul seksi pertama jatuh ke `continue` dan hilang dari
            # terbitan - sembilan paragraf, 1.053 kata, lima Bagian
            # (31_PARAGRAF_HILANG_DARI_TERBITAN.md).
            #
            # Kita TANGKAP, bukan buang - tetapi ke wadah TERPISAH supaya html
            # seksi tetap identik dengan parts.json v120 dan G5 tetap nol.
            if current_part is not None:
                r = row(para)
                if r["html"]:
                    current_part.setdefault("preambul", []).append(r)
            continue

        r = row(para)
        if r["html"]:
            current_rows.append(r)

    flush_sub()
    return parts


# --------------------------------------------------------------------------
def load_parts_json(path: Path) -> dict[str, str]:
    data = json.loads(path.read_text(encoding="utf-8"))
    out: dict[str, str] = {}

    def walk(node):
        if isinstance(node, dict):
            if "id" in node and "html" in node and isinstance(node["html"], str):
                out[str(node["id"])] = node["html"]
            for v in node.values():
                walk(v)
        elif isinstance(node, list):
            for v in node:
                walk(v)

    walk(data)
    return out


def verifikasi_replikasi(parts, parts_json: dict[str, str]) -> dict:
    """Gerbang mandiri: html replikasi HARUS identik dengan parts.json v120."""
    cocok, beda, hilang = 0, [], []
    for part in parts:
        for sub in part["subs"]:
            sid = str(sub["id"])
            if sid not in parts_json:
                hilang.append(sid)
                continue
            if sub.get("html", "") == parts_json[sid]:
                cocok += 1
            else:
                beda.append(sid)
    return {
        "seksi_direplikasi": sum(len(p["subs"]) for p in parts),
        "seksi_di_parts_json": len(parts_json),
        "html_identik": cocok,
        "html_beda": len(beda),
        "daftar_beda": beda[:20],
        "tak_ada_di_parts_json": hilang[:20],
    }


def hitung_sitasi(html_text: str) -> tuple[int, int, list[str]]:
    """Pencacah sitasi. Acuan v120 Bagian VI+VII: 8 kurung, 11 individual.

    Brief §3: 'Kalau pencacahmu tak menghasilkan 8 dan 11, pencacahmu yang
    salah, bukan naskahnya.' Regex pertama Claude menghasilkan 5.
    Bentuk yang memecahkannya: kurung majemuk ber-titik-koma, dan nama
    Indonesia tiga kata (Luthfi Assyaukanie 2009).
    """
    teks = re.sub(r"<[^>]+>", " ", html_text)
    kurung = re.findall(r"\(([^()]*?\b(?:1[0-9]{3}|20[0-9]{2})[a-z]?)\)", teks)
    sah = [k for k in kurung if re.search(r"[A-Za-z]", k)]
    individual: list[str] = []
    for k in sah:
        individual.extend([p.strip() for p in k.split(";") if p.strip()])
    return len(sah), len(individual), [f"({k})" for k in sah]


def part_code_of(part: dict) -> str:
    """start_part() memakai kunci 'part', BUKAN 'id'. Satu pintu supaya tak ada
    pemanggil yang memakai kunci berbeda dari pemanggil lain - bug itu sudah
    terjadi sekali dan menghasilkan 26 seksi dengan nol paragraf."""
    return str(part.get("part") or part.get("id") or part.get("code") or "")


def muat_ledger(path: Path) -> dict[str, dict]:
    """Ambil vonis, jenis klaim, dan catatan tulis-ulang dari ledger F1.

    Regex WAJIB berjangkar backtick (HANDOFF §3.13 / 18_POSISI §6.2):
    varian '^\\| .' menangkap baris header dan melempar IndexError, dan varian
    ketat '^\\| `id` \\|' membuang tiga baris yang membawa penanda di sel ID.
    """
    bt = chr(96)
    pat = re.compile(r"^\| " + bt + r"([^" + bt + r"]+)" + bt + r"[^|]*\|")
    out: dict[str, dict] = {}
    for line in path.read_text(encoding="utf-8").splitlines():
        m = pat.match(line)
        if not m:
            continue
        cells = line.strip("|").split("|")
        if len(cells) < 9:
            continue
        out[m.group(1).strip()] = {
            "vonis": cells[6].replace("*", "").strip(),
            "claim_type": cells[7].strip(),
            "catatan": cells[8].strip(),
        }
    return out


def bangun_rekaman(sub: dict, part_code: str, rel: dict) -> dict:
    sid = str(sub["id"])
    paraids = [r["paraId"] for r in sub.get("paragraf", []) if r["paraId"]]
    return {
        "canonical_id": sid,
        "legacy_section_ids": [sid],
        "book": "",                      # KOSONG - menunggu F2 (16E §5.2)
        "part": part_code,
        "lapis": PILOT_LAPIS,
        "topik_klaster": PILOT_TOPIK,
        "claim_type": None,              # diisi dari ledger oleh --ledger
        "status": None,                  # diisi dari ledger/peta oleh --ledger
        "provenance": "KANONIK",         # v120 = kanon; diuji ortogonalitasnya
        "scope_conditions": [],
        "defeaters": [],
        "symbol": None,                  # Bagian VI/VII tak berformula (16E §5.1)
        "source_paragraph_ids": paraids,
        # Pembawa TEKS. Skema 16E §2 hanya menyebut source_paragraph_ids sebab ia
        # daftar metadata; format sumber tetap harus membawa isinya, kalau tidak
        # G5 tak punya apa pun untuk diuji pulang-pergi. Tiap entri: paraId + html
        # + kelas, persis sebagaimana DOCX menghasilkannya. TIDAK diedit.
        "paragraf": [
            {"paraId": r["paraId"], "kelas": r["kelas"], "html": r["html"]}
            for r in sub.get("paragraf", [])
        ],
        "xrefs": {"keluar": rel.get(sid, []), "masuk": []},
        "catatan_tulis_ulang": "",       # DIBAWA, tidak dieksekusi
        "_ukur": {
            "paragraf": len(sub.get("paragraf", [])),
            "kelas": {},
            "kata": 0,
            "sitasi_kurung": 0,
            "sitasi_individual": 0,
        },
    }


def main() -> int:
    ap = argparse.ArgumentParser(description="Importir Pilot Track C (F4) — read-only atas DOCX v120")
    ap.add_argument("--docx", default=None, help="Path DOCX v120")
    ap.add_argument("--parts-json", default=None, help="public/data/parts.json v120 (acuan verifikasi)")
    ap.add_argument("--ledger", default=None, help="14_LEDGER_PEMBACAAN.md — isi claim_type + catatan")
    ap.add_argument("--keluaran", default=None, help="Tulis sumber pilot ke path ini (JSON)")
    ap.add_argument("--verifikasi-saja", action="store_true", help="Hanya jalankan gerbang replikasi")
    args = ap.parse_args()

    docx_path = imp.resolve_docx_path(args.docx)
    paragraphs = imp.extract_paragraphs(docx_path)
    toc_headings, body_start = imp.find_body_start(paragraphs)
    parts = build_parts_with_paraids(paragraphs, toc_headings, body_start)
    parts = imp.merge_case_d_into_compressed_core(parts)

    print(f"DOCX          : {docx_path.name}")
    print(f"paragraf teks : {len(paragraphs)}")

    # --- Gerbang replikasi: WAJIB lolos sebelum apa pun ditulis -------------
    pj_path = Path(args.parts_json) if args.parts_json else SCRIPTS.parent / "data" / "parts.json"
    parts_json = load_parts_json(pj_path)
    ver = verifikasi_replikasi(parts, parts_json)
    print("\n=== GERBANG REPLIKASI (html replikasi vs parts.json v120) ===")
    for k, v in ver.items():
        print(f"  {k:24s}: {v}")
    if ver["html_beda"] or ver["tak_ada_di_parts_json"]:
        print("\nGAGAL: replikasi build_parts tidak setara. Importir berhenti;")
        print("       tak ada keluaran ditulis. Perbaiki replikasi, bukan naskah.")
        return 1
    print("  VONIS                   : SETARA — paraId boleh dipercaya")

    if args.verifikasi_saja:
        return 0

    # --- Bangun rekaman 26 seksi pilot -------------------------------------
    rel = {}
    try:
        rel_path = SCRIPTS.parent / "data" / "rel.json"
        rel = json.loads(rel_path.read_text(encoding="utf-8"))
    except Exception:
        pass

    # Satu daftar pasangan dipakai untuk SEMUA lintasan berikutnya.
    pasangan = [(part_code_of(p), s) for p in parts if part_code_of(p) in PILOT_PARTS
                for s in p["subs"]]

    if not pasangan:
        kode = sorted({part_code_of(p) for p in parts})
        print(f"\nGAGAL: nol seksi untuk Bagian {PILOT_PARTS}. Kode Bagian terbaca: {kode}")
        return 1

    records = [bangun_rekaman(sub, code, rel) for code, sub in pasangan]

    # --- Entitas Bagian: preambul yang build_parts() buang -----------------
    bagian: list[dict] = []
    for p in parts:
        code = part_code_of(p)
        if code not in PILOT_PARTS:
            continue
        pre = p.get("preambul", [])
        bagian.append({
            "part": code,
            "part_title": p.get("title", ""),
            "source_paragraph_ids": [r["paraId"] for r in pre if r["paraId"]],
            "paragraf": [{"paraId": r["paraId"], "kelas": r["kelas"], "html": r["html"]}
                         for r in pre],
            "catatan": ("Preambul Bagian. TIDAK ADA di parts.json v120 - build_parts() "
                        "membuangnya. Lihat 31_PARAGRAF_HILANG_DARI_TERBITAN.md.")
            if pre else "",
        })
    n_pre = sum(len(b["paragraf"]) for b in bagian)
    print(f"preambul Bagian ditangkap: {n_pre} paragraf di {len(bagian)} Bagian")

    # --- Isi claim_type + catatan_tulis_ulang dari ledger F1 ---------------
    led_path = Path(args.ledger) if args.ledger else (
        SCRIPTS.parent.parent / "private" / "restrukturisasi" / "14_LEDGER_PEMBACAAN.md")
    ledger: dict[str, dict] = {}
    if led_path.exists():
        ledger = muat_ledger(led_path)
        print(f"ledger        : {len(ledger)} baris dari {led_path.name}")
    else:
        print(f"ledger        : TIDAK DITEMUKAN di {led_path} - claim_type tak terisi")

    terisi = 0
    for rec in records:
        row = ledger.get(rec["canonical_id"])
        if not row:
            continue
        terisi += 1
        if row["claim_type"]:
            rec["claim_type"] = row["claim_type"]
        rec["catatan_tulis_ulang"] = row["catatan"]   # DIBAWA, tidak dieksekusi
        rec["_vonis_f1"] = row["vonis"]
    print(f"claim_type dari ledger terisi: {terisi}/{len(records)}")

    # --- Ukur, untuk dicocokkan ke 16E_ACUAN_VI_VII.json --------------------
    total = {"paragraf": 0, "sitasi_kurung": 0, "sitasi_individual": 0, "kata": 0,
             "kelas:box-blue": 0, "kelas:box-red": 0}
    for rec, (_code, sub) in zip(records, pasangan):
        rows = sub.get("paragraf", [])
        kelas: dict[str, int] = {}
        for r in rows:
            if r["kelas"]:
                kelas[r["kelas"]] = kelas.get(r["kelas"], 0) + 1
        teks = re.sub(r"<[^>]+>", " ", sub.get("html", ""))
        kata = len(teks.split())
        nk, ni, contoh = hitung_sitasi(sub.get("html", ""))
        rec["_ukur"] = {"paragraf": len(rows), "kelas": kelas, "kata": kata,
                        "sitasi_kurung": nk, "sitasi_individual": ni, "contoh_sitasi": contoh}
        total["paragraf"] += len(rows)
        total["kata"] += kata
        total["sitasi_kurung"] += nk
        total["sitasi_individual"] += ni
        for k, v in kelas.items():
            total[f"kelas:{k}"] = total.get(f"kelas:{k}", 0) + v

    print(f"\n=== 26 SEKSI PILOT — angka mentah ===")
    print(f"  seksi          : {len(records)}")
    for k in ("paragraf", "kata", "sitasi_kurung", "sitasi_individual", "kelas:box-blue", "kelas:box-red"):
        print(f"  {k:15s}: {total.get(k, 0)}")

    # --- Status default per genre (PETA_STATUS_KLAIM peta genre->status) ----
    STATUS_DEFAULT = {
        "causal_mechanism": "[SCHEMA]",
        "empirical_generalization": "[SCHEMA]",
        "conceptual": "[DEFINITIONAL]",
        "diagnostic": "[DEFINITIONAL]+[DERIVED]",
        "normative_axiom": "[VALUE]",
        "strategic_heuristic": "[SCHEMA]",
        "historical_illustration": "[SCHEMA]",
        "open_question": "[OPEN]",
    }
    for rec in records:
        if not rec.get("claim_type"):
            rec["claim_type"] = "conceptual"
        if not rec.get("status"):
            rec["status"] = STATUS_DEFAULT.get(rec["claim_type"], "[SCHEMA]")
    hasil = validate_corpus(records)
    hasil_b = validate_parts(bagian)
    print(f"\n=== VALIDATOR SKEMA ===")
    print(f"  seksi divalidasi : {hasil['seksi']}")
    print(f"  error seksi      : {hasil['error']}")
    for e in hasil["daftar_error"][:10]:
        print(f"    - {e}")
    print(f"  bagian divalidasi: {hasil_b['bagian']}")
    print(f"  paragraf preambul: {hasil_b['paragraf_preambul']}")
    print(f"  error bagian     : {hasil_b['error']}")
    for e in hasil_b["daftar_error"][:10]:
        print(f"    - {e}")

    if args.keluaran:
        out = Path(args.keluaran)
        out.parent.mkdir(parents=True, exist_ok=True)
        out.write_text(json.dumps(
            {"_pilot": "Track C F4 — Bagian VI+VII", "_docx": docx_path.name,
             "_total": total, "_preambul_paragraf": n_pre,
             "bagian": bagian, "seksi": records},
            ensure_ascii=False, indent=2), encoding="utf-8")
        print(f"\nkeluaran: {out}")

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
