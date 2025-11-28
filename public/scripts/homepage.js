(function () {
  'use strict';

  console.log('[Pholio Homepage] Script loaded at', new Date().toISOString());

  function initUniversalHeaderMenu() {
    const menuToggle = document.querySelector('.universal-header__menu-toggle');
    const navPanel = document.getElementById('universalNav');
    const navOverlay = document.getElementById('universalNavOverlay');
    const closeButton = navPanel?.querySelector('.universal-header__close');
    const focusableSelectors = 'a[href], button:not([disabled]), textarea, input, select';
    let lastFocusedElement = null;

    if (!menuToggle || !navPanel || !navOverlay) return;

    const isOpen = () => navPanel.classList.contains('is-open');

    const trapFocus = (event) => {
      if (!isOpen()) return;
      if (event.key !== 'Tab') return;

      const focusableElements = navPanel.querySelectorAll(focusableSelectors);
      if (!focusableElements.length) return;

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (event.shiftKey) {
        if (document.activeElement === firstElement) {
          event.preventDefault();
          lastElement.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          event.preventDefault();
          firstElement.focus();
        }
      }
    };

    const openNav = () => {
      if (isOpen()) return;
      lastFocusedElement = document.activeElement;

      // Remove hidden attribute first
      navPanel.removeAttribute('hidden');
      navPanel.setAttribute('aria-hidden', 'false');
      navOverlay.removeAttribute('hidden');
      
      // Force reflow to ensure panel is visible
      navPanel.offsetHeight;
      
      // Add classes immediately to trigger animations
      navPanel.classList.add('is-open');
      navOverlay.classList.add('is-visible');
      
      document.body.classList.add('nav-open');
      menuToggle.setAttribute('aria-expanded', 'true');

      const focusable = navPanel.querySelectorAll(focusableSelectors);
      if (focusable.length) {
        setTimeout(() => focusable[0].focus(), 150);
      }
    };

    const closeNav = () => {
      if (!isOpen()) return;
      navPanel.classList.remove('is-open');
      navPanel.setAttribute('aria-hidden', 'true');
      navOverlay.classList.remove('is-visible');
      menuToggle.setAttribute('aria-expanded', 'false');
      document.body.classList.remove('nav-open');

      setTimeout(() => {
        navPanel.setAttribute('hidden', '');
        navOverlay.hidden = true;
      }, 300);

      if (lastFocusedElement && typeof lastFocusedElement.focus === 'function') {
        setTimeout(() => lastFocusedElement.focus(), 100);
      }
    };

    menuToggle.addEventListener('click', (event) => {
      event.stopPropagation();
      if (isOpen()) {
        closeNav();
      } else {
        openNav();
      }
    });

    closeButton?.addEventListener('click', (event) => {
      event.preventDefault();
      closeNav();
    });

    navOverlay.addEventListener('click', closeNav);

    navPanel.addEventListener('keydown', trapFocus);

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && isOpen()) {
        closeNav();
      }
    });

    const navLinks = navPanel.querySelectorAll('a');
    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        closeNav();
      });
    });

    window.addEventListener('resize', () => {
      if (window.innerWidth >= 1024 && isOpen()) {
        closeNav();
      }
    });

    // Swipe gesture support
    let touchStartX = 0;
    let touchStartY = 0;
    let touchEndX = 0;
    let touchEndY = 0;
    let isSwiping = false;

    navPanel.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
      touchStartY = e.changedTouches[0].screenY;
      isSwiping = false;
    }, { passive: true });

    navPanel.addEventListener('touchmove', (e) => {
      if (!isOpen()) return;
      touchEndX = e.changedTouches[0].screenX;
      touchEndY = e.changedTouches[0].screenY;
      
      const deltaX = touchEndX - touchStartX;
      const deltaY = Math.abs(touchEndY - touchStartY);
      
      // Only consider horizontal swipes
      if (Math.abs(deltaX) > 10 && Math.abs(deltaX) > deltaY) {
        isSwiping = true;
        // Only allow swiping left (to close)
        if (deltaX < 0) {
          const panelWidth = navPanel.offsetWidth;
          const swipePercent = Math.abs(deltaX) / panelWidth;
          const translateX = Math.max(0, Math.min(100, swipePercent * 100));
          
          // Apply transform during swipe
          navPanel.style.transform = `translateX(${translateX}%)`;
          navOverlay.style.opacity = String(1 - swipePercent * 0.5);
        }
      }
    }, { passive: true });

    navPanel.addEventListener('touchend', (e) => {
      if (!isOpen() || !isSwiping) {
        navPanel.style.transform = '';
        navOverlay.style.opacity = '';
        return;
      }

      touchEndX = e.changedTouches[0].screenX;
      const deltaX = touchEndX - touchStartX;
      const panelWidth = navPanel.offsetWidth;
      const swipePercent = Math.abs(deltaX) / panelWidth;

      // Reset transform
      navPanel.style.transform = '';
      navOverlay.style.opacity = '';

      // Close if swiped more than 30% of panel width
      if (deltaX < 0 && swipePercent > 0.3) {
        closeNav();
      } else {
        // Snap back if not enough swipe
        navPanel.classList.add('is-open');
      }

      isSwiping = false;
    }, { passive: true });
  }

  function initHeaderScroll() {
    const header = document.querySelector('.universal-header--homepage') || document.querySelector('.universal-header');
    if (!header) return;

    let ticking = false;

    function updateHeader() {
      const currentScroll = window.pageYOffset || document.documentElement.scrollTop;

      if (currentScroll > 50) {
        if (!header.classList.contains('scrolled')) {
          header.classList.add('scrolled');
        }
      } else {
        if (header.classList.contains('scrolled')) {
          header.classList.remove('scrolled');
        }
      }

      ticking = false;
    }

    window.addEventListener('scroll', () => {
      if (!ticking) {
        window.requestAnimationFrame(updateHeader);
        ticking = true;
      }
    }, { passive: true });

    updateHeader();
  }

  // Transformation Hero Animation with Interactive Slider
  function initTransformationHero() {
    const heroSection = document.getElementById('transformation-hero');
    if (!heroSection) return;

    const rawDocument = heroSection.querySelector('.email-draft');
    const portfolioCard = heroSection.querySelector('.portfolio-card');
    const transformationZone = document.getElementById('transformation-zone');
    const replayButton = document.getElementById('replay-transformation');
    const slider = document.getElementById('transformation-slider');
    const sliderFill = document.getElementById('transformation-slider-fill');
    const sliderThumb = document.getElementById('transformation-slider-thumb');
    const sliderPercentage = document.getElementById('transformation-percentage');
    const playPauseBtn = document.getElementById('transformation-play-pause');
    const playIcon = playPauseBtn?.querySelector('.transformation-hero__slider-icon--play');
    const pauseIcon = playPauseBtn?.querySelector('.transformation-hero__slider-icon--pause');
    const progressFill = document.getElementById('transformation-progress-fill');
    const progressSteps = document.querySelectorAll('.transformation-zone__progress-step');

    if (!rawDocument || !portfolioCard || !transformationZone || !slider) return;

    let isAnimating = false;
    let isPlaying = false;
    let animationFrameId = null;
    let currentProgress = 0;
    const EMAIL_SHOW_DURATION = 2000; // Show email for 2 seconds
    const BUILD_DURATION = 4000; // Portfolio build takes 4 seconds
    const TOTAL_DURATION = EMAIL_SHOW_DURATION + BUILD_DURATION;
    
    // Animation timeline (percentage -> function to execute)
    const animationTimeline = [
      { progress: 0, step: 0, label: 'Analyzing bio' },
      { progress: 25, step: 1, label: 'Organizing stats' },
      { progress: 50, step: 2, label: 'Formatting presentation' },
      { progress: 75, step: 3, label: 'Finalizing portfolio' },
      { progress: 100, step: 4, label: 'Complete' }
    ];


    // Update slider visual
    function updateSlider(progress) {
      if (sliderFill) sliderFill.style.width = `${progress}%`;
      if (sliderThumb) sliderThumb.style.left = `${progress}%`;
      if (sliderPercentage) sliderPercentage.textContent = `${Math.round(progress)}%`;
      if (slider) slider.value = progress;
    }

    // Update progress indicators
    function updateProgress(progress) {
      if (progressFill) progressFill.style.width = `${progress}%`;
      
      // Update step indicators
      progressSteps.forEach((step, index) => {
        const stepProgress = (index + 1) * 25;
        step.classList.remove('active', 'completed');
        
        if (progress >= stepProgress) {
          step.classList.add('completed');
        } else if (progress >= stepProgress - 25) {
          step.classList.add('active');
        }
      });
    }

    // Apply transformation state based on progress (0-100)
    function applyTransformationState(progress) {
      const time = (progress / 100) * TOTAL_DURATION;
      const isEmailPhase = time < EMAIL_SHOW_DURATION;
      const buildProgress = Math.max(0, (time - EMAIL_SHOW_DURATION) / BUILD_DURATION);
      
      // Determine current step based on progress
      let currentStep = 0;
      if (progress >= 0 && progress < 25) currentStep = 1; // Analyzing
      else if (progress >= 25 && progress < 50) currentStep = 2; // Organizing
      else if (progress >= 50 && progress < 75) currentStep = 3; // Formatting
      else if (progress >= 75) currentStep = 4; // Finalizing
      
      // Email fade out
      if (!isEmailPhase) {
        const emailFields = rawDocument.querySelectorAll('.email-draft__field-value, .email-draft__subject');
        const emailBody = rawDocument.querySelector('.email-draft__body-content');
        const fadeProgress = Math.min(1, (time - EMAIL_SHOW_DURATION) / 1000);
        
        emailFields.forEach((el, index) => {
          el.style.opacity = String(1 - fadeProgress * 0.8);
          el.style.transform = `translateX(${-15 * fadeProgress}px)`;
        });
        
        if (emailBody) {
          emailBody.style.opacity = String(1 - fadeProgress * 0.85);
        }
      }

      // Portfolio card animation based on steps
      const skeleton = portfolioCard.querySelector('.portfolio-card__skeleton');
      const heroImage = portfolioCard.querySelector('.portfolio-card__hero-image');
      const heroImg = portfolioCard.querySelector('.portfolio-card__hero-image img');
      const freeBadge = portfolioCard.querySelector('.portfolio-card__free-badge');
      const header = portfolioCard.querySelector('.portfolio-card__header');
      const statsSection = portfolioCard.querySelector('.portfolio-card__stats-section');
      const social = portfolioCard.querySelector('.portfolio-card__social');
      const urlFooter = portfolioCard.querySelector('.portfolio-card__url-footer');
      
      if (buildProgress > 0) {
        transformationZone.classList.add('animating');
        
        // Step 1: Analyzing - Show skeleton, hide all content
        if (currentStep === 1) {
          if (skeleton) skeleton.style.opacity = '1';
          if (heroImage) heroImage.style.opacity = '0';
          if (header) header.style.opacity = '0';
          if (statsSection) statsSection.style.opacity = '0';
          if (social) social.style.opacity = '0';
          if (urlFooter) urlFooter.style.opacity = '0';
        }
        
        // Step 2: Organizing - Hide skeleton, fade in header
        if (currentStep >= 2) {
          if (skeleton) skeleton.style.opacity = '0';
          if (header) {
            const headerProgress = currentStep === 2 ? Math.min(1, (progress - 25) / 25) : 1;
            header.style.opacity = String(headerProgress);
            header.style.transform = `translateY(${-20 * (1 - headerProgress)}px)`;
          }
        }
        
        // Step 3: Formatting - Slide up stats grid
        if (currentStep >= 3) {
          if (statsSection) {
            const statsProgress = currentStep === 3 ? Math.min(1, (progress - 50) / 25) : 1;
            statsSection.style.opacity = String(statsProgress);
            statsSection.style.transform = `translateY(${30 * (1 - statsProgress)}px)`;
          }
        }
        
        // Step 4: Finalizing - Fade in image, badge, social, footer
        if (currentStep >= 4) {
          const finalProgress = currentStep === 4 ? Math.min(1, (progress - 75) / 25) : 1;
          
          if (heroImage) {
            heroImage.style.opacity = String(finalProgress);
            heroImage.style.transform = `scale(${0.95 + 0.05 * finalProgress})`;
          }
          
          if (heroImg) {
            const brightness = 0.7 + 0.3 * finalProgress;
            const contrast = 0.8 + 0.2 * finalProgress;
            const grayscale = 0.3 * (1 - finalProgress);
            heroImg.style.filter = `brightness(${brightness}) contrast(${contrast}) grayscale(${grayscale})`;
          }
          
          if (freeBadge) {
            freeBadge.style.opacity = String(finalProgress);
            freeBadge.style.transform = `translateY(${-10 * (1 - finalProgress)}px)`;
          }
          
          if (social) {
            social.style.opacity = String(finalProgress);
            social.style.transform = `translateY(${10 * (1 - finalProgress)}px)`;
          }
          
          if (urlFooter) {
            urlFooter.style.opacity = String(finalProgress);
            urlFooter.style.transform = `translateY(${10 * (1 - finalProgress)}px)`;
          }
        }
      } else {
        transformationZone.classList.remove('animating');
        // Reset all to hidden
        if (skeleton) skeleton.style.opacity = '1';
        if (heroImage) heroImage.style.opacity = '0';
        if (header) header.style.opacity = '0';
        if (statsSection) statsSection.style.opacity = '0';
        if (social) social.style.opacity = '0';
        if (urlFooter) urlFooter.style.opacity = '0';
      }
    }

    // Animate transformation
    function animateTransformation() {
      if (!isPlaying) return;
      
      const startTime = performance.now() - (currentProgress / 100) * TOTAL_DURATION;
      
      function frame(currentTime) {
        if (!isPlaying) {
          if (animationFrameId) cancelAnimationFrame(animationFrameId);
          return;
        }
        
        const elapsed = currentTime - startTime;
        const newProgress = Math.min(100, (elapsed / TOTAL_DURATION) * 100);
        
        currentProgress = newProgress;
        updateSlider(newProgress);
        updateProgress(newProgress);
        applyTransformationState(newProgress);
        
        if (newProgress < 100) {
          animationFrameId = requestAnimationFrame(frame);
        } else {
          isPlaying = false;
          if (playIcon) playIcon.style.display = 'none';
          if (pauseIcon) pauseIcon.style.display = 'block';
          transformationZone.classList.remove('animating');
          if (replayButton) replayButton.classList.add('visible');
        }
      }
      
      animationFrameId = requestAnimationFrame(frame);
    }

    // Play/pause toggle
    function togglePlayPause() {
      isPlaying = !isPlaying;
      
      if (isPlaying) {
        if (playIcon) playIcon.style.display = 'none';
        if (pauseIcon) pauseIcon.style.display = 'block';
        animateTransformation();
      } else {
        if (playIcon) playIcon.style.display = 'block';
        if (pauseIcon) pauseIcon.style.display = 'none';
        if (animationFrameId) cancelAnimationFrame(animationFrameId);
      }
    }

    // Slider input handler
    function handleSliderInput() {
      isPlaying = false;
      if (playIcon) playIcon.style.display = 'block';
      if (pauseIcon) pauseIcon.style.display = 'none';
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
      
      const progress = parseFloat(slider.value);
      currentProgress = progress;
      updateSlider(progress);
      updateProgress(progress);
      applyTransformationState(progress);
    }

    // Setup event listeners
    if (playPauseBtn) {
      playPauseBtn.addEventListener('click', togglePlayPause);
    }

    if (slider) {
      slider.addEventListener('input', handleSliderInput);
      slider.addEventListener('change', handleSliderInput);
    }

    // Reset function
    function resetTransformation() {
      isPlaying = false;
      currentProgress = 0;
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
      if (playIcon) playIcon.style.display = 'block';
      if (pauseIcon) pauseIcon.style.display = 'none';
      
      // Reset all states
      updateSlider(0);
      updateProgress(0);
      applyTransformationState(0);
      
      // Reset email
      const emailFields = rawDocument.querySelectorAll('.email-draft__field-value, .email-draft__subject');
      const emailBody = rawDocument.querySelector('.email-draft__body-content');
      emailFields.forEach(el => {
        el.style.opacity = '1';
        el.style.transform = 'translateX(0)';
      });
      if (emailBody) emailBody.style.opacity = '1';
      
      // Reset portfolio card to initial state
      const skeleton = portfolioCard.querySelector('.portfolio-card__skeleton');
      const heroImage = portfolioCard.querySelector('.portfolio-card__hero-image');
      const header = portfolioCard.querySelector('.portfolio-card__header');
      const statsSection = portfolioCard.querySelector('.portfolio-card__stats-section');
      const social = portfolioCard.querySelector('.portfolio-card__social');
      const urlFooter = portfolioCard.querySelector('.portfolio-card__url-footer');
      const heroImg = portfolioCard.querySelector('.portfolio-card__hero-image img');
      const freeBadge = portfolioCard.querySelector('.portfolio-card__free-badge');
      
      if (skeleton) skeleton.style.opacity = '1';
      if (heroImage) heroImage.style.opacity = '0';
      if (header) {
        header.style.opacity = '0';
        header.style.transform = 'translateY(-20px)';
      }
      if (statsSection) {
        statsSection.style.opacity = '0';
        statsSection.style.transform = 'translateY(30px)';
      }
      if (social) {
        social.style.opacity = '0';
        social.style.transform = 'translateY(10px)';
      }
      if (urlFooter) {
        urlFooter.style.opacity = '0';
        urlFooter.style.transform = 'translateY(10px)';
      }
      if (heroImg) {
        heroImg.style.filter = 'brightness(0.7) contrast(0.8) grayscale(0.3)';
      }
      if (freeBadge) {
        freeBadge.style.opacity = '0';
        freeBadge.style.transform = 'translateY(-10px)';
      }
      
      // Hide replay button
      if (replayButton) replayButton.classList.remove('visible');
      
      // Auto-play after reset
      setTimeout(() => {
        isPlaying = true;
        if (playIcon) playIcon.style.display = 'none';
        if (pauseIcon) pauseIcon.style.display = 'block';
        animateTransformation();
      }, 500);
    }

    if (replayButton) {
      replayButton.addEventListener('click', (e) => {
        e.preventDefault();
        resetTransformation();
      });
    }

    // Initial state - Show skeleton, hide all content
    const skeleton = portfolioCard.querySelector('.portfolio-card__skeleton');
    const heroImage = portfolioCard.querySelector('.portfolio-card__hero-image');
    const header = portfolioCard.querySelector('.portfolio-card__header');
    const statsSection = portfolioCard.querySelector('.portfolio-card__stats-section');
    const social = portfolioCard.querySelector('.portfolio-card__social');
    const urlFooter = portfolioCard.querySelector('.portfolio-card__url-footer');
    const heroImg = portfolioCard.querySelector('.portfolio-card__hero-image img');
    const freeBadge = portfolioCard.querySelector('.portfolio-card__free-badge');
    
    if (skeleton) skeleton.style.opacity = '1';
    if (heroImage) heroImage.style.opacity = '0';
    if (header) {
      header.style.opacity = '0';
      header.style.transform = 'translateY(-20px)';
      header.style.transition = 'opacity 0.7s ease, transform 0.7s ease';
    }
    if (statsSection) {
      statsSection.style.opacity = '0';
      statsSection.style.transform = 'translateY(30px)';
      statsSection.style.transition = 'opacity 0.7s ease, transform 0.7s ease';
    }
    if (social) {
      social.style.opacity = '0';
      social.style.transform = 'translateY(10px)';
      social.style.transition = 'opacity 0.7s ease, transform 0.7s ease';
    }
    if (urlFooter) {
      urlFooter.style.opacity = '0';
      urlFooter.style.transform = 'translateY(10px)';
      urlFooter.style.transition = 'opacity 0.7s ease, transform 0.7s ease';
    }
    if (heroImage) {
      heroImage.style.transition = 'opacity 0.7s ease, transform 0.7s ease';
    }
    if (heroImg) {
      heroImg.style.filter = 'brightness(0.7) contrast(0.8) grayscale(0.3)';
      heroImg.style.transition = 'filter 0.7s ease';
    }
    if (freeBadge) {
      freeBadge.style.opacity = '0';
      freeBadge.style.transform = 'translateY(-10px)';
      freeBadge.style.transition = 'opacity 0.7s ease, transform 0.7s ease';
    }

    // Initialize
    updateSlider(0);
    updateProgress(0);
    applyTransformationState(0);

    // Auto-start after email show duration
    setTimeout(() => {
      isPlaying = true;
      if (playIcon) playIcon.style.display = 'none';
      if (pauseIcon) pauseIcon.style.display = 'block';
      animateTransformation();
    }, EMAIL_SHOW_DURATION);
  }

  // Portfolio Showcase Grid Scroll Animations
  function initPortfolioShowcaseAnimations() {
    const showcaseSection = document.getElementById('homepage-portfolio-showcase');
    if (!showcaseSection) return;

    const cards = showcaseSection.querySelectorAll('.homepage-portfolio-showcase__card');
    if (cards.length === 0) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry, index) => {
        if (entry.isIntersecting) {
          // Stagger animation
          setTimeout(() => {
            entry.target.classList.add('visible');
          }, index * 80);
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    });

    cards.forEach(card => {
      observer.observe(card);
    });
  }

  // Portfolio Lightbox Dialog
  function initPortfolioLightbox() {
    const lightbox = document.getElementById('portfolio-lightbox');
    const overlay = document.getElementById('portfolio-lightbox-overlay');
    const closeBtn = document.getElementById('portfolio-lightbox-close');
    const cards = document.querySelectorAll('.homepage-portfolio-showcase__card');
    const carouselTrack = document.getElementById('portfolio-carousel-track');
    const thumbnailsContainer = document.getElementById('portfolio-lightbox-thumbnails');
    const prevBtn = document.getElementById('portfolio-carousel-prev');
    const nextBtn = document.getElementById('portfolio-carousel-next');
    const currentIndicator = document.getElementById('portfolio-carousel-current');
    const totalIndicator = document.getElementById('portfolio-carousel-total');
    const titleEl = document.getElementById('portfolio-lightbox-title');
    const metaEl = document.getElementById('portfolio-lightbox-meta');
    const infoEl = document.getElementById('portfolio-lightbox-info');
    const ctaEl = document.getElementById('portfolio-lightbox-cta');

    if (!lightbox || !cards.length) return;

    let currentIndex = 0;
    let currentTalent = null;
    let images = [];

    // Generate placeholder images for demo (in real app, fetch from API)
    function generatePlaceholderImages(talent) {
      const baseImages = [
        talent.hero_image,
        'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=900&q=80',
        'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=900&q=80',
        'https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?auto=format&fit=crop&w=900&q=80'
      ];
      return baseImages;
    }

    function openLightbox(talent, index) {
      currentTalent = talent;
      currentIndex = 0;
      images = generatePlaceholderImages(talent);

      // Update title and meta
      if (titleEl) titleEl.textContent = talent.name;
      if (metaEl) metaEl.textContent = talent.city;

      // Populate carousel
      if (carouselTrack) {
        carouselTrack.innerHTML = '';
        images.forEach((img, idx) => {
          const slide = document.createElement('div');
          slide.className = 'portfolio-lightbox__carousel-slide';
          const imgEl = document.createElement('img');
          imgEl.src = img;
          imgEl.alt = `${talent.name} - Image ${idx + 1}`;
          imgEl.loading = 'lazy';
          slide.appendChild(imgEl);
          carouselTrack.appendChild(slide);
        });
      }

      // Populate thumbnails
      if (thumbnailsContainer) {
        thumbnailsContainer.innerHTML = '';
        images.forEach((img, idx) => {
          const thumb = document.createElement('button');
          thumb.className = 'portfolio-lightbox__thumbnail';
          if (idx === 0) thumb.classList.add('active');
          thumb.setAttribute('data-index', idx);
          thumb.setAttribute('aria-label', `View image ${idx + 1}`);
          const imgEl = document.createElement('img');
          imgEl.src = img;
          imgEl.alt = `Thumbnail ${idx + 1}`;
          thumb.appendChild(imgEl);
          thumb.addEventListener('click', () => goToSlide(idx));
          thumbnailsContainer.appendChild(thumb);
        });
      }

      // Update indicators
      if (totalIndicator) totalIndicator.textContent = images.length;
      updateCarousel();

      // Populate info (placeholder stats)
      if (infoEl) {
        infoEl.innerHTML = `
          <div class="portfolio-lightbox__info-item">
            <span class="portfolio-lightbox__info-label">Height</span>
            <span class="portfolio-lightbox__info-value">180 cm</span>
          </div>
          <div class="portfolio-lightbox__info-item">
            <span class="portfolio-lightbox__info-label">Measurements</span>
            <span class="portfolio-lightbox__info-value">32-25-35</span>
          </div>
          <div class="portfolio-lightbox__info-item">
            <span class="portfolio-lightbox__info-label">Location</span>
            <span class="portfolio-lightbox__info-value">${talent.city}</span>
          </div>
        `;
      }

      // Update CTA link
      if (ctaEl && talent.slug) {
        ctaEl.href = `/portfolio/${talent.slug}`;
      }

      // Show lightbox
      lightbox.removeAttribute('hidden');
      lightbox.classList.add('is-open');
      document.body.style.overflow = 'hidden';

      // Focus management
      if (closeBtn) closeBtn.focus();
    }

    function closeLightbox() {
      lightbox.classList.remove('is-open');
      document.body.style.overflow = '';
      setTimeout(() => {
        lightbox.setAttribute('hidden', '');
      }, 300);
    }

    function updateCarousel() {
      if (!carouselTrack) return;
      
      const translateX = -currentIndex * 100;
      carouselTrack.style.transform = `translateX(${translateX}%)`;

      // Update indicators
      if (currentIndicator) currentIndicator.textContent = currentIndex + 1;

      // Update thumbnail active state
      const thumbnails = thumbnailsContainer?.querySelectorAll('.portfolio-lightbox__thumbnail');
      thumbnails?.forEach((thumb, idx) => {
        thumb.classList.toggle('active', idx === currentIndex);
      });

      // Update button states
      if (prevBtn) prevBtn.disabled = currentIndex === 0;
      if (nextBtn) nextBtn.disabled = currentIndex === images.length - 1;
    }

    function goToSlide(index) {
      if (index < 0 || index >= images.length) return;
      currentIndex = index;
      updateCarousel();
    }

    function nextSlide() {
      if (currentIndex < images.length - 1) {
        goToSlide(currentIndex + 1);
      }
    }

    function prevSlide() {
      if (currentIndex > 0) {
        goToSlide(currentIndex - 1);
      }
    }

    // Event listeners
    cards.forEach((card, index) => {
      card.addEventListener('click', (e) => {
        e.preventDefault(); // Prevent default link navigation
        const talent = {
          name: card.getAttribute('data-talent-name') || 'Talent',
          city: card.getAttribute('data-talent-city') || '',
          slug: card.getAttribute('data-talent-slug') || '',
          hero_image: card.getAttribute('data-talent-image') || ''
        };
        openLightbox(talent, index);
      });
    });

    if (closeBtn) {
      closeBtn.addEventListener('click', closeLightbox);
    }

    if (overlay) {
      overlay.addEventListener('click', closeLightbox);
    }

    if (prevBtn) {
      prevBtn.addEventListener('click', prevSlide);
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', nextSlide);
    }

    // Keyboard navigation
    lightbox.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        closeLightbox();
      } else if (e.key === 'ArrowLeft') {
        prevSlide();
      } else if (e.key === 'ArrowRight') {
        nextSlide();
      }
    });

    // Prevent body scroll when lightbox is open
    const observer = new MutationObserver(() => {
      if (lightbox.classList.contains('is-open')) {
        document.body.style.overflow = 'hidden';
      } else {
        document.body.style.overflow = '';
      }
    });

    observer.observe(lightbox, { attributes: true, attributeFilter: ['class'] });
  }

  // Scroll-triggered animations for other sections
  function initScrollAnimations() {
    const sections = document.querySelectorAll('.homepage-value-prop, .homepage-testimonials, .homepage-agency, .homepage-cta');
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -100px 0px'
    });

    sections.forEach(section => {
      section.style.opacity = '0';
      section.style.transform = 'translateY(30px)';
      section.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
      observer.observe(section);
    });
  }

  // Reduced motion support
  function respectReducedMotion() {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    if (prefersReducedMotion) {
      // Disable animations
      const style = document.createElement('style');
      style.textContent = `
        .transformation-zone__particles,
        .transformation-zone__flow,
        .homepage-value-prop__icon,
        .homepage-portfolio-showcase__card {
          animation: none !important;
          transition: none !important;
        }
      `;
      document.head.appendChild(style);
    }
  }

  function initUniversalHeaderUserMenu() {
    const userMenuButton = document.getElementById('universal-user-menu-button');
    const userMenu = document.getElementById('universal-user-menu');
    const userDropdown = userMenuButton?.closest('.universal-header__user-dropdown');
    
    if (!userMenuButton || !userMenu || !userDropdown) return;
    
    // Toggle dropdown on button click
    userMenuButton.addEventListener('click', function(e) {
      e.stopPropagation();
      const isExpanded = userDropdown.getAttribute('aria-expanded') === 'true';
      userDropdown.setAttribute('aria-expanded', !isExpanded);
      userMenuButton.setAttribute('aria-expanded', !isExpanded);
    });
    
    // Close dropdown when clicking outside
    document.addEventListener('click', function(e) {
      if (!userDropdown.contains(e.target)) {
        userDropdown.setAttribute('aria-expanded', 'false');
        userMenuButton.setAttribute('aria-expanded', 'false');
      }
    });

    // Close dropdown on Escape key
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape' && userDropdown.getAttribute('aria-expanded') === 'true') {
        userDropdown.setAttribute('aria-expanded', 'false');
        userMenuButton.setAttribute('aria-expanded', 'false');
      }
    });
  }

  // Dashboard Showcase Interactive Features
  function initDashboardShowcase() {
    const showcase = document.getElementById('dashboard-showcase');
    if (!showcase) {
      console.log('[Dashboard Showcase] Section not found');
      return;
    }

    console.log('[Dashboard Showcase] Initializing browser windows...');

    // Accordion functionality for talent dashboard preview
    const accordionHeaders = showcase.querySelectorAll('.dashboard-preview--talent .talent-accordion__header');
    accordionHeaders.forEach(header => {
      header.addEventListener('click', (e) => {
        e.preventDefault();
        const item = header.closest('.talent-accordion__item');
        if (!item) return;
        
        const isExpanded = item.classList.contains('talent-accordion__item--expanded');
        
        // Close all items
        showcase.querySelectorAll('.talent-accordion__item').forEach(i => {
          i.classList.remove('talent-accordion__item--expanded');
          i.setAttribute('aria-expanded', 'false');
        });
        
        // Toggle current item
        if (!isExpanded) {
          item.classList.add('talent-accordion__item--expanded');
          item.setAttribute('aria-expanded', 'true');
        }
      });
    });

    // Browser window hover effects
    const browserWindows = showcase.querySelectorAll('.browser-window');
    browserWindows.forEach(window => {
      window.addEventListener('mouseenter', function() {
        this.style.transform = 'translateY(-4px)';
      });
      
      window.addEventListener('mouseleave', function() {
        this.style.transform = 'translateY(0)';
      });
    });

    // Note: Old intersection observer and animation code removed - simplified for side-by-side layout

    // Interactive media grid items
    const mediaItems = showcase.querySelectorAll('.dashboard-showcase__media-item');
    mediaItems.forEach((item, index) => {
      item.addEventListener('mouseenter', function() {
        this.style.transform = 'translateY(-4px) scale(1.02)';
        this.style.zIndex = '10';
      });
      
      item.addEventListener('mouseleave', function() {
        this.style.transform = 'translateY(0) scale(1)';
        this.style.zIndex = '1';
      });
    });

    // Interactive talent cards
    const talentCards = showcase.querySelectorAll('.dashboard-showcase__talent-card');
    talentCards.forEach(card => {
      card.addEventListener('mouseenter', function() {
        this.style.transform = 'translateY(-4px)';
      });
      
      card.addEventListener('mouseleave', function() {
        this.style.transform = 'translateY(0)';
      });
    });

    // Analytics cards pulse effect
    const analyticsCards = showcase.querySelectorAll('.dashboard-showcase__analytics-card');
    analyticsCards.forEach((card, index) => {
      card.addEventListener('mouseenter', function() {
        this.style.transform = 'translateY(-2px)';
      });
      
      card.addEventListener('mouseleave', function() {
        this.style.transform = 'translateY(0)';
      });
    });

    // Button interactions
    const buttons = showcase.querySelectorAll('.dashboard-showcase__button');
    buttons.forEach(button => {
      button.addEventListener('mouseenter', function() {
        if (this.classList.contains('dashboard-showcase__button--primary')) {
          this.style.transform = 'translateY(-2px)';
        } else if (this.classList.contains('dashboard-showcase__button--accent')) {
          this.style.transform = 'translateY(-2px)';
        }
      });
      
      button.addEventListener('mouseleave', function() {
        this.style.transform = 'translateY(0)';
      });
    });

    // CTA link interactions
    const ctaLinks = showcase.querySelectorAll('.dashboard-showcase__cta-link');
    ctaLinks.forEach(link => {
      link.addEventListener('mouseenter', function() {
        this.style.transform = 'translateY(-2px)';
        const svg = this.querySelector('svg');
        if (svg) {
          svg.style.transform = 'translateX(4px)';
        }
      });
      
      link.addEventListener('mouseleave', function() {
        this.style.transform = 'translateY(0)';
        const svg = this.querySelector('svg');
        if (svg) {
          svg.style.transform = 'translateX(0)';
        }
      });
    });

    // Filter inputs focus effects
    const filterInputs = showcase.querySelectorAll('.dashboard-showcase__filter-input, .dashboard-showcase__filter-select');
    filterInputs.forEach(input => {
      input.addEventListener('focus', function() {
        this.parentElement.style.transform = 'scale(1.02)';
      });
      
      input.addEventListener('blur', function() {
        this.parentElement.style.transform = 'scale(1)';
      });
    });
  }

  // Command Palette Demo
  function initCommandPaletteDemo() {
    const trigger = document.getElementById('homepage-command-palette-trigger');
    const modal = document.getElementById('homepage-command-palette-modal');
    const input = document.getElementById('homepage-command-palette-input');
    const overlay = modal?.querySelector('.agency-command-palette-demo__overlay');
    const items = modal?.querySelectorAll('.agency-command-palette-demo__item');
    
    if (!trigger || !modal || !input) return;
    
    let selectedIndex = 0;
    
    function openModal() {
      modal.removeAttribute('hidden');
      setTimeout(() => {
        input.focus();
      }, 100);
      selectedIndex = 0;
      updateSelection();
    }
    
    function closeModal() {
      modal.setAttribute('hidden', '');
      input.value = '';
      selectedIndex = 0;
      updateSelection();
    }
    
    function updateSelection() {
      items.forEach((item, index) => {
        if (index === selectedIndex) {
          item.classList.add('agency-command-palette-demo__item--active');
        } else {
          item.classList.remove('agency-command-palette-demo__item--active');
        }
      });
    }
    
    function navigateItems(direction) {
      if (direction === 'down') {
        selectedIndex = (selectedIndex + 1) % items.length;
      } else {
        selectedIndex = (selectedIndex - 1 + items.length) % items.length;
      }
      updateSelection();
    }
    
    trigger.addEventListener('click', openModal);
    overlay?.addEventListener('click', closeModal);
    
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        closeModal();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        navigateItems('down');
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        navigateItems('up');
      } else if (e.key === 'Enter') {
        e.preventDefault();
        // Just close for demo purposes
        closeModal();
      }
    });
    
    // Keyboard shortcut: Cmd/Ctrl + K
    document.addEventListener('keydown', (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (modal.hasAttribute('hidden')) {
          openModal();
        } else {
          closeModal();
        }
      }
    });
  }

  // Agency Dashboard Preview
  function initAgencyDashboardPreview() {
    const preview = document.querySelector('.agency-dashboard-preview');
    if (!preview) return;

    // Intersection Observer for scroll-triggered animations
    const observerOptions = {
      threshold: 0.2,
      rootMargin: '0px 0px -50px 0px'
    };

    // Animate counter function (reuse from dashboard showcase)
    function animateCounter(element, target, suffix = '') {
      let current = 0;
      const duration = 2000; // 2 seconds
      const increment = target / (duration / 16); // 60fps
      
      const animate = () => {
        current += increment;
        if (current < target) {
          element.textContent = Math.round(current) + suffix;
          requestAnimationFrame(animate);
        } else {
          element.textContent = target + suffix;
        }
      };
      
      animate();
    }

    // Animate bar chart fills
    function animateBarChart() {
      const barFills = preview.querySelectorAll('.agency-dashboard-preview__bar-fill');
      barFills.forEach((bar, index) => {
        const width = bar.style.width;
        bar.style.width = '0%';
        
        setTimeout(() => {
          bar.style.width = width;
        }, 300 + (index * 100));
      });
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !entry.target.classList.contains('preview-animated')) {
          entry.target.classList.add('preview-animated');
          
          // Animate stat counters
          const statValues = entry.target.querySelectorAll('.agency-dashboard-preview__stat-value[data-target]');
          statValues.forEach((stat, index) => {
            const target = parseInt(stat.getAttribute('data-target'), 10);
            
            setTimeout(() => {
              animateCounter(stat, target);
            }, 200 + (index * 150));
          });
          
          // Animate bar chart
          setTimeout(() => {
            animateBarChart();
          }, 800);
        }
      });
    }, observerOptions);

    observer.observe(preview);
  }

  // How It Works Section Animations
  function initHowItWorks() {
    const howItWorks = document.getElementById('homepage-how-it-works');
    if (!howItWorks) return;

    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          
          // Animate steps with stagger
          const steps = entry.target.querySelectorAll('.homepage-how-it-works__step');
          steps.forEach((step, index) => {
            const stepNumber = step.querySelector('.homepage-how-it-works__step-number');
            const stepIcon = step.querySelector('.homepage-how-it-works__step-icon');
            const stepTitle = step.querySelector('.homepage-how-it-works__step-title');
            const stepDescription = step.querySelector('.homepage-how-it-works__step-description');
            
            // Start hidden
            if (stepNumber) {
              stepNumber.style.opacity = '0';
              stepNumber.style.transform = 'translateX(-50%) scale(0.5)';
            }
            if (stepIcon) {
              stepIcon.style.opacity = '0';
              stepIcon.style.transform = 'scale(0.8)';
            }
            if (stepTitle) {
              stepTitle.style.opacity = '0';
              stepTitle.style.transform = 'translateY(10px)';
            }
            if (stepDescription) {
              stepDescription.style.opacity = '0';
              stepDescription.style.transform = 'translateY(10px)';
            }
            
            // Animate in with stagger
            setTimeout(() => {
              if (stepNumber) {
                stepNumber.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
                stepNumber.style.opacity = '1';
                stepNumber.style.transform = 'translateX(-50%) scale(1)';
              }
              
              setTimeout(() => {
                if (stepIcon) {
                  stepIcon.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
                  stepIcon.style.opacity = '1';
                  stepIcon.style.transform = 'scale(1)';
                }
                
                setTimeout(() => {
                  if (stepTitle) {
                    stepTitle.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
                    stepTitle.style.opacity = '1';
                    stepTitle.style.transform = 'translateY(0)';
                  }
                  
                  setTimeout(() => {
                    if (stepDescription) {
                      stepDescription.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
                      stepDescription.style.opacity = '1';
                      stepDescription.style.transform = 'translateY(0)';
                    }
                  }, 150);
                }, 100);
              }, 100);
            }, index * 200);
          });
          
          // Animate connectors
          const connectors = entry.target.querySelectorAll('.homepage-how-it-works__connector');
          connectors.forEach((connector, index) => {
            const svg = connector.querySelector('svg path');
            if (svg) {
              svg.style.strokeDasharray = '4 4';
              svg.style.strokeDashoffset = '100';
              svg.style.transition = 'stroke-dashoffset 1s ease';
              
              setTimeout(() => {
                svg.style.strokeDashoffset = '0';
              }, 400 + (index * 200));
            }
          });
        }
      });
    }, observerOptions);

    observer.observe(howItWorks);
  }

  // Testimonial Carousel
  function initTestimonialCarousel() {
    const carousel = document.getElementById('testimonial-carousel');
    if (!carousel) return;

    const track = document.getElementById('testimonial-carousel-track');
    const slides = carousel.querySelectorAll('.testimonial-carousel__slide');
    const prevBtn = document.getElementById('testimonial-carousel-prev');
    const nextBtn = document.getElementById('testimonial-carousel-next');
    const dotsContainer = document.getElementById('testimonial-carousel-dots');

    if (!track || !slides.length) return;

    let currentIndex = 0;
    let autoRotateInterval = null;
    const AUTO_ROTATE_DELAY = 5000; // 5 seconds

    // Create dots
    if (dotsContainer) {
      slides.forEach((_, index) => {
        const dot = document.createElement('button');
        dot.className = 'testimonial-carousel__dot';
        if (index === 0) dot.classList.add('active');
        dot.setAttribute('aria-label', `Go to testimonial ${index + 1}`);
        dot.addEventListener('click', () => goToSlide(index));
        dotsContainer.appendChild(dot);
      });
    }

    function updateCarousel() {
      // Update track position
      const translateX = -currentIndex * 100;
      track.style.transform = `translateX(${translateX}%)`;

      // Update slide active states
      slides.forEach((slide, index) => {
        slide.classList.toggle('active', index === currentIndex);
      });

      // Update dots
      const dots = dotsContainer?.querySelectorAll('.testimonial-carousel__dot');
      dots?.forEach((dot, index) => {
        dot.classList.toggle('active', index === currentIndex);
      });

      // Update button states
      if (prevBtn) prevBtn.disabled = currentIndex === 0;
      if (nextBtn) nextBtn.disabled = currentIndex === slides.length - 1;
    }

    function goToSlide(index) {
      if (index < 0 || index >= slides.length) return;
      currentIndex = index;
      updateCarousel();
      resetAutoRotate();
    }

    function nextSlide() {
      if (currentIndex < slides.length - 1) {
        goToSlide(currentIndex + 1);
      } else {
        goToSlide(0); // Loop back to start
      }
    }

    function prevSlide() {
      if (currentIndex > 0) {
        goToSlide(currentIndex - 1);
      } else {
        goToSlide(slides.length - 1); // Loop to end
      }
    }

    function startAutoRotate() {
      autoRotateInterval = setInterval(() => {
        nextSlide();
      }, AUTO_ROTATE_DELAY);
    }

    function stopAutoRotate() {
      if (autoRotateInterval) {
        clearInterval(autoRotateInterval);
        autoRotateInterval = null;
      }
    }

    function resetAutoRotate() {
      stopAutoRotate();
      startAutoRotate();
    }

    // Event listeners
    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        prevSlide();
        resetAutoRotate();
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        nextSlide();
        resetAutoRotate();
      });
    }

    // Pause on hover
    carousel.addEventListener('mouseenter', stopAutoRotate);
    carousel.addEventListener('mouseleave', startAutoRotate);

    // Keyboard navigation
    carousel.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') {
        prevSlide();
        resetAutoRotate();
      } else if (e.key === 'ArrowRight') {
        nextSlide();
        resetAutoRotate();
      }
    });

    // Initialize
    updateCarousel();
    startAutoRotate();

    // Make carousel focusable for keyboard navigation
    carousel.setAttribute('tabindex', '0');
  }

  // Interactive Feature Cards
  function initInteractiveFeatureCards() {
    const featureCards = document.querySelectorAll('.feature-card');
    
    featureCards.forEach(card => {
      // Create tooltip if data-tooltip exists
      const tooltipText = card.getAttribute('data-tooltip');
      if (tooltipText) {
        const tooltip = document.createElement('div');
        tooltip.className = 'feature-card__tooltip';
        tooltip.textContent = tooltipText;
        tooltip.setAttribute('role', 'tooltip');
        card.appendChild(tooltip);
      }

      // Toggle expand on click
      card.addEventListener('click', (e) => {
        // Don't expand if clicking on a link or button inside
        if (e.target.closest('a, button')) return;
        
        const isExpanded = card.classList.contains('expanded');
        // Close all other cards
        featureCards.forEach(otherCard => {
          if (otherCard !== card) {
            otherCard.classList.remove('expanded');
          }
        });
        
        // Toggle current card
        card.classList.toggle('expanded', !isExpanded);
      });

      // Keyboard support
      card.setAttribute('tabindex', '0');
      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          card.click();
        }
      });
    });
  }

  // Interactive Comparison Table
  function initComparisonTable() {
    const tableRows = document.querySelectorAll('.comparison-table__row[data-tooltip]');
    
    tableRows.forEach(row => {
      const tooltipText = row.getAttribute('data-tooltip');
      if (tooltipText) {
        const tooltip = document.createElement('div');
        tooltip.className = 'comparison-table__row-tooltip';
        tooltip.textContent = tooltipText;
        tooltip.setAttribute('role', 'tooltip');
        row.appendChild(tooltip);
      }

      // Add hover effect for highlight rows
      if (row.classList.contains('comparison-table__row--highlight')) {
        row.addEventListener('mouseenter', () => {
          row.style.transform = 'scale(1.01)';
        });
        row.addEventListener('mouseleave', () => {
          row.style.transform = 'scale(1)';
        });
      }
    });

    // Tooltip trigger buttons
    const tooltipTriggers = document.querySelectorAll('.comparison-table__tooltip-trigger');
    tooltipTriggers.forEach(trigger => {
      trigger.addEventListener('click', (e) => {
        e.stopPropagation();
        const row = trigger.closest('.comparison-table__row');
        const tooltip = row?.querySelector('.comparison-table__row-tooltip');
        if (tooltip) {
          // Toggle tooltip visibility
          const isVisible = tooltip.style.opacity === '1';
          tooltip.style.opacity = isVisible ? '0' : '1';
          tooltip.style.pointerEvents = isVisible ? 'none' : 'auto';
        }
      });
    });
  }

  // Enhanced scroll animations for all sections
  function initEnhancedScrollAnimations() {
    const sections = document.querySelectorAll(
      '.homepage-value-prop, .homepage-portfolio-showcase, .homepage-agency, .homepage-testimonials'
    );
    
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -100px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          
          // Animate value prop benefits
          if (entry.target.classList.contains('homepage-value-prop')) {
            const benefits = entry.target.querySelectorAll('.homepage-value-prop__benefit');
            benefits.forEach((benefit, index) => {
              benefit.style.opacity = '0';
              benefit.style.transform = 'translateY(10px)';
              setTimeout(() => {
                benefit.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
                benefit.style.opacity = '1';
                benefit.style.transform = 'translateY(0)';
              }, index * 100);
            });
          }
          
          // Animate portfolio showcase intro
          if (entry.target.classList.contains('homepage-portfolio-showcase')) {
            const intro = entry.target.querySelector('.homepage-portfolio-showcase__intro');
            if (intro) {
              intro.style.opacity = '0';
              intro.style.transform = 'translateY(20px)';
              setTimeout(() => {
                intro.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
                intro.style.opacity = '1';
                intro.style.transform = 'translateY(0)';
              }, 100);
            }
          }
          
          // Animate testimonials header
          if (entry.target.classList.contains('homepage-testimonials')) {
            const header = entry.target.querySelector('.homepage-testimonials__header');
            if (header) {
              header.style.opacity = '0';
              header.style.transform = 'translateY(20px)';
              setTimeout(() => {
                header.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
                header.style.opacity = '1';
                header.style.transform = 'translateY(0)';
              }, 100);
            }
          }
        }
      });
    }, observerOptions);

    sections.forEach(section => {
      observer.observe(section);
    });
  }

  // Social Media Links - Prevent Redirect
  function initSocialMediaLinks() {
    // Use event delegation to handle clicks even if elements are hidden initially
    // This works even when elements are dynamically shown/hidden
    const handleSocialClick = (e) => {
      const socialLink = e.target.closest('.portfolio-card__social-link--no-redirect');
      if (socialLink) {
        e.preventDefault();
        e.stopPropagation();
        // Link is clickable but doesn't redirect
        console.log('[Social] Link clicked:', socialLink.getAttribute('data-social'));
        // Add visual feedback
        socialLink.style.opacity = '0.6';
        setTimeout(() => {
          socialLink.style.opacity = '1';
        }, 200);
        return false;
      }
    };
    
    // Attach to document for event delegation
    document.addEventListener('click', handleSocialClick, true);
    
    console.log('[Social] Event listeners attached for social media links');
  }

  // Initialize everything when DOM is ready
  document.addEventListener('DOMContentLoaded', () => {
    initUniversalHeaderMenu();
    initUniversalHeaderUserMenu();
    initHeaderScroll();
    initTransformationHero();
    initPortfolioShowcaseAnimations();
    initPortfolioLightbox();
    initScrollAnimations();
    initDashboardShowcase();
    initAgencyDashboardPreview();
    initCommandPaletteDemo();
    initHowItWorks();
    initTestimonialCarousel();
    initInteractiveFeatureCards();
    initComparisonTable();
    initEnhancedScrollAnimations();
    initSocialMediaLinks();
    respectReducedMotion();
  });
})();
