(function() {
  'use strict';

  // Initialize scroll animations when DOM is ready
  document.addEventListener('DOMContentLoaded', () => {
    initScrollAnimations();
    initPricingToggle();
  });

  // Scroll-triggered animations for pricing cards
  function initScrollAnimations() {
    const cards = document.querySelectorAll('.pricing-card');
    const comparisonItems = document.querySelectorAll('.comparison-item');

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry, index) => {
        if (entry.isIntersecting) {
          // Stagger animation for cards
          setTimeout(() => {
            entry.target.classList.add('is-visible');
          }, index * 100);
        }
      });
    }, {
      threshold: 0.2,
      rootMargin: '0px 0px -100px 0px'
    });

    cards.forEach(card => observer.observe(card));
    comparisonItems.forEach(item => observer.observe(item));
  }

  // Pricing Toggle: Monthly/Yearly
  function initPricingToggle() {
    // Handle pricing page toggle
    const pricingToggle = document.getElementById('pricing-toggle');
    if (pricingToggle) {
      console.log('[Pricing Toggle] Found pricing page toggle');
      setupToggle(pricingToggle, {
        amountSelector: '.pricing-card--pro .pricing-card__amount',
        periodSelector: '.pricing-card--pro .pricing-card__period',
        billingNoteSelector: '.pricing-card--pro .pricing-card__billing-note',
        labelContainer: pricingToggle.closest('.pricing-toggle')
      });
    } else {
      console.log('[Pricing Toggle] Pricing page toggle not found');
    }

    // Handle homepage pricing toggle
    const homepageToggle = document.getElementById('homepage-pricing-toggle');
    if (homepageToggle) {
      console.log('[Pricing Toggle] Found homepage toggle');
      setupToggle(homepageToggle, {
        amountSelector: '.homepage-pricing__card--pro .homepage-pricing__price-amount',
        periodSelector: '.homepage-pricing__card--pro .homepage-pricing__price-period',
        billingNoteSelector: '.homepage-pricing__card--pro .homepage-pricing__billing-note',
        labelContainer: homepageToggle.closest('.pricing-toggle')
      });
    } else {
      console.log('[Pricing Toggle] Homepage toggle not found');
    }
  }

  function setupToggle(toggle, config) {
    const amountEl = document.querySelector(config.amountSelector);
    const periodEl = document.querySelector(config.periodSelector);
    const billingNoteEl = document.querySelector(config.billingNoteSelector);
    const labelContainer = config.labelContainer;
    
    if (!amountEl || !periodEl || !labelContainer) {
      console.warn('[Pricing Toggle] Missing required elements:', {
        amountEl: !!amountEl,
        periodEl: !!periodEl,
        labelContainer: !!labelContainer,
        selector: config.amountSelector
      });
      return;
    }

    const monthlyLabel = labelContainer.querySelector('.pricing-toggle__label--monthly');
    const yearlyLabel = labelContainer.querySelector('.pricing-toggle__label--yearly');
    
    let isYearly = false;

    toggle.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      console.log('[Pricing Toggle] Clicked, current state:', isYearly);
      isYearly = !isYearly;
      toggle.setAttribute('aria-pressed', isYearly);
      toggle.classList.toggle('pricing-toggle__switch--active', isYearly);

      // Update label states
      if (monthlyLabel && yearlyLabel) {
        if (isYearly) {
          monthlyLabel.classList.remove('pricing-toggle__label--active');
          yearlyLabel.classList.add('pricing-toggle__label--active');
        } else {
          yearlyLabel.classList.remove('pricing-toggle__label--active');
          monthlyLabel.classList.add('pricing-toggle__label--active');
        }
      }

      // Animate price change
      if (isYearly) {
        // Fade out
        amountEl.style.opacity = '0';
        periodEl.style.opacity = '0';
        
        setTimeout(() => {
          // Update values - check if element already has $ prefix (homepage) or needs it (pricing page)
          const yearlyAmount = amountEl.dataset.yearly;
          const currentText = amountEl.textContent.trim();
          if (currentText.startsWith('$')) {
            amountEl.textContent = '$' + yearlyAmount;
          } else {
            amountEl.textContent = yearlyAmount;
          }
          periodEl.textContent = periodEl.dataset.yearly;
          if (billingNoteEl) {
            billingNoteEl.textContent = billingNoteEl.dataset.yearly;
            billingNoteEl.style.display = 'block';
          }
          
          // Fade in
          setTimeout(() => {
            amountEl.style.opacity = '1';
            periodEl.style.opacity = '1';
          }, 50);
        }, 150);
      } else {
        // Fade out
        amountEl.style.opacity = '0';
        periodEl.style.opacity = '0';
        
        setTimeout(() => {
          // Update values - check if element already has $ prefix (homepage) or needs it (pricing page)
          const monthlyAmount = amountEl.dataset.monthly;
          const currentText = amountEl.textContent.trim();
          if (currentText.startsWith('$')) {
            amountEl.textContent = '$' + monthlyAmount;
          } else {
            amountEl.textContent = monthlyAmount;
          }
          periodEl.textContent = periodEl.dataset.monthly;
          if (billingNoteEl) {
            billingNoteEl.style.display = 'none';
          }
          
          // Fade in
          setTimeout(() => {
            amountEl.style.opacity = '1';
            periodEl.style.opacity = '1';
          }, 50);
        }, 150);
      }
    });

    // Initialize: set monthly as active
    if (monthlyLabel) {
      monthlyLabel.classList.add('pricing-toggle__label--active');
    }

    // Make labels clickable too
    if (monthlyLabel) {
      monthlyLabel.addEventListener('click', () => {
        if (isYearly) {
          toggle.click();
        }
      });
    }
    if (yearlyLabel) {
      yearlyLabel.addEventListener('click', () => {
        if (!isYearly) {
          toggle.click();
        }
      });
    }

    console.log('[Pricing Toggle] Setup complete for toggle:', toggle.id);
  }
})();

