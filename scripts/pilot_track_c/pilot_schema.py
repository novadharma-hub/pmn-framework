"""Skema sumber ber-provenance untuk Pilot Track C (F4).

Spesifikasi: private/restrukturisasi/16E_PILOT_TRACK_C.md §2
Brief jalur:  private/docs/internal/PROMPT_ANTIGRAVITY_PILOT_TRACK_C.md §2

Berkas ini HANYA mendefinisikan dan memvalidasi bentuk. Ia tidak membaca DOCX,
tidak menulis keluaran, dan tidak memutuskan isi.

Dua aturan yang ditegakkan di sini dan tidak bisa dilewati:

  R8 / §12.1d  klaim defeasible WAJIB membawa `defeaters` yang tidak kosong.
               Klaim tanpa itu GAGAL SKEMA, bukan diperdebatkan.
               (22_STANDAR_PENULISAN R8)

  provenance   field TERPISAH dari `status`, bukan turunannya. Pilot ada untuk
               menguji ortogonalitas ini secara empiris (16E §2, temuan E1).
               Lihat pilot_gates.py --uji-provenance.
"""

from __future__ import annotations

# --- Nilai sah -------------------------------------------------------------
# Sumber: kolom `jenis klaim` 14_LEDGER_PEMBACAAN.md, diukur atas 235 baris.
# Delapan nilai, termasuk `diagnostic` (amandemen ZCode).
CLAIM_TYPES = frozenset({
    "conceptual",
    "causal_mechanism",
    "diagnostic",
    "normative_axiom",
    "historical_illustration",
    "strategic_heuristic",
    "empirical_generalization",
    "open_question",
})

# Sumber: WS_E §2 / tafsir_workstreams/PETA_STATUS_KLAIM.md. Tujuh nilai.
# Seksi boleh membawa status majemuk, mis. "[DEFINITIONAL]+[DERIVED]".
STATUSES = frozenset({
    "[DEFINITIONAL]",
    "[DERIVED]",
    "[SCHEMA]",
    "[MODELED]",
    "[MEASURED]",
    "[OPEN]",
    "[VALUE]",
})

# Sumber: 16E §2. Ortogonal terhadap STATUSES - itu justru yang pilot uji.
PROVENANCES = frozenset({"KANONIK", "PENURUNAN", "BARU", "OPEN"})

LAPIS_VALUES = frozenset({1, 2, 3, 4})

# Genre yang klaimnya defeasible menurut §12.1d + 27_AUDIT_PEMBATAL.
# `causal_mechanism` adalah kelas yang audit itu ukur 0-dari-57.
DEFEASIBLE_CLAIM_TYPES = frozenset({
    "causal_mechanism",
    "empirical_generalization",
})

REQUIRED_FIELDS = (
    "canonical_id",
    "legacy_section_ids",
    "book",
    "part",
    "lapis",
    "topik_klaster",
    "claim_type",
    "status",
    "provenance",
    "scope_conditions",
    "defeaters",
    "symbol",
    "source_paragraph_ids",
    "xrefs",
    "catatan_tulis_ulang",
)


def parse_status(raw: str) -> list[str]:
    """Pecah status majemuk '[A]+[B]' jadi ['[A]', '[B]']."""
    if not isinstance(raw, str):
        return []
    return [tok.strip() for tok in raw.split("+") if tok.strip()]


def validate_section(rec: dict, *, strict_defeaters: bool = False) -> list[str]:
    """Kembalikan daftar pelanggaran. Daftar kosong = lolos.

    strict_defeaters=False (default) menegakkan R8 sebagai PERINGATAN, sebab
    27_AUDIT_PEMBATAL mengukur 0 dari 57 seksi causal_mechanism membawa
    pembatal di v120. Pilot HARUS bisa mengimpor naskah sebagaimana adanya
    (16E §0) - kalau R8 ditegakkan keras di pilot, importir menolak naskah
    yang justru ia ada untuk membuktikan bisa dibawa.

    strict_defeaters=True adalah gerbang KANON BARU, bukan gerbang pilot.
    Q6 yang menentukan kapan ia dinyalakan dan untuk lapis mana.
    """
    err: list[str] = []
    sid = rec.get("canonical_id", "<tanpa id>")

    for field in REQUIRED_FIELDS:
        if field not in rec:
            err.append(f"{sid}: field wajib hilang: {field}")
    if err:
        return err

    if not isinstance(rec["canonical_id"], str) or not rec["canonical_id"]:
        err.append(f"{sid}: canonical_id harus string tak kosong")

    if not isinstance(rec["legacy_section_ids"], list) or not rec["legacy_section_ids"]:
        err.append(f"{sid}: legacy_section_ids harus list tak kosong")

    # `book` SENGAJA boleh kosong - penamaan Lapis menunggu F2 (16E §5 butir 2).
    if rec["book"] not in (None, ""):
        if not isinstance(rec["book"], str):
            err.append(f"{sid}: book harus string atau kosong")

    if not isinstance(rec["part"], str) or not rec["part"]:
        err.append(f"{sid}: part harus string tak kosong")

    if rec["lapis"] not in LAPIS_VALUES:
        err.append(f"{sid}: lapis={rec['lapis']!r} bukan 1|2|3|4")

    ct = rec["claim_type"]
    if ct not in CLAIM_TYPES:
        err.append(f"{sid}: claim_type={ct!r} bukan salah satu dari 8 nilai sah")

    for tok in parse_status(rec["status"]):
        if tok not in STATUSES:
            err.append(f"{sid}: status token {tok!r} bukan salah satu dari 7 nilai sah")
    if not parse_status(rec["status"]):
        err.append(f"{sid}: status kosong atau tak terbaca")

    if rec["provenance"] not in PROVENANCES:
        err.append(f"{sid}: provenance={rec['provenance']!r} bukan KANONIK|PENURUNAN|BARU|OPEN")

    for field in ("scope_conditions", "defeaters", "source_paragraph_ids"):
        if not isinstance(rec[field], list):
            err.append(f"{sid}: {field} harus list")

    if not isinstance(rec["source_paragraph_ids"], list) or not rec["source_paragraph_ids"]:
        err.append(f"{sid}: source_paragraph_ids kosong - G1 mustahil lulus")

    xr = rec["xrefs"]
    if not isinstance(xr, dict) or "keluar" not in xr or "masuk" not in xr:
        err.append(f"{sid}: xrefs harus dict dengan kunci 'keluar' dan 'masuk'")

    if rec["symbol"] is not None and not isinstance(rec["symbol"], str):
        err.append(f"{sid}: symbol harus string atau null")

    if not isinstance(rec["catatan_tulis_ulang"], str):
        err.append(f"{sid}: catatan_tulis_ulang harus string (boleh kosong)")

    if strict_defeaters and ct in DEFEASIBLE_CLAIM_TYPES and not rec["defeaters"]:
        err.append(f"{sid}: R8 - claim_type={ct} defeasible tetapi defeaters kosong")

    return err


def validate_corpus(records: list[dict], *, strict_defeaters: bool = False) -> dict:
    """Validasi seluruh korpus pilot. Kembalikan angka mentah, bukan status."""
    errors: list[str] = []
    for rec in records:
        errors.extend(validate_section(rec, strict_defeaters=strict_defeaters))

    ids = [r.get("canonical_id") for r in records]
    dup = sorted({i for i in ids if ids.count(i) > 1})
    if dup:
        errors.append(f"canonical_id duplikat: {dup}")

    # R8 dilaporkan sebagai angka apa pun mode-nya - ia temuan, bukan kegagalan pilot.
    r8_pelanggar = [
        r["canonical_id"] for r in records
        if r.get("claim_type") in DEFEASIBLE_CLAIM_TYPES and not r.get("defeaters")
    ]

    return {
        "seksi": len(records),
        "error": len(errors),
        "daftar_error": errors,
        "r8_defeasible_tanpa_pembatal": len(r8_pelanggar),
        "r8_daftar": r8_pelanggar,
    }
