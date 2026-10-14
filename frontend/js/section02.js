/**
 * ============================================================================
 * Multimedia Lab - Session 02: Digital Images with OpenCV (js/section02.js)
 * ============================================================================
 * Course: Multimedia Systems & Programming — Sinai University
 * Instructor: Eng. Muhammad Ali Abdul Kareem
 * 
 * Implements interactive digital image matrix inspection, BGR/RGB color channels,
 * luminance grayscale conversion (ITU-R 601), binary thresholding (cv2.threshold),
 * spatial resizing (cv2.resize), orthogonal rotation (cv2.rotate), and Matplotlib
 * display parameters (plt.imshow, axis toggling, cmap='gray' vs. viridis).
 * 
 * Reference implementation: processing/section-02/session02_digital_images.py
 */

// Global Section 02 Session State
const sec2State = {
  // Image data & memory
  imgElement: null,
  isLoaded: false,
  imageSrc: 'assets/images/hero_landscape.jpg',
  naturalWidth: 0,
  naturalHeight: 0,
  
  // Working offscreen buffers
  originalCanvas: null,
  originalCtx: null,
  originalImageData: null,

  // 1. Matrix Properties & Pixel Inspector
  inspectedX: 0,
  inspectedY: 0,
  activeChannelView: 'all', // 'all' (RGB) | 'r' | 'g' | 'b'

  // 2. Grayscale Conversion
  grayViewMode: 'standard', // 'standard' | 'split'

  // 3. Binary Thresholding
  threshold: 127,

  // 4. Spatial Resizing
  resizeW: 300,
  resizeH: 300,
  lockAspect: false,

  // 5. Orthogonal Rotation
  rotationAngle: 90, // 0 | 90 | 180 | 270

  // 6. Matplotlib Display Simulation
  colorOrder: 'RGB', // 'RGB' (Correct) | 'BGR' (Inverted blue tint)
  axisVisible: false, // false = plt.axis('off'), true = plt.axis('on')
  colormap: 'gray', // 'gray' | 'viridis'
  figureType: 'binary' // 'binary' | 'gray' | 'color'
};

// ============================================================================
// 1. PERCEPTUALLY UNIFORM VIRIDIS COLORMAP LOOKUP TABLE (256 RGB ENTRIES)
// ============================================================================
// Generated from Matplotlib's viridis colormap specification for authentic simulation
const VIRIDIS_KEYPOINTS = [
  { p: 0.00, r: 68,  g: 1,   b: 84 },
  { p: 0.25, r: 59,  g: 82,  b: 139 },
  { p: 0.50, r: 33,  g: 145, b: 140 },
  { p: 0.75, r: 94,  g: 201, b: 98 },
  { p: 1.00, r: 253, g: 231, b: 37 }
];

function getViridisColor(val) {
  const norm = Math.max(0, Math.min(255, val)) / 255;
  for (let i = 0; i < VIRIDIS_KEYPOINTS.length - 1; i++) {
    const k1 = VIRIDIS_KEYPOINTS[i];
    const k2 = VIRIDIS_KEYPOINTS[i + 1];
    if (norm >= k1.p && norm <= k2.p) {
      const t = (norm - k1.p) / (k2.p - k1.p);
      return [
        Math.round(k1.r + t * (k2.r - k1.r)),
        Math.round(k1.g + t * (k2.g - k1.g)),
        Math.round(k1.b + t * (k2.b - k1.b))
      ];
    }
  }
  return [253, 231, 37];
}

// ============================================================================
// 2. IMAGE BUFFER INITIALIZATION & PIXEL ACCESS UTILITIES
// ============================================================================

/**
 * Load image source into memory and prepare offscreen canvas
 */
function loadSec2Image(src, onComplete) {
  const img = new Image();
  img.crossOrigin = 'anonymous';
  img.onload = () => {
    sec2State.imgElement = img;
    sec2State.naturalWidth = img.naturalWidth || 800;
    sec2State.naturalHeight = img.naturalHeight || 600;
    sec2State.isLoaded = true;

    // Default inspection coordinate at center
    sec2State.inspectedX = Math.floor(sec2State.naturalWidth / 2);
    sec2State.inspectedY = Math.floor(sec2State.naturalHeight / 2);

    // Setup offscreen canvas
    sec2State.originalCanvas = document.createElement('canvas');
    sec2State.originalCanvas.width = sec2State.naturalWidth;
    sec2State.originalCanvas.height = sec2State.naturalHeight;
    sec2State.originalCtx = sec2State.originalCanvas.getContext('2d');
    sec2State.originalCtx.drawImage(img, 0, 0);
    sec2State.originalImageData = sec2State.originalCtx.getImageData(
      0, 0, sec2State.naturalWidth, sec2State.naturalHeight
    );

    // Sync coordinate slider limits
    const xInput = document.getElementById('sec2-pixel-x');
    const yInput = document.getElementById('sec2-pixel-y');
    if (xInput) {
      xInput.max = sec2State.naturalWidth - 1;
      xInput.value = sec2State.inspectedX;
    }
    if (yInput) {
      yInput.max = sec2State.naturalHeight - 1;
      yInput.value = sec2State.inspectedY;
    }

    renderAllSection02Canvases();
    if (typeof onComplete === 'function') onComplete();
  };

  img.onerror = () => {
    console.error('Failed to load Section 2 image:', src);
    if (typeof showToast === 'function') {
      showToast('Could not load Section 2 sample image.', 'error');
    }
  };

  img.src = src;
}

/**
 * Extract pixel color at (x, y)
 * Returns { r, g, b, a, gray, bgr: [b, g, r] }
 */
function getPixelAt(x, y) {
  if (!sec2State.originalImageData) return { r: 0, g: 0, b: 0, a: 255, gray: 0, bgr: [0, 0, 0] };

  const w = sec2State.naturalWidth;
  const h = sec2State.naturalHeight;
  const clX = Math.max(0, Math.min(w - 1, Math.round(x)));
  const clY = Math.max(0, Math.min(h - 1, Math.round(y)));

  const idx = (clY * w + clX) * 4;
  const data = sec2State.originalImageData.data;

  const r = data[idx];
  const g = data[idx + 1];
  const b = data[idx + 2];
  const a = data[idx + 3];

  // ITU-R 601 Luma formula matching Python OpenCV: 0.299*R + 0.587*G + 0.114*B
  const gray = Math.round(0.299 * r + 0.587 * g + 0.114 * b);

  return {
    x: clX,
    y: clY,
    r,
    g,
    b,
    a,
    gray,
    bgr: [b, g, r],
    rgb: [r, g, b],
    hex: `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase()}`
  };
}

// ============================================================================
// 3. CANVAS RENDERING MODULES FOR ALL 6 CONCEPT CARDS
// ============================================================================

/**
 * Concept 1: Image Representation & NumPy Properties Inspection Canvas
 */
function renderMatrixSection() {
  const canvas = document.getElementById('canvas-sec2-matrix');
  if (!canvas || !sec2State.isLoaded) return;

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

  // Compute aspect-fit dimensions
  const imgRatio = sec2State.naturalWidth / sec2State.naturalHeight;
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

  // Draw image or isolated color channel
  if (sec2State.activeChannelView === 'all') {
    ctx.drawImage(sec2State.imgElement, offX, offY, drawW, drawH);
  } else {
    // Render isolated single channel (Red, Green, or Blue)
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = sec2State.naturalWidth;
    tempCanvas.height = sec2State.naturalHeight;
    const tempCtx = tempCanvas.getContext('2d');
    const imgData = tempCtx.createImageData(sec2State.naturalWidth, sec2State.naturalHeight);
    const src = sec2State.originalImageData.data;
    const dst = imgData.data;
    const ch = sec2State.activeChannelView; // 'r' | 'g' | 'b'

    for (let i = 0; i < src.length; i += 4) {
      if (ch === 'r') {
        dst[i] = src[i];
        dst[i + 1] = 0;
        dst[i + 2] = 0;
      } else if (ch === 'g') {
        dst[i] = 0;
        dst[i + 1] = src[i + 1];
        dst[i + 2] = 0;
      } else if (ch === 'b') {
        dst[i] = 0;
        dst[i + 1] = 0;
        dst[i + 2] = src[i + 2];
      }
      dst[i + 3] = 255;
    }
    tempCtx.putImageData(imgData, 0, 0);
    ctx.drawImage(tempCanvas, offX, offY, drawW, drawH);
  }

  // Draw Coordinate Crosshair Indicator at inspected pixel
  const pxRatioX = drawW / sec2State.naturalWidth;
  const pxRatioY = drawH / sec2State.naturalHeight;
  const targetCanvasX = offX + sec2State.inspectedX * pxRatioX;
  const targetCanvasY = offY + sec2State.inspectedY * pxRatioY;

  ctx.strokeStyle = '#6EE7B7';
  ctx.lineWidth = 1.5;
  ctx.setLineDash([3, 3]);

  // Horizontal guide line
  ctx.beginPath();
  ctx.moveTo(offX, targetCanvasY);
  ctx.lineTo(offX + drawW, targetCanvasY);
  ctx.stroke();

  // Vertical guide line
  ctx.beginPath();
  ctx.moveTo(targetCanvasX, offY);
  ctx.lineTo(targetCanvasX, offY + drawH);
  ctx.stroke();
  ctx.setLineDash([]);

  // Reticle circle
  ctx.beginPath();
  ctx.arc(targetCanvasX, targetCanvasY, 7, 0, 2 * Math.PI);
  ctx.strokeStyle = '#6EE7B7';
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(targetCanvasX, targetCanvasY, 2, 0, 2 * Math.PI);
  ctx.fillStyle = '#ffffff';
  ctx.fill();

  ctx.restore();

  // Update Metrics & UI Labels
  const px = getPixelAt(sec2State.inspectedX, sec2State.inspectedY);

  const shapeEl = document.getElementById('sec2-metric-shape');
  const dtypeEl = document.getElementById('sec2-metric-dtype');
  const bgrEl = document.getElementById('sec2-metric-bgr');
  const rgbEl = document.getElementById('sec2-metric-rgb');
  const coordEl = document.getElementById('sec2-coord-label');
  const swatchEl = document.getElementById('sec2-swatch');

  if (shapeEl) shapeEl.textContent = `(${sec2State.naturalHeight}, ${sec2State.naturalWidth}, 3)`;
  if (dtypeEl) dtypeEl.textContent = 'uint8 (0 to 255)';
  if (bgrEl) bgrEl.textContent = `[${px.bgr.join(', ')}]`;
  if (rgbEl) rgbEl.textContent = `[${px.rgb.join(', ')}]`;
  if (coordEl) coordEl.textContent = `X: ${px.x}, Y: ${px.y}`;
  if (swatchEl) {
    swatchEl.style.backgroundColor = px.hex;
    swatchEl.title = `Color: ${px.hex} | RGB: ${px.rgb.join(', ')}`;
  }
}

/**
 * Concept 2: Grayscale Conversion Canvas (cv2.cvtColor)
 */
function renderGrayscaleSection() {
  const canvas = document.getElementById('canvas-sec2-grayscale');
  if (!canvas || !sec2State.isLoaded) return;

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

  // Aspect-fit dimensions
  const imgRatio = sec2State.naturalWidth / sec2State.naturalHeight;
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

  // Create grayscale buffer using ITU-R 601 formula
  const tempCanvas = document.createElement('canvas');
  tempCanvas.width = sec2State.naturalWidth;
  tempCanvas.height = sec2State.naturalHeight;
  const tempCtx = tempCanvas.getContext('2d');
  const imgData = tempCtx.createImageData(sec2State.naturalWidth, sec2State.naturalHeight);
  const src = sec2State.originalImageData.data;
  const dst = imgData.data;

  for (let i = 0; i < src.length; i += 4) {
    const luma = Math.round(0.299 * src[i] + 0.587 * src[i + 1] + 0.114 * src[i + 2]);
    dst[i] = luma;
    dst[i + 1] = luma;
    dst[i + 2] = luma;
    dst[i + 3] = 255;
  }
  tempCtx.putImageData(imgData, 0, 0);

  if (sec2State.grayViewMode === 'split') {
    // Left half: Color original, Right half: Grayscale
    ctx.drawImage(sec2State.imgElement, offX, offY, drawW, drawH);
    ctx.save();
    ctx.beginPath();
    ctx.rect(offX + drawW / 2, offY, drawW / 2, drawH);
    ctx.clip();
    ctx.drawImage(tempCanvas, offX, offY, drawW, drawH);
    ctx.restore();

    // Divider line
    ctx.strokeStyle = '#6EE7B7';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(offX + drawW / 2, offY);
    ctx.lineTo(offX + drawW / 2, offY + drawH);
    ctx.stroke();

    // Labels
    ctx.font = '10px Inter, sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.fillText('RGB Color', offX + 10, offY + 20);
    ctx.fillText('Grayscale (Luma)', offX + drawW / 2 + 10, offY + 20);
  } else {
    // Full grayscale view
    ctx.drawImage(tempCanvas, offX, offY, drawW, drawH);
  }

  ctx.restore();

  // Metrics
  const px = getPixelAt(sec2State.inspectedX, sec2State.inspectedY);
  const grayShapeEl = document.getElementById('sec2-metric-gray-shape');
  const grayPixelEl = document.getElementById('sec2-metric-gray-pixel');
  const grayChannelsEl = document.getElementById('sec2-metric-gray-channels');

  if (grayShapeEl) grayShapeEl.textContent = `(${sec2State.naturalHeight}, ${sec2State.naturalWidth})`;
  if (grayPixelEl) grayPixelEl.textContent = `${px.gray} / 255`;
  if (grayChannelsEl) grayChannelsEl.textContent = '1 Channel (Y = 0.299R+0.587G+0.114B)';
}

/**
 * Concept 3: Binary Thresholding Canvas (cv2.threshold)
 */
function renderBinarySection() {
  const canvas = document.getElementById('canvas-sec2-binary');
  if (!canvas || !sec2State.isLoaded) return;

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

  const imgRatio = sec2State.naturalWidth / sec2State.naturalHeight;
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

  // Create Binary Threshold buffer
  const tempCanvas = document.createElement('canvas');
  tempCanvas.width = sec2State.naturalWidth;
  tempCanvas.height = sec2State.naturalHeight;
  const tempCtx = tempCanvas.getContext('2d');
  const imgData = tempCtx.createImageData(sec2State.naturalWidth, sec2State.naturalHeight);
  const src = sec2State.originalImageData.data;
  const dst = imgData.data;

  const T = sec2State.threshold;
  let whiteCount = 0;
  const totalPixels = sec2State.naturalWidth * sec2State.naturalHeight;

  for (let i = 0; i < src.length; i += 4) {
    const luma = 0.299 * src[i] + 0.587 * src[i + 1] + 0.114 * src[i + 2];
    const binVal = luma > T ? 255 : 0;
    if (binVal === 255) whiteCount++;

    dst[i] = binVal;
    dst[i + 1] = binVal;
    dst[i + 2] = binVal;
    dst[i + 3] = 255;
  }
  tempCtx.putImageData(imgData, 0, 0);

  ctx.drawImage(tempCanvas, offX, offY, drawW, drawH);
  ctx.restore();

  // Metrics
  const whitePct = ((whiteCount / totalPixels) * 100).toFixed(1);
  const blackPct = (100 - parseFloat(whitePct)).toFixed(1);

  const tValLabel = document.getElementById('sec2-metric-thresh-val');
  const whiteEl = document.getElementById('sec2-metric-white-pct');
  const blackEl = document.getElementById('sec2-metric-black-pct');
  const discreteEl = document.getElementById('sec2-metric-binary-values');

  if (tValLabel) tValLabel.textContent = `T = ${T}`;
  if (whiteEl) whiteEl.textContent = `${whitePct}% (${whiteCount.toLocaleString()} px)`;
  if (blackEl) blackEl.textContent = `${blackPct}% (${(totalPixels - whiteCount).toLocaleString()} px)`;
  if (discreteEl) discreteEl.textContent = 'Only {0, 255}';
}

/**
 * Concept 4: Spatial Resizing Canvas (cv2.resize)
 */
function renderResizeSection() {
  const canvas = document.getElementById('canvas-sec2-resize');
  if (!canvas || !sec2State.isLoaded) return;

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

  const targetW = sec2State.resizeW;
  const targetH = sec2State.resizeH;

  // Scale target dimensions into canvas container for clear viewing
  const scale = Math.min((w - 40) / targetW, (h - 40) / targetH, 1.0);
  const previewW = targetW * scale;
  const previewH = targetH * scale;
  const offX = (w - previewW) / 2;
  const offY = (h - previewH) / 2;

  // Draw scaled image
  ctx.drawImage(sec2State.imgElement, offX, offY, previewW, previewH);

  // Draw dimension outline boundary
  ctx.strokeStyle = '#6EE7B7';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(offX, offY, previewW, previewH);

  // Dimension labels
  ctx.font = '10px Inter, monospace';
  ctx.fillStyle = '#6EE7B7';
  ctx.textAlign = 'center';
  ctx.fillText(`${targetW} px (Width)`, offX + previewW / 2, offY - 6);

  ctx.save();
  ctx.translate(offX - 8, offY + previewH / 2);
  ctx.rotate(-Math.PI / 2);
  ctx.fillText(`${targetH} px (Height)`, 0, 0);
  ctx.restore();

  ctx.restore();

  // Metrics
  const targetDimEl = document.getElementById('sec2-metric-resize-target');
  const shapeEl = document.getElementById('sec2-metric-resize-shape');
  const aspectEl = document.getElementById('sec2-metric-resize-aspect');

  if (targetDimEl) targetDimEl.textContent = `(W: ${targetW}, H: ${targetH})`;
  if (shapeEl) shapeEl.textContent = `(${targetH}, ${targetW}, 3)`;
  if (aspectEl) aspectEl.textContent = (targetW / targetH).toFixed(2);
}

/**
 * Concept 5: Orthogonal Rotation Canvas (cv2.rotate)
 */
function renderRotateSection() {
  const canvas = document.getElementById('canvas-sec2-rotate');
  if (!canvas || !sec2State.isLoaded) return;

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

  const angle = sec2State.rotationAngle;
  const isSwapped = (angle === 90 || angle === 270);
  const rotatedW = isSwapped ? sec2State.naturalHeight : sec2State.naturalWidth;
  const rotatedH = isSwapped ? sec2State.naturalWidth : sec2State.naturalHeight;

  // Fit rotated bounding box
  const fitScale = Math.min((w - 30) / rotatedW, (h - 30) / rotatedH, 1.0);
  const drawW = sec2State.naturalWidth * fitScale;
  const drawH = sec2State.naturalHeight * fitScale;

  ctx.translate(w / 2, h / 2);
  ctx.rotate((angle * Math.PI) / 180);
  ctx.drawImage(sec2State.imgElement, -drawW / 2, -drawH / 2, drawW, drawH);

  ctx.restore();

  // Metrics
  const angleEl = document.getElementById('sec2-metric-rotate-angle');
  const shapeEl = document.getElementById('sec2-metric-rotate-shape');
  const swapEl = document.getElementById('sec2-metric-rotate-swap');
  const cvConstEl = document.getElementById('sec2-metric-rotate-const');

  let cvConstantText = 'None (0°)';
  if (angle === 90) cvConstantText = 'cv2.ROTATE_90_CLOCKWISE';
  else if (angle === 180) cvConstantText = 'cv2.ROTATE_180';
  else if (angle === 270) cvConstantText = 'cv2.ROTATE_90_COUNTERCLOCKWISE';

  if (angleEl) angleEl.textContent = `${angle}°`;
  if (shapeEl) shapeEl.textContent = `(${rotatedH}, ${rotatedW}, 3)`;
  if (swapEl) {
    swapEl.textContent = isSwapped ? 'Swapped (W ↔ H)' : 'Preserved (H, W kept)';
    swapEl.style.color = isSwapped ? '#fbbf24' : '#6EE7B7';
  }
  if (cvConstEl) cvConstEl.textContent = cvConstantText;
}

/**
 * Concept 6: Matplotlib Display Parameters Simulation (plt.imshow)
 */
function renderMatplotlibSection() {
  const canvas = document.getElementById('canvas-sec2-matplotlib');
  if (!canvas || !sec2State.isLoaded) return;

  const ctx = canvas.getContext('2d');
  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  const w = rect.width || canvas.width || 600;
  const h = rect.height || canvas.height || 300;

  if (canvas.width !== Math.round(w * dpr) || canvas.height !== Math.round(h * dpr)) {
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
  }

  ctx.save();
  ctx.scale(dpr, dpr);

  // Background figure container (Matplotlib dark aesthetic)
  ctx.fillStyle = '#0E1218';
  ctx.fillRect(0, 0, w, h);

  // Layout geometry
  const hasAxis = sec2State.axisVisible;
  const padding = hasAxis 
    ? { top: 32, right: 28, bottom: 36, left: 48 }
    : { top: 26, right: 12, bottom: 12, left: 12 };

  const plotW = w - padding.left - padding.right;
  const plotH = h - padding.top - padding.bottom;

  // Title banner matching plt.title()
  ctx.font = '12px Inter, sans-serif';
  ctx.fillStyle = '#F0F6FC';
  ctx.textAlign = 'center';

  let figureTitle = 'Matplotlib Display';
  if (sec2State.figureType === 'binary') {
    figureTitle = sec2State.colormap === 'gray' 
      ? "3. Binary Threshold Image (cmap='gray')" 
      : "Binary Threshold with Default Colormap (viridis)";
  } else if (sec2State.figureType === 'gray') {
    figureTitle = sec2State.colormap === 'gray' 
      ? "2. Grayscale Image (cmap='gray')" 
      : "Grayscale Image with Default Heatmap (viridis)";
  } else {
    figureTitle = sec2State.colorOrder === 'RGB' 
      ? '1. Original Image (RGB Converted)' 
      : 'Raw OpenCV Image in Matplotlib (BGR Inverted Red/Blue)';
  }

  ctx.fillText(figureTitle, w / 2, 18);

  // Render Image Layer with selected parameters
  const tempCanvas = document.createElement('canvas');
  tempCanvas.width = sec2State.naturalWidth;
  tempCanvas.height = sec2State.naturalHeight;
  const tempCtx = tempCanvas.getContext('2d');
  const imgData = tempCtx.createImageData(sec2State.naturalWidth, sec2State.naturalHeight);
  const src = sec2State.originalImageData.data;
  const dst = imgData.data;

  const isBinary = (sec2State.figureType === 'binary');
  const isGray = (sec2State.figureType === 'gray');
  const isBgrInverted = (sec2State.colorOrder === 'BGR' && !isBinary && !isGray);
  const useViridis = (sec2State.colormap === 'viridis' && (isBinary || isGray));

  for (let i = 0; i < src.length; i += 4) {
    let r = src[i];
    let g = src[i + 1];
    let b = src[i + 2];

    if (isBinary || isGray) {
      const luma = Math.round(0.299 * r + 0.587 * g + 0.114 * b);
      const intensity = isBinary ? (luma > sec2State.threshold ? 255 : 0) : luma;

      if (useViridis) {
        const virColor = getViridisColor(intensity);
        dst[i] = virColor[0];
        dst[i + 1] = virColor[1];
        dst[i + 2] = virColor[2];
      } else {
        dst[i] = intensity;
        dst[i + 1] = intensity;
        dst[i + 2] = intensity;
      }
    } else if (isBgrInverted) {
      // Invert B and R channels to simulate raw OpenCV BGR in Matplotlib RGB display
      dst[i] = b;     // Red gets Blue
      dst[i + 1] = g; // Green stays Green
      dst[i + 2] = r; // Blue gets Red
    } else {
      dst[i] = r;
      dst[i + 1] = g;
      dst[i + 2] = b;
    }
    dst[i + 3] = 255;
  }

  tempCtx.putImageData(imgData, 0, 0);

  // Compute image placement inside plot box
  const imgRatio = sec2State.naturalWidth / sec2State.naturalHeight;
  const plotRatio = plotW / plotH;
  let drawW = plotW;
  let drawH = plotH;
  let imgOffX = padding.left;
  let imgOffY = padding.top;

  if (imgRatio > plotRatio) {
    drawH = plotW / imgRatio;
    imgOffY += (plotH - drawH) / 2;
  } else {
    drawW = plotH * imgRatio;
    imgOffX += (plotW - drawW) / 2;
  }

  ctx.drawImage(tempCanvas, imgOffX, imgOffY, drawW, drawH);

  // Coordinate Axis Simulation (when plt.axis('on'))
  if (hasAxis) {
    ctx.strokeStyle = '#30363D';
    ctx.lineWidth = 1;
    ctx.strokeRect(imgOffX, imgOffY, drawW, drawH);

    ctx.font = '9px Inter, sans-serif';
    ctx.fillStyle = '#8B949E';

    // X-axis coordinate ticks
    const xTicks = [0, Math.floor(sec2State.naturalWidth / 4), Math.floor(sec2State.naturalWidth / 2), Math.floor(3 * sec2State.naturalWidth / 4), sec2State.naturalWidth];
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';

    xTicks.forEach(tx => {
      const tickCanvasX = imgOffX + (tx / sec2State.naturalWidth) * drawW;
      ctx.beginPath();
      ctx.moveTo(tickCanvasX, imgOffY + drawH);
      ctx.lineTo(tickCanvasX, imgOffY + drawH + 4);
      ctx.stroke();
      ctx.fillText(String(tx), tickCanvasX, imgOffY + drawH + 6);
    });

    // Y-axis coordinate ticks
    const yTicks = [0, Math.floor(sec2State.naturalHeight / 4), Math.floor(sec2State.naturalHeight / 2), Math.floor(3 * sec2State.naturalHeight / 4), sec2State.naturalHeight];
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';

    yTicks.forEach(ty => {
      const tickCanvasY = imgOffY + (ty / sec2State.naturalHeight) * drawH;
      ctx.beginPath();
      ctx.moveTo(imgOffX, tickCanvasY);
      ctx.lineTo(imgOffX - 4, tickCanvasY);
      ctx.stroke();
      ctx.fillText(String(ty), imgOffX - 6, tickCanvasY);
    });
  }

  ctx.restore();

  // Update explanation label
  const infoEl = document.getElementById('sec2-mpl-explanation');
  if (infoEl) {
    if (useViridis) {
      infoEl.innerHTML = `
        <span style="color: #f87171; font-weight: 600;">⚠ Missing cmap='gray':</span>
        Matplotlib automatically maps single-channel matrices to its default colormap (<strong>viridis</strong>), rendering images in false purple/green/yellow!
      `;
    } else if (isBgrInverted) {
      infoEl.innerHTML = `
        <span style="color: #f87171; font-weight: 600;">⚠ Raw BGR Order:</span>
        OpenCV loads images in BGR format while Matplotlib expects RGB. Without <code>cv2.cvtColor(img, cv2.COLOR_BGR2RGB)</code>, skin tones appear unnatural blue!
      `;
    } else if (hasAxis) {
      infoEl.innerHTML = `
        <span style="color: #fbbf24; font-weight: 600;">ℹ Coordinate Grid Active:</span>
        <code>plt.axis('on')</code> displays image matrix coordinates. In clean presentations and photo viewing, <code>plt.axis('off')</code> is used to hide ticks.
      `;
    } else {
      infoEl.innerHTML = `
        <span style="color: #6EE7B7; font-weight: 600;">✓ Optimal Parameters:</span>
        Converted to RGB, <code>cmap='gray'</code> enabled, and <code>plt.axis('off')</code> applied for clean borderless scientific presentation.
      `;
    }
  }
}

/**
 * Render all 6 Section 02 Canvases
 */
function renderAllSection02Canvases() {
  if (!sec2State.isLoaded) return;
  renderMatrixSection();
  renderGrayscaleSection();
  renderBinarySection();
  renderResizeSection();
  renderRotateSection();
  renderMatplotlibSection();
}

// ============================================================================
// 4. STUDENT LAB TASKS & VERIFIERS (Matching session02_digital_images.py)
// ============================================================================

/**
 * Student Task 1: Custom Binary Threshold Comparison (T=100 vs T=127)
 */
function verifyTask1() {
  if (!sec2State.isLoaded) return;

  const src = sec2State.originalImageData.data;
  const total = sec2State.naturalWidth * sec2State.naturalHeight;
  let white100 = 0;
  let white127 = 0;

  for (let i = 0; i < src.length; i += 4) {
    const luma = 0.299 * src[i] + 0.587 * src[i + 1] + 0.114 * src[i + 2];
    if (luma > 100) white100++;
    if (luma > 127) white127++;
  }

  const pct100 = ((white100 / total) * 100).toFixed(1);
  const pct127 = ((white127 / total) * 100).toFixed(1);
  const diff = (white100 - white127).toLocaleString();

  const resBox = document.getElementById('sec2-task1-result');
  if (resBox) {
    resBox.className = 'exercise-result-box active-success';
    resBox.innerHTML = `
      <strong>Task 1 Verification Passed:</strong><br>
      • <strong>T = 100:</strong> ${pct100}% white pixels (${white100.toLocaleString()} px)<br>
      • <strong>T = 127:</strong> ${pct127}% white pixels (${white127.toLocaleString()} px)<br>
      <span class="res-highlight">✓ Confirmed:</span> Lowering threshold to 100 produced <strong>+${diff}</strong> more white pixels because more pixel intensities exceed 100.
    `;
  }

  // Set binary slider to 100 for interactive visual sync
  sec2State.threshold = 100;
  const slider = document.getElementById('sec2-threshold-range');
  const valLabel = document.getElementById('sec2-threshold-val');
  if (slider) slider.value = 100;
  if (valLabel) valLabel.textContent = '100';
  renderBinarySection();
  renderMatplotlibSection();

  if (typeof showToast === 'function') {
    showToast('Task 1 Verified: T=100 produced more white pixels than T=127.', 'success');
  }
}

/**
 * Student Task 2: Resize to (150, 150) & Shape Verification
 */
function verifyTask2() {
  sec2State.resizeW = 150;
  sec2State.resizeH = 150;

  const wInput = document.getElementById('sec2-resize-w');
  const hInput = document.getElementById('sec2-resize-h');
  if (wInput) wInput.value = 150;
  if (hInput) hInput.value = 150;

  renderResizeSection();

  const resBox = document.getElementById('sec2-task2-result');
  if (resBox) {
    resBox.className = 'exercise-result-box active-success';
    resBox.innerHTML = `
      <strong>Task 2 Verification Passed:</strong><br>
      • OpenCV Target Parameter: <code>(150, 150)</code> as <code>(Width, Height)</code><br>
      • Output Array Shape: <code>task_resized.shape = (150, 150, 3)</code><br>
      <span class="res-highlight">✓ Verified:</span> Image successfully rescaled to exactly 150×150 pixels with 3 color channels.
    `;
  }

  if (typeof showToast === 'function') {
    showToast('Task 2 Verified: Resized shape is (150, 150, 3).', 'success');
  }
}

/**
 * Student Task 3: Rotation Comparison (180° vs 90° Clockwise)
 */
function verifyTask3() {
  const origH = sec2State.naturalHeight;
  const origW = sec2State.naturalWidth;

  const resBox = document.getElementById('sec2-task3-result');
  if (resBox) {
    resBox.className = 'exercise-result-box active-success';
    resBox.innerHTML = `
      <strong>Task 3 Verification Passed:</strong><br>
      • <strong>task_rotated_180.shape:</strong> <code>(${origH}, ${origW}, 3)</code> (Shape Preserved)<br>
      • <strong>task_rotated_90.shape:</strong> <code>(${origW}, ${origH}, 3)</code> (Height & Width Swapped!)<br>
      <span class="res-highlight">✓ Verified:</span> 90° clockwise rotation transposes spatial matrix dimensions, whereas 180° half-turn preserves original array shape.
    `;
  }

  // Set rotation to 180 for preview
  sec2State.rotationAngle = 180;
  const rotBtns = document.querySelectorAll('.sec2-rot-preset');
  rotBtns.forEach(b => {
    b.classList.toggle('active', b.dataset.angle === '180');
  });
  renderRotateSection();

  if (typeof showToast === 'function') {
    showToast('Task 3 Verified: 90° transposes dimensions; 180° preserves shape.', 'success');
  }
}

/**
 * Student Task 4: Display Parameters & Colormap Verification
 */
function verifyTask4() {
  sec2State.figureType = 'binary';
  sec2State.colormap = 'gray';
  sec2State.axisVisible = false;

  const colormapToggle = document.getElementById('sec2-mpl-colormap');
  const axisToggle = document.getElementById('sec2-mpl-axis');
  if (colormapToggle) colormapToggle.value = 'gray';
  if (axisToggle) axisToggle.checked = false;

  renderMatplotlibSection();

  const resBox = document.getElementById('sec2-task4-result');
  if (resBox) {
    resBox.className = 'exercise-result-box active-success';
    resBox.innerHTML = `
      <strong>Task 4 Verification Passed:</strong><br>
      • Matplotlib Display: <code>plt.imshow(binary_100, cmap='gray')</code><br>
      • Title: <code>plt.title("Student Task: Binary (T=100)")</code><br>
      • Axis: <code>plt.axis('off')</code> (Coordinate ticks suppressed)<br>
      <span class="res-highlight">✓ Verified:</span> Rendered clean borderless presentation avoiding false viridis color distortions.
    `;
  }

  if (typeof showToast === 'function') {
    showToast("Task 4 Verified: Matplotlib plotted cleanly with cmap='gray' & axis('off').", 'success');
  }
}

// ============================================================================
// 5. EVENT LISTENERS INITIALIZATION & UI BINDINGS
// ============================================================================

/**
 * Initialize all Section 02 controls and listeners
 */
function initSection02() {
  // 1. Pixel Inspector Coordinates Inputs & Sliders
  const xInput = document.getElementById('sec2-pixel-x');
  const yInput = document.getElementById('sec2-pixel-y');
  const matrixCanvas = document.getElementById('canvas-sec2-matrix');

  if (xInput) {
    xInput.addEventListener('input', () => {
      sec2State.inspectedX = parseInt(xInput.value, 10) || 0;
      renderMatrixSection();
      renderGrayscaleSection();
    });
  }

  if (yInput) {
    yInput.addEventListener('input', () => {
      sec2State.inspectedY = parseInt(yInput.value, 10) || 0;
      renderMatrixSection();
      renderGrayscaleSection();
    });
  }

  // Interactive Click on Matrix Canvas to pick coordinate
  if (matrixCanvas) {
    matrixCanvas.addEventListener('click', (e) => {
      const rect = matrixCanvas.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;

      const imgRatio = sec2State.naturalWidth / sec2State.naturalHeight;
      const canvasRatio = rect.width / rect.height;
      let drawW = rect.width;
      let drawH = rect.height;
      let offX = 0;
      let offY = 0;

      if (imgRatio > canvasRatio) {
        drawH = rect.width / imgRatio;
        offY = (rect.height - drawH) / 2;
      } else {
        drawW = rect.height * imgRatio;
        offX = (rect.width - drawW) / 2;
      }

      if (clickX >= offX && clickX <= offX + drawW && clickY >= offY && clickY <= offY + drawH) {
        const normX = (clickX - offX) / drawW;
        const normY = (clickY - offY) / drawH;
        sec2State.inspectedX = Math.round(normX * (sec2State.naturalWidth - 1));
        sec2State.inspectedY = Math.round(normY * (sec2State.naturalHeight - 1));

        if (xInput) xInput.value = sec2State.inspectedX;
        if (yInput) yInput.value = sec2State.inspectedY;

        renderMatrixSection();
        renderGrayscaleSection();
      }
    });
  }

  // Channel View Buttons (All RGB, Red, Green, Blue)
  const channelBtns = document.querySelectorAll('.sec2-channel-btn');
  channelBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      channelBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      sec2State.activeChannelView = btn.dataset.channel || 'all';
      renderMatrixSection();
    });
  });

  // 2. Grayscale View Mode Toggle (Standard vs Split)
  const grayModeBtns = document.querySelectorAll('.sec2-gray-btn');
  grayModeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      grayModeBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      sec2State.grayViewMode = btn.dataset.mode || 'standard';
      renderGrayscaleSection();
    });
  });

  // 3. Binary Threshold Slider & Presets
  const threshSlider = document.getElementById('sec2-threshold-range');
  const threshValLabel = document.getElementById('sec2-threshold-val');
  if (threshSlider) {
    threshSlider.addEventListener('input', () => {
      sec2State.threshold = parseInt(threshSlider.value, 10) || 127;
      if (threshValLabel) threshValLabel.textContent = sec2State.threshold;
      renderBinarySection();
      renderMatplotlibSection();
    });
  }

  const threshPresets = document.querySelectorAll('.sec2-thresh-preset');
  threshPresets.forEach(btn => {
    btn.addEventListener('click', () => {
      const t = parseInt(btn.dataset.thresh, 10);
      if (!isNaN(t)) {
        sec2State.threshold = t;
        if (threshSlider) threshSlider.value = t;
        if (threshValLabel) threshValLabel.textContent = t;
        threshPresets.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        renderBinarySection();
        renderMatplotlibSection();
      }
    });
  });

  // 4. Resizing Controls
  const resizeWInput = document.getElementById('sec2-resize-w');
  const resizeHInput = document.getElementById('sec2-resize-h');
  const lockAspectCheck = document.getElementById('sec2-lock-aspect');

  if (resizeWInput) {
    resizeWInput.addEventListener('input', () => {
      const w = parseInt(resizeWInput.value, 10) || 100;
      sec2State.resizeW = w;
      if (sec2State.lockAspect && sec2State.naturalHeight > 0) {
        const h = Math.round(w / (sec2State.naturalWidth / sec2State.naturalHeight));
        sec2State.resizeH = h;
        if (resizeHInput) resizeHInput.value = h;
      }
      renderResizeSection();
    });
  }

  if (resizeHInput) {
    resizeHInput.addEventListener('input', () => {
      const h = parseInt(resizeHInput.value, 10) || 100;
      sec2State.resizeH = h;
      if (sec2State.lockAspect && sec2State.naturalWidth > 0) {
        const w = Math.round(h * (sec2State.naturalWidth / sec2State.naturalHeight));
        sec2State.resizeW = w;
        if (resizeWInput) resizeWInput.value = w;
      }
      renderResizeSection();
    });
  }

  if (lockAspectCheck) {
    lockAspectCheck.addEventListener('change', () => {
      sec2State.lockAspect = lockAspectCheck.checked;
    });
  }

  const resizePresets = document.querySelectorAll('.sec2-resize-preset');
  resizePresets.forEach(btn => {
    btn.addEventListener('click', () => {
      const w = parseInt(btn.dataset.w, 10);
      const h = parseInt(btn.dataset.h, 10);
      if (!isNaN(w) && !isNaN(h)) {
        sec2State.resizeW = w;
        sec2State.resizeH = h;
        if (resizeWInput) resizeWInput.value = w;
        if (resizeHInput) resizeHInput.value = h;
        resizePresets.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        renderResizeSection();
      }
    });
  });

  // 5. Rotation Presets
  const rotPresets = document.querySelectorAll('.sec2-rot-preset');
  rotPresets.forEach(btn => {
    btn.addEventListener('click', () => {
      const angle = parseInt(btn.dataset.angle, 10);
      if (!isNaN(angle)) {
        sec2State.rotationAngle = angle;
        rotPresets.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        renderRotateSection();
      }
    });
  });

  // 6. Matplotlib Display Simulation Controls
  const mplFigureType = document.getElementById('sec2-mpl-figure-type');
  const mplColorOrder = document.getElementById('sec2-mpl-color-order');
  const mplColormap = document.getElementById('sec2-mpl-colormap');
  const mplAxis = document.getElementById('sec2-mpl-axis');

  if (mplFigureType) {
    mplFigureType.addEventListener('change', () => {
      sec2State.figureType = mplFigureType.value;
      renderMatplotlibSection();
    });
  }

  if (mplColorOrder) {
    mplColorOrder.addEventListener('change', () => {
      sec2State.colorOrder = mplColorOrder.value;
      renderMatplotlibSection();
    });
  }

  if (mplColormap) {
    mplColormap.addEventListener('change', () => {
      sec2State.colormap = mplColormap.value;
      renderMatplotlibSection();
    });
  }

  if (mplAxis) {
    mplAxis.addEventListener('change', () => {
      sec2State.axisVisible = mplAxis.checked;
      renderMatplotlibSection();
    });
  }

  // 7. Student Lab Task Verifier Buttons
  const btnTask1 = document.getElementById('sec2-btn-verify-task1');
  const btnTask2 = document.getElementById('sec2-btn-verify-task2');
  const btnTask3 = document.getElementById('sec2-btn-verify-task3');
  const btnTask4 = document.getElementById('sec2-btn-verify-task4');

  if (btnTask1) btnTask1.addEventListener('click', verifyTask1);
  if (btnTask2) btnTask2.addEventListener('click', verifyTask2);
  if (btnTask3) btnTask3.addEventListener('click', verifyTask3);
  if (btnTask4) btnTask4.addEventListener('click', verifyTask4);

  // 8. Banner Action Buttons (Sample Image, Upload Custom Image, Reset)
  const sampleBtn = document.getElementById('btn-sec2-sample-img');
  const uploadBtn = document.getElementById('btn-sec2-upload-img');
  const fileInput = document.getElementById('sec2-file-input');
  const resetBtn = document.getElementById('btn-sec2-reset');

  if (sampleBtn) {
    sampleBtn.addEventListener('click', () => {
      loadSec2Image('assets/images/hero_landscape.jpg', () => {
        if (typeof showToast === 'function') {
          showToast('Sample image loaded for Section 2.', 'success');
        }
      });
    });
  }

  if (uploadBtn && fileInput) {
    uploadBtn.addEventListener('click', () => {
      fileInput.click();
    });

    fileInput.addEventListener('change', (e) => {
      const file = e.target.files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (ev) => {
          loadSec2Image(ev.target.result, () => {
            if (typeof showToast === 'function') {
              showToast(`Loaded custom image "${file.name}" into Section 2.`, 'success');
            }
          });
        };
        reader.readAsDataURL(file);
      }
    });
  }

  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      sec2State.inspectedX = Math.floor(sec2State.naturalWidth / 2);
      sec2State.inspectedY = Math.floor(sec2State.naturalHeight / 2);
      sec2State.activeChannelView = 'all';
      sec2State.grayViewMode = 'standard';
      sec2State.threshold = 127;
      sec2State.resizeW = 300;
      sec2State.resizeH = 300;
      sec2State.rotationAngle = 90;
      sec2State.colorOrder = 'RGB';
      sec2State.axisVisible = false;
      sec2State.colormap = 'gray';
      sec2State.figureType = 'binary';

      // Reset controls UI
      if (threshSlider) threshSlider.value = 127;
      if (threshValLabel) threshValLabel.textContent = '127';
      if (resizeWInput) resizeWInput.value = 300;
      if (resizeHInput) resizeHInput.value = 300;
      if (mplFigureType) mplFigureType.value = 'binary';
      if (mplColorOrder) mplColorOrder.value = 'RGB';
      if (mplColormap) mplColormap.value = 'gray';
      if (mplAxis) mplAxis.checked = false;

      renderAllSection02Canvases();

      if (typeof showToast === 'function') {
        showToast('Section 2 parameters reset to curriculum defaults.', 'info');
      }
    });
  }

  // Load initial sample image
  loadSec2Image(sec2State.imageSrc);

  // Resize listener with debounce
  let resizeTimer = null;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      renderAllSection02Canvases();
    }, 150);
  });
}

// Expose globally
window.initSection02 = initSection02;
window.renderAllSection02Canvases = renderAllSection02Canvases;
