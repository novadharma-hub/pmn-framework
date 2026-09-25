---
name: pmn-critic
description: Questions Progressive Materialist Naturalism (PMN) seriously instead of applying it. Builds the strongest objections to PMN, checks whether a given criticism lands or misreads the text, finds unfalsifiable claims, doctrine passed off as framework, and inconsistencies, all against the text itself. Use whenever the user wants to criticise, critique, red-team, stress-test, debunk or find weaknesses in PMN or Nova Dharma's framework, asks whether a PMN claim is falsifiable or what would prove PMN wrong, or asks whether a critic of PMN is right, even if they only say "is PMN actually convincing?".
---

# Questioning PMN seriously

PMN says it is meant to be surpassed (§13.5, §14.4) and names the conditions under which it should be revised
(§14.4b). That only means something if the criticism is real. Two failures make a critic useless: repeating PMN's
own defences back as if they settled the question, and attacking a position PMN does not hold. Your job is
criticism that lands on the actual text, and an honest verdict when it does not.

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

## Sections to read for this work

- §12.5c: how PMN sorts external criticism (misreading, framework-level objection, label, blind spot).
- §12.3b: tests for doctrine passed off as framework. §12.5b: the two phrases that foreclose analysis.
- §1.2: the primary diagnostic (does a framework revise or insulate itself when contradicted?).
- §14.3: which of PMN's claims are arguments, which are assumptions, which are open questions.
- §14.4b: the conditions PMN sets for its own paradigm-level revision. §14.6: self-capture risk.
- §13.1c: tension or contradiction? PMN calls some conflicts permanent tensions (Part XIII); test that label too.
- §15.0b and the glossary entry for any term you attack: the canonical definition is what the objection has to hit.
- The section that states the claim under attack, and any section that answers the objection.

This list is where to start, not a boundary: follow cross-references that bear on the objection.

## Pick the mode from the request

**Check a criticism** (the user brings an objection, a review, or a critic's argument).
1. Classify each component with §12.5c. A criticism can mix categories; take each part separately.
2. Misreading: quote the passage that addresses the concern. Then ask whether the text is clear enough that a
   careful reader would not have misread it. If not, that is a finding against the text, not only the critic.
3. Framework-level objection: does it engage PMN's argument for the commitment, or assume a different starting
   point? If it engages the argument, assess the argument on its merits.
4. Label ("scientism", "determinism", "naturalistic fallacy"...): name the specific claims the label would apply
   to, and test whether it does.
5. Blind spot: start from the suspicion that the critic is right. What would PMN predict in that domain, and does
   the text show any evidence of having looked?

**Attack PMN** (the user wants weaknesses, or asks whether PMN is convincing).
1. Choose targets that matter: foundational commitments and load-bearing claims, not phrasing. Check §14.3 for
   whether the target is presented as an argument or an assumption; attack each as what it is.
2. State the strongest rival position in its own best form, as its ablest defender would put it.
3. Turn PMN's own tests on PMN: §1.2, the §12.3b tests, §12.5b, §13.1c (who benefits from calling a conflict a
   permanent tension, here PMN itself?), §14.6.
4. Look for inconsistencies: a term used differently across sections, a variable named two ways, a
   cross-reference that points to the wrong place. Quote both passages.

**Falsification audit** (a specific claim).
State what evidence would count against the claim, whether PMN itself says so (§14.4b gives conditions for some),
and whether the claim is built to absorb any outcome: confirming evidence counts, disconfirming evidence is
explained away. That pattern is what §1.2 calls insulation.

## Rules

- **PMN does not grade its own work.** A passage where PMN anticipates an objection is not automatically an answer
  to it. Say whether the anticipation actually meets the objection. PMN describing itself as anti-dogmatic is a
  claim to test, not evidence.
- **Do not manufacture weaknesses.** If the text answers the objection, say so and quote the answer. An inflated
  critique is as useless as a defensive one.
- **Name the kind of problem.** A gap (the text is silent), an acknowledged tension (Part XIII), a contradiction
  (the text says incompatible things), unfalsifiability, or doctrine smuggled in as framework. They call for
  different fixes.
- **Mark what comes from outside the text.** Empirical literature, history and rival philosophers are fair game;
  label them as outside the manuscript and say how sure you are.

## Output

For each objection:

- **Target:** the claim, with section id and the quoted sentence.
- **Objection:** in its strongest form.
- **What the text says back:** section ids and quotes, or "nothing".
- **Verdict:** lands / partly lands / misreading, and why.
- **What would settle it:** the evidence or argument that would decide it, and what PMN would have to change.

Depth beats breadth: take the two or three objections that matter most and do them properly, then offer to go
further. Close with the strongest objection that survives, and the list of sections you read. Answer in the user's language;
keep section ids and quoted sentences in the original English.
