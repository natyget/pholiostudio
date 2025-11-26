/**
 * Discover Page - Grid Controller
 * Handles grid interactions, hover effects, and selection
 */

(function() {
  'use strict';

  // Elements
  const grid = document.getElementById('discover-talent-grid');
  const cards = document.querySelectorAll('.discover-card');
  const viewButtons = document.querySelectorAll('.discover-controls__view-btn');

  if (!grid) return;

  // View Toggle (Grid/List)
  viewButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      // Remove active class from all buttons
      viewButtons.forEach(b => b.classList.remove('discover-controls__view-btn--active'));
      // Add active class to clicked button
      btn.classList.add('discover-controls__view-btn--active');
      
      const view = btn.dataset.view;
      console.log('Switching to view:', view);
      
      // TODO: Implement list view layout if needed
      // For now, we just toggle classes or log
    });
  });

  // Card Selection
  cards.forEach(card => {
    const checkbox = card.querySelector('.discover-card__checkbox');
    const viewBtn = card.querySelector('.discover-card__view-btn');
    
    if (checkbox) {
      checkbox.addEventListener('change', (e) => {
        if (e.target.checked) {
          card.classList.add('discover-card--selected');
          // Trigger light table update (Phase 5)
          updateSelectionCount();
        } else {
          card.classList.remove('discover-card--selected');
          updateSelectionCount();
        }
      });
    }

    if (viewBtn) {
      viewBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const profileId = viewBtn.dataset.profileId;
        console.log('View profile:', profileId);
        // Trigger profile modal (Phase 4)
        if (window.openProfileModal) {
          window.openProfileModal(profileId);
        }
      });
    }
  });

  function updateSelectionCount() {
    const selected = document.querySelectorAll('.discover-card__checkbox:checked');
    const count = selected.length;
    console.log('Selected count:', count);
    
    // Update UI if light table exists
    const dock = document.getElementById('light-table-dock');
    const countSpan = document.getElementById('selected-count');
    
    if (dock && countSpan) {
      countSpan.textContent = count;
      if (count > 0) {
        dock.style.display = 'block';
      } else {
        dock.style.display = 'none';
      }
    }
  }

})();
