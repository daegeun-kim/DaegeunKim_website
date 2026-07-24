# Task 01: Phase 1 Homepage Refinement

## Purpose

Refine the completed Phase 1 homepage before beginning Phase 2.

Read this file together with `task.md`. This file overrides the Phase 1 visual details in `task.md` where they differ. Do not begin the About-page redesign or any Phase 2 work after completing this task.

Use the Claude `frontend-design` plugin and professional UI judgment. The current direction is successful in being minimal and calm, but it remains too close to the original website and contains several typography, hierarchy, image, divider, and card-alignment problems.

The refinement should preserve the minimal character while making the homepage more confident, distinctive, and representative of an AI engineer, design technologist, and computational designer working across AEC and spatial fields.

---

## 1. Scope

Primary files:

- `index.html`
- `home.css`
- `shared/site.css`
- `shared/site.js`

Claude may reorganize these files and create additional shared or homepage-specific files if doing so produces a cleaner structure.

Restrictions:

- Do not begin Phase 2.
- Do not redesign `about.html`.
- Do not redesign any project page.
- Do not rename project folders.
- Do not change root project HTML filenames or public URLs.
- Do not run Git commands or perform Git management.
- Do not delete existing project assets.
- Preserve the current visible project order.
- Preserve the commented-out project cards and keep them commented out.

`about.html` still depends on the legacy root `styles.css`. Do not delete, rename, or aggressively rewrite `styles.css` in a way that breaks the current About page. Its complete cleanup can occur when About is redesigned in Phase 2.

---

## 2. Code Cleanup and Organization

The original website was manually written and contains inconsistent, duplicated, and outdated code. Clean up the Phase 1 codebase while implementing the visual changes.

Requirements:

- Keep shared tokens and global components in `shared/site.css`.
- Keep homepage-only composition and card styles in `home.css`.
- Keep shared navigation, reveal behavior, and global interactions in `shared/site.js`.
- Keep homepage-only JavaScript separate if it becomes substantial.
- Remove dead or duplicated Phase 1 CSS and JavaScript after verifying it is unused.
- Consolidate repeated colors, spacing, type sizes, transitions, borders, and radii into clear custom properties.
- Use meaningful class names and predictable component groupings.
- Avoid excessive selector specificity and inline styles.
- Avoid adding a framework, package manager, or build step.
- Keep comments concise and useful.
- Preserve semantic HTML and accessibility behavior.
- Do not retain code merely because it existed in the old homepage.

Do not perform cleanup that changes unrelated project functionality.

---

## 3. Fix Blurry Typography Across the Homepage

### Existing problem

Small light text looks blurred at normal browser zoom and normal display scaling, especially:

> Retrieval systems, computer vision, and LLM-driven workflows applied to design and spatial data.

The current system combines:

- a global `font-weight: 300`
- small fluid text that can resolve to approximately 13 to 14 fractional CSS pixels
- low-contrast gray
- a font stack that names Inter without actually loading it
- no Windows-optimized fallback before Arial

The issue improves above 125 percent display scaling because the text receives more physical pixels.

### Required typography correction

Fix this as a system-level issue, not as a one-off override for one sentence.

Use a reliable Helvetica-oriented system stack:

```css
font-family: "Helvetica Neue", Helvetica, "Segoe UI", Arial, sans-serif;
```

If Claude chooses to use Inter instead, it must be loaded correctly and legally as a real webfont. Do not leave an unloaded font name in the stack. Do not use Apple SF Pro or copy proprietary font files.

Typography rules:

- Use `font-weight: 400` as the normal body-copy weight.
- Do not apply weight 300 globally to all body text.
- Reserve weight 300 for sufficiently large text that remains crisp after testing.
- Use weight 400 or higher for small body copy, project descriptions, filters, navigation, metadata, and capability descriptions.
- Avoid important body copy below 15 CSS pixels.
- Avoid fluid formulas that repeatedly produce fragile fractional sizes for small text.
- Use darker text tokens for readable body copy.
- Do not rely on `-webkit-font-smoothing` or `text-rendering` to compensate for weak typography.
- Remove or revise rendering properties if they make cross-platform results less predictable.
- Maintain a clear difference between primary, secondary, and metadata text without making secondary text faint.

Audit all homepage text using this font system, including:

- hero text
- hero supporting text
- capability headings and descriptions
- navigation
- filters
- project metadata
- project summaries
- project tags
- footer

The goal is not to make all text visually heavy. The goal is crisp, deliberately weighted typography at 100 percent browser zoom.

### Typography verification

Test at:

- 100 percent browser zoom
- 125 percent browser zoom
- approximately 375px, 768px, 1280px, and 1440px viewport widths
- a Windows Chromium-based browser when available

Compare the capability descriptions, project summaries, filters, and metadata carefully. Text must not depend on display scaling to appear sharp.

---

## 4. Make the Hero Statement Bold

The full hero statement must use a clearly bold treatment, not weight 300:

> I build AI and computational tools for the built environment.

Requirements:

- Make the entire hero statement bold.
- Use a true bold weight supported by the selected font, normally 700.
- Preserve strong readability and clean line breaks at desktop and mobile widths.
- The colored accent may remain, but it must not be the only element that creates emphasis.
- Review letter spacing and line height for the heavier weight.
- Avoid making the hero look like a generic oversized software landing-page headline.

---

## 5. Replace "Built Environment" in the Hero

Replace the words "built environment" because they do not clearly include the geospatial and larger spatial scale of the work.

The replacement must cover:

- architecture and buildings
- AEC
- cities and urban systems
- geospatial and spatial work

Claude should choose the strongest concise wording. A suitable direction is:

> I build AI and computational tools for buildings, cities, and spatial systems.

Another acceptable direction is:

> I build AI and computational tools for AEC and spatial systems.

Use the version that reads best in the final composition. Do not use vague phrases such as "the future," "the world," or "innovative solutions."

Update the page title, description, hero-supporting text, or other homepage wording when necessary so the terminology remains consistent.

---

## 6. Avoid Em Dashes

Avoid using the em dash character or its HTML entity in visible website text:

- `—`
- `&mdash;`
- `&#8212;`

Rewrite sentences using:

- periods
- commas
- colons
- parentheses
- carefully structured shorter sentences

Do not mechanically replace every em dash with a hyphen. Rewrite the sentence so the punctuation reads naturally.

The current page title and hero description contain em dashes and must be revised. Avoid adding new em dashes in future visible content.

Code comments may also be normalized when touched, but visible content is the priority.

---

## 7. Strengthen Section Separation

The current divider lines between sections are too thin and too close in value to the background. They are nearly invisible.

Improve the section hierarchy by:

- strengthening the divider color tokens
- using a more visible line weight where appropriate
- increasing spacing around major transitions
- distinguishing major section separators from minor card-level separators
- ensuring dividers remain visible on common displays without becoming heavy rules

Do not solve this by placing every section inside a bordered card.

Review at least:

- the capability strip boundary
- the Selected Work header boundary
- project tag separators
- header scrolled-state border
- footer boundary

Create distinct shared tokens for subtle and strong dividers if useful. Key section separators should be visibly stronger than internal metadata rules.

---

## 8. Restore the 2:1 Project Image Ratio

All homepage project images were prepared at a 2:1 aspect ratio.

The current `16 / 10` media container crops important image content. Restore the intended ratio:

```css
aspect-ratio: 2 / 1;
```

Requirements:

- Every project image container must use the same 2:1 ratio.
- Preserve the full meaningful image composition.
- Avoid hover zoom effects that crop important edges.
- If a subtle hover effect remains, use one that does not hide image content.
- Do not distort images.
- Do not use inconsistent per-card aspect ratios.
- Check every visible project thumbnail individually after the change.
- Also ensure the commented-out cards will use the same image treatment when enabled.

If an existing source image is not exactly 2:1, prefer a non-destructive presentation that retains meaningful content rather than aggressive cropping.

---

## 9. Remove the Misleading Blue Dash

The blue horizontal line before these capability headings is visually unclear:

- AI & Machine Learning
- Computational Design
- Geospatial & Data

It currently comes from the `::before` decoration on `.focus__group h2`.

Remove that dash. Do not replace it with another unexplained decorative mark.

If a visual identifier is useful, use an element with a clear system, such as:

- a small category number
- a clear label
- a restrained icon with a meaningful relationship
- a color block integrated into the layout

The replacement must improve comprehension and hierarchy. It must not look like a minus sign, progress indicator, or stray divider.

It is acceptable to use no marker if typography and layout provide sufficient hierarchy.

---

## 10. Make the Hero and Capability Area More Impactful

The `.hero.container` and `.focus.reveal` area may make a bolder visual move while retaining the site's minimal character.

The current capability strip is too quiet and too similar to the old portfolio's plain text presentation.

Improve this area through a combination of:

- stronger, bolder hero typography
- a more deliberate relationship between the hero statement and supporting paragraph
- clearer hierarchy among the three capabilities
- bolder capability headings
- stronger but restrained section composition
- purposeful use of blue and teal
- improved spacing, alignment, or asymmetric balance
- a distinctive visual or spatial element if it communicates the professional identity

The three capability descriptions must remain concise and readable.

Do not:

- add generic glowing gradients
- add a decorative 3D object
- add a custom cursor
- add continuous animation
- turn the area into three generic SaaS feature cards
- add effects merely to make it look different

Claude may make a substantial layout change if it is a stronger representation of design technology, AI, computation, and spatial work.

---

## 11. Make the Header Wordmark Bold

Make "Daegeun Kim" in the header clearly bold.

Requirements:

- Use a true bold or strong semibold weight, normally 700.
- Keep it visually balanced with the navigation.
- Preserve the link to `index.html`.
- Maintain accessible focus and hover behavior.
- Confirm the heavier weight does not cause mobile wrapping or header-height instability.

---

## 12. Standardize Project Card Dimensions and Alignment

The project cards currently place `.project__tags` at different vertical positions because project summaries have different line counts. This creates an inconsistent grid.

Correct the card system using robust layout rules.

Desktop requirements:

- Project cards in the same grid row must have equal total height.
- Image regions must have the same 2:1 dimensions.
- Metadata, title, summary, and tag regions must follow a consistent vertical rhythm.
- Tag sections must align at a common lower baseline across cards in the same row.
- Do not truncate or hide project descriptions merely to force equal height.
- Do not use fragile fixed heights that break when text wraps or the viewport changes.
- Use CSS Grid or Flexbox stretching and an expandable summary/content region.
- A suitable approach is `margin-top: auto` for the tag region within equal-height flex/grid cards, but Claude should choose the cleanest robust implementation.

Mobile requirements:

- Cards may use natural content height in a single-column layout.
- Internal spacing must remain consistent.
- Tag sections must not create excessive empty space.

Also audit:

- consistent title spacing
- consistent metadata placement
- consistent tag padding and divider position
- consistent card gaps
- image-to-text spacing
- hover target boundaries
- card link semantics

These are baseline UI quality requirements. Apply the same attention to alignment, rhythm, and repeatable dimensions throughout the homepage rather than fixing only the specific tag issue.

---

## 13. Visual Freedom Within the Approved Direction

The user likes the minimal direction, but the homepage is still too similar to the original version.

Claude may make one or more bolder design moves if they:

- strengthen Daegeun's identity as an AI engineer and design technologist in AEC
- improve hierarchy or navigation
- connect technical and spatial work visually
- remain calm and professional
- remain understandable without explanation

Possible areas for stronger authorship:

- hero composition
- project-grid rhythm
- capability presentation
- typography scale
- restrained editorial asymmetry
- project numbering or categorization
- meaningful interaction tied to project imagery

Do not make a bold move solely for novelty. The final result must still prioritize visual clarity over interactivity.

---

## 14. Accessibility and Interaction

Preserve and verify:

- semantic heading hierarchy
- keyboard navigation
- visible focus states
- sufficient text and divider contrast
- reduced-motion behavior
- mobile navigation
- project filtering
- full-card link behavior without invalid nested interactive elements
- readable line lengths
- meaningful alt text
- touch-friendly controls

If reveal animations contribute to text blurriness or leave text on a transformed compositing layer, revise or remove them. Text clarity is more important than reveal animation.

---

## 15. Acceptance Criteria

This task is complete only when:

- small homepage text is crisp at 100 percent browser zoom
- normal body and small descriptive text use weight 400 or another verified crisp weight
- the font stack works predictably on Windows and macOS
- the full hero statement is bold
- "built environment" has been replaced with inclusive spatial wording
- visible homepage copy avoids em dashes
- major section dividers are clearly visible
- every project thumbnail uses a 2:1 container
- important image content is not cropped by the default or hover state
- the unexplained blue dash before capability headings is gone
- the capability area has stronger hierarchy and impact
- "Daegeun Kim" in the header is bold
- project tag sections align consistently across desktop card rows
- cards use robust equal-height layout without text truncation
- the visible project order remains unchanged
- commented-out project cards remain present and commented out
- filters, navigation, project links, and reveal behavior work
- the current About page still works and remains visually intact
- no public root HTML URL changes
- no existing asset is deleted
- no Phase 2 work begins

---

## 16. Verification and Handoff

Serve the website locally and visually inspect the refined homepage.

Test:

- approximately 375px, 768px, 1280px, and 1440px viewport widths
- 100 percent and 125 percent browser zoom
- keyboard-only navigation
- reduced-motion mode
- all project filters
- all visible project links
- all project thumbnails
- equal-height card behavior
- text sharpness
- section-divider visibility
- mobile header behavior
- absence of unintended horizontal overflow
- browser console errors

Provide:

- concise explanation of the typography fix
- summary of the stronger visual changes
- changed-file inventory
- desktop and mobile visual evidence
- confirmation that `about.html` still works
- any remaining limitations

Then stop and ask the user to approve the refined Phase 1 homepage before continuing to Phase 2.
