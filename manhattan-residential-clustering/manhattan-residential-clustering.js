/* ============================================================
   Manhattan Residential Clustering.
   - Data explorer: an interactive Mapbox map with a building-
     footprint PNG overlaid via map.project() georeferencing
     (the proven approach from the original project). Buttons
     switch the active data layer.
   - Cluster explorer: a button-switched viewer of the pre-composed
     cluster maps (each already includes its basemap and legend).
   Replaces the old full-screen scroll-driven implementation.
   ============================================================ */
(function () {
  "use strict";
  if (typeof mapboxgl === "undefined" || typeof config === "undefined") return;
  mapboxgl.accessToken = config.mapboxToken;

  // Georeferencing box for the analysis footprint PNGs (image corners).
  var W = -74.045461501003, S = 40.702445805924, E = -73.699700837637, N = 40.878143492702;
  var BOUNDS = [[W, S], [E, N]];
  var STYLE  = "mapbox://styles/kdgkim/cmernksk6007501qo11bpa34m";
  var DIR    = "/manhattan-residential-clustering/";
  var V      = "?v=20260725";

  var DATA_LAYERS = [
    { label: "Building stories", src: DIR + "analysis_image/BLD_STORY.png" + V,
      stat: "Max 71 · Mean 7.9 · Median 5 stories",
      desc: "Over half of Manhattan's residential buildings are five stories or fewer, concentrated in the West Village, Soho, East Village, and Harlem. Taller buildings cluster in Lower Manhattan, Midtown, and along the Hudson and Central Park." },
    { label: "Construction year", src: DIR + "analysis_image/construction_year.png" + V,
      stat: "1795–2025 · Median 1910",
      desc: "Construction has been steady over two centuries, peaking in the early 20th century. The oldest buildings sit in the West Village and Soho; the newest line the Hudson and Roosevelt Island." },
    { label: "Building height", src: DIR + "analysis_image/height_roof.png" + V,
      stat: "6.6–900 ft · Median 61.5 ft",
      desc: "The tallest residential buildings concentrate in Lower Manhattan and along the Hudson. The height distribution mirrors the story count, with most structures under 100 feet." },
    { label: "Time to subway", src: DIR + "analysis_image/station_time_taken.png" + V,
      stat: "0.14–20.15 min · Median 4.93 min",
      desc: "Subway access is best in Midtown and Lower Manhattan; the East Village and parts of the Hudson shore are farthest. Most buildings are within a five-minute walk of a station." },
    { label: "Average value", src: DIR + "analysis_image/CURMRKTOT.png" + V,
      stat: "Median $441,500 · Mean $862,301",
      desc: "Average property value highlights the social divide: the priciest cluster on the Upper East and West Sides, the least expensive in the East Village, Chinatown, and Upper Manhattan." },
    { label: "Value / sqft", src: DIR + "analysis_image/price_per_sqft.png" + V,
      stat: "Median $261 · Max $7,445 /sqft",
      desc: "Per-square-foot value peaks in the Upper East Side and Soho. Soho pairs below-average totals with the highest per-sqft values, reflecting small, exceptionally expensive units." },
    { label: "Value change '24–'25", src: DIR + "analysis_image/price_inc.png" + V,
      stat: "-23% to +64% · Median +3.6%",
      desc: "Most values rose steadily. Pockets of decline sit in Soho and Harlem, while sharp spikes appear in the East Village, Upper East Side, and Washington Heights." },
    { label: "Building class", src: DIR + "analysis_image/BLDG_CLASS.png" + V,
      stat: "Mostly multifamily elevator & mixed-use",
      desc: "Most buildings are multifamily elevator or mixed residential-commercial. Less common one- and two-family homes and walk-ups appear in the West Village, Upper East Side, and Harlem." },
    { label: "Elevator access", src: DIR + "analysis_image/elevator.png" + V,
      stat: "38.1% with · 61.9% without",
      desc: "Nearly two-thirds of buildings lack elevators, reflecting low-rise housing on the East and West Sides. Elevator buildings are fewer but larger and more prominent." },
    { label: "Residential area", src: DIR + "analysis_image/residential_area.png" + V,
      stat: "Median 1,995 sqft · Max 81,000 sqft",
      desc: "Large-area buildings line the waterfront and Central Park; smaller houses and walk-ups fill Soho and Chinatown." },
    { label: "Residential share", src: DIR + "analysis_image/res_share.png" + V,
      stat: "Median 91% · Mean 69%",
      desc: "Most buildings are either fully residential or fully non-residential. Waterfront properties skew 100% residential, while Midtown and Soho allocate more space to commercial or mixed use." }
  ];

  var CLUSTERS = [
    { label: "Socio-spatial", src: DIR + "cluster_sociospatial.png" + V,
      weights: "Height 3 · Subway 3 · Value/sqft 1 · Elevator 1 · Residential share 1",
      desc: "Two groups dominate: transit-accessible affordable walk-ups along transit corridors, and peripheral walk-ups at the city's edges with more limited access." },
    { label: "Architectural", src: DIR + "cluster_architectural.png" + V,
      weights: "Stories 3 · Height 3 · Elevator 1 · Gross area 2 · Residential share 2",
      desc: "Dominated by small-scale walk-ups: low, modest floor area, high residential share, while other types vary widely across height, area, and share. Walk-ups form an absolute majority." },
    { label: "Evolutionary", src: DIR + "cluster_evolutionary.png" + V,
      weights: "Construction year 4 · Height 2 · Value/sqft 1 · Class 1",
      desc: "Focused on temporal factors. A large share is early-20th-century multi-family low-rises, followed by a band of mid-20th-century mid-rises, reflecting Manhattan's historical layering." },
    { label: "Economic-financial", src: DIR + "cluster_ecofin.png" + V,
      weights: "Stories 1 · Avg value 3 · Value/sqft 3 · Value change 3",
      desc: "Built from valuation indicators. Many buildings are affordable walk-ups near transit, while a distinct subset shows exceptionally high value growth, a stark contrast in financial performance." }
  ];

  function makeButtons(controlsEl, layers, onSelect) {
    return layers.map(function (layer, i) {
      var b = document.createElement("button");
      b.type = "button";
      b.textContent = layer.label;
      b.setAttribute("aria-pressed", i === 0 ? "true" : "false");
      if (i === 0) b.classList.add("is-active");
      b.addEventListener("click", function () { onSelect(i); });
      controlsEl.appendChild(b);
      return b;
    });
  }

  function setActive(btns, i) {
    btns.forEach(function (b, idx) {
      b.classList.toggle("is-active", idx === i);
      b.setAttribute("aria-pressed", String(idx === i));
    });
  }

  function caption(el, l) {
    var html = "<b>" + l.label + "</b>";
    if (l.stat) html += ' <span class="me-stat">' + l.stat + "</span>";
    if (l.weights) html += '<br><span class="me-weights"><b>Weights:</b> ' + l.weights + "</span>";
    html += "<br>" + l.desc;
    el.innerHTML = html;
  }

  /* ---- Data explorer: static (non-zoomable) map with a footprint PNG
     overlay georeferenced via map.project() onto its exact Manhattan
     corners. Zoom and pan are disabled. ---- */
  function makeMapExplorer(mapId, controlsId, captionId, layers) {
    var mapEl = document.getElementById(mapId);
    var controlsEl = document.getElementById(controlsId);
    var captionEl = document.getElementById(captionId);
    if (!mapEl || !controlsEl || !captionEl) return;

    var map = new mapboxgl.Map({
      container: mapId, style: STYLE,
      bounds: BOUNDS, fitBoundsOptions: { padding: 0 },
      interactive: false, attributionControl: true, fadeDuration: 0
    });
    ["scrollZoom", "boxZoom", "dragRotate", "dragPan", "keyboard",
     "doubleClickZoom", "touchZoomRotate"].forEach(function (h) {
      if (map[h] && map[h].disable) map[h].disable();
    });

    var img = document.createElement("img");
    img.alt = "";
    Object.assign(img.style, {
      position: "absolute", left: "0", top: "0",
      transformOrigin: "top left", pointerEvents: "none", zIndex: "1"
    });

    function refit() {
      map.fitBounds(BOUNDS, { padding: 0, duration: 0 });
      map.setCenter([-73.964581, 40.790300]);
      // Scale so the footprint image fills the frame vertically. The island runs
      // as a tall diagonal strip with empty margins left and right, so a narrow
      // frame crops that empty space instead of shrinking the map.
      var tl = map.project([W, N]);
      var br = map.project([E, S]);
      var h = br.y - tl.y;
      var target = mapEl.clientHeight * 0.88;
      if (h > 0 && target > 0) map.setZoom(map.getZoom() + Math.log(target / h) / Math.LN2);
      position();
    }

    function position() {
      if (!img.naturalWidth) return;
      var tl = map.project([W, N]);
      var br = map.project([E, S]);
      img.style.width = img.naturalWidth + "px";
      img.style.height = img.naturalHeight + "px";
      img.style.transform = "translate(" + tl.x + "px," + tl.y + "px) scale(" +
        ((br.x - tl.x) / img.naturalWidth) + "," + ((br.y - tl.y) / img.naturalHeight) + ")";
    }

    function show(i) {
      setActive(btns, i);
      caption(captionEl, layers[i]);
      img.onload = position;
      img.src = layers[i].src;
    }

    var btns = makeButtons(controlsEl, layers, show);

    map.on("load", function () {
      map.getCanvasContainer().appendChild(img);
      map.on("render", position);
      window.addEventListener("resize", refit);
      refit();
      show(0);
    });
  }

  /* ---- Cluster explorer: button-switched pre-composed maps ---- */
  function makeImageExplorer(imgId, controlsId, captionId, layers) {
    var imgEl = document.getElementById(imgId);
    var controlsEl = document.getElementById(controlsId);
    var captionEl = document.getElementById(captionId);
    if (!imgEl || !controlsEl || !captionEl) return;

    function show(i) {
      setActive(btns, i);
      imgEl.src = layers[i].src;
      imgEl.alt = layers[i].label + " clustering of Manhattan residential buildings";
      caption(captionEl, layers[i]);
    }

    var btns = makeButtons(controlsEl, layers, show);
    show(0);
  }

  function init() {
    makeMapExplorer("data-map", "data-controls", "data-caption", DATA_LAYERS);
    makeImageExplorer("cluster-img", "cluster-controls", "cluster-caption", CLUSTERS);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
