"""Gerbang kontras token warna PMN.

Mengurai token dari src/index.css (blok @theme = nilai dark mode, blok
:root:not([data-theme=dark]) = override light mode), lalu memeriksa setiap
pasangan teks-di-atas-latar terhadap ambang WCAG.

Jalankan dari folder public/:
    python scripts/check_contrast.py

Keluar 0 bila semua pasangan lolos, 1 bila ada yang gagal atau token hilang.
"""
import io
import re
import sys
from pathlib import Path

CSS = Path(__file__).resolve().parent.parent / "src" / "index.css"

# Ambang WCAG 2.1. Teks normal butuh 4.5; teks besar (>=24px atau >=18.66px
# bold) butuh 3.0. Semua token di sini dipakai untuk teks berukuran normal.
AA_NORMAL = 4.5

# Pasangan yang diperiksa: (token teks, token latar).
# Diturunkan dari pemakaian nyata di style.css dan komponen React.
PAIRS = [
    ("ink", "bg"), ("ink", "bg2"), ("ink", "bg3"), ("ink", "sb"),
    ("ink2", "bg"), ("ink2", "bg2"), ("ink2", "bg3"), ("ink2", "sb"),
    ("acc-text", "bg"), ("acc-text", "bg2"), ("acc-text", "bg3"), ("acc-text", "sb"),
    ("mute", "bg"), ("mute", "bg2"), ("mute", "bg3"), ("mute", "sb"),
    ("mute2", "bg"), ("mute2", "bg2"), ("mute2", "bg3"), ("mute2", "sb"),
    ("mute3", "bg2"),  # placeholder kolom pencarian duduk di atas bg2
]


def _srgb_to_linear(channel: float) -> float:
    c = channel / 255.0
    return c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4


def relative_luminance(hex_color: str) -> float:
    h = hex_color.lstrip("#")
    r, g, b = (int(h[i:i + 2], 16) for i in (0, 2, 4))
    return (0.2126 * _srgb_to_linear(r)
            + 0.7152 * _srgb_to_linear(g)
            + 0.0722 * _srgb_to_linear(b))


def contrast_ratio(fg: str, bg: str) -> float:
    lighter, darker = sorted(
        [relative_luminance(fg), relative_luminance(bg)], reverse=True
    )
    return (lighter + 0.05) / (darker + 0.05)


TOKEN_RE = re.compile(r"--color-pmn-([a-z0-9-]+)\s*:\s*(#[0-9a-fA-F]{6})\s*;")


def parse_themes(css_text: str) -> dict:
    """Kembalikan {'dark': {token: hex}, 'light': {token: hex}}.

    Blok @theme adalah nilai dark mode. Blok :root:not([data-theme=dark])
    menimpanya untuk light mode, jadi light dimulai dari salinan dark.
    """
    # Harus mencocokkan SELEKTOR-nya, bukan penyebutan pertama string itu.
    # index.css menyebut ":root:not([data-theme=dark])" di dalam komentar blok
    # @theme, sebelum satu pun token didefinisikan; find() polos akan memotong
    # di komentar itu dan membuat seluruh token dark terbaca sebagai light.
    match = re.search(r"^:root:not\(\[data-theme=dark\]\)\s*\{", css_text, re.M)
    if match is None:
        raise SystemExit("FATAL: selektor blok light mode tidak ditemukan di index.css")
    light_start = match.start()

    dark = dict(TOKEN_RE.findall(css_text[:light_start]))
    light = dict(dark)
    light.update(dict(TOKEN_RE.findall(css_text[light_start:])))
    return {"dark": dark, "light": light}


def main() -> int:
    css_text = io.open(CSS, encoding="utf-8").read()
    themes = parse_themes(css_text)

    failures = 0
    missing = 0
    for theme_name, tokens in themes.items():
        print("\n=== TEMA %s ===" % theme_name.upper())
        print("%-22s %7s %7s  status" % ("pasangan", "rasio", "ambang"))
        for fg, bg in PAIRS:
            label = "%s / %s" % (fg, bg)
            if fg not in tokens or bg not in tokens:
                print("%-22s %7s %7s  TOKEN HILANG" % (label, "-", "-"))
                missing += 1
                continue
            ratio = contrast_ratio(tokens[fg], tokens[bg])
            ok = ratio >= AA_NORMAL
            failures += 0 if ok else 1
            print("%-22s %7.2f %7.1f  %s"
                  % (label, ratio, AA_NORMAL, "OK" if ok else "GAGAL"))

    print()
    if missing:
        print("%d token belum didefinisikan." % missing)
    if failures or missing:
        print("GERBANG MERAH: %d pasangan di bawah ambang, %d token hilang."
              % (failures, missing))
        return 1
    print("GERBANG HIJAU: semua pasangan lolos WCAG AA.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
