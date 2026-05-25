# PMN AI Writer Release Packet Guide

This guide is for any AI writer or editor preparing a new PMN manuscript release.

Each new manuscript version should produce not only a `.docx` file, but also a compact Markdown release packet. The release packet tells the importer, compiler, human maintainer, and future AI assistants what changed, what may break, and what should be checked before publishing.

The AI writer must not edit `index.html`.

---

## 1. Role

You are an AI writer/editor for the PMN manuscript.

Your job is to:

- Draft or revise manuscript content.
- Preserve heading patterns that the DOCX importer can parse.
- Record structural, conceptual, glossary, and cross-reference changes.
- Produce a release packet for every new version.
- Flag risks for the technical AI or human maintainer.

You are not the compiler, UI engineer, or deployment agent.

---

## 2. Required Outputs For Each Release

Every new version should produce two files:

1. Manuscript DOCX:
   `PMN_Framework_vXXX.docx` or `PMN_Framework_vXXX_Y.docx`

2. Release packet Markdown:
   `PMN_RELEASE_PACKET_vXXX.md` or `PMN_RELEASE_PACKET_vXXX_Y.md`

Examples:

- `PMN_Framework_v117.docx`
- `PMN_RELEASE_PACKET_v117.md`

Or:

- `PMN_Framework_v116_3.docx`
- `PMN_RELEASE_PACKET_v116_3.md`

The version number must match exactly.

---

## 3. DOCX Heading Contract

The importer depends on predictable heading text. Do not invent a new heading system.

Required part format:

```text
Part XVIII: New Part Title
```

Required section format:

```text
18.1 New Section Title
18.2 Another Section Title
18.2a Optional Subsection Title
```

Special headings that must remain recognizable:

```text
Contents
Preface
Coda
Intellectual Debts
Bibliography
```

Do not:

- Rename `Contents` to `Table of Contents`.
- Rename `Preface` to `Introduction`.
- Replace `Part IV: Title` with `Chapter 4`.
- Add decorative symbols to headings.
- Create website-visible sections without section numbers.

---

## 4. Cross-Reference Discipline

When referring to another section, use explicit section IDs.

Good:

```text
As developed in 3.4, the biological floor does not function as a ceiling.
```

Weak:

```text
As developed earlier, the biological floor does not function as a ceiling.
```

If a section is renamed, moved, deleted, split, or merged, record the affected references in the release packet.

---

## 5. Glossary Awareness

Record glossary-relevant changes when the manuscript:

- Introduces a new key term.
- Revises an existing concept.
- Renames a concept.
- Removes or de-emphasizes a previous term.
- Makes a term more central to the framework.

The AI writer does not need to edit `data/gl.json`, but must provide enough information for a technical assistant to update it.

---

## 6. Release Packet Template

Use this template for every new release.

```md
# PMN Release Packet vXXX

## 1. Version Identity

- Manuscript file: `PMN_Framework_vXXX.docx`
- Public version label: `vXXX`
- Date prepared: YYYY-MM-DD
- Writer/editor: AI-assisted draft
- Status: Draft / Ready for import / Needs review

## 2. Executive Summary

Write 3-7 bullets:

- Main change:
- Most important reader-facing change:
- Scale of update: small / medium / major / structural rewrite
- Any known risk:

## 3. Structural Changes

| Type | Location | Old | New | Notes |
| :--- | :--- | :--- | :--- | :--- |
| Added part | Part XVIII | - | Part XVIII: Title | New major part |
| Added section | 18.1 | - | 18.1 Title | New section |
| Renamed section | 4.2 | Old title | New title | Meaning unchanged |
| Moved content | 11.4 | Old location | 11.6 | Check references |
| Removed section | 7.8 | Removed title | - | Explain reason |

If none:

`No structural changes.`

## 4. Section-Level Change Log

| Section | Change Type | Summary | Risk |
| :--- | :--- | :--- | :--- |
| 3.4 | Expanded | Added clarification on biological floor | Low |
| 7.3c | Revised | Strengthened capture mechanism language | Medium |
| 11.0 | Major rewrite | Reworked economic diagnostics | High |

Risk guide:

- Low: wording only; no structure change.
- Medium: concept changed; references may need review.
- High: section moved, renamed, deleted, split, merged, or heavily rewritten.

## 5. New Or Changed Core Claims

- Claim:
- Location:
- Old version:
- New version:
- Reason for change:

## 6. Cross-Reference Notes

| Source Section | Referenced Section | Issue |
| :--- | :--- | :--- |
| 8.2 | 11.0 | Verify section still exists |
| 10.6 | 10.7 | Wording changed after new subsection |

If none:

`No known cross-reference issues.`

## 7. Glossary Candidates

| Term | Action | Suggested Definition | Suggested Citation |
| :--- | :--- | :--- | :--- |
| example term | Add | Short precise definition | (18.1) |
| old term | Revise | Updated definition | (4.2) |

If none:

`No glossary changes proposed.`

## 8. Reader-Facing Release Note

Write 1 short paragraph suitable for public release notes.

Example:

`Version vXXX expands the analysis of institutional capture and adds a new section on adaptive response capacity under technological acceleration.`

## 9. Importer Risk Checklist

Answer yes/no:

- Does the DOCX still contain `Contents`?
- Does the DOCX still contain `Preface`?
- Are all major parts written as `Part RomanNumeral: Title`?
- Are all website-visible sections numbered?
- Were any section IDs renamed or removed?
- Were tables, images, footnotes, or unusual Word objects added?
- Were any headings manually styled in a nonstandard way?

## 10. Human Review Checklist

Before import/compile:

- Confirm the DOCX filename matches the intended version.
- Confirm only one active DOCX is placed in `docx_source/`.
- Confirm this release packet uses the same version number as the DOCX.
- Confirm all high-risk structural changes are listed above.
- Confirm no private metadata or personal notes remain in public-facing text.
```

---

## 7. Prompt For Any AI Writer

Paste this prompt to the AI writer:

```text
You are preparing a new PMN manuscript release.

Produce two outputs:

1. The revised manuscript content for DOCX assembly.
2. A Markdown release packet following `PMN AI Writer Release Packet Guide`.

Preserve these heading conventions:
- `Contents`
- `Preface`
- `Part IV: Title`
- `4.1 Section Title`

Do not invent a new heading system.
Do not edit or generate `index.html`.
Record every structural or conceptual change in the release packet.
Record every new or changed key term under Glossary Candidates.
Flag any importer risk, especially renamed headings, removed section IDs, tables, images, footnotes, or unusual Word objects.
```

---

## 8. Purpose

The compiler can combine files. The DOCX importer can parse predictable structure. Neither one understands authorial intent.

The release packet is the version memory. It tells future maintainers:

- What changed.
- Why it changed.
- Which sections are risky.
- Which references need checking.
- Which glossary terms may need updates.
- Whether the website pipeline may be affected.

Recommended release loop:

```text
DOCX update -> release packet -> import -> compile -> diagnostics -> preview -> push
```

