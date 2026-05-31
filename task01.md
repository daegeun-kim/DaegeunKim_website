# TASK: Create portfolio subpage for "Neural Floorplan" project

## Context for the agent (read first)
This subpage will be shown to an interviewer at **Foundation EGI** (an AI-for-CAD/manufacturing
startup). The interviewer, **Mike Foshey**, is a mechanical-engineering researcher whose work is on
**LLMs and ML for design & manufacturing**. The subpage is therefore not a generic portfolio entry —
it is a **technical talking-piece** that should let the author walk Foshey through a real
raster-to-vector-CAD ML pipeline. Optimize for **technical credibility and clear reasoning**, not
marketing polish. Favor accurate, specific, engineering-literate descriptions of what was built and
**why each decision was made**.

> The project converts **raster floorplans (and color-coded sketches) → semantic masks → clean,
> classified CAD-like vector geometry**. It directly parallels EGI's domain (turning messy 2D/3D
> engineering data into structured representations), which is the angle to emphasize.

---

## SCOPE OF FILES (do not exceed)
**Only create or modify the following. All other files must remain unchanged.**
1. **Modify:** `work13/neural_floorplan.html` (the new subpage)
2. **Create:** `work13/work13.css` (subpage-specific styles)
3. **Modify:** `work13/` image and other relevant assets (copied in per the image rule below)
4. **Modify:** `index.html` — add ONE project card under `class="work-grid"` (the subpage description/teaser)
5. **Modify:** `readme.md` of the project repository at
   `C:\Users\kdgki\Desktop\MSCDP\Projects\neural_floorplan` (write a proper project README — see
   "README task" section)

Working directory of the website: `C:\Users\kdgki\Desktop\PI\DaegeunKim_website`
Repository to describe: `C:\Users\kdgki\Desktop\MSCDP\Projects\neural_floorplan`

---

## PROJECT FACTS (verified from the repository — use these, do not invent)

**Title:** Neural Floorplan to Classified CAD
**Goal:** Convert controlled raster floor plans or color-coded sketches into semantic masks, then into
clean, classified CAD-like vector geometry.
**GitHub:** https://github.com/daegeun-kim/neural_floorplan

**Tech stack (state this explicitly on the page):**
- Python 3.11, PyTorch
- Hugging Face Transformers (SegFormer)
- OpenCV (raster processing), Shapely (vector geometry)
- pytest (testing), ruff (lint/format); conda env `floorplan-cad`
- Spec-driven development workflow (versioned specs, one at a time, feature branches) (mention this in overview)

**Full intended pipeline (8 stages — show as the project roadmap):**
1. Dataset loading
2. SVG / raster preprocessing
3. Semantic mask generation
4. Sketch-style augmentation
5. Segmentation model training (SegFormer)
6. Evaluation
7. Mask-to-vector post-processing
8. Classified JSON (CAD-like) export

**Spec history in repo:** v001 foundation · v003 svg_to_raster · v004 sketch_augmentation ·
v005 SegFormer_train · v006 evaluation · v007 mask_to_vector · v008 cad_json

---

## COMPLETED vs PLANNED (critical — the page must be honest about this)
The project is **in progress**. Build the subpage around the **completed** portion and present the
rest as a clearly-labeled **roadmap**.

**COMPLETED (cover in depth):** pipeline stages 1–6 — through **spec_v005 (SegFormer training)** and
into **spec_v006 (evaluation)**:
- Dataset prep from **CubiCasa5K** (raster–vector pairs)
- **SVG → raster** conversion (spec_v003): CubiCasa SVG annotations rendered to PNG masks on white
  background (`model_clean.png`), using the `high_quality_architectural` subset
- **Sketch-style augmentation** (spec_v004)
- **SegFormer training** (spec_v005): pretrained SegFormer backbone + segmentation head;
  **CrossEntropy loss (optional Dice)**; logs **loss and mIoU**; saves checkpoints
- Segmentation **prediction output** for plan components (walls, openings, etc.)

**PLANNED / NOT YET BUILT (show as roadmap, do NOT present as done):** stages 7–8 —
**mask-to-vector** post-processing (spec_v007, Shapely) and **classified CAD JSON export** (spec_v008).

> NOTE TO AUTHOR (Daegeun): your task brief said "up to spec_v004 is complete," but the repo also
> contains **spec_v005_SegFormer_train**, and you stated the CNN/SegFormer training + segmentation
> output is done. I have written the page to cover **through v005/v006 (training + segmentation +
> evaluation)**, since that matches the actual work. **Confirm this is correct**; if training is NOT
> actually complete, tell the agent to stop the "completed" section at augmentation (v004).

---

## SUBPAGE REQUIREMENTS

### Structure & style
- Model structure and style on the existing subpages, **especially `explorentory.html`**.
- Use the **same header** as `explorentory.html`, including all nav links to other pages.
- **Footer** with author name and project name.
- **White background.**
- Page-specific overrides go in `work13/work13.css`.
- Top of page: **title, GitHub link, tech stack, and a concise plain-language summary** of the project
  (what problem it solves and why it matters).

### Content sections (in this order)
1. **Overview / problem statement**
   - What the project does: raster floorplan (or color-coded sketch) → semantic segmentation →
     (planned) classified vector CAD.
   - Why it's hard and why it matters (architectural drawings are messy, inconsistent; turning them
     into structured, classified geometry is valuable for downstream CAD/BIM work).
   - **Interview-relevant framing (include explicitly but briefly):** this is the same class of
     problem as turning messy real-world engineering data into structured representations — relevant
     to AI-for-design/manufacturing.

2. **Pipeline diagram**
   - Show the 8-stage pipeline with completed stages (1–6) visually distinguished from planned
     stages (7–8). A **D3.js** horizontal flow diagram is appropriate here (the brief permits D3 for a
     project-idea diagram). Keep it clean and legible; label completed vs. planned.

3. **Input data**
   - Source: **CubiCasa5K** (raster–vector pairs).
   - **Data-quality reality (important — state plainly):** the original raster data is **often very
     messy**, so the dataset was built in two parts: (a) a hand-selected subset of **clean original
     rasters**, and (b) for the rest, rasters **rendered directly from the source vector (SVG)** so the
     raster–mask pairing is exact (this is spec_v003). Explain *why*: clean, exactly-aligned
     raster↔mask pairs are needed for reliable supervised segmentation; messy/misaligned originals
     would inject label noise.
   - Show **sample images**: an input raster, and the corresponding target mask.

4. **Data augmentation**
   - Describe the **sketch-style augmentation** (spec_v004) and **why** each augmentation was chosen.
   - Frame augmentations in terms of the goal: make the model robust to the variation seen in real,
     hand-drawn / inconsistent floorplans, and prevent overfitting given a limited clean dataset.
   - (AUTHOR TO FILL: list the exact augmentations applied — e.g., line-style/stroke perturbation,
     rotation, scaling, noise, color jitter — and one-line justification each. Placeholder text the
     agent inserts must be clearly marked `[TODO: confirm exact augmentations]` so it isn't mistaken
     for verified fact.)

5. **Model architecture**
   - Explain **SegFormer** clearly and correctly at a conceptual level: a transformer-based semantic
     segmentation model with a hierarchical (multi-scale) transformer **encoder** producing features
     at several resolutions, and a lightweight all-MLP **decoder head** that fuses those multi-scale
     features into the per-pixel class prediction. Note it has **no positional-encoding dependence on
     fixed input size** (it uses overlapping patch embeddings / Mix-FFN), which makes it robust to
     varying floorplan resolutions.
   - **Transfer-learning setup (state precisely):** the **pretrained SegFormer backbone is frozen**,
     and the **segmentation head is trained**, with **additional hidden layers** added/tuned on top
     for this task's classes. Explain *why*: the pretrained encoder already extracts good general
     visual features; freezing it saves compute and avoids overfitting the small dataset, while the
     trainable head adapts to the floorplan-specific component classes.
   - State the **training details that are verified**: CrossEntropy loss (optional Dice), metrics
     logged are **loss and mIoU**, checkpoints saved.
   - (AUTHOR TO FILL, mark as `[TODO]`: exact SegFormer variant e.g. MiT-B0/B2, number/size of added
     hidden layers, class list, input resolution, batch size, optimizer, learning rate, epochs.)

6. **Results — segmentation output**
   - Show a **2×2 (or row) image set per example**: **input raster · prediction · overlay · target
     (ground truth)**. Include **multiple examples** if available.
   - If quantitative results exist, report **mIoU** (and per-class IoU if available). Mark any number
     the agent cannot verify as `[TODO: insert metric]` rather than inventing it.

7. **Roadmap (planned work)**
   - Briefly: mask-to-vector post-processing (Shapely) and classified CAD-like JSON export.
   - Frame as the path from pixels → clean classified vector geometry, i.e., the "to CAD" half.

### Imagery rules
- Use **multiple images** for both explanation and result sampling.
- For any image used on the subpage, **copy it into the `work13/` folder first**, then reference it
  from `neural_floorplan.html` (same pattern as the other subpage folders). Do not hot-link from
  elsewhere in the repo.
- (AUTHOR TO PROVIDE: the actual input/prediction/overlay/target sample images and any pipeline
  screenshots. If images are not yet available, the agent should insert labeled placeholders
  `[IMAGE: input raster sample]` etc. so nothing is fabricated.)

### Diagram rules
- A **D3.js** diagram may be used for the pipeline (and only where a diagram genuinely aids
  understanding). Keep dependencies minimal and the diagram self-contained in the subpage.

---

## INDEX.HTML CHANGE (one card only)
Add a single project card under `class="work-grid"` consistent with the existing cards' markup and
style. Card should contain: project title ("Neural Floorplan to Classified CAD"), a one-line teaser
(e.g., "Deep-learning pipeline turning raster floorplans into classified vector CAD via SegFormer
segmentation"), the thumbnail image (copied into `work13/`), and a link to `neural_floorplan.html`.
Do not alter any other card or any other part of `index.html`.

---

## README TASK (repository readme.md)
Write a proper project README at `C:\Users\kdgki\Desktop\MSCDP\Projects\neural_floorplan\readme.md`
containing:
- Project title and one-paragraph summary (goal: raster/sketch → semantic mask → classified CAD-like
  vector geometry).
- The 8-stage pipeline, with completed stages (1–6, through SegFormer training + evaluation) marked
  done and stages 7–8 (mask-to-vector, CAD JSON export) marked planned.
- Tech stack (Python 3.11, PyTorch, HF Transformers/SegFormer, OpenCV, Shapely, pytest, ruff; conda
  env `floorplan-cad`).
- Dataset note (CubiCasa5K; clean-subset + vector-rasterized strategy and why).
- Setup/run commands as defined in CLAUDE.md (conda create/activate, pip install -e, pytest, ruff).
- Spec-driven workflow note (versioned specs in `/specs`, one spec at a time).
Keep it accurate and concise. Mark anything not verifiable from the repo as `[TODO]`.

---

## GUARDRAILS (important)
- **Accuracy over completeness.** This page will be discussed live with a domain expert. Do **not**
  invent metrics, architectures, hyperparameters, augmentations, or results. Anything not grounded in
  the repository or supplied by the author must be inserted as a clearly-labeled `[TODO]` placeholder.
- **Be honest about project status.** Completed work (through training/evaluation) is presented as
  done; mask-to-vector and CAD-JSON export are presented as planned. Never imply the full
  raster→CAD pipeline is finished.
- Keep technical descriptions **correct and specific** (SegFormer mechanics, frozen-backbone transfer
  learning, the data-quality rationale) — these are the parts most likely to be probed in interview.
- Do not modify files outside the listed scope.
- Match the existing site's structure, header, footer, and visual conventions (reference
  `explorentory.html`).
