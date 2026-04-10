/* ============================================================
 * diagram-helpers.js
 * Shared constants and drawing utilities for all D3 diagrams.
 * Loaded before any individual diagram file.
 * ============================================================ */

var FONT = 'Helvetica, Arial, sans-serif';
var MONO = "'Courier New', Courier, monospace";

/* add an arrowhead marker to an svg's <defs> */
function addArrow(svg, id, color) {
  color = color || '#888';
  svg.append('defs').append('marker')
    .attr('id', id)
    .attr('viewBox', '0 -5 10 10')
    .attr('refX', 8).attr('refY', 0)
    .attr('markerWidth', 6).attr('markerHeight', 6)
    .attr('orient', 'auto')
    .append('path')
    .attr('d', 'M0,-5L10,0L0,5')
    .attr('fill', color);
}

/* vertical arrow from y1 to y2 at x */
function vArrow(svg, x, y1, y2, markerId) {
  svg.append('line')
    .attr('x1', x).attr('y1', y1)
    .attr('x2', x).attr('y2', y2 - 8)
    .attr('stroke', '#999').attr('stroke-width', 1.5)
    .attr('marker-end', 'url(#' + markerId + ')');
}

/* diagonal / horizontal arrow */
function dArrow(svg, x1, y1, x2, y2, markerId, color) {
  svg.append('line')
    .attr('x1', x1).attr('y1', y1)
    .attr('x2', x2).attr('y2', y2)
    .attr('stroke', color || '#aaa').attr('stroke-width', 1.5)
    .attr('marker-end', 'url(#' + markerId + ')');
}

/* filled rectangle */
function box(svg, x, y, w, h, fill, stroke, rx) {
  svg.append('rect')
    .attr('x', x).attr('y', y)
    .attr('width', w).attr('height', h)
    .attr('fill', fill || '#f5f5f5')
    .attr('stroke', stroke || '#ccc')
    .attr('stroke-width', 1)
    .attr('rx', rx === undefined ? 3 : rx);
}

/* center-aligned text */
function ctext(svg, x, y, text, size, weight, fill) {
  svg.append('text')
    .attr('x', x).attr('y', y)
    .attr('text-anchor', 'middle')
    .attr('font-family', FONT)
    .attr('font-size', size || 13)
    .attr('font-weight', weight || 'normal')
    .attr('fill', fill || '#444')
    .text(text);
}

/* left-aligned text */
function ltext(svg, x, y, text, size, weight, fill) {
  svg.append('text')
    .attr('x', x).attr('y', y)
    .attr('font-family', FONT)
    .attr('font-size', size || 12)
    .attr('font-weight', weight || 'normal')
    .attr('fill', fill || '#555')
    .text(text);
}

/* left-aligned monospace text */
function mtext(svg, x, y, text, size, fill) {
  svg.append('text')
    .attr('x', x).attr('y', y)
    .attr('font-family', MONO)
    .attr('font-size', size || 11)
    .attr('fill', fill || '#7ecfff')
    .text(text);
}
