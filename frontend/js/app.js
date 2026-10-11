/**
 * ============================================================================
 * Multimedia Lab - Application Core & State Management (js/app.js)
 * ============================================================================
 * Central entry point for initializing modules, managing global app state,
 * media and course session navigation, mobile drawer, modals, and toasts.
 */

// Global Application State Object
const appState = {
  activeWorkspace: 'audio', // 'audio' | 'images' | 'section-placeholder'
  currentSection: 'section-01',
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
 * Close mobile sidebar if open
 */
function closeMobileSidebar() {
  const sidebar = document.getElementById('sidebar');
  const backdrop = document.getElementById('sidebar-backdrop');
  if (sidebar && sidebar.classList.contains('mobile-open')) {
    sidebar.classList.remove('mobile-open');
    if (backdrop) backdrop.classList.remove('active');
  }
}

/**
 * Switch to Home Workspace (Premium SaaS Landing)
 */
function activateHomeWorkspace() {
  appState.activeWorkspace = 'home';
  appState.currentSection = null;

  // Toggle workspace containers
  const homeWs = document.getElementById('home-workspace');
  const audioWs = document.getElementById('audio-workspace');
  const imageWs = document.getElementById('image-workspace');
  const placeholderWs = document.getElementById('section-placeholder');

  if (homeWs) homeWs.classList.remove('hidden');
  if (audioWs) audioWs.classList.add('hidden');
  if (imageWs) imageWs.classList.add('hidden');
  if (placeholderWs) placeholderWs.classList.add('hidden');

  // Update Media & Main links active state
  const navHome = document.getElementById('nav-home');
  const navImages = document.getElementById('nav-images');
  const navAudio = document.getElementById('nav-audio');
  const navHistory = document.getElementById('nav-history');

  if (navHome) navHome.classList.add('active');
  if (navImages) navImages.classList.remove('active');
  if (navAudio) navAudio.classList.remove('active');
  if (navHistory) navHistory.classList.remove('active');

  // Unset active from section links
  const sectionLinks = document.querySelectorAll('.nav-link[data-section]');
  sectionLinks.forEach(link => {
    link.classList.remove('active');
    link.setAttribute('aria-selected', 'false');
  });

  // Update Header Title & Breadcrumb
  const headerSectionTitle = document.getElementById('header-section-title');
  const headerStatusText = document.getElementById('header-status-text');
  if (headerSectionTitle) headerSectionTitle.textContent = 'Home';
  if (headerStatusText) headerStatusText.textContent = 'Welcome to Multimedia Lab';

  closeMobileSidebar();
}

/**
 * Switch to Session 01: Digital Sound Audio Workspace
 */
function activateAudioWorkspace() {
  appState.activeWorkspace = 'audio';
  appState.currentSection = 'section-01';

  // Toggle workspace containers
  const homeWs = document.getElementById('home-workspace');
  const audioWs = document.getElementById('audio-workspace');
  const imageWs = document.getElementById('image-workspace');
  const placeholderWs = document.getElementById('section-placeholder');

  if (homeWs) homeWs.classList.add('hidden');
  if (audioWs) audioWs.classList.remove('hidden');
  if (imageWs) imageWs.classList.add('hidden');
  if (placeholderWs) placeholderWs.classList.add('hidden');

  // Update Media links active state
  const navHome = document.getElementById('nav-home');
  const navImages = document.getElementById('nav-images');
  const navAudio = document.getElementById('nav-audio');
  const navHistory = document.getElementById('nav-history');

  if (navHome) navHome.classList.remove('active');
  if (navImages) navImages.classList.remove('active');
  if (navAudio) navAudio.classList.add('active');
  if (navHistory) navHistory.classList.remove('active');

  // Update Section links active state
  const sectionLinks = document.querySelectorAll('.nav-link[data-section]');
  sectionLinks.forEach(link => {
    const isTarget = link.dataset.section === 'section-01';
    if (isTarget) {
      link.classList.add('active');
      link.setAttribute('aria-selected', 'true');
    } else {
      link.classList.remove('active');
      link.setAttribute('aria-selected', 'false');
    }
  });

  // Update Header Title & Breadcrumb
  const headerSectionTitle = document.getElementById('header-section-title');
  const headerStatusText = document.getElementById('header-status-text');
  if (headerSectionTitle) headerSectionTitle.textContent = 'Session 01 — Digital Sound';
  if (headerStatusText) headerStatusText.textContent = 'Session 01 Active • Sinai University';

  // Trigger graphs rendering
  if (typeof renderAllAudioGraphs === 'function') {
    setTimeout(renderAllAudioGraphs, 50);
  }

  closeMobileSidebar();
}

/**
 * Switch to Image Processing Workspace
 */
function activateImageWorkspace() {
  appState.activeWorkspace = 'images';

  // Toggle workspace containers
  const homeWs = document.getElementById('home-workspace');
  const audioWs = document.getElementById('audio-workspace');
  const imageWs = document.getElementById('image-workspace');
  const placeholderWs = document.getElementById('section-placeholder');

  if (homeWs) homeWs.classList.add('hidden');
  if (imageWs) imageWs.classList.remove('hidden');
  if (audioWs) audioWs.classList.add('hidden');
  if (placeholderWs) placeholderWs.classList.add('hidden');

  // Update Media links active state
  const navHome = document.getElementById('nav-home');
  const navImages = document.getElementById('nav-images');
  const navAudio = document.getElementById('nav-audio');
  const navHistory = document.getElementById('nav-history');

  if (navHome) navHome.classList.remove('active');
  if (navImages) navImages.classList.add('active');
  if (navAudio) navAudio.classList.remove('active');
  if (navHistory) navHistory.classList.remove('active');

  // Unset active from section links
  const sectionLinks = document.querySelectorAll('.nav-link[data-section]');
  sectionLinks.forEach(link => {
    link.classList.remove('active');
    link.setAttribute('aria-selected', 'false');
  });

  // Update Header Title & Breadcrumb
  const headerSectionTitle = document.getElementById('header-section-title');
  const headerStatusText = document.getElementById('header-status-text');
  if (headerSectionTitle) headerSectionTitle.textContent = 'Image Operations';
  if (headerStatusText) headerStatusText.textContent = 'Image Workspace Active';

  closeMobileSidebar();
}

/**
 * Course Sessions Metadata & Configuration (Sessions 02 through 08)
 */
const SESSIONS_DATA = {
  'section-02': {
    number: '02',
    name: 'Image Operations',
    progress: '85%',
    progressText: '85% - In Progress',
    cards: ['Interactive Python Labs', 'Image Processing Algorithms', 'Visual Demos & Experiments']
  },
  'section-03': {
    number: '03',
    name: 'Image Operations',
    progress: '75%',
    progressText: '75% - In Progress',
    cards: ['Interactive Python Labs', 'Image Processing Algorithms', 'Visual Demos & Experiments']
  },
  'section-04': {
    number: '04',
    name: 'Image Operations',
    progress: '60%',
    progressText: '60% - In Progress',
    cards: ['Interactive Python Labs', 'Image Processing Algorithms', 'Visual Demos & Experiments']
  },
  'section-05': {
    number: '05',
    name: 'Image Operations',
    progress: '45%',
    progressText: '45% - In Progress',
    cards: ['Interactive Python Labs', 'Image Processing Algorithms', 'Visual Demos & Experiments']
  },
  'section-06': {
    number: '06',
    name: 'Image Operations',
    progress: '30%',
    progressText: '30% - In Progress',
    cards: ['Interactive Python Labs', 'Image Processing Algorithms', 'Visual Demos & Experiments']
  },
  'section-07': {
    number: '07',
    name: 'Image Operations',
    progress: '20%',
    progressText: '20% - In Progress',
    cards: ['Interactive Python Labs', 'Image Processing Algorithms', 'Visual Demos & Experiments']
  },
  'section-08': {
    number: '08',
    name: 'Image Operations',
    progress: '15%',
    progressText: '15% - In Progress',
    cards: ['Interactive Python Labs', 'Image Processing Algorithms', 'Visual Demos & Experiments']
  }
};

/**
 * Switch to Course Session (1 through 8)
 * @param {string} sectionId - (e.g. 'section-01', 'section-02', ..., 'section-08')
 */
function activateSection(sectionId) {
  // Session 01 is Digital Sound!
  if (sectionId === 'section-01') {
    activateAudioWorkspace();
    return;
  }

  appState.activeWorkspace = 'section-placeholder';
  appState.currentSection = sectionId;

  // Toggle workspace containers
  const homeWs = document.getElementById('home-workspace');
  const audioWs = document.getElementById('audio-workspace');
  const imageWs = document.getElementById('image-workspace');
  const placeholderWs = document.getElementById('section-placeholder');

  if (homeWs) homeWs.classList.add('hidden');
  if (placeholderWs) placeholderWs.classList.remove('hidden');
  if (audioWs) audioWs.classList.add('hidden');
  if (imageWs) imageWs.classList.add('hidden');

  // Update Media links
  const navHome = document.getElementById('nav-home');
  const navImages = document.getElementById('nav-images');
  const navAudio = document.getElementById('nav-audio');
  const navHistory = document.getElementById('nav-history');

  if (navHome) navHome.classList.remove('active');
  if (navImages) navImages.classList.remove('active');
  if (navAudio) navAudio.classList.remove('active');
  if (navHistory) navHistory.classList.remove('active');

  // Update Section links active state
  const sectionLinks = document.querySelectorAll('.nav-link[data-section]');
  sectionLinks.forEach(link => {
    const isTarget = link.dataset.section === sectionId;
    if (isTarget) {
      link.classList.add('active');
      link.setAttribute('aria-selected', 'true');
    } else {
      link.classList.remove('active');
      link.setAttribute('aria-selected', 'false');
    }
  });

  // Extract dynamic numerical session info
  const secNum = parseInt(sectionId.replace('section-', ''), 10) || 2;
  const padSecNum = String(secNum).padStart(2, '0');
  const prevSecNum = secNum - 1;
  const padPrevSecNum = String(prevSecNum).padStart(2, '0');
  const prevSectionId = `section-${padPrevSecNum}`;

  const sessionConfig = SESSIONS_DATA[sectionId] || {
    number: padSecNum,
    name: 'Image Operations',
    progress: '50%',
    progressText: '50% - In Progress',
    cards: ['Interactive Python Labs', 'Image Processing Algorithms', 'Visual Demos & Experiments']
  };

  const dynamicTitle = `Session ${padSecNum}: ${sessionConfig.name}`;
  const dynamicShortTitle = `Session ${padSecNum}`;
  const prevBtnLabel = prevSecNum === 1 ? 'Go back to Session 01' : `Go back to Session ${padPrevSecNum}`;

  // Update Header Title & Breadcrumb (e.g. Multimedia Lab / Session 03)
  const headerSectionTitle = document.getElementById('header-section-title');
  const headerStatusText = document.getElementById('header-status-text');
  if (headerSectionTitle) headerSectionTitle.textContent = dynamicShortTitle;
  if (headerStatusText) headerStatusText.textContent = `${dynamicShortTitle} (Upcoming)`;

  // Update dynamic elements in Upcoming Sessions Workspace
  const titleEl = document.getElementById('upcoming-session-title');
  const progressFill = document.getElementById('upcoming-progress-fill');
  const progressText = document.getElementById('upcoming-progress-text');
  const card1El = document.getElementById('expect-card-1-text');
  const card2El = document.getElementById('expect-card-2-text');
  const card3El = document.getElementById('expect-card-3-text');
  const prevBtn = document.getElementById('upcoming-prev-btn');
  const prevLink = document.getElementById('upcoming-link-prev');

  if (titleEl) titleEl.textContent = dynamicTitle;
  if (progressFill) progressFill.style.width = sessionConfig.progress;
  if (progressText) progressText.textContent = sessionConfig.progressText;

  if (card1El && sessionConfig.cards[0]) card1El.textContent = sessionConfig.cards[0];
  if (card2El && sessionConfig.cards[1]) card2El.textContent = sessionConfig.cards[1];
  if (card3El && sessionConfig.cards[2]) card3El.textContent = sessionConfig.cards[2];

  // Wire dynamic previous button
  if (prevBtn) {
    prevBtn.textContent = prevBtnLabel;
    prevBtn.onclick = () => {
      if (prevSecNum === 1) {
        activateAudioWorkspace();
      } else {
        activateSection(prevSectionId);
      }
    };
  }

  // Wire dynamic previous text link
  if (prevLink) {
    prevLink.onclick = (e) => {
      e.preventDefault();
      if (prevSecNum === 1) {
        activateAudioWorkspace();
      } else {
        activateSection(prevSectionId);
      }
    };
  }

  closeMobileSidebar();
}

/**
 * Initialize Hero Split Image Comparison Slider
 */
function initHeroSplitSlider() {
  const container = document.getElementById('hero-split-preview');
  const afterLayer = document.getElementById('hero-split-after');
  const divider = document.getElementById('hero-split-divider');

  if (!container || !afterLayer || !divider) return;

  let isDragging = false;

  const updateSplit = (clientX) => {
    const rect = container.getBoundingClientRect();
    if (rect.width <= 0) return;
    const offsetX = Math.max(0, Math.min(rect.width, clientX - rect.left));
    const percent = ((offsetX / rect.width) * 100).toFixed(1);

    afterLayer.style.clipPath = `inset(0 0 0 ${percent}%)`;
    divider.style.left = `${percent}%`;
  };

  container.addEventListener('mousemove', (e) => {
    updateSplit(e.clientX);
  });

  container.addEventListener('mousedown', (e) => {
    isDragging = true;
    updateSplit(e.clientX);
  });

  window.addEventListener('mouseup', () => {
    isDragging = false;
  });

  window.addEventListener('mousemove', (e) => {
    if (isDragging) updateSplit(e.clientX);
  });

  container.addEventListener('touchmove', (e) => {
    if (e.touches.length > 0) {
      updateSplit(e.touches[0].clientX);
    }
  }, { passive: true });
}

/**
 * Initialize Navigation Listeners
 */
function initNavigation() {
  // Main group buttons
  const navHome = document.getElementById('nav-home');
  const navImages = document.getElementById('nav-images');
  const navAudio = document.getElementById('nav-audio');
  const navHistory = document.getElementById('nav-history');
  const themeToggleBtn = document.getElementById('theme-toggle-btn');

  if (navHome) {
    navHome.addEventListener('click', (e) => {
      e.preventDefault();
      activateHomeWorkspace();
    });
  }

  if (navImages) {
    navImages.addEventListener('click', (e) => {
      e.preventDefault();
      activateImageWorkspace();
    });
  }

  if (navAudio) {
    navAudio.addEventListener('click', (e) => {
      e.preventDefault();
      activateAudioWorkspace();
    });
  }

  if (navHistory) {
    navHistory.addEventListener('click', (e) => {
      e.preventDefault();
      showToast('Processing history will be available in future releases.', 'info');
    });
  }

  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
      showToast('Theme set to Premium Dark SaaS Mode.', 'info');
    });
  }

  // Hero Section Action Buttons
  const heroOpenBtn = document.getElementById('hero-open-workspace-btn');
  const heroLearnMoreBtn = document.getElementById('hero-learn-more-btn');

  if (heroOpenBtn) {
    heroOpenBtn.addEventListener('click', (e) => {
      e.preventDefault();
      activateImageWorkspace();
    });
  }

  if (heroLearnMoreBtn) {
    heroLearnMoreBtn.addEventListener('click', (e) => {
      e.preventDefault();
      const featSection = document.getElementById('features-section');
      if (featSection) {
        featSection.scrollIntoView({ behavior: 'smooth' });
      }
    });
  }

  // 3 Feature Cards Navigation
  const cardImage = document.getElementById('card-feature-image');
  const cardAudio = document.getElementById('card-feature-audio');
  const cardPreview = document.getElementById('card-feature-preview');

  if (cardImage) {
    cardImage.addEventListener('click', () => activateImageWorkspace());
    cardImage.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        activateImageWorkspace();
      }
    });
  }

  if (cardAudio) {
    cardAudio.addEventListener('click', () => activateAudioWorkspace());
    cardAudio.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        activateAudioWorkspace();
      }
    });
  }

  if (cardPreview) {
    cardPreview.addEventListener('click', () => activateImageWorkspace());
    cardPreview.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        activateImageWorkspace();
      }
    });
  }

  // Course sections buttons (Section 01 - 08)
  const sectionLinks = document.querySelectorAll('.nav-link[data-section]');
  sectionLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const secId = link.dataset.section;
      if (secId) activateSection(secId);
    });

    // Keyboard navigation (Enter / Space)
    link.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        const secId = link.dataset.section;
        if (secId) activateSection(secId);
      }
    });
  });

  // Upcoming session action buttons & links
  const upcomingImagesBtn = document.getElementById('upcoming-images-btn');
  const upcomingHomeLink = document.getElementById('upcoming-link-home');

  if (upcomingImagesBtn) {
    upcomingImagesBtn.addEventListener('click', () => {
      activateImageWorkspace();
    });
  }

  if (upcomingHomeLink) {
    upcomingHomeLink.addEventListener('click', (e) => {
      e.preventDefault();
      activateHomeWorkspace();
    });
  }
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
 * Initialize Settings & Profile Modals
 */
function initModals() {
  const settingsBtn = document.getElementById('sidebar-settings-btn');
  const profileBtn = document.getElementById('sidebar-profile-btn');
  const settingsModal = document.getElementById('settings-modal');
  const profileModal = document.getElementById('profile-modal');

  const openModal = (modal) => {
    if (modal) modal.classList.remove('hidden');
  };

  const closeModal = (modal) => {
    if (modal) modal.classList.add('hidden');
  };

  if (settingsBtn && settingsModal) {
    settingsBtn.addEventListener('click', () => openModal(settingsModal));
  }

  if (profileBtn && profileModal) {
    profileBtn.addEventListener('click', () => openModal(profileModal));
  }

  // Close buttons
  const closeButtons = document.querySelectorAll('[data-close-modal]');
  closeButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const modalId = btn.dataset.closeModal;
      const modal = document.getElementById(modalId);
      if (modal) closeModal(modal);
    });
  });

  // Close on backdrop click
  [settingsModal, profileModal].forEach(modal => {
    if (!modal) return;
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal(modal);
    });
  });

  // Close on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeModal(settingsModal);
      closeModal(profileModal);
    }
  });
}

/**
 * Initialize main application on DOM Ready
 */
document.addEventListener('DOMContentLoaded', () => {
  console.log('🚀 Multimedia Lab Application initialized.');

  // Initialize navigation & modals
  initMobileNavigation();
  initNavigation();
  initModals();
  initHeroSplitSlider();

  // Initialize Audio Session 01
  if (typeof initAudioSession === 'function') {
    initAudioSession();
  }

  // Initialize functional Image sub-modules
  if (typeof initUpload === 'function') initUpload();
  if (typeof initPreview === 'function') initPreview();
  if (typeof initOperations === 'function') initOperations();
  if (typeof initDownload === 'function') initDownload();

  // Initial workspace activation: Home Workspace (Premium SaaS Landing)
  activateHomeWorkspace();
});
