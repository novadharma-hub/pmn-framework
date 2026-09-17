Self-hosted webfonts — PMN Framework
====================================

All three families are licensed under the SIL Open Font License 1.1. The full
licence text for each accompanies the fonts in this directory, as the OFL
requires of any redistribution.

  Libre Baskerville   OFL-LibreBaskerville.txt
  Lora                OFL-Lora.txt
  Source Code Pro     OFL-SourceCodePro.txt

The .woff2 files here are MODIFIED copies: cut from the upstream variable
fonts at fixed weights where upstream ships variable, then subset to the
characters this site actually renders (computed from data/*.json and the
interface strings in src/) unioned with full latin + latin-ext, then packed as
WOFF2. The OFL permits modification and redistribution under these terms;
none of the Reserved Font Names has been changed.

Upstream: https://github.com/google/fonts

Generated 2026-09-17. These files replaced three <link> elements pointing at a
font CDN, which had been disclosing every visitor's IP, User-Agent and Referer
to a third party before the page rendered. @font-face rules live in
src/index.css; do not link assets/fonts/*.ttf from the site — those belong to
the PDF build and are never published.

Spectral was vendored on 2026-09-17 and removed the same day. It was used
only by ReaderView2, which was frozen out of the reader path (board K24);
keeping its four faces would have cost every visitor 196 KB of precache
for a family nothing renders. Reviving ReaderView2 means re-vendoring
Spectral 300/400/500 + italic 400 from google/fonts ofl/spectral, which
ships static files so no weight instancing is needed.
