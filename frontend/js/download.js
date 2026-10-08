/**
 * ============================================================================
 * Multimedia Lab - Download Module (js/download.js)
 * ============================================================================
 * Handles client-side file download of processed result images.
 */

/**
 * Trigger client-side image download
 * @param {string} imageUrl - Data URL or Object URL of the result image
 * @param {string} filename - Preferred download filename
 */
function downloadImage(imageUrl, filename) {
  if (!imageUrl) {
    if (typeof showToast === 'function') {
      showToast('No processed image available to download.', 'error');
    }
    return;
  }

  // Create temporary anchor element for triggering browser download
  const link = document.createElement('a');
  link.href = imageUrl;
  link.download = filename || 'multimedia_processed_image.png';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  if (typeof showToast === 'function') {
    showToast('Image downloaded successfully!', 'success');
  }
}

/**
 * Initialize download module button event listener
 */
function initDownload() {
  const downloadBtn = document.getElementById('download-btn');
  if (!downloadBtn) return;

  downloadBtn.addEventListener('click', () => {
    if (!appState.resultImageUrl && typeof getProcessedResultDataUrl === 'function') {
      appState.resultImageUrl = getProcessedResultDataUrl();
    }
    if (!appState.resultImageUrl) return;

    // Generate output filename based on original file & operation
    const origName = appState.originalMetadata?.name || 'image';
    const nameWithoutExt = origName.substring(0, origName.lastIndexOf('.')) || origName;
    const opName = appState.selectedOperation || 'processed';
    const outputFilename = `multimedia_${opName}_${nameWithoutExt}.png`;

    downloadImage(appState.resultImageUrl, outputFilename);
  });
}
