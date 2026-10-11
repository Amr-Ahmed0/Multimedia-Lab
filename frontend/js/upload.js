/**
 * ============================================================================
 * Multimedia Lab - Upload Module (js/upload.js)
 * ============================================================================
 * Manages file selection via file picker & drag-and-drop, validates file type
 * and size, and reads image into data URL memory.
 */

// Supported image MIME types
const ALLOWED_MIME_TYPES = [
  'image/png',
  'image/jpeg',
  'image/jpg',
  'image/webp'
];

// Maximum allowed size (15 MB)
const MAX_FILE_SIZE_BYTES = 15 * 1024 * 1024;

/**
 * Validate selected file for MIME type and file size
 * @param {File} file - Selected file object
 * @returns {boolean} True if valid, false otherwise
 */
function validateFile(file) {
  if (!file) {
    if (typeof showToast === 'function') {
      showToast('No file was selected.', 'error');
    }
    return false;
  }

  // Check file type
  if (!ALLOWED_MIME_TYPES.includes(file.type.toLowerCase())) {
    if (typeof showToast === 'function') {
      showToast('Invalid file format! Please upload a PNG, JPG, JPEG, or WEBP image.', 'error');
    }
    return false;
  }

  // Check file size limit
  if (file.size > MAX_FILE_SIZE_BYTES) {
    if (typeof showToast === 'function') {
      showToast('File size is too large! Maximum limit is 15MB.', 'error');
    }
    return false;
  }

  return true;
}

/**
 * Process and load selected file into appState and preview
 * @param {File} file - Selected file object
 */
function handleFileSelect(file) {
  if (!validateFile(file)) return;

  const reader = new FileReader();

  reader.onload = (e) => {
    const dataUrl = e.target.result;

    // Update global application state
    appState.originalFile = file;
    appState.originalImageUrl = dataUrl;
    appState.resultImageUrl = null; // Clear previous result when new image uploaded
    appState.adjustments = { blur: 0, brightness: 0, contrast: 0 };

    // Update preview module
    if (typeof updateOriginalPreview === 'function') {
      updateOriginalPreview(file, dataUrl);
    }

    // Refresh apply button state
    if (typeof updateApplyButtonState === 'function') {
      updateApplyButtonState();
    }

    if (typeof showToast === 'function') {
      showToast(`Successfully uploaded "${file.name}"`, 'success');
    }
  };

  reader.onerror = () => {
    if (typeof showToast === 'function') {
      showToast('Failed to read image file.', 'error');
    }
  };

  reader.readAsDataURL(file);
}

/**
 * Initialize Drag & Drop and File Picker Listeners
 */
function initUpload() {
  const dropZone = document.getElementById('drop-zone');
  const browseBtn = document.getElementById('browse-btn');
  const fileInput = document.getElementById('file-input');

  if (!dropZone || !fileInput) return;

  // 1. Browse Button Click Handler
  if (browseBtn) {
    browseBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      fileInput.click();
    });
  }

  // Drop zone click triggers file input
  dropZone.addEventListener('click', () => {
    fileInput.click();
  });

  // Drop zone keyboard interaction (Enter / Space)
  dropZone.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      fileInput.click();
    }
  });

  // 2. File Input Change Handler
  fileInput.addEventListener('change', (e) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  });

  // 3. Drag & Drop Event Listeners
  ['dragenter', 'dragover'].forEach(eventName => {
    dropZone.addEventListener(eventName, (e) => {
      e.preventDefault();
      e.stopPropagation();
      dropZone.classList.add('drag-over');
    }, false);
  });

  ['dragleave', 'drop'].forEach(eventName => {
    dropZone.addEventListener(eventName, (e) => {
      e.preventDefault();
      e.stopPropagation();
      dropZone.classList.remove('drag-over');
    }, false);
  });

  dropZone.addEventListener('drop', (e) => {
    const dataTransfer = e.dataTransfer;
    if (dataTransfer && dataTransfer.files && dataTransfer.files.length > 0) {
      handleFileSelect(dataTransfer.files[0]);
    }
  });
}
