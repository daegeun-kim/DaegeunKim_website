/* ============================================================
 * diagram-pipeline.js
 * DIAGRAM 2 — 4-Step User Experience Pipeline
 * Preferences → Neighborhood → Rating → Results & LLM
 * Requires: d3.js, diagram-helpers.js
 * ============================================================ */

(function drawPipeline() {
  var W = 880, bh = 148, gap = 30;

  var steps = [
    {
      num: '01', title: 'Preferences',
      api: null, dark: false,
      bullets: [
        'Rent slider: $1,500 – $10,000 (step $50) with live display',
        'Bedrooms & bathrooms numeric inputs',
        'Priority ranking: click Rent, Location, Sqft in order  →  weights 3×, 2×, 1×',
        'Free-text concern field  —  fed verbatim into all LLM prompts',
      ]
    },
    {
      num: '02', title: 'Neighborhood Selection',
      api: 'POST  /properties', dark: false,
      bullets: [
        '260 NYC neighborhood polygons rendered on MapLibre GL',
        'Hover highlights boundary  ·  Click confirms selection',
        '/properties: filter 3M units by rent ±20%, beds ±1, distance',
        'Stratified sampling: ≥ 5 of 10 results from chosen borough',
      ]
    },
    {
      num: '03', title: 'Survey Rating',
      api: 'POST  /recommend', dark: false,
      bullets: [
        '10 property cards: neighborhood, rent, sqft, bed/bath',
        'Click card → map.flyTo() + highlight building polygon',
        'Assign 0–10 rating per property',
        '/recommend: OLS trains on ratings → hybrid scoring → top 5,000',
      ]
    },
    {
      num: '04', title: 'Results & AI Explanations',
      api: '/explain  ·  /explain_result  ·  /chat', dark: true,
      bullets: [
        '5,000 properties as choropleth map  —  9 display modes',
        'Top-10 ranked cards  →  click to highlight polygon on map',
        '/explain: 2–3 sentence GPT match narrative per property',
        '/explain_result: plain-English summary of what ML learned',
        '/chat: natural language filter and sort applied client-side',
      ]
    },
  ];

  var H = steps.length * bh + (steps.length - 1) * gap + 10;
  var svg = d3.select('#pipeline-diagram')
    .append('svg')
    .attr('viewBox', '0 0 ' + W + ' ' + H)
    .attr('preserveAspectRatio', 'xMidYMid meet')
    .style('width', '100%').style('height', 'auto');

  addArrow(svg, 'pArr', '#888');

  var pad = 20;

  steps.forEach(function (step, i) {
    var y = i * (bh + gap);
    var isDark = step.dark;

    /* main box */
    box(svg, pad, y, W - pad * 2, bh,
      isDark ? '#111' : '#f8f8f8',
      isDark ? '#000' : '#e0e0e0', 4);

    /* step number circle */
    svg.append('circle')
      .attr('cx', pad + 30).attr('cy', y + 28)
      .attr('r', 17)
      .attr('fill', isDark ? '#fff' : '#111');
    ctext(svg, pad + 30, y + 33, step.num, 12, 'bold', isDark ? '#111' : '#fff');

    /* step title */
    ltext(svg, pad + 56, y + 32, step.title, 15, 'bold', isDark ? '#fff' : '#111');

    /* API badge */
    if (step.api) {
      var badgeW = step.dark ? 260 : 200;
      var badgeX = W - pad - badgeW;
      box(svg, badgeX, y + 10, badgeW, 22,
        isDark ? '#2a2a2a' : '#eaeaea',
        isDark ? '#444'    : '#d0d0d0', 3);
      svg.append('text')
        .attr('x', badgeX + badgeW / 2).attr('y', y + 24)
        .attr('text-anchor', 'middle')
        .attr('font-family', MONO).attr('font-size', 10)
        .attr('fill', isDark ? '#7ecfff' : '#666')
        .text(step.api);
    }

    /* bullet lines */
    step.bullets.forEach(function (bullet, bi) {
      ltext(svg, pad + 56, y + 54 + bi * 19,
        '— ' + bullet, 12, 'normal',
        isDark ? '#bbb' : '#666');
    });

    /* arrow to next step */
    if (i < steps.length - 1) {
      vArrow(svg, W / 2, y + bh + 2, y + bh + gap, 'pArr');
    }
  });
}());
