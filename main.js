/**
 * MY BODY COUNT TRACKER - LEAN CONVERSION, EXPERIMENTATION & TRACKING ENGINE
 * Pure Vanilla JS, zero client dependencies, high performance.
 */

(function () {
  'use strict';

  // Global Config with Fallbacks
  const CONFIG = window.MBCT_CONFIG || {
    pixelId: 'YOUR_PIXEL_ID',
    amazonAsin: 'B0GWC43WN4',
    amazonUrl: 'https://www.amazon.com/dp/B0GWC43WN4',
    defaultAngle: 'utility'
  };

  const BASE_AMAZON_URL = CONFIG.amazonUrl || 'https://www.amazon.com/dp/B0GWC43WN4';

  /**
   * Experimentation Angles & Variant Copy
   */
  const EXPERIMENT_ANGLES = {
    utility: {
      eyebrow: '60 ENCOUNTERS • ZERO CLOUD SYNC',
      headline: '<span class="hero-title-line line-1"><span class="hero-kiss-wrap"><span class="hero-kiss-text">REMEMBER THE HOOKUPS</span><span class="hero-kiss-stamp" aria-hidden="true">💋</span></span></span> <span class="hero-title-line line-2"><span class="hero-underline-wrap"><span class="hero-underline-text">WORTH REMEMBERING</span><svg class="hero-handdrawn-svg" viewBox="0 0 250 20" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" aria-hidden="true"><path d="M4 13C45 4 148 3 246 11C192 16 88 17 28 14" stroke="var(--color-primary)" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round" /></svg></span></span>',
      subhead: 'Names blur. Details disappear.<br>And six months later, “Alex 🔥” tells you absolutely nothing.<br><br>My Body Count Tracker gives every hookup a place to remember what happened, how it felt, and whether you\'d do it again.',
      bullets: [
        '60 encounters. No app. No cloud. Just the receipts.'
      ]
    },
    privacy: {
      eyebrow: '100% OFFLINE BEDSIDE JOURNAL',
      headline: 'KEEP YOUR INTIMATE NOTES <span class="hero-underline-wrap"><span class="hero-underline-text">OFF YOUR PHONE</span><svg class="hero-handdrawn-svg" viewBox="0 0 250 20" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" aria-hidden="true"><path d="M4 13C45 4 148 3 246 11C192 16 88 17 28 14" stroke="var(--color-primary)" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round" /></svg></span>',
      subhead: 'Names blur. Details disappear. A physical hookup journal for your bedside drawer with zero cloud sync and zero accidental screen-share risk.',
      bullets: [
        '60 encounters. No app. No cloud. Just the receipts.'
      ]
    },
    gift: {
      eyebrow: 'ALSO A VERY GAY GIFT',
      headline: 'YOUR PRIVATE ARCHIVE OF <span class="hero-underline-wrap"><span class="hero-underline-text">BAD DECISIONS</span><svg class="hero-handdrawn-svg" viewBox="0 0 250 20" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" aria-hidden="true"><path d="M4 13C45 4 148 3 246 11C192 16 88 17 28 14" stroke="var(--color-primary)" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round" /></svg></span>',
      subhead: 'For birthdays, newly single friends, bachelor parties, Secret Santa, or the friend whose dating stories already require a spreadsheet.',
      bullets: [
        '60 encounters. No app. No cloud. Just the receipts.'
      ]
    }
  };

  /**
   * 1. Marketing Attribution & Parameter Persistence
   */
  function getAttributionParams() {
    const urlParams = new URLSearchParams(window.location.search);
    const trackedKeys = [
      'utm_source',
      'utm_medium',
      'utm_campaign',
      'utm_term',
      'utm_content',
      'ref',
      'tag',
      'gclid',
      'fbclid',
      'ttclid'
    ];

    const attribution = {};

    // 1. Recover previously saved campaign parameters from storage
    trackedKeys.forEach((key) => {
      try {
        const stored = sessionStorage.getItem(`mbct_${key}`) || localStorage.getItem(`mbct_${key}`);
        if (stored) attribution[key] = stored;
      } catch (e) { }
    });

    // 2. Overwrite with fresh incoming URL params if present
    trackedKeys.forEach((key) => {
      if (urlParams.has(key)) {
        const val = urlParams.get(key);
        attribution[key] = val;
        try {
          sessionStorage.setItem(`mbct_${key}`, val);
          localStorage.setItem(`mbct_${key}`, val);
        } catch (e) { }
      }
    });

    return attribution;
  }

  /**
   * Build Outbound Amazon Destination with all preserved marketing parameters
   */
  function buildAmazonUrl() {
    try {
      const targetUrl = new URL(BASE_AMAZON_URL);
      const attribution = getAttributionParams();

      Object.keys(attribution).forEach((param) => {
        if (attribution[param]) {
          targetUrl.searchParams.set(param, attribution[param]);
        }
      });

      return targetUrl.toString();
    } catch (e) {
      return BASE_AMAZON_URL;
    }
  }

  /**
   * Generic Analytics Event Dispatcher
   */
  function trackEvent(eventName, payload) {
    payload = payload || {};

    console.debug(`[MBCT Analytics] ${eventName}:`, payload);

    // Meta Pixel Event (Suppressed if user or extension declined cookies)
    let isConsentDeclined = false;
    try {
      isConsentDeclined = localStorage.getItem('mbct_cookie_consent_v1') === 'declined';
    } catch (e) { }

    if (typeof window.fbq === 'function' && !window['fbq-disabled'] && !isConsentDeclined) {
      try {
        window.fbq('trackCustom', eventName, payload);
      } catch (err) {
        console.debug('Meta Pixel custom event error:', err);
      }
    }

    // Google Tag / GA4 Hook
    if (typeof window.gtag === 'function') {
      try {
        window.gtag('event', eventName, payload);
      } catch (err) {
        console.debug('gtag error:', err);
      }
    }

    // Custom DOM Event for tests/monitoring
    try {
      window.dispatchEvent(new CustomEvent(`mbct:${eventName}`, { detail: payload }));
    } catch (e) { }
  }

  /**
   * 2. Outbound Amazon Click Tracking (Priority 1)
   */
  function initOutboundTracking() {
    const amazonLinks = document.querySelectorAll('a[data-track-amazon="true"]');
    const trackedUrl = buildAmazonUrl();
    const attribution = getAttributionParams();

    amazonLinks.forEach((link) => {
      link.href = trackedUrl;

      link.addEventListener('click', function () {
        const placement = this.getAttribute('data-cta-placement') || 'unknown';

        const payload = {
          placement: placement,
          page_path: window.location.pathname,
          utm_source: attribution.utm_source || '',
          utm_medium: attribution.utm_medium || '',
          utm_campaign: attribution.utm_campaign || '',
          utm_content: attribution.utm_content || '',
          utm_term: attribution.utm_term || ''
        };

        // Fire compliant AmazonOutboundClick event (Never fire Purchase!)
        trackEvent('AmazonOutboundClick', payload);

        // Also track standard InitiateCheckout as intentional lead conversion (if consented)
        let isConsentDeclined = false;
        try {
          isConsentDeclined = localStorage.getItem('mbct_cookie_consent_v1') === 'declined';
        } catch (e) { }

        if (typeof window.fbq === 'function' && !window['fbq-disabled'] && !isConsentDeclined) {
          try {
            window.fbq('track', 'InitiateCheckout', {
              content_name: 'My Body Count Tracker',
              placement: placement
            });
          } catch (e) { }
        }
      });
    });
  }

  /**
   * 3. Milestone Scroll Depth Tracking (25%, 50%, 75%)
   */
  function initScrollDepthTracking() {
    const milestones = [25, 50, 75];
    const reached = {};

    function checkScroll() {
      const scrollY = window.scrollY || window.pageYOffset;
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight <= 0) return;

      const percent = Math.round((scrollY / totalHeight) * 100);

      milestones.forEach((threshold) => {
        if (percent >= threshold && !reached[threshold]) {
          reached[threshold] = true;
          trackEvent('ScrollDepth', { depth: threshold });
        }
      });

      if (milestones.every((m) => reached[m])) {
        window.removeEventListener('scroll', checkScroll);
      }
    }

    window.addEventListener('scroll', checkScroll, { passive: true });
    // Check initial position
    setTimeout(checkScroll, 600);
  }

  /**
   * 4. FAQ Interaction Tracking
   */
  function initFaqTracking() {
    const faqRows = document.querySelectorAll('.faq-row details');
    faqRows.forEach((details) => {
      details.addEventListener('toggle', function () {
        if (this.open) {
          const summaryText = this.querySelector('summary span')?.textContent?.trim() || 'Unknown Question';
          trackEvent('FAQInteraction', { question: summaryText });
        }
      });
    });
  }

  /**
   * 5. Experimentation & Configurable Copy Engine (Priority 10)
   */
  function initExperimentation() {
    const urlParams = new URLSearchParams(window.location.search);
    const angleParam = urlParams.get('angle') || urlParams.get('variant') || CONFIG.defaultAngle || 'utility';
    const activeAngle = EXPERIMENT_ANGLES[angleParam] ? angleParam : 'utility';
    const angleData = EXPERIMENT_ANGLES[activeAngle];

    // Set body experiment attributes
    document.body.setAttribute('data-experiment-angle', activeAngle);
    document.body.setAttribute('data-experiment-variant', activeAngle);

    // Apply Headline or custom query override
    const headlineEl = document.getElementById('heroHeadline');
    if (headlineEl) {
      const customHeadline = urlParams.get('headline');
      if (customHeadline) {
        // Sanitize text and ensure Borsok apostrophe rule
        const safeHeadline = customHeadline.replace(/['’]/g, '').toUpperCase();
        headlineEl.textContent = safeHeadline;
      } else if (angleData.headline) {
        headlineEl.innerHTML = angleData.headline;
      }
    }

    // Apply Subtitle
    const subheadEl = document.getElementById('heroSubhead');
    if (subheadEl && angleData.subhead) {
      subheadEl.innerHTML = angleData.subhead;
    }

    // Apply Bullets
    const bulletsEl = document.getElementById('heroBullets');
    if (bulletsEl && angleData.bullets && angleData.bullets.length > 0) {
      bulletsEl.innerHTML = angleData.bullets
        .map((b) => `<span><i data-lucide="check-circle-2" aria-hidden="true"></i> ${b}</span>`)
        .join('\n');
      if (typeof window.lucide !== 'undefined' && typeof window.lucide.createIcons === 'function') {
        window.lucide.createIcons();
      }
    }
  }

  /**
   * 6. Sticky Mobile CTA: Appears when hero CTA leaves viewport, hides at footer
   */
  function initStickyMobileCta() {
    const stickyBar = document.getElementById('stickyMobileCta');
    const heroCta = document.getElementById('heroCtaButton');
    const footer = document.querySelector('.site-footer');

    if (!stickyBar || !heroCta) return;

    let isHeroPast = false;
    let isFooterVisible = false;

    function updateStickyVisibility() {
      if (isHeroPast && !isFooterVisible) {
        stickyBar.classList.add('visible');
      } else {
        stickyBar.classList.remove('visible');
      }
    }

    if ('IntersectionObserver' in window) {
      // Observer 1: Hero CTA
      const heroObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            isHeroPast = !entry.isIntersecting && entry.boundingClientRect.top < 0;
            updateStickyVisibility();
          });
        },
        { threshold: 0 }
      );
      heroObserver.observe(heroCta);

      // Observer 2: Site Footer (prevent covering footer/FAQ links)
      if (footer) {
        const footerObserver = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              isFooterVisible = entry.isIntersecting;
              updateStickyVisibility();
            });
          },
          { threshold: 0.1 }
        );
        footerObserver.observe(footer);
      }
    } else {
      window.addEventListener(
        'scroll',
        () => {
          const heroRect = heroCta.getBoundingClientRect();
          const footerRect = footer ? footer.getBoundingClientRect() : null;
          isHeroPast = heroRect.bottom < 0;
          isFooterVisible = footerRect ? footerRect.top < window.innerHeight : false;
          updateStickyVisibility();
        },
        { passive: true }
      );
    }
  }

  /**
   * 7. Mobile Spread Zoom Lightbox Modal (Priority 3 & 8)
   */
  function initSpreadZoomModal() {
    const openBtn = document.getElementById('enlargeSpreadBtn');
    const modal = document.getElementById('spreadZoomModal');
    const closeBtn = document.getElementById('closeSpreadZoomBtn');

    if (!modal) return;

    function openModal() {
      modal.removeAttribute('hidden');
      document.body.style.overflow = 'hidden';
      trackEvent('SpreadZoomOpened', { source: 'mobile_zoom_btn' });
    }

    function closeModal() {
      modal.setAttribute('hidden', '');
      document.body.style.overflow = '';
    }

    if (openBtn) openBtn.addEventListener('click', openModal);
    if (closeBtn) closeBtn.addEventListener('click', closeModal);

    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal();
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !modal.hasAttribute('hidden')) {
        closeModal();
      }
    });
  }

  /**
   * 8. Spread Callout Highlights (Static Informational Tags)
   */
  function initSpreadCalloutPills() {
    // Pure informational callouts without interactive link jumping
  }

  /**
   * 9. Tactile Spread Interactions (Checkboxes & Vibe Faces)
   */
  function initSpreadInteractions() {
    // Checkboxes
    const checkContainers = document.querySelectorAll('.bp-role-item, .bp-never-again-item');
    checkContainers.forEach((item) => {
      const box = item.querySelector('.bp-checkbox-box');
      if (!box) return;

      item.addEventListener('click', function (e) {
        e.preventDefault();
        const isChecked = box.classList.toggle('checked');
        box.setAttribute('aria-checked', isChecked ? 'true' : 'false');

        if (navigator.vibrate) navigator.vibrate(10);

        if (isChecked) {
          const angles = [0, 90, 180, 270];
          angles.forEach((deg) => {
            const rad = (deg * Math.PI) / 180;
            const dot = document.createElement('span');
            dot.className = 'bp-particle-dot';
            dot.style.setProperty('--tx', `${Math.cos(rad) * 14}px`);
            dot.style.setProperty('--ty', `${Math.sin(rad) * 14}px`);
            dot.style.top = '6px';
            dot.style.left = '6px';
            box.appendChild(dot);
            setTimeout(() => dot.remove(), 450);
          });
        }
      });

      box.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          item.click();
        }
      });
    });

    // Vibe Face Chips
    const faceGroups = document.querySelectorAll('.bp-vibe-faces-group');
    const vibeEmojis = {
      'in-love': '💖',
      'happy': '✨',
      'meh': '💬',
      'angry': '🔥'
    };

    faceGroups.forEach((group) => {
      const chips = group.querySelectorAll('.bp-face-chip');
      chips.forEach((chip) => {
        chip.addEventListener('click', function (e) {
          e.preventDefault();
          const wasSelected = this.classList.contains('selected');

          chips.forEach((c) => {
            c.classList.remove('selected');
            c.setAttribute('aria-checked', 'false');
          });

          if (!wasSelected) {
            this.classList.add('selected');
            this.setAttribute('aria-checked', 'true');

            if (navigator.vibrate) navigator.vibrate(15);

            const vibeKey = this.getAttribute('data-vibe') || 'happy';
            const floater = document.createElement('span');
            floater.className = 'bp-reaction-floater';
            floater.textContent = vibeEmojis[vibeKey] || '✨';
            this.appendChild(floater);
            setTimeout(() => floater.remove(), 750);
          }
        });

        chip.addEventListener('keydown', function (e) {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            this.click();
          }
        });
      });
    });

    // Mobile 3D Page Flip Interaction
    const doubleSpread = document.getElementById('notebookDoubleSpread');
    const flipBtn = document.getElementById('spreadFlipBtn');
    const flipBtnText = document.getElementById('spreadFlipBtnText');
    const pageBadge = document.getElementById('spreadPageBadge');

    if (doubleSpread && flipBtn) {
      function togglePageFlip() {
        const isFlipped = doubleSpread.classList.toggle('flipped');
        flipBtn.classList.toggle('is-flipped', isFlipped);

        if (isFlipped) {
          if (flipBtnText) flipBtnText.innerHTML = '&larr; Flip Page (Blueprint)';
          if (pageBadge) pageBadge.textContent = 'Page 2 / 2';
        } else {
          if (flipBtnText) flipBtnText.innerHTML = 'Flip Page (Reflections) &rarr;';
          if (pageBadge) pageBadge.textContent = 'Page 1 / 2';
        }

        if (navigator.vibrate) {
          try {
            navigator.vibrate(20);
          } catch (_) { }
        }
      }

      flipBtn.addEventListener('click', togglePageFlip);

      // On mobile, also allow tapping the spread card directly to flip
      const spreadPages = doubleSpread.querySelectorAll('.spread-page');
      spreadPages.forEach((page) => {
        page.addEventListener('click', (e) => {
          if (window.innerWidth <= 768) {
            // Do not flip if interacting with an inner interactive control
            if (e.target.closest('.bp-role-item, .bp-never-again-item, .bp-face-chip, a, button')) {
              return;
            }
            togglePageFlip();
          }
        });
      });
    }
  }

  /**
   * 10. Hero Headline Animations: Kiss, Blush & Hand-Drawn Underline
   */
  function initHeroAnimations() {
    const kissWrap = document.querySelector('.hero-kiss-wrap');
    const kissStamp = document.querySelector('.hero-kiss-stamp');
    const kissText = document.querySelector('.hero-kiss-text');
    const underlineSvg = document.querySelector('.hero-handdrawn-svg');

    // Initial triggers
    setTimeout(() => {
      if (kissStamp) kissStamp.classList.add('kissed');
      if (kissText) kissText.classList.add('blushing');
    }, 380);

    setTimeout(() => {
      if (underlineSvg) underlineSvg.classList.add('drawn');
    }, 850);

    // Interactive replay on kiss click
    if (kissWrap && kissStamp && kissText) {
      let isAnimating = false;

      kissWrap.addEventListener('click', (e) => {
        if (isAnimating) return;
        isAnimating = true;

        kissStamp.classList.remove('kissed');
        kissStamp.style.animation = 'none';
        kissStamp.style.transition = 'none';
        kissStamp.style.opacity = '1';
        kissStamp.style.transform = 'scale(1) rotate(-10deg)';
        void kissStamp.offsetWidth;

        const stampRect = kissStamp.getBoundingClientRect();
        const stampCenterX = stampRect.left + stampRect.width / 2;
        const stampCenterY = stampRect.top + stampRect.height / 2;

        const deltaX = e.clientX - stampCenterX;
        const deltaY = e.clientY - stampCenterY;
        const isMobile = window.innerWidth <= 768 || 'ontouchstart' in window;
        const targetScale = isMobile ? 2.6 : 2.2;

        kissStamp.style.transition = 'transform 0.13s cubic-bezier(0.2, 1, 0.3, 1)';
        kissStamp.style.transform = `translate(${deltaX}px, ${deltaY}px) scale(${targetScale}) rotate(-14deg)`;

        kissText.classList.remove('blushing');
        void kissText.offsetWidth;
        kissText.classList.add('blushing');

        if (navigator.vibrate) navigator.vibrate([15, 30, 20]);

        const wrapRect = kissWrap.getBoundingClientRect();
        const heart = document.createElement('span');
        heart.className = 'kiss-floating-heart';
        heart.textContent = '💖';
        heart.style.left = `${e.clientX - wrapRect.left}px`;
        heart.style.top = `${e.clientY - wrapRect.top}px`;
        kissWrap.appendChild(heart);
        setTimeout(() => heart.remove(), 700);

        setTimeout(() => {
          kissStamp.style.transition = 'transform 0.14s cubic-bezier(0.34, 1.56, 0.64, 1)';
          kissStamp.style.transform = `translate(${deltaX}px, ${deltaY}px) scale(${targetScale * 0.88}) rotate(-6deg)`;
        }, 130);

        setTimeout(() => {
          kissStamp.style.transition = 'transform 0.26s cubic-bezier(0.25, 1, 0.5, 1)';
          kissStamp.style.transform = 'scale(1) rotate(-12deg)';

          setTimeout(() => {
            kissStamp.style.transition = '';
            kissStamp.style.animation = '';
            kissStamp.style.transform = '';
            kissStamp.classList.add('floating');
            isAnimating = false;
          }, 270);
        }, 280);
      });
    }

    const underlineWrap = document.querySelector('.hero-underline-wrap');
    if (underlineWrap && underlineSvg) {
      underlineWrap.addEventListener('click', () => {
        underlineSvg.classList.remove('drawn');
        void underlineSvg.offsetWidth;
        underlineSvg.classList.add('drawn');
      });
    }
  }

  /**
   * 10b. Problem Section Heading Animation: Yellow Glow & Handwritten Underline
   * Draws forward when scrolling down, draws backwards when scrolling up.
   * Highly reactive to scroll approach.
   */
  function initProblemSectionAnimation() {
    const trackerWrap = document.querySelector('.problem-tracker-wrap');
    const trackerText = document.querySelector('.problem-tracker-text');
    const trackerSvg = document.querySelector('.problem-handdrawn-svg');

    if (!trackerWrap || !trackerText || !trackerSvg) return;

    let lastScrollY = window.scrollY;
    let isTicking = false;

    function evaluateScroll() {
      const currentScrollY = window.scrollY;
      const isScrollingDown = currentScrollY >= lastScrollY;
      const rect = trackerWrap.getBoundingClientRect();
      const windowHeight = window.innerHeight;

      // "Soon to come at that moment":
      // Triggers as heading approaches the viewport from below (within bottom 12% of screen)
      const inApproachZone = rect.top <= windowHeight * 0.88;
      const isPastSection = rect.bottom < -80;

      if (isPastSection) {
        // Far below the heading in comparison cards: keep drawn
        trackerText.classList.add('glowing');
        trackerSvg.classList.add('drawn');
      } else if (rect.top > windowHeight * 0.92) {
        // Fully above section: retract backward
        trackerText.classList.remove('glowing');
        trackerSvg.classList.remove('drawn');
      } else if (inApproachZone) {
        if (isScrollingDown) {
          // Scrolling down towards/into section: draw forward
          trackerText.classList.add('glowing');
          trackerSvg.classList.add('drawn');
        } else {
          // Scrolling UP:
          // When moving back up towards top and heading starts moving down past mid-screen:
          if (rect.top > windowHeight * 0.45) {
            trackerText.classList.remove('glowing');
            trackerSvg.classList.remove('drawn');
          }
        }
      }

      lastScrollY = currentScrollY;
      isTicking = false;
    }

    function onScroll() {
      if (!isTicking) {
        isTicking = true;
        window.requestAnimationFrame(evaluateScroll);
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });

    // Initial check
    evaluateScroll();

    // Replay on click
    trackerWrap.addEventListener('click', () => {
      trackerText.classList.remove('glowing');
      trackerSvg.classList.remove('drawn');
      void trackerWrap.offsetWidth;
      trackerText.classList.add('glowing');
      trackerSvg.classList.add('drawn');
    });
  }

  /**
   * 10c. Burning Fire Animation for "REAL DATING LIVES" & Floating Flame Emojis
   */
  function initBurningHeadingAnimation() {
    const fireWrap = document.querySelector('.burning-fire-wrap');
    const fireText = document.querySelector('.burning-fire-text');
    if (!fireWrap || !fireText) return;

    function eruptFlames(e) {
      // Allow clean text selection without triggering animation when highlighting text
      const selection = window.getSelection ? window.getSelection().toString() : '';
      if (selection.trim().length > 0) return;

      // Momentary warm flare
      fireText.classList.remove('flared');
      void fireText.offsetWidth;
      fireText.classList.add('flared');
      setTimeout(() => fireText.classList.remove('flared'), 280);

      // Haptic feedback
      if (navigator.vibrate) {
        try {
          navigator.vibrate([25, 40, 25]);
        } catch (_) { }
      }

      const rect = fireWrap.getBoundingClientRect();
      const wrapWidth = rect.width || 200;
      const wrapHeight = rect.height || 40;

      // Erupt 18-24 flame emojis upwards across the text
      const count = 18 + Math.floor(Math.random() * 7);
      const isMobile = window.innerWidth <= 768;

      for (let i = 0; i < count; i++) {
        const flame = document.createElement('span');
        flame.className = 'floating-flame-emoji';
        flame.textContent = '🔥';
        flame.setAttribute('aria-hidden', 'true');

        // Distribute nicely along the text
        const posX = Math.random() * Math.max(10, wrapWidth - 26);
        const posY = Math.random() * (wrapHeight * 0.6);

        const dx = (Math.random() - 0.5) * (isMobile ? 70 : 120);
        const dy = -(130 + Math.random() * (isMobile ? 120 : 190));
        const scale = 0.85 + Math.random() * 1.1;
        const rot = (Math.random() - 0.5) * 55;
        const duration = 0.85 + Math.random() * 0.65;
        const delay = Math.random() * 0.18;

        flame.style.left = `${posX}px`;
        flame.style.top = `${posY}px`;
        flame.style.setProperty('--flame-dx', `${dx}px`);
        flame.style.setProperty('--flame-dy', `${dy}px`);
        flame.style.setProperty('--flame-scale', scale.toFixed(2));
        flame.style.setProperty('--flame-rot', `${rot.toFixed(1)}deg`);
        flame.style.setProperty('--flame-duration', `${duration.toFixed(2)}s`);
        flame.style.animationDelay = `${delay.toFixed(2)}s`;

        fireWrap.appendChild(flame);

        setTimeout(() => {
          flame.remove();
        }, (duration + delay + 0.15) * 1000);
      }
    }

    fireWrap.addEventListener('click', eruptFlames);
    fireWrap.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        eruptFlames();
      }
    });
  }

  /**
   * 10d. Section 2 Animations:
   * - "WHICH ALEX?": Coming-going left-to-right coloring sweep triggered when at screen center
   */
  function initSection2Animations() {
    const alexWrap = document.querySelector('.which-alex-wrap');
    const alexText = document.querySelector('.which-alex-text');

    function checkScroll() {
      const windowHeight = window.innerHeight;
      const screenMid = windowHeight / 2;

      // Check Which Alex Center Sweep
      if (alexWrap && alexText) {
        const rect = alexWrap.getBoundingClientRect();
        const midY = rect.top + rect.height / 2;
        // Text is at center of screen (within +/- 22% of screen center)
        const isAtCenter = Math.abs(midY - screenMid) < windowHeight * 0.22;
        if (isAtCenter) {
          alexText.classList.add('sweeping');
        } else {
          alexText.classList.remove('sweeping');
        }
      }
    }

    window.addEventListener('scroll', checkScroll, { passive: true });
    window.addEventListener('resize', checkScroll, { passive: true });
    checkScroll();

    if (alexWrap && alexText) {
      alexWrap.addEventListener('click', () => {
        alexText.classList.remove('sweeping');
        void alexText.offsetWidth;
        alexText.classList.add('sweeping');
      });
    }
  }

  /**
   * 11. Deferred Telegram Live Support Chat Widget (Priority 7, Rule 42)
   */
  function scheduleDeferredChatWidget() {
    let isLoaded = false;

    function loadWidget() {
      if (isLoaded) return;
      isLoaded = true;

      // 1. Load module script asynchronously
      const script = document.createElement('script');
      script.type = 'module';
      script.src = 'https://unpkg.com/js-chat-telegram-widget/dist/index.mjs';
      document.body.appendChild(script);

      // 2. Mount chat widget element
      const widget = document.createElement('telegram-chat-widget');
      widget.setAttribute('backend-url', 'https://tgbot.chauvet.dev');
      widget.setAttribute('site-id', '📙 Bodycount');
      widget.setAttribute('primary-color', '#171717');
      widget.setAttribute('accent-color', '#f5c800');
      widget.setAttribute('bg-color', '#fff8d6');
      widget.setAttribute('title', '📙 Bodycount Support');
      widget.setAttribute('placeholder', 'Ask anything about the journal...');
      widget.setAttribute('profile-pic', './assets/logo.png');
      widget.setAttribute('avatar-url', './assets/logo.png');
      document.body.appendChild(widget);

      // 3. Track widget open interaction
      widget.addEventListener('click', () => {
        trackEvent('ChatOpened', { source: 'telegram_widget' });
      }, { once: true });
    }

    // Trigger on first user activity
    const interactionEvents = ['pointerdown', 'scroll', 'keydown'];
    const onFirstInteraction = () => {
      interactionEvents.forEach((evt) => window.removeEventListener(evt, onFirstInteraction));
      loadWidget();
    };

    interactionEvents.forEach((evt) => window.addEventListener(evt, onFirstInteraction, { passive: true, once: true }));

    // Or trigger after idle / timeout
    if ('requestIdleCallback' in window) {
      window.requestIdleCallback(() => loadWidget(), { timeout: 3800 });
    } else {
      setTimeout(loadWidget, 3500);
    }
  }

  /**
   * 12. RGPD / GDPR Cookie Consent & Privacy Modal Handler
   */
  function initCookieConsent() {
    const banner = document.getElementById('cookie-banner') || document.getElementById('cookieNoticeBanner') || document.querySelector('.cookie-banner');
    const acceptBtn = document.getElementById('cookieAcceptBtn') || document.querySelector('.cookie-btn-accept');
    const declineBtn = document.getElementById('cookieDeclineBtn') || document.querySelector('.cookie-btn-decline');
    const learnMoreBtn = document.getElementById('cookieLearnMoreBtn');
    const openModalBtn = document.getElementById('openCookieModalBtn');
    const modal = document.getElementById('cookieModal');
    const closeModalBtn = document.getElementById('closeCookieModalBtn');
    const dismissModalBtn = document.getElementById('cookieModalDismissBtn');

    const STORAGE_KEY = 'mbct_cookie_consent_v1';
    let consent = null;
    try {
      consent = localStorage.getItem(STORAGE_KEY);
    } catch (e) { }

    // If previously declined, disable Meta Pixel immediately
    if (consent === 'declined') {
      window['fbq-disabled'] = true;
    }

    // Hide banner if already decided
    if (banner && (consent === 'accepted' || consent === 'declined')) {
      banner.style.display = 'none';
    }

    function hideBanner() {
      if (!banner) return;
      banner.style.transition = 'opacity 0.25s ease, transform 0.25s ease';
      banner.style.opacity = '0';
      banner.style.transform = 'translateY(20px)';
      setTimeout(() => {
        banner.style.display = 'none';
      }, 260);
    }

    if (acceptBtn) {
      acceptBtn.addEventListener('click', () => {
        try {
          localStorage.setItem(STORAGE_KEY, 'accepted');
        } catch (e) { }
        hideBanner();
        trackEvent('CookieConsentAccepted');
      });
    }

    if (declineBtn) {
      declineBtn.addEventListener('click', () => {
        try {
          localStorage.setItem(STORAGE_KEY, 'declined');
        } catch (e) { }
        window['fbq-disabled'] = true;
        hideBanner();
        trackEvent('CookieConsentDeclined');
      });
    }

    function openModal() {
      if (!modal) return;
      modal.removeAttribute('hidden');
      document.body.style.overflow = 'hidden';
    }

    function closeModal() {
      if (!modal) return;
      modal.setAttribute('hidden', '');
      document.body.style.overflow = '';
    }

    if (learnMoreBtn) learnMoreBtn.addEventListener('click', openModal);
    if (openModalBtn) openModalBtn.addEventListener('click', openModal);
    if (closeModalBtn) closeModalBtn.addEventListener('click', closeModal);
    if (dismissModalBtn) dismissModalBtn.addEventListener('click', closeModal);

    if (modal) {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
      });
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && !modal.hasAttribute('hidden')) {
          closeModal();
        }
      });
    }
  }

  /**
   * Initialize Lucide Icons Safely
   */
  function initLucideIcons() {
    if (typeof window.lucide !== 'undefined' && typeof window.lucide.createIcons === 'function') {
      try {
        window.lucide.createIcons();
      } catch (e) {
        console.warn('Lucide icons warning:', e);
      }
    }
  }

  /**
   * Temporary Dismissal of Announcement Bar
   */
  function initAnnouncementBarDismissal() {
    const closeBtn = document.getElementById('announcementCloseBtn');
    const bar = document.getElementById('announcementBar');
    if (closeBtn && bar) {
      closeBtn.addEventListener('click', () => {
        bar.classList.add('is-dismissed');
      });
    }
  }

  /**
   * Main Bootstrapper
   */
  function init() {
    initExperimentation();
    initLucideIcons();
    initAnnouncementBarDismissal();
    initOutboundTracking();
    initScrollDepthTracking();
    initFaqTracking();
    initStickyMobileCta();
    initSpreadZoomModal();
    initSpreadCalloutPills();
    initHeroAnimations();
    initSection2Animations();
    initProblemSectionAnimation();
    initBurningHeadingAnimation();
    initSpreadInteractions();
    initCookieConsent();
    scheduleDeferredChatWidget();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
