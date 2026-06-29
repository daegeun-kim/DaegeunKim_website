# Task 38 - Neural Floorplan Page Structure And Explanation Revision

## Context

The current `neural_floorplan.html` page was recently updated from an early
segmentation-only project page into a broader neural floorplan / vectorization
project page.

The content is moving in the right direction, but the page still has two major
problems:

1. It assumes the reader already understands terms such as Phase 4, red
   `door_arc`, orange `door_leaf`, door origin, graph endpoints, wall trimming,
   and same-edge hosting.
2. The order of explanation is messy. New Phase 4 content was placed before
   older input-data, augmentation, and SegFormer sections, so the page no longer
   follows the actual dataflow.

This task is a revision pass on the current page, not a full restart.

## Repository And Files

Work only inside this website repository:

```txt
C:\Users\kdgki\Desktop\PI\DaegeunKim_website
```

Modify the existing page:

```txt
neural_floorplan.html
work13/work13.css
```

If JavaScript is needed for diagrams, put it in the `work13` folder and follow
the repository `CLAUDE.md`.

Read and obey:

```txt
CLAUDE.md
```

Read the neural floorplan project repository as reference material:

```txt
C:\Users\kdgki\Desktop\MSCDP\Projects\neural_floorplan
```

Do not modify the neural floorplan project repository.

## Main Structural Change

Reorganize the page so the main explanation follows the project dataflow.

Use this high-level order:

```txt
Overview
Input Data
Two-Model Strategy
SegFormer Training
Raster-to-Graph
Vectorization
Phase 4 Samples
Development Phases with Overview Diagram
Current Limitations
Technical Stack
References
```

Important language rule:

- Before the "Development Phases" section, avoid framing the current pipeline as
  "Phase 4".
- In the main project explanation, call it "the current pipeline", "the hybrid
  pipeline", or "the project pipeline".
- Introduce the phase terminology only later in "Development Phases", where
  Phase 1, Phase 2, Phase 3, and Phase 4 are explained as the project evolution.

The reason is simple: a reader who lands on the page does not know what
"Phase 4" means yet.

## Section Guidance

### Overview

Keep the existing high-level project claim, but make sure it introduces the
project without unexplained phase language.

The reader should understand:

```txt
raster floorplan images are pixels
the goal is editable architectural vector output
the hard problem is wall topology plus hosted doors/windows
the current pipeline combines semantic segmentation and graph prediction
```

### Input Data

Move the existing input-data explanation early in the page.

Keep valid existing content about CubiCasa5K and the input assets.

Explain that the project uses clean SVG-rendered floorplan rasters and semantic
labels generated from CubiCasa5K annotations.

### Two-Model Strategy

Place this section after Input Data and before the detailed model sections.

This should introduce the core split:

```txt
SegFormer branch:
  learns semantic evidence such as wall, window, door_arc, door_leaf, door_origin

Raster-to-Graph branch:
  predicts wall topology as graph nodes and edges

Vectorization merge:
  uses wall graph from Raster-to-Graph and opening evidence from SegFormer
```

The point is to explain why the project diverges into two parallel workflows
before merging back into vectorization.

For the two strategy cards:

- Remove the black left-edge accent.
- Add a 3:2 aspect-ratio image placeholder below each card:

```txt
segformer_semantic_evidence_placeholder.png
raster2graph_wall_topology_placeholder.png
```

If appropriate images already exist in the neural_floorplan repository, copy
them into `work13/` and use them. If not, keep grey labelled placeholders.

### SegFormer Training

Move the existing data augmentation, class label, decoder/head, and CNN training
content under this section.

The old page treated SegFormer as the center of the project. Now it should be
one major section inside the broader pipeline.

Keep the FloorplanDecoder diagram under this section.

Remove or compress any old SegFormer details that are no longer valuable enough
relative to the full current pipeline.

Explain why the project moved from 5 classes to 7 classes. The important point:

```txt
door and opening evidence became crucial
door_arc helps infer swing side and scale
door_leaf helps infer hinge/leaf direction
door_origin helps identify the origin/threshold edge
window is separated from wall/floor evidence
```

Make the color/class vocabulary clear before later sections use it:

```txt
red = door_arc
orange = door_leaf
purple = door_origin
blue = window
```

### Raster-to-Graph

Keep the current Raster-to-Graph explanation, but make it a model section in the
dataflow rather than starting the page with "Phase 4 Pipeline".

Explain:

```txt
the segmentation model is good for semantic evidence
but direct pixel-to-vector wall reconstruction was unstable
Raster-to-Graph predicts wall topology directly as nodes and edges
the project uses the pretrained Raster-to-Graph checkpoint with modified preprocessing and inference settings
```

Keep the technical settings visible but subtle:

- smaller font
- compact spacing
- secondary visual emphasis

For the `Raster-to-Graph inference settings (current settled)` `arch-box`:

- Convert the current `setting = value` text into a two-column tabular structure.
- Do not show table grid lines.
- Keep the values small/subtle.

### Vectorization

This section currently assumes too much background. Add a short conceptual
introduction before the subsections.

Before explaining graph alignment, opening hosting, and wall trimming, explain
the semantic primitives:

```txt
red door_arc:
  the swing/arc evidence of an opened door

orange door_leaf:
  the visible opened door panel/leaf

purple door_origin:
  the hinge/origin/threshold segment where the door is attached to the wall

blue window:
  window evidence that should become a hosted wall opening
```

Place primitive images near this explanation:

- If possible, generate simple SVG images from the existing Python primitives in
  the neural_floorplan `src/vectorization/primitives/` folder and save them in
  `work13/`.
- If generating them is not straightforward, use grey labelled placeholders.
- Put a primitive/class image side by side with an `image_debug_overlay`
  example so readers connect abstract class names to actual pipeline output.

Suggested filenames:

```txt
door_window_primitives.svg
semantic_debug_overlay_openings.png
```

For each vectorization subsection, add a right-side 3:2 image or placeholder:

```txt
graph_alignment_example.png
opening_hosting_same_edge_example.png
wall_trimming_buffering_example.png
```

If existing sample images in the neural_floorplan output folders are appropriate,
copy them into `work13/` and use them. Otherwise, use labelled placeholders.

Subsections to keep:

```txt
Graph Alignment
Opening Hosting and Same-Edge Constraint
Wall Trimming and Buffering
```

Make the same-edge constraint understandable to non-specialists:

```txt
both endpoints of one door/window must attach to the same wall segment;
otherwise the opening may jump across disconnected wall fragments.
```

Explain wall buffering visually as:

```txt
thin wall centerline graph -> trimmed centerline gaps at openings -> thick wall polygon
```

Scale inference can remain in the main pipeline, but keep the numeric details
subtle.

## Pipeline List Formatting

The current `pipeline-list` content is good, but the typography needs revision.

Change each item from:

```txt
Title &mdash; description
```

to a responsive two-column row:

```txt
Title        description
```

Requirements:

- Keep the ordered numbering.
- Remove the visible dash.
- First column must be wide enough on desktop so titles do not awkwardly wrap.
- On mobile, allow responsive wrapping/stacking.
- Description text should use a slightly smaller font than the title.
- The description text in every row should start at the same x-position on
  desktop.

## Box Styling Cleanup

Normalize the styling of `arch-box`, `strategy-card`, `phase-block`, and similar
content boxes.

Requirements:

- Remove the black left-edge accent/stroke.
- All edges should have the same border treatment.
- Use the same Helvetica / Arial font family as the rest of the page.
- Reduce line-height inside these boxes so the UI is more compact.
- Make box text feel technical and readable, not oversized.

This applies to all similar boxes, not only the examples mentioned above.

## Phase 4 Samples

Keep the three sample grids, but remove visible sample ID numbers from the page.

Use viewer-facing labels:

```txt
Sample 01
Sample 02
Sample 03
```

Do not show `1316`, `10026`, or `10029` in visible titles or captions. Those IDs
are useful internally but not meaningful to portfolio readers.

Internal asset filenames may still include the sample IDs so the owner can map
files easily:

```txt
sample_1316_...
sample_10026_...
sample_10029_...
```

If appropriate images already exist in the neural_floorplan repository, copy
them into `work13/` and use them. As a general rule, if an image in the
neural_floorplan repo is clearly appropriate for the website, move/copy it into
`work13/` and reference the local website copy. If an image is not clearly
appropriate, keep a grey labelled placeholder.

Keep each sample as an 8-image process grid:

```txt
source / original
preprocessed input
7-class segmentation
graph prediction
graph overlay
orthogonal graph overlay
debug overlay
final vector
```

## Development Phases With Overview Diagram

Move the development phases section after the full current pipeline explanation
and samples.

This section should explain how the project evolved:

```txt
Phase 1: 5-class segmentation to direct line/component vectorization
Phase 2: 7-class segmentation refinement and direct semantic vectorization
Phase 3: point-based primitive vectorization
Phase 4: current hybrid graph + semantic vectorization
```

At the beginning of this section, add a diagrammatic overview of all four phases.

This should be a placeholder or simple diagram, similar in spirit to the
FloorplanDecoder diagram:

```txt
phase_development_overview_diagram.svg
```

Each phase in the overview should include:

```txt
input
method / intention
main difference from previous phase
result or lesson
```

Highlight Phase 4/current pipeline visually.

For the detailed phase boxes:

- Make Phase 1, Phase 2, and Phase 3 boxes equal height.
- Use smaller images in the Phase 1-3 boxes.
- Keep Phase 1-3 concise.
- Phase 4 can be slightly more substantial because it is the current method.

## Technical Stack And References Layout

Keep the Technical Stack section, but make it more compact:

- reduce line height
- reduce vertical padding
- remove the visually distracting thick black line under "Technical Stack"

Place Technical Stack and References after Current Limitations.

Before Technical Stack, add a subtle grey separating line to indicate that the
main project narrative has ended and the remaining sections are reference
material.

References should remain as external attribution/citation material.

## Current Limitations

Keep the Current Limitations section.

It should remain honest but concise:

```txt
the vector output is workable but not perfect
complex samples can still have spatial logic or component placement errors
the pipeline is a research prototype rather than production software
```

Do not make the project feel unfinished or weak; frame limitations as current
research constraints.

## Image Asset Rule

Claude may read from:

```txt
C:\Users\kdgki\Desktop\MSCDP\Projects\neural_floorplan
```

If an image is useful for the website, copy it into:

```txt
C:\Users\kdgki\Desktop\PI\DaegeunKim_website\work13
```

Then reference the `work13/` copy from `neural_floorplan.html`.

Do not reference images directly from the neural_floorplan repository.

Do not modify anything inside the neural_floorplan repository.

## Verification

After editing:

1. Check that the page reads in the new dataflow order.
2. Check that no unexplained term is used before it is introduced.
3. Check that visible sample titles do not include sample IDs.
4. Check that the pipeline list aligns as a two-column structure on desktop.
5. Check that box left-edge accents are removed.
6. Check that Raster-to-Graph settings are in a compact two-column table-like
   layout without visible grid lines.
7. Check that vectorization subsections include right-side image/placeholder
   support.
8. Check that Technical Stack and References read as compact reference material.
9. Check that mobile layout remains responsive.
10. Follow any preview or validation rules in `CLAUDE.md`.

## Acceptance Criteria

- The page follows the order: Overview, Input Data, Two-Model Strategy,
  SegFormer Training, Raster-to-Graph, Vectorization, Phase 4 Samples,
  Development Phases, Limitations, Technical Stack, References.
- "Phase" terminology is introduced only when the development history is
  explained.
- The two-model split is clear before either model is explained in detail.
- 7-class semantic terms are introduced before vectorization uses them.
- Vectorization concepts are supported by right-side images or placeholders.
- `pipeline-list` is a responsive two-column ordered list without visible dashes.
- All major boxes have consistent borders, Helvetica/Arial font, and compact
  line-height.
- The Raster-to-Graph settings box uses a two-column table-like layout.
- Phase sample titles are `Sample 01`, `Sample 02`, and `Sample 03`.
- Development phase boxes for Phases 1-3 are equal height with smaller images.
- Technical Stack is compact and visually separated from the main narrative.
