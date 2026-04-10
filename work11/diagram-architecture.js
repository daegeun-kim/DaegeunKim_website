/* ============================================================
 * diagram-architecture.js
 * DIAGRAM 3 — System Architecture  (left → right)
 * Database  →  Backend (FastAPI)  →  Frontend (Vanilla JS)
 *
 * Routing strategy:
 *   · All cross-column arrows route through dedicated corridor lanes.
 *   · Bypass arrows (skipping intermediate columns) use a TOP_LANE (y=72)
 *     or BOTTOM_LANE (y=650) so they never cross node boxes.
 *   · Arrows within the same column use short direct beziers.
 *   · Dashed callback arrows (steps → main.js) use the BOTTOM_LANE.
 *
 * Requires: d3.js, diagram-helpers.js
 * ============================================================ */

(function drawDataPipeline() {

  /* ── canvas ── */
  var W = 1420, H = 730;

  var svg = d3.select('#data-pipeline-diagram')
    .append('svg')
    .attr('viewBox', '0 0 ' + W + ' ' + H)
    .attr('preserveAspectRatio', 'xMidYMid meet')
    .style('width', '100%').style('height', 'auto');

  /* ── arrowhead markers ── */
  var defs = svg.append('defs');
  [
    { id: 'mBlue',   c: '#4a90d9' },
    { id: 'mCyan',   c: '#7ecfff' },
    { id: 'mGray',   c: '#999'    },
    { id: 'mOrange', c: '#ffb347' },
    { id: 'mGreen',  c: '#3ddc84' },
    { id: 'mPurple', c: '#c084fc' },
    { id: 'mIndigo', c: '#4361ee' },
    { id: 'mPink',   c: '#e879a0' },
    { id: 'mSlate',  c: '#7b8fa1' },
  ].forEach(function (m) {
    defs.append('marker')
      .attr('id', m.id)
      .attr('viewBox', '0 -5 10 10')
      .attr('refX', 8).attr('refY', 0)
      .attr('markerWidth', 5).attr('markerHeight', 5)
      .attr('orient', 'auto')
      .append('path').attr('d', 'M0,-5L10,0L0,5').attr('fill', m.c);
  });

  /* ── layout constants ── */
  var LH       = 16;   /* body line-height inside node boxes           */
  var GAP      = 30;   /* vertical gap between nodes in same column    */
  var S        = 90;   /* y-start for first node in every column       */
  var TOP_LANE = 72;   /* horizontal bypass corridor above all nodes   */
  var BOT_LANE = 650;  /* horizontal bypass corridor below all nodes   */
  var CR       = 6;    /* corner radius for elbow turns                */

  function nh(n) { return 40 + n * LH; } /* node height for n body lines */

  /* ── X coordinates ─────────────────────────────────────────────
   *  Three containers; sub-columns with explicit routing corridors.
   *
   *   DB  |  db.py  |  logic  |  API  |  main.js  |  steps  |  render
   *  10-205  230-384  408-568  590-752  770-925    948-1098  1120-1285
   *
   *  Container boundaries:
   *    Database:  x=10,  w=196  (right=206)
   *    Backend:   x=218, w=546  (right=764)
   *    Frontend:  x=776, w=634  (right=1410)
   * ────────────────────────────────────────────────────────────── */

  /* column left-x and width */
  var COL = {
    db_tbl:  { x: 18,   w: 180 },
    db_fn:   { x: 228,  w: 150 },
    logic:   { x: 406,  w: 156 },
    api:     { x: 588,  w: 162 },
    main:    { x: 778,  w: 152 },
    steps:   { x: 950,  w: 142 },
    render:  { x: 1112, w: 158 },
  };


  /* ── container rectangles ── */
  var CT = [
    { label: 'Database',              x: 10,  y: 40, w: 207, h: 620, fill: '#eaf2fb', stroke: '#4a90d9', lc: '#1a5fa8' },
    { label: 'Backend  (FastAPI)',     x: 218, y: 40, w: 548, h: 620, fill: '#080808', stroke: '#2a2a2a', lc: '#888'    },
    { label: 'Frontend  (Vanilla JS)', x: 776, y: 40, w: 635, h: 620, fill: '#f4f6f4', stroke: '#bbb',    lc: '#555'    },
  ];
  CT.forEach(function (c) {
    svg.append('rect')
      .attr('x', c.x).attr('y', c.y)
      .attr('width', c.w).attr('height', c.h)
      .attr('fill', c.fill).attr('stroke', c.stroke)
      .attr('stroke-width', 1.5).attr('rx', 5);
    svg.append('text')
      .attr('x', c.x + 12).attr('y', c.y + 18)
      .attr('font-family', FONT).attr('font-size', 11.5)
      .attr('font-weight', 'bold').attr('fill', c.lc)
      .text(c.label);
  });

  /* sub-column labels */
  [
    { x: 228,  y: TOP_LANE - 2, t: 'db.py',                                    c: '#4a90d9' },
    { x: 406,  y: TOP_LANE - 2, t: 'ols.py / recommend.py / llm_router.py',    c: '#555'    },
    { x: 588,  y: TOP_LANE - 2, t: 'API Endpoints',                             c: '#777'    },
    { x: 778,  y: TOP_LANE - 2, t: 'main.js',                                   c: '#444'    },
    { x: 950,  y: TOP_LANE - 2, t: 'Step Modules',                              c: '#777'    },
    { x: 1112, y: TOP_LANE - 2, t: 'Render',                                    c: '#777'    },
  ].forEach(function (l) {
    svg.append('text').attr('x', l.x).attr('y', l.y)
      .attr('font-family', FONT).attr('font-size', 9.5).attr('fill', l.c).text(l.t);
  });

  /* ── node definitions ──────────────────────────────────────────
   *  Compute y from layout; store in N for port access later.
   * ────────────────────────────────────────────────────────────── */
  var N = {};

  function node(key, col, y0, nLines, fill, stroke, hcolor, mono, header, lines) {
    var cx = COL[col];
    N[key] = {
      x: cx.x, y: y0, w: cx.w, h: nh(nLines),
      fill: fill, stroke: stroke, hcolor: hcolor,
      mono: mono, header: header, lines: lines
    };
  }

  /* Database */
  var ny0 = S;
  node('neighb',    'db_tbl', ny0, 4, '#fff', '#4a90d9', '#1a5fa8', false, 'neighb',
    ['260 neighborhood polygons', '· geometry  (EPSG:2263)', '· borocode', '· centroid  (computed)']);
  var ny1 = ny0 + nh(4) + GAP;
  node('nyc_units', 'db_tbl', ny1, 9, '#fff', '#4a90d9', '#1a5fa8', false, 'nyc_units  (~3M rows)',
    ['KNN-imputed from PLUTO', '· rent_knn  · sqft',
     '· bedroomnum  · bathroomnum', '· borocode  · built_year',
     '· bld_story  · elevator', '· dist_greenspace_ft',
     '· dist_subway_ft', '· noise_level  · bldg_class', '· small_n  · geometry']);

  /* db.py */
  var dy0 = S;
  node('db_n', 'db_fn', dy0, 3, '#0d2137', '#1e5a8a', '#7ecfff', true, 'get_neighborhoods()',
    ['SELECT FROM neighb', 'ST_AsGeoJSON( )', 'reproject → EPSG:4326']);
  var dy1 = dy0 + nh(3) + GAP;
  node('db_p', 'db_fn', dy1, 4, '#0d2137', '#1e5a8a', '#7ecfff', true, 'get_properties(prefs)',
    ['filter rent ±20%, beds ±1', 'euclidean dist. sort', 'stratified sample (n=10)', '→ return  []Property']);
  var dy2 = dy1 + nh(4) + GAP;
  node('db_a', 'db_fn', dy2, 2, '#0d2137', '#1e5a8a', '#7ecfff', true, 'get_all_units(prefs)',
    ['broad rent/beds filter', '→ return  GeoDataFrame']);

  /* logic */
  var oy0 = S;
  node('ols', 'logic', oy0, 9, '#1a0e00', '#7a4a00', '#ffb347', true, 'ols.py',
    ['engineer_features(X):', '  · |bedroomnum − target|',
     '  · |bathroomnum − target|', '  · borocode_match  (bool)',
     '  · noise_level_ord  0–4', '  · 6 additional diff features',
     'StandardScaler(fit on 3M)', 'LinearRegression.fit(10)', 'predict(X_all)  → scores[]']);
  var oy1 = oy0 + nh(9) + GAP;
  node('rec', 'logic', oy1, 7, '#001500', '#005a00', '#7dff7d', true, 'recommend.py',
    ['preprocess(units)', 'rule_score(prefs, units)',
     '  weights:  3×  2×  1×', '  minmax normalize each field',
     'hybrid = (rule + ml) / 2', 'drop_duplicates(subset=bin)', '→ top 5000 unique buildings']);
  var oy2 = oy1 + nh(7) + GAP;
  node('llm', 'logic', oy2, 3, '#150020', '#6a2a90', '#c084fc', true, 'llm_router.py',
    ['system_prompt + schema', 'gpt  structured JSON output', 'OpenAI SDK async call']);

  /* API endpoints */
  var AH = 50, AG = 68;
  var AX = COL.api.x, AW = COL.api.w;
  function apiNode(key, yi, fill, stroke, hcolor, header) {
    N[key] = { x: AX, y: yi, w: AW, h: AH, fill: fill, stroke: stroke,
                hcolor: hcolor, mono: true, header: header, lines: [] };
  }
  apiNode('ep_n',  S,           '#001508', '#00692a', '#3ddc84', 'GET  /neighborhoods');
  apiNode('ep_p',  S + AG,      '#001508', '#00692a', '#3ddc84', 'POST  /properties');
  apiNode('ep_r',  S + AG*2,    '#001508', '#00692a', '#3ddc84', 'POST  /recommend');
  apiNode('ep_ex', S + AG*3+16, '#100010', '#5a1a8a', '#c084fc', 'POST  /explain');
  apiNode('ep_er', S + AG*4+16, '#100010', '#5a1a8a', '#c084fc', 'POST  /explain_result');
  apiNode('ep_ch', S + AG*5+16, '#100010', '#5a1a8a', '#c084fc', 'POST  /chat');

  /* LLM group divider */
  var divY = S + AG * 3 + 6;
  svg.append('line')
    .attr('x1', AX).attr('y1', divY).attr('x2', AX + AW).attr('y2', divY)
    .attr('stroke', '#3a2040').attr('stroke-width', 0.8).attr('stroke-dasharray', '4,3');
  svg.append('text')
    .attr('x', AX + AW / 2).attr('y', divY + 9)
    .attr('text-anchor', 'middle').attr('font-family', FONT)
    .attr('font-size', 8).attr('fill', '#7a5a9a').text('LLM');

  /* main.js */
  node('main', 'main', S, 18, '#fff', '#1a1a1a', '#111', true, 'main.js',
    ['onPreferencesSubmit( )', '  initNeighborhood( )',
     'onNeighborhoodSubmit( )', '  fetch  /properties',
     '  initRating(cards)', 'onRatingsSubmit(ratings)',
     '  fetch  /recommend', '  renderResults( )',
     'renderResults(geojson)', '  map.renderLayer( )',
     '  charts.drawAll( )', 'explainCard(property)',
     '  fetch  /explain', 'explainResult(coef)',
     '  fetch  /explain_result', 'onChatSubmit(msg)',
     '  fetch  /chat', '  applyFilters(json)']);

  /* step modules */
  var sp0 = S;
  node('pref', 'steps', sp0, 4, '#fff', '#9a9a9a', '#444', false, 'preferences.js',
    ['rent slider  ($50 step)', 'priority rank UI  (1→3)', 'free-text concern field', '→ onPreferencesSubmit( )']);
  var sp1 = sp0 + nh(4) + GAP;
  node('nbhd', 'steps', sp1, 4, '#fff', '#9a9a9a', '#444', false, 'neighborhood.js',
    ['render 260 polygons', 'hover highlight / click', 'click  → centroid lon/lat', '→ onNeighborhoodSubmit( )']);
  var sp2 = sp1 + nh(4) + GAP;
  node('rate', 'steps', sp2, 4, '#fff', '#9a9a9a', '#444', false, 'rating.js',
    ['10 property cards', '0–10 rating per card', 'card click  → flyTo( )', '→ onRatingsSubmit( )']);

  /* render modules */
  var rp0 = S;
  node('map_js', 'render', rp0, 10, '#fff', '#4361ee', '#4361ee', false, 'map.js  (MapLibre GL)',
    ['loadNeighborhoods(geojson)', 'loadPropertyLayer(geojson)',
     'setChoropleth(mode, data)', '  9 color modes + stops',
     'flyTo(coords, zoom)', 'highlightBuilding(bin)',
     'renderResultLayer(5K)', 'onFeatureClick(feature)',
     'toggleDarkBright( )', 'updateColorMode( )']);
  var rp1 = rp0 + nh(10) + GAP;
  node('charts_js', 'render', rp1, 8, '#fff', '#e879a0', '#e879a0', false, 'charts.js  (Canvas)',
    ['drawHistogram(field, data)', '  bin width by field type',
     '  $10/bin for rent', '  vertical target marker',
     'drawRadar(prop, weights)', '  3–6 axes min-max norm',
     '  priority overlay polygon', 'onModeSwitch(mode)']);

  /* ── render all nodes ── */
  Object.keys(N).forEach(function (k) {
    var n = N[k];
    svg.append('rect')
      .attr('x', n.x).attr('y', n.y).attr('width', n.w).attr('height', n.h)
      .attr('fill', n.fill).attr('stroke', n.stroke).attr('stroke-width', 1).attr('rx', 3);
    svg.append('text')
      .attr('x', n.x + 8).attr('y', n.y + 16)
      .attr('font-family', n.mono ? MONO : FONT)
      .attr('font-size', 11).attr('font-weight', 'bold').attr('fill', n.hcolor)
      .text(n.header);
    if (n.lines.length) {
      svg.append('line')
        .attr('x1', n.x + 1).attr('y1', n.y + 21)
        .attr('x2', n.x + n.w - 1).attr('y2', n.y + 21)
        .attr('stroke', n.stroke).attr('stroke-width', 0.4);
    }
    n.lines.forEach(function (line, li) {
      svg.append('text')
        .attr('x', n.x + 8).attr('y', n.y + 35 + li * LH)
        .attr('font-family', n.mono ? MONO : FONT)
        .attr('font-size', 9.5)
        .attr('fill', n.mono ? '#aaa' : '#777')
        .text(line);
    });
  });

  /* ── PORT HELPERS ── */
  /* right-center port */
  function rp(n)     { return [n.x + n.w, n.y + n.h / 2]; }
  /* left-center port */
  function lp(n)     { return [n.x,       n.y + n.h / 2]; }
  /* right port at explicit y */
  function rpy(n, y) { return [n.x + n.w, y]; }
  /* left port at explicit y */
  function lpy(n, y) { return [n.x,       y]; }
  /* bottom-center */
  function bp(n)     { return [n.x + n.w / 2, n.y + n.h]; }
  /* top-center */
  function tp(n)     { return [n.x + n.w / 2, n.y]; }

  /* ── EDGE DRAWING HELPERS ──────────────────────────────────────
   *
   *  All edges use one of four strategies:
   *
   *  1. hEdge  — short direct bezier between nodes in adjacent columns
   *  2. vEdge  — straight vertical arrow (same column, ols→rec)
   *  3. topRoute — elbow via TOP_LANE to bypass intermediate columns
   *  4. botRoute — elbow via BOT_LANE (used for callbacks going left)
   *
   *  Elbows use rounded corners (radius CR).
   * ────────────────────────────────────────────────────────────── */


  function drawEdge(d, color, markerId, dashed) {
    var el = svg.append('path')
      .attr('d', d).attr('fill', 'none')
      .attr('stroke', color).attr('stroke-width', 1.4)
      .attr('marker-end', 'url(#' + markerId + ')');
    if (dashed) el.attr('stroke-dasharray', '5,3');
  }

  /* edge label on horizontal segment between x1 and x2 at given y */
  function edgeLabel(x1, x2, y, text, color) {
    var mx = (x1 + x2) / 2;
    var bw = text.length * 5.5 + 8;
    svg.append('rect')
      .attr('x', mx - bw / 2).attr('y', y - 8)
      .attr('width', bw).attr('height', 13)
      .attr('fill', '#f8f8f8').attr('opacity', 0.92).attr('rx', 2);
    svg.append('text')
      .attr('x', mx).attr('y', y + 2)
      .attr('text-anchor', 'middle')
      .attr('font-family', MONO).attr('font-size', 8.5)
      .attr('fill', color).text(text);
  }

  /* SHORT DIRECT BEZIER — for nodes in adjacent columns at similar y */
  function hEdge(src, tgt, color, markerId, label) {
    var x1 = src[0], y1 = src[1], x2 = tgt[0], y2 = tgt[1];
    var t  = Math.max(Math.abs(x2 - x1) * 0.4, 12);
    var d  = 'M '+x1+' '+y1+' C '+(x1+t)+' '+y1+' '+(x2-t)+' '+y2+' '+x2+' '+y2;
    drawEdge(d, color, markerId, false);
    if (label) edgeLabel(x1, x2, (y1 + y2) / 2, label, color);
  }

  /* VERTICAL ARROW — ols → rec (same column) */
  function vEdge(src, tgt, color, markerId, label) {
    var x1 = src[0], y1 = src[1], x2 = tgt[0], y2 = tgt[1];
    drawEdge('M '+x1+' '+y1+' L '+x2+' '+y2, color, markerId, false);
    if (label) edgeLabel(x1 - 30, x1 + 30, (y1 + y2) / 2, label, color);
  }

  /* TOP BYPASS — route via TOP_LANE to skip one or more intermediate columns */
  function topRoute(x1, y1, x2, y2, color, markerId, label) {
    /* path: exit right of source, jog up to TOP_LANE, right, jog down to target */
    var tl = TOP_LANE;
    var r  = CR;
    var d  = [
      'M', x1, y1,
      /* go right a bit, then curve up */
      'H', (x1 + r),
      'Q', x1 + 2*r, y1,  x1 + 2*r, y1 - r,
      'V', tl + r,
      'Q', x1 + 2*r, tl,  x1 + 2*r + r, tl,
      /* travel right along TOP_LANE */
      'H', x2 - 2*r - r,
      'Q', x2 - 2*r, tl,  x2 - 2*r, tl + r,
      /* descend to target y */
      'V', y2 - r,
      'Q', x2 - 2*r, y2,  x2 - r, y2,
      'H', x2
    ].join(' ');
    drawEdge(d, color, markerId, false);
    if (label) edgeLabel(x1 + 2*r + r, x2 - 2*r - r, tl, label, color);
  }

  /* BOTTOM BYPASS — route via BOT_LANE (for callbacks going left) */
  function botRoute(x1, y1, x2, y2, color, markerId, dashed) {
    var bl = BOT_LANE;
    var r  = CR;
    /* exit left of source going down, travel left along BOT_LANE, rise to target */
    var d  = [
      'M', x1, y1,
      'H', x1 - r,
      'Q', x1 - 2*r, y1,  x1 - 2*r, y1 + r,
      'V', bl - r,
      'Q', x1 - 2*r, bl,  x1 - 2*r - r, bl,
      'H', x2 + 2*r + r,
      'Q', x2 + 2*r, bl,  x2 + 2*r, bl - r,
      'V', y2 + r,
      'Q', x2 + 2*r, y2,  x2 + r, y2,
      'H', x2
    ].join(' ');
    drawEdge(d, color, markerId, dashed);
  }

  /* ══════════════════════════════════════════════════════════════
   *  EDGES
   * ══════════════════════════════════════════════════════════════ */

  /* ── Database → db.py  (blue)
   *    Direct horizontal bezier across DB-BE corridor.
   * ── */
  hEdge(rpy(N.neighb,    N.neighb.y + 28),    lpy(N.db_n, N.db_n.y + 22),  '#4a90d9', 'mBlue', 'geometry');
  hEdge(rpy(N.nyc_units, N.nyc_units.y + 38), lpy(N.db_p, N.db_p.y + 22),  '#4a90d9', 'mBlue', 'units[ ]');
  hEdge(rpy(N.nyc_units, N.nyc_units.y + 110),lp(N.db_a),                   '#4a90d9', 'mBlue', null);

  /* ── db.py → API endpoints  (cyan)
   *    These BYPASS the logic column → use TOP_LANE.
   *    Exit right edge of db_fn node, arc over logic column, enter API left edge.
   * ── */
  topRoute(
    N.db_n.x + N.db_n.w,  N.db_n.y + N.db_n.h / 2,
    N.ep_n.x,              N.ep_n.y + N.ep_n.h / 2,
    '#7ecfff', 'mCyan', 'GeoJSON'
  );
  topRoute(
    N.db_p.x + N.db_p.w,  N.db_p.y + N.db_p.h / 2,
    N.ep_p.x,              N.ep_p.y + N.ep_p.h / 2,
    '#7ecfff', 'mCyan', '[]Property'
  );

  /* ── db_a → recommend.py  (gray)
   *    db_a exits right into logic-column gap, enters rec directly.
   *    Since both are near same y band, short bezier works.
   * ── */
  hEdge(rp(N.db_a), lp(N.rec), '#999', 'mGray', 'GeoDataFrame');

  /* ── ols → rec  (orange, vertical in same column) ── */
  vEdge(bp(N.ols), tp(N.rec), '#ffb347', 'mOrange', 'scores[]');

  /* ── rec → /recommend  (green, short horizontal) ── */
  hEdge(rp(N.rec), lp(N.ep_r), '#3ddc84', 'mGreen', 'GeoJSON+coef');

  /* ── llm_router → LLM endpoints  (purple, short horizontal) ── */
  hEdge(rpy(N.llm, N.llm.y + 22), lpy(N.ep_ex, N.ep_ex.y + 22), '#c084fc', 'mPurple', null);
  hEdge(rpy(N.llm, N.llm.y + 40), lpy(N.ep_er, N.ep_er.y + 22), '#c084fc', 'mPurple', null);
  hEdge(rpy(N.llm, N.llm.y + 58), lpy(N.ep_ch, N.ep_ch.y + 22), '#c084fc', 'mPurple', null);

  /* ── API → Frontend  (across BE-FE corridor)
   *    Direct beziers; corridor is wide enough.
   * ── */
  hEdge(rp(N.ep_n),  lpy(N.nbhd, N.nbhd.y + 28),   '#3ddc84', 'mGreen',  'GeoJSON');
  hEdge(rp(N.ep_p),  lpy(N.main, N.main.y + 82),    '#3ddc84', 'mGreen',  '[]Property');
  hEdge(rp(N.ep_r),  lpy(N.main, N.main.y + 130),   '#3ddc84', 'mGreen',  'GeoJSON 5K');
  hEdge(rp(N.ep_ex), lpy(N.main, N.main.y + 192),   '#c084fc', 'mPurple', 'text');
  hEdge(rp(N.ep_er), lpy(N.main, N.main.y + 224),   '#c084fc', 'mPurple', 'summary');
  hEdge(rp(N.ep_ch), lpy(N.main, N.main.y + 256),   '#c084fc', 'mPurple', '{filters}');

  /* ── main.js → Step Modules  (slate, solid = init call)
   *    Short horizontal beziers across main-steps corridor.
   * ── */
  hEdge(rpy(N.main, N.main.y + 18),  lpy(N.pref, N.pref.y + 28), '#7b8fa1', 'mSlate', null);
  hEdge(rpy(N.main, N.main.y + 52),  lpy(N.nbhd, N.nbhd.y + 62), '#7b8fa1', 'mSlate', null);
  hEdge(rpy(N.main, N.main.y + 108), lpy(N.rate, N.rate.y + 62), '#7b8fa1', 'mSlate', null);

  /* ── main.js → Render modules  (BYPASS steps column)
   *    Use TOP_LANE so arrows arc over the steps column.
   * ── */
  topRoute(
    N.main.x + N.main.w,    N.main.y + 144,
    N.map_js.x,              N.map_js.y + N.map_js.h / 2,
    '#4361ee', 'mIndigo', 'renderLayer'
  );
  topRoute(
    N.main.x + N.main.w,    N.main.y + 176,
    N.charts_js.x,           N.charts_js.y + N.charts_js.h / 2,
    '#e879a0', 'mPink', 'draw( )'
  );

  /* ── Step Modules → map.js  (indigo, BYPASS via TOP_LANE) ── */
  topRoute(
    N.nbhd.x + N.nbhd.w,    N.nbhd.y + 40,
    N.map_js.x,              N.map_js.y + 44,
    '#4361ee', 'mIndigo', 'loadPolygons'
  );
  topRoute(
    N.rate.x + N.rate.w,     N.rate.y + 40,
    N.map_js.x,              N.map_js.y + 120,
    '#4361ee', 'mIndigo', 'flyTo+pins'
  );

  /* ── Step callbacks → main.js  (slate, dashed, going LEFT)
   *    Use BOT_LANE to route below all nodes back to main.js right edge.
   * ── */
  botRoute(lpy(N.pref, N.pref.y + N.pref.h / 2), rpy(N.main, N.main.y + 12),  '#7b8fa1', 'mSlate', true);
  botRoute(lpy(N.nbhd, N.nbhd.y + N.nbhd.h / 2), rpy(N.main, N.main.y + 46),  '#7b8fa1', 'mSlate', true);
  botRoute(lpy(N.rate, N.rate.y + N.rate.h / 2),  rpy(N.main, N.main.y + 100), '#7b8fa1', 'mSlate', true);

  /* ── legend ── */
  var LEG = [
    { c: '#4a90d9', t: 'DB → db.py  (SQL)' },
    { c: '#7ecfff', t: 'db.py → API  (bypass logic)' },
    { c: '#3ddc84', t: 'API → Frontend  (JSON)' },
    { c: '#c084fc', t: 'LLM endpoints' },
    { c: '#ffb347', t: 'ols → rec  (scores)' },
    { c: '#4361ee', t: 'map.js calls' },
    { c: '#e879a0', t: 'charts.js calls' },
    { c: '#7b8fa1', t: 'orchestration (solid=init / dashed=callback)' },
  ];
  var lx = 14, ly = H - 18;
  LEG.forEach(function (l, i) {
    var xi = lx + i * 170;
    svg.append('line')
      .attr('x1', xi).attr('y1', ly - 3)
      .attr('x2', xi + 16).attr('y2', ly - 3)
      .attr('stroke', l.c).attr('stroke-width', 2);
    svg.append('text')
      .attr('x', xi + 20).attr('y', ly)
      .attr('font-family', FONT).attr('font-size', 8)
      .attr('fill', '#888').text(l.t);
  });

}());
