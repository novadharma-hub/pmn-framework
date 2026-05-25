# PMN Security Handoff For AI Maintainers

This document is a security-focused handoff for the main AI maintainer of the PMN repository.

Use it before large imports, automated pushes, public releases, or metadata-cleaning work. The goal is not paranoia; it is to keep a public GitHub Pages-style manuscript repo from accidentally publishing secrets, private documents, local machine paths, or generated rescue artifacts.

---

## 1. Current Security Posture

The project is mostly a static public manuscript reader. The public deployment artifact is `index.html`, generated from:

- `index.ui.html`
- `style.css`
- `app.js`
- `data/*.json`
- `data/parts/*.json`

The repository also contains local automation for:

- DOCX import
- metadata scrubbing
- diagnostics
- workspace snapshots
- GitHub push helper scripts

The main risk is not server compromise. The main risk is accidental publication of local/private artifacts.

Recommended local operating layout:

```text
D:\pmn-workspace\
  _private\
  pmn-framework\  -> junction to D:\pmn-framework
```

See `WORKSPACE_LAYOUT.md`. AI tools may be opened at `D:\pmn-workspace`, but Git operations should happen only inside `pmn-framework`.

---

## 2. High-Risk Files And Folders

Treat these as sensitive or operationally risky:

| Path | Risk | Expected Handling |
| :--- | :--- | :--- |
| `.env`, `.env.local` | Secrets/API keys | Must remain ignored |
| `docs/raw_inputs/` | Raw personal documents | Must remain ignored |
| `docs/clean_outputs/` | Cleaned outputs, still may be private | Must remain ignored unless intentionally published |
| `backups/` | Local source snapshots | Must remain ignored |
| `LENGKAPI_DIAGNOSIS_UNTUK_AI.md` | Generated rescue report may contain paths/context | Must remain ignored |
| `*.bak` | Local backups | Must remain ignored |
| `__pycache__/`, `*.pyc` | Machine-generated Python cache | Must not be tracked |
| `docx_source/` | Active manuscript source | Review before publishing |
| `docs/*.docx` | Public manuscript copies | Scrub metadata before publishing |

---

## 3. Secret Scan Notes

Recent text scan did not reveal obvious live API keys or tokens. Only placeholders were found in `.env.example`.

Known external secret dependency:

- `scripts/strip_metadata_and_backup.py` reads Telegram config from `D:\Omnimedia-Suite\config.env`.
- That external config file must never be copied into this repository.
- Telegram bot tokens, group IDs, and topic IDs must stay outside git.

Before every public push, run a targeted scan:

```powershell
rg -n --hidden -i "(api[_-]?key|secret|token|password|bearer|authorization|BOT_TOKEN|chat_id|service_role|sk-|AIza|ghp_|github_pat|PRIVATE KEY)" -g "!.git/**" -g "!node_modules/**" -g "!index.html" -g "!pmn_corpus_for_ai.md"
```

If a real secret is found, do not commit. Rotate the secret if it was ever pushed.

Preferred local helper:

```powershell
python scripts/security_check.py
```

This helper intentionally avoids scanning huge generated files and checks secret-like text patterns, tracked Python cache files, DOCX core/app metadata, JSON validity, and required ignore rules.

---

## 4. Metadata And Identity Leakage

The repo currently contains public-facing references to local paths and personal identity in documentation and helper scripts. This may be acceptable for a private workflow, but it is a public metadata leak if the repository is public.

Examples to review:

- `D:\pmn-framework`
- `C:\Users\...`
- `Ali Ikhsan`
- Telegram backup/logging claims

Recommended policy:

- Public docs should prefer generic paths like `<repo-root>`.
- Personal names should appear only when intentionally public.
- Raw drafts must go through the scrubber before being copied into public folders.
- DOCX files under `docs/` should be treated as public release artifacts and metadata-audited before push.
- When scanning DOCX internals, avoid naive substring matching for `ali`; XML namespace words such as `schemaLibrary` can produce false positives. Prefer word-boundary checks in `docProps/core.xml` and `docProps/app.xml`.

---

## 5. Git Push Safety

Never blindly run `git add .` in a mixed worktree.

The safer helper flow should:

1. Show `git status`.
2. Ask for confirmation before staging all files.
3. Run `git add -A`.
4. Show `git diff --cached --stat`.
5. Ask for final confirmation before commit.
6. Commit.
7. Push.

For surgical pushes, prefer:

```powershell
git add path/to/file1 path/to/file2
git diff --cached --stat
git commit -m "Clear commit message"
git push origin main
```

---

## 6. DOCX Import Security

The DOCX importer reads Word files as ZIP/XML. It does not execute macros, but still follow these rules:

- Only import DOCX files from trusted local sources.
- Keep exactly one active release DOCX in `docx_source/`.
- Avoid unusual embedded objects, macros, external links, or hidden content.
- After import, verify generated JSON and compiled output.
- If publishing DOCX files, scrub metadata first.

Known architecture issue:

- `scripts/import_pmn_docx.py` still uses `index.html` as part of its import/update path.
- Longer-term improvement: refactor import so DOCX writes only to `data/parts/*.json`, `data/parts/manifest.json`, derived JSON files, and `index.ui.html` version labels. Then `modularizer.py compile` should be the only writer of `index.html`.

---

## 7. Static Frontend Security

The public reader is mostly static, which is good.

Current frontend risk areas:

- Manuscript HTML is inserted into the page from JSON.
- This is acceptable only if manuscript JSON is trusted.
- Do not import arbitrary untrusted HTML into `data/parts/*.json`.
- User notes/highlights appear to use browser-local storage; do not add network sync without explicit privacy review.
- External handoff links to ChatGPT/Gemini should not include private notes unless the user intentionally copies/sends them.

If future work adds a backend:

- Never expose service-role Supabase keys in frontend code.
- Use server-side functions for privileged operations.
- Add CORS and rate-limit decisions deliberately.
- Keep provider API keys in environment variables only.

---

## 8. Dependency And Script Risks

Current local scripts are useful but should be treated carefully:

- `scripts/strip_metadata_and_backup.py` may install `pypdf` automatically with pip. Prefer documenting/installing dependencies explicitly in the future.
- It imports `requests` and `dotenv`; ensure the local environment has these installed.
- Telegram upload should remain opt-in and should fail closed if config is missing.
- Snapshot restore extracts ZIP files from `backups/`; only restore trusted snapshots created by this project.

Recommended future hardening:

- Add `requirements.txt`.
- Remove tracked `__pycache__` and `.pyc` files from git history going forward.
- Replace hardcoded absolute paths with paths derived from the repo root.
- Add a `scripts/security_check.py` that validates ignore rules, scans for secret patterns, and reports public DOCX files.

---

## 9. Pre-Push Security Checklist

Before pushing public changes:

- Run `git status -sb`.
- Confirm no raw/private docs are staged.
- Confirm no `.env` or config files are staged.
- Confirm no `backups/`, `.bak`, `.pyc`, or diagnostic reports are staged.
- Run a secret scan.
- If DOCX files changed, confirm metadata was scrubbed or intentionally public.
- If `index.html` changed, confirm it came from compile, not manual editing.
- If `data/parts/*.json` changed, confirm JSON is valid.
- If glossary changed, confirm `data/gl.json` and `data/glg.json` remain consistent.

---

## 10. Recommended Security Tasks For Next AI

Prioritize these:

1. Remove any tracked `__pycache__` / `.pyc` files from git.
2. Refactor hardcoded `D:\pmn-framework` paths to repo-root-relative paths.
3. Add a first-class security check script.
4. Refactor DOCX import to avoid writing `index.html` directly.
5. Audit public DOCX metadata under `docs/`.
6. Create a compact English `AI.md` v2 for AI maintainers.
7. Decide whether personal-name references in public docs are intentional.
