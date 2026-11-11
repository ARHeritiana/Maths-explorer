# Internal prerequisites and scope

Maths Explorer now has an advisory prerequisite audit built around its own chapter catalogue and exercise registry.
It is an authoring tool, not a student assessment system, a personal progress tracker or a publication gate.
Retained English curriculum editions are not audited or changed.

## Run it

```sh
npm run check:prerequisites
node scripts/check-prerequisites.mjs --course premiere --details
node scripts/check-prerequisites.mjs --seed-count 8
node scripts/check-prerequisites.mjs --fingerprint exam-eam-01
npm run check:prerequisites:strict
```

The ordinary command writes `build/out/prerequisites/report.json` and `build/out/prerequisites/report.md`.
A course-filtered run writes into a subdirectory named for that course, preserving the full report.
Those generated reports are git-ignored and never copied into the deployed site. They include question numbers,
statement/hint/solution fields, chapter context, source locations, prerequisite chains and where a concept is introduced.
`make check` and the existing CI workflow run this advisory command automatically. They show the summary, without uploading
internal reports as public workflow artifacts. A successful report-generation check does not mean the content is clear.

The ordinary command exits successfully when it can generate a valid report, even when content needs attention.
Malformed catalogue configuration exits unsuccessfully. `--strict` is an explicit authoring choice and exits unsuccessfully
for unresolved content findings or missing declarations. It is not used by the publication workflow.

## Sources of truth

- `content/data/manifest.json` supplies the actual course ids, chapter ids and numeric chapter order. No second chapter list is maintained.
- `content/data/prerequisites.json` supplies the concept graph, entry assumptions, introduction placements, explicit course inheritance
  and per-resource/per-question contracts. Its stable concept ids are different from the readable target-skill sentences retained as internal metadata; those sentences are not displayed for now.
- `scripts/prerequisite-model.mjs` interprets the graph and ordered contracts. `scripts/check-prerequisites.mjs` reads the real exercise registry,
  calls the real generators, reads authored French decks, and scans French chapter sources listed in the books manifest.

The initial profiles cover Seconde, Première spécialité, Terminale spécialité, maths expertes and Terminale STMG.
The mappings describe this site's progression; they do not certify an official programme. A historical exam label never grants scope.
New courses require explicit profiles. Unmapped catalogue courses and unsupported source contexts remain visible in report coverage.

The 24 original EAM/E3C/Bac exercises have explicit contracts for every question, checked separately at every linked chapter.
Existing fixed/seeded exercises, generators, decks and TeX chapters are also scanned. Most legacy content has no explicit contract yet:
that coverage is marked unannotated, never certified by an absence of text matches. The report does not claim complete semantic coverage.
The first seed is reproducible; the default scan checks four seeds at each supported generator level. More seeds improve sampling,
but no finite sample proves that every possible random variant is correctly scoped.

## What the model distinguishes

1. Entry knowledge explicitly assumed for the course, including completed courses explicitly listed in `inherits`.
2. Concepts introduced in earlier chapters of this course.
3. Concepts taught by the current chapter, available in its practice phase.
4. Concepts scheduled later in the course, or absent from this course's scope.
5. Definitions supplied in this particular problem, and results established by its earlier questions.

A parallel course never supplies knowledge automatically. An internal caller can pass explicit `completedChapters`, including a known
chapter from another profile. There is no inference from a student's age, year label, browsing history or a numerically larger course name.

Inside a lesson, a chapter number alone is insufficient to resolve local order. A precise introduction can be declared as:

```json
{"chapter":"premiere-09","sequence":"slide:premiere-09","unit":7}
```

The audit context must name that same sequence and its current unit. A TeX line number cannot accidentally stand in for a slide number,
and an English edition cannot silently use a French edition's positions. Without matching unit annotations, local order remains unresolved.
Current legacy lesson scans identify later-chapter/out-of-course mentions; they do not certify within-chapter teaching order.

## Question contracts

Each contract is keyed by the existing resource id. For a fixed exercise it has this shape:

```json
{
  "sourceHash": "sha256-of-the-current-statement-hints-solutions-and-question-order",
  "requires": ["numbers.rational"],
  "parts": [
    {"requires":["algebra.linear"],"establishes":["algebra.factorisation"]},
    {"requires":["algebra.factorisation"]}
  ]
}
```

This is an illustrative contract, not a claim that any first-degree question teaches factorisation. The actual requirements and
established result must match the mathematics of the question. Every part needs a `requires` array, even when it is deliberately empty.
The checker verifies part counts. It also compares `sourceHash` with the current content, so reordering questions or changing a hint or
solution cannot leave an old declaration silently trusted. After reviewing the source and its concept declarations, print its current hash
with `--fingerprint <resource-id>` (or `resourceFingerprint` from the model) and update the contract explicitly. There is no automatic approval or hash-adoption step.

- `requires`: knowledge used to answer this question; all transitive prerequisites are also checked.
- `provides`: concepts whose definition is supplied in the problem or question itself; available locally from that point.
- `establishes`: results proved by this question; usable by later questions, never by this question to justify itself.
- `mentions`: deliberate references that are not required, each with a concept id and a nonempty reason.
- `extensions`: deliberate work outside the ordinary course context, each with a concept id and a nonempty reason.

Example of an exception entry: `{"concept":"functions.logarithm","reason":"Optional extension; the definition and required properties are supplied."}`.
Exceptions name exact concepts. They do not waive their other unmet dependencies. A mention cannot cancel a declared requirement.
A supplied definition outside the course is still flagged unless explicitly acknowledged as an extension. An acknowledged extension
remains labelled `declared-extension` in the internal result, rather than ordinary clearance.
Definitions and established results are local to this resource. A question with unresolved declared prerequisites cannot grant knowledge
that conceals the next question's missing prerequisite. Establishing a result does not silently grant all of its prerequisites.

Generators can use an optional `levels` object with contracts for levels `1`, `2` and `3`, in addition to common root requirements.
A level without a contract remains unannotated. Their `sourceHash` is the SHA-256 signature of the exercise generator directory used by
the collector, covering helper changes as well as the generator itself. This intentionally conservative signature can become stale after
an unrelated generator edit; review is preferable to silently trusting changed helper behaviour. Seeded problems use that signature too.

## Findings and their meaning

| Finding | Meaning | Usual response |
|---|---|---|
| `FUTURE_CONCEPT` | Required concept is scheduled after this chapter or lesson unit | Move the question, split the problem, or supply a justified local scaffold |
| `OUT_OF_SCOPE` | Concept is not taught or assumed by this course profile | Correct the placement or explicitly declare and explain an extension |
| `UNRESOLVED_ORDER` | Same-chapter lesson order has not been specified precisely | Add a matching sequence and introduction unit |
| `UNDECLARED_CONCEPT` | Text suggests a concept absent from the declaration | Inspect the statement, hint or solution and complete or justify the annotation |
| `UNANNOTATED_REQUIREMENTS` | Explicit dependency metadata is missing | Annotate the resource; lexical silence is not clearance |
| `STALE_CONTRACT` / `UNVERSIONED_CONTRACT` | Source changed since annotation, or the declaration lacks a source fingerprint | Recheck requirements against current content before updating the hash |
| `UNKNOWN_CONCEPT`, `UNKNOWN_POSITION`, `CONTEXT_MISMATCH` | An id or placement cannot be interpreted safely | Repair the annotation or catalogue |
| `CONCEPT_CYCLE`, `PROFILE_CYCLE`, `INVALID_PLACEMENT` | The prerequisite model itself is inconsistent | Repair the model before using its results |
| `ACKNOWLEDGED_MENTION`, `ACKNOWLEDGED_EXTENSION`, `LOCAL_DEFINITION` | Deliberately documented local context | Keep the rationale; these are not student-facing labels |

Every content finding states whether it came from a declared dependency or lexical detection. The latter looks for recognised words and
mathematical notation separately in the question, hint and solution. It produces candidates for review, not proof that a concept is required.
It can miss synonyms and implicit reasoning; a quotation, negation or counterexample can also cause a false positive. Use explicit contracts
and reasoned mention annotations, not increasingly permissive regular expressions, to resolve those cases.

## Extend the system

Add a concept with a label, prerequisite ids and selective detection patterns; place it in each relevant course or declare prior knowledge.
Then add or update the resource contract, preserving question order, and run the advisory report. Course placements should be checked against
the actual lesson, not inferred from an exercise's title or a foreign/historical examination. Do not translate curriculum lessons while bilingual
work is on standby. Add adversarial regression fixtures when a newly discovered failure mode needs protection.
