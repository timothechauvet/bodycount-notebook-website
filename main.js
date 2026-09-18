/**
 * MY BODY COUNT TRACKER - LEAN CONVERSION & TRACKING ENGINE
 * Pure Vanilla JS, zero dependencies, < 2KB payload.
 */

(function () {
  'use strict';

  const BASE_AMAZON_URL = 'https://www.amazon.com/dp/B0GWC43WN4';

  /**
   * Forward incoming marketing/affiliate parameters to Amazon outbound link
   */
  function buildAmazonUrl() {
    try {
      const searchParams = new URLSearchParams(window.location.search);
      const targetUrl = new URL(BASE_AMAZON_URL);

      const forwardParams = [
        'tag',
        'utm_source',
        'utm_medium',
        'utm_campaign',
        'utm_term',
        'utm_content',
        'ref',
        'fbclid',
        'gclid',
        'ttclid'
      ];

      forwardParams.forEach((param) => {
        if (searchParams.has(param)) {
          targetUrl.searchParams.set(param, searchParams.get(param));
        }
      });

      return targetUrl.toString();
    } catch (e) {
      return BASE_AMAZON_URL;
    }
  }

  /**
   * Outbound Amazon Click Tracking (Meta Pixel InitiateCheckout + Google Ads)
   */
  function initOutboundTracking() {
    const amazonLinks = document.querySelectorAll('a[data-track-amazon="true"]');
    const trackedUrl = buildAmazonUrl();

    amazonLinks.forEach((link) => {
      link.href = trackedUrl;

      link.addEventListener('click', function () {
        // Meta Pixel: InitiateCheckout
        if (typeof window.fbq === 'function') {
          try {
            window.fbq('track', 'InitiateCheckout', {
              content_name: 'Body Count Tracker',
              currency: 'USD',
              value: 16.99
            });
          } catch (err) {
            console.debug('Meta Pixel Error:', err);
          }
        }

        // Google Tag / Ads Hook
        if (typeof window.gtag === 'function') {
          try {
            window.gtag('event', 'begin_checkout', {
              items: [
                {
                  item_id: 'B0GWC43WN4',
                  item_name: 'My Body Count Tracker Notebook',
                  price: 16.99,
                  currency: 'USD',
                  quantity: 1
                }
              ],
              value: 16.99,
              currency: 'USD'
            });
          } catch (err) {
            console.debug('Google Tag Error:', err);
          }
        }
      });
    });
  }

  /**
   * Sticky Mobile CTA: Appears seamlessly when hero CTA scrolls out of view
   */
  function initStickyMobileCta() {
    const stickyBar = document.getElementById('stickyMobileCta');
    const heroCta = document.getElementById('heroCtaButton');

    if (!stickyBar || !heroCta) return;

    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting && entry.boundingClientRect.top < 0) {
              stickyBar.classList.add('visible');
            } else {
              stickyBar.classList.remove('visible');
            }
          });
        },
        { threshold: 0 }
      );
      observer.observe(heroCta);
    } else {
      window.addEventListener('scroll', () => {
        const rect = heroCta.getBoundingClientRect();
        if (rect.bottom < 0) {
          stickyBar.classList.add('visible');
        } else {
          stickyBar.classList.remove('visible');
        }
      }, { passive: true });
    }
  }

  /**
   * Smooth Entry Jump Navigation
   */
  function initEntryJumpChips() {
    const chips = document.querySelectorAll('.entry-jump-chip');
    chips.forEach((chip) => {
      chip.addEventListener('click', function (e) {
        const targetId = this.getAttribute('href');
        if (!targetId || !targetId.startsWith('#')) return;
        const targetEl = document.querySelector(targetId);
        if (targetEl) {
          e.preventDefault();
          targetEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          
          const siblings = this.parentElement.querySelectorAll('.entry-jump-chip');
          siblings.forEach((s) => s.classList.remove('active'));
          this.classList.add('active');
        }
      });
    });
  }

  /**
   * Comparison Card Touch Trigger for Mobile Devices
   */
  function initComparisonTouch() {
    const winnerCard = document.querySelector('.comp-card.good');
    if (!winnerCard) return;

    let touchTimer = null;

    winnerCard.addEventListener('touchstart', function () {
      if (touchTimer) clearTimeout(touchTimer);
      winnerCard.classList.add('touch-active');
    }, { passive: true });

    winnerCard.addEventListener('touchend', function () {
      touchTimer = setTimeout(() => {
        winnerCard.classList.remove('touch-active');
      }, 1400);
    }, { passive: true });
  }

  /**
   * Initialize Lucide Icons
   */
  function initLucideIcons() {
    if (typeof window.lucide !== 'undefined' && typeof window.lucide.createIcons === 'function') {
      window.lucide.createIcons();
    }
  }

  /**
   * Hero Headline Animations: Kiss, Blush & Hand-Drawn Underline
   */
  function initHeroAnimations() {
    const kissWrap = document.querySelector('.hero-kiss-wrap');
    const kissStamp = document.querySelector('.hero-kiss-stamp');
    const kissText = document.querySelector('.hero-kiss-text');
    const underlineSvg = document.querySelector('.hero-handdrawn-svg');

    // Trigger on load after brief delay
    setTimeout(() => {
      if (kissStamp) kissStamp.classList.add('kissed');
      if (kissText) kissText.classList.add('blushing');
    }, 380);

    setTimeout(() => {
      if (underlineSvg) underlineSvg.classList.add('drawn');
    }, 850);

    // Interactive replay on kiss click: lips icon flies super fast to cursor, goes extra big (especially on mobile), and spawns a floating heart!
    if (kissWrap && kissStamp && kissText) {
      let isAnimating = false;

      kissWrap.addEventListener('click', (e) => {
        if (isAnimating) return;
        isAnimating = true;

        const wrapRect = kissWrap.getBoundingClientRect();
        const clickX = e.clientX - wrapRect.left;
        const clickY = e.clientY - wrapRect.top;

        // Check if on mobile / narrow screen
        const isMobile = window.innerWidth <= 768 || 'ontouchstart' in window;
        const targetScale = isMobile ? 2.45 : 1.95;

        // Reset any resting float animation
        kissStamp.classList.remove('kissed');
        kissStamp.style.animation = 'none';
        // Ultra-snappy Appllama spring curve: very quick swoop (130ms)
        kissStamp.style.transition = 'left 0.13s cubic-bezier(0.2, 1, 0.3, 1), top 0.13s cubic-bezier(0.2, 1, 0.3, 1), transform 0.13s cubic-bezier(0.34, 1.56, 0.64, 1)';

        // Swoop right onto cursor coordinates and grow BIG
        kissStamp.style.left = `${clickX}px`;
        kissStamp.style.top = `${clickY}px`;
        kissStamp.style.transform = `translate(-50%, -50%) scale(${targetScale}) rotate(-14deg)`;
        kissStamp.style.opacity = '1';

        // Re-blush the text
        kissText.classList.remove('blushing');
        void kissText.offsetWidth;
        kissText.classList.add('blushing');

        // Tactile haptic feedback
        if (navigator.vibrate) navigator.vibrate([15, 30, 20]);

        // Spawn a small temporary floating heart rising up from the kiss point
        const heart = document.createElement('span');
        heart.className = 'kiss-floating-heart';
        heart.textContent = '💖';
        heart.style.left = `${clickX}px`;
        heart.style.top = `${clickY}px`;
        kissWrap.appendChild(heart);
        setTimeout(() => heart.remove(), 700);

        // Quick kiss smack bounce at 130ms
        setTimeout(() => {
          kissStamp.style.transition = 'transform 0.15s cubic-bezier(0.34, 1.56, 0.64, 1)';
          kissStamp.style.transform = `translate(-50%, -50%) scale(${targetScale * 0.85}) rotate(-6deg)`;
        }, 130);

        // Smoothly fly back to top-right resting corner after smack (starts at 380ms)
        setTimeout(() => {
          kissStamp.style.transition = 'all 0.38s cubic-bezier(0.16, 1, 0.3, 1)';
          kissStamp.style.left = '';
          kissStamp.style.top = '';
          kissStamp.style.transform = '';
          setTimeout(() => {
            kissStamp.style.transition = '';
            kissStamp.style.animation = '';
            kissStamp.classList.add('kissed');
            isAnimating = false;
          }, 380);
        }, 400);
      });
    }

    // Interactive replay on underline click
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
   * Tactile Appllama-style Spread Interactions:
   * Clickable Checkboxes & Vibe Face Chips with floating reactions
   */
  function initSpreadInteractions() {
    // 1. Checkboxes
    const checkContainers = document.querySelectorAll('.bp-role-item, .bp-never-again-item');
    checkContainers.forEach((item) => {
      const box = item.querySelector('.bp-checkbox-box');
      if (!box) return;

      item.addEventListener('click', function (e) {
        e.preventDefault();
        const isChecked = box.classList.toggle('checked');
        box.setAttribute('aria-checked', isChecked ? 'true' : 'false');

        // Haptic feedback if available
        if (navigator.vibrate) navigator.vibrate(10);

        // Spawn 4 micro particle dots if checked
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

      // Keyboard accessibility
      box.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          item.click();
        }
      });
    });

    // 2. Vibe Face Chips
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

          // Deselect all in this group
          chips.forEach((c) => {
            c.classList.remove('selected');
            c.setAttribute('aria-checked', 'false');
          });

          // Toggle selection
          if (!wasSelected) {
            this.classList.add('selected');
            this.setAttribute('aria-checked', 'true');

            // Haptic
            if (navigator.vibrate) navigator.vibrate(15);

            // Spawn floating reaction emoji
            const vibeKey = this.getAttribute('data-vibe') || 'happy';
            const floater = document.createElement('span');
            floater.className = 'bp-reaction-floater';
            floater.textContent = vibeEmojis[vibeKey] || '✨';
            this.appendChild(floater);
            setTimeout(() => floater.remove(), 750);
          }
        });

        // Keyboard accessibility
        chip.addEventListener('keydown', function (e) {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            this.click();
          }
        });
      });
    });
  }

  function init() {
    initLucideIcons();
    initOutboundTracking();
    initStickyMobileCta();
    initEntryJumpChips();
    initComparisonTouch();
    initHeroAnimations();
    initSpreadInteractions();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
