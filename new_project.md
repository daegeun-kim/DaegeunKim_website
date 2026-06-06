0. Project Overview

This project investigates how the world map changes when the idea of “north” is redefined.

A world map is not a fixed image. It is the result of several decisions: how the globe is oriented, where the map is cut, which projection surface is used, and which distortion is accepted.

This project turns those decisions into an interactive system. Users can select a new north pole, rotate the Earth accordingly, choose a projection type, adjust the seam location, and compare how different maps distort country size and shape.

The project is structured around two main ideas:

Projection: how a 3D globe becomes a 2D map.

Distortion: what changes during that transformation.

The goal is to make the hidden geometry of map projection visible and measurable.

1. Projection

A projection transforms the spherical surface of the Earth into a flat 2D map.

This project explains projection through three geometric surfaces: cylinder, cone, and plane.

Cylindrical projections place a cylinder around the globe, project the Earth onto the cylinder, and unroll it into a rectangular map. Examples include Mercator, Gall-Peters, and Equirectangular.

Conic projections place a cone over the globe, project the Earth onto the cone, and unfold it into a flat surface. Examples include Lambert Conformal Conic, Conic Equal Area, and Conic Equidistant.

Azimuthal projections place a plane tangent to the globe. The point of contact becomes the center of the map. Examples include Azimuthal Equidistant, Lambert Azimuthal Equal-Area, Orthographic, and Stereographic.

In this project, the projection is not only determined by the formula. It is also affected by the orientation of the globe before projection.

2. Redefining North

The central idea of the project is that the north pole does not have to remain fixed.

In a conventional world map, the geographic North Pole defines the orientation of the map. This creates the familiar north-up world layout.

In this project, the user can choose any location on Earth as the new north pole. The globe is rotated so that the selected location becomes the new pole before the selected projection is applied.

Process:

Start with the original globe.

Select a new north pole.

Rotate the globe so that the selected location becomes the new pole.

Apply the selected projection.

Generate a new 2D world map.

This shows that the familiar world map is not only a result of projection type. It is also a result of orientation.

Changing the north pole changes which regions appear central, peripheral, continuous, divided, stretched, or compressed.

3. Seam Selection

Some projection types require a seam.

The seam is the longitude where the world map is cut open. It is especially relevant for cylindrical, pseudocylindrical, and conic projections.

By default, the seam is placed at 180 degrees longitude, the antimeridian.

The project allows the user to change the seam location through a controlled seam selection mode. Horizontal scrolling is removed because scrolling can visually shift the map without changing the underlying projection calculation.

Instead, the seam is treated as an explicit projection parameter.

Important rule:

The seam affects how the map is visually cut, but it does not affect the measured distortion of a country.

If a country is split by the seam, all visible parts of that country keep the same distortion value. Distortion is calculated from the full country geometry, not from seam-clipped fragments.

4. Distortion

Every flat world map distorts the globe.

Because the Earth is spherical, it cannot be flattened into a plane while preserving every geometric property. A projection must sacrifice something.

This project focuses on two types of distortion:

Size distortion.

Shape distortion.

Size distortion measures how much larger or smaller a country appears compared to its true area.

Shape distortion measures how much the outline of a country changes after size difference is removed.

The two measurements are separated because different projections preserve different properties.

Mercator preserves local shape but strongly distorts size near the poles.

Gall-Peters preserves area but strongly distorts shape.

The project does not treat distortion as one general error. It separates distortion into measurable components.

5. Size Distortion

Size distortion measures how much a country’s displayed area differs from its true geographic area.

This addresses a common issue in world maps: high-latitude countries can appear much larger than they actually are. In Mercator, Greenland appears visually enormous even though its real area is much smaller than Africa and smaller than it appears relative to Australia.

Size distortion is calculated as:

sizeRatio = currentProjectedCountryArea / trueOrEqualAreaReferenceCountryArea

sizeDistortion = abs(log(sizeRatio))

Interpretation:

sizeRatio = 1.0 means the country appears at its correct area.

sizeRatio = 2.0 means the country appears twice as large as its reference area.

sizeRatio = 0.5 means the country appears half as large as its reference area.

Using abs(log(sizeRatio)) makes enlargement and shrinkage symmetric.

A country shown as 2x too large and a country shown as 0.5x too small receive the same distortion magnitude.

The reference area is not the country’s smallest possible appearance in the projection. The reference is the country’s true area, approximated through spherical area or a local equal-area projection.

This is important because the smallest projected version of a country is not necessarily the correct version. Some projections may shrink regions, so the smallest appearance cannot be treated as the accurate baseline.

The intended question is:

How large does this country appear compared to its true area?

6. Shape Distortion

Shape distortion measures how much a country’s outline changes after size difference is removed.

This separation is essential. If two projected country shapes are compared directly without size normalization, size distortion incorrectly affects shape distortion.

For example, Mercator enlarges high-latitude countries. If the enlarged country outline is directly compared with a reference outline, it may appear to have high shape distortion even though Mercator preserves local shape.

To avoid this, shape distortion is calculated after normalizing size.

Shape distortion process:

Project the country using the current map projection.

Project the same country using a local reference projection.

Move both shapes to the same centroid.

Scale both shapes to the same area.

Align the shapes to maximize overlap.

Calculate the maximum IoU.

Compute shape distortion.

Formula:

shapeSimilarity = maxIoU(normalizedCurrentShape, normalizedReferenceShape)

shapeDistortion = 1 - shapeSimilarity

IoU means intersection over union.

If the normalized shapes overlap perfectly, IoU is 1 and shape distortion is 0.

If the shapes overlap poorly, IoU decreases and shape distortion increases.

This method ensures that shape distortion measures outline deformation, not area enlargement or shrinkage.

7. Standardized Distortion Scale

Distortion values are standardized across all projections.

The project does not normalize distortion separately for each map. This was an important design decision.

If each projection used its own minimum and maximum distortion range, every projection would fill the full color range. This would make a low-distortion projection appear highly distorted simply because it has a relative maximum within its own map.

That would answer:

Which countries are most distorted within this projection?

But the project needs to answer:

How distorted is this projection compared to other projections?

Therefore, size and shape distortion use fixed global maximum values.

Incorrect normalization:

normalizedSize = sizeDistortion / maxSizeDistortionInCurrentMap

normalizedShape = shapeDistortion / maxShapeDistortionInCurrentMap

Correct normalization:

normalizedSize = sizeDistortion / globalSizeDistortionMax

normalizedShape = shapeDistortion / globalShapeDistortionMax

The distortion scale remains consistent across Mercator, Gall-Peters, conic, pseudocylindrical, and azimuthal projections.

This allows meaningful comparison between map types.

8. Projection Tradeoffs

The distortion system reveals the tradeoff between preserving size and preserving shape.

Mercator preserves local shape and angles. It should generally show low shape distortion, but high size distortion near the poles.

Gall-Peters preserves area. It should generally show low size distortion, but high shape distortion.

Equal-area projections prioritize correct area. They should generally show lower size distortion, but may deform shape.

Conformal projections prioritize local shape and angle. They should generally show lower shape distortion, but may strongly distort area.

Azimuthal projections usually have the lowest distortion near the projection center. Distortion increases toward the edge, depending on the specific azimuthal method.

The purpose of the tool is not to find one correct map, but to show what each map preserves and what it sacrifices.

9. Methodology Summary

The Earth is treated as a globe.

The user selects a new north pole.

The globe is rotated so that the selected location becomes the new north pole.

The selected projection is applied.

For seam-based projections, the seam determines where the map is cut.

Each country is evaluated as a full geographic object.

Distortion is calculated per country, not from random circles or clipped screen fragments.

Size distortion is calculated from area ratio:

sizeRatio = currentProjectedCountryArea / trueOrEqualAreaReferenceCountryArea

sizeDistortion = abs(log(sizeRatio))

Shape distortion is calculated from normalized outline comparison:

shapeSimilarity = maxIoU(normalizedCurrentShape, normalizedReferenceShape)

shapeDistortion = 1 - shapeSimilarity

Shape comparison normalizes area first so that size distortion does not influence shape distortion.

The distortion scale is standardized across projections.

The seam is ignored in distortion measurement.

10. Development Decisions

Distortion is measured per country because the project focuses on recognizable landmasses and how they visually change on world maps.

The default world map is not treated as distortion-free. It is only one projection orientation among many.

Size distortion is measured against true or equal-area reference area, not against the smallest possible projected size.

Shape distortion removes size difference before comparing outlines.

Distortion values use a global standardized scale, not a separate scale for each projection.

The seam affects visual cutting only. It does not affect country distortion measurement.

The project focuses only on size and shape distortion. Distance, direction, and scale distortion are excluded to keep the project focused on visual perception of world maps.

11. Implementation Summary

The interactive tool is implemented as a static web application.

Main technical components include:

D3.js geographic projections.

TopoJSON or GeoJSON country geometry.

Custom globe rotation for redefining the north pole.

Projection-specific seam control.

Country-level size distortion calculation.

Country-level shape distortion calculation.

Standardized global distortion scale.

Interactive controls for projection type, pole location, seam, and distortion mode.

The main technical challenge is not only drawing different projections, but keeping distortion measurement consistent across projection types, pole orientations, and seam positions.

12. Reflection

This project shows that world maps are designed systems, not neutral images.

Changing the north pole changes the structure of the map.

Changing the projection changes what is preserved and what is sacrificed.

Changing the seam changes where the world is cut.

By making these decisions interactive, the project reveals that the familiar world map is only one of many possible representations of the Earth.

The final tool is both a projection experiment and a distortion analysis system. It shows how the globe becomes a map, and how that transformation changes the perceived size and shape of the world.