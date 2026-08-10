/* ============================================================
 * diagram-ml.js
 * DIAGRAM 4 — ML Scoring Pipeline
 * 10 Ratings + Prefs → OLS & Rule-Based → Hybrid Score → Top 5K
 * Requires: d3.js, diagram-helpers.js
 * ============================================================ */

(function drawML() {
  var W = 880, H = 280;
  var svg = d3.select('#ml-diagram')
    .append('svg')
    .attr('viewBox', '0 0 ' + W + ' ' + H)
    .attr('preserveAspectRatio', 'xMidYMid meet')
    .style('width', '100%').style('height', 'auto');

  addArrow(svg, 'mArr', '#aaa');

  /*
   *  Layout:
   *  [10 Ratings + Prefs]  ─┬─→  [OLS Regression]   ─┐
   *                         │                          ├→ [Hybrid Score] → [Top 5K]
   *                         └─→  [Rule-Based Score]  ─┘
   */

  var bh    = 70;
  var row1y = 20;   /* OLS row */
  var row2y = 160;  /* Rule-Based row */

  var nodes = {
    ratings: { x: 20,  y: row1y + (row2y - row1y) / 2 - bh / 2, w: 160, h: bh, dark: false },
    ols:     { x: 240, y: row1y,  w: 200, h: bh, dark: true  },
    rule:    { x: 240, y: row2y,  w: 200, h: bh, dark: false },
    hybrid:  { x: 510, y: row1y + (row2y - row1y) / 2 - bh / 2, w: 155, h: bh, dark: false },
    result:  { x: 725, y: row1y + (row2y - row1y) / 2 - bh / 2, w: 140, h: bh, dark: true  },
  };

  /* draw boxes */
  Object.keys(nodes).forEach(function (k) {
    var n = nodes[k];
    box(svg, n.x, n.y, n.w, n.h,
      n.dark ? '#1a1a1a' : '#f2f2f2',
      n.dark ? '#000'    : '#d0d0d0', 4);
  });

  /* labels */
  ctext(svg, nodes.ratings.x + nodes.ratings.w / 2, nodes.ratings.y + 26, '10 User Ratings',   12, 'bold',   '#333');
  ctext(svg, nodes.ratings.x + nodes.ratings.w / 2, nodes.ratings.y + 46, '+ Preferences',      12, 'normal', '#888');

  ctext(svg, nodes.ols.x + nodes.ols.w / 2, nodes.ols.y + 26, 'OLS Regression',        12, 'bold',   '#eee');
  ctext(svg, nodes.ols.x + nodes.ols.w / 2, nodes.ols.y + 46, '11 engineered features', 11, 'normal', '#999');

  ctext(svg, nodes.rule.x + nodes.rule.w / 2, nodes.rule.y + 26, 'Rule-Based Score',        12, 'bold',   '#333');
  ctext(svg, nodes.rule.x + nodes.rule.w / 2, nodes.rule.y + 46, 'priority weights × 3,2,1', 11, 'normal', '#888');

  ctext(svg, nodes.hybrid.x + nodes.hybrid.w / 2, nodes.hybrid.y + 26, 'Hybrid Score',  12, 'bold',   '#333');
  ctext(svg, nodes.hybrid.x + nodes.hybrid.w / 2, nodes.hybrid.y + 46, '(rule + ml) / 2', 11, 'normal', '#888');

  ctext(svg, nodes.result.x + nodes.result.w / 2, nodes.result.y + 26, 'Top 5,000',     12, 'bold',   '#eee');
  ctext(svg, nodes.result.x + nodes.result.w / 2, nodes.result.y + 46, 'ranked results', 11, 'normal', '#aaa');

  /* ── arrows ── */
  var rRightX = nodes.ratings.x + nodes.ratings.w;
  var rCy     = nodes.ratings.y + nodes.ratings.h / 2;
  var forkX   = rRightX + 30;

  /* ratings → fork stem */
  svg.append('line')
    .attr('x1', rRightX + 2).attr('y1', rCy)
    .attr('x2', forkX).attr('y2', rCy)
    .attr('stroke', '#ccc').attr('stroke-width', 1.5);

  var olsCy  = nodes.ols.y  + nodes.ols.h  / 2;
  var ruleCy = nodes.rule.y + nodes.rule.h  / 2;

  /* fork vertical bar */
  svg.append('line')
    .attr('x1', forkX).attr('y1', olsCy)
    .attr('x2', forkX).attr('y2', ruleCy)
    .attr('stroke', '#ccc').attr('stroke-width', 1.5);

  /* fork → OLS */
  dArrow(svg, forkX, olsCy, nodes.ols.x - 2, olsCy, 'mArr', '#ccc');
  /* fork → Rule */
  dArrow(svg, forkX, ruleCy, nodes.rule.x - 2, ruleCy, 'mArr', '#ccc');

  /* merge to hybrid */
  var olsRightX  = nodes.ols.x  + nodes.ols.w;
  var ruleRightX = nodes.rule.x + nodes.rule.w;
  var hybridCy   = nodes.hybrid.y + nodes.hybrid.h / 2;
  var hybridLx   = nodes.hybrid.x;
  var forkX2     = hybridLx - 28;

  svg.append('line')
    .attr('x1', olsRightX + 2).attr('y1', olsCy)
    .attr('x2', forkX2).attr('y2', olsCy)
    .attr('stroke', '#ccc').attr('stroke-width', 1.5);
  svg.append('line')
    .attr('x1', ruleRightX + 2).attr('y1', ruleCy)
    .attr('x2', forkX2).attr('y2', ruleCy)
    .attr('stroke', '#ccc').attr('stroke-width', 1.5);
  svg.append('line')
    .attr('x1', forkX2).attr('y1', olsCy)
    .attr('x2', forkX2).attr('y2', ruleCy)
    .attr('stroke', '#ccc').attr('stroke-width', 1.5);

  dArrow(svg, forkX2, hybridCy, hybridLx - 2, hybridCy, 'mArr', '#ccc');

  /* hybrid → result */
  dArrow(svg,
    nodes.hybrid.x + nodes.hybrid.w + 2, hybridCy,
    nodes.result.x - 2, hybridCy,
    'mArr', '#ccc');
}());
