/**
 * ============================================================================
 * Multimedia Lab - Operations & Dynamic Controls Module (js/operations.js)
 * ============================================================================
 * Manages operation selection, dynamic UI controls rendering based on selected
 * operation, parameter updates, and mock image processing (Canvas engine).
 * 
 * Future Python/FastAPI Integration Point:
 * See `processImage()` function at the bottom of this file.
 */

// Aspect ratio memory helper
let originalAspectRatio = 1.0;

/**
 * Render dynamic controls for selected operation
 * @param {string} opKey - Key of selected operation
 */
function renderDynamicControls(opKey) {
  const controlsCard = document.getElementById('controls-card');
  const controlsBody = document.getElementById('controls-body');

  if (!controlsCard || !controlsBody) return;

  // Reveal controls card
  controlsCard.classList.remove('hidden');

  // Reset params object
  appState.operationParams = {};

  // Clear previous body controls
  controlsBody.innerHTML = '';

  switch (opKey) {
    case 'grayscale':
      controlsBody.innerHTML = `
        <p style="font-size: 0.85rem; color: var(--text-muted); margin: 0;">
          Convert image to grayscale.
        </p>
      `;
      break;

    case 'resize':
      const initW = appState.originalMetadata?.width || 800;
      const initH = appState.originalMetadata?.height || 600;
      originalAspectRatio = initW / (initH || 1);
      appState.operationParams = { width: initW, height: initH, lockAspect: true };

      controlsBody.innerHTML = `
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
          <div class="form-group">
            <label class="form-label" for="resize-w">Width (px)</label>
            <input type="number" id="resize-w" class="form-input" value="${initW}" min="10" max="10000">
          </div>
          <div class="form-group">
            <label class="form-label" for="resize-h">Height (px)</label>
            <input type="number" id="resize-h" class="form-input" value="${initH}" min="10" max="10000">
          </div>
        </div>
        <div style="display: flex; align-items: center; gap: 0.5rem; font-size: 0.85rem; color: var(--text-muted);">
          <input type="checkbox" id="lock-aspect" checked style="accent-color: var(--primary);">
          <label for="lock-aspect" style="cursor: pointer;">Lock aspect ratio</label>
        </div>
      `;

      // Input change handlers with aspect ratio lock logic
      setTimeout(() => {
        const inputW = document.getElementById('resize-w');
        const inputH = document.getElementById('resize-h');
        const lockCheckbox = document.getElementById('lock-aspect');

        if (inputW && inputH && lockCheckbox) {
          inputW.addEventListener('input', () => {
            const w = parseInt(inputW.value, 10) || 0;
            appState.operationParams.width = w;
            if (lockCheckbox.checked && originalAspectRatio > 0) {
              const h = Math.round(w / originalAspectRatio);
              inputH.value = h;
              appState.operationParams.height = h;
            }
          });

          inputH.addEventListener('input', () => {
            const h = parseInt(inputH.value, 10) || 0;
            appState.operationParams.height = h;
            if (lockCheckbox.checked && originalAspectRatio > 0) {
              const w = Math.round(h * originalAspectRatio);
              inputW.value = w;
              appState.operationParams.width = w;
            }
          });

          lockCheckbox.addEventListener('change', () => {
            appState.operationParams.lockAspect = lockCheckbox.checked;
          });
        }
      }, 0);
      break;

    case 'rotate':
      appState.operationParams = { angle: 90 };
      controlsBody.innerHTML = `
        <div class="form-group">
          <label class="form-label">Select Rotation Angle</label>
          <div class="preset-group">
            <button type="button" class="preset-btn active" data-angle="90">90° Clockwise</button>
            <button type="button" class="preset-btn" data-angle="180">180° Half Turn</button>
            <button type="button" class="preset-btn" data-angle="270">270° Counter-CW</button>
          </div>
        </div>
      `;

      setTimeout(() => {
        const btns = controlsBody.querySelectorAll('.preset-btn');
        btns.forEach(btn => {
          btn.addEventListener('click', () => {
            btns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            appState.operationParams.angle = parseInt(btn.dataset.angle, 10);
          });
        });
      }, 0);
      break;

    case 'flip':
      appState.operationParams = { direction: 'horizontal' };
      controlsBody.innerHTML = `
        <div class="form-group">
          <label class="form-label">Select Flip Axis</label>
          <div class="preset-group">
            <button type="button" class="preset-btn active" data-flip="horizontal">↔ Horizontal (Left-Right)</button>
            <button type="button" class="preset-btn" data-flip="vertical">↕ Vertical (Top-Bottom)</button>
          </div>
        </div>
      `;

      setTimeout(() => {
        const btns = controlsBody.querySelectorAll('.preset-btn');
        btns.forEach(btn => {
          btn.addEventListener('click', () => {
            btns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            appState.operationParams.direction = btn.dataset.flip;
          });
        });
      }, 0);
      break;

    case 'blur':
      const currentBlur = appState.adjustments ? (appState.adjustments.blur || 0) : 0;
      appState.operationParams = { amount: currentBlur };
      const blurResetClass = currentBlur !== 0 ? '' : 'hidden';
      controlsBody.innerHTML = `
        <div class="form-group">
          <div class="form-label">
            <span>Blur Radius (px)</span>
            <div style="display: flex; align-items: center; gap: 0.4rem;">
              <span id="blur-val" class="label-value">${currentBlur} px</span>
              <button type="button" id="blur-reset-btn" class="reset-btn ${blurResetClass}" aria-label="Reset Blur" title="Reset to default">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path>
                  <path d="M3 3v5h5"></path>
                </svg>
              </button>
            </div>
          </div>
          <input type="range" id="blur-range" class="form-range" min="0" max="25" value="${currentBlur}">
        </div>
      `;

      setTimeout(() => {
        const range = document.getElementById('blur-range');
        const valLabel = document.getElementById('blur-val');
        const resetBtn = document.getElementById('blur-reset-btn');
        if (range && valLabel) {
          range.addEventListener('input', () => {
            const v = parseInt(range.value, 10) || 0;
            valLabel.textContent = `${v} px`;
            if (appState.adjustments) appState.adjustments.blur = v;
            appState.operationParams.amount = v;
            if (resetBtn) {
              if (v !== 0) resetBtn.classList.remove('hidden');
              else resetBtn.classList.add('hidden');
            }
            updateLivePreview();
          });
        }
        if (resetBtn) {
          resetBtn.addEventListener('click', () => {
            if (appState.adjustments) appState.adjustments.blur = 0;
            appState.operationParams.amount = 0;
            if (range) range.value = 0;
            if (valLabel) valLabel.textContent = '0 px';
            resetBtn.classList.add('hidden');
            updateLivePreview();
          });
        }
      }, 0);
      break;

    case 'brightness':
      const currentBrightness = appState.adjustments ? (appState.adjustments.brightness || 0) : 0;
      const bLabel = currentBrightness > 0 ? `+${currentBrightness}%` : `${currentBrightness}%`;
      appState.operationParams = { amount: currentBrightness };
      const bResetClass = currentBrightness !== 0 ? '' : 'hidden';
      controlsBody.innerHTML = `
        <div class="form-group">
          <div class="form-label">
            <span>Brightness Level</span>
            <div style="display: flex; align-items: center; gap: 0.4rem;">
              <span id="brightness-val" class="label-value">${bLabel}</span>
              <button type="button" id="brightness-reset-btn" class="reset-btn ${bResetClass}" aria-label="Reset Brightness" title="Reset to default">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path>
                  <path d="M3 3v5h5"></path>
                </svg>
              </button>
            </div>
          </div>
          <input type="range" id="brightness-range" class="form-range" min="-100" max="100" value="${currentBrightness}">
        </div>
      `;

      setTimeout(() => {
        const range = document.getElementById('brightness-range');
        const valLabel = document.getElementById('brightness-val');
        const resetBtn = document.getElementById('brightness-reset-btn');
        if (range && valLabel) {
          range.addEventListener('input', () => {
            const v = parseInt(range.value, 10) || 0;
            valLabel.textContent = v > 0 ? `+${v}%` : `${v}%`;
            if (appState.adjustments) appState.adjustments.brightness = v;
            appState.operationParams.amount = v;
            if (resetBtn) {
              if (v !== 0) resetBtn.classList.remove('hidden');
              else resetBtn.classList.add('hidden');
            }
            updateLivePreview();
          });
        }
        if (resetBtn) {
          resetBtn.addEventListener('click', () => {
            if (appState.adjustments) appState.adjustments.brightness = 0;
            appState.operationParams.amount = 0;
            if (range) range.value = 0;
            if (valLabel) valLabel.textContent = '0%';
            resetBtn.classList.add('hidden');
            updateLivePreview();
          });
        }
      }, 0);
      break;

    case 'contrast':
      const currentContrast = appState.adjustments ? (appState.adjustments.contrast || 0) : 0;
      const cLabel = currentContrast > 0 ? `+${currentContrast}%` : `${currentContrast}%`;
      appState.operationParams = { amount: currentContrast };
      const cResetClass = currentContrast !== 0 ? '' : 'hidden';
      controlsBody.innerHTML = `
        <div class="form-group">
          <div class="form-label">
            <span>Contrast Level</span>
            <div style="display: flex; align-items: center; gap: 0.4rem;">
              <span id="contrast-val" class="label-value">${cLabel}</span>
              <button type="button" id="contrast-reset-btn" class="reset-btn ${cResetClass}" aria-label="Reset Contrast" title="Reset to default">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path>
                  <path d="M3 3v5h5"></path>
                </svg>
              </button>
            </div>
          </div>
          <input type="range" id="contrast-range" class="form-range" min="-100" max="100" value="${currentContrast}">
        </div>
      `;

      setTimeout(() => {
        const range = document.getElementById('contrast-range');
        const valLabel = document.getElementById('contrast-val');
        const resetBtn = document.getElementById('contrast-reset-btn');
        if (range && valLabel) {
          range.addEventListener('input', () => {
            const v = parseInt(range.value, 10) || 0;
            valLabel.textContent = v > 0 ? `+${v}%` : `${v}%`;
            if (appState.adjustments) appState.adjustments.contrast = v;
            appState.operationParams.amount = v;
            if (resetBtn) {
              if (v !== 0) resetBtn.classList.remove('hidden');
              else resetBtn.classList.add('hidden');
            }
            updateLivePreview();
          });
        }
        if (resetBtn) {
          resetBtn.addEventListener('click', () => {
            if (appState.adjustments) appState.adjustments.contrast = 0;
            appState.operationParams.amount = 0;
            if (range) range.value = 0;
            if (valLabel) valLabel.textContent = '0%';
            resetBtn.classList.add('hidden');
            updateLivePreview();
          });
        }
      }, 0);
      break;

    case 'edges':
      controlsBody.innerHTML = `
        <p style="font-size: 0.85rem; color: var(--text-muted); margin: 0;">
          Detect image edges.
        </p>
      `;
      break;
  }
}

let bakeTimeout = null;

/**
 * Updates live preview on `#result-preview` based on current appState.adjustments.
 * Combines brightness, contrast, and blur filters simultaneously.
 */
function updateLivePreview() {
  if (!appState.originalImageUrl) return;

  const resultPreviewImg = document.getElementById('result-preview');
  const resultEmptyState = document.getElementById('result-empty-state');
  const downloadBtn = document.getElementById('download-btn');
  const processingBadge = document.getElementById('processing-badge');

  if (!resultPreviewImg) return;

  if (!resultPreviewImg.src || resultPreviewImg.src !== appState.originalImageUrl) {
    resultPreviewImg.src = appState.originalImageUrl;
  }

  resultPreviewImg.classList.remove('hidden');
  if (resultEmptyState) resultEmptyState.classList.add('hidden');
  if (processingBadge) processingBadge.classList.remove('hidden');
  if (downloadBtn) downloadBtn.disabled = false;

  const blur = appState.adjustments ? (appState.adjustments.blur || 0) : 0;
  const brightness = 100 + (appState.adjustments ? (appState.adjustments.brightness || 0) : 0);
  const contrast = 100 + (appState.adjustments ? (appState.adjustments.contrast || 0) : 0);

  resultPreviewImg.style.filter = `brightness(${brightness}%) contrast(${contrast}%) blur(${blur}px)`;

  bakeAdjustmentsToCanvas();
}

/**
 * Debounced helper to render adjustments to Canvas and populate appState.resultImageUrl for download
 */
function bakeAdjustmentsToCanvas() {
  if (!appState.originalImageUrl) return;

  if (bakeTimeout) clearTimeout(bakeTimeout);

  bakeTimeout = setTimeout(() => {
    getProcessedResultDataUrl();
  }, 50);
}

/**
 * Synchronous helper to bake active adjustments onto a canvas data URL
 * @returns {string|null} Data URL of current processed image preview
 */
function getProcessedResultDataUrl() {
  if (!appState.originalImageUrl) return null;

  const img = new Image();
  img.src = appState.originalImageUrl;

  const canvas = document.createElement('canvas');
  canvas.width = img.naturalWidth || 800;
  canvas.height = img.naturalHeight || 600;
  const ctx = canvas.getContext('2d');

  const blur = appState.adjustments ? (appState.adjustments.blur || 0) : 0;
  const brightness = 100 + (appState.adjustments ? (appState.adjustments.brightness || 0) : 0);
  const contrast = 100 + (appState.adjustments ? (appState.adjustments.contrast || 0) : 0);

  ctx.filter = `brightness(${brightness}%) contrast(${contrast}%) blur(${blur}px)`;
  ctx.drawImage(img, 0, 0);

  const dataUrl = canvas.toDataURL('image/png');
  appState.resultImageUrl = dataUrl;
  return dataUrl;
}

/**
 * Helper to update dynamic default values (e.g. width/height for resize)
 */
function updateOperationParamsDefaults(w, h) {
  if (appState.selectedOperation === 'resize') {
    renderDynamicControls('resize');
  }
}

/**
 * Native Canvas HTML5 Mock Processing Implementation
 * Generates immediate visual feedback for the user in frontend-only mode.
 */
function executeLocalCanvasProcessing(dataUrl, operation, options) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      let w = img.naturalWidth;
      let h = img.naturalHeight;

      const blur = appState.adjustments ? (appState.adjustments.blur || 0) : 0;
      const brightness = 100 + (appState.adjustments ? (appState.adjustments.brightness || 0) : 0);
      const contrast = 100 + (appState.adjustments ? (appState.adjustments.contrast || 0) : 0);
      const adjustmentsFilter = `brightness(${brightness}%) contrast(${contrast}%) blur(${blur}px)`;

      // Handle Resize operation canvas dimensions
      if (operation === 'resize') {
        w = options.width || w;
        h = options.height || h;
        canvas.width = w;
        canvas.height = h;
        ctx.filter = adjustmentsFilter;
        ctx.drawImage(img, 0, 0, w, h);
      } 
      // Handle Rotate operation canvas dimensions
      else if (operation === 'rotate') {
        const angle = options.angle || 90;
        if (angle === 90 || angle === 270) {
          canvas.width = h;
          canvas.height = w;
        } else {
          canvas.width = w;
          canvas.height = h;
        }
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate((angle * Math.PI) / 180);
        ctx.filter = adjustmentsFilter;
        ctx.drawImage(img, -w / 2, -h / 2);
      } 
      // Handle Flip operation canvas dimensions
      else if (operation === 'flip') {
        canvas.width = w;
        canvas.height = h;
        if (options.direction === 'vertical') {
          ctx.translate(0, h);
          ctx.scale(1, -1);
        } else {
          ctx.translate(w, 0);
          ctx.scale(-1, 1);
        }
        ctx.filter = adjustmentsFilter;
        ctx.drawImage(img, 0, 0);
      } 
      // Default Operations (Grayscale, Blur, Brightness, Contrast, Edges)
      else {
        canvas.width = w;
        canvas.height = h;

        if (operation === 'grayscale') {
          ctx.filter = `grayscale(100%) ${adjustmentsFilter}`;
        } else {
          ctx.filter = adjustmentsFilter;
        }

        ctx.drawImage(img, 0, 0);

        // Edge detection canvas pixel manipulation simulation
        if (operation === 'edges') {
          const imgData = ctx.getImageData(0, 0, w, h);
          const data = imgData.data;
          const grayscale = new Uint8ClampedArray(w * h);

          // Convert to grayscale
          for (let i = 0; i < data.length; i += 4) {
            grayscale[i / 4] = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
          }

          // Simple horizontal difference gradient for edge detection visual effect
          for (let y = 0; y < h; y++) {
            for (let x = 0; x < w - 1; x++) {
              const idx = y * w + x;
              const diff = Math.abs(grayscale[idx] - grayscale[idx + 1]);
              const edgeVal = diff > 20 ? 255 : 0;

              const pxIdx = idx * 4;
              data[pxIdx] = edgeVal;
              data[pxIdx + 1] = edgeVal;
              data[pxIdx + 2] = edgeVal;
            }
          }
          ctx.putImageData(imgData, 0, 0);
        }
      }

      resolve(canvas.toDataURL('image/png'));
    };
    img.src = dataUrl;
  });
}

/**
 * ============================================================================
 * Core Processing Manager & Python Integration Point
 * ============================================================================
 * @param {File} file - Original raw image file
 * @param {string} operation - Key of selected operation
 * @param {Object} options - Dynamic parameter payload
 * @returns {Promise<string>} Promise resolving to processed result Data/Object URL
 */
async function processImage(file, operation, options) {
  /* 
   * --------------------------------------------------------------------------
   * TODO: FUTURE PYTHON / FASTAPI BACKEND INTEGRATION
   * --------------------------------------------------------------------------
   * When integrating Python FastAPI, replace the local canvas processing block
   * below with an HTTP API request to your Python server:
   * 
   * const formData = new FormData();
   * formData.append('file', file);
   * formData.append('operation', operation);
   * formData.append('options', JSON.stringify(options));
   * 
   * const response = await fetch('http://localhost:8000/api/process', {
   *   method: 'POST',
   *   body: formData
   * });
   * 
   * if (!response.ok) {
   *   throw new Error('Server returned error while processing image.');
   * }
   * 
   * const data = await response.json();
   * return data.resultImageUrl;
   * --------------------------------------------------------------------------
   */

  // Current Mock Processing using local browser HTML5 Canvas engine:
  return new Promise((resolve, reject) => {
    // Simulate server network latency (600ms)
    setTimeout(async () => {
      try {
        const resultDataUrl = await executeLocalCanvasProcessing(appState.originalImageUrl, operation, options);
        resolve(resultDataUrl);
      } catch (err) {
        reject(err);
      }
    }, 600);
  });
}

/**
 * Update disabled state of Apply Operation button based on image and operation availability
 */
function updateApplyButtonState() {
  const applyBtn = document.getElementById('apply-btn');
  if (!applyBtn) return;
  const canApply = Boolean(appState.originalImageUrl && appState.selectedOperation && !appState.processing);
  applyBtn.disabled = !canApply;
}

/**
 * Initialize Operations Panel Event Listeners
 */
function initOperations() {
  const opButtons = document.querySelectorAll('.operation-btn');
  const applyBtn = document.getElementById('apply-btn');
  const loadingOverlay = document.getElementById('loading-overlay');

  // Initialize initial button state
  updateApplyButtonState();

  // 1. Operation Selection Handler
  opButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      opButtons.forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');

      const opKey = btn.dataset.operation;
      appState.selectedOperation = opKey;

      renderDynamicControls(opKey);
      updateApplyButtonState();
    });
  });

  // 2. Apply Operation Button Handler
  if (applyBtn) {
    applyBtn.addEventListener('click', async () => {
      // Check if image is loaded
      if (!appState.originalFile || !appState.originalImageUrl) {
        if (typeof showToast === 'function') {
          showToast('Please upload an image first before applying operations.', 'error');
        }
        return;
      }

      // Check if operation is selected
      if (!appState.selectedOperation) {
        if (typeof showToast === 'function') {
          showToast('Please select an operation from the list.', 'error');
        }
        return;
      }

      // Show loading overlay
      appState.processing = true;
      if (loadingOverlay) loadingOverlay.classList.remove('hidden');
      applyBtn.disabled = true;

      try {
        const resultUrl = await processImage(
          appState.originalFile,
          appState.selectedOperation,
          appState.operationParams
        );

        appState.resultImageUrl = resultUrl;

        // Render result in preview card
        if (typeof updateResultPreview === 'function') {
          updateResultPreview(resultUrl);
        }

        if (typeof showToast === 'function') {
          showToast(`Successfully applied ${appState.selectedOperation}!`, 'success');
        }
      } catch (error) {
        console.error('Processing error:', error);
        if (typeof showToast === 'function') {
          showToast('An error occurred during image processing.', 'error');
        }
      } finally {
        appState.processing = false;
        if (loadingOverlay) loadingOverlay.classList.add('hidden');
        updateApplyButtonState();
      }
    });
  }
}
