/* ============================================================
   BIMtrieval portfolio subpage — diagrams.

   One small static renderer (D3 v7 used only for selection and
   element creation) draws every diagram on the page:

     #roles-diagram      five-role communication map
     #v1-diagram         pipeline v1, left to right
     #v2-diagram         pipeline v2, left to right
     #v3-diagram         final v3, left to right
     #pipeline-flowchart final v3 full information flow

   Fixed coordinates, explicit waypoints, orthogonal routing with
   rounded corners. No force simulation, no animation, no timers,
   so there is nothing for prefers-reduced-motion to suppress.
   ============================================================ */
(function () {
  if (typeof d3 === 'undefined') return;

  /* ---- category palette (border + fill + text) ---------------
     SQL / RAG / graph are ALSO distinguished by their text labels,
     never by colour alone. */
  var CAT = {
    store:  { fill: '#eef1f5', stroke: '#8a9bb0', text: '#33465c' },
    proc:   { fill: '#f4f4f5', stroke: '#a1a1aa', text: '#3f3f46' },
    query:  { fill: '#eef4ff', stroke: '#3b6fd4', text: '#1e3a8a' },
    det:    { fill: '#f4f4f5', stroke: '#71717a', text: '#27272a' },
    llm:    { fill: '#fdf1e3', stroke: '#b45309', text: '#7c2d12' },
    gate:   { fill: '#fff4e6', stroke: '#ea580c', text: '#9a3412' },
    sql:    { fill: '#e8f0fe', stroke: '#2563eb', text: '#1e40af' },
    rag:    { fill: '#e7f5f2', stroke: '#0d9488', text: '#0f5f56' },
    graph:  { fill: '#f1ebfb', stroke: '#7c3aed', text: '#5b21b6' },
    answer: { fill: '#eaf7ee', stroke: '#2f9e5b', text: '#166534' },
    viewer: { fill: '#e8f0fe', stroke: '#2563eb', text: '#1e40af' },

    /* Five office roles, one fill each. Every box is also named in
       text, so no meaning depends on colour alone; each pairing keeps
       a dark label on a pale ground for contrast. */
    roleMgr:   { fill: '#f1f5f9', stroke: '#475569', text: '#1e293b' },
    roleJob:   { fill: '#dbeafe', stroke: '#1d4ed8', text: '#1e3a8a' },
    rolePm:    { fill: '#dcfce7', stroke: '#15803d', text: '#14532d' },
    roleCoord: { fill: '#ede9fe', stroke: '#6d28d9', text: '#4c1d95' },
    roleArch:  { fill: '#fef3c7', stroke: '#b45309', text: '#78350f' }
  };

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

  var uid = 0;

  function render(sel, spec) {
    var container = d3.select(sel);
    if (container.empty()) return;

    var byId = {};
    spec.nodes.forEach(function (n) { byId[n.id] = n; });

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

    uid += 1;
    var tid = 'dgm-t-' + uid, did = 'dgm-d-' + uid, aid = 'dgm-a-' + uid;

    var svg = container.append('svg')
      .attr('viewBox', '0 0 ' + spec.w + ' ' + spec.h)
      .attr('preserveAspectRatio', 'xMidYMid meet')
      .attr('role', 'img')
      .attr('aria-labelledby', tid + ' ' + did);

    svg.append('title').attr('id', tid).text(spec.title);
    svg.append('desc').attr('id', did).text(spec.desc);

    var marker = svg.append('defs').append('marker')
      .attr('id', aid)
      .attr('viewBox', '0 0 10 10')
      .attr('refX', 8).attr('refY', 5)
      .attr('markerWidth', 7).attr('markerHeight', 7)
      .attr('orient', 'auto-start-reverse');
    marker.append('path').attr('d', 'M0,0 L10,5 L0,10 z').attr('fill', '#5b6470');

    /* region bands */
    var bandG = svg.append('g');
    (spec.bands || []).forEach(function (b) {
      bandG.append('rect')
        .attr('x', 14).attr('y', b.y)
        .attr('width', spec.w - 28).attr('height', b.h)
        .attr('rx', 10)
        .attr('fill', '#fcfcfd').attr('stroke', '#c2c4cc').attr('stroke-width', 1);
      bandG.append('text')
        .attr('x', 76).attr('y', b.y + 15)
        .style('font-family', 'Helvetica, Arial, sans-serif')
        .style('font-size', '13px').style('font-weight', 'bold')
        .attr('fill', '#b0b0b8').attr('letter-spacing', '0.04em')
        .text(b.label);
    });

    /* dashed note plates — context, not communication nodes */
    (spec.plates || []).forEach(function (p) {
      var g = bandG.append('g').attr('transform', 'translate(' + p.x + ',' + p.y + ')');
      g.append('rect')
        .attr('width', p.w).attr('height', p.h).attr('rx', 8)
        .attr('fill', 'none').attr('stroke', '#c4c4ca')
        .attr('stroke-width', 1.2).attr('stroke-dasharray', '5 4');
      var plines = p.label.split('|');
      var pt = g.append('text')
        .attr('x', p.w / 2).attr('text-anchor', 'middle')
        .style('font-family', 'Helvetica, Arial, sans-serif')
        .style('font-size', '12px').attr('fill', '#7c828b');
      plines.forEach(function (ln, i) {
        pt.append('tspan').attr('x', p.w / 2)
          .attr('y', p.h / 2 - ((plines.length - 1) * 15) / 2 + i * 15)
          .attr('dy', '0.32em').html(ln);
      });
    });

    /* edges */
    var edgeG = svg.append('g');
    var labelG = svg.append('g');

    spec.edges.forEach(function (e) {
      var start = anchor(e.f[0], e.f[1], e.f[2]);
      var end = anchor(e.t[0], e.t[1], e.t[2]);
      var pts = [start].concat(e.via || []).concat([end]);
      edgeG.append('path')
        .attr('d', pathFrom(pts))
        .attr('fill', 'none')
        .attr('stroke', '#5b6470')
        .attr('stroke-width', 1.6)
        .attr('marker-end', 'url(#' + aid + ')');

      if (e.label) {
        var lg = labelG.append('g')
          .attr('transform', 'translate(' + e.lp[0] + ',' + e.lp[1] + ')');
        var txt = lg.append('text')
          .attr('text-anchor', 'middle').attr('dy', '0.32em')
          .style('font-family', 'Helvetica, Arial, sans-serif')
          .style('font-size', (spec.edgeFont || 11) + 'px')
          .attr('fill', '#54606e')
          .html(e.label);
        var bb = txt.node().getBBox();
        lg.insert('rect', 'text')
          .attr('x', bb.x - 3).attr('y', bb.y - 1)
          .attr('width', bb.width + 6).attr('height', bb.height + 2)
          .attr('rx', 2).attr('fill', '#ffffff').attr('opacity', 0.94);
      }
    });

    /* nodes */
    var nodeG = svg.append('g');
    spec.nodes.forEach(function (n) {
      var c = CAT[n.cat] || CAT.det;
      var g = nodeG.append('g')
        .attr('transform', 'translate(' + (n.cx - n.w / 2) + ',' + (n.cy - n.h / 2) + ')');
      g.append('rect')
        .attr('width', n.w).attr('height', n.h)
        .attr('rx', spec.nodeRx || 8)
        .attr('fill', c.fill).attr('stroke', c.stroke)
        .attr('stroke-width', 1.5);

      var fs = spec.nodeFont || 12.5;
      var lines = n.label.split('|');
      var lh = fs + 1;
      var startY = n.h / 2 - ((lines.length - 1) * lh) / 2;
      var tx = g.append('text')
        .attr('x', n.w / 2)
        .attr('text-anchor', 'middle')
        .style('font-family', 'Helvetica, Arial, sans-serif')
        .style('font-size', fs + 'px').style('font-weight', 'bold')
        .attr('fill', c.text);
      lines.forEach(function (ln, i) {
        tx.append('tspan')
          .attr('x', n.w / 2)
          .attr('y', startY + i * lh)
          .attr('dy', '0.32em')
          .html(ln);
      });
    });
  }

  /* ============================================================
     1. Five-role communication map
     ============================================================ */
  /* Two stacked pairs share a column centre — BIM Manager over Job
     Captain on the left, Project Manager over BIM Coordinator on the
     right — with the Project Architect in the middle. All four of the
     Project Architect's connectors arrive perpendicular: horizontal
     into its left and right edges, vertical into its bottom edge. */
  render('#roles-diagram', {
    w: 1220, h: 500,
    nodeFont: 15.5, edgeFont: 13, nodeRx: 16,
    title: 'How five roles communicate around one BIM model',
    desc: 'Five roles surround one shared BIM model. On the left the BIM Manager sits directly ' +
      'above the Job Captain and architectural staff and sends them templates and standards; it ' +
      'also sends modelling rules across to the BIM Coordinator. On the right the Project Manager ' +
      'sits directly above the BIM Coordinator, which reports coordination status upward. The ' +
      'Project Architect is central: design intent leaves its left edge for the Job Captain, who ' +
      'returns the model state into its bottom edge; the BIM Coordinator returns completeness and ' +
      'level-of-development gaps into the same bottom edge, and the Project Manager agrees scope, ' +
      'fee and schedule through its right edge. The Job Captain issues the model to the BIM ' +
      'Coordinator for checking and receives coordination findings back.',
    nodes: [
      { id: 'mgr',   cx: 200,  cy: 90,  w: 210, h: 52, cat: 'roleMgr',   label: 'BIM Manager' },
      { id: 'job',   cx: 200,  cy: 400, w: 230, h: 64, cat: 'roleJob',   label: 'Job Captain /|Architectural Staff' },
      { id: 'pm',    cx: 1020, cy: 90,  w: 210, h: 52, cat: 'rolePm',    label: 'Project Manager' },
      { id: 'coord', cx: 1020, cy: 400, w: 210, h: 52, cat: 'roleCoord', label: 'BIM Coordinator' },
      { id: 'arch',  cx: 610,  cy: 245, w: 230, h: 56, cat: 'roleArch',  label: 'Project Architect' }
    ],
    edges: [
      /* left column, right column, and the loop between them */
      { f: ['mgr','bottom'], t: ['job','top'],
        label: 'templates &amp; standards', lp: [200, 178] },
      { f: ['mgr','top'], t: ['coord','right'], via: [[200,28],[1180,28],[1180,400]],
        label: 'modelling rules', lp: [690, 28] },
      { f: ['coord','left',14], t: ['job','right',14],
        label: 'coordination findings', lp: [615, 402] },
      { f: ['job','bottom'], t: ['coord','bottom'], via: [[200,470],[1020,470]],
        label: 'model issued for checking', lp: [610, 470] },
      { f: ['coord','top'], t: ['pm','bottom'],
        label: 'coordination status', lp: [1020, 250] },

      /* the four Project Architect connectors, all perpendicular */
      { f: ['arch','left'], t: ['job','top',50], via: [[250,245]],
        label: 'design intent', lp: [372, 233] },
      { f: ['job','top',100], t: ['arch','bottom',-65], via: [[300,330],[545,330]],
        label: 'model state', lp: [420, 318] },
      { f: ['coord','left'], t: ['arch','bottom',65], via: [[820,400],[820,330],[675,330]],
        label: 'completeness &amp; LOD', lp: [750, 316] },
      { f: ['pm','left'], t: ['arch','right'], via: [[880,90],[880,245]],
        label: 'scope, fee, schedule', lp: [880, 172] }
    ]
  });

  /* ============================================================
     2-4. Pipeline versions, one row each, left to right
     ============================================================ */
  var MINI_W = 1100, MINI_H = 104;
  var MINI_X = [100, 325, 550, 775, 1000];

  /* Five stages, one row, plain arrows: the sequence is the message, so
     these arrows carry no labels. The boxes are sized close to their
     labels — just enough padding to breathe, no more. */
  function mini(sel, title, desc, labels, cats) {
    var nodes = labels.map(function (label, i) {
      return { id: 'n' + i, cx: MINI_X[i], cy: 52, w: 172, h: 58, cat: cats[i], label: label };
    });
    var edges = [];
    for (var i = 0; i < 4; i++) {
      edges.push({ f: ['n' + i, 'right'], t: ['n' + (i + 1), 'left'] });
    }
    render(sel, { w: MINI_W, h: MINI_H, nodeFont: 13.5, title: title, desc: desc, nodes: nodes, edges: edges });
  }

  mini('#v1-diagram',
    'Pipeline v1 - broad retrieval, late narrowing',
    'A user question goes to an LLM that chooses a retrieval route. The backend retrieves ' +
    'broad evidence groups over SQL, RAG and graph, bundles group summaries with up to fifty ' +
    'sample rows, and the final LLM selects the relevant groups and writes the answer.',
    ['User|question',
     'LLM picks the|retrieval route',
     'Broad evidence|groups: SQL,|RAG, graph',
     'Group summaries|+ up to 50|sample rows',
     'Final LLM selects|and writes|the answer'],
    ['query', 'llm', 'det', 'det', 'llm']);

  mini('#v2-diagram',
    'Pipeline v2 - strict early planning',
    'A user question goes to a deterministic slate builder that proposes a small bounded set ' +
    'of subject, property, value and location candidates. The LLM binder may only select from ' +
    'that slate, producing typed answer parts. Each part is executed once, and the final LLM ' +
    'writes from a compact evidence packet.',
    ['User|question',
     'Deterministic|candidate slate',
     'LLM binder picks|from the slate',
     'Typed answer parts,|executed once',
     'Final LLM writes|from a compact|packet'],
    ['query', 'det', 'llm', 'det', 'llm']);

  mini('#v3-diagram',
    'Final pipeline v3 - bounded middle ground',
    'A user question becomes a typed constraint ledger beside the complete semantic manifest ' +
    'for the active model. The LLM binder may select any concept in that manifest. A ' +
    'deterministic validation gate checks the binding and allows at most one correction, and ' +
    'bounded adjudicated evidence goes to the final LLM.',
    ['User|question',
     'Complete manifest|+ constraint ledger',
     'LLM binder over|the whole manifest',
     'Validation gate|+ one retry',
     'Bounded evidence|&rarr; final LLM'],
    ['query', 'store', 'llm', 'gate', 'llm']);

  /* ============================================================
     5. Final v3 full information flow
     ============================================================ */
  /* Tightened to fit the 1080px subpage column without a scrollbar:
     narrower nodes, smaller horizontal gaps, and routing lanes pulled
     in to the band edges. Every v3 stage and connection is preserved. */
  render('#pipeline-flowchart', {
    w: 1130, h: 790,
    title: 'BIMtrieval final v3 information flow',
    desc: 'Three regions. Region one ingests one IFC file: IfcOpenShell parses it with typed ' +
      'length, area and volume measures into PostgreSQL BIM facts, which produce the semantic ' +
      'manifest, the RAG documents and their pgvector embeddings, and the viewer fragments. ' +
      'Region two turns a user question and context into a constraint ledger and manifest-wide ' +
      'recommendations, which reach the LLM binder together with the complete manifest; a ' +
      'validation gate checks the binding and may trigger one correction call before releasing ' +
      'a validated plan. Region three executes that plan as typed SQL over the stored facts, ' +
      'bounded graph traversal over IFC relationships, and SQL-scoped RAG retrieval; the three ' +
      'merge into an adjudicated evidence packet that feeds both the final grounded-answer LLM ' +
      'call, checked before it is displayed, and the 3D viewer highlight derived from the same ' +
      'executed predicate.',
    bands: [
      { y: 18,  h: 150, label: '1. Ingestion, once per model' },
      { y: 188, h: 248, label: '2. Interpretation and typed binding' },
      { y: 450, h: 328, label: '3. Execution, answer and viewer' }
    ],
    nodes: [
      { id: 'ifc',      cx: 133,  cy: 112, w: 145, h: 50, cat: 'store',  label: 'Original|IFC file' },
      { id: 'parser',   cx: 306,  cy: 112, w: 145, h: 50, cat: 'proc',   label: 'IfcOpenShell parse|+ typed measures' },
      { id: 'pg',       cx: 479,  cy: 112, w: 145, h: 50, cat: 'store',  label: 'PostgreSQL|BIM facts' },
      { id: 'manifest', cx: 652,  cy: 112, w: 145, h: 50, cat: 'store',  label: 'Semantic|manifest' },
      { id: 'ragdocs',  cx: 825,  cy: 112, w: 145, h: 50, cat: 'rag',    label: 'RAG documents|+ pgvector' },
      { id: 'frag',     cx: 998,  cy: 112, w: 145, h: 50, cat: 'viewer', label: 'Viewer|fragments' },

      { id: 'question', cx: 150,  cy: 305, w: 150, h: 50, cat: 'query',  label: 'User question|+ context' },
      { id: 'ledger',   cx: 355,  cy: 250, w: 160, h: 50, cat: 'det',    label: 'Constraint|ledger' },
      { id: 'recs',     cx: 355,  cy: 360, w: 180, h: 50, cat: 'det',    label: 'Manifest-wide|recommendations' },
      { id: 'binder',   cx: 730,  cy: 305, w: 165, h: 50, cat: 'llm',    label: 'LLM binder|&mdash; call 1' },
      { id: 'gate',     cx: 950,  cy: 305, w: 155, h: 50, cat: 'gate',   label: 'Validation|gate' },
      { id: 'correct',  cx: 950,  cy: 398, w: 165, h: 50, cat: 'llm',    label: 'One correction|(if provable)' },

      { id: 'sql',      cx: 430,  cy: 520, w: 175, h: 50, cat: 'sql',    label: 'Typed SQL|execution' },
      { id: 'graph',    cx: 645,  cy: 520, w: 175, h: 50, cat: 'graph',  label: 'Bounded graph|traversal' },
      { id: 'scoped',   cx: 860,  cy: 520, w: 175, h: 50, cat: 'rag',    label: 'SQL-scoped|RAG retrieval' },
      { id: 'packet',   cx: 645,  cy: 630, w: 215, h: 50, cat: 'det',    label: 'Adjudicated|evidence packet' },
      { id: 'answer',   cx: 645,  cy: 725, w: 185, h: 50, cat: 'llm',    label: 'Grounded answer|&mdash; call 2' },
      { id: 'chatout',  cx: 300,  cy: 725, w: 200, h: 56, cat: 'answer', label: 'Answer in chat|+ explanation panel' },
      { id: 'viewer3d', cx: 960,  cy: 725, w: 165, h: 50, cat: 'viewer', label: '3D viewer|highlight' }
    ],
    edges: [
      /* region 1 — ingestion order reads left to right, so the three
         short hops need no labels of their own */
      { f: ['ifc','right'],    t: ['parser','left'] },
      { f: ['parser','right'], t: ['pg','left'] },
      { f: ['pg','right'],     t: ['manifest','left'] },
      { f: ['pg','top'],       t: ['ragdocs','top'], via: [[479,62],[825,62]], label: 'embed', lp: [652, 62] },
      { f: ['parser','top'],   t: ['frag','top'],    via: [[306,44],[998,44]], label: 'viewer artifact', lp: [520, 44] },

      /* stores feeding the query side */
      { f: ['manifest','bottom',28], t: ['binder','top',-50], label: 'complete manifest', lp: [680, 205] },
      { f: ['pg','bottom',-25], t: ['sql','left'], via: [[454,172],[56,172],[56,520]], label: 'exact facts', lp: [220, 508] },
      { f: ['pg','bottom',-65], t: ['graph','bottom',-40], via: [[414,160],[32,160],[32,578],[605,578]], label: 'IFC relationships', lp: [500, 566] },
      { f: ['ragdocs','bottom',58], t: ['scoped','right',15], via: [[883,160],[1075,160],[1075,535]], label: 'semantic evidence', lp: [1010, 523] },
      { f: ['frag','bottom',55], t: ['viewer3d','right'], via: [[1053,150],[1100,150],[1100,725]], label: 'geometry', lp: [1096, 610] },

      /* region 2 — interpretation and binding */
      { f: ['question','top'],    t: ['ledger','left'], via: [[150,250]], label: 'requirements', lp: [212, 238] },
      { f: ['question','bottom'], t: ['recs','left'],   via: [[150,360]], label: 'query terms', lp: [207, 348] },
      { f: ['ledger','right'], t: ['binder','left',-12], via: [[545,250],[545,293]], label: 'typed constraints', lp: [498, 238] },
      { f: ['recs','right'],   t: ['binder','left',12],  via: [[575,360],[575,317]], label: 'ranked candidates', lp: [512, 348] },
      { f: ['binder','right'], t: ['gate','left'],       label: 'typed plan', lp: [843, 268] },
      { f: ['gate','bottom'],  t: ['correct','top'],     label: 'recoverable gap', lp: [950, 352] },
      { f: ['correct','left'], t: ['binder','bottom'],   via: [[730,398]], label: 'one retry', lp: [793, 386] },

      /* region 3 — execution, answer and viewer */
      { f: ['gate','right'], t: ['sql','top'],    via: [[1050,305],[1050,470],[430,470]] },
      { f: ['gate','right'], t: ['graph','top'],  via: [[1050,305],[1050,470],[645,470]] },
      { f: ['gate','right'], t: ['scoped','top'], via: [[1050,305],[1050,470],[860,470]], label: 'validated plan', lp: [962, 458] },
      { f: ['sql','bottom'],      t: ['packet','left'],  via: [[430,630]] },
      { f: ['graph','bottom',40], t: ['packet','top',40] },
      { f: ['scoped','bottom'],   t: ['packet','right'], via: [[860,630]] },
      { f: ['packet','bottom'],   t: ['answer','top'],   label: 'adjudicated evidence', lp: [645, 678] },
      { f: ['answer','left'],     t: ['chatout','right'], label: 'grounding check', lp: [476, 713] },
      { f: ['packet','bottom',80], t: ['viewer3d','top'], via: [[725,690],[960,690]], label: 'same predicate', lp: [855, 690] }
    ]
  });
})();
