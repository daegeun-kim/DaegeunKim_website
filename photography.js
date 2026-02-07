(function () {
  const collage = document.getElementById("collage");
  if (!collage) return;

  const GAP = 8;                // must match CSS gap
  const BASE_ROW_H = () => {
    const w = collage.clientWidth;
    if (w <= 480) return 300;
    if (w <= 700) return 350;
    if (w <= 1100) return 400;
    return 500;
  };

  const items = Array.from(collage.querySelectorAll(".item"));
  const imgs = items.map(it => it.querySelector("img"));

  function getAR(img) {
    const w = img.naturalWidth || img.width || 1;
    const h = img.naturalHeight || img.height || 1;
    return w / h;
  }

  function layout() {
    const containerW = collage.clientWidth;
    if (!containerW) return;

    const targetH = BASE_ROW_H();

    let row = [];
    let sumAR = 0;

    const flushRow = (isLast) => {
      if (!row.length) return;

      const gapsW = GAP * (row.length - 1);
      const usableW = containerW - gapsW;

      // Calculate row height to fill the exact width
      let rowH = usableW / sumAR;
      
      // For last row, optionally constrain it to target height or less
      if (isLast) {
        rowH = Math.min(rowH, targetH);
      }

      let used = 0;

      row.forEach((it, idx) => {
        const ar = it.__ar || getAR(it.querySelector("img"));

        let w = Math.round(ar * rowH);

        // Last item in row gets adjusted width to fill any gaps and match usableW exactly
        if (idx === row.length - 1) {
          w = Math.max(1, usableW - used);
        }

        it.style.height = `${Math.round(rowH)}px`;
        it.style.width = `${w}px`;

        used += w;
      });

      row = [];
      sumAR = 0;
    };

    for (const it of items) {
      const img = it.querySelector("img");
      if (!img) continue;

      const ar = it.__ar || getAR(img);
      it.__ar = ar;

      row.push(it);
      sumAR += ar;

      const gapsW = GAP * (row.length - 1);
      const usableW = containerW - gapsW;
      const estW = sumAR * targetH;

      // When estimated width exceeds container, flush the row
      if (estW >= usableW) flushRow(false);
    }

    // Flush remaining items as last row
    flushRow(true);
  }

  function waitForImagesThenLayout() {
    let pending = 0;

    imgs.forEach((img, i) => {
      if (!img) return;

      const done = () => {
        const ar = getAR(img);
        items[i].__ar = ar;
        pending--;
        if (pending <= 0) layout();
      };

      if (img.complete && img.naturalWidth) {
        done();
        return;
      }

      pending++;
      img.addEventListener("load", done, { once: true });
      img.addEventListener("error", () => {
        pending--;
        if (pending <= 0) layout();
      }, { once: true });
    });

    if (pending === 0) layout();
  }

  const ro = new ResizeObserver(() => layout());
  ro.observe(collage);

  window.addEventListener("load", waitForImagesThenLayout);
  waitForImagesThenLayout();
})();
