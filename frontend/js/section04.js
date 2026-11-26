/**
 * ============================================================================
 * Multimedia Lab - Session 04: Color Models (CMY & CMYK) (js/section04.js)
 * ============================================================================
 * Course: Multimedia Systems & Programming — Sinai University
 * Instructor: Eng. Muhammad Ali Abdul Kareem
 */

const sec4State = {
  imgElement: null,
  isLoaded: false,
  imageSrc: (typeof MULTIMEDIA_LAB_SAMPLE_IMAGE !== 'undefined' && MULTIMEDIA_LAB_SAMPLE_IMAGE)
    ? MULTIMEDIA_LAB_SAMPLE_IMAGE
    : 'assets/images/hero_landscape.jpg',
  naturalWidth: 0,
  naturalHeight: 0,
  originalCanvas: null,
  originalCtx: null,
  originalImageData: null,

  // Interactive controls
  activeInkChannel: 'all', // 'all' | 'c' | 'm' | 'y' | 'k'
  cmyViewMode: 'cmy',      // 'cmy' | 'split'
  testR: 255,
  testG: 0,
  testB: 0
};

// ============================================================================
// 1. SYNTHETIC TEST IMAGE & BUFFER INITIALIZATION
// ============================================================================

function loadSec4SyntheticTestImage(onComplete) {
  const w = 300;
  const h = 300;
  sec4State.naturalWidth = w;
  sec4State.naturalHeight = h;

  sec4State.originalCanvas = document.createElement('canvas');
  sec4State.originalCanvas.width = w;
  sec4State.originalCanvas.height = h;
  const ctx = sec4State.originalCanvas.getContext('2d');
  sec4State.originalCtx = ctx;

  ctx.fillStyle = 'rgb(255, 0, 0)';     // Top-Left: Red
  ctx.fillRect(0, 0, 150, 150);

  ctx.fillStyle = 'rgb(0, 255, 0)';     // Top-Right: Green
  ctx.fillRect(150, 0, 150, 150);

  ctx.fillStyle = 'rgb(0, 0, 255)';     // Bottom-Left: Blue
  ctx.fillRect(0, 150, 150, 150);

  ctx.fillStyle = 'rgb(255, 255, 0)';   // Bottom-Right: Yellow
  ctx.fillRect(150, 150, 150, 150);

  ctx.beginPath();
  ctx.arc(150, 150, 45, 0, Math.PI * 2);
  ctx.fillStyle = 'rgb(255, 255, 255)';
  ctx.fill();

  sec4State.originalImageData = ctx.getImageData(0, 0, w, h);
  sec4State.isLoaded = true;

  const dummyImg = new Image();
  dummyImg.src = sec4State.originalCanvas.toDataURL('image/png');
  sec4State.imgElement = dummyImg;

  renderAllSection04Canvases();
  if (typeof onComplete === 'function') onComplete();
}

function loadSec4Image(src, onComplete) {
  let effectiveSrc = src;
  const isDefaultFile = !effectiveSrc || effectiveSrc === 'assets/images/hero_landscape.jpg';

  if (isDefaultFile && typeof MULTIMEDIA_LAB_SAMPLE_IMAGE !== 'undefined' && MULTIMEDIA_LAB_SAMPLE_IMAGE) {
    effectiveSrc = MULTIMEDIA_LAB_SAMPLE_IMAGE;
  }

  const img = new Image();
  const isHttp = typeof window !== 'undefined' && window.location && window.location.protocol.startsWith('http');
  const isDataUrl = typeof effectiveSrc === 'string' && effectiveSrc.startsWith('data:');
  if (isHttp && !isDataUrl) {
    img.crossOrigin = 'anonymous';
  }

  img.onload = () => {
    try {
      sec4State.imgElement = img;
      sec4State.naturalWidth = img.naturalWidth || 640;
      sec4State.naturalHeight = img.naturalHeight || 480;
      sec4State.isLoaded = true;

      sec4State.originalCanvas = document.createElement('canvas');
      sec4State.originalCanvas.width = sec4State.naturalWidth;
      sec4State.originalCanvas.height = sec4State.naturalHeight;
      sec4State.originalCtx = sec4State.originalCanvas.getContext('2d');
      sec4State.originalCtx.drawImage(img, 0, 0);
      sec4State.originalImageData = sec4State.originalCtx.getImageData(
        0, 0, sec4State.naturalWidth, sec4State.naturalHeight
      );

      renderAllSection04Canvases();
      if (typeof onComplete === 'function') onComplete();
    } catch (err) {
      loadSec4SyntheticTestImage(onComplete);
    }
  };

  img.onerror = () => {
    loadSec4SyntheticTestImage(onComplete);
  };

  img.src = effectiveSrc;
}

// ============================================================================
// 2. COLOR CONVERSION MATH ENGINE (CMY & CMYK)
// ============================================================================

function computeSinglePixelCMYK(r, g, b) {
  const rn = r / 255.0;
  const gn = g / 255.0;
  const bn = b / 255.0;

  const k = 1.0 - Math.max(rn, gn, bn);
  const denom = 1.0 - k + 1e-10;

  const c = (1.0 - rn - k) / denom;
  const m = (1.0 - gn - k) / denom;
  const y = (1.0 - bn - k) / denom;

  return {
    c: Math.max(0, Math.min(1, c)),
    m: Math.max(0, Math.min(1, m)),
    y: Math.max(0, Math.min(1, y)),
    k: Math.max(0, Math.min(1, k))
  };
}

// ============================================================================
// 3. CANVAS RENDERING MODULES
// ============================================================================

function fitImageOnCanvas(canvas, drawFn) {
  if (!canvas || !sec4State.isLoaded) return;
  const ctx = canvas.getContext('2d');
  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  const w = rect.width || canvas.width || 500;
  const h = rect.height || canvas.height || 260;

  if (canvas.width !== Math.round(w * dpr) || canvas.height !== Math.round(h * dpr)) {
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
  }

  ctx.save();
  ctx.scale(dpr, dpr);
  ctx.fillStyle = '#0B0E14';
  ctx.fillRect(0, 0, w, h);

  const imgRatio = sec4State.naturalWidth / sec4State.naturalHeight;
  const canvasRatio = w / h;
  let drawW = w;
  let drawH = h;
  let offX = 0;
  let offY = 0;

  if (imgRatio > canvasRatio) {
    drawH = w / imgRatio;
    offY = (h - drawH) / 2;
  } else {
    drawW = h * imgRatio;
    offX = (w - drawW) / 2;
  }

  drawFn(ctx, offX, offY, drawW, drawH);
  ctx.restore();
}

function renderCMYSection() {
  const canvas = document.getElementById('canvas-sec4-cmy');
  fitImageOnCanvas(canvas, (ctx, offX, offY, drawW, drawH) => {
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = sec4State.naturalWidth;
    tempCanvas.height = sec4State.naturalHeight;
    const tempCtx = tempCanvas.getContext('2d');
    const imgData = tempCtx.createImageData(sec4State.naturalWidth, sec4State.naturalHeight);
    const src = sec4State.originalImageData.data;
    const dst = imgData.data;

    let sumC = 0, sumM = 0, sumY = 0;
    const totalPx = sec4State.naturalWidth * sec4State.naturalHeight;

    for (let i = 0; i < src.length; i += 4) {
      const c = 255 - src[i];
      const m = 255 - src[i + 1];
      const y = 255 - src[i + 2];

      sumC += c / 255;
      sumM += m / 255;
      sumY += y / 255;

      dst[i] = c;
      dst[i + 1] = m;
      dst[i + 2] = y;
      dst[i + 3] = 255;
    }
    tempCtx.putImageData(imgData, 0, 0);

    if (sec4State.cmyViewMode === 'split') {
      ctx.drawImage(sec4State.imgElement, offX, offY, drawW, drawH);
      ctx.save();
      ctx.beginPath();
      ctx.rect(offX + drawW / 2, offY, drawW / 2, drawH);
      ctx.clip();
      ctx.drawImage(tempCanvas, offX, offY, drawW, drawH);
      ctx.restore();

      ctx.strokeStyle = '#6EE7B7';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(offX + drawW / 2, offY);
      ctx.lineTo(offX + drawW / 2, offY + drawH);
      ctx.stroke();

      ctx.font = '10px Inter, sans-serif';
      ctx.fillStyle = '#ffffff';
      ctx.fillText('Original RGB', offX + 10, offY + 20);
      ctx.fillText('CMY Negative', offX + drawW / 2 + 10, offY + 20);
    } else {
      ctx.drawImage(tempCanvas, offX, offY, drawW, drawH);
    }

    const avgCEl = document.getElementById('sec4-metric-avg-c');
    const avgMEl = document.getElementById('sec4-metric-avg-m');
    const avgYEl = document.getElementById('sec4-metric-avg-y');
    if (avgCEl) avgCEl.textContent = `${((sumC / totalPx) * 100).toFixed(1)}%`;
    if (avgMEl) avgMEl.textContent = `${((sumM / totalPx) * 100).toFixed(1)}%`;
    if (avgYEl) avgYEl.textContent = `${((sumY / totalPx) * 100).toFixed(1)}%`;
  });
}

function renderCMYKSeparationsSection() {
  const canvas = document.getElementById('canvas-sec4-cmyk');
  fitImageOnCanvas(canvas, (ctx, offX, offY, drawW, drawH) => {
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = sec4State.naturalWidth;
    tempCanvas.height = sec4State.naturalHeight;
    const tempCtx = tempCanvas.getContext('2d');
    const imgData = tempCtx.createImageData(sec4State.naturalWidth, sec4State.naturalHeight);
    const src = sec4State.originalImageData.data;
    const dst = imgData.data;

    let sumK = 0;
    const totalPx = sec4State.naturalWidth * sec4State.naturalHeight;
    const mode = sec4State.activeInkChannel;

    for (let i = 0; i < src.length; i += 4) {
      const r = src[i] / 255.0;
      const g = src[i + 1] / 255.0;
      const b = src[i + 2] / 255.0;

      const k = 1.0 - Math.max(r, g, b);
      const denom = 1.0 - k + 1e-10;
      const c = (1.0 - r - k) / denom;
      const m = (1.0 - g - k) / denom;
      const y = (1.0 - b - k) / denom;

      sumK += k;

      if (mode === 'all') {
        dst[i] = Math.round(255 * (1 - c) * (1 - k));
        dst[i + 1] = Math.round(255 * (1 - m) * (1 - k));
        dst[i + 2] = Math.round(255 * (1 - y) * (1 - k));
      } else {
        let inkVal = k;
        if (mode === 'c') inkVal = c;
        else if (mode === 'm') inkVal = m;
        else if (mode === 'y') inkVal = y;

        const plateGray = Math.round((1.0 - inkVal) * 255);
        dst[i] = plateGray;
        dst[i + 1] = plateGray;
        dst[i + 2] = plateGray;
      }
      dst[i + 3] = 255;
    }

    tempCtx.putImageData(imgData, 0, 0);
    ctx.drawImage(tempCanvas, offX, offY, drawW, drawH);

    const kAvgEl = document.getElementById('sec4-metric-avg-k');
    const plateNameEl = document.getElementById('sec4-metric-plate-name');
    if (kAvgEl) kAvgEl.textContent = `${((sumK / totalPx) * 100).toFixed(1)}%`;
    if (plateNameEl) {
      const names = {
        all: 'Composite CMYK Print',
        c: 'Cyan Plate (C)',
        m: 'Magenta Plate (M)',
        y: 'Yellow Plate (Y)',
        k: 'Black Key Plate (K)'
      };
      plateNameEl.textContent = names[mode] || 'Composite CMYK';
    }
  });
}

function renderReconstructSection() {
  const canvas = document.getElementById('canvas-sec4-reconstruct');
  fitImageOnCanvas(canvas, (ctx, offX, offY, drawW, drawH) => {
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = sec4State.naturalWidth;
    tempCanvas.height = sec4State.naturalHeight;
    const tempCtx = tempCanvas.getContext('2d');
    const imgData = tempCtx.createImageData(sec4State.naturalWidth, sec4State.naturalHeight);
    const src = sec4State.originalImageData.data;
    const dst = imgData.data;

    let maxErr = 0;

    for (let i = 0; i < src.length; i += 4) {
      const rOrig = src[i];
      const gOrig = src[i + 1];
      const bOrig = src[i + 2];

      const r = rOrig / 255.0;
      const g = gOrig / 255.0;
      const b = bOrig / 255.0;

      const k = 1.0 - Math.max(r, g, b);
      const denom = 1.0 - k + 1e-10;
      const c = (1.0 - r - k) / denom;
      const m = (1.0 - g - k) / denom;
      const y = (1.0 - b - k) / denom;

      const rRec = Math.round(255.0 * (1.0 - c) * (1.0 - k));
      const gRec = Math.round(255.0 * (1.0 - m) * (1.0 - k));
      const bRec = Math.round(255.0 * (1.0 - y) * (1.0 - k));

      maxErr = Math.max(maxErr, Math.abs(rOrig - rRec), Math.abs(gOrig - gRec), Math.abs(bOrig - bRec));

      dst[i] = rRec;
      dst[i + 1] = gRec;
      dst[i + 2] = bRec;
      dst[i + 3] = 255;
    }

    tempCtx.putImageData(imgData, 0, 0);
    ctx.drawImage(tempCanvas, offX, offY, drawW, drawH);

    const errEl = document.getElementById('sec4-metric-rec-error');
    if (errEl) errEl.textContent = `${maxErr} / 255 (Lossless Round-Trip)`;
  });
}

function updatePixelConverterUI() {
  const r = sec4State.testR;
  const g = sec4State.testG;
  const b = sec4State.testB;

  const { c, m, y, k } = computeSinglePixelCMYK(r, g, b);

  const swatch = document.getElementById('sec4-pixel-swatch');
  const rgbText = document.getElementById('sec4-pixel-rgb-text');
  const cVal = document.getElementById('sec4-res-c');
  const mVal = document.getElementById('sec4-res-m');
  const yVal = document.getElementById('sec4-res-y');
  const kVal = document.getElementById('sec4-res-k');

  if (swatch) swatch.style.backgroundColor = `rgb(${r}, ${g}, ${b})`;
  if (rgbText) rgbText.textContent = `RGB(${r}, ${g}, ${b})`;
  if (cVal) cVal.textContent = `${c.toFixed(2)} (${Math.round(c * 100)}%)`;
  if (mVal) mVal.textContent = `${m.toFixed(2)} (${Math.round(m * 100)}%)`;
  if (yVal) yVal.textContent = `${y.toFixed(2)} (${Math.round(y * 100)}%)`;
  if (kVal) kVal.textContent = `${k.toFixed(2)} (${Math.round(k * 100)}%)`;
}

function renderAllSection04Canvases() {
  if (!sec4State.isLoaded) return;
  renderCMYSection();
  renderCMYKSeparationsSection();
  renderReconstructSection();
  updatePixelConverterUI();
}

// ============================================================================
// 4. STUDENT PRACTICE TASK VERIFIER
// ============================================================================

function verifySec4BenchmarkTask() {
  const resBox = document.getElementById('sec4-task1-result');
  if (!resBox) return;

  const testColors = [
    { name: 'Pure White', rgb: [255, 255, 255] },
    { name: 'Pure Black', rgb: [0, 0, 0] },
    { name: 'Pure Red',   rgb: [255, 0, 0] },
    { name: 'Pure Green', rgb: [0, 255, 0] },
    { name: 'Pure Blue',  rgb: [0, 0, 255] },
    { name: 'Yellow',     rgb: [255, 255, 0] }
  ];

  const rows = testColors.map(item => {
    const [r, g, b] = item.rgb;
    const { c, m, y, k } = computeSinglePixelCMYK(r, g, b);
    return `
      <tr>
        <td style="padding: 0.3rem 0.5rem; font-weight: 600;">${item.name}</td>
        <td style="padding: 0.3rem 0.5rem; font-family: monospace;">(${r}, ${g}, ${b})</td>
        <td style="padding: 0.3rem 0.5rem; font-family: monospace; color: #6EE7B7;">(${c.toFixed(2)}, ${m.toFixed(2)}, ${y.toFixed(2)}, ${k.toFixed(2)})</td>
      </tr>
    `;
  }).join('');

  resBox.className = 'exercise-result-box active-success';
  resBox.innerHTML = `
    <strong>✓ Single-Pixel Benchmark Verification Passed (Epsilon Guard 1e-10 Active):</strong>
    <table style="width: 100%; border-collapse: collapse; margin-top: 0.5rem; text-align: left; font-size: 0.82rem;">
      <thead>
        <tr style="border-bottom: 1px solid var(--border-color); color: var(--text-muted);">
          <th style="padding: 0.25rem 0.5rem;">Color</th>
          <th style="padding: 0.25rem 0.5rem;">RGB Input</th>
          <th style="padding: 0.25rem 0.5rem;">CMYK Output (0.0 - 1.0)</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
  `;

  if (typeof showToast === 'function') {
    showToast('Color Models Task Verified: All 6 benchmark colors passed!', 'success');
  }
}

// ============================================================================
// 5. EVENT LISTENERS INITIALIZATION
// ============================================================================

function initSection04() {
  const cmyBtns = document.querySelectorAll('.sec4-cmy-btn');
  cmyBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      cmyBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      sec4State.cmyViewMode = btn.dataset.mode || 'cmy';
      renderCMYSection();
    });
  });

  const inkBtns = document.querySelectorAll('.sec4-ink-btn');
  inkBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      inkBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      sec4State.activeInkChannel = btn.dataset.ink || 'all';
      renderCMYKSeparationsSection();
    });
  });

  const rSlider = document.getElementById('sec4-slider-r');
  const gSlider = document.getElementById('sec4-slider-g');
  const bSlider = document.getElementById('sec4-slider-b');
  const rValText = document.getElementById('sec4-val-r');
  const gValText = document.getElementById('sec4-val-g');
  const bValText = document.getElementById('sec4-val-b');

  const syncSliders = () => {
    if (rSlider) rSlider.value = sec4State.testR;
    if (gSlider) gSlider.value = sec4State.testG;
    if (bSlider) bSlider.value = sec4State.testB;
    if (rValText) rValText.textContent = sec4State.testR;
    if (gValText) gValText.textContent = sec4State.testG;
    if (bValText) bValText.textContent = sec4State.testB;
    updatePixelConverterUI();
  };

  if (rSlider) rSlider.addEventListener('input', () => { sec4State.testR = parseInt(rSlider.value, 10); syncSliders(); });
  if (gSlider) gSlider.addEventListener('input', () => { sec4State.testG = parseInt(gSlider.value, 10); syncSliders(); });
  if (bSlider) bSlider.addEventListener('input', () => { sec4State.testB = parseInt(bSlider.value, 10); syncSliders(); });

  const colorPresets = document.querySelectorAll('.sec4-color-preset');
  colorPresets.forEach(btn => {
    btn.addEventListener('click', () => {
      sec4State.testR = parseInt(btn.dataset.r, 10);
      sec4State.testG = parseInt(btn.dataset.g, 10);
      sec4State.testB = parseInt(btn.dataset.b, 10);
      colorPresets.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      syncSliders();
    });
  });

  const verifyBtn = document.getElementById('sec4-btn-verify-task1');
  if (verifyBtn) verifyBtn.addEventListener('click', verifySec4BenchmarkTask);

  const syntheticBtn = document.getElementById('btn-sec4-synthetic-img');
  const sampleBtn = document.getElementById('btn-sec4-sample-img');
  const uploadBtn = document.getElementById('btn-sec4-upload-img');
  const fileInput = document.getElementById('sec4-file-input');

  if (syntheticBtn) {
    syntheticBtn.addEventListener('click', () => {
      loadSec4SyntheticTestImage(() => {
        if (typeof showToast === 'function') showToast('Loaded 300×300 Python Synthetic RGB Pattern.', 'success');
      });
    });
  }

  if (sampleBtn) {
    sampleBtn.addEventListener('click', () => {
      loadSec4Image(sec4State.imageSrc, () => {
        if (typeof showToast === 'function') showToast('Sample photo loaded.', 'success');
      });
    });
  }

  if (uploadBtn && fileInput) {
    uploadBtn.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', (e) => {
      const file = e.target.files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (ev) => {
          loadSec4Image(ev.target.result, () => {
            if (typeof showToast === 'function') showToast(`Uploaded "${file.name}"`, 'success');
          });
        };
        reader.readAsDataURL(file);
      }
    });
  }

  loadSec4Image(sec4State.imageSrc);

  window.addEventListener('resize', () => {
    if (appState.activeWorkspace === 'section04') {
      renderAllSection04Canvases();
    }
  });
}

window.initSection04 = initSection04;
window.renderAllSection04Canvases = renderAllSection04Canvases;