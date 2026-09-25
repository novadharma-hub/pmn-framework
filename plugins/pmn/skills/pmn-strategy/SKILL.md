---
name: pmn-strategy
description: Works out what to do with Progressive Materialist Naturalism (PMN), citing the PMN text. Given a situation and a goal (change a policy, organise workers or a community, build a movement, reform or protect an institution), it checks where the system stands, audits the counter-power available and finds the weakest factor, judges whether a window is open, weighs accommodation against transformation and reform against rupture, and sets out realistic options with what each needs and what to watch. Use whenever the user asks how to change something, what to do, how to organise, when to act, reform or revolution, or how to build counter-power, with PMN or the way PMN would, in any language.
---

# Strategy with PMN

PMN says of itself that a framework can be very good at explaining why systems fail and poor at guiding the people
trying to change them (§10.9). This skill is for the second job. Its value is realism: an honest "not yet" or "not
with this capacity" is a useful answer, and a plan that assumes resources nobody has is not.

Strategy rests on diagnosis. If the situation has not been diagnosed, do a short diagnosis first (the
`pmn-diagnose` skill, if installed, does this in full): who holds what, who pays, at which level the problem sits
(§7.0b).

## Where the text is

This skill carries the method, not the manuscript. Work from the text of PMN v126, never from memory: PMN is
recent and specific, and a model's memory of it produces generic materialism with PMN's words pasted on and section
numbers that do not exist.

1. **The `pmn` skill, if installed.** Its files sit next to this skill's folder: `../pmn/references/`
   (`index.md` lists every section, `glossary.md` the defined terms, `sections/<id>.txt` the full text of one
   section). If that path is missing, look among the installed skills for a `pmn` folder with `references/index.md`.
2. **Otherwise GitHub.** The same files are in the public repository
   https://github.com/novadharma-hub/pmn-framework, under `plugins/pmn/skills/pmn/references/`. With a shell, clone it
   (`git clone --depth 1 https://github.com/novadharma-hub/pmn-framework`) and search the section files with grep: the fastest way to
   answer questions that cross many sections. Without a shell, fetch single files from
   https://raw.githubusercontent.com/novadharma-hub/pmn-framework/main/plugins/pmn/skills/pmn/references/sections/<id>.txt (index: `.../references/index.md`).
3. **Otherwise the website.** https://novadharma-hub.github.io/pmn-framework/txt/index.txt lists every section with the URL of its own plain-text file.
4. **Otherwise ask.** Ask the user to paste the sections named below, or to install the `pmn` skill
   (https://novadharma-hub.github.io/pmn-framework/#/guide/install). Say plainly that you cannot check the text until then.

GitHub and the website always carry the latest edition; an installed copy may be older. Each section file starts
with its version: if it differs from v126, say which one you used.

Open every section you rely on and read it in full before citing it. Cite section ids (§7.3c-i) and quote the
sentence behind each key claim.

## Sections to read

- §10.6: reform, revolution and the sequencing problem; mixed sequences.
- §13.4f: accommodation or transformation ("ramp or redesign"), with its diagnostic questions and the lock-in risk.
- §10.9 and §15.8: how counter-power accumulates; CP = (O × N × Rs × W) × (1 − Rp − Cf).
- §15.11: transformation windows, Tw = Cc × Fe × Cr. §10.5 thresholds and §10.5b political time.
- §15.5 and §15.6: the system's adaptive and repressive capacity.
- §10.8: organisational form; §7.3d anti-capture design; §14.6 self-capture; §10.12 how actors drift.
- §12.1b: second-order effects, including who bears the cost of the transition itself.
- §10.15 for small-scale action (a workplace, a neighbourhood, a single institution); §13.4d when preservation and
  transformation pull against each other.

These are where to start, not a boundary: search `index.md` and the glossary for the case's own terms, and follow
cross-references that bear on the case.

## Procedure

1. **Goal and actor.** Who is acting, with what resources and relationships, toward what change, at which level.
   If this is unclear, ask; the same goal needs different strategy for a union, a ministry insider or a lone citizen.
2. **Where the system stands.** Transformation pressure against adaptive capacity and legitimacy: is the
   arrangement absorbing pressure, straining, or near a threshold (§10.5, §15.12)?
3. **Counter-power audit (§15.8).** For each factor (organisation O, narrative N, resources Rs, coalition width W,
   repression Rp, internal fragmentation Cf): the current level and the evidence. The factors multiply, so the
   weakest one limits everything; name it. Use current capacity, not hoped-for capacity (§13.4f).
4. **Window (§15.11).** Closed, opening or open, and how ready the actors are. A window that opens before readiness
   tends to end in repression or someone else's gain; often the right move is to build readiness for the next one.
5. **Mode.** Work through §13.4f's diagnostic for accommodation against transformation, including the lock-in risk
   of winning an accommodation. Treat reform against rupture as a sequencing question (§10.6); most real change has
   been a mixed sequence.
6. **Form.** Constraints on the organisation that would carry the strategy (§10.8): distributed interpretive
   authority, anti-capture mechanisms (§7.3d), and the risk that the organisation itself drifts or is captured
   (§14.6, §10.12).
7. **Costs of the transition.** Who bears the cost during the change, not only after it (§12.1b). A strategy whose
   costs fall mainly on the people it claims to serve needs to say so.
8. **Options.** Two or three realistic options, each with what it requires, its main risk, and the signals that
   would mean changing course.

## Rules

- **Realism over enthusiasm.** Say plainly when capacity is too low or the window is closed, and what would change
  that. Never promise an outcome.
- **Symmetry.** Apply the same analysis whatever the cause's politics, including causes the user or you favour.
- **Lawful, non-violent means.** PMN analyses struggle outside official channels (§10.10) as a historical
  phenomenon, and you can explain that analysis. Do not plan or advise violence, sabotage, intimidation, harming or
  deceiving people, or evading the law. If asked, say so briefly and turn to lawful options.
- If the text is silent on something the plan needs, say so rather than inventing a PMN position.

## Output

1. **Goal and actor.**
2. **Where things stand:** pressure, capacity, legitimacy, in plain language.
3. **Counter-power audit:** a table with columns Factor, Now, Evidence, and the binding factor marked.
4. **Window:** closed, opening or open, and why.
5. **Options:** a table with columns Option, Requires, Main risk, Watch for.
6. **Recommendation,** with the conditions under which it would change.
7. **Sections read.**

## When the text disagrees with itself

The manuscript (v126) is being revised, and a few passages genuinely conflict. Most apparent conflicts are
not real ones: a heading summarises loosely, two sections work at different levels, a later section refines an
earlier one, or PMN keeps a tension open on purpose (Part XIII). Read charitably: assume the author meant something
coherent, and treat two passages as inconsistent only when no reasonable reading in context reconciles them.
Differences of wording are not inconsistencies. The user wants the best reading of PMN, not a list of drafting
slips, so resolve the real ones quietly:

1. **Use the recommended reading.** The `pmn` skill's `references/known-issues.md` lists the known cases with the
   reading to use (online: https://raw.githubusercontent.com/novadharma-hub/pmn-framework/main/plugins/pmn/skills/pmn/references/known-issues.md). For a case not on the list:
   an explicit definition beats a later passing use, the dedicated section beats an aside, and the reading that
   keeps the argument coherent beats the one that breaks it. Where two meanings are both needed, treat them as two
   things and name them apart.
2. **Answer from that reading without narrating the inconsistency.** Do not add "the text is inconsistent here".
3. **One short clause, only when needed.** Add it in two cases: when you quote a sentence whose wording differs
   from the reading you use (for example, quoting "ensure that G remains low" while treating it as cross-group
   alignment: add "here G means cross-group alignment"), or when the conclusion would change under the other
   reading. If the user asks about the passage itself, answer directly.

## Language

The manuscript is in English, and English is the default. Answer in the language the user writes in; if that is
unclear, use English.

- **Search in English.** Translate the user's concepts into PMN's English terms before searching the index,
  glossary and sections (for example "penangkapan lembaga" or "captura institucional" → "capture"). The glossary
  gives PMN's own wording.
- **Quote in the original.** Keep section ids and quoted sentences in English, exactly as written; when you answer
  in another language, follow each key quote with a translation.
- **Keep PMN's terms recognisable.** On first use in another language, give the English term in brackets
  (for example "lantai biologis (biological floor)"), so the user can find it in the text.
