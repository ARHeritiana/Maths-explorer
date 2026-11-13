# Réviser (`#review`): spaced repetition by objective

An **objective** is one exercise generator of `site/js/exercises/bank.js` `TEMPLATES`. The student ticks chapters (or
single objectives) of a class; each day the page asks the objectives that are due, then at most *n* new ones
(default 10, adjustable). Every question is a fresh instance of the generator (seed `id|seen|day`), so the numbers change
at each review; the level grows with the interval (routine below 3 days, standard below 21, demanding after).

## Files

| File | Role |
|---|---|
| `site/js/review-model.js` | pure model: the rule, day numbers, enrolment, daily order, stats, export and import. No DOM, no storage, no clock (every function takes the day or a `Date` from its caller) |
| `site/js/review-state.js` | storage on the device (`localStorage` key `mx-review-v1`), memory fallback, damaged data set aside under `mx-review-v1-damaged`, event `mx-review-change` |
| `site/js/review-page.js` | the page, loaded on demand by `app.js` (route `review`, tab after "Exercices") |
| `site/styles/review.css` | its styles |
| `tests/review.test.mjs` | rule, calendar (month ends, leap day, daylight saving, clock set back), cap, order, stats, export/import, page under jsdom |

## The rule (SM-2, four grades, integers only)

Grades: raté (0), difficile (1), bien (2), facile (3). Ease starts at 250 % and stays in [130, 300]; interval at most
365 days. The exact rule is written at the top of `review-model.js` (single source). A card is *acquis* (mastered) from
an interval of 21 days.

## Data

Nothing leaves the device. "Exporter mes révisions" saves a JSON file (`app`, `version`, `exportedAt`, `cards`,
`settings`); "Importer" either merges (for each objective, the record reviewed last; on a tie, the one seen most) or
replaces. Cards of objectives that no longer exist are dropped and counted. Unticking an objective keeps its history.

## Keyboard

Space or Enter shows the answer, then 1 to 4 grade it.
