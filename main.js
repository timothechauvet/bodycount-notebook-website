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
   * Two-Page Spread View Mode Switcher (Both / Recto / Verso)
   */
  function initSpreadTabs() {
    const tabButtons = document.querySelectorAll('.spread-tab-btn');
    const spreadContainer = document.getElementById('notebookDoubleSpread');

    if (!tabButtons.length || !spreadContainer) return;

    tabButtons.forEach((btn) => {
      btn.addEventListener('click', function () {
        const view = this.getAttribute('data-view');

        tabButtons.forEach((b) => {
          b.classList.remove('active');
          b.setAttribute('aria-selected', 'false');
        });
        this.classList.add('active');
        this.setAttribute('aria-selected', 'true');

        spreadContainer.classList.remove('view-recto', 'view-verso');
        if (view === 'recto') {
          spreadContainer.classList.add('view-recto');
        } else if (view === 'verso') {
          spreadContainer.classList.add('view-verso');
        }
      });
    });
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
   * Initialize Lucide Icons
   */
  function initLucideIcons() {
    if (typeof window.lucide !== 'undefined' && typeof window.lucide.createIcons === 'function') {
      window.lucide.createIcons();
    }
  }

  function init() {
    initLucideIcons();
    initOutboundTracking();
    initStickyMobileCta();
    initSpreadTabs();
    initEntryJumpChips();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
