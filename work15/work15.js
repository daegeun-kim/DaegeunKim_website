/* ============================================================
   BIM RAG portfolio subpage — work15.js
   Two independent concerns:
     1. Header hide/show behavior (self-contained; does not use root main.js)
     2. Static D3-rendered pipeline flowchart (fixed coordinates,
        explicit waypoints, no force simulation, no animation)
   ============================================================ */

/* ------------------------------------------------------------
   1. Header behavior
   ------------------------------------------------------------ */
(function () {
  var header = document.getElementById('header');
  if (!header) return;
  var lastScroll = 0;
  var revealThreshold = 80;
  var reduceMotion = window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  document.addEventListener('DOMContentLoaded', function () {
    if (!reduceMotion) header.classList.add('animate');
  });

  window.addEventListener('scroll', function () {
    var current = window.scrollY || window.pageYOffset;
    if (current <= 0) {
      header.classList.remove('hidden');
      lastScroll = 0;
      return;
    }
    if (current > lastScroll) {
      header.classList.add('hidden');
    } else {
      header.classList.remove('hidden');
    }
    lastScroll = current;
  }, { passive: true });

  window.addEventListener('mousemove', function (e) {
    if (e.clientY <= revealThreshold) header.classList.remove('hidden');
  });
})();


/* ------------------------------------------------------------
   2. Pipeline flowchart
   ------------------------------------------------------------ */
(function () {
  var container = d3.select('#pipeline-flowchart');
  if (container.empty()) return;

  var VB_W = 1200, VB_H = 1600;

  /* ---- category palette (border + fill + text) ---------------
     SQL / RAG / Graph are ALSO distinguished by their text labels,
     never by color alone. */
  var CAT = {
    store:   { fill: '#eef1f5', stroke: '#8a9bb0', text: '#33465c' },
    proc:    { fill: '#f4f4f5', stroke: '#a1a1aa', text: '#3f3f46' },
    query:   { fill: '#eef4ff', stroke: '#3b6fd4', text: '#1e3a8a' },
    det:     { fill: '#f4f4f5', stroke: '#71717a', text: '#27272a' },
    llm:     { fill: '#fdf1e3', stroke: '#b45309', text: '#7c2d12' },
    gate:    { fill: '#fff4e6', stroke: '#ea580c', text: '#9a3412' },
    sql:     { fill: '#e8f0fe', stroke: '#2563eb', text: '#1e40af' },
    rag:     { fill: '#e7f5f2', stroke: '#0d9488', text: '#0f5f56' },
    graph:   { fill: '#f1ebfb', stroke: '#7c3aed', text: '#5b21b6' },
    answer:  { fill: '#eaf7ee', stroke: '#2f9e5b', text: '#166534' },
    viewer:  { fill: '#e8f0fe', stroke: '#2563eb', text: '#1e40af' },
    trace:   { fill: '#fafafa', stroke: '#b8b8bd', text: '#52525b' }
  };

  /* ---- nodes: cx, cy = center. label lines split on '|' ------- */
  var NODES = [
    /* region 1 — ingestion & model preparation */
    { id: 'ifc',      cx: 150,  cy: 70,   w: 150, h: 50, cat: 'store', label: 'Original|IFC Files' },
    { id: 'parser',   cx: 590,  cy: 70,   w: 170, h: 50, cat: 'proc',  label: 'IfcOpenShell|Parser' },
    { id: 'viewer',   cx: 1030, cy: 70,   w: 150, h: 50, cat: 'viewer',label: 'Viewer|Fragments' },
    { id: 'pg',       cx: 590,  cy: 180,  w: 170, h: 50, cat: 'store', label: 'PostgreSQL|BIM Facts' },
    { id: 'rag',      cx: 1030, cy: 180,  w: 150, h: 50, cat: 'rag',   label: 'RAG|Documents' },
    { id: 'rel',      cx: 150,  cy: 290,  w: 180, h: 50, cat: 'store', label: 'Relationships /|Spatial Membership' },
    { id: 'manifest', cx: 590,  cy: 290,  w: 190, h: 50, cat: 'store', label: 'Semantic Manifest|v002 (JSON)' },
    { id: 'emb',      cx: 1030, cy: 290,  w: 190, h: 50, cat: 'rag',   label: 'BGE-M3 Embeddings|/ pgvector' },
    { id: 'contract', cx: 590,  cy: 395,  w: 190, h: 50, cat: 'store', label: 'Semantic Access|Contract' },

    /* region 2 — semantic binding & validation */
    { id: 'uq',       cx: 150,  cy: 515,  w: 150, h: 50, cat: 'query', label: 'User|Query' },
    { id: 'ctx',      cx: 370,  cy: 515,  w: 180, h: 50, cat: 'query', label: 'Conversation /|Selection Context' },
    { id: 'ledger',   cx: 150,  cy: 625,  w: 160, h: 50, cat: 'det',   label: 'Constraint|Ledger' },
    { id: 'channels', cx: 590,  cy: 625,  w: 210, h: 50, cat: 'det',   label: 'Parallel Recommendation|Channels' },
    { id: 'proj',     cx: 1030, cy: 625,  w: 190, h: 50, cat: 'det',   label: 'Compact Binder|Projection' },
    { id: 'binder',   cx: 590,  cy: 730,  w: 176, h: 50, cat: 'llm',   label: 'LLM Binder|&mdash; Call 1' },
    { id: 'plan',     cx: 590,  cy: 830,  w: 176, h: 50, cat: 'det',   label: 'Typed Logical|Plan' },
    { id: 'correct',  cx: 1030, cy: 830,  w: 190, h: 50, cat: 'llm',   label: 'Optional|Correction LLM' },
    { id: 'gate',     cx: 590,  cy: 925,  w: 176, h: 50, cat: 'gate',  label: 'Validation|Gate' },

    /* region 3 — execution, answer & viewer */
    { id: 'compiler', cx: 590,  cy: 1045, w: 200, h: 50, cat: 'det',   label: 'Predicate / Physical|Plan Compiler' },
    { id: 'sql',      cx: 370,  cy: 1150, w: 160, h: 50, cat: 'sql',   label: 'SQL|Execution' },
    { id: 'scoped',   cx: 590,  cy: 1150, w: 170, h: 50, cat: 'rag',   label: 'Scoped RAG|Retrieval' },
    { id: 'graph',    cx: 810,  cy: 1150, w: 170, h: 50, cat: 'graph', label: 'IFC Graph|Traversal' },
    { id: 'results',  cx: 590,  cy: 1255, w: 190, h: 50, cat: 'det',   label: 'Operation-Specific|Results' },
    { id: 'packet',   cx: 590,  cy: 1350, w: 184, h: 50, cat: 'det',   label: 'Grounded Answer|Packet' },
    { id: 'viewhi',   cx: 1030, cy: 1350, w: 172, h: 50, cat: 'viewer',label: '3D Viewer|Highlights' },
    { id: 'finalllm', cx: 590,  cy: 1445, w: 176, h: 50, cat: 'llm',   label: 'Final LLM|&mdash; Call 2' },
    { id: 'answval',  cx: 590,  cy: 1540, w: 190, h: 50, cat: 'det',   label: 'Answer Validation|/ Fallback' },
    { id: 'useranswer', cx: 150, cy: 1540, w: 150, h: 50, cat: 'answer', label: 'User|Answer' }
  ];

  var byId = {};
  NODES.forEach(function (n) { byId[n.id] = n; });

  function anchor(id, side, off) {
    var n = byId[id]; off = off || 0;
    switch (side) {
      case 'top':    return [n.cx + off, n.cy - n.h / 2];
      case 'bottom': return [n.cx + off, n.cy + n.h / 2];
      case 'left':   return [n.cx - n.w / 2, n.cy + off];
      case 'right':  return [n.cx + n.w / 2, n.cy + off];
    }
    return [n.cx, n.cy];
  }

  /* ---- edges. Each: from/to node+side, optional offsets, via
     waypoints (absolute), label + label position, style flags. */
  /* Every edge attaches to the CENTER of a node side (top/right/bottom/left).
     `via` waypoints keep all straight segments strictly horizontal or vertical;
     pathFrom() adds the rounded corners. No diagonal segments anywhere. */
  var EDGES = [
    /* -- region 1 ingestion -- */
    { f: ['ifc','right'],      t: ['parser','left'],   label: 'parse',            lp: [365, 58] },
    { f: ['parser','right'],   t: ['viewer','left'],   label: 'geometry',         lp: [815, 58] },
    { f: ['parser','bottom'],  t: ['pg','top'],        label: 'structured facts', lp: [680, 125] },
    { f: ['pg','right'],       t: ['rag','left'],      label: 'templated text',   lp: [815, 168] },
    { f: ['rag','bottom'],     t: ['emb','top'],       label: '1,024-d vectors',  lp: [1095, 235] },
    { f: ['pg','left'],        t: ['rel','top'],       via: [[150,180]], label: 'relationships', lp: [320, 168] },
    { f: ['pg','bottom'],      t: ['manifest','top'],  label: 'capability scan',  lp: [490, 238] },
    { f: ['manifest','bottom'],t: ['contract','top'],  label: 'access contract',  lp: [690, 343] },

    /* -- store -> query / execution feeds (routed via gutters & lanes) -- */
    { f: ['pg','left'],  t: ['sql','left'],     via: [[30,180],[30,1150]], label: 'exact facts', lp: [72, 760] },
    { f: ['pg','right'], t: ['graph','top'],    via: [[920,180],[920,1095],[810,1095]], label: 'graph edges', lp: [922, 760] },
    { f: ['pg','left'],  t: ['channels','left'],via: [[470,180],[470,625]], label: 'stored values', lp: [472, 470] },
    { f: ['emb','left'], t: ['channels','right'],via: [[870,290],[870,625]], label: 'dense similarity', lp: [872, 455] },
    { f: ['manifest','right'], t: ['proj','top'], via: [[830,290],[830,540],[1030,540]], label: 'projection', lp: [832, 445] },
    { f: ['contract','right'], t: ['compiler','right'], via: [[850,395],[850,1045]], label: 'access contract', lp: [852, 720] },
    { f: ['viewer','right'], t: ['viewhi','right'], via: [[1150,70],[1150,1350]], label: 'viewer fragments', lp: [1150, 720] },

    /* -- region 2 binding -- */
    { f: ['uq','bottom'],      t: ['ledger','top'],   label: 'requirements', lp: [205, 572] },
    { f: ['ctx','bottom'],     t: ['ledger','top'],   via: [[370,575],[150,575]], label: 'context', lp: [300, 566] },
    { f: ['uq','bottom'],      t: ['channels','top'], via: [[150,565],[590,565]], label: 'query terms', lp: [410, 556] },
    { f: ['ledger','right'],   t: ['binder','left'],  via: [[370,625],[370,730]], label: 'constraints', lp: [300, 610] },
    { f: ['channels','bottom'],t: ['binder','top'],   label: 'ranked recall', lp: [665, 678] },
    { f: ['proj','left'],      t: ['binder','right'], via: [[810,625],[810,730]], label: 'compact manifest', lp: [775, 700] },
    { f: ['binder','bottom'],  t: ['plan','top'],     label: 'semantic IDs', lp: [665, 780] },
    { f: ['plan','bottom'],    t: ['gate','top'],     label: 'logical plan', lp: [665, 878] },
    { f: ['gate','right'],     t: ['correct','bottom'], via: [[1030,925]], label: 'correctable gap', lp: [860, 912] },
    { f: ['correct','left'],   t: ['plan','right'],   label: 'one retry', lp: [806, 818] },
    { f: ['gate','left'],      t: ['packet','left'],  via: [[60,925],[60,1350]], label: 'unavailable / clarify', lp: [140, 1120] },

    /* -- region 3 execution & answer -- */
    { f: ['gate','bottom'],    t: ['compiler','top'], label: 'validated', lp: [665, 986] },
    { f: ['compiler','bottom'],t: ['sql','top'],      via: [[590,1100],[370,1100]], label: 'parameterized SQL', lp: [450, 1088] },
    { f: ['compiler','bottom'],t: ['scoped','top'],   label: 'SQL-scoped RAG', lp: [685, 1100] },
    { f: ['compiler','bottom'],t: ['graph','top'],    via: [[590,1100],[810,1100]], label: 'bounded traversal', lp: [712, 1088] },
    { f: ['sql','bottom'],     t: ['results','left'], via: [[370,1255]], label: '', lp: [0,0] },
    { f: ['scoped','bottom'],  t: ['results','top'],  label: '', lp: [0,0] },
    { f: ['graph','bottom'],   t: ['results','top'],  via: [[810,1210],[590,1210]], label: '', lp: [0,0] },
    { f: ['results','bottom'], t: ['packet','top'],   label: 'grounded facts', lp: [668, 1302] },
    { f: ['results','right'],  t: ['viewhi','left'],  via: [[810,1255],[810,1350]], label: 'same predicate', lp: [770, 1300] },
    { f: ['packet','bottom'],  t: ['finalllm','top'], label: 'grounded packet', lp: [680, 1398] },
    { f: ['finalllm','bottom'],t: ['answval','top'],  label: 'prose', lp: [650, 1492] },
    { f: ['answval','left'],   t: ['useranswer','right'], label: 'grounded answer', lp: [355, 1528] }
  ];

  /* ---- rounded orthogonal path builder ---------------------- */
  function pathFrom(points, r) {
    r = r || 9;
    if (points.length < 2) return '';
    var d = 'M' + points[0][0] + ',' + points[0][1];
    for (var i = 1; i < points.length - 1; i++) {
      var p = points[i], prev = points[i - 1], next = points[i + 1];
      var v1 = norm(p, prev), v2 = norm(p, next);
      var rr = Math.min(r, dist(p, prev) / 2, dist(p, next) / 2);
      var a = [p[0] + v1[0] * rr, p[1] + v1[1] * rr];
      var b = [p[0] + v2[0] * rr, p[1] + v2[1] * rr];
      d += ' L' + a[0] + ',' + a[1] + ' Q' + p[0] + ',' + p[1] + ' ' + b[0] + ',' + b[1];
    }
    var last = points[points.length - 1];
    d += ' L' + last[0] + ',' + last[1];
    return d;
  }
  function norm(from, to) {
    var dx = to[0] - from[0], dy = to[1] - from[1];
    var m = Math.hypot(dx, dy) || 1;
    return [dx / m, dy / m];
  }
  function dist(a, b) { return Math.hypot(b[0] - a[0], b[1] - a[1]); }

  /* ---- SVG scaffold ----------------------------------------- */
  var svg = container.append('svg')
    .attr('viewBox', '0 0 ' + VB_W + ' ' + VB_H)
    .attr('preserveAspectRatio', 'xMidYMid meet')
    .attr('role', 'img')
    .attr('aria-labelledby', 'pipe-title pipe-desc');

  svg.append('title').attr('id', 'pipe-title')
    .text('BIM RAG full information flow');
  svg.append('desc').attr('id', 'pipe-desc')
    .text('A connected pipeline in three regions. Region one ingests IFC files into a ' +
      'PostgreSQL fact store, relationship and spatial membership tables, RAG documents with ' +
      'BGE-M3 vectors, a semantic manifest, an access contract, and viewer fragments. Region ' +
      'two turns a user question and context into a constraint ledger and parallel recommendation ' +
      'channels, which the LLM binder maps to a typed logical plan; a validation gate either passes ' +
      'it, routes a correctable gap through one optional correction call and back, or returns an ' +
      'unavailable or clarification response. Region three compiles the plan into SQL, scoped RAG, ' +
      'and bounded graph traversal, merges them into operation-specific results, builds a grounded ' +
      'answer packet, writes the final answer, validates it, and highlights the same result in the ' +
      '3D viewer.');

  var defs = svg.append('defs');
  ['#5b6470', '#b8b8bd'].forEach(function (col, i) {
    var m = defs.append('marker')
      .attr('id', 'pipe-arrow-' + i)
      .attr('viewBox', '0 0 10 10')
      .attr('refX', 8).attr('refY', 5)
      .attr('markerWidth', 7).attr('markerHeight', 7)
      .attr('orient', 'auto-start-reverse');
    m.append('path').attr('d', 'M0,0 L10,5 L0,10 z').attr('fill', col);
  });

  /* ---- region bands ----------------------------------------- */
  var BANDS = [
    { y: 25,  h: 415, label: '1 · Ingestion & model preparation' },
    { y: 460, h: 510, label: '2 · Semantic binding & validation' },
    { y: 985, h: 605, label: '3 · Execution, answer & viewer' }
  ];
  var bandG = svg.append('g');
  BANDS.forEach(function (b) {
    bandG.append('rect')
      .attr('x', 10).attr('y', b.y).attr('width', 1180).attr('height', b.h)
      .attr('rx', 10)
      .attr('fill', '#fcfcfd').attr('stroke', '#ececf0').attr('stroke-width', 1);
    bandG.append('text')
      .attr('x', 20).attr('y', b.y + 15)
      .style('font-family', 'Helvetica, Arial, sans-serif')
      .style('font-size', '13px').style('font-weight', 'bold')
      .attr('fill', '#b0b0b8').attr('letter-spacing', '0.04em')
      .text(b.label);
  });

  /* ---- edges ------------------------------------------------- */
  var edgeG = svg.append('g');
  var labelG = svg.append('g');

  EDGES.forEach(function (e) {
    var start = anchor(e.f[0], e.f[1], e.f[2]);
    var end = anchor(e.t[0], e.t[1], e.t[2]);
    var pts = [start].concat(e.via || []).concat([end]);
    edgeG.append('path')
      .attr('d', pathFrom(pts))
      .attr('fill', 'none')
      .attr('stroke', e.diag ? '#c4c4ca' : '#5b6470')
      .attr('stroke-width', e.diag ? 1 : 1.6)
      .attr('stroke-dasharray', e.diag ? '4 4' : null)
      .attr('marker-end', 'url(#pipe-arrow-' + (e.diag ? 1 : 0) + ')');

    if (e.label) {
      var lg = labelG.append('g')
        .attr('transform', 'translate(' + e.lp[0] + ',' + e.lp[1] + ')');
      var txt = lg.append('text')
        .attr('text-anchor', 'middle').attr('dy', '0.32em')
        .style('font-family', 'Helvetica, Arial, sans-serif')
        .style('font-size', '11px')
        .attr('fill', e.diag ? '#9a9aa2' : '#54606e')
        .html(e.label);
      var bb = txt.node().getBBox();
      lg.insert('rect', 'text')
        .attr('x', bb.x - 3).attr('y', bb.y - 1)
        .attr('width', bb.width + 6).attr('height', bb.height + 2)
        .attr('rx', 2).attr('fill', '#ffffff').attr('opacity', 0.92);
    }
  });

  /* ---- nodes ------------------------------------------------- */
  var nodeG = svg.append('g');
  NODES.forEach(function (n) {
    var c = CAT[n.cat];
    var g = nodeG.append('g')
      .attr('transform', 'translate(' + (n.cx - n.w / 2) + ',' + (n.cy - n.h / 2) + ')');
    g.append('rect')
      .attr('width', n.w).attr('height', n.h)
      .attr('rx', 8)
      .attr('fill', c.fill).attr('stroke', c.stroke)
      .attr('stroke-width', 1.5);

    var lines = n.label.split('|');
    var lh = 13.5;
    var startY = n.tall
      ? 26
      : n.h / 2 - ((lines.length - 1) * lh) / 2;
    var tx = g.append('text')
      .attr('x', n.w / 2)
      .attr('text-anchor', 'middle')
      .style('font-family', 'Helvetica, Arial, sans-serif')
      .style('font-size', '12.5px').style('font-weight', 'bold')
      .attr('fill', c.text);
    lines.forEach(function (ln, i) {
      tx.append('tspan')
        .attr('x', n.w / 2)
        .attr('y', startY + i * lh)
        .attr('dy', '0.32em')
        .html(ln);
    });
  });
})();
