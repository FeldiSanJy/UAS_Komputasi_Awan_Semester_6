/**
 * Percetakan Karya Mitra - Admin Panel JavaScript
 * Integrated with PHP API (MySQL backend).
 */

// State variables
let categories = [];
let products = [];
let users = [];
let profile = {};
let faqs = [];

let currentProductImageBase64 = "";

const isLoginPage = window.location.pathname.endsWith('login.html');
const isRegisterPage = window.location.pathname.endsWith('register.html');
const isDashboardPage = window.location.pathname.endsWith('index.html') || window.location.pathname.endsWith('/admin/');

// Global Alert Notification Helper
function showAlert(message, type = "success") {
  const alertContainer = document.getElementById('globalAlert') || document.getElementById('alertContainer');
  if (!alertContainer) return;

  const alertDiv = document.createElement('div');
  alertDiv.className = `alert alert--${type}`;
  alertDiv.innerHTML = `
    <i class="fa-solid ${type === 'success' ? 'fa-circle-check' : 'fa-circle-exclamation'}"></i>
    <div>${message}</div>
  `;

  alertContainer.innerHTML = '';
  alertContainer.appendChild(alertDiv);

  if (isDashboardPage) {
    setTimeout(() => {
      alertDiv.style.opacity = '0';
      alertDiv.style.transform = 'translateY(-10px)';
      alertDiv.style.transition = 'all 0.3s ease';
      setTimeout(() => alertDiv.remove(), 300);
    }, 5000);
  }
}

// Indonesian Date Formatting Helper (Hari, DD Bulan YYYY - HH:MM WIB)
function formatIndonesianDate(dateStr) {
  if (!dateStr) return "-";
  // Replace space with T for valid ISO parsing if needed
  const normalizedStr = dateStr.replace(" ", "T");
  const date = new Date(normalizedStr);
  if (isNaN(date.getTime())) return dateStr;
  
  const days = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
  const months = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
  
  const dayName = days[date.getDay()];
  const day = date.getDate();
  const monthName = months[date.getMonth()];
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  
  return `${dayName}, ${day} ${monthName} ${year} - ${hours}:${minutes} WIB`;
}

// Fetch all datasets from MySQL database
function fetchAllDatabaseData(callback) {
  fetch('api.php?action=get_all_data')
    .then(response => {
      if (response.status === 401) {
        if (isDashboardPage) {
          window.location.href = 'login.html';
        }
        return;
      }
      return response.json();
    })
    .then(data => {
      if (data && data.status === 'success') {
        categories = data.categories || [];
        products = data.products || [];
        users = data.users || [];
        profile = data.profile || {};
        faqs = data.faqs || [];
        
        // Cache in localStorage for fallback/sync compatibility
        localStorage.setItem('adminCategories', JSON.stringify(categories));
        localStorage.setItem('adminProducts', JSON.stringify(products));
        localStorage.setItem('adminUsers', JSON.stringify(users));
        localStorage.setItem('adminCompanyProfile', JSON.stringify(profile));
        localStorage.setItem('adminFaqs', JSON.stringify(faqs));
        
        if (callback) callback();
      } else {
        console.error("API error:", data ? data.message : "unknown error");
        // Fallback to local storage
        loadLocalStorageData();
        if (callback) callback();
      }
    })
    .catch(err => {
      console.error("Connection failed, falling back to local storage:", err);
      loadLocalStorageData();
      if (callback) callback();
    });
}

function loadLocalStorageData() {
  categories = JSON.parse(localStorage.getItem('adminCategories')) || [];
  products = JSON.parse(localStorage.getItem('adminProducts')) || [];
  users = JSON.parse(localStorage.getItem('adminUsers')) || [];
  profile = JSON.parse(localStorage.getItem('adminCompanyProfile')) || {};
  faqs = JSON.parse(localStorage.getItem('adminFaqs')) || [];
}

// ----------------------------------------------------
// AUTHENTICATION LOGIC (API Based)
// ----------------------------------------------------

if (isRegisterPage) {
  const registerForm = document.getElementById('registerForm');
  if (registerForm) {
    registerForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const username = document.getElementById('username').value.trim().toLowerCase();
      const password = document.getElementById('password').value;
      const confirmPassword = document.getElementById('confirmPassword').value;

      if (password !== confirmPassword) {
        showAlert("Password dan Konfirmasi Password tidak cocok!", "danger");
        return;
      }

      fetch('api.php?action=register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      })
      .then(r => r.json())
      .then(data => {
        if (data.status === 'success') {
          showAlert("Registrasi berhasil! Mengalihkan ke halaman login...", "success");
          setTimeout(() => {
            window.location.href = 'login.html';
          }, 1500);
        } else {
          showAlert(data.message, "danger");
        }
      })
      .catch(err => {
        console.error(err);
        showAlert("Koneksi gagal: Gagal menghubungi API server.", "danger");
      });
    });
  }
}

if (isLoginPage) {
  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const username = document.getElementById('username').value.trim().toLowerCase();
      const password = document.getElementById('password').value;

      fetch('api.php?action=login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      })
      .then(r => r.json())
      .then(data => {
        if (data.status === 'success') {
          sessionStorage.setItem('adminLoggedIn', 'true');
          sessionStorage.setItem('adminUsername', data.username);
          sessionStorage.setItem('adminFullname', data.fullname);
          showAlert("Login berhasil! Mengalihkan...", "success");
          setTimeout(() => {
            window.location.href = 'index.html';
          }, 1000);
        } else {
          showAlert(data.message, "danger");
        }
      })
      .catch(err => {
        console.error(err);
        showAlert("Koneksi gagal: Gagal menghubungi API server.", "danger");
      });
    });
  }
}

// Auth Guard Check
if (isDashboardPage) {
  if (sessionStorage.getItem('adminLoggedIn') !== 'true') {
    window.location.href = 'login.html';
  }
}

// ----------------------------------------------------
// DASHBOARD NAVIGATION & INITIALIZATION
// ----------------------------------------------------

if (isDashboardPage) {
  document.addEventListener('DOMContentLoaded', () => {
    // Populate user profile info in sidebar
    const fullname = sessionStorage.getItem('adminFullname') || "Administrator";
    document.getElementById('userName').textContent = fullname;
    document.getElementById('userAvatar').textContent = fullname.charAt(0).toUpperCase();

    // Theme Toggle Handler
    const themeToggleBtn = document.getElementById('themeToggle');
    const savedTheme = localStorage.getItem('adminTheme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);

    themeToggleBtn.addEventListener('click', () => {
      const currentTheme = document.documentElement.getAttribute('data-theme');
      const newTheme = currentTheme === 'light' ? 'dark' : 'light';
      document.documentElement.setAttribute('data-theme', newTheme);
      localStorage.setItem('adminTheme', newTheme);
      updateThemeIcon(newTheme);
    });

    function updateThemeIcon(theme) {
      const icon = themeToggleBtn.querySelector('i');
      if (theme === 'dark') {
        icon.className = 'fa-solid fa-sun';
      } else {
        icon.className = 'fa-solid fa-moon';
      }
    }

    // Sidebar Mobile Toggle
    const sidebar = document.getElementById('sidebar');
    const sidebarToggle = document.getElementById('sidebarToggle');
    sidebarToggle.addEventListener('click', () => {
      sidebar.classList.toggle('active');
    });

    // Close mobile sidebar if clicking outside
    document.addEventListener('click', (e) => {
      if (window.innerWidth <= 768 && !sidebar.contains(e.target) && !sidebarToggle.contains(e.target)) {
        sidebar.classList.remove('active');
      }
    });

    // Navigation Tabs Router
    const navLinks = document.querySelectorAll('.sidebar__link');
    const sections = document.querySelectorAll('.content-section');
    const pageTitle = document.getElementById('pageTitle');

    navLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const targetId = link.getAttribute('data-target');
        const targetTitle = link.querySelector('span').textContent;

        navLinks.forEach(l => l.classList.remove('active'));
        link.classList.add('active');

        sections.forEach(s => s.classList.remove('active'));
        document.getElementById(targetId).classList.add('active');

        pageTitle.textContent = targetTitle;
        sidebar.classList.remove('active');

        loadTabData(targetId);
      });
    });

    // Logout Action
    document.getElementById('logoutBtn').addEventListener('click', () => {
      if (confirm('Apakah Anda yakin ingin keluar dari panel admin?')) {
        fetch('api.php?action=logout')
          .then(() => {
            sessionStorage.clear();
            window.location.href = 'login.html';
          })
          .catch(() => {
            sessionStorage.clear();
            window.location.href = 'login.html';
          });
      }
    });

    // Quick Action button routing
    document.getElementById('quickAddProduct').addEventListener('click', () => {
      switchTab('products-section', 'Produk');
      openProductModalForm();
    });

    document.getElementById('quickAddCategory').addEventListener('click', () => {
      switchTab('categories-section', 'Kategori');
      openCategoryModalForm();
    });

    // MySQL Database Restore Form Handler
    const dbRestoreForm = document.getElementById('dbRestoreForm');
    const dbSqlFile = document.getElementById('dbSqlFile');
    const dbSqlFileText = document.getElementById('dbSqlFileText');

    if (dbSqlFile) {
      dbSqlFile.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
          dbSqlFileText.textContent = file.name;
        } else {
          dbSqlFileText.textContent = "Pilih File SQL";
        }
      });
    }

    if (dbRestoreForm) {
      dbRestoreForm.addEventListener('submit', (e) => {
        e.preventDefault();

        if (!dbSqlFile.files || dbSqlFile.files.length === 0) {
          alert("Silakan pilih file SQL terlebih dahulu!");
          return;
        }

        const file = dbSqlFile.files[0];
        const ext = file.name.split('.').pop().toLowerCase();
        if (ext !== 'sql') {
          alert("Error: Hanya menerima file dengan ekstensi .sql!");
          return;
        }

        if (file.size > 5 * 1024 * 1024) {
          alert("Error: Ukuran file maksimal adalah 5MB!");
          return;
        }

        const confirmMsg = 'Proses ini akan menimpa data saat ini, yakin ingin melanjutkan?';
        if (!confirm(confirmMsg)) {
          return;
        }

        const formData = new FormData();
        formData.append('sql_file', file);

        const submitBtn = dbRestoreForm.querySelector('button[type="submit"]');
        const originalBtnHtml = submitBtn.innerHTML;
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Menjalankan Restore...';

        fetch('backup_db.php?action=import', {
          method: 'POST',
          body: formData
        })
        .then(response => {
          if (!response.ok) {
            throw new Error("HTTP error " + response.status);
          }
          return response.json();
        })
        .then(data => {
          submitBtn.disabled = false;
          submitBtn.innerHTML = originalBtnHtml;
          
          if (data.status === 'success') {
            showAlert(data.message, "success");
            dbRestoreForm.reset();
            dbSqlFileText.textContent = "Pilih File SQL";
            
            // Reload all database data to refresh client side state
            fetchAllDatabaseData(() => {
              loadTabData('backup-section');
            });
          } else {
            alert("Error: " + data.message + (data.details ? "\n\nDetail: " + data.details : ""));
          }
        })
        .catch(error => {
          submitBtn.disabled = false;
          submitBtn.innerHTML = originalBtnHtml;
          console.error("Restore error:", error);
          alert("Koneksi gagal: Gagal menghubungi server backend backup PHP.");
        });
      });
    }

    // Load initial datasets from MySQL, then render Dashboard
    fetchAllDatabaseData(() => {
      loadTabData('dashboard-section');
    });
  });
}

function switchTab(sectionId, title) {
  const navLink = document.querySelector(`.sidebar__link[data-target="${sectionId}"]`);
  if (navLink) {
    document.querySelectorAll('.sidebar__link').forEach(l => l.classList.remove('active'));
    navLink.classList.add('active');
  }

  document.querySelectorAll('.content-section').forEach(s => s.classList.remove('active'));
  document.getElementById(sectionId).classList.add('active');
  document.getElementById('pageTitle').textContent = title;

  loadTabData(sectionId);
}

function loadTabData(sectionId) {
  // Update stats counters
  document.getElementById('statUsersCount').textContent = Math.max(users.length, 1);
  document.getElementById('statProductsCount').textContent = products.length;
  document.getElementById('statCategoriesCount').textContent = categories.length;

  if (sectionId === 'dashboard-section') {
    renderRecentProducts();
  } else if (sectionId === 'products-section') {
    renderProductsTable();
    populateCategoryDropdowns();
  } else if (sectionId === 'categories-section') {
    renderCategoriesTable();
  }
}

// ----------------------------------------------------
// DASHBOARD TAB: Recent uploads
// ----------------------------------------------------
function renderRecentProducts() {
  const tbody = document.getElementById('recentProductsTable');
  if (!tbody) return;
  tbody.innerHTML = '';

  const recent = [...products].slice(0, 5);

  if (recent.length === 0) {
    tbody.innerHTML = `<tr><td colspan="4" style="text-align: center; color: var(--text-muted); padding: 24px;">Belum ada produk yang diunggah.</td></tr>`;
    return;
  }

  recent.forEach(p => {
    const catObj = categories.find(c => c.slug === p.category) || { name: p.category };
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td style="text-align: center;"><img src="${p.image}" class="table-image" alt="${p.name}"></td>
      <td><strong>${escapeHtml(p.name)}</strong></td>
      <td><span class="badge badge--primary">${escapeHtml(catObj.name)}</span></td>
      <td>${formatIndonesianDate(p.uploaded_at)}</td>
    `;
    tbody.appendChild(tr);
  });
}

// ----------------------------------------------------
// CATEGORY CRUD OPERATIONS
// ----------------------------------------------------
const categoryModal = document.getElementById('categoryModal');
const categoryForm = document.getElementById('categoryForm');

const CATEGORY_ICONS = [
  { class: "fa-solid fa-tag", name: "Tag" },
  { class: "fa-solid fa-calendar-days", name: "Kalender" },
  { class: "fa-solid fa-panorama", name: "Banner/Spanduk" },
  { class: "fa-solid fa-display", name: "Display" },
  { class: "fa-solid fa-envelope-open-text", name: "Undangan" },
  { class: "fa-solid fa-bullhorn", name: "Promo" },
  { class: "fa-solid fa-book", name: "Buku" },
  { class: "fa-solid fa-box", name: "Box" },
  { class: "fa-solid fa-bag-shopping", name: "Merchandise" },
  { class: "fa-solid fa-shirt", name: "Pakaian" },
  { class: "fa-solid fa-mug-hot", name: "Mug" },
  { class: "fa-solid fa-id-card", name: "Kartu Nama" },
  { class: "fa-solid fa-stamp", name: "Stempel" },
  { class: "fa-solid fa-scroll", name: "Sertifikat" },
  { class: "fa-solid fa-print", name: "Cetak" },
  { class: "fa-solid fa-image", name: "Foto" },
  { class: "fa-solid fa-file-invoice", name: "Nota" },
  { class: "fa-solid fa-palette", name: "Desain" }
];

if (isDashboardPage) {
  document.getElementById('addCategoryBtn').addEventListener('click', () => openCategoryModalForm());
  document.getElementById('closeCategoryModal').addEventListener('click', () => closeCategoryModalForm());
  document.getElementById('cancelCategoryModal').addEventListener('click', () => closeCategoryModalForm());

  document.getElementById('catName').addEventListener('input', (e) => {
    const nameVal = e.target.value;
    const slugInput = document.getElementById('catSlug');
    slugInput.value = nameVal.toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-+|-+$/g, '');
  });

  categoryForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const id = document.getElementById('catId').value;
    const name = document.getElementById('catName').value.trim();
    const slug = name.toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-+|-+$/g, '');
    const icon = document.getElementById('catIcon').value.trim();

    fetch('api.php?action=save_category', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, name, slug, icon })
    })
    .then(r => r.json())
    .then(data => {
      if (data.status === 'success') {
        showAlert(id ? "Kategori berhasil diperbarui!" : "Kategori baru berhasil ditambahkan!");
        fetchAllDatabaseData(() => {
          closeCategoryModalForm();
          renderCategoriesTable();
        });
      } else {
        alert(data.message);
      }
    })
    .catch(err => {
      console.error(err);
      alert("Error: Gagal menghubungi API server.");
    });
  });
}

function initIconPicker() {
  const picker = document.getElementById('iconPicker');
  if (!picker) return;
  
  picker.innerHTML = '';
  CATEGORY_ICONS.forEach(icon => {
    const item = document.createElement('div');
    item.className = 'icon-picker__item';
    item.setAttribute('data-icon', icon.class);
    item.setAttribute('title', icon.name);
    item.innerHTML = `<i class="${icon.class}"></i>`;
    
    item.addEventListener('click', () => {
      document.querySelectorAll('.icon-picker__item').forEach(el => el.classList.remove('active'));
      item.classList.add('active');
      document.getElementById('catIcon').value = icon.class;
    });
    
    picker.appendChild(item);
  });
}

function openCategoryModalForm(category = null) {
  categoryModal.classList.add('active');
  const title = document.getElementById('categoryModalTitle');
  
  initIconPicker();
  
  if (category) {
    title.textContent = "Edit Kategori";
    document.getElementById('catId').value = category.id;
    document.getElementById('catName').value = category.name;
    document.getElementById('catSlug').value = category.slug;
    document.getElementById('catIcon').value = category.icon;
    
    const activeItem = document.querySelector(`.icon-picker__item[data-icon="${category.icon}"]`);
    if (activeItem) activeItem.classList.add('active');
  } else {
    title.textContent = "Tambah Kategori";
    categoryForm.reset();
    document.getElementById('catId').value = "";
    document.getElementById('catSlug').value = "";
    document.getElementById('catIcon').value = "fa-solid fa-tag";
    
    const activeItem = document.querySelector(`.icon-picker__item[data-icon="fa-solid fa-tag"]`);
    if (activeItem) activeItem.classList.add('active');
  }
}

function closeCategoryModalForm() {
  categoryModal.classList.remove('active');
  categoryForm.reset();
}

function renderCategoriesTable() {
  const grid = document.getElementById('categoriesGrid');
  if (!grid) return;
  grid.innerHTML = '';

  if (categories.length === 0) {
    grid.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; color: var(--text-muted); padding: 48px; background: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: var(--border-radius);">
        <i class="fa-solid fa-tags" style="font-size: 2.5rem; margin-bottom: 12px; color: var(--text-muted);"></i>
        <p>Belum ada kategori. Klik "Tambah Kategori" untuk membuat.</p>
      </div>`;
    return;
  }

  categories.forEach(c => {
    const prodCount = products.filter(p => p.category === c.slug).length;
    const card = document.createElement('div');
    card.className = 'category-card';
    card.innerHTML = `
      <div class="category-card__header">
        <div class="category-card__icon-container">
          <i class="${escapeHtml(c.icon)}"></i>
        </div>
        <div class="category-card__info">
          <h3 class="category-card__name">${escapeHtml(c.name)}</h3>
          <div class="category-card__meta">
            <span>${prodCount} Produk</span>
          </div>
        </div>
      </div>
      <div class="category-card__actions">
        <button class="btn btn--secondary btn--sm edit-cat-btn" data-id="${c.id}"><i class="fa-solid fa-pen"></i> Edit</button>
        <button class="btn btn--danger btn--sm delete-cat-btn" data-id="${c.id}"><i class="fa-solid fa-trash"></i> Hapus</button>
      </div>
    `;
    grid.appendChild(card);
  });

  // Bind edit/delete buttons
  document.querySelectorAll('.edit-cat-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-id');
      const cat = categories.find(c => c.id === id);
      if (cat) openCategoryModalForm(cat);
    });
  });

  document.querySelectorAll('.delete-cat-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-id');
      const cat = categories.find(c => c.id === id);
      if (!cat) return;

      const count = products.filter(p => p.category === cat.slug).length;
      let confirmMsg = `Apakah Anda yakin ingin menghapus kategori "${cat.name}"?`;
      if (count > 0) {
        confirmMsg = `Peringatan! Ada ${count} produk yang menggunakan kategori "${cat.name}". Menghapus kategori ini tidak dapat dilakukan sebelum produk dipindahkan ke kategori lain.`;
        alert(confirmMsg);
        return;
      }

      if (confirm(confirmMsg)) {
        fetch('api.php?action=delete_category', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id })
        })
        .then(r => r.json())
        .then(data => {
          if (data.status === 'success') {
            showAlert(`Kategori "${cat.name}" berhasil dihapus.`, "danger");
            fetchAllDatabaseData(() => {
              renderCategoriesTable();
            });
          } else {
            alert(data.message);
          }
        })
        .catch(err => {
          console.error(err);
          alert("Error: Gagal menghubungi API server.");
        });
      }
    });
  });
}

// ----------------------------------------------------
// PRODUCT CRUD OPERATIONS
// ----------------------------------------------------
const productModal = document.getElementById('productModal');
const productForm = document.getElementById('productForm');
const prodImageFile = document.getElementById('prodImageFile');
const prodImagePreview = document.getElementById('prodImagePreview');
const uploadText = document.getElementById('uploadText');

if (isDashboardPage) {
  document.getElementById('addProductBtn').addEventListener('click', () => openProductModalForm());
  document.getElementById('closeProductModal').addEventListener('click', () => closeProductModalForm());
  document.getElementById('cancelProductModal').addEventListener('click', () => closeProductModalForm());

  document.getElementById('productSearch').addEventListener('input', () => renderProductsTable());
  document.getElementById('productFilterCategory').addEventListener('change', () => renderProductsTable());

  prodImageFile.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        currentProductImageBase64 = event.target.result;
        prodImagePreview.style.display = 'block';
        prodImagePreview.querySelector('img').src = currentProductImageBase64;
        uploadText.textContent = `File terpilih: ${file.name}`;
      };
      reader.readAsDataURL(file);
    }
  });

  productForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const id = document.getElementById('prodId').value;
    const name = document.getElementById('prodName').value.trim();
    const category = document.getElementById('prodCategory').value;

    let image = currentProductImageBase64;

    if (!image) {
      if (id) {
        const existingProduct = products.find(p => p.id === id);
        if (existingProduct) image = existingProduct.image;
      } else {
        const colors = [
          ["0056cc", "06b6d4"],
          ["10b981", "059669"],
          ["f59e0b", "d97706"],
          ["ec4899", "be185d"],
          ["8b5cf6", "6d28d9"]
        ];
        const randomColor = colors[Math.floor(Math.random() * colors.length)];
        image = generateMockImage(name, randomColor[0], randomColor[1]);
      }
    }

    fetch('api.php?action=save_product', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, name, category, image })
    })
    .then(r => r.json())
    .then(data => {
      if (data.status === 'success') {
        showAlert(id ? "Produk berhasil diperbarui!" : "Produk baru berhasil diunggah!");
        fetchAllDatabaseData(() => {
          closeProductModalForm();
          renderProductsTable();
        });
      } else {
        alert(data.message);
      }
    })
    .catch(err => {
      console.error(err);
      alert("Error: Gagal menghubungi API server.");
    });
  });
}

// Client mock image SVG base64 (fallback placeholder)
function generateMockImage(text, bgColor1 = "0056cc", bgColor2 = "06b6d4") {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="400" height="400">
    <defs>
      <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:#${bgColor1};stop-opacity:1" />
        <stop offset="100%" style="stop-color:#${bgColor2};stop-opacity:1" />
      </linearGradient>
    </defs>
    <rect width="100%" height="100%" fill="url(#grad)" />
    <circle cx="200" cy="180" r="60" fill="white" fill-opacity="0.15" />
    <path d="M170 180 L230 180 M200 150 L200 210" stroke="white" stroke-width="6" stroke-linecap="round" opacity="0.6"/>
    <text x="50%" y="290" dominant-baseline="middle" text-anchor="middle" font-family="'Outfit', sans-serif" font-weight="700" font-size="24" fill="white">${text}</text>
    <text x="50%" y="320" dominant-baseline="middle" text-anchor="middle" font-family="'Plus Jakarta Sans', sans-serif" font-weight="500" font-size="14" fill="white" opacity="0.7">Karya Mitra Printing</text>
  </svg>`;
  return 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svg)));
}

function openProductModalForm(product = null) {
  productModal.classList.add('active');
  const title = document.getElementById('productModalTitle');
  populateCategoryDropdowns();

  if (product) {
    title.textContent = "Edit Produk";
    document.getElementById('prodId').value = product.id;
    document.getElementById('prodName').value = product.name;
    document.getElementById('prodCategory').value = product.category;
    
    currentProductImageBase64 = product.image;
    prodImagePreview.style.display = 'block';
    prodImagePreview.querySelector('img').src = product.image;
    uploadText.textContent = "Klik untuk mengganti gambar";
  } else {
    title.textContent = "Unggah Produk";
    productForm.reset();
    document.getElementById('prodId').value = "";
    currentProductImageBase64 = "";
    prodImagePreview.style.display = 'none';
    prodImagePreview.querySelector('img').src = "";
    uploadText.textContent = "Klik atau drag file gambar di sini";
  }
}

function closeProductModalForm() {
  productModal.classList.remove('active');
  productForm.reset();
  currentProductImageBase64 = "";
  prodImagePreview.style.display = 'none';
  prodImagePreview.querySelector('img').src = "";
  uploadText.textContent = "Klik atau drag file gambar di sini";
}

function populateCategoryDropdowns() {
  const prodCategorySelect = document.getElementById('prodCategory');
  const filterCategorySelect = document.getElementById('productFilterCategory');
  
  if (!prodCategorySelect) return;

  const prevFilterVal = filterCategorySelect.value;

  prodCategorySelect.innerHTML = '<option value="" disabled selected>Pilih Kategori...</option>';
  filterCategorySelect.innerHTML = '<option value="all">Semua Kategori</option>';

  categories.forEach(c => {
    const opt1 = document.createElement('option');
    opt1.value = c.slug;
    opt1.textContent = c.name;
    prodCategorySelect.appendChild(opt1);

    const opt2 = document.createElement('option');
    opt2.value = c.slug;
    opt2.textContent = c.name;
    filterCategorySelect.appendChild(opt2);
  });

  filterCategorySelect.value = prevFilterVal;
}

function renderProductsTable() {
  const tbody = document.getElementById('productsTableBody');
  if (!tbody) return;
  tbody.innerHTML = '';

  const searchVal = document.getElementById('productSearch').value.trim().toLowerCase();
  const filterCat = document.getElementById('productFilterCategory').value;

  const filtered = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchVal);
    const matchesFilter = filterCat === 'all' || p.category === filterCat;
    return matchesSearch && matchesFilter;
  });

  if (filtered.length === 0) {
    tbody.innerHTML = `<tr><td colspan="5" style="text-align: center; color: var(--text-muted); padding: 24px;">Tidak ada produk ditemukan.</td></tr>`;
    return;
  }

  filtered.forEach(p => {
    const catObj = categories.find(c => c.slug === p.category) || { name: p.category };
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td style="text-align: center;"><img src="${p.image}" class="table-image" alt="${p.name}"></td>
      <td><strong>${escapeHtml(p.name)}</strong></td>
      <td><span class="badge badge--primary">${escapeHtml(catObj.name)}</span></td>
      <td>${formatIndonesianDate(p.uploaded_at)}</td>
      <td style="text-align: right;">
        <div style="display: inline-flex; gap: 8px; justify-content: flex-end; align-items: center; width: 100%;">
          <button class="btn btn--secondary btn--sm edit-prod-btn" data-id="${p.id}"><i class="fa-solid fa-pen"></i> Edit</button>
          <button class="btn btn--danger btn--sm delete-prod-btn" data-id="${p.id}"><i class="fa-solid fa-trash"></i> Hapus</button>
        </div>
      </td>
    `;
    tbody.appendChild(tr);
  });

  // Bind events
  document.querySelectorAll('.edit-prod-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-id');
      const prod = products.find(p => p.id === id);
      if (prod) openProductModalForm(prod);
    });
  });

  document.querySelectorAll('.delete-prod-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-id');
      const prod = products.find(p => p.id === id);
      if (prod && confirm(`Apakah Anda yakin ingin menghapus produk "${prod.name}"?`)) {
        fetch('api.php?action=delete_product', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id })
        })
        .then(r => r.json())
        .then(data => {
          if (data.status === 'success') {
            showAlert(`Produk "${prod.name}" berhasil dihapus.`, "danger");
            fetchAllDatabaseData(() => {
              renderProductsTable();
            });
          } else {
            alert(data.message);
          }
        })
        .catch(err => {
          console.error(err);
          alert("Error: Gagal menghubungi API server.");
        });
      }
    });
  });
}

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
