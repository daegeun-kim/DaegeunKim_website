/* =================================================================
   Daegeun Kim - Shared site behaviour
   Header scroll state, mobile menu, scroll reveals, and the
   homepage project filter. Every block is feature-guarded so the
   script is safe to load on any page. Motion respects
   prefers-reduced-motion.
   ================================================================= */
(() => {
  "use strict";

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const cleanUrlMap = new Map([
    ["index.html", "/"],
    ["about.html", "/about/"],
    ["bim_rag.html", "/bimtrieval/"],
    ["bimtrieval.html", "/bimtrieval/"],
    ["bryantparksolar.html", "/bryant-park-solar-mapping/"],
    ["cruciform.html", "/hong-kong-cruciform-towers/"],
    ["explorentory.html", "/explorentory/"],
    ["explorentory/presentation.html", "/explorentory/presentation/"],
    ["geoestatechat.html", "/geoestatechat/"],
    ["mergeprep.html", "/mergeprep/"],
    ["moireshade.html", "/moire-shade/"],
    ["neural_floorplan.html", "/neural-floorplan/"],
    ["no_true_north.html", "/no-true-north/"],
    ["parametricCity.html", "/parametric-city-generation/"],
    ["photography.html", "/photography/"],
    ["residentialclustering.html", "/manhattan-residential-clustering/"],
    ["spiraldwelling.html", "/spiral-dwelling/"],
    ["streetblock.html", "/street-block-urbanity-prediction/"],
    ["streetblockDL.html", "/street-block-gnn-prediction/"],
    ["transitmapping.html", "/manhattan-transit-accessibility-mapping/"]
  ]);

  document.querySelectorAll("a[href]").forEach((link) => {
    const href = link.getAttribute("href");
    const match = href && href.match(/^([^?#]+)([?#].*)?$/);
    const cleanUrl = match && cleanUrlMap.get(match[1]);
    if (cleanUrl) link.setAttribute("href", cleanUrl + (match[2] || ""));
  });

  /* --- Header: hairline appears once the page is scrolled --- */
  const header = document.querySelector("[data-site-header]");
  if (header) {
    const onScroll = () => {
      header.classList.toggle("is-scrolled", window.scrollY > 4);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  /* --- Mobile navigation disclosure --- */
  const toggle = document.querySelector("[data-nav-toggle]");
  const nav = document.querySelector("[data-site-nav]");
  if (toggle && nav) {
    const setOpen = (open) => {
      toggle.setAttribute("aria-expanded", String(open));
      nav.classList.toggle("is-open", open);
    };
    toggle.addEventListener("click", () => {
      setOpen(toggle.getAttribute("aria-expanded") !== "true");
    });
    nav.addEventListener("click", (e) => {
      if (e.target.closest("a")) setOpen(false);
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && toggle.getAttribute("aria-expanded") === "true") {
        setOpen(false);
        toggle.focus();
      }
    });
    // Reset when leaving the mobile breakpoint
    window.matchMedia("(min-width: 721px)").addEventListener("change", (e) => {
      if (e.matches) setOpen(false);
    });
  }

  /* --- Scroll reveal --- */
  const revealables = document.querySelectorAll(".reveal");
  if (revealables.length) {
    if (reduceMotion || !("IntersectionObserver" in window)) {
      revealables.forEach((el) => el.classList.add("is-in"));
    } else {
      const io = new IntersectionObserver((entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-in");
            obs.unobserve(entry.target);
          }
        });
      }, { rootMargin: "0px 0px -8% 0px", threshold: 0.1 });
      revealables.forEach((el) => io.observe(el));
    }
  }

  /* --- Homepage project filter --- */
  const filterBar = document.querySelector("[data-filters]");
  const grid = document.querySelector("[data-work-grid]");
  if (filterBar && grid) {
    const buttons = filterBar.querySelectorAll("[data-filter]");
    const items = grid.querySelectorAll("[data-category]");

    const apply = (filter) => {
      items.forEach((item) => {
        const cats = (item.dataset.category || "").split(/\s+/).filter(Boolean);
        const show = filter === "all" || cats.includes(filter);
        item.hidden = !show;
      });
    };

    buttons.forEach((btn) => {
      btn.addEventListener("click", () => {
        buttons.forEach((b) => {
          const active = b === btn;
          b.classList.toggle("is-active", active);
          b.setAttribute("aria-pressed", String(active));
        });
        apply(btn.dataset.filter || "all");
      });
    });

    const initial = filterBar.querySelector('[data-filter="all"]') || buttons[0];
    if (initial) {
      initial.classList.add("is-active");
      initial.setAttribute("aria-pressed", "true");
      apply(initial.dataset.filter || "all");
    }
  }
})();
