/**
 * Discover Page - AI Command Bar
 * Handles modal open/close, keyboard shortcuts, and AI search
 */

(function() {
  'use strict';

  // Elements
  const commandBarTrigger = document.getElementById('command-bar-trigger');
  const aiSearchModal = document.getElementById('ai-search-modal');
  const modalOverlay = document.getElementById('modal-overlay');
  const modalClose = document.getElementById('modal-close');
  const aiSearchInput = document.getElementById('ai-search-input');
  const aiThinking = document.getElementById('ai-thinking');
  const modalTabs = document.querySelectorAll('.discover-modal__tab');
  const suggestionButtons = document.querySelectorAll('.discover-modal__suggestion');
  const submitButton = document.querySelector('.discover-modal__submit');

  if (!commandBarTrigger || !aiSearchModal) return;

  // Open modal
  function openModal() {
    aiSearchModal.style.display = 'flex';
    setTimeout(() => {
      if (aiSearchInput) aiSearchInput.focus();
    }, 100);
  }

  // Close modal
  function closeModal() {
    aiSearchModal.style.display = 'none';
    if (aiSearchInput) aiSearchInput.value = '';
    if (aiThinking) aiThinking.style.display = 'none';
  }

  // Event listeners
  commandBarTrigger.addEventListener('click', openModal);
  
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

  // Tab switching
  modalTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      // Remove active class from all tabs
      modalTabs.forEach(t => t.classList.remove('discover-modal__tab--active'));
      // Add active class to clicked tab
      tab.classList.add('discover-modal__tab--active');
      
      const tabType = tab.dataset.tab;
      console.log('Switched to tab:', tabType);
      
      // TODO: Show/hide different input types based on tab
    });
  });

  // Suggestion clicks
  suggestionButtons.forEach(button => {
    button.addEventListener('click', () => {
      const query = button.dataset.query;
      if (aiSearchInput) {
        aiSearchInput.value = query;
        aiSearchInput.focus();
      }
    });
  });

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

  // Submit button
  if (submitButton && aiSearchInput) {
    submitButton.addEventListener('click', () => {
      const query = aiSearchInput.value;
      if (query.trim()) {
        performAISearch(query);
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
