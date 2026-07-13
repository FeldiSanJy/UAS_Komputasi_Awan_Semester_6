/**
 * CV Karya Mitra — script.js
 * Navbar scroll, mobile menu, FAQ, scroll reveal
 */
(function () {
  'use strict';

  var navbar         = document.getElementById('navbar');
  var navbarToggle   = document.getElementById('navbarToggle');
  var navbarMenu     = document.getElementById('navbarMenu');
  var navbarBackdrop = document.getElementById('navbarBackdrop');
  var navLinks       = document.querySelectorAll('.navbar__link');
  var revealEls    = document.querySelectorAll('.reveal');
  var sections     = document.querySelectorAll('section[id], footer[id]');

  var SCROLL_THRESHOLD = 50;
  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var navScrollSession = 0;
  var navScrollTimers = [];
  var activeScrollAnim = null;

  function cancelSmoothScroll() {
    if (activeScrollAnim) {
      cancelAnimationFrame(activeScrollAnim);
      activeScrollAnim = null;
    }

    document.documentElement.classList.remove('is-smooth-scrolling');
  }

  function beginNavScrollSession() {
    navScrollSession += 1;
    navScrollTimers.forEach(window.clearTimeout);
    navScrollTimers = [];
    cancelSmoothScroll();
    return navScrollSession;
  }

  function scheduleNavScroll(fn, delay) {
    var session = navScrollSession;
    var id = window.setTimeout(function () {
      if (session !== navScrollSession) return;
      fn();
    }, delay);
    navScrollTimers.push(id);
  }

  function easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
  }

  function smoothScrollTo(top, options) {
    options = options || {};
    top = Math.max(0, Math.round(top));
    var duration = options.duration;
    var onComplete = options.onComplete;

    if (duration == null) {
      duration = isMobileViewport() ? 520 : 680;
    }

    cancelSmoothScroll();

    if (prefersReducedMotion) {
      forceScrollTop(top);
      if (onComplete) onComplete();
      return;
    }

    var startY = window.scrollY;
    var distance = top - startY;

    if (Math.abs(distance) < 2) {
      forceScrollTop(top);
      if (onComplete) onComplete();
      return;
    }

    document.documentElement.classList.add('is-smooth-scrolling');
    var startTime = null;
    var session = navScrollSession;

    function step(timestamp) {
      if (session !== navScrollSession) {
        cancelSmoothScroll();
        return;
      }

      if (!startTime) startTime = timestamp;
      var elapsed = timestamp - startTime;
      var progress = Math.min(elapsed / duration, 1);
      var eased = easeOutCubic(progress);
      var y = Math.round(startY + distance * eased);

      window.scrollTo(0, y);

      if (progress < 1) {
        activeScrollAnim = requestAnimationFrame(step);
      } else {
        activeScrollAnim = null;
        document.documentElement.classList.remove('is-smooth-scrolling');
        window.scrollTo(0, top);
        if (onComplete) onComplete();
      }
    }

    activeScrollAnim = requestAnimationFrame(step);
  }

  function gentleScrollRefine(getTopFn) {
    if (typeof getTopFn !== 'function') return;

    var finalTop = getTopFn();
    var diff = Math.abs(window.scrollY - finalTop);

    if (diff <= 6) return;

    if (diff < 100 && !prefersReducedMotion) {
      smoothScrollTo(finalTop, { duration: Math.min(360, 180 + diff * 1.2) });
      return;
    }

    document.documentElement.classList.add('is-nav-scrolling');
    forceScrollTop(finalTop);
    scheduleNavScroll(function () {
      document.documentElement.classList.remove('is-nav-scrolling');
    }, 80);
  }

  function settleSectionScroll(section, href, getTopFn) {
    section = section || document.getElementById(href.replace('#', ''));
    if (!section || typeof getTopFn !== 'function') return;

    setNavScreen(href);

    function prepare() {
      prepareSectionScroll(section, href);
      revealInSection(section);
      handleNavbarScroll();
    }

    prepare();

    smoothScrollTo(getTopFn(), {
      onComplete: function () {
        requestAnimationFrame(function () {
          prepare();
          scheduleNavScroll(function () {
            gentleScrollRefine(getTopFn);
          }, 60);
        });
      }
    });
  }


  function getNavbarHeight() {
    if (!navbar) return 76;
    return navbar.offsetHeight || 76;
  }

  function isMobileViewport() {
    return window.matchMedia('(max-width: 767px)').matches;
  }

  var homeHeroHeight = null;

  function captureHomeHeroHeight() {
    if (!isMobileViewport() || window.scrollY > 5) return;

    var hero = document.getElementById('home');
    if (!hero) return;

    homeHeroHeight = Math.round(hero.getBoundingClientRect().height);
  }

  function restoreHomeHeroHeight() {
    if (!isMobileViewport() || !homeHeroHeight) return;

    var hero = document.getElementById('home');
    if (!hero) return;

    hero.style.minHeight = homeHeroHeight + 'px';
  }

  function clearHomeHeroHeight() {
    var hero = document.getElementById('home');
    if (hero) hero.style.removeProperty('min-height');
  }

  function initHomeHeroCapture() {
    if (!isMobileViewport()) return;
    captureHomeHeroHeight();
    window.setTimeout(captureHomeHeroHeight, 120);
    window.setTimeout(captureHomeHeroHeight, 450);
  }

  var mobileMenuOpen = false;
  var menuScrollY = 0;

  function lockBodyScroll() {
    menuScrollY = window.scrollY || window.pageYOffset || 0;
    document.body.style.position = 'fixed';
    document.body.style.top = '-' + menuScrollY + 'px';
    document.body.style.left = '0';
    document.body.style.right = '0';
    document.body.style.width = '100%';
    document.body.classList.add('menu-open');
  }

  function unlockBodyScroll() {
    document.body.classList.remove('menu-open');
    document.body.style.removeProperty('position');
    document.body.style.removeProperty('top');
    document.body.style.removeProperty('left');
    document.body.style.removeProperty('right');
    document.body.style.removeProperty('width');
    window.scrollTo(0, menuScrollY);
  }

  function setMobileMenuState(isOpen) {
    if (!navbarMenu || !navbarToggle) return;
    if (mobileMenuOpen === isOpen) return;

    mobileMenuOpen = isOpen;

    navbarMenu.classList.toggle('is-open', isOpen);
    navbarToggle.classList.toggle('is-active', isOpen);
    navbarToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    navbarToggle.setAttribute('aria-label', isOpen ? 'Tutup menu navigasi' : 'Buka menu navigasi');

    if (isOpen) {
      lockBodyScroll();
    } else {
      unlockBodyScroll();
      navbarMenu.scrollTop = 0;
    }

    if (navbarBackdrop) {
      navbarBackdrop.classList.toggle('is-visible', isOpen);
      navbarBackdrop.setAttribute('aria-hidden', isOpen ? 'false' : 'true');
    }
  }

  function closeMobileMenu() {
    setMobileMenuState(false);
  }


  /* Navbar — .scrolled saat scroll > 50px */
  function handleNavbarScroll() {
    if (!navbar) return;
    navbar.classList.toggle('scrolled', window.scrollY > SCROLL_THRESHOLD);
  }

  if (navbar) {
    window.addEventListener('scroll', handleNavbarScroll, { passive: true });
    handleNavbarScroll();
  }

  initHomeHeroCapture();
  window.addEventListener('load', initHomeHeroCapture);

  (function initOrderTrackingCta() {
    function resolveOrderUrl() {
      var body = document.body;
      if (!body) return '';

      var configured = body.getAttribute('data-order-url') || 'http://Percetakan.test/index.php';
      var host = (window.location.hostname || '').toLowerCase();

      // Akses via IP LAN (HP/jaringan) — toko penjualan di port terpisah
      if (/^\d{1,3}(\.\d{1,3}){3}$/.test(host)) {
        var lanPort = body.getAttribute('data-order-lan-port') || '8081';
        return window.location.protocol + '//' + host + ':' + lanPort + '/index.php';
      }

      return configured;
    }

    var orderUrl = resolveOrderUrl();
    if (!orderUrl) return;

    document.querySelectorAll('.navbar__cta--order').forEach(function (link) {
      link.href = orderUrl;
    });
  })();
  window.addEventListener('orientationchange', function () {
    window.setTimeout(initHomeHeroCapture, 150);
  });

  window.addEventListener('scroll', function () {
    if (!isMobileViewport()) return;
    if (window.scrollY > 80) clearHomeHeroHeight();
  }, { passive: true });


  /* Mobile menu toggle */
  if (navbarToggle && navbarMenu) {
    navbarToggle.addEventListener('click', function (event) {
      event.preventDefault();
      event.stopPropagation();
      setMobileMenuState(!mobileMenuOpen);
    });
  }

  if (navbarBackdrop) {
    navbarBackdrop.addEventListener('click', closeMobileMenu);
  }

  window.addEventListener('resize', function () {
    if (!isMobileViewport() && mobileMenuOpen) {
      closeMobileMenu();
    }
  });

  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape' && mobileMenuOpen) {
      closeMobileMenu();
    }
  });


  /* Ripple klik — navbar link & CTA */
  function attachNavRipple(selector) {
    if (prefersReducedMotion) return;

    document.querySelectorAll(selector).forEach(function (el) {
      el.addEventListener('pointerdown', function (event) {
        if (event.button !== 0) return;

        var ripple = document.createElement('span');
        var isCta = el.classList.contains('navbar__cta');
        ripple.className = 'nav-ripple' + (isCta ? ' nav-ripple--light' : '');

        var rect = el.getBoundingClientRect();
        var size = Math.max(rect.width, rect.height) * 1.75;

        ripple.style.width = size + 'px';
        ripple.style.height = size + 'px';
        ripple.style.left = (event.clientX - rect.left - size / 2) + 'px';
        ripple.style.top = (event.clientY - rect.top - size / 2) + 'px';

        el.appendChild(ripple);
        ripple.addEventListener('animationend', function () {
          ripple.remove();
        });
      });
    });
  }

  attachNavRipple('.navbar__cta');


  /* Active link + smooth scroll */
  function setActiveNavLink(sectionId) {
    if (!navLinks || navLinks.length === 0) return;

    navLinks.forEach(function (link) {
      var href = link.getAttribute('href');
      var isActive = href === '#' + sectionId;
      link.classList.toggle('navbar__link--active', isActive);

      if (isActive) {
        link.setAttribute('aria-current', 'page');
      } else {
        link.removeAttribute('aria-current');
      }
    });
  }

  function setNavScreen(href) {
    if (!document.body.classList.contains('page-home')) return;

    var id = (href || '#home').replace('#', '').trim() || 'home';
    document.body.dataset.navScreen = id;
  }

  var NAV_SCROLL_GAP = 16;

  function revealInSection(section) {
    if (!section) return;
    section.querySelectorAll('.reveal').forEach(function (el) {
      el.style.transition = 'none';
      el.classList.add('is-visible');
    });
    void section.offsetHeight;
    section.querySelectorAll('.reveal').forEach(function (el) {
      el.style.removeProperty('transition');
    });
  }

  function getDocTop(el) {
    return el.getBoundingClientRect().top + window.scrollY;
  }

  function getLayoutDocTop(el) {
    if (!el) return 0;

    var top = 0;
    var node = el;

    while (node) {
      top += node.offsetTop;
      node = node.offsetParent;
    }

    return top;
  }

  function getNavScrollTopFromLayout(el) {
    if (!el) return 0;
    return Math.max(0, Math.round(getLayoutDocTop(el) - getNavbarHeight() - NAV_SCROLL_GAP));
  }

  function getDocBottom(el) {
    return el.getBoundingClientRect().bottom + window.scrollY;
  }

  function getSectionAnchor(section, href) {
    if (!section) return null;

    if (href === '#home') {
      return section.querySelector('.hero__content') || section;
    }

    if (href === '#layanan') {
      return section.querySelector('#layanan-start, .catalog__head, .section__header') || section;
    }

    if (href === '#faq') {
      return section.querySelector('.faq-zone__header') || section;
    }

    if (href === '#kontak') {
      return section.querySelector('.contact-split') || section.querySelector('.contact-zone__header') || section;
    }

    if (href === '#tentang') {
      return section;
    }

    return section.querySelector('.section__header, .section__label') || section;
  }

  function getNavScrollTop(anchor) {
    if (!anchor) return 0;
    return Math.max(0, Math.round(getDocTop(anchor) - getNavbarHeight() - NAV_SCROLL_GAP));
  }

  function getSectionNeighbors(section) {
    var ids = ['home', 'tentang', 'layanan', 'faq', 'kontak'];
    var idx = section ? ids.indexOf(section.id) : -1;

    return {
      prev: idx > 0 ? document.getElementById(ids[idx - 1]) : null,
      next: idx >= 0 && idx < ids.length - 1 ? document.getElementById(ids[idx + 1]) : null
    };
  }

  function clampScrollBetweenSections(scrollTop, section) {
    if (!section) return Math.max(0, Math.round(scrollTop));

    var viewportH = window.innerHeight;
    var neighbors = getSectionNeighbors(section);
    var result = scrollTop;

    if (neighbors.prev) {
      result = Math.max(result, getDocBottom(neighbors.prev));
    }

    if (neighbors.next) {
      result = Math.min(result, getDocTop(neighbors.next) - viewportH);
    }

    return Math.max(0, Math.round(result));
  }

  function getSectionScreenScrollTop(section) {
    if (!section) return 0;

    var neighbors = getSectionNeighbors(section);
    var scrollTop = getDocTop(section);

    if (neighbors.prev) {
      scrollTop = Math.max(scrollTop, getDocBottom(neighbors.prev) + 1);
    }

    if (neighbors.next) {
      scrollTop = Math.min(scrollTop, getDocTop(neighbors.next) - window.innerHeight);
    }

    return Math.max(0, Math.round(scrollTop));
  }

  function getCenteredBlockScrollTop(block, navOffset) {
    if (!block) return 0;

    var blockTop = getDocTop(block);
    var blockHeight = block.offsetHeight;
    var available = window.innerHeight - navOffset;
    var centered = blockTop - navOffset - Math.max(0, (available - blockHeight) / 2);

    return Math.max(0, Math.round(centered));
  }

  function getSectionContentBlock(section, href) {
    if (!section) return null;

    if (href === '#home') {
      return section.querySelector('.hero__wrapper') || section.querySelector('.container') || section;
    }

    if (href === '#kontak') {
      return section.querySelector('.contact-zone__inner') || section.querySelector('.container') || section;
    }

    if (href === '#faq' || href === '#tentang') {
      return section.querySelector('.container') || section;
    }

    if (href === '#layanan') {
      return section.querySelector('.container') ||
        section.querySelector('.catalog__sticky-top') ||
        section.querySelector('#layanan-start') ||
        section.querySelector('.catalog__head') ||
        section;
    }

    return section.querySelector('.container') || section;
  }

  function getIsolatedSectionScrollTop(section, href) {
    if (!section || href === '#home') return 0;

    var navOffset = getNavbarHeight() + NAV_SCROLL_GAP;
    var block = getSectionContentBlock(section, href);
    var blockHeight = block ? block.offsetHeight : section.offsetHeight;
    var available = window.innerHeight - navOffset;
    var sectionTop = getDocTop(section);
    var scrollTop;

    if (blockHeight <= available) {
      scrollTop = getCenteredBlockScrollTop(block || section, navOffset);
    } else {
      scrollTop = Math.max(0, Math.round(sectionTop - navOffset));
    }

    return clampScrollBetweenSections(scrollTop, section);
  }

  function getTentangScrollTop(section) {
    if (isMobileViewport()) {
      return getIsolatedSectionScrollTop(section, '#tentang');
    }

    var navOffset = getNavbarHeight() + NAV_SCROLL_GAP;
    var hero = document.getElementById('home');
    var layanan = document.getElementById('layanan');
    var sectionTop = getDocTop(section);
    var sectionHeight = section.offsetHeight;
    var viewportH = window.innerHeight;
    var scrollTop = sectionTop - navOffset;

    if (sectionHeight <= viewportH) {
      scrollTop = sectionTop - Math.max(navOffset, (viewportH - sectionHeight) / 2);
    }

    if (hero) {
      scrollTop = Math.max(scrollTop, getDocBottom(hero) + 2);
    }

    if (layanan) {
      var maxScroll = getDocTop(layanan) - viewportH + 12;

      if (maxScroll < scrollTop) {
        scrollTop = maxScroll;
      }
    }

    return Math.max(0, Math.round(scrollTop));
  }

  function scrollTentangIntoView() {
    var tentangSection = document.getElementById('tentang');
    if (!tentangSection) return;

    applyNavScroll(getTentangScrollTop(tentangSection), 'auto');
  }

  function getCatalogColumnCount(grid) {
    if (!grid || isMobileViewport()) return 1;

    var style = window.getComputedStyle(grid);
    var template = style.gridTemplateColumns || '';
    var tracks = template.split(' ').filter(function (part) {
      return part && part !== 'none';
    });

    return Math.max(1, tracks.length || 4);
  }

  function getCatalogRowBounds(grid, colsOverride) {
    var bounds = {
      row1Bottom: 0,
      row2Top: 0,
      hasRow2: false
    };

    if (!grid) return bounds;

    var cards = grid.querySelectorAll('.product-card:not(.is-hidden)');
    if (!cards.length) {
      cards = grid.querySelectorAll('.product-card');
    }
    if (!cards.length) return bounds;

    var cols = colsOverride || getCatalogColumnCount(grid);
    var row1Cards = [];
    var row2First = null;

    for (var i = 0; i < cards.length; i++) {
      if (i < cols) {
        row1Cards.push(cards[i]);
      } else if (!row2First) {
        row2First = cards[i];
      }
    }

    row1Cards.forEach(function (card) {
      bounds.row1Bottom = Math.max(bounds.row1Bottom, getDocBottom(card));
    });

    if (row2First) {
      bounds.row2Top = getDocTop(row2First);
      bounds.hasRow2 = true;
    }

    return bounds;
  }

  function getLayananFitScrollTop(headerScrollTop, bounds, row1Top) {
    if (!bounds || !bounds.row1Bottom) {
      return Math.max(0, headerScrollTop);
    }

    var viewportH = window.innerHeight;
    var topOffset = getNavbarHeight() + NAV_SCROLL_GAP;
    var bottomPad = 24;

    if (isMobileViewport()) {
      topOffset += getCatalogStickyTopHeight() + 8;
    }

    var row1TopMax = row1Top - topOffset - 10;
    var row1ViewMax = bounds.row1Bottom + bottomPad - viewportH;
    var hideRow2Max = bounds.hasRow2
      ? bounds.row2Top - viewportH - 24
      : Number.POSITIVE_INFINITY;

    var targetScroll;

    if (isMobileViewport()) {
      targetScroll = Math.min(row1TopMax, row1ViewMax, hideRow2Max);
      targetScroll = Math.min(targetScroll, headerScrollTop);
    } else {
      targetScroll = Math.max(headerScrollTop, row1ViewMax);
    }

    return Math.max(0, Math.round(targetScroll));
  }

  function getMobileLayananScrollTop(section) {
    return getMobileLayananAllScrollTop(section);
  }

  function getDesktopLayananScrollTop(section) {
    var navOffset = getNavbarHeight() + NAV_SCROLL_GAP;
    var container = section.querySelector('.container');
    var anchor = section.querySelector('#layanan-start') ||
      section.querySelector('.section__header') ||
      container;

    if (!container) {
      return getIsolatedSectionScrollTop(section, '#layanan');
    }

    void section.offsetHeight;
    void container.offsetHeight;

    var available = window.innerHeight - navOffset;
    var containerHeight = container.offsetHeight;
    var centered = getCenteredBlockScrollTop(container, navOffset);

    if (containerHeight > available) {
      var grid = document.getElementById('catalogGrid');

      if (grid && !grid.hidden) {
        var bounds = getCatalogRowBounds(grid);
        var head = section.querySelector('.catalog__sticky-top') ||
          section.querySelector('.catalog__head') ||
          container;
        var blockTop = getDocTop(head);
        var blockBottom = bounds.row1Bottom > blockTop
          ? bounds.row1Bottom + 16
          : getDocBottom(container);
        var blockHeight = blockBottom - blockTop;

        centered = blockTop - navOffset - Math.max(0, (available - blockHeight) / 2);
      }
    }

    if (anchor) {
      var maxScroll = getDocTop(anchor) - navOffset;
      if (centered > maxScroll) {
        centered = maxScroll;
      }
    }

    var neighbors = getSectionNeighbors(section);
    if (neighbors.next) {
      centered = Math.min(centered, getDocTop(neighbors.next) - window.innerHeight);
    }

    return Math.max(0, Math.round(centered));
  }

  function getLayananScrollTop(section) {
    if (isMobileViewport()) {
      return getMobileLayananScrollTop(section);
    }

    return getDesktopLayananScrollTop(section);
  }

  function scrollDesktopLayananIntoView() {
    if (isMobileViewport()) return;

    var layananSection = document.getElementById('layanan');
    if (!layananSection) return;

    applyNavScroll(getLayananScrollTop(layananSection), 'auto');
  }

  function getViewportCenteredScrollTop(el, navOffset) {
    if (!el) return 0;

    var blockTop = getDocTop(el);
    var blockHeight = el.offsetHeight;
    var available = window.innerHeight - navOffset;
    var centered = blockTop - navOffset - Math.max(0, (available - blockHeight) / 2);

    return Math.max(0, Math.round(centered));
  }

  function getMobileScreenScrollTop(section, innerSelector) {
    if (!section) return 0;

    var navOffset = getNavbarHeight() + NAV_SCROLL_GAP;
    var inner = section.querySelector(innerSelector) || section.querySelector('.container');
    var viewportH = window.innerHeight;
    var available = viewportH - navOffset;
    var scrollTop;

    if (!inner) {
      return getIsolatedSectionScrollTop(section, '#' + section.id);
    }

    void section.offsetHeight;
    void inner.offsetHeight;

    var innerTop = getDocTop(inner);
    var innerHeight = inner.offsetHeight;

    if (innerHeight <= available) {
      scrollTop = innerTop - navOffset - Math.max(0, (available - innerHeight) / 2);
    } else {
      scrollTop = innerTop - navOffset;
    }

    return clampScrollBetweenSections(scrollTop, section);
  }

  function closeAllFaqDetails(section) {
    if (!section) return;

    section.querySelectorAll('.faq-zone__item[open]').forEach(function (item) {
      item.removeAttribute('open');
    });
  }

  function getFaqScrollTop(section) {
    if (!section) return 0;

    closeAllFaqDetails(section);
    void section.offsetHeight;

    return getSectionScreenScrollTop(section);
  }

  function settleFaqScroll(section) {
    section = section || document.getElementById('faq');
    if (!section) return;

    settleSectionScroll(section, '#faq', function () {
      return getFaqScrollTop(section);
    });
  }

  function scrollMobileFaqIntoView() {
    settleFaqScroll();
  }

  function syncContactMapLayout() {
    var section = document.getElementById('kontak');
    var map = section && section.querySelector('.contact-split__map');
    var frame = section && section.querySelector('.contact-map__frame');

    if (!section || isMobileViewport()) {
      if (map) {
        map.style.marginTop = '';
        map.style.height = '';
      }
      if (frame) {
        frame.style.height = '';
      }
      return;
    }

    var list = section.querySelector('.contact-list');
    if (!list || !map || !frame) return;

    var firstLabel = list.querySelector('.contact-list__item:first-child .contact-list__label');
    var lastText = list.querySelector('.contact-list__item:last-child .contact-list__body p');

    if (!firstLabel || !lastText) return;

    var listRect = list.getBoundingClientRect();
    var labelRect = firstLabel.getBoundingClientRect();
    var lastRect = lastText.getBoundingClientRect();
    var topOffset = Math.max(0, Math.round(labelRect.top - listRect.top));
    var mapHeight = Math.max(220, Math.round(lastRect.bottom - labelRect.top));

    map.style.marginTop = topOffset + 'px';
    map.style.height = mapHeight + 'px';
    frame.style.height = mapHeight + 'px';
  }

  function getKontakScrollTop(section) {
    if (!section) return 0;

    syncContactMapLayout();

    var inner = section.querySelector('.contact-zone__inner');
    if (inner) {
      void inner.offsetHeight;
    }

    return getSectionScreenScrollTop(section);
  }

  function settleKontakScroll(section) {
    section = section || document.getElementById('kontak');
    if (!section) return;

    settleSectionScroll(section, '#kontak', function () {
      syncContactMapLayout();
      return getKontakScrollTop(section);
    });
  }

  function scrollMobileKontakIntoView() {
    settleKontakScroll();
  }

  function getSectionScrollTop(section, href) {
    if (href === '#home') {
      return 0;
    }

    if (href === '#tentang') {
      return getTentangScrollTop(section);
    }

    if (href === '#layanan') {
      if (isMobileViewport()) {
        return getMobileLayananScrollTop(section);
      }

      return getLayananScrollTop(section);
    }

    if (href === '#faq') {
      return getFaqScrollTop(section);
    }

    if (href === '#kontak') {
      return getKontakScrollTop(section);
    }

    return getNavScrollTop(getSectionAnchor(section, href));
  }

  function applyNavScroll(top, behavior) {
    top = Math.max(0, Math.round(top));

    if (behavior === 'smooth' && !prefersReducedMotion) {
      smoothScrollTo(top);
      return;
    }

    document.documentElement.classList.add('is-nav-scrolling');
    forceScrollTop(top);
    scheduleNavScroll(function () {
      document.documentElement.classList.remove('is-nav-scrolling');
    }, 80);
  }

  function refineNavScroll(getTopFn) {
    gentleScrollRefine(getTopFn);
  }

  function settleNavScroll(getTopFn) {
    if (typeof getTopFn !== 'function') return;

    smoothScrollTo(getTopFn(), {
      onComplete: function () {
        scheduleNavScroll(function () {
          gentleScrollRefine(getTopFn);
        }, 60);
      }
    });
  }

  function forceScrollTop(top) {
    top = Math.max(0, Math.round(top));

    if (top === 0 && isMobileViewport()) {
      window.scrollTo(0, 1);
    }

    window.scrollTo({
      top: top,
      left: 0,
      behavior: 'auto'
    });

    document.documentElement.scrollTop = top;
    document.body.scrollTop = top;
  }

  function settleHomeView() {
    if (!homeHeroHeight) captureHomeHeroHeight();

    if (isMobileViewport()) {
      restoreHomeHeroHeight();

      var hero = document.getElementById('home');
      if (hero) revealInSection(hero);
    }

    forceScrollTop(0);
    handleNavbarScroll();

    if (!isMobileViewport()) return;

    var tentang = document.getElementById('tentang');
    if (!tentang) return;

    if (tentang.getBoundingClientRect().top < window.innerHeight - 2) {
      forceScrollTop(0);
    }
  }

  function scrollToHome(options) {
    options = options || {};
    var onMobile = isMobileViewport();

    if (onMobile) {
      settleHomeView();
      scheduleNavScroll(settleHomeView, 280);
      return;
    }

    if (prefersReducedMotion) {
      forceScrollTop(0);
      return;
    }

    smoothScrollTo(0, {
      onComplete: function () {
        scheduleNavScroll(function () {
          gentleScrollRefine(function () { return 0; });
        }, 60);
      }
    });
  }

  function prepareSectionScroll(section, href) {
    if (href === '#faq' && section) {
      closeAllFaqDetails(section);
    }

    if (href === '#layanan' && isMobileViewport()) {
      if (typeof buildCatalogGrouped === 'function') {
        buildCatalogGrouped();
      }
      syncLayananStickyOffset();
    }
  }

  function settleLayananScroll(section) {
    section = section || document.getElementById('layanan');
    if (!section) return;

    settleSectionScroll(section, '#layanan', function () {
      if (typeof fixLayananProductImages === 'function') {
        fixLayananProductImages();
      }
      return getLayananScrollTop(section);
    });
  }

  function scrollToSection(target, href, options) {
    if (!target) return;

    options = options || {};
    setNavScreen(href);
    if (!options.skipBeginSession) {
      beginNavScrollSession();
    }
    var useSmooth = options.smooth !== false && !prefersReducedMotion;
    var section = target.tagName === 'SECTION' ? target : target.closest('section');

    revealInSection(section || target);

    if (href === '#home') {
      scrollToHome(options);
      return;
    }

    if (href === '#faq') {
      settleFaqScroll(section || target);
      return;
    }

    if (href === '#kontak') {
      settleKontakScroll(section || target);
      return;
    }

    if (href === '#layanan' && !isMobileViewport()) {
      prepareSectionScroll(section, href);
      settleLayananScroll(section || target);
      return;
    }

    function getTop() {
      return getSectionScrollTop(section || target, href);
    }

    if (useSmooth) {
      prepareSectionScroll(section, href);
      settleNavScroll(getTop);
      return;
    }

    prepareSectionScroll(section, href);
    applyNavScroll(getTop(), 'auto');

    scheduleNavScroll(function () {
      prepareSectionScroll(section, href);
      gentleScrollRefine(getTop);
    }, href === '#layanan' ? 120 : 80);
  }

  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (event) {
      var href = anchor.getAttribute('href');
      if (!href || href === '#') return;

      var target = document.querySelector(href);
      if (!target) return;

      event.preventDefault();

      var sectionId = href.replace('#', '');
      setActiveNavLink(sectionId);

      if (history.replaceState) {
        history.replaceState(null, '', href);
      } else {
        window.location.hash = href;
      }

      closeMobileMenu();

      beginNavScrollSession();

      var scrollDelay = isMobileViewport() ? 180 : 0;

      scheduleNavScroll(function () {
        scrollToSection(target, href, { skipBeginSession: true });
      }, scrollDelay);
    });
  });

  window.addEventListener('hashchange', function () {
    if (window.location.hash !== '#home') return;

    var home = document.getElementById('home');
    if (!home) return;

    scrollToSection(home, '#home');
  });

  if (window.location.hash) {
    var hashHref = window.location.hash;
    var hashTarget = document.querySelector(hashHref);
    if (hashTarget) {
      requestAnimationFrame(function () {
        scrollToSection(hashTarget, hashHref, { smooth: false });
      });
    }
  }

  function highlightNavOnScroll() {
    if (!sections || sections.length === 0) return;

    var probeY = window.scrollY + getNavbarHeight() + 80;

    if (isMobileViewport()) {
      probeY = window.scrollY + window.innerHeight * 0.42;
    }

    var currentId = 'home';

    sections.forEach(function (section) {
      if (!section.id) return;

      var top = getDocTop(section);
      var bottom = getDocBottom(section);

      if (probeY >= top && probeY < bottom) {
        currentId = section.id;
      }
    });

    setActiveNavLink(currentId);
    setNavScreen('#' + currentId);
  }

  if (document.body.classList.contains('page-home')) {
    document.body.dataset.navScreen = document.body.dataset.navScreen || 'home';
  }

  window.addEventListener('scroll', highlightNavOnScroll, { passive: true });
  highlightNavOnScroll();


  /* FAQ — kirim pertanyaan via WhatsApp */
  var faqAskForm = document.getElementById('faqAskForm');
  var WA_NUMBER   = '6287800150583';
  var MAP_ADDRESS = 'Ruko The Orchid I, Mejasem, Jl. Siklepuh Raya No.1A, Sibata, Mejasem Bar., Kec. Kramat, Kabupaten Tegal, Jawa Tengah 52181';
  var MAP_LAT     = -6.875627;
  var MAP_LNG     = 109.125728;

  function getMapEmbedUrl(lat, lng) {
    return 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d4858.7633867477!2d' +
      lng + '!3d' + lat +
      '!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNsKwNTInMzIuMyJTIDEwOcKwMDcnMzIuNiJF' +
      '!5e0!3m2!1sid!2sid!4v1738800000000!5m2!1sid!2sid';
  }

  function getMapOpenUrl(address) {
    return 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(address);
  }

  function getMapDirectionsUrl(address) {
    return 'https://www.google.com/maps/dir/?api=1&destination=' + encodeURIComponent(address);
  }

  (function initContactMap() {
    var embedSrc      = getMapEmbedUrl(MAP_LAT, MAP_LNG);
    var openUrl       = getMapOpenUrl(MAP_ADDRESS);
    var directionsUrl = getMapDirectionsUrl(MAP_ADDRESS);

    document.querySelectorAll('.contact-split__iframe, .contact__map iframe').forEach(function (iframe) {
      iframe.src = embedSrc;
    });

    document.querySelectorAll(
      '.contact-list__link[href*="google.com/maps"], ' +
      '.contact__link[href*="google.com/maps"]'
    ).forEach(function (link) {
      link.href = openUrl;
    });

    document.querySelectorAll('.contact-map-route').forEach(function (link) {
      link.href = directionsUrl;
    });

    document.querySelectorAll('[data-map-root]').forEach(function (root) {
      var popup = root.querySelector('.contact-map-popup');
      if (!popup) return;

      root.addEventListener('click', function (event) {
        if (event.target.closest('.contact-map-popup')) return;

        var isOpen = !popup.hidden;
        popup.hidden = isOpen;
        root.setAttribute('aria-expanded', isOpen ? 'false' : 'true');
      });

      document.addEventListener('click', function (event) {
        if (popup.hidden || root.contains(event.target)) return;
        popup.hidden = true;
        root.setAttribute('aria-expanded', 'false');
      });
    });
  })();

  if (faqAskForm) {
    faqAskForm.addEventListener('submit', function (event) {
      event.preventDefault();

      if (!faqAskForm.reportValidity()) return;

      var name     = faqAskForm.elements.name.value.trim();
      var phone    = faqAskForm.elements.phone.value.trim();
      var question = faqAskForm.elements.question.value.trim();

      var message =
        'Halo Karya Mitra, saya ingin bertanya:\n\n' +
        'Nama: ' + name + '\n' +
        'No. WA: ' + phone + '\n\n' +
        'Pertanyaan:\n' + question;

      var url = 'https://wa.me/' + WA_NUMBER + '?text=' + encodeURIComponent(message);
      window.open(url, '_blank', 'noopener,noreferrer');
    });
  }

  document.querySelectorAll('.faq-zone__item').forEach(function (item) {
    item.addEventListener('toggle', function () {
      if (!item.open) return;
      document.querySelectorAll('.faq-zone__item').forEach(function (other) {
        if (other !== item) other.open = false;
      });

      window.requestAnimationFrame(function () {
        var answer = item.querySelector('.faq-zone__a');
        if (!answer) return;

        var rect = answer.getBoundingClientRect();
        var navBottom = getNavbarHeight() + NAV_SCROLL_GAP;
        var bottomPad = 28;

        if (rect.top < navBottom) {
          window.scrollBy({
            top: rect.top - navBottom,
            behavior: prefersReducedMotion ? 'auto' : 'smooth'
          });
          return;
        }

        var overflow = rect.bottom - (window.innerHeight - bottomPad);

        if (overflow > 0) {
          window.scrollBy({
            top: overflow,
            behavior: prefersReducedMotion ? 'auto' : 'smooth'
          });
        }
      });
    });
  });


  /* Filter kategori layanan */
  function getProductImgInnerWidth(wrap) {
    if (!wrap) return 0;

    var style = window.getComputedStyle(wrap);
    var padX = parseFloat(style.paddingLeft) + parseFloat(style.paddingRight);
    return Math.max(0, Math.round(wrap.clientWidth - padX));
  }

  function applyProductPhotoSharpness(img) {
    if (!img) return;

    var wrap = img.closest('.product-card__img-wrap');
    var innerW = getProductImgInnerWidth(wrap);

    img.style.setProperty('display', 'block', 'important');
    img.style.setProperty('width', innerW > 0 ? innerW + 'px' : '100%', 'important');
    img.style.setProperty('height', 'auto', 'important');
    img.style.setProperty('max-width', '100%', 'important');
    img.style.setProperty('max-height', '100%', 'important');
    img.style.setProperty('object-fit', 'contain', 'important');
    img.style.setProperty('object-position', 'center center', 'important');
    img.style.setProperty('image-rendering', 'auto', 'important');

    if (!img.getAttribute('srcset') && img.src) {
      var src = img.getAttribute('src').split('?')[0];
      var nativeW = img.naturalWidth || 1024;
      img.setAttribute('srcset', src + ' ' + nativeW + 'w');
      img.setAttribute('sizes', '(min-width: 992px) 260px, (min-width: 768px) 220px, 180px');
    }
  }

  function fixLayananProductImages() {
    document.querySelectorAll('#layanan .product-card__img-wrap').forEach(function (wrap) {
      wrap.style.setProperty('display', 'flex', 'important');
      wrap.style.setProperty('align-items', 'center', 'important');
      wrap.style.setProperty('justify-content', 'center', 'important');
      wrap.style.setProperty('aspect-ratio', '1 / 1', 'important');
      wrap.style.setProperty('height', 'auto', 'important');
      wrap.style.setProperty('overflow', 'hidden', 'important');
    });

    document.querySelectorAll('#layanan .product-card__photo, #layanan .product-card__img-wrap > img').forEach(function (img) {
      applyProductPhotoSharpness(img);
    });
  }

  var catalogFilters = document.querySelectorAll('.catalog__filter');
  var productCards   = document.querySelectorAll('.product-card');
  var catalogGrid    = document.getElementById('catalogGrid');
  var catalogTrack   = document.getElementById('catalogTrack');
  var catalogGrouped = document.getElementById('catalogGrouped');
  var catalogEmpty   = document.getElementById('catalogEmpty');
  var catalogShiftTimer;
  var catalogScrollTimer;
  var catalogScrollRaf;
  var catalogGroupedBuilt = false;

  function getFilterButton(filterId) {
    if (!filterId) return null;
    return document.querySelector('.catalog__filter[data-filter="' + filterId + '"]');
  }

  function getCategoriesForFilter(filterId, btn) {
    if (!filterId || filterId === 'all') return null;

    btn = btn || getFilterButton(filterId);
    var list = btn && btn.getAttribute('data-categories');

    if (list) {
      return list.split(',').map(function (part) {
        return part.trim();
      }).filter(Boolean);
    }

    return [filterId];
  }

  function cardMatchesFilter(card, filterId, btn) {
    if (!filterId || filterId === 'all') return true;

    var categories = getCategoriesForFilter(filterId, btn);
    return categories.indexOf(card.getAttribute('data-category')) !== -1;
  }

  function cancelCatalogScroll() {
    if (catalogScrollRaf) {
      window.cancelAnimationFrame(catalogScrollRaf);
      catalogScrollRaf = null;
    }

    if (catalogScrollTimer) {
      window.clearTimeout(catalogScrollTimer);
      catalogScrollTimer = null;
    }
  }

  function setActiveCatalogFilter(btn) {
    catalogFilters.forEach(function (filterBtn) {
      filterBtn.classList.remove('catalog__filter--active');
      filterBtn.setAttribute('aria-selected', 'false');
    });
    btn.classList.add('catalog__filter--active');
    btn.setAttribute('aria-selected', 'true');
  }

  function scrollFilterIntoView(btn) {
    var filtersBar = btn.closest('.catalog__filters');
    if (!filtersBar) return;

    var scrollLeft = btn.offsetLeft - filtersBar.offsetWidth / 2 + btn.offsetWidth / 2;
    filtersBar.scrollTo({
      left: Math.max(0, scrollLeft),
      behavior: prefersReducedMotion ? 'auto' : 'smooth'
    });
  }

  function scrollMobileLayananIntoView() {
    if (!isMobileViewport()) return;

    var layananSection = document.getElementById('layanan');
    if (!layananSection) return;

    buildCatalogGrouped();
    syncLayananStickyOffset();
    refineNavScroll(function () {
      return getSectionScrollTop(layananSection, '#layanan');
    });
  }

  function getCatalogFilterBarHeight() {
    var filterBar = document.querySelector('#layanan .catalog__filter-bar');
    if (!filterBar) return 0;
    return filterBar.offsetHeight;
  }

  function getCatalogStickyTopHeight() {
    var stickyTop = document.querySelector('#layanan .catalog__sticky-top');
    if (stickyTop) return stickyTop.offsetHeight;
    return getCatalogFilterBarHeight();
  }

  function syncLayananStickyOffset() {
    if (!isMobileViewport()) return;

    var layananSection = document.getElementById('layanan');
    if (!layananSection) return;

    var offset = getNavbarHeight() + getCatalogStickyTopHeight() + 10;
    layananSection.style.setProperty('--layanan-sticky-offset', offset + 'px');
  }

  function getCatalogGroupScrollOffset() {
    return getNavbarHeight() + NAV_SCROLL_GAP + getCatalogStickyTopHeight() + 8;
  }

  function getCatalogGroupScrollTop(group) {
    if (!group) return 0;

    var section = document.getElementById('layanan');
    syncLayananStickyOffset();
    var scrollTop = Math.max(0, Math.round(getDocTop(group) - getCatalogGroupScrollOffset()));
    return clampScrollBetweenSections(scrollTop, section);
  }

  function getMobileLayananAllScrollTop(section) {
    section = section || document.getElementById('layanan');
    if (!section) return 0;

    buildCatalogGrouped();

    var navOffset = getNavbarHeight() + NAV_SCROLL_GAP;
    var container = section.querySelector('.container');
    var scrollTop;

    if (container) {
      var containerHeight = container.offsetHeight;
      var available = window.innerHeight - navOffset;

      if (containerHeight <= available + 40) {
        scrollTop = getViewportCenteredScrollTop(container, navOffset);
        return clampScrollBetweenSections(scrollTop, section);
      }
    }

    var stickyTop = section.querySelector('.catalog__sticky-top');
    var headerScrollTop = getNavScrollTopFromLayout(
      stickyTop || getSectionAnchor(section, '#layanan') || section
    );

    if (catalogGrouped) {
      var firstGroup = catalogGrouped.querySelector('.catalog__group');
      if (firstGroup) {
        var row = firstGroup.querySelector('.catalog__group-row');
        if (row) {
          var bounds = getCatalogRowBounds(row, 2);
          var cards = row.querySelectorAll('.product-card');
          var row1Top = cards.length ? getDocTop(cards[0]) : getDocTop(firstGroup);
          syncLayananStickyOffset();
          scrollTop = getLayananFitScrollTop(headerScrollTop, bounds, row1Top);
          return clampScrollBetweenSections(scrollTop, section);
        }

        scrollTop = getCatalogGroupScrollTop(firstGroup);
        return clampScrollBetweenSections(scrollTop, section);
      }
    }

    syncLayananStickyOffset();

    if (stickyTop) {
      scrollTop = getNavScrollTopFromLayout(stickyTop);
      return clampScrollBetweenSections(scrollTop, section);
    }

    var anchor = getSectionAnchor(section, '#layanan');
    scrollTop = getNavScrollTopFromLayout(anchor || section);
    return clampScrollBetweenSections(scrollTop, section);
  }

  function scrollToCatalogGroup(category) {
    if (!isMobileViewport() || !catalogGrouped) return;

    cancelCatalogScroll();
    setNavScreen('#layanan');

    function runScroll() {
      catalogScrollTimer = null;
      catalogScrollRaf = null;

      var group;

      if (!category || category === 'all') {
        group = catalogGrouped.querySelector('.catalog__group');
      } else {
        group = catalogGrouped.querySelector('.catalog__group[data-category="' + category + '"]');
      }

      if (!group) return;

      forceScrollTop(getCatalogGroupScrollTop(group));
      setNavScreen('#layanan');
    }

    catalogScrollRaf = window.requestAnimationFrame(function () {
      catalogScrollRaf = window.requestAnimationFrame(runScroll);
    });
  }

  function updateMobileCatalogFold() {
    if (!catalogTrack) return;

    catalogTrack.style.removeProperty('--catalog-fold-max');
    catalogTrack.style.removeProperty('min-height');
  }

  function updateCatalogScrollDots(scrollEl, dotsContainer, itemSelector, hostEl) {
    if (!scrollEl || !dotsContainer) return;

    var items = scrollEl.querySelectorAll(itemSelector);
    var dots = dotsContainer.querySelectorAll('.catalog__group-dot');
    var maxScroll = scrollEl.scrollWidth - scrollEl.clientWidth;
    var canScroll = maxScroll > 6;

    if (hostEl) {
      hostEl.classList.toggle('is-scrollable', canScroll);
    }

    if (!canScroll || !dots.length) return;

    var scrollCenter = scrollEl.scrollLeft + scrollEl.clientWidth * 0.35;
    var activeIndex = 0;

    items.forEach(function (item, index) {
      if (item.offsetLeft <= scrollCenter) {
        activeIndex = index;
      }
    });

    dots.forEach(function (dot, index) {
      dot.classList.toggle('is-active', index === activeIndex);
    });
  }

  function initCatalogGroupSliders() {
    document.querySelectorAll('#layanan .catalog__group-slider').forEach(function (slider) {
      if (slider.dataset.sliderReady === '1') return;
      slider.dataset.sliderReady = '1';

      var scrollEl = slider.querySelector('.catalog__group-scroll');
      if (!scrollEl) return;

      function refreshSlider() {
        var scrollEl = slider.querySelector('.catalog__group-scroll');
        var dotsWrap = slider.querySelector('.catalog__group-dots');
        updateCatalogScrollDots(scrollEl, dotsWrap, '.product-card', slider);
      }

      scrollEl.addEventListener('scroll', refreshSlider, { passive: true });
      window.addEventListener('resize', refreshSlider);
      window.requestAnimationFrame(refreshSlider);
    });
  }

  function buildCatalogGrouped() {
    if (!catalogGrouped || catalogGroupedBuilt) return;

    catalogFilters.forEach(function (btn) {
      var categoryId = btn.getAttribute('data-filter');
      if (!categoryId || categoryId === 'all') return;

      var labelEl = btn.querySelector('.catalog__filter-label');
      var label = labelEl ? labelEl.textContent.trim() : categoryId;
      var categories = getCategoriesForFilter(categoryId, btn);
      var cards = Array.prototype.filter.call(productCards, function (card) {
        return categories.indexOf(card.getAttribute('data-category')) !== -1;
      });

      if (!cards.length) return;

      var group = document.createElement('section');
      group.className = 'catalog__group';
      group.setAttribute('data-category', categoryId);

      var title = document.createElement('h3');
      title.className = 'catalog__group-title';
      title.textContent = label;

      var scroll = document.createElement('div');
      scroll.className = 'catalog__group-scroll';

      var row = document.createElement('div');
      row.className = 'catalog__group-row';

      cards.forEach(function (card) {
        row.appendChild(card.cloneNode(true));
      });

      scroll.appendChild(row);

      group.classList.add('catalog__group--scrollable');
      group.appendChild(title);

      var slider = document.createElement('div');
      slider.className = 'catalog__group-slider';
      slider.appendChild(scroll);

      if (cards.length > 2) {
        var dotsWrap = document.createElement('div');
        dotsWrap.className = 'catalog__group-dots';
        dotsWrap.setAttribute('aria-hidden', 'true');

        cards.forEach(function (_, index) {
          var dot = document.createElement('span');
          dot.className = 'catalog__group-dot' + (index === 0 ? ' is-active' : '');
          dotsWrap.appendChild(dot);
        });

        slider.appendChild(dotsWrap);
      }

      group.appendChild(slider);

      catalogGrouped.appendChild(group);
    });

    catalogGroupedBuilt = true;
    initCatalogGroupSliders();
    fixLayananProductImages();
  }

  function applyCatalogCategory(category, activeBtn) {
    var mobile = isMobileViewport();

    activeBtn = activeBtn || getFilterButton(category);

    buildCatalogGrouped();

    if (mobile && catalogGrouped) {
      if (catalogGrid) {
        catalogGrid.hidden = true;
      }

      catalogGrouped.hidden = false;

      if (catalogTrack) {
        catalogTrack.classList.add('catalog__track--grouped', 'catalog__track--all');
      }

      productCards.forEach(function (card) {
        card.classList.add('is-hidden');
      });

      var groups = catalogGrouped.querySelectorAll('.catalog__group');
      var visible = 0;

      groups.forEach(function (group) {
        group.hidden = false;
        visible += group.querySelectorAll('.product-card').length;
      });

      if (catalogEmpty) {
        catalogEmpty.hidden = visible > 0;
      }

      updateMobileCatalogFold();
      syncLayananStickyOffset();
      initCatalogGroupSliders();
      fixLayananProductImages();

      return visible;
    }

    if (catalogGrouped) {
      catalogGrouped.hidden = true;
    }

    if (catalogGrid) {
      catalogGrid.hidden = false;
      catalogGrid.classList.remove('catalog__grid--clip-row1');
      catalogGrid.style.removeProperty('max-height');
      catalogGrid.style.removeProperty('padding-bottom');
    }

      if (catalogTrack) {
        catalogTrack.classList.remove('catalog__track--grouped', 'catalog__track--all', 'catalog__track--clip-row1');
        catalogTrack.style.removeProperty('--catalog-fold-max');
        catalogTrack.style.removeProperty('min-height');
      }

    var visible = 0;

    productCards.forEach(function (card) {
      var show = cardMatchesFilter(card, category, activeBtn);
      card.classList.toggle('is-hidden', !show);
      if (show) visible++;
    });

    if (catalogEmpty) {
      catalogEmpty.hidden = visible > 0;
    }

    fixLayananProductImages();

    return visible;
  }

  function playCatalogShift(category, activeBtn) {
    if (catalogShiftTimer) {
      window.clearTimeout(catalogShiftTimer);
      catalogShiftTimer = null;
    }

    cancelCatalogScroll();

    if (isMobileViewport()) {
      setNavScreen('#layanan');
    }

    if (catalogGrid) {
      catalogGrid.classList.remove('is-shifting-in', 'is-shifting-active', 'is-shifting-out');
    }

    applyCatalogCategory(category, activeBtn);

    if (isMobileViewport()) {
      catalogShiftTimer = window.setTimeout(function () {
        catalogShiftTimer = null;
        scrollToCatalogGroup(category);
      }, 80);
    } else if (document.body.dataset.navScreen === 'layanan') {
      catalogShiftTimer = window.setTimeout(function () {
        catalogShiftTimer = null;
        settleLayananScroll();
      }, 100);
    }
  }

  if (catalogFilters.length && productCards.length) {
    catalogFilters.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var category = btn.getAttribute('data-filter');

        if (!btn.classList.contains('catalog__filter--active')) {
          setActiveCatalogFilter(btn);
        }

        scrollFilterIntoView(btn);
        playCatalogShift(category, btn);
      });
    });

    var initialFilter = document.querySelector('.catalog__filter--active') || catalogFilters[0];
    applyCatalogCategory(
      initialFilter.getAttribute('data-filter'),
      initialFilter
    );

    window.setTimeout(updateMobileCatalogFold, 120);
    window.setTimeout(function () {
      updateMobileCatalogFold();
      syncLayananStickyOffset();
    }, 400);

    window.addEventListener('resize', function () {
      var activeFilter = document.querySelector('.catalog__filter--active');
      if (!activeFilter) return;
      applyCatalogCategory(activeFilter.getAttribute('data-filter'), activeFilter);
      updateMobileCatalogFold();
      syncLayananStickyOffset();
    });

    window.addEventListener('load', function () {
      updateMobileCatalogFold();
      fixLayananProductImages();
    });

    fixLayananProductImages();
  }

  if (document.getElementById('layanan')) {
    var layananImgResizeTimer;

    fixLayananProductImages();
    window.addEventListener('load', fixLayananProductImages);
    window.addEventListener('resize', function () {
      window.clearTimeout(layananImgResizeTimer);
      layananImgResizeTimer = window.setTimeout(fixLayananProductImages, 120);
    });
    document.querySelectorAll('#layanan .product-card__photo').forEach(function (img) {
      if (!img.complete) {
        img.addEventListener('load', fixLayananProductImages, { once: true });
      }
    });
  }


  if (document.getElementById('kontak')) {
    window.addEventListener('load', syncContactMapLayout);
    window.addEventListener('resize', syncContactMapLayout);
  }


  /* Scroll reveal */
  document.documentElement.classList.add('js-reveal');

  if (!revealEls || revealEls.length === 0) return;

  if (prefersReducedMotion || !('IntersectionObserver' in window)) {
    revealEls.forEach(function (el) {
      el.classList.add('is-visible');
    });
    return;
  }

  var revealObserver = new IntersectionObserver(
    function (entries, observer) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -48px 0px' }
  );

  revealEls.forEach(function (el, index) {
    el.style.transitionDelay = (index % 5) * 0.07 + 's';
    revealObserver.observe(el);
  });

})();
