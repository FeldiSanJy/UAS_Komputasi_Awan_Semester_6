(function () {
  'use strict';

  document.documentElement.classList.add('js-scroll-reveal');

  const header = document.getElementById('header');
  const navToggle = document.getElementById('navToggle');
  const nav = document.getElementById('nav');

  function getScrollOffset(extra) {
    const headerH = header ? header.offsetHeight : 72;
    return headerH + (extra || 0);
  }

  function scrollToLayanan() {
    requestAnimationFrame(function () {
      const start = document.getElementById('layanan-start');
      if (!start) return;

      const finalTop = start.getBoundingClientRect().top + window.scrollY - getScrollOffset(4);
      window.scrollTo(0, Math.max(0, finalTop));
    });
  }

  function scrollToTarget(target, extra) {
    const top = target.getBoundingClientRect().top + window.scrollY - getScrollOffset(extra);
    window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
  }

  function closeMobileNav() {
    nav.classList.remove('nav--open');
    navToggle.classList.remove('nav-toggle--active');
    navToggle.setAttribute('aria-expanded', 'false');
  }

  /* Sticky header shadow */
  window.addEventListener('scroll', function () {
    header.classList.toggle('header--scrolled', window.scrollY > 10);
  });

  /* Mobile menu */
  navToggle.addEventListener('click', function () {
    const isOpen = nav.classList.toggle('nav--open');
    navToggle.classList.toggle('nav-toggle--active', isOpen);
    navToggle.setAttribute('aria-expanded', isOpen);
    navToggle.setAttribute('aria-label', isOpen ? 'Tutup menu' : 'Buka menu');
  });

  /* Smooth scroll with header offset */
  document.querySelectorAll('a[href^="#"]').forEach(function (link) {
    link.addEventListener('click', function (e) {
      const href = link.getAttribute('href');
      if (!href || href === '#') return;

      const target = document.querySelector(href);
      if (!target) return;

      e.preventDefault();

      if (href === '#layanan') {
        scrollToLayanan();
      } else {
        scrollToTarget(target, 8);
      }

      closeMobileNav();
    });
  });

  /* Product catalog filter */
  const filters = document.querySelectorAll('.catalog__filter');
  const products = document.querySelectorAll('.product-card');
  const catalogEmpty = document.getElementById('catalogEmpty');

  function getCategoriesForFilter(filterId, btn) {
    if (!filterId || filterId === 'all') return null;
    const list = btn && btn.getAttribute('data-categories');
    if (list) {
      return list.split(',').map(function (part) {
        return part.trim();
      }).filter(Boolean);
    }
    return [filterId];
  }

  function cardMatchesFilter(card, filterId, btn) {
    if (!filterId || filterId === 'all') return true;
    const categories = getCategoriesForFilter(filterId, btn);
    return categories.indexOf(card.dataset.category) !== -1;
  }

  if (filters.length && products.length) {
    filters.forEach(function (btn) {
      btn.addEventListener('click', function () {
        const category = btn.dataset.filter;

        filters.forEach(function (f) {
          f.classList.remove('catalog__filter--active');
          f.setAttribute('aria-selected', 'false');
        });
        btn.classList.add('catalog__filter--active');
        btn.setAttribute('aria-selected', 'true');

        const filtersBar = btn.closest('.catalog__filters');
        if (filtersBar) {
          const isMobile = window.matchMedia('(max-width: 640px)').matches;
          const scrollLeft = isMobile
            ? btn.offsetLeft - 24
            : btn.offsetLeft - filtersBar.offsetWidth / 2 + btn.offsetWidth / 2;
          filtersBar.scrollTo({ left: Math.max(0, scrollLeft), behavior: 'smooth' });
        }

        let visible = 0;
        products.forEach(function (card) {
          const show = cardMatchesFilter(card, category, btn);
          card.classList.toggle('is-hidden', !show);
          if (show) visible++;
        });

        if (catalogEmpty) {
          catalogEmpty.hidden = visible > 0;
        }
      });
    });
  }

  /* Hero carousel (home) */
  const heroCarousel = document.getElementById('heroCarousel');
  if (heroCarousel) {
    const slides = heroCarousel.querySelectorAll('.hero-carousel__slide');
    const dots = heroCarousel.querySelectorAll('.hero-carousel__dot');
    let current = 0;
    let timer = null;
    const interval = 4500;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function goTo(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === current);
        dot.setAttribute('aria-selected', i === current ? 'true' : 'false');
      });
    }

    function startAuto() {
      if (reducedMotion || slides.length < 2) return;
      stopAuto();
      timer = window.setInterval(function () {
        goTo(current + 1);
      }, interval);
    }

    function stopAuto() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        goTo(parseInt(dot.dataset.slide, 10));
        startAuto();
      });
    });

    heroCarousel.addEventListener('mouseenter', stopAuto);
    heroCarousel.addEventListener('mouseleave', startAuto);
    heroCarousel.addEventListener('focusin', stopAuto);
    heroCarousel.addEventListener('focusout', startAuto);

    startAuto();
  }

  /* About v2 & Galeri produk — scroll reveal */
  const revealEls = document.querySelectorAll('.about-v2__metric, .about-v2__highlight, .showcase-v2__item');
  if (revealEls.length) {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReduced) {
      revealEls.forEach(function (el) {
        el.classList.add('is-revealed');
      });
    } else {
      const revealObserver = new IntersectionObserver(function (entries, observer) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('is-revealed');
          observer.unobserve(entry.target);
        });
      }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

      revealEls.forEach(function (el, index) {
        el.style.transitionDelay = (index % 4) * 0.08 + 's';
        revealObserver.observe(el);
      });
    }
  }

  var MAP_ADDRESS = 'Ruko The Orchid I, Mejasem, Jl. Siklepuh Raya No.1A, Sibata, Mejasem Bar., Kec. Kramat, Kabupaten Tegal, Jawa Tengah 52181';
  var directionsUrl = 'https://www.google.com/maps/dir/?api=1&destination=' + encodeURIComponent(MAP_ADDRESS);

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
