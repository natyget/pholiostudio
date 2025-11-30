/**
 * Discover Page - AI Command Bar
 * Handles modal open/close, keyboard shortcuts, and AI search
 */

(function() {
  'use strict';

  // Elements
  const aiSearchInputMain = document.getElementById('ai-search-input-main');
  const aiSearchSubmit = document.getElementById('ai-search-submit');
  const queryItems = document.querySelectorAll('.discover-intelligence-modal__query-item');
  const intelligenceModal = document.getElementById('discover-intelligence-modal');
  const intelligenceBody = document.getElementById('discover-intelligence-body');
  const intelligenceContainer = intelligenceModal ? intelligenceModal.querySelector('.discover-intelligence-modal__container') : null;
  const aiSearchModal = document.getElementById('ai-search-modal');
  const modalOverlay = document.getElementById('modal-overlay');
  const modalClose = document.getElementById('ai-search-close');
  const aiSearchInput = document.getElementById('ai-search-input');
  const aiThinking = document.getElementById('ai-thinking');
  const quickTagButtons = document.querySelectorAll('.discover-modal__quick-tag');

  // Expand/Collapse State
  let isExpanded = false;

  function expandModal() {
    if (!intelligenceBody || !intelligenceContainer) return;
    isExpanded = true;
    
    // Smooth expand: remove collapsed class first, then add expanded
    intelligenceBody.classList.remove('discover-intelligence-modal__body--collapsed');
    
    // Use requestAnimationFrame to ensure smooth transition
    requestAnimationFrame(() => {
      intelligenceBody.classList.add('discover-intelligence-modal__body--expanded');
      intelligenceContainer.classList.add('is-expanded');
    });
  }

  function collapseModal() {
    if (!intelligenceBody || !intelligenceContainer) return;
    isExpanded = false;
    
    // Smooth collapse: remove expanded class first, then add collapsed
    intelligenceBody.classList.remove('discover-intelligence-modal__body--expanded');
    
    // Use requestAnimationFrame to ensure smooth transition
    requestAnimationFrame(() => {
      intelligenceBody.classList.add('discover-intelligence-modal__body--collapsed');
      // Delay border-radius change until after height collapses (150ms delay)
      setTimeout(() => {
        intelligenceContainer.classList.remove('is-expanded');
      }, 150);
    });
  }

  // Handle main search input
  if (aiSearchInputMain) {
    // Focus event - expand
    aiSearchInputMain.addEventListener('focus', () => {
      expandModal();
    });

    // Click outside to collapse - improved logic
    let clickOutsideTimeout;
    document.addEventListener('mousedown', (e) => {
      if (!intelligenceModal || !isExpanded) return;
      
      const isClickInside = intelligenceModal.contains(e.target);
      if (!isClickInside) {
        // Clear any existing timeout
        clearTimeout(clickOutsideTimeout);
        // Small delay to allow click events on suggestions to register first
        clickOutsideTimeout = setTimeout(() => {
          collapseModal();
        }, 10);
      }
    });

    // Enter key to search
    aiSearchInputMain.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        const query = aiSearchInputMain.value.trim();
        if (query) {
          performAISearch(query);
        }
      }
    });
    
    // Focus on load (optional - remove if you don't want auto-focus)
    // setTimeout(() => {
    //   aiSearchInputMain.focus();
    // }, 100);
  }

  // Submit button
  if (aiSearchSubmit && aiSearchInputMain) {
    aiSearchSubmit.addEventListener('click', () => {
      const query = aiSearchInputMain.value.trim();
      if (query) {
        performAISearch(query);
      }
    });
  }

  // Query item clicks - prevent click outside from firing
  queryItems.forEach(item => {
    item.addEventListener('mousedown', (e) => {
      e.stopPropagation(); // Prevent click outside from triggering
    });
    item.addEventListener('click', (e) => {
      e.stopPropagation(); // Prevent click outside from triggering
      const query = item.dataset.query;
      if (aiSearchInputMain) {
        aiSearchInputMain.value = query;
        aiSearchInputMain.focus();
        // Ensure modal is expanded when clicking a query
        expandModal();
      }
    });
  });

  // Chip clicks - prevent click outside from firing
  const chipElements = document.querySelectorAll('.discover-intelligence-modal__chip');
  chipElements.forEach(chip => {
    chip.addEventListener('mousedown', (e) => {
      e.stopPropagation(); // Prevent click outside from triggering
    });
    chip.addEventListener('click', (e) => {
      e.stopPropagation(); // Prevent click outside from triggering
      const chipText = chip.textContent.trim();
      if (aiSearchInputMain) {
        aiSearchInputMain.value = chipText;
        aiSearchInputMain.focus();
        expandModal();
      }
    });
  });


  // Open modal (for modal version)
  function openModal() {
    if (aiSearchModal) {
      aiSearchModal.style.display = 'flex';
      setTimeout(() => {
        if (aiSearchInput) aiSearchInput.focus();
      }, 100);
    }
  }

  // Close modal
  function closeModal() {
    if (aiSearchModal) {
      aiSearchModal.style.display = 'none';
      if (aiSearchInput) aiSearchInput.value = '';
      if (aiThinking) aiThinking.style.display = 'none';
    }
  }
  
  if (modalClose) {
    modalClose.addEventListener('click', closeModal);
  }
  
  if (modalOverlay) {
    modalOverlay.addEventListener('click', closeModal);
  }

  // Keyboard shortcut (⌘K or Ctrl+K)
  document.addEventListener('keydown', (e) => {
    // Open modal
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault();
      openModal();
    }
    
    // Close modal on Escape
    if (e.key === 'Escape' && aiSearchModal.style.display === 'flex') {
      closeModal();
    }
  });

  // Quick tag clicks
  quickTagButtons.forEach(button => {
    button.addEventListener('click', () => {
      const query = button.dataset.query;
      if (aiSearchInput) {
        aiSearchInput.value = query;
        aiSearchInput.focus();
      }
    });
  });
  
  // Enter key to search
  if (aiSearchInput) {
    aiSearchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        const query = aiSearchInput.value.trim();
        if (query) {
          performAISearch(query);
        }
      }
    });
  }

  // AI Search with debounce
  let searchTimeout;
  if (aiSearchInput) {
    aiSearchInput.addEventListener('input', (e) => {
      clearTimeout(searchTimeout);
      const query = e.target.value;
      
      if (query.length > 3) {
        searchTimeout = setTimeout(() => {
          performAISearch(query);
        }, 500);
      }
    });
  }


  // Perform AI search
  function performAISearch(query) {
    console.log('Performing AI search for:', query);
    
    // Show AI thinking animation
    if (aiThinking) {
      aiThinking.style.display = 'block';
    }
    
    // Simulate AI processing
    const profileCount = document.getElementById('profile-count');
    if (profileCount) {
      let count = 10247;
      const interval = setInterval(() => {
        count -= Math.floor(Math.random() * 100);
        profileCount.textContent = count.toLocaleString();
        if (count <= 0) {
          clearInterval(interval);
          profileCount.textContent = '0';
        }
      }, 100);
      
      // Stop after 2 seconds
      setTimeout(() => {
        clearInterval(interval);
        if (aiThinking) {
          aiThinking.style.display = 'none';
        }
        // Close modal and show results
        closeModal();
        // TODO: Display search results
      }, 2000);
    }
  }

  // Helper: Debounce function
  function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

})();
