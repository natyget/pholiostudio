/**
 * Discover Page - Profile Modal Controller
 * Handles opening/closing modal and populating data
 */

(function() {
  'use strict';

  // Elements
  const modal = document.getElementById('profile-modal');
  const overlay = document.getElementById('profile-modal-overlay');
  const closeBtn = document.getElementById('profile-modal-close');
  
  // Content Elements
  const els = {
    name: document.getElementById('modal-profile-name'),
    badges: document.getElementById('modal-badges'),
    location: document.getElementById('modal-location'),
    age: document.getElementById('modal-age'),
    height: document.getElementById('modal-height'),
    image: document.getElementById('modal-image'),
    matchBadge: document.getElementById('modal-match-badge'),
    matchScore: document.getElementById('modal-match-score'),
    bust: document.getElementById('modal-bust'),
    waist: document.getElementById('modal-waist'),
    hips: document.getElementById('modal-hips'),
    shoes: document.getElementById('modal-shoes'),
    eyes: document.getElementById('modal-eyes'),
    hair: document.getElementById('modal-hair'),
    categories: document.getElementById('modal-categories'),
    bio: document.getElementById('modal-bio'),
    inviteBtn: document.getElementById('modal-invite-btn')
  };

  if (!modal) return;

  // Store profiles data (populated from server-side)
  // In a real app, this might fetch via API, but for now we'll use a global object
  // or fetch from the DOM data attributes if available
  
  // Public API to open modal
  window.openProfileModal = function(profileId) {
    console.log('Opening profile modal for:', profileId);
    
    // 1. Fetch profile data
    // For this demo, we'll try to find the profile in a global variable if it exists,
    // or simulate a fetch
    
    // Simulate loading state
    els.name.textContent = 'Loading...';
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden'; // Prevent background scrolling
    
    // Simulate API delay
    setTimeout(() => {
      // Mock data for demonstration if we can't find real data
      // In production, this would be: fetch(`/api/profiles/${profileId}`).then(...)
      const mockProfile = getMockProfile(profileId);
      populateModal(mockProfile);
    }, 300);
  };

  function closeModal() {
    modal.style.display = 'none';
    document.body.style.overflow = '';
  }

  // Event Listeners
  if (closeBtn) closeBtn.addEventListener('click', closeModal);
  if (overlay) overlay.addEventListener('click', closeModal);
  
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.style.display === 'flex') {
      closeModal();
    }
  });

  function populateModal(profile) {
    if (!profile) return;
    
    // Header
    els.name.textContent = `${profile.first_name} ${profile.last_name}`;
    
    // Badges
    els.badges.innerHTML = '';
    if (profile.is_pro) {
      els.badges.innerHTML += `<span class="profile-modal__badge profile-modal__badge--verified">✓ Verified Profile</span>`;
    }
    els.badges.innerHTML += `<span class="profile-modal__badge profile-modal__badge--status">Active</span>`;
    
    // Meta
    els.location.textContent = profile.city ? `${profile.city}, ${profile.country || ''}` : 'Location TBD';
    els.age.textContent = profile.age ? `${profile.age} Years` : '-- Years';
    
    // Height formatting
    if (profile.height_cm) {
      const feet = Math.floor(profile.height_cm / 30.48);
      const inches = Math.round((profile.height_cm % 30.48) / 2.54);
      els.height.textContent = `${feet}'${inches}"`;
    } else {
      els.height.textContent = '--';
    }
    
    // Image
    if (profile.hero_image_path) {
      els.image.src = profile.hero_image_path;
    } else if (profile.images && profile.images.length > 0) {
      els.image.src = profile.images[0].path;
    } else {
      // Placeholder
      els.image.src = 'https://via.placeholder.com/600x800?text=No+Image';
    }
    
    // Match Score
    if (profile.match_score) {
      els.matchScore.textContent = profile.match_score;
      els.matchBadge.style.display = 'block';
    } else {
      els.matchBadge.style.display = 'none';
    }
    
    // Measurements
    els.bust.textContent = profile.measurements?.bust || '--';
    els.waist.textContent = profile.measurements?.waist || '--';
    els.hips.textContent = profile.measurements?.hips || '--';
    els.shoes.textContent = profile.measurements?.shoes || '--';
    els.eyes.textContent = profile.eye_color || '--';
    els.hair.textContent = profile.hair_color || '--';
    
    // Categories
    els.categories.innerHTML = '';
    const categories = ['Editorial', 'Runway', 'Commercial']; // Mock categories
    categories.forEach(cat => {
      els.categories.innerHTML += `<span class="profile-modal__category">${cat}</span>`;
    });
    
    // Bio
    els.bio.textContent = profile.bio || 'Professional model available for bookings globally. Experienced in editorial and runway work.';
    
    // Invite Button
    els.inviteBtn.onclick = () => {
      alert(`Invitation sent to ${profile.first_name}!`);
    };
  }

  // Helper to get mock data (since we don't have a real API endpoint ready yet)
  function getMockProfile(id) {
    // Try to find in the DOM first (we can add data-json to cards later)
    const card = document.querySelector(`.discover-card[data-profile-id="${id}"]`);
    if (card) {
      const name = card.querySelector('.discover-card__name').textContent.trim().split(' ');
      const location = card.querySelector('.discover-card__location').textContent.trim();
      const stats = card.querySelectorAll('.discover-card__stat');
      const height = stats[0]?.textContent.trim();
      const age = stats[1]?.textContent.trim().replace('y', '');
      const img = card.querySelector('.discover-card__image');
      
      return {
        id: id,
        first_name: name[0],
        last_name: name.slice(1).join(' '),
        city: location.split(',')[0],
        country: location.split(',')[1] || '',
        age: age,
        height_cm: 178, // Approximate
        hero_image_path: img ? img.src : null,
        match_score: 94,
        is_pro: true,
        measurements: {
          bust: '32"',
          waist: '24"',
          hips: '34"',
          shoes: '39'
        },
        eye_color: 'Blue',
        hair_color: 'Blonde'
      };
    }
    
    // Fallback
    return {
      id: id,
      first_name: 'Elara',
      last_name: 'Vane',
      city: 'Berlin',
      country: 'Germany',
      age: 21,
      height_cm: 178,
      match_score: 94,
      is_pro: true,
      measurements: {
        bust: '32"',
        waist: '24"',
        hips: '34"',
        shoes: '39'
      },
      eye_color: 'Blue',
      hair_color: 'Blonde'
    };
  }

})();
