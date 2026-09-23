#!/usr/bin/env python3
"""Tell Bing (and the other IndexNow engines) which URLs the site has.

Why this exists: until 2026-09-23 the Pages domain was in no search index, and
many AI fetchers may only open a URL that a search result already showed them.
Bing's index is the one behind ChatGPT search, Copilot and DuckDuckGo, and
Bing accepts IndexNow pings without an account. Google does not take IndexNow;
it needs the sitemap submitted once in Search Console (a manual step).

Runs in the deploy workflow after the site is live. It waits until the key
file is reachable, because the engines verify ownership by fetching it, and
then submits every URL in dist/sitemap.xml. Standard library only. It never
fails the deploy: a missed ping costs nothing that the next deploy won't redo.

The key is not a secret. IndexNow keys are public by design: whoever can put
this file on the site owns the site for IndexNow purposes.
"""
from __future__ import annotations

import json
import re
import sys
import time
import urllib.error
import urllib.request
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent
BASE = "https://novadharma-hub.github.io/pmn-framework/"
HOST = "novadharma-hub.github.io"
KEY = "1e7d5f1a60372665b17debc767a93b89"
KEY_URL = BASE + KEY + ".txt"
ENDPOINT = "https://api.indexnow.org/indexnow"


def kunci_terjangkau(batas_detik: int = 180) -> bool:
    akhir = time.time() + batas_detik
    while time.time() < akhir:
        try:
            with urllib.request.urlopen(KEY_URL, timeout=15) as r:
                if r.status == 200 and r.read().decode().strip() == KEY:
                    return True
        except (urllib.error.URLError, OSError):
            pass
        time.sleep(15)
    return False


def main() -> int:
    peta = REPO_ROOT / "dist" / "sitemap.xml"
    if not peta.exists():
        print("[skip] dist/sitemap.xml not found; nothing to submit")
        return 0
    url = re.findall(r"<loc>([^<]+)</loc>", peta.read_text(encoding="utf-8"))
    if not kunci_terjangkau():
        print("[skip] %s not reachable yet; the next deploy will retry" % KEY_URL)
        return 0
    badan = json.dumps({"host": HOST, "key": KEY, "keyLocation": KEY_URL,
                        "urlList": url}).encode()
    req = urllib.request.Request(ENDPOINT, data=badan, method="POST", headers={
        "Content-Type": "application/json; charset=utf-8"})
    try:
        with urllib.request.urlopen(req, timeout=30) as r:
            print("[ok] IndexNow accepted %d URLs (HTTP %d)" % (len(url), r.status))
    except urllib.error.HTTPError as e:
        # 403 = key not verified yet, 422 = URL/host mismatch, 429 = too often.
        print("[warn] IndexNow answered HTTP %d: %s" % (e.code, e.read()[:200]))
    except (urllib.error.URLError, OSError) as e:
        print("[warn] IndexNow unreachable: %s" % e)
    return 0


if __name__ == "__main__":
    sys.exit(main())
