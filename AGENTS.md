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

## 3. Shared Design System and CSS Scope

The site is built on a shared design system in `shared/`:

- `shared/site.css` — design tokens (color, typography, spacing, dividers), header/nav, footer, buttons, focus states, motion, and light/dark theme variables.
- `shared/site.js` — sticky-header behavior, accessible mobile menu, scroll reveals, and (homepage only) project filtering.

Every page loads `shared/site.css` and `shared/site.js`, then a page- or project-specific stylesheet that builds on the shared tokens:

- `index.html` → `shared/site.css` + `home.css`
- `about.html` → `shared/site.css` + `styles.css`
- each project subpage → `shared/site.css` + `<project-slug>/<project-slug>.css`
- `photography.html` → `shared/site.css` + `photography.css`

Do not duplicate the shared header, footer, or token CSS into project folders. Keep only project-specific styles in the project folder. Do not reference the old root `styles.css` from any subpage (it is now the About-page stylesheet only).

---

## 4. File Structure for New Projects

Each project is exactly two things:

**A. A single HTML file at the root level:**
```
<projectname>.html
```
Lowercase filename (hyphens or camelCase to match existing convention). Root project HTML filenames are permanent public URLs — never rename an existing one.

**B. A project folder named with a lowercase kebab-case slug**, holding all of that project's assets:
```
<project-slug>/
  <project-slug>.css
  <project-slug>.js      (only if needed)
  images / data / svg / video / etc.
```

Folders are named by **project**, not by number. There is no `work##` sequence anymore. Link the CSS as:
```html
<link href="<project-slug>/<project-slug>.css" rel="stylesheet"/>
```

Keep already-meaningful filenames (e.g. `map.js`, `config.js`, data files) rather than renaming them to the slug. Do not place subpage assets in the root folder or in another project's folder.

---

## 5. Subpage Consistency (shared subpage system)

All subpages use the shared design system and a common case-study structure so the site reads as one system. Match:

- the **shared header** (`.site-header` with the wordmark + `.site-nav`: Work / About / Contact / LinkedIn / GitHub) and the **shared footer**
- the shared tokens for color, typography, spacing, and dividers
- a case-study section order where applicable: summary, tools/technologies, problem, approach, process, outcome, links
- large figures with clear captions; secondary technical detail in smaller supporting text

Most pages use the bright theme. A project may use the **dark theme** by setting `data-theme="dark"` on the `<html>` element (used by `geoestatechat.html`, `residentialclustering.html`, `mergeprep.html`). Dark pages use the same system and a dark header — never a bright header placed over a dark page.

Canonical references: `bim_rag.html` + `bimtrieval/`, and `neural_floorplan.html` + `neural-floorplan/`.

### Responsive Design

All subpages must work on desktop and mobile. Use `clamp()` (many sizes are already shared tokens) for scalable typography, spacing, and widths; avoid layout-critical fixed pixel dimensions. No unintended horizontal overflow. Honor `prefers-reduced-motion`.

---

## 6. Workflow for Adding a New Project

When given a new project to add:

1. Read the original project repository to understand the content (what it does, its stack, key results, visuals). Do not modify anything there.
2. Create `<project-slug>/` and place all of the project's assets in it. Add `<project-slug>.css` (and `.js` if needed), building on the shared tokens.
3. Create `<projectname>.html` at the root, loading `shared/site.css` + the project CSS + `shared/site.js`, and following the shared header/footer and case-study template (see the canonical references above).
4. Do not update `index.html` — the owner maintains project visibility manually.
5. Refer to any provided `task.md` for project-specific instructions or style deviations.

For implementation approach, look at an existing subpage that is technically similar (D3/Mapbox/SVG for interactive projects; a simpler static page for writeups).

---

## 7. General Code Quality

- All text visible on the page must be in standard English with no encoding artifacts (see Rule 1).
- Do not introduce JavaScript frameworks or build tools. The stack is vanilla HTML, CSS, and JS.
- External scripts (e.g. D3.js) may be used if the project warrants it, consistent with existing subpages.
- Keep the `<head>` clean: charset, viewport, CSS link, title, favicon, and any necessary external scripts only.
- Favicon: `<link rel="icon" type="image/png" href="image/favicon.png">` (already in root `/image/` folder).
