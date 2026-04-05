#!/usr/bin/env python3
from __future__ import annotations

import argparse
import html
import json
import os
import re
import sys
import zipfile
import xml.etree.ElementTree as ET
from dataclasses import dataclass
from pathlib import Path


NS = {"w": "http://schemas.openxmlformats.org/wordprocessingml/2006/main"}
W_NS = "{%s}" % NS["w"]
SPECIAL_PARTS = {"Preface", "Coda", "Intellectual Debts", "Bibliography"}
BACKMATTER_HEADINGS = ["Coda", "Intellectual Debts", "Bibliography"]
RED_FILLS = {"FFF5F5"}
RED_BORDERS = {"F87171"}


@dataclass
class Paragraph:
    element: ET.Element
    text: str


def normalize_space(text: str) -> str:
    return re.sub(r"\s+", " ", text).strip()


def strip_control_chars(text: str) -> str:
    return re.sub(r"[\x00-\x08\x0b\x0c\x0e-\x1f]", "", text)


def slugify(text: str) -> str:
    text = normalize_space(text).lower()
    text = text.replace("’", "").replace("'", "")
    text = re.sub(r"[^a-z0-9]+", "-", text)
    return text.strip("-") or "section"


def extract_paragraphs(docx_path: Path) -> list[Paragraph]:
    try:
        with zipfile.ZipFile(docx_path) as archive:
            try:
                document_xml = archive.read("word/document.xml")
            except KeyError as exc:
                raise ValueError(f"Missing word/document.xml inside {docx_path}") from exc
    except FileNotFoundError as exc:
        raise ValueError(f"DOCX file not found: {docx_path}") from exc
    except zipfile.BadZipFile as exc:
        raise ValueError(f"Invalid DOCX/ZIP file: {docx_path}") from exc

    try:
        root = ET.fromstring(document_xml)
    except ET.ParseError as exc:
        raise ValueError(f"Could not parse XML inside {docx_path}") from exc

    paragraphs: list[Paragraph] = []
    for para in root.findall(".//w:p", NS):
        text = "".join(node.text or "" for node in para.findall(".//w:t", NS))
        text = normalize_space(text)
        if text:
            paragraphs.append(Paragraph(element=para, text=text))
    return paragraphs


def find_body_start(paragraphs: list[Paragraph]) -> tuple[list[str], int]:
    try:
        contents_idx = next(i for i, para in enumerate(paragraphs) if para.text == "Contents")
    except StopIteration as exc:
        raise ValueError("Could not find a 'Contents' heading in the DOCX.") from exc
    preface_indices = [i for i, para in enumerate(paragraphs) if para.text == "Preface"]
    if len(preface_indices) < 2:
        raise ValueError("Could not locate the start of the body after the contents list.")
    body_start = preface_indices[1]
    toc_headings = [para.text for para in paragraphs[contents_idx + 1 : body_start]]
    return toc_headings, body_start


def paragraph_class(para: ET.Element) -> str | None:
    ppr = para.find("w:pPr", NS)
    if ppr is None:
        return None

    left = ppr.find("w:pBdr/w:left", NS)
    shd = ppr.find("w:shd", NS)
    border_color = left.attrib.get(f"{W_NS}color") if left is not None else None
    fill = shd.attrib.get(f"{W_NS}fill") if shd is not None else None

    if border_color in RED_BORDERS or fill in RED_FILLS:
        return "box-red"
    if left is not None or shd is not None:
        return "box-blue"
    return None


def run_fragments(run: ET.Element) -> str:
    fragments: list[str] = []
    for child in run:
        if child.tag == f"{W_NS}t":
            fragments.append(html.escape(strip_control_chars(child.text or "")))
        elif child.tag in {f"{W_NS}br", f"{W_NS}cr"}:
            fragments.append("<br>")
        elif child.tag == f"{W_NS}tab":
            fragments.append("    ")
        elif child.tag == f"{W_NS}noBreakHyphen":
            fragments.append("-")
    return "".join(fragments)


def wrap_run(text: str, run: ET.Element) -> str:
    if not text:
        return ""

    rpr = run.find("w:rPr", NS)
    if rpr is None:
        return text

    wrappers: list[str] = []
    if rpr.find("w:b", NS) is not None:
        wrappers.append("strong")
    if rpr.find("w:i", NS) is not None:
        wrappers.append("em")

    vert = rpr.find("w:vertAlign", NS)
    if vert is not None:
        val = vert.attrib.get(f"{W_NS}val")
        if val == "superscript":
            wrappers.append("sup")
        elif val == "subscript":
            wrappers.append("sub")

    for tag in wrappers:
        text = f"<{tag}>{text}</{tag}>"
    return text


def inline_html(node: ET.Element) -> str:
    parts: list[str] = []
    for child in list(node):
        if child.tag == f"{W_NS}r":
            parts.append(wrap_run(run_fragments(child), child))
        elif child.tag == f"{W_NS}hyperlink":
            for run in child.findall("w:r", NS):
                parts.append(wrap_run(run_fragments(run), run))
    return "".join(parts).strip()


def paragraph_html(para: ET.Element) -> str:
    content = inline_html(para)
    if not content:
        return ""
    class_name = paragraph_class(para)
    class_attr = f' class="{class_name}"' if class_name else ""
    return f"<p{class_attr}>{content}</p>"


def parse_part_heading(text: str) -> tuple[str, str] | None:
    match = re.match(r"^Part ([IVXLC]+): (.+)$", text)
    if not match:
        return None
    return match.group(1), match.group(2)


def parse_section_heading(text: str) -> tuple[str, str]:
    match = re.match(r"^([0-9]+(?:\.[0-9A-Za-z-]+)*)\s+(.+)$", text)
    if match:
        return match.group(1), match.group(2)
    return slugify(text), text


def headings_match(expected: str, actual: str) -> bool:
    if expected == actual:
        return True

    expected_part = parse_part_heading(expected)
    actual_part = parse_part_heading(actual)
    if expected_part and actual_part and expected_part[0] == actual_part[0]:
        return True

    expected_section = parse_section_heading(expected)
    actual_section = parse_section_heading(actual)
    if expected_section[0] == actual_section[0] and re.match(r"^\d", expected_section[0]):
        return True
    if actual == expected_section[1]:
        return True

    return False


def start_part(parts: list[dict], part_code: str, title: str) -> dict:
    part = {"part": part_code, "title": title, "subs": []}
    parts.append(part)
    return part


def start_sub(part: dict, heading_text: str) -> dict:
    section_id, section_title = parse_section_heading(heading_text)
    sub = {
        "id": section_id,
        "title": section_title,
        "is_intro": heading_text == "Preface",
        "html": "",
    }
    part["subs"].append(sub)
    return sub


def start_sub_from_match(part: dict, expected_heading: str, actual_heading: str) -> dict:
    expected_id, expected_title = parse_section_heading(expected_heading)
    actual_id, actual_title = parse_section_heading(actual_heading)

    if re.match(r"^\d", expected_id):
        section_id = expected_id
        section_title = actual_title if actual_heading == expected_title else actual_title
    else:
        section_id = actual_id
        section_title = actual_title

    sub = {
        "id": section_id,
        "title": section_title,
        "is_intro": actual_heading == "Preface",
        "html": "",
    }
    part["subs"].append(sub)
    return sub


def build_parts(paragraphs: list[Paragraph], toc_headings: list[str], body_start: int) -> list[dict]:
    toc_by_title: dict[str, str] = {}
    toc_by_id: dict[str, str] = {}
    toc_full: set[str] = set()
    for heading in toc_headings:
        toc_full.add(heading)
        part = parse_part_heading(heading)
        if part:
            continue
        section_id, section_title = parse_section_heading(heading)
        toc_by_title[section_title] = heading
        toc_by_id[section_id] = heading

    body = paragraphs[body_start:]

    parts: list[dict] = []
    current_part: dict | None = None
    current_sub: dict | None = None
    current_html: list[str] = []

    def flush_sub() -> None:
        nonlocal current_html
        if current_sub is not None:
            current_sub["html"] = "\n".join(segment for segment in current_html if segment)
        current_html = []

    def find_expected_heading(text: str) -> str | None:
        if text in toc_full:
            return text
        if text in toc_by_title:
            return toc_by_title[text]
        section_id, _ = parse_section_heading(text)
        if section_id in toc_by_id:
            return toc_by_id[section_id]
        for heading in toc_full:
            if text.startswith(f"{heading} —") or text.startswith(f"{heading}: "):
                return heading
        for title, heading in toc_by_title.items():
            if text.startswith(f"{title} —") or text.startswith(f"{title}: "):
                return heading
        return None

    for para in body:
        heading = para.text
        expected_heading = find_expected_heading(heading)

        if parse_part_heading(heading):
            flush_sub()
            parsed_part = parse_part_heading(heading)
            assert parsed_part is not None
            part_code, title = parsed_part
            current_part = start_part(parts, part_code, title)
            current_sub = None
            continue

        if heading in {"Preface", "How to Read This Document"}:
            flush_sub()
            if current_part is None:
                current_part = start_part(parts, "Preface", "Preface")
            current_sub = start_sub_from_match(current_part, expected_heading or heading, heading)
            continue

        if heading in BACKMATTER_HEADINGS:
            flush_sub()
            current_part = start_part(parts, heading, heading)
            current_sub = start_sub_from_match(current_part, expected_heading or heading, heading)
            continue

        if expected_heading is not None:
            flush_sub()
            if current_part is None:
                raise ValueError(f"Encountered section before any part: {heading}")

            current_sub = start_sub_from_match(current_part, expected_heading, heading)
            continue

        if current_sub is None:
            continue

        rendered = paragraph_html(para.element)
        if rendered:
            current_html.append(rendered)

    flush_sub()

    return parts


def merge_case_d_into_compressed_core(parts: list[dict]) -> list[dict]:
    compressed_core: dict | None = None
    case_d_part: dict | None = None
    case_d_index: int | None = None
    case_d_section: dict | None = None

    for part in parts:
        for sub in part["subs"]:
            if part["part"] == "XV" and sub["id"] == "15.15":
                compressed_core = sub
            if "Case D: Indonesia 1997–1998" in sub["title"]:
                case_d_part = part
                case_d_section = sub
                case_d_index = part["subs"].index(sub)

    if not compressed_core or not case_d_part or case_d_index is None or not case_d_section:
        return parts

    case_heading = (
        "<p><strong>Case D: Indonesia 1997–1998 — Reformasi and the Limits of "
        "Developmental Authoritarianism</strong></p>"
    )
    compressed_core["html"] = (
        compressed_core["html"].rstrip() + "\n" + case_heading + "\n" + case_d_section["html"].lstrip()
    )

    del case_d_part["subs"][case_d_index]
    return parts


def replace_d_parts(index_html: str, parts: list[dict]) -> str:
    payload = json.dumps(parts, ensure_ascii=False, separators=(",", ":"))
    replacement = f'<script id="d-parts" type="application/json">{payload}</script>'
    updated, count = re.subn(
        r'<script id="d-parts" type="application/json">.*?</script>',
        lambda _: replacement,
        index_html,
        count=1,
        flags=re.DOTALL,
    )
    if count != 1:
        raise ValueError("Could not replace the d-parts payload in index.html.")
    return updated


def replace_version_labels(index_html: str, version_label: str) -> str:
    replacements = [
        (r"(Latest edition[^<\n]*?\bv)(\d+(?:\.\d+)?)", rf"\g<1>{version_label.lstrip('vV')}"),
        (r"(Current edition[^<\n]*?\bv)(\d+(?:\.\d+)?)", rf"\g<1>{version_label.lstrip('vV')}"),
        (r"(Latest version[^<\n]*?\bv)(\d+(?:\.\d+)?)", rf"\g<1>{version_label.lstrip('vV')}"),
        (r"(Current version[^<\n]*?\bv)(\d+(?:\.\d+)?)", rf"\g<1>{version_label.lstrip('vV')}"),
    ]
    for pattern, repl in replacements:
        index_html = re.sub(pattern, repl, index_html, flags=re.IGNORECASE)

    version_number = version_label.lstrip("vV")
    direct_replacements = {
        "Version 83": f"Version {version_number}",
        "PMN v83": f"PMN {version_label}",
        "V83 MANUSCRIPT": f"V{version_number} MANUSCRIPT",
        "Progressive Materialist Naturalism v83": f"Progressive Materialist Naturalism {version_label}",
        "[PMN v83 REFERENCE]": f"[PMN {version_label} REFERENCE]",
    }
    for old, new in direct_replacements.items():
        index_html = index_html.replace(old, new)
    return index_html


def summarize(parts: list[dict]) -> str:
    section_count = sum(len(part["subs"]) for part in parts)
    part_labels = ", ".join(str(part["part"]) for part in parts[:6])
    if len(parts) > 6:
        part_labels += ", ..."
    return f"Imported {len(parts)} part groups and {section_count} sections ({part_labels})"


def resolve_docx_path(value: str | None) -> Path:
    candidates: list[Path] = []
    if value:
        candidates.append(Path(value))

    env_docx = os.environ.get("PMN_DOCX")
    if env_docx:
        candidates.append(Path(env_docx))

    cwd = Path.cwd()
    script_dir = Path(__file__).resolve().parent
    candidates.extend(
        [
            cwd / "PMN_Framework_v97.docx",
            cwd / "Framework docx" / "PMN_Framework_v97.docx",
            cwd.parent / "Framework docx" / "PMN_Framework_v97.docx",
            script_dir.parent / "Framework docx" / "PMN_Framework_v97.docx",
        ]
    )

    seen: set[Path] = set()
    for candidate in candidates:
        candidate = candidate.expanduser()
        if candidate in seen:
            continue
        seen.add(candidate)
        if candidate.exists():
            return candidate

    attempted = "\n".join(f"- {mask_local_path(path)}" for path in seen)
    raise ValueError(
        "Could not locate the PMN DOCX source. Provide --docx, set PMN_DOCX, "
        f"or place PMN_Framework_v97.docx in a nearby folder.\nTried:\n{attempted}"
    )


def mask_local_path(path: Path) -> str:
    try:
        resolved = path.resolve()
    except OSError:
        resolved = path

    text = str(resolved)
    cwd = str(Path.cwd().resolve())
    home = str(Path.home().resolve())

    if text.startswith(cwd):
        return text.replace(cwd, "<cwd>", 1)
    if text.startswith(home):
        return text.replace(home, "<home>", 1)
    return resolved.name or text


def main() -> int:
    parser = argparse.ArgumentParser(description="Import PMN .docx content into index.html")
    parser.add_argument(
        "--docx",
        default=None,
        help="Path to the PMN .docx source. Optional if PMN_DOCX is set or the file is in a nearby folder.",
    )
    parser.add_argument(
        "--index",
        default="index.html",
        help="Path to the target index.html file",
    )
    parser.add_argument(
        "--version-label",
        default="v97",
        help="Public-facing version label to keep in the site UI",
    )
    args = parser.parse_args()

    docx_path = resolve_docx_path(args.docx)
    index_path = Path(args.index)
    if not index_path.exists():
        raise ValueError(f"Target index.html not found: {index_path}")

    paragraphs = extract_paragraphs(docx_path)
    toc_headings, body_start = find_body_start(paragraphs)
    parts = build_parts(paragraphs, toc_headings, body_start)
    parts = merge_case_d_into_compressed_core(parts)

    html_text = index_path.read_text(encoding="utf-8")
    html_text = replace_d_parts(html_text, parts)
    html_text = replace_version_labels(html_text, args.version_label)
    index_path.write_text(html_text, encoding="utf-8")

    print(summarize(parts))
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except Exception as exc:
        print(f"Import failed: {exc}", file=sys.stderr)
        raise
