/**
 * ============================================================================
 * Multimedia Lab - Preview & Metadata Module (js/preview.js)
 * ============================================================================
 * Handles image rendering in workspace cards and extracts metadata properties
 * (dimensions, format, human-readable file size).
 */

/**
 * Format bytes into readable string (KB, MB)
 * @param {number} bytes 
 * @returns {string} Formatted size string
 */
function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Extract clean file type format string (PNG, JPEG, WEBP)
 * @param {File} file 
 * @returns {string} Format string
 */
function extractFileType(file) {
  if (!file || !file.type) return 'IMAGE';
  const typeMap = {
    'image/png': 'PNG',
    'image/jpeg': 'JPEG',
    'image/jpg': 'JPG',
    'image/webp': 'WEBP'
  };
  return typeMap[file.type] || file.type.split('/')[1]?.toUpperCase() || 'IMAGE';
}

/**
 * Render Original Image Preview and compute metadata
 * @param {File} file - Uploaded File object
 * @param {string} dataUrl - FileReader data URL or Blob URL
 */
function updateOriginalPreview(file, dataUrl) {
  const originalPreviewImg = document.getElementById('original-preview');
  const originalEmptyState = document.getElementById('original-empty-state');
  const metadataPanel = document.getElementById('metadata-panel');
  const clearBtn = document.getElementById('clear-image-btn');

  const metaFilename = document.getElementById('meta-filename');
  const metaType = document.getElementById('meta-type');
  const metaDimensions = document.getElementById('meta-dimensions');
  const metaSize = document.getElementById('meta-size');

  if (!file || !dataUrl) return;

  // Show image preview, hide empty state
  originalPreviewImg.src = dataUrl;
  originalPreviewImg.classList.remove('hidden');
  originalEmptyState.classList.add('hidden');
  if (clearBtn) clearBtn.style.display = 'inline-flex';
  const originalBadge = document.getElementById('original-badge');
  if (originalBadge) originalBadge.classList.remove('hidden');

  // Load image object in memory to accurately extract width & height
  const imgLoader = new Image();
  imgLoader.onload = () => {
    const width = imgLoader.naturalWidth;
    const height = imgLoader.naturalHeight;

    // Update state metadata
    appState.originalMetadata = {
      name: file.name,
      type: extractFileType(file),
      sizeFormatted: formatFileSize(file.size),
      width: width,
      height: height
    };

    // Update UI Metadata Panel
    if (metaFilename) metaFilename.textContent = file.name;
    if (metaType) metaType.textContent = appState.originalMetadata.type;
    if (metaDimensions) metaDimensions.textContent = `${width} × ${height}`;
    if (metaSize) metaSize.textContent = appState.originalMetadata.sizeFormatted;

    // Reveal metadata panel
    if (metadataPanel) metadataPanel.classList.remove('hidden');

    // Trigger dynamic form update for operations (e.g., set default width/height for resize)
    if (typeof updateOperationParamsDefaults === 'function') {
      updateOperationParamsDefaults(width, height);
    }
  };
  imgLoader.src = dataUrl;
}

/**
 * Render Processed Result Image
 * @param {string} resultUrl - Processed Image Data URL or Blob URL
 */
function updateResultPreview(resultUrl) {
  const resultPreviewImg = document.getElementById('result-preview');
  const resultEmptyState = document.getElementById('result-empty-state');
  const downloadBtn = document.getElementById('download-btn');
  const processingBadge = document.getElementById('processing-badge');

  if (!resultUrl) return;

  resultPreviewImg.src = resultUrl;
  resultPreviewImg.classList.remove('hidden');
  resultEmptyState.classList.add('hidden');

  if (processingBadge) processingBadge.classList.remove('hidden');

  // Enable download button
  if (downloadBtn) {
    downloadBtn.disabled = false;
  }
}

/**
 * Reset and clear previews back to initial empty state
 */
function clearPreviews() {
  if (appState) {
    appState.adjustments = { blur: 0, brightness: 0, contrast: 0 };
  }
  const originalPreviewImg = document.getElementById('original-preview');
  const originalEmptyState = document.getElementById('original-empty-state');
  const resultPreviewImg = document.getElementById('result-preview');
  const resultEmptyState = document.getElementById('result-empty-state');
  const metadataPanel = document.getElementById('metadata-panel');
  const downloadBtn = document.getElementById('download-btn');
  const processingBadge = document.getElementById('processing-badge');
  const clearBtn = document.getElementById('clear-image-btn');

  if (originalPreviewImg) {
    originalPreviewImg.src = '';
    originalPreviewImg.classList.add('hidden');
  }
  if (originalEmptyState) originalEmptyState.classList.remove('hidden');

  if (resultPreviewImg) {
    resultPreviewImg.src = '';
    resultPreviewImg.classList.add('hidden');
  }
  if (resultEmptyState) resultEmptyState.classList.remove('hidden');

  if (metadataPanel) metadataPanel.classList.add('hidden');
  if (processingBadge) processingBadge.classList.add('hidden');
  const originalBadge = document.getElementById('original-badge');
  if (originalBadge) originalBadge.classList.add('hidden');
  if (clearBtn) clearBtn.style.display = 'none';

  if (downloadBtn) downloadBtn.disabled = true;

  // Refresh apply button state
  if (typeof updateApplyButtonState === 'function') {
    updateApplyButtonState();
  }
}

/**
 * Initialize preview event listeners
 */
function initPreview() {
  const clearBtn = document.getElementById('clear-image-btn');
  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      appState.originalFile = null;
      appState.originalImageUrl = null;
      appState.resultImageUrl = null;
      appState.originalMetadata = null;
      clearPreviews();

      // Reset file input value
      const fileInput = document.getElementById('file-input');
      if (fileInput) fileInput.value = '';

      if (typeof updateApplyButtonState === 'function') {
        updateApplyButtonState();
      }

      if (typeof showToast === 'function') {
        showToast('Workspace cleared.', 'success');
      }
    });
  }
}
