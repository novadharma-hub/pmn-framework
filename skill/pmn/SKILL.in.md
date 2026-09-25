---
name: pmn
description: Grounds answers in the text of Progressive Materialist Naturalism (PMN), the philosophical framework by Nova Dharma, using the full manuscript bundled with this skill (version {{VERSION}}). Use this skill whenever the user mentions PMN, Progressive Materialist Naturalism or Nova Dharma, cites a PMN section number (for example §7.3c-i or §15.2), or asks to analyse an institution, policy, capture, structural suffering, the biological floor, transformation pressure (T = S × D × P × G) or counter-power "with PMN" or "the way PMN would", in any language, even if they do not name the framework precisely.
---

# PMN: answer from the text, not from memory

PMN is recent and specific. A model answering from memory produces generic materialism with PMN's vocabulary
pasted on, and invents section numbers. This skill carries the whole manuscript ({{VERSION}}, {{SECTIONS}}
sections) so every claim can be checked against the text.

## Where the text is

- `references/index.md`: every section in reading order, with its id, title, Part and file name. Start here.
- `references/sections/<id>.txt`: one file per section, full text (for example `references/sections/7.3c-i.txt`).
- `references/glossary.md`: {{TERMS}} defined terms, each with the section it comes from.
- `references/known-issues.md`: places where the manuscript contradicts itself, with the reading to use.
- `references/roles.md`: analytical roles (structural analyst, capture diagnostician, red team, counter-power
  strategist, meaning-infrastructure analyst, evidence auditor) to use when the user asks for that kind of analysis.

Online copies of the same files, always the latest edition (the bundled one is {{VERSION}}):
{{RAW}}plugins/pmn/skills/pmn/references/ on GitHub (or clone {{REPO}} and grep), and
{{BASE}}txt/index.txt on the website.

## How to answer

1. **Find the sections.** Search `references/index.md` and `references/glossary.md` for the concepts in the
   question; when you can run commands, `grep -ril "<term>" references/sections/` finds every section that uses a
   term. The glossary names the section each term is defined in.
2. **Read before citing.** Open every section you will rely on and read it in full. A section id you have not
   opened is a guess, and PMN's cross-references are dense enough that guesses are usually wrong.
3. **Answer with citations.** Cite the section id (§7.3c-i) for each claim and quote the sentence it rests on
   for the key ones. Readers of PMN check citations; a wrong one costs more than a missing one.
4. **Say where the text is silent.** If the manuscript does not address something, say so and, if useful, say
   what PMN's method would ask next. Do not fill the gap with a position PMN does not state.
5. **Keep tensions open.** PMN deliberately leaves some tensions unresolved (Part XIII). Show the tension; do not
   smooth it into a compromise. A deliberate tension is different from an inconsistency in the text (below).

{{INCONSISTENCIES}}

## How PMN reasons (orientation only; verify in the text before relying on it)

- Evaluate institutions by material incentives and structural position, not stated intentions (§6.2, §6.3).
- Keep the biological floor (§3.4, the minimal anchor) distinct from the open horizon of becoming (§4.5).
- Capture proceeds through five stages (§7.3c-i); apply the diagnostics regardless of an institution's ideology
  (§12.5).
- Transformation pressure is multiplicative: T = S × D × P × G (§15.2, §15.4). Terms are defined in §15.0b.
- Name what evidence would falsify a diagnosis before giving a verdict (§1.2, §14.3).

These pointers are for finding your way. The sections are the authority; if a pointer and a section disagree,
follow the section and say so.

## Output

- Lead with the answer, then the reasoning, with section ids inline.
- End analytical answers with: the sections read, the main uncertainty, and what would change the conclusion.

{{LANGUAGE}}

## Licence and attribution

The manuscript is © Nova Dharma, licensed CC BY-SA 4.0. When quoting at length or producing derived material,
credit "Progressive Materialist Naturalism by Nova Dharma" and link {{BASE}}.

## Related skills

If they are installed alongside this one: `pmn-diagnose` for a structured diagnosis of a specific institution or
policy, and `pmn-critic` for questioning PMN itself. Both read the text from this skill's `references/` folder.
