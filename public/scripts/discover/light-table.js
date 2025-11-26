/**
 * Discover Page - Light Table Controller
 * Handles selection, dock visibility, and comparison view
 */

(function() {
  'use strict';

  // Elements
  const dock = document.getElementById('light-table-dock');
  const thumbnailsContainer = document.getElementById('light-table-thumbnails');
  const countSpan = document.getElementById('selected-count');
  const clearBtn = document.getElementById('clear-selection-btn');
  const expandBtn = document.getElementById('expand-light-table');
  const modal = document.getElementById('light-table-modal');
  const closeBtn = document.getElementById('close-light-table');
  const comparisonGrid = document.getElementById('comparison-grid');
  
  // State
  let selectedProfiles = new Set();

  if (!dock) return;

  // Listen for checkbox changes (from grid-controller.js)
  document.addEventListener('change', (e) => {
    if (e.target.classList.contains('discover-card__checkbox')) {
      const profileId = e.target.dataset.profileId;
      if (e.target.checked) {
        addProfile(profileId);
      } else {
        removeProfile(profileId);
      }
    }
  });

  function addProfile(id) {
    selectedProfiles.add(id);
    updateUI();
  }

  function removeProfile(id) {
    selectedProfiles.delete(id);
    // Uncheck the box in the grid
    const checkbox = document.querySelector(`.discover-card__checkbox[data-profile-id="${id}"]`);
    if (checkbox) {
      checkbox.checked = false;
      checkbox.closest('.discover-card').classList.remove('discover-card--selected');
    }
    updateUI();
  }

  function updateUI() {
    // Update count
    if (countSpan) countSpan.textContent = selectedProfiles.size;
    
    // Show/Hide dock
    if (selectedProfiles.size > 0) {
      dock.style.display = 'block';
    } else {
      dock.style.display = 'none';
      if (modal) modal.style.display = 'none'; // Close modal if empty
    }
    
    // Update thumbnails
    renderThumbnails();
  }

  function renderThumbnails() {
    if (!thumbnailsContainer) return;
    
    thumbnailsContainer.innerHTML = '';
    
    selectedProfiles.forEach(id => {
      const profileData = getProfileData(id);
      if (profileData) {
        const thumb = document.createElement('div');
        thumb.className = 'light-table-thumbnail';
        thumb.innerHTML = `
          <img src="${profileData.image}" alt="${profileData.name}" />
          <div class="light-table-thumbnail__remove">×</div>
        `;
        
        thumb.addEventListener('click', () => removeProfile(id));
        thumbnailsContainer.appendChild(thumb);
      }
    });
  }

  // Clear Selection
  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      const ids = Array.from(selectedProfiles);
      ids.forEach(id => removeProfile(id));
    });
  }

  // Expand to Comparison View
  if (expandBtn) {
    expandBtn.addEventListener('click', () => {
      renderComparisonView();
      modal.style.display = 'flex';
      document.body.style.overflow = 'hidden';
    });
  }

  // Close Comparison View
  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      modal.style.display = 'none';
      document.body.style.overflow = '';
    });
  }

  function renderComparisonView() {
    if (!comparisonGrid) return;
    
    comparisonGrid.innerHTML = '';
    
    selectedProfiles.forEach(id => {
      const profile = getProfileData(id);
      if (profile) {
        const card = document.createElement('div');
        card.className = 'comparison-card';
        card.innerHTML = `
          <img src="${profile.image}" class="comparison-card__image" alt="${profile.name}" />
          <div class="comparison-card__info">
            <h3 class="comparison-card__name">${profile.name}</h3>
            <div class="comparison-card__meta">${profile.location} • ${profile.age}</div>
            
            <div class="comparison-card__stats">
              <div class="comparison-card__stat">
                <label>HEIGHT</label>
                <span>${profile.height}</span>
              </div>
              <div class="comparison-card__stat">
                <label>MATCH</label>
                <span>${profile.match}%</span>
              </div>
              <div class="comparison-card__stat">
                <label>EYES</label>
                <span>${profile.eyes}</span>
              </div>
              <div class="comparison-card__stat">
                <label>HAIR</label>
                <span>${profile.hair}</span>
              </div>
            </div>
            
            <div class="comparison-card__actions">
              <button class="comparison-card__btn" onclick="window.openProfileModal('${id}')">View Profile</button>
              <button class="comparison-card__btn">Invite</button>
            </div>
          </div>
        `;
        comparisonGrid.appendChild(card);
      }
    });
  }

  // Helper to get data from DOM (same as profile-modal.js)
  function getProfileData(id) {
    const card = document.querySelector(`.discover-card[data-profile-id="${id}"]`);
    if (card) {
      const name = card.querySelector('.discover-card__name').textContent.trim();
      const location = card.querySelector('.discover-card__location').textContent.trim();
      const stats = card.querySelectorAll('.discover-card__stat');
      const height = stats[0]?.textContent.trim();
      const age = stats[1]?.textContent.trim();
      const img = card.querySelector('.discover-card__image');
      
      return {
        id: id,
        name: name,
        location: location,
        age: age,
        height: height,
        image: img ? img.src : '',
        match: 94, // Mock
        eyes: 'Blue', // Mock
        hair: 'Blonde' // Mock
      };
    }
    return null;
  }

})();
