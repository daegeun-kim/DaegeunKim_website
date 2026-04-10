/* ============================================================
 * diagram-comparison.js
 * DIAGRAM 1 — Platform Comparison Flow
 * Traditional platforms (filter-first) vs. Explorentory (trade-off ranking)
 * Requires: d3.js, diagram-helpers.js
 * ============================================================ */

(function drawComparison() {
  var W = 880, H = 340;
  var svg = d3.select('#comparison-diagram')
    .append('svg')
    .attr('viewBox', '0 0 ' + W + ' ' + H)
    .attr('preserveAspectRatio', 'xMidYMid meet')
    .style('width', '100%').style('height', 'auto');

  addArrow(svg, 'cArr', '#999');

  var mid = W / 2;
  var lCx = mid / 2;       /* left column center  */
  var rCx = mid + mid / 2; /* right column center */
  var bw = 200, bh = 58;

  /* ── column headers ── */
  ctext(svg, lCx, 22, 'Traditional Platforms', 18, 'bold', '#222');
  ctext(svg, lCx, 38, 'Zillow  ·  StreetEasy  ·  Redfin', 11, 'normal', '#808080');
  ctext(svg, rCx, 22, 'Explorentory', 18, 'bold', '#0054d3');

  /* ── left column boxes ── */
  var lBoxes = [
    { y: 88,  lines: ['User Sets', 'Hard Filters'] },
    { y: 210, lines: ['Filtered', 'Listing Results'] },
  ];

  lBoxes.forEach(function (b, i) {
    var bx = lCx - bw / 2;
    box(svg, bx, b.y, bw, bh, '#f2f2f2', '#d0d0d0', 3);
    b.lines.forEach(function (line, li) {
      ctext(svg, lCx, b.y + 24 + li * 18, line, 13, 'normal', '#555');
    });
    if (i < lBoxes.length - 1) {
      vArrow(svg, lCx, b.y + bh + 2, lBoxes[i + 1].y, 'cArr');
      // ctext(svg, lCx, b.y + bh + 52, 'zero guidance, no personalization', 10, 'normal', '#ccc');
    }
  });

  /* ── right column boxes ── */
  var rBoxes = [
    { y: 48,  lines: ['Express', 'Natural Preferences'], dark: false },
    { y: 148, lines: ['ML Customization', '+ AI Assistance'],  dark: true  },
    { y: 248, lines: ['Personalized', 'Ranked Results'],           dark: false },
  ];

  rBoxes.forEach(function (b, i) {
    var bx = rCx - bw / 2;
    var isDark = b.dark;
    box(svg, bx, b.y, bw, bh,
      isDark ? '#1a1a1a' : '#f2f2f2',
      isDark ? '#111'    : '#d0d0d0', 3);
    b.lines.forEach(function (line, li) {
      ctext(svg, rCx, b.y + 24 + li * 18, line, 13, 'normal', isDark ? '#fff' : '#444');
    });
    if (i < rBoxes.length - 1) {
      vArrow(svg, rCx, b.y + bh + 2, rBoxes[i + 1].y, 'cArr');
    }
  });

  /* ── divider ── */
  svg.append('line')
    .attr('x1', mid).attr('y1', 10)
    .attr('x2', mid).attr('y2', H - 10)
    .attr('stroke', '#e0e0e0').attr('stroke-width', 1)
    .attr('stroke-dasharray', '5,4');
}());
