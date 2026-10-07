# Maths Explorer — design and learning plan

## Purpose and audience

Create an experimental mathematics laboratory for students studying high-school mathematics in Malagasy, French, and International Baccalaureate contexts. The website is a separate educational project, with no tutoring advertisements, booking flows, or private-tutoring identity.

The primary action is mathematical experimentation. A student should reach a functioning graph and meaningful controls immediately, without passing through a marketing page or creating an account.

## Learning model

Each experiment follows the same short sequence:

1. **Predict:** ask what will change before moving a control.
2. **Experiment:** vary one parameter and observe a graph and numerical results.
3. **Conjecture:** identify what seems to remain true.
4. **Explain:** connect the observation with a formula or mathematical argument.
5. **Check:** answer one focused question, then read the explanation.

Experimentation provides evidence and intuition; it is not presented as proof. The derivative and probability activities explicitly explain this distinction. Challenges reward reasoning by placing progressive hints and a worked argument next to the numerical check.

**Learning time** is a compact activity panel with prerequisites and an estimated duration of 6–10 minutes. It does not impose a timer. **History box** connects the current idea to a historical development and links to a source. These are contextual learning features, not unrelated popups.

## Information architecture

| Surface    | Main student action                               | Included content                                                                  |
| ---------- | ------------------------------------------------- | --------------------------------------------------------------------------------- |
| Laboratory | Change parameters and observe                     | Nine experiments with controls, graphs, readouts, learning activities and history |
| Challenges | Try a problem, request a hint, explain a solution | Four recreational and four Olympiad-style problems                                |
| Pathways   | Choose an appropriate next topic                  | Malagasy, French and IB topic groupings, prerequisites and source notes           |

Direct links use hash routes so they work without server routing. Curriculum pathways navigate to the same experiments instead of maintaining duplicate versions of the mathematics.

## Visual and interaction design

The visual direction is a modern mathematical notebook: white working surfaces, dark teal ink, a restrained green accent, fine graph grids, and serif mathematical expressions. Charts provide the visual interest. There are no decorative images to download.

On desktop, a topic sidebar sits beside the experiment, with the learning activity adjacent to the graph. On narrower screens, the topic picker becomes a horizontal strip and the activity follows the experiment. Navigation remains limited to three principal destinations. All input controls have visible labels. Slider outputs and numeric results provide alternatives to reading the plotted geometry alone.

French is the initial language, with a persistent FR/EN switch. All lesson text, hints, explanations, errors, curriculum notes and controls are translated. The requested feature names “Learning time” and “History box” remain recognizable in both language modes. Malagasy is represented as a curriculum pathway, not as an unreviewed language translation.

## Implemented experiment scope

| Experiment           | Manipulation                                    | Mathematical connection                                   |
| -------------------- | ----------------------------------------------- | --------------------------------------------------------- |
| Quadratics           | Coefficients a, b, c, including a = 0           | Roots, discriminant, vertex, degenerate cases             |
| Unit circle          | Angle from 0° to 360°                           | Sine, cosine, radians, unit-circle identity               |
| Sequences            | Initial value, increment/ratio, number of terms | Arithmetic vs geometric growth; zero and negative ratios  |
| Binomial probability | n, p, batches of simulated experiments          | Theory vs frequency, expectation, spread, independence    |
| Derivatives          | x and positive nonzero h                        | Secant slope approaching the tangent slope for x²         |
| Integration          | Number of left-endpoint rectangles              | Lower sums approaching the integral of x² on [0,1]        |
| Vectors              | Both components of two vectors                  | Addition, parallelogram, dot product, angle, zero vectors |
| Statistics           | A student-editable numerical data set           | Mean, median, population standard deviation, outliers     |
| Complex numbers      | Real and imaginary components                   | Modulus and the rotation caused by multiplication by i    |

The models deliberately constrain their inputs rather than evaluate arbitrary expressions. Functions outside these models, symbolic algebra, and general-purpose graphing are not claimed as current capabilities.

## Challenge design

Recreational: handshakes, 100 doors, a mutilated chessboard, and the 21-stone game.

Olympiad-style: the pigeonhole principle for residues, divisibility of n³ − n, the minimum of x + 1/x, and the sum of odd numbers.

Each challenge includes a clear statement, an estimated duration, difficulty from 1 to 3, two optional hints, numerical checking, a full explanation, and a follow-up prompt. There are no timed leaderboards. A correct number is marked as “answer found,” not “proof completed.”

## Architecture and privacy

The implemented site uses semantic HTML, CSS, ES modules and SVG. Numerical functions are separated from educational content and UI rendering. It needs no installed production dependencies, API keys or backend. Static assets can be served under either a domain root or a subdirectory.

Only the selected language and successful answer IDs are stored in localStorage. No account, analytics, server submission or cross-device synchronization is included. The app handles malformed storage and rejected writes. Resetting an experiment resets its controls but preserves previously recorded successful answers.

## Delivery and quality gates

The first version is complete when:

- All nine experiments react correctly across their allowed parameter ranges.
- The entire learning journey works in both French and English.
- All eight challenges have working checks, hints and solutions.
- The curriculum pathways open the appropriate experiments and disclose scope limitations.
- Mathematical boundary cases and input validation pass automated checks.
- Browser checks cover desktop, tablet, mobile, 200% text size, keyboard input and saved progress.
- Source, documentation and repeatable checks are pushed to the requested GitHub repository.

See `VALIDATION.md` for the checks performed and their limits. This release is a functioning laboratory with a selected topic collection, not a complete digital textbook.

## Subsequent content development

1. **Curriculum review:** have teachers validate each placement against the specific Malagasy stream, French option and school year, and IB AA/AI SL/HL version. Replace broad placements with reviewed syllabus references.
2. **Extend the experiment library:** logarithmic/exponential models, conditional probability, regression, optimization, transformations and further geometry; add these with the same complete learning pattern.
3. **Student trials:** observe students using a lab without instruction; assess whether they can formulate a conjecture and explain a result. Refine language and interactions from those observations.
4. **Broaden challenge progression:** add proof-only activities and reviewed solutions. Avoid presenting automated numerical checking as proof assessment.
5. **Optional future capabilities:** evaluate offline installation, reviewed Malagasy translations and explicit exportable experiment notes after the core experience has been tested. Accounts, teacher dashboards and AI tutoring are outside this version.
