/**
 * ============================================================================
 * Multimedia Lab - Application Core & State Management (js/app.js)
 * ============================================================================
 * Central entry point for initializing modules, managing global app state,
 * responsive mobile sidebar, and system toast notifications.
 */

// Global Application State Object
const appState = {
  originalFile: null,
  originalImageUrl: null,
  originalMetadata: null,
  resultImageUrl: null,
  selectedOperation: null,
  operationParams: {},
  processing: false,
  adjustments: {
    blur: 0,
    brightness: 0,
    contrast: 0
  }
};

/**
 * Display clean toast notifications
 * @param {string} message - Notification text
 * @param {'success' | 'error' | 'info'} type - Type of toast
 */
function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;

  const iconSvg = type === 'error'
    ? `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>`
    : `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>`;

  toast.innerHTML = `${iconSvg}<span>${message}</span>`;
  container.appendChild(toast);

  // Auto remove after 3.5 seconds
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(30px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => {
      if (toast.parentNode) toast.parentNode.removeChild(toast);
    }, 300);
  }, 3500);
}

/**
 * Mobile Sidebar Drawer Navigation
 */
function initMobileNavigation() {
  const mobileToggle = document.getElementById('mobile-toggle');
  const sidebar = document.getElementById('sidebar');
  const backdrop = document.getElementById('sidebar-backdrop');

  if (!mobileToggle || !sidebar || !backdrop) return;

  const toggleSidebar = (open) => {
    if (open) {
      sidebar.classList.add('mobile-open');
      backdrop.classList.add('active');
    } else {
      sidebar.classList.remove('mobile-open');
      backdrop.classList.remove('active');
    }
  };

  mobileToggle.addEventListener('click', () => {
    const isOpen = sidebar.classList.contains('mobile-open');
    toggleSidebar(!isOpen);
  });

  backdrop.addEventListener('click', () => {
    toggleSidebar(false);
  });
}

/**
 * Initialize main application on DOM Ready
 */
document.addEventListener('DOMContentLoaded', () => {
  console.log('🚀 Multimedia Lab Application initialized.');

  // Initialize mobile navigation
  initMobileNavigation();

  // Initialize functional sub-modules
  if (typeof initUpload === 'function') initUpload();
  if (typeof initPreview === 'function') initPreview();
  if (typeof initOperations === 'function') initOperations();
  if (typeof initDownload === 'function') initDownload();
});
