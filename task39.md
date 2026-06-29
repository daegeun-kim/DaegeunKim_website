# Task 39 - Neural Floorplan Page Visual Refinement Pass

## Context

Task38 reorganized `neural_floorplan.html` around the project dataflow and made
the current hybrid floorplan pipeline easier to understand. This task is a
focused visual/content refinement pass on that updated page.

Do not rewrite the page from scratch. Make targeted edits to the existing
`neural_floorplan.html` and `work13/work13.css`.

## Repository And Rules

Work only inside:

```txt
C:\Users\kdgki\Desktop\PI\DaegeunKim_website
```

Read and obey:

```txt
CLAUDE.md
```

You may read images/content from:

```txt
C:\Users\kdgki\Desktop\MSCDP\Projects\neural_floorplan
```

If an image from the neural floorplan repository is used on the website, copy it
into:

```txt
C:\Users\kdgki\Desktop\PI\DaegeunKim_website\work13
```

Then reference only the `work13/` copy from HTML/CSS. Do not directly link to
the neural floorplan repository.

## 1. Global Image Fitting Rule

All page images should preserve their natural proportions.

For image cards / placeholders with fixed aspect-ratio containers:

```css
object-fit: cover;
```

Do not distort images by stretching or squashing them to fit a different ratio.
If the image ratio does not match its container, crop residual parts instead.

This applies globally, including:

```txt
Two-Model Strategy images
SegFormer result images
Raster-to-Graph images
Vectorization examples
Phase sample grids
Development phase images
```

## 2. From 5 Classes To 7 Classes Layout

In the "From 5 Classes to 7 Classes" subsection, revise the layout to a
three-column structure:

```txt
column 1: 5-class segmentation raster image
column 2: 7-class segmentation raster image
column 3: "7 classes and their role" text/label panel
```

The current second placeholder is text rather than an image. Keep that role
panel, but move it into the third column.

Fill the first two columns with actual images if appropriate examples exist.
Use one 5-class segmentation raster and one 7-class segmentation raster side by
side.

If a clean 5-class raster is not obvious, use a labelled placeholder and make
the filename clear. For the 7-class raster, prefer a current run3 preview copied
from the neural floorplan repo.

The label panel should clearly explain:

```txt
background
floor
wall
window
door_arc
door_leaf
door_origin
```

Also preserve the core explanation:

```txt
door evidence became important for opening location, swing direction, and scale
```

## 3. Full Pipeline Flowchart Placeholder

Under the "Full Pipeline" subsection, place a large SVG placeholder above the
11-step pipeline list.

Suggested visible placeholder label:

```txt
full_pipeline_flowchart.svg
```

This is for a manually created Illustrator/SVG diagram that will be added later.

The 11-step pipeline list should remain below this placeholder.

## 4. Data Augmentation Image Strip

The Data Augmentation subsection is secondary content. Make its six images more
compact.

Change the augmentation image layout from a 2x3 grid to a single 1x6 horizontal
strip on desktop.

Requirements:

- Six images in one row on desktop.
- Smaller image cards.
- Responsive wrapping or horizontal compression on narrower screens.
- Keep labels readable but subtle.

## 5. Model Architecture Side-By-Side Layout

In the Model Architecture subsection, the SegFormer-B0 diagram and the
FloorplanDecoder layer box are currently stacked top/bottom.

Change them to a side-by-side layout on desktop:

```txt
left: SegFormer-B0 diagram
right: FloorplanDecoder layer diagram
```

Reason:

```txt
the SegFormer-B0 diagram is narrow and tall, so stacking wastes vertical space
```

On mobile, stack them vertically.

## 6. Segmentation Training Results Should Use 7-Class Run3 Images

The current Segmentation Training Results section still uses two sets of four
images from the old 5-class segmentation page.

Replace those images with current 7-class SegFormer run3 preview images from:

```txt
C:\Users\kdgki\Desktop\MSCDP\Projects\neural_floorplan\runs\segformer_b0_run3\previews\epoch_050
```

Use samples `000` and `001`.

Source files:

```txt
sample_000_input.png
sample_000_target.png
sample_000_prediction.png
sample_000_overlay.png

sample_001_input.png
sample_001_target.png
sample_001_prediction.png
sample_001_overlay.png
```

Copy them into `work13/` before referencing them.

The result layout should show each sample as a compact set of four images:

```txt
input
target / ground truth
prediction
overlay
```

Make sure the visible text identifies these as 7-class segmentation results,
not 5-class results.

## 7. Inference Settings Explanations

In the Raster-to-Graph "Inference Settings" subsection, briefly explain what
each setting controls.

Example explanations:

```txt
first_step_threshold:
  lower value allows graph generation to start from lower-confidence candidates

later_step_threshold:
  lower value keeps more candidate graph continuations during autoregressive decoding

edge_search_threshold:
  search radius for connecting candidate graph edges

monte_times:
  number of Monte Carlo / repeated generation attempts per component

max_candidates_per_step:
  cap on candidate branches considered at each generation step

max_new_starts:
  number of mask-and-rerun recovery starts for missed regions

angle hard filter:
  removes edges outside the near-horizontal / near-vertical floorplan assumption
```

Use Helvetica / Arial font in this settings table/box.

Keep the typography compact and subtle. These numeric settings should not become
the main visual focus of the page.

## 8. Vectorization Primitive Image Alignment

In the Vectorization section, two images currently have very different aspect
ratios, causing their labels to sit at different vertical positions.

For the pair:

```txt
Door and window semantic primitives
Pipeline debug overlay (same primitives in context)
```

Make the labels align horizontally at the same vertical level.

Implementation suggestion:

- Put both image cards in equal-height containers.
- Center the primitive image vertically inside its card, as if it has top and
  bottom padding.
- Keep the label at a consistent baseline under each image container.

Do not stretch the image; use the global `object-fit: cover` or centered
contain-style presentation only if preserving the image is more important.

## 9. Development Phases Cleanup

Remove the `phase_development_overview_diagram.svg` placeholder from the
Development Phases section.

The development phase boxes should still explain the evolution, but do not use
that overview placeholder anymore.

Fix the Phase 1, Phase 2, and Phase 3 card/image alignment:

- The three phase images should start at the same vertical level.
- The Phase 1 image should not sit higher/lower just because the "Failed" text
  wraps to fewer lines.
- Make the Phase 1-3 image areas equal-height and aligned.

Keep the images smaller than the main pipeline/sample images.

## 10. Stronger Separator Before Technical Stack

The grey line before Technical Stack should more clearly mark the end of the
main narrative.

Make it:

```txt
thicker
with larger top padding
with larger bottom padding
```

It should still feel clean and subtle, but more clearly separate:

```txt
main project content
vs
reference material: Technical Stack + References
```

## 11. References Text Size

Make the References section text 1pt smaller than it is now.

Keep citations readable and properly linked.

Do not remove the CubiCasa5K, SegFormer, or Raster-to-Graph references.

## Verification

After editing, check:

1. Images crop with `object-fit: cover` rather than being distorted.
2. The 5-class vs 7-class subsection is a 3-column structure.
3. Full Pipeline has a flowchart placeholder above the 11 steps.
4. Data augmentation images are compact in a 1x6 desktop strip.
5. SegFormer-B0 and FloorplanDecoder diagrams are side-by-side on desktop.
6. Training results use 7-class run3 samples `000` and `001`.
7. Inference settings explain what each setting controls.
8. Vectorization image labels align cleanly despite different aspect ratios.
9. Development phase overview placeholder is removed.
10. Phase 1-3 images align at the same vertical level.
11. Separator before Technical Stack is more visually clear.
12. References text is 1pt smaller.
13. Mobile layout remains responsive.

## Acceptance Criteria

- `neural_floorplan.html` and `work13/work13.css` reflect this visual refinement pass.
- The page uses current 7-class segmentation result images for training results.
- No image is visibly stretched or squashed.
- The page remains clear, compact, and consistent with the portfolio style.
