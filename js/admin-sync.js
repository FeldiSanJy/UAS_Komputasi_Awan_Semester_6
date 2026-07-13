/**
 * Percetakan Karya Mitra - Admin Sync Script
 * Dynamically updates homepage and services catalog with data from the Admin Panel.
 */
(function () {
  'use strict';

  document.addEventListener('DOMContentLoaded', function () {
    // Fetch live database data from server MySQL DB via PHP
    fetch('admin/api.php?action=get_public_data')
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => {
        if (data && data.status === 'success') {
          // Sync into localStorage for instant load next time / offline fallback
          localStorage.setItem('adminCategories', JSON.stringify(data.categories || []));
          localStorage.setItem('adminProducts', JSON.stringify(data.products || []));
          localStorage.setItem('adminCompanyProfile', JSON.stringify(data.profile || {}));
          localStorage.setItem('adminFaqs', JSON.stringify(data.faqs || []));
        }
        runSyncAndRender();
      })
      .catch(err => {
        console.error('Admin Sync: Failed to fetch live data, using cached localStorage fallback.', err);
        runSyncAndRender();
      });

    function runSyncAndRender() {
      const categoriesData = localStorage.getItem('adminCategories');
      const productsData = localStorage.getItem('adminProducts');
      const profileData = localStorage.getItem('adminCompanyProfile');
      const faqsData = localStorage.getItem('adminFaqs');

      // 1. RENDER DYNAMIC CATEGORY FILTERS
      if (categoriesData) {
        try {
          const categories = JSON.parse(categoriesData);
          const filtersWrapper = document.querySelector('.catalog__filters');

          if (filtersWrapper) {
            let filtersHtml = `
              <button class="catalog__filter catalog__filter--active" type="button" data-filter="all" role="tab" aria-selected="true">
                <span class="catalog__filter-icon"><i class="fa-solid fa-border-all" aria-hidden="true"></i></span>
                <span class="catalog__filter-label">Semua</span>
              </button>
            `;

            categories.forEach(function (cat) {
              filtersHtml += `
                <button class="catalog__filter" type="button" data-filter="${escapeHtml(cat.slug)}" role="tab" aria-selected="false">
                  <span class="catalog__filter-icon"><i class="${escapeHtml(cat.icon)}" aria-hidden="true"></i></span>
                  <span class="catalog__filter-label">${escapeHtml(cat.name)}</span>
                </button>
              `;
            });

            filtersWrapper.innerHTML = filtersHtml;
          }
        } catch (e) {
          console.error('Admin Sync: Error rendering categories.', e);
        }
      }

      // 2. RENDER DYNAMIC PRODUCT CARDS
      if (productsData && categoriesData) {
        try {
          const categories = JSON.parse(categoriesData);
          const products = JSON.parse(productsData);
          const catalogGrid = document.getElementById('catalogGrid') || document.querySelector('.catalog__grid');

          if (catalogGrid) {
            let productsHtml = '';
            const reversedProducts = [...products].reverse();

            reversedProducts.forEach(function (prod) {
              const catObj = categories.find(c => c.slug === prod.category) || { name: prod.category };
              productsHtml += `
                <article class="product-card" data-category="${escapeHtml(prod.category)}">
                  <div class="product-card__img-wrap">
                    <img class="product-card__photo" src="${prod.image}" alt="${escapeHtml(prod.name)}" width="1024" height="1024" loading="lazy">
                  </div>
                  <div class="product-card__body">
                    <span class="product-card__cat">${escapeHtml(catObj.name)}</span>
                    <h3 class="product-card__title">${escapeHtml(prod.name)}</h3>
                  </div>
                </article>
              `;
            });

            productsHtml += `<p class="catalog__empty" id="catalogEmpty" hidden>Tidak ada produk di kategori ini.</p>`;
            catalogGrid.innerHTML = productsHtml;

            // Rebind filter click events
            const filtersWrapper = document.querySelector('.catalog__filters');
            const dynamicFilters = filtersWrapper ? filtersWrapper.querySelectorAll('.catalog__filter') : [];
            const dynamicProducts = catalogGrid.querySelectorAll('.product-card');
            const catalogEmpty = document.getElementById('catalogEmpty');

            if (dynamicFilters.length && dynamicProducts.length) {
              dynamicFilters.forEach(function (btn) {
                btn.addEventListener('click', function () {
                  const selectedCategory = btn.dataset.filter;

                  // Update active filter states
                  dynamicFilters.forEach(function (f) {
                    f.classList.remove('catalog__filter--active');
                    f.setAttribute('aria-selected', 'false');
                  });
                  btn.classList.add('catalog__filter--active');
                  btn.setAttribute('aria-selected', 'true');

                  // Scroll filters wrapper on mobile
                  if (filtersWrapper) {
                    const isMobile = window.matchMedia('(max-width: 640px)').matches;
                    const scrollLeft = isMobile
                      ? btn.offsetLeft - 24
                      : btn.offsetLeft - filtersWrapper.offsetWidth / 2 + btn.offsetWidth / 2;
                    filtersWrapper.scrollTo({ left: Math.max(0, scrollLeft), behavior: 'smooth' });
                  }

                  // Show/Hide products matching selection
                  let visibleCount = 0;
                  dynamicProducts.forEach(function (card) {
                    const matches = (selectedCategory === 'all' || card.dataset.category === selectedCategory);
                    card.classList.toggle('is-hidden', !matches);
                    
                    if (matches) {
                      card.style.display = '';
                      visibleCount++;
                    } else {
                      card.style.display = 'none';
                    }
                  });

                  // Toggle empty placeholder visibility
                  if (catalogEmpty) {
                    catalogEmpty.hidden = visibleCount > 0;
                    catalogEmpty.style.display = visibleCount > 0 ? 'none' : 'block';
                  }
                });
              });
            }
          }
        } catch (e) {
          console.error('Admin Sync: Error rendering products.', e);
        }
      }

      // 3. RENDER COMPANY PROFILE DATA
      if (profileData) {
        try {
          const prof = JSON.parse(profileData);
          const syncElements = document.querySelectorAll('[data-sync]');

          syncElements.forEach(function (el) {
            const type = el.dataset.sync;
            switch (type) {
              case 'name':
                el.textContent = prof.name;
                break;
              case 'subtitle':
                el.textContent = prof.subtitle;
                break;
              case 'tagline':
                el.textContent = prof.tagline;
                break;
              case 'hours':
                updateTextContentOrSpan(el, prof.hours);
                break;
              case 'address':
                updateTextContentOrSpan(el, prof.address);
                break;
              case 'phone':
                updateTextContentOrSpan(el, prof.phone);
                break;
              case 'phone-link':
                const cleanNum = prof.phone.replace(/[^0-9]/g, '');
                const waNum = cleanNum.startsWith('0') ? '62' + cleanNum.substring(1) : cleanNum;
                el.href = 'https://wa.me/' + waNum;
                if (el.tagName === 'A' && el.querySelector('span')) {
                  const textSpan = el.querySelector('span');
                  if (textSpan) textSpan.textContent = prof.phone;
                } else if (el.tagName === 'A' && !el.innerHTML.includes('<i')) {
                  el.textContent = prof.phone;
                }
                break;
              case 'fb-link':
                el.href = 'https://www.facebook.com/' + prof.facebook;
                if (el.tagName === 'A' && !el.innerHTML.includes('<i')) el.textContent = prof.facebook;
                break;
              case 'ig-link':
                el.href = 'https://www.instagram.com/' + prof.instagram;
                if (el.tagName === 'A' && !el.innerHTML.includes('<i')) el.textContent = '@' + prof.instagram;
                break;
              case 'tt-link':
                el.href = 'https://www.tiktok.com/@' + prof.tiktok;
                if (el.tagName === 'A' && !el.innerHTML.includes('<i')) el.textContent = '@' + prof.tiktok;
                break;
              case 'yt-link':
                el.href = 'https://www.youtube.com/@' + prof.youtube;
                if (el.tagName === 'A' && !el.innerHTML.includes('<i')) el.textContent = '@' + prof.youtube;
                break;
              case 'inaproc-link':
                el.href = prof.inaproc;
                break;
              case 'order-link':
                el.href = prof.orderUrl;
                break;
              case 'map-embed':
                if (el.tagName === 'IFRAME') el.src = prof.mapEmbed;
                break;
              case 'map-link':
                el.href = prof.mapDirection;
                break;
              case 'hero-title':
                el.innerHTML = prof.heroTitle;
                break;
              case 'hero-desc':
                el.textContent = prof.heroDesc;
                break;
              case 'about-lead':
                el.textContent = prof.aboutLead;
                break;
              case 'about-text':
                el.textContent = prof.aboutText;
                break;
              case 'vision':
                el.textContent = prof.vision;
                break;
              case 'mission':
                if (prof.mission) {
                  const items = prof.mission.split('\n').filter(i => i.trim() !== '');
                  let missionHtml = '';
                  items.forEach(function (item) {
                    missionHtml += `<li><i class="fa-solid fa-check" aria-hidden="true"></i> ${escapeHtml(item)}</li>`;
                  });
                  el.innerHTML = missionHtml;
                }
                break;
            }
          });
        } catch (e) {
          console.error('Admin Sync: Error rendering company profile.', e);
        }
      }

      // 4. RENDER DYNAMIC FAQS
      if (faqsData) {
        try {
          const faqs = JSON.parse(faqsData);
          const faqContainer = document.querySelector('[data-sync="faq-container"]');

          if (faqContainer && faqs.length > 0) {
            let faqHtml = '';
            faqs.forEach(function (faq, index) {
              const num = String(index + 1).padStart(2, '0');
              faqHtml += `
                <details class="faq-zone__item">
                  <summary class="faq-zone__q">
                    <span class="faq-zone__num" aria-hidden="true">${num}</span>
                    <span class="faq-zone__q-text">${escapeHtml(faq.question)}</span>
                    <span class="faq-zone__chev" aria-hidden="true"><i class="fa-solid fa-chevron-down"></i></span>
                  </summary>
                  <div class="faq-zone__a">
                    <p>${escapeHtml(faq.answer).replace(/\n/g, '<br>')}</p>
                  </div>
                </details>
              `;
            });
            faqContainer.innerHTML = faqHtml;
          }
        } catch (e) {
          console.error('Admin Sync: Error rendering FAQs.', e);
        }
      }

      console.log('Admin Sync: Successfully loaded all dynamic content.');
    }
  });

  // Helper to update inner text or inner span while preserving icons
  function updateTextContentOrSpan(parentEl, text) {
    const span = parentEl.querySelector('span') || parentEl.querySelector('p');
    if (span) {
      span.textContent = text;
    } else {
      const icon = parentEl.querySelector('i');
      if (icon) {
        parentEl.innerHTML = '';
        parentEl.appendChild(icon);
        const textNode = document.createTextNode(' ' + text);
        parentEl.appendChild(textNode);
      } else {
        parentEl.textContent = text;
      }
    }
  }

  // Simple HTML Escaper
  function escapeHtml(string) {
    const map = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    };
    return String(string).replace(/[&<>"']/g, function(m) { return map[m]; });
  }
})();
