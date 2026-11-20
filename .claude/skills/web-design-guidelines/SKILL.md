---
name: web-design-guidelines
description: Review UI code for Web Interface Guidelines compliance (accessibility, focus, forms, animation, touch, layout, theming, copy). Use when asked to "review my UI", "check accessibility", "audit design", "review UX", "check ergonomics", or after building or changing any page, exhibit, control or panel of this site.
metadata:
  author: vercel (adapted for Maths-explorer)
  version: "1.0.0"
  argument-hint: <file-or-pattern>
---

# Web Interface Guidelines

Adapted from vercel-labs/agent-skills `web-design-guidelines` (MIT, see LICENSE). Change: the rules are read from the
pinned local copy `rules.md` instead of being fetched at each run, so a review does not depend on the network and the
rules do not change under the project without a commit.

## How it works

1. Read `rules.md` in this folder (the Vercel Web Interface Guidelines).
2. Read the specified files (or the files changed by the current task).
3. Check them against every rule, with the project overrides below.
4. Output findings in the terse `file:line` format of `rules.md`, then fix them.

## Project overrides (Maths-explorer and Matematika)

`docs/DESIGN_V8.md` governs the look; where a rule below conflicts with it, the design document wins.

- Copy: French and English, sentence case. Ignore "Title Case for headings/buttons" (titles are already capitals by the
  comic style). No em or en dashes in copy (`site/CLAUDE.md`). French typography: a space before `: ; ? !`, decimal comma.
- The site is plain ES modules with no framework: read React-specific rules (`useState`, hydration, `<Link>`, nuqs) as
  their plain-DOM equivalents (hash routes for state, `<a href="#...">` for navigation).
- Numbers come from `Intl` or the lab formatter `site/js/lab/format.js`; mark rounded values ≈ and exact ones =.
- Canvas figures: every drag needs a tap or keyboard alternative; touch targets at least 44 px; the figure must never trap
  page scrolling (`site/js/canvas-navigation.js` policy).
