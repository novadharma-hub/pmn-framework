# PMN Workspace Layout

This repository can be used directly at `D:\pmn-framework`, but the safer long-term operating layout is:

```text
D:\pmn-workspace\
  private\
    raw_inputs\
    clean_outputs\
    backups\
    scratch\
    release_packets\
    config_notes\

  public\
    pmn-framework\  -> junction to D:\pmn-framework
```

Open AI coding tools at:

```text
D:\pmn-workspace
```

Use the Git repository at:

```text
D:\pmn-workspace\public\pmn-framework
```

The `public/pmn-framework` entry is a Windows junction pointing to the real public repo at `D:\pmn-framework`. This keeps existing scripts and Git remotes stable while giving AI tools one parent workspace that contains both private and public zones.

---

## Zone Rules

### `private`

Use `private` for files that should not be pushed:

- raw DOCX/PDF drafts
- unsanitized source documents
- backup ZIPs
- scratch files
- AI experiments
- private release notes
- local config notes
- anything containing personal metadata or secrets

Never commit files from `private`.

### `public/pmn-framework`

Use `public/pmn-framework` for public, Git-tracked project files:

- `index.ui.html`
- `style.css`
- `app.js`
- `data/`
- `data/parts/`
- `scripts/`
- public-safe `docs/`
- generated `index.html`
- AI handoff Markdown files

Only push from inside `public/pmn-framework`.

---

## Recommended Release Flow

```text
1. Put raw manuscript drafts in:
   D:\pmn-workspace\private\raw_inputs

2. Scrub or review metadata.

3. Move only public-safe release artifacts into:
   D:\pmn-workspace\public\pmn-framework\docx_source
   or
   D:\pmn-workspace\public\pmn-framework\docs

4. Import DOCX and compile from the repo.

5. Run:
   python scripts/security_check.py

6. Review:
   git status -sb
   git diff --cached --stat

7. Push only from:
   D:\pmn-workspace\public\pmn-framework
```

---

## AI Maintainer Instruction

When an AI agent is opened at `D:\pmn-workspace`, follow this rule:

```text
Workspace root: D:\pmn-workspace
Public Git repo: D:\pmn-workspace\public\pmn-framework
Private non-git area: D:\pmn-workspace\private

Never commit files from private.
Only run git commit/push inside public/pmn-framework.
Before push, run python scripts/security_check.py from public/pmn-framework.
```

---

## Why This Layout Exists

AI tools often work best when they can see one folder. A single public repo is safer for GitHub, but manuscript work also needs private scratch space.

This layout gives both:

- one AI-visible workspace root
- one clean GitHub repo (inside public/)
- one private area outside git
- no need to physically move the existing repo
- no broken Git remote or deployment setup
