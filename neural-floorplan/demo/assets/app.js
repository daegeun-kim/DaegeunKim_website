/* Neural Floorplan demo — stage player.
   Every number rendered here is read from the sample's own final_vector.json
   (bundled into data.js by demo/build_demo_assets.py). Nothing is computed,
   estimated, or hard-coded per sample. */

(function () {
  "use strict";

  var DATA = window.DEMO_DATA;
  if (!DATA || !DATA.samples || !DATA.samples.length) {
    document.getElementById("sheetNote").textContent =
      "assets/data.js is missing or empty. Run: python demo/build_demo_assets.py";
    return;
  }

  var STEP_MS = 900;

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // ?embed=1 drops the page masthead so the instrument can sit inside an
  // iframe on the project page without repeating its title. The colophon
  // stays: the CubiCasa5K attribution is a license condition and has to
  // remain visible wherever the page is shown.
  if (/[?&]embed=1\b/.test(window.location.search)) {
    document.documentElement.classList.add("is-embedded");
  }

  /* ------------------------------------------------------------- helpers */

  function num(v, digits) {
    if (typeof v !== "number" || !isFinite(v)) return "—";
    return digits === undefined ? String(v) : v.toFixed(digits);
  }

  function bbox(b) {
    return Array.isArray(b) && b.length === 4 ? b.join(", ") : "—";
  }

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text !== undefined) n.textContent = text;
    return n;
  }

  /* -------------------------------------------------------------- stages
     Each stage names the artifact it shows and pulls its own title-block
     fields out of the sample record. */

  var STAGES = [
    {
      name: "Input",
      desc: "Cropped, padded, 512 canvas",
      media: function (s) { return { image: s.images.input }; },
      note: function () {
        return "The raster is cropped to its content, padded by 20% white on every side, and " +
          "scaled onto a <strong>512 &times; 512</strong> canvas. Every later stage works in this " +
          "coordinate space.";
      },
      cells: function (s) {
        var p = s.preprocessing || {};
        return [
          ["Canvas", "512 × 512 px"],
          ["Bbox before", bbox(p.content_bbox_original)],
          ["Bbox after", bbox(p.content_bbox_after_preprocess)],
          ["Padding", p.padding_fraction !== undefined ? num(p.padding_fraction * 100, 0) + " %" : "—"]
        ];
      }
    },
    {
      name: "Segmentation",
      desc: "SegFormer-B0, seven classes",
      media: function (s) { return { image: s.images.segmentation }; },
      note: function () {
        return "A SegFormer-B0 decoder over a frozen <code>nvidia/mit-b0</code> encoder answers " +
          "<strong>what is here</strong>: background, floor, wall, window, door arc, door leaf, " +
          "door origin. This map is <strong>evidence for the next stages</strong>, not the output " +
          "&mdash; nothing is traced from it directly.";
      },
      cells: function () {
        return [
          ["Model", "SegFormer-B0"],
          ["Encoder", "mit-b0, frozen", true],
          ["Classes", "7"],
          ["Role", "opening evidence", true]
        ];
      }
    },
    {
      name: "Wall graph",
      desc: "Raster-to-Graph inference",
      media: function (s) { return { image: s.images.graph }; },
      note: function () {
        return "Raster-to-Graph answers the other half of the question &mdash; " +
          "<strong>how walls connect</strong>. It predicts junction nodes and the edges between " +
          "them. Segmentation cannot produce this, and this cannot produce openings.";
      },
      cells: function (s) {
        var m = s.metrics || {};
        return [
          ["Junction nodes", num(m.r2g_nodes)],
          ["Wall edges", num(m.r2g_edges)],
          ["Source", "Raster-to-Graph", true]
        ];
      }
    },
    {
      name: "Alignment",
      desc: "Snap the graph orthogonal",
      media: function (s) { return { image: s.images.aligned }; },
      note: function () {
        return "Raw predictions drift a few pixels off axis. Nodes are snapped and edges " +
          "regularised to orthogonal runs, which is what lets openings sit on a wall later. " +
          "Edge count rises here because split runs are resolved into separate edges.";
      },
      cells: function (s) {
        var m = s.metrics || {};
        return [
          ["Edges in", num(m.r2g_edges)],
          ["Edges aligned", num(m.aligned_edges)],
          ["Nodes pre-buffer", num(m.pre_buffer_node_count)],
          ["Nodes post-snap", num(m.post_snap_node_count)]
        ];
      }
    },
    {
      name: "Opening hosting",
      desc: "Attach doors and windows",
      media: function (s) { return { image: s.images.hosting }; },
      note: function () {
        return "Door and window evidence from the segmentation map is matched to a specific " +
          "<strong>host wall edge</strong>, then snapped onto it. Candidates that cannot be " +
          "hosted are rejected rather than guessed. The panel on the right is the pipeline's own " +
          "debug legend.";
      },
      cells: function (s) {
        var c = s.counts || {};
        var m = s.metrics || {};
        return [
          ["Doors hosted", num(c.doors)],
          ["Windows hosted", num(c.windows)],
          ["Rejected", num(c.rejected)],
          ["Wall gaps cut", num(m.opening_gaps)]
        ];
      }
    },
    {
      name: "Classified vector",
      desc: "Trim, buffer, export",
      media: function (s) { return { svg: s.svg }; },
      note: function () {
        return "Wall intervals are trimmed at each opening, the remaining chains are buffered to a " +
          "constant thickness, and doors get symbolic origin, leaf and swing geometry. This is " +
          "live SVG &mdash; toggle a layer or download the drawing below.";
      },
      cells: function (s) {
        var c = s.counts || {};
        var m = s.metrics || {};
        var sc = s.scale || {};
        return [
          ["Wall polygons", num(c.walls)],
          ["Wall chains", num(m.wall_chains)],
          ["Wall thk", m.wall_thickness_mm !== undefined ? num(m.wall_thickness_mm, 0) + " mm" : "—"],
          ["px_to_mm", num(sc.px_to_mm, 2)],
          ["Scale status", (sc.status || "—") + (sc.confidence !== undefined ? " · " + num(sc.confidence * 100, 0) + "%" : ""), true],
          ["Stage runtime", m.elapsed_s !== undefined ? num(m.elapsed_s, 2) + " s" : "—"]
        ];
      }
    }
  ];

  var LAYERS = [
    { id: "walls", label: "Walls", color: "var(--wall)" },
    { id: "windows", label: "Windows", color: "var(--window)" },
    { id: "doors", label: "Doors", color: "var(--door-arc)" }
  ];

  /* ---------------------------------------------------------------- refs */

  var refs = {
    samples: document.getElementById("samples"),
    ledger: document.getElementById("ledger"),
    run: document.getElementById("run"),
    runLabel: document.getElementById("runLabel"),
    runBar: document.getElementById("runBar"),
    sheetIndex: document.getElementById("sheetIndex"),
    sheetName: document.getElementById("sheetName"),
    sheetFull: document.getElementById("sheetFull"),
    sheetField: document.getElementById("sheetField"),
    sheetCanvas: document.getElementById("sheetCanvas"),
    sheetImg: document.getElementById("sheetImg"),
    zoomIn: document.getElementById("zoomIn"),
    zoomOut: document.getElementById("zoomOut"),
    zoomLevel: document.getElementById("zoomLevel"),
    sheetVector: document.getElementById("sheetVector"),
    sheetNote: document.getElementById("sheetNote"),
    layers: document.getElementById("layers"),
    layerSet: document.getElementById("layerSet"),
    downloads: document.getElementById("downloads"),
    titleCells: document.getElementById("titleCells"),
    provenance: document.getElementById("provenance")
  };

  var state = {
    sampleIndex: 0,
    stageIndex: 0,
    running: false,
    timer: null,
    fadeTimer: null,
    zoom: 1,
    hidden: {}
  };

  function sample() { return DATA.samples[state.sampleIndex]; }

  /* ------------------------------------------------------------ rail: samples */

  function buildSamples() {
    DATA.samples.forEach(function (s, i) {
      var b = el("button", "sample");
      b.type = "button";
      b.setAttribute("role", "radio");
      b.setAttribute("aria-checked", i === 0 ? "true" : "false");
      b.appendChild(el("span", "sample__id", "Plan " + s.id));
      var c = s.counts || {};
      b.appendChild(el("span", "sample__meta",
        c.walls + " walls · " + (c.doors + c.windows) + " openings"));
      b.addEventListener("click", function () { selectSample(i); });
      refs.samples.appendChild(b);
    });
  }

  function selectSample(i) {
    stopRun();
    state.sampleIndex = i;
    state.hidden = {};
    Array.prototype.forEach.call(refs.samples.children, function (b, n) {
      b.setAttribute("aria-checked", n === i ? "true" : "false");
    });
    setStage(0);
  }

  /* ------------------------------------------------------------ rail: ledger */

  function buildLedger() {
    STAGES.forEach(function (stage, i) {
      var li = document.createElement("li");
      var b = el("button", "stage");
      b.type = "button";
      b.appendChild(el("span", "stage__num", String(i + 1).padStart(2, "0")));
      var body = el("span", "stage__body");
      var name = el("span", "stage__name", stage.name);
      var desc = el("span", "stage__desc", stage.desc);
      body.appendChild(name);
      body.appendChild(desc);
      b.appendChild(body);
      b.addEventListener("click", function () { stopRun(); setStage(i); });
      li.appendChild(b);
      refs.ledger.appendChild(li);
    });
  }

  function paintLedger() {
    Array.prototype.forEach.call(refs.ledger.querySelectorAll(".stage"), function (b, i) {
      b.setAttribute("aria-current", i === state.stageIndex ? "true" : "false");
      b.classList.toggle("stage--done", i < state.stageIndex);
    });
  }

  /* ------------------------------------------------------------------ sheet */

  function renderStage() {
    var s = sample();
    var stage = STAGES[state.stageIndex];
    var media = stage.media(s);

    refs.sheetIndex.textContent = "Stage " + (state.stageIndex + 1) + " / " + STAGES.length;
    refs.sheetName.textContent = stage.name;
    refs.sheetNote.innerHTML = stage.note(s);

    if (media.svg) {
      refs.sheetImg.hidden = true;
      refs.sheetImg.removeAttribute("src");
      refs.sheetVector.hidden = false;
      refs.sheetVector.innerHTML = media.svg;
      refs.sheetFull.hidden = true;
      refs.layers.hidden = false;
      applyLayers();
    } else {
      refs.sheetVector.hidden = true;
      refs.sheetVector.innerHTML = "";
      refs.sheetImg.hidden = false;
      refs.sheetImg.src = media.image;
      refs.sheetImg.alt = stage.name + " — plan " + s.id + ": " + stage.desc;
      refs.sheetFull.hidden = false;
      refs.sheetFull.href = media.image;
      refs.sheetFull.target = "_blank";
      refs.layers.hidden = true;
    }

    renderCells(stage.cells(s));
    refs.provenance.textContent =
      "Plan " + s.id + " · CubiCasa5K · training split · " + DATA.source_run;
    paintLedger();
  }

  function renderCells(cells) {
    refs.titleCells.innerHTML = "";
    cells.forEach(function (c) {
      var d = el("div", "cell");
      d.appendChild(el("span", "cell__label", c[0]));
      d.appendChild(el("span", "cell__value" + (c[2] ? " cell__value--muted" : ""), String(c[1])));
      refs.titleCells.appendChild(d);
    });
  }

  function setStage(i) {
    state.stageIndex = i;
    resetZoom();
    // Clicking through the ledger faster than the fade would otherwise leave
    // two pending renders racing; the later click must win.
    if (state.fadeTimer) { window.clearTimeout(state.fadeTimer); state.fadeTimer = null; }
    if (reduceMotion) {
      refs.sheetField.dataset.fading = "false";
      renderStage();
      return;
    }
    refs.sheetField.dataset.fading = "true";
    state.fadeTimer = window.setTimeout(function () {
      state.fadeTimer = null;
      renderStage();
      refs.sheetField.dataset.fading = "false";
    }, 170);
  }

  /* ----------------------------------------------------------------- layers */

  function buildLayers() {
    LAYERS.forEach(function (layer) {
      var b = el("button", "layer");
      b.type = "button";
      b.setAttribute("aria-pressed", "true");
      var sw = el("span", "layer__swatch");
      sw.style.background = layer.color;
      b.appendChild(sw);
      b.appendChild(el("span", "layer__name", layer.label));
      b.addEventListener("click", function () {
        state.hidden[layer.id] = !state.hidden[layer.id];
        b.setAttribute("aria-pressed", state.hidden[layer.id] ? "false" : "true");
        applyLayers();
      });
      refs.layerSet.appendChild(b);
    });
  }

  function applyLayers() {
    LAYERS.forEach(function (layer) {
      refs.sheetVector.classList.toggle("hide-" + layer.id, !!state.hidden[layer.id]);
    });
    Array.prototype.forEach.call(refs.layerSet.children, function (b, i) {
      b.setAttribute("aria-pressed", state.hidden[LAYERS[i].id] ? "false" : "true");
    });
    renderDownloads();
  }

  function renderDownloads() {
    var s = sample();
    if (refs.downloads.dataset.for === s.id) return;
    refs.downloads.dataset.for = s.id;
    refs.downloads.innerHTML = "";
    [["SVG", s.downloads.svg], ["JSON", s.downloads.json]].forEach(function (d) {
      var a = el("a", "download", "Download " + d[0]);
      a.href = d[1];
      a.setAttribute("download", "");
      refs.downloads.appendChild(a);
    });
  }

  /* ------------------------------------------------------------------- zoom
     Zoom works by growing a canvas inside a scrolling field rather than by
     transforming the media. That keeps scrollbars honest, gives touch devices
     native panning for free, and lets the SVG stage re-render crisply at any
     level instead of being scaled as a bitmap. */

  var ZOOM_STEPS = [1, 1.5, 2, 3, 4];

  function zoomIndex() {
    var i = ZOOM_STEPS.indexOf(state.zoom);
    return i === -1 ? 0 : i;
  }

  function applyZoom(keepCentre) {
    var field = refs.sheetField;
    var z = state.zoom;

    // Where the viewport centre sits in canvas space, before resizing.
    var cx = 0.5, cy = 0.5;
    if (keepCentre && field.scrollWidth > 0 && field.scrollHeight > 0) {
      cx = (field.scrollLeft + field.clientWidth / 2) / field.scrollWidth;
      cy = (field.scrollTop + field.clientHeight / 2) / field.scrollHeight;
    }

    if (z === 1) {
      refs.sheetCanvas.style.width = "";
      refs.sheetCanvas.style.height = "";
    } else {
      var style = window.getComputedStyle(field);
      var w = field.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight);
      var h = field.clientHeight - parseFloat(style.paddingTop) - parseFloat(style.paddingBottom);
      refs.sheetCanvas.style.width = Math.round(w * z) + "px";
      refs.sheetCanvas.style.height = Math.round(h * z) + "px";
    }

    refs.sheetCanvas.dataset.zoomed = z > 1 ? "true" : "false";

    // Restore the centre so zooming feels anchored rather than jumping home.
    if (z > 1) {
      field.scrollLeft = cx * field.scrollWidth - field.clientWidth / 2;
      field.scrollTop = cy * field.scrollHeight - field.clientHeight / 2;
    }

    refs.zoomLevel.textContent = z === 1 ? "Fit" : Math.round(z * 100) + "%";
    refs.zoomOut.setAttribute("aria-disabled", z === ZOOM_STEPS[0] ? "true" : "false");
    refs.zoomIn.setAttribute("aria-disabled", z === ZOOM_STEPS[ZOOM_STEPS.length - 1] ? "true" : "false");
  }

  function setZoom(z, keepCentre) {
    var clamped = Math.min(Math.max(z, ZOOM_STEPS[0]), ZOOM_STEPS[ZOOM_STEPS.length - 1]);
    if (clamped === state.zoom) { applyZoom(keepCentre); return; }
    state.zoom = clamped;
    applyZoom(keepCentre);
  }

  function resetZoom() {
    state.zoom = 1;
    refs.sheetField.scrollTop = 0;
    refs.sheetField.scrollLeft = 0;
    applyZoom(false);
  }

  refs.zoomIn.addEventListener("click", function () {
    setZoom(ZOOM_STEPS[Math.min(zoomIndex() + 1, ZOOM_STEPS.length - 1)], true);
  });
  refs.zoomOut.addEventListener("click", function () {
    setZoom(ZOOM_STEPS[Math.max(zoomIndex() - 1, 0)], true);
  });
  refs.zoomLevel.addEventListener("click", resetZoom);

  // Double-click / double-tap toggles between fit and 2x.
  refs.sheetCanvas.addEventListener("dblclick", function () {
    setZoom(state.zoom === 1 ? 2 : 1, state.zoom === 1);
  });

  // Drag to pan with a mouse; touch already pans by scrolling the field.
  (function enableDragPan() {
    var dragging = false, startX = 0, startY = 0, startLeft = 0, startTop = 0;

    refs.sheetCanvas.addEventListener("pointerdown", function (e) {
      if (state.zoom === 1 || e.pointerType === "touch" || e.button !== 0) return;
      dragging = true;
      startX = e.clientX; startY = e.clientY;
      startLeft = refs.sheetField.scrollLeft; startTop = refs.sheetField.scrollTop;
      refs.sheetCanvas.dataset.dragging = "true";
      refs.sheetCanvas.setPointerCapture(e.pointerId);
      e.preventDefault();
    });

    refs.sheetCanvas.addEventListener("pointermove", function (e) {
      if (!dragging) return;
      refs.sheetField.scrollLeft = startLeft - (e.clientX - startX);
      refs.sheetField.scrollTop = startTop - (e.clientY - startY);
    });

    function endDrag(e) {
      if (!dragging) return;
      dragging = false;
      refs.sheetCanvas.dataset.dragging = "false";
      if (refs.sheetCanvas.hasPointerCapture(e.pointerId)) {
        refs.sheetCanvas.releasePointerCapture(e.pointerId);
      }
    }
    refs.sheetCanvas.addEventListener("pointerup", endDrag);
    refs.sheetCanvas.addEventListener("pointercancel", endDrag);
  })();

  // A zoomed canvas is sized in pixels, so it has to be recomputed when the
  // field changes size.
  if (window.ResizeObserver) {
    var ro = new ResizeObserver(function () { if (state.zoom !== 1) applyZoom(true); });
    ro.observe(refs.sheetField);
  }

  /* -------------------------------------------------------------------- run */

  function startRun() {
    state.running = true;
    refs.run.dataset.running = "true";
    refs.runLabel.textContent = "Running";
    state.stageIndex = -1;
    advance();
  }

  function advance() {
    var next = state.stageIndex + 1;
    if (next >= STAGES.length) { finishRun(); return; }
    setStage(next);
    refs.runBar.style.width = ((next + 1) / STAGES.length * 100) + "%";
    state.timer = window.setTimeout(advance, reduceMotion ? 260 : STEP_MS);
  }

  function finishRun() {
    state.running = false;
    refs.run.dataset.running = "false";
    refs.runLabel.textContent = "Run again";
    window.setTimeout(function () { refs.runBar.style.width = "0"; }, 320);
  }

  function stopRun() {
    if (state.timer) { window.clearTimeout(state.timer); state.timer = null; }
    if (state.running) {
      state.running = false;
      refs.run.dataset.running = "false";
      refs.runLabel.textContent = "Run pipeline";
      refs.runBar.style.width = "0";
    }
  }

  refs.run.addEventListener("click", function () {
    if (state.running) return;
    startRun();
  });

  /* ------------------------------------------------------------------ init */

  buildSamples();
  buildLedger();
  buildLayers();
  selectSample(0);
  applyZoom(false);
})();
