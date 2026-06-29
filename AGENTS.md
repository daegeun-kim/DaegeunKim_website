# AGENTS.md — DaegeunKim Portfolio Website

Rules and conventions for Codex when working in this repository.

---

## 0. Scope — This Repository Only

Only modify files within this portfolio website repository (`DaegeunKim_website`).
Do not create, edit, or delete files in any other repository, including the original project repositories that may be provided as reference material.

Reading the original project repository is allowed and expected — it is the source of content for new subpages. But write access is strictly limited to this portfolio repo.

---

## 1. UTF-8 Encoding — No Mojibake

All HTML files must have `<meta charset="UTF-8">` in the `<head>`.

When writing text content in HTML, use only plain ASCII or correct Unicode characters. Never produce garbled multi-byte sequences. Common offenders to avoid:

| Wrong (mojibake) | Correct alternative |
|---|---|
| `Â°` | `&deg;` or `°` |
| `â€"` | `&mdash;` or `—` |
| `Ã—` | `&times;` or `×` |
| `âˆˆ` | `&isin;` or `∈` |
| `â€™` | `&rsquo;` or `'` |
| `â€œ` / `â€` | `&ldquo;` / `&rdquo;` or `"` / `"` |

When in doubt, use the named HTML entity (`&mdash;`, `&deg;`, etc.) rather than the raw Unicode character.

---

## 2. File That Must Never Be Modified

**`index.html` is off-limits.** It is maintained manually by the owner. Do not touch it under any circumstances — not to add project links, not to fix formatting, not for any reason.

**`about.html`** may be edited only if explicitly instructed.

---

## 3. CSS Scope

Only two files use the shared `styles.css` in the root folder:
- `index.html`
- `about.html`

All subpage HTML files load their own CSS from their corresponding `work##/` folder. Do not reference or modify root `styles.css` for any subpage.

---

## 4. File Structure for New Projects

Each project consists of exactly two things:

**A. A single HTML file at the root level:**
```
<projectname>.html
```
The filename should be lowercase, no spaces (use hyphens or camelCase to match existing convention).

**B. A work folder containing all supporting assets:**
```
work##/
  work##.css
  work##.js         (if needed)
  *.png / *.jpg     (images)
  other assets...
```

The `##` number is determined by sequence — always use the next number after the highest existing `work##` folder. As of the current state of the repo, `work13` is the highest, so the next project uses `work14`.

The HTML file links to its CSS as:
```html
<link href="work##/work##.css" rel="stylesheet"/>
```

Do not place any subpage assets in the root folder or in another project's `work##` folder.

---

## 5. Subpage Style Consistency

All subpages should look visually consistent with each other. The canonical style references are:

- `neural_floorplan.html` + `work13/work13.css`
- `explorentory.html` + its corresponding work folder CSS

When creating a new subpage, refer to these two files for the expected structure and style patterns. Key elements to match:

- **Header:** `<div class="header">` with `id="header"`, containing `<p id="name">` and `<div class="nav">` with navigation buttons (Works, LinkedIn, Github, About)
- **Main content width:** use `<main>` with max-width and margin as in the reference pages
- **Background and font colors:** match existing subpages
- **Typography:** font family, size scale, and weight as in the references
- **Section structure:** `.intro`, `.section-title`, `.subsection-title`, `.text` class pattern
- **Footer:** simple text footer at the bottom of `<main>`

Style may vary slightly per project type — specific deviations will be noted in the `task.md` file provided with each new project task.

### Responsive Design

All subpages must work on both desktop and mobile. Use `clamp()` for font sizes, widths, padding, and any other properties that need to scale with viewport. Do not use fixed pixel sizes for layout-critical dimensions. Reference the existing `work##.css` files for `clamp()` usage patterns.

---

## 6. Workflow for Adding a New Project

When given a new project to add:

1. Read the original project repository to understand the content (what the project does, its technical stack, key results, visuals, etc.). Do not modify anything there.
2. Determine the next `work##` number by checking the highest existing folder.
3. Create `work##/work##.css` with all styles for the new subpage.
4. Create `<projectname>.html` at the root, following the style patterns of `neural_floorplan.html` and `explorentory.html`.
5. Place all images and other assets referenced by the HTML into `work##/`.
6. Do not update `index.html` — the owner handles that manually.
7. Refer to `task.md` (provided at task time) for any project-specific instructions or style deviations.

For the implementation approach, look at existing subpages that are technically similar to the new project (e.g. if the project involves data visualization, reference subpages that use D3 or canvas; if it's a static writeup, use a simpler reference).

---

## 7. General Code Quality

- All text visible on the page must be in standard English with no encoding artifacts (see Rule 1).
- Do not introduce JavaScript frameworks or build tools. The stack is vanilla HTML, CSS, and JS.
- External scripts (e.g. D3.js) may be used if the project warrants it, consistent with existing subpages.
- Keep the `<head>` clean: charset, viewport, CSS link, title, favicon, and any necessary external scripts only.
- Favicon: `<link rel="icon" type="image/png" href="image/favicon.png">` (already in root `/image/` folder).
