<?php
/**
 * Percetakan Karya Mitra - Server Side API
 * Handles database auto-initialization, tables creation, seeding, login, logout, and CRUD.
 */

// Error reporting
ini_set('display_errors', 0);
error_reporting(E_ALL);

header('Content-Type: application/json; charset=utf-8');

require_once 'db_config.php';

session_start();

// Helper to send json response
function sendResponse($status, $message, $extra = []) {
    $res = array_merge(['status' => $status, 'message' => $message], $extra);
    echo json_encode($res);
    exit;
}

// 1. Establish MySQLi connection with auto-database creation
$port = defined('DB_PORT') ? DB_PORT : '3306';
$conn = mysqli_connect(DB_HOST, DB_USER, DB_PASS, null, $port);
if (!$conn) {
    sendResponse('error', 'Koneksi MySQL gagal: ' . mysqli_connect_error());
}

// Create database if not exists
$dbNameEscaped = "`" . str_replace("`", "``", DB_NAME) . "`";
if (!mysqli_query($conn, "CREATE DATABASE IF NOT EXISTS $dbNameEscaped CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci")) {
    sendResponse('error', 'Gagal membuat database: ' . mysqli_error($conn));
}

// Select database
if (!mysqli_select_db($conn, DB_NAME)) {
    sendResponse('error', 'Gagal menyeleksi database: ' . mysqli_error($conn));
}

mysqli_set_charset($conn, 'utf8mb4');

// 2. Auto-create tables if they do not exist
$tablesQueries = [
    "users" => "CREATE TABLE IF NOT EXISTS `users` (
        `id` INT AUTO_INCREMENT PRIMARY KEY,
        `username` VARCHAR(100) UNIQUE NOT NULL,
        `password` VARCHAR(255) NOT NULL,
        `fullname` VARCHAR(100) NOT NULL,
        `role` VARCHAR(50) DEFAULT 'Admin'
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;",

    "categories" => "CREATE TABLE IF NOT EXISTS `categories` (
        `id` VARCHAR(50) PRIMARY KEY,
        `name` VARCHAR(100) NOT NULL,
        `slug` VARCHAR(100) UNIQUE NOT NULL,
        `icon` VARCHAR(100) NOT NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;",

    "products" => "CREATE TABLE IF NOT EXISTS `products` (
        `id` VARCHAR(50) PRIMARY KEY,
        `name` VARCHAR(200) NOT NULL,
        `category` VARCHAR(100) NOT NULL,
        `image` LONGTEXT NOT NULL,
        `uploaded_at` DATETIME NOT NULL,
        FOREIGN KEY (`category`) REFERENCES `categories`(`slug`) ON UPDATE CASCADE ON DELETE RESTRICT
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;",

    "company_profile" => "CREATE TABLE IF NOT EXISTS `company_profile` (
        `cfg_key` VARCHAR(50) PRIMARY KEY,
        `cfg_value` LONGTEXT NOT NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;",

    "faqs" => "CREATE TABLE IF NOT EXISTS `faqs` (
        `id` VARCHAR(50) PRIMARY KEY,
        `question` TEXT NOT NULL,
        `answer` TEXT NOT NULL,
        `sort_order` INT DEFAULT 0
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;"
];

foreach ($tablesQueries as $tableName => $query) {
    if (!mysqli_query($conn, $query)) {
        sendResponse('error', "Gagal membuat tabel `$tableName`: " . mysqli_error($conn));
    }
}

// 3. Helper to generate default mock SVG base64 images
function generateMockImage($text, $bgColor1 = "0056cc", $bgColor2 = "06b6d4") {
    $svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="400" height="400">
    <defs>
      <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:#' . $bgColor1 . ';stop-opacity:1" />
        <stop offset="100%" style="stop-color:#' . $bgColor2 . ';stop-opacity:1" />
      </linearGradient>
    </defs>
    <rect width="100%" height="100%" fill="url(#grad)" />
    <circle cx="200" cy="180" r="60" fill="white" fill-opacity="0.15" />
    <path d="M170 180 L230 180 M200 150 L200 210" stroke="white" stroke-width="6" stroke-linecap="round" opacity="0.6"/>
    <text x="50%" y="290" dominant-baseline="middle" text-anchor="middle" font-family="\'Outfit\', sans-serif" font-weight="700" font-size="24" fill="white">' . htmlspecialchars($text) . '</text>
    <text x="50%" y="320" dominant-baseline="middle" text-anchor="middle" font-family="\'Plus Jakarta Sans\', sans-serif" font-weight="500" font-size="14" fill="white" opacity="0.7">Karya Mitra Printing</text>
  </svg>';
    return 'data:image/svg+xml;base64,' . base64_encode($svg);
}

// 4. Seeding Default Data if Empty
// User seeding
$userCheck = mysqli_query($conn, "SELECT COUNT(*) FROM `users`");
if (mysqli_fetch_row($userCheck)[0] == 0) {
    $hashed = password_hash('admin', PASSWORD_DEFAULT);
    mysqli_query($conn, "INSERT INTO `users` (`username`, `password`, `fullname`, `role`) VALUES ('admin', '$hashed', 'Administrator', 'Super Admin')");
}

// Categories seeding
$catCheck = mysqli_query($conn, "SELECT COUNT(*) FROM `categories`");
if (mysqli_fetch_row($catCheck)[0] == 0) {
    $defaultCats = [
        ['cat-1', 'Kalender', 'kalender', 'fa-solid fa-calendar-days'],
        ['cat-2', 'Spanduk-Banner', 'spanduk-banner', 'fa-solid fa-panorama'],
        ['cat-3', 'Display', 'display', 'fa-solid fa-display'],
        ['cat-4', 'Kartu-Undangan', 'kartu-undangan', 'fa-solid fa-envelope-open-text'],
        ['cat-5', 'Stiker-Label', 'stiker-label', 'fa-solid fa-tags'],
        ['cat-6', 'Materi Promo', 'materi-promosi', 'fa-solid fa-bullhorn'],
        ['cat-7', 'Buku-Dokumen', 'buku-dokumen', 'fa-solid fa-book'],
        ['cat-8', 'Box Makanan', 'box', 'fa-solid fa-box'],
        ['cat-9', 'Merchandise', 'merchandise', 'fa-solid fa-bag-shopping']
    ];
    foreach ($defaultCats as $c) {
        $stmt = mysqli_prepare($conn, "INSERT INTO `categories` (`id`, `name`, `slug`, `icon`) VALUES (?, ?, ?, ?)");
        mysqli_stmt_bind_param($stmt, 'ssss', $c[0], $c[1], $c[2], $c[3]);
        mysqli_stmt_execute($stmt);
    }
}

// Products seeding
$prodCheck = mysqli_query($conn, "SELECT COUNT(*) FROM `products`");
if (mysqli_fetch_row($prodCheck)[0] == 0) {
    $defaultProds = [
        ['prod-1', 'Kalender Dinding Hanger', 'kalender', generateMockImage("Kalender Dinding", "4f46e5", "06b6d4")],
        ['prod-2', 'Kalender Meja / Duduk', 'kalender', generateMockImage("Kalender Duduk", "0284c7", "3b82f6")],
        ['prod-3', 'Spanduk Flexi Banner 280g', 'spanduk-banner', generateMockImage("Spanduk Flexi", "b91c1c", "f97316")],
        ['prod-4', 'Roll Up Banner Aluminium', 'display', generateMockImage("Roll Up Banner", "0f766e", "14b8a6")],
        ['prod-5', 'Stiker Vinyl Die Cut', 'stiker-label', generateMockImage("Stiker Vinyl", "6d28d9", "a855f7")]
    ];
    $now = date('Y-m-d H:i:s');
    foreach ($defaultProds as $p) {
        $stmt = mysqli_prepare($conn, "INSERT INTO `products` (`id`, `name`, `category`, `image`, `uploaded_at`) VALUES (?, ?, ?, ?, ?)");
        mysqli_stmt_bind_param($stmt, 'sssss', $p[0], $p[1], $p[2], $p[3], $now);
        mysqli_stmt_execute($stmt);
    }
}

// Profile seeding
$profileCheck = mysqli_query($conn, "SELECT COUNT(*) FROM `company_profile`");
if (mysqli_fetch_row($profileCheck)[0] == 0) {
    $defaultProfile = [
        'name' => "KARYA MITRA",
        'subtitle' => "DIGITAL PRINTING",
        'tagline' => "18 tahun pengalaman — mitra cetak terpercaya di Tegal dan sekitarnya.",
        'inaproc' => "https://katalog.inaproc.id/karya-mitra",
        'orderUrl' => "http://Percetakan.test/index.php",
        'phone' => "0878-0015-0583",
        'address' => "Ruko The Orchid I, Mejasem, Jl. Siklepuh Raya No.1A, Sibata, Mejasem Bar., Kec. Kramat, Kabupaten Tegal, Jawa Tengah 52181",
        'mapEmbed' => "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d4858.7633867477!2d109.125728!3d-6.875627!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNsKwNTInMzIuMyJTIDEwOcKwMDcnMzIuNiJF!5e0!3m2!1sid!2sid!4v1738800000000!5m2!1sid!2sid",
        'mapDirection' => "https://www.google.com/maps/dir/?api=1&destination=Ruko+The+Orchid+I,+Mejasem,+Jl.+Siklepuh+Raya+No.1A,+Sibata,+Mejasem+Bar.,+Kec.+Kramat,+Kabupaten+Tegal,+Jawa+Tengah+52181",
        'facebook' => "percetakan.karyamitra.77",
        'instagram' => "karyamitra.percetakan",
        'tiktok' => "karyamitra.percetakan",
        'youtube' => "percetakankaryamitra2732",
        'hours' => "Senin – Sabtu, 08.00 – 17.00 WIB",
        'heroTitle' => "Solusi Cetak Berkualitas untuk Bisnis Anda",
        'heroDesc' => "Dari spanduk, stiker, kemasan, hingga kebutuhan cetak personal — kualitas premium, harga transparan, dan pengerjaan tepat waktu di Mejasem, Tegal.",
        'aboutLead' => "Mitra Cetak Terpercaya untuk Bisnis Anda",
        'aboutText' => "Di Mejasem, Tegal, Karya Mitra hadir sebagai mitra cetak — mengutamakan kualitas, ketepatan waktu, dan harga transparan untuk UMKM hingga instansi. Didukung fasilitas produksi lengkap dan mesin banner digital, kami melayani paper bag, spanduk, stiker, kemasan, hingga cetak personal — dari desain gratis hingga siap pakai.",
        'vision' => "Menjadi percetakan terpercaya di Tegal dan sekitarnya yang dikenal akan kualitas hasil, pelayanan ramah, dan harga yang terjangkau.",
        'mission' => "Memberikan hasil cetak berkualitas dengan teknologi dan bahan terbaik\nMemberikan pelayanan cepat, transparan, dan solutif bagi setiap pelanggan\nMendampingi UMKM dan instansi dalam kebutuhan branding & promosi\nTerus berinovasi mengikuti kebutuhan pasar percetakan digital"
    ];
    foreach ($defaultProfile as $k => $v) {
        $stmt = mysqli_prepare($conn, "INSERT INTO `company_profile` (`cfg_key`, `cfg_value`) VALUES (?, ?)");
        mysqli_stmt_bind_param($stmt, 'ss', $k, $v);
        mysqli_stmt_execute($stmt);
    }
}

// FAQs seeding
$faqCheck = mysqli_query($conn, "SELECT COUNT(*) FROM `faqs`");
if (mysqli_fetch_row($faqCheck)[0] == 0) {
    $defaultFaqs = [
        [
            'id' => 'faq-1',
            'question' => "Apakah ada minimal order untuk pemesanan cetak?",
            'answer' => "Minimal order tergantung jenis produk. Untuk banner, stiker, dan cetak digital lainnya, pesanan satuan dapat kami proses. Silakan hubungi kami terlebih dahulu untuk konfirmasi."
        ],
        [
            'id' => 'faq-2',
            'question' => "Berapa lama durasi pengerjaan pesanan?",
            'answer' => "Cetak digital biasanya selesai dalam 1–3 hari kerja. Pesanan offset atau jumlah besar membutuhkan sekitar 3–7 hari kerja. Estimasi waktu akan kami sampaikan sebelum produksi dimulai."
        ],
        [
            'id' => 'faq-3',
            'question' => "Apa syarat file untuk cetak?",
            'answer' => "File wajib siap cetak dan dikirim saat pemesanan melalui email. Format yang diterima: TIFF, JPEG, atau file yang sudah dikonversi sesuai ketentuan.\n\nApabila file tidak memenuhi syarat tersebut, kami tidak bertanggung jawab atas kesalahan hasil cetak."
        ],
        [
            'id' => 'faq-4',
            'question' => "Apakah tersedia jasa desain?",
            'answer' => "Kami menyediakan jasa desain di meja desain. Biaya dihitung berdasarkan lama waktu penggunaan. Siapkan brief, referensi, dan detail pesanan agar proses lebih efisien."
        ],
        [
            'id' => 'faq-5',
            'question' => "Bagaimana cara memesan dan pembayaran?",
            'answer' => "Klik Pesan Sekarang, pilih produk, lalu unggah file siap cetak — tim kami konfirmasi harga sebelum produksi. Bisa juga via WhatsApp, email, atau datang ke workshop.\n\nBayar QRIS, transfer bank, atau tunai. Kode QRIS dikirim setelah konfirmasi. Bisa DP; pelunasan saat barang siap."
        ]
    ];
    $idx = 0;
    foreach ($defaultFaqs as $f) {
        $stmt = mysqli_prepare($conn, "INSERT INTO `faqs` (`id`, `question`, `answer`, `sort_order`) VALUES (?, ?, ?, ?)");
        mysqli_stmt_bind_param($stmt, 'sssi', $f['id'], $f['question'], $f['answer'], $idx);
        mysqli_stmt_execute($stmt);
        $idx++;
    }
}

// 5. Handle Actions
$action = isset($_GET['action']) ? $_GET['action'] : '';

// Authentication verification helper for protected routes
function verifyAdminSession() {
    if (!isset($_SESSION['adminLoggedIn']) || $_SESSION['adminLoggedIn'] !== true) {
        header('HTTP/1.1 401 Unauthorized');
        sendResponse('error', 'Akses ditolak. Silakan login terlebih dahulu.');
    }
}

// Fetch all categories
function dbGetCategories($conn) {
    $res = mysqli_query($conn, "SELECT * FROM `categories` ORDER BY `name` ASC");
    $list = [];
    while ($row = mysqli_fetch_assoc($res)) {
        $list[] = $row;
    }
    return $list;
}

// Fetch all products
function dbGetProducts($conn) {
    $res = mysqli_query($conn, "SELECT * FROM `products` ORDER BY `uploaded_at` DESC");
    $list = [];
    while ($row = mysqli_fetch_assoc($res)) {
        $list[] = $row;
    }
    return $list;
}

// Fetch company profile as flat key-value array
function dbGetProfile($conn) {
    $res = mysqli_query($conn, "SELECT * FROM `company_profile`");
    $profile = [];
    while ($row = mysqli_fetch_assoc($res)) {
        $profile[$row['cfg_key']] = $row['cfg_value'];
    }
    return $profile;
}

// Fetch all FAQs
function dbGetFaqs($conn) {
    $res = mysqli_query($conn, "SELECT * FROM `faqs` ORDER BY `sort_order` ASC");
    $list = [];
    while ($row = mysqli_fetch_assoc($res)) {
        $list[] = $row;
    }
    return $list;
}

// Public Data Endpoint (No session check required)
if ($action === 'get_public_data') {
    sendResponse('success', 'Data publik berhasil diambil.', [
        'categories' => dbGetCategories($conn),
        'products' => dbGetProducts($conn),
        'profile' => dbGetProfile($conn),
        'faqs' => dbGetFaqs($conn)
    ]);
}

// Login
if ($action === 'login') {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        sendResponse('error', 'Metode request tidak didukung.');
    }
    
    $input = json_decode(file_get_contents('php://input'), true);
    $username = isset($input['username']) ? trim(strtolower($input['username'])) : '';
    $password = isset($input['password']) ? $input['password'] : '';

    if (empty($username) || empty($password)) {
        sendResponse('error', 'Username dan password wajib diisi.');
    }

    $stmt = mysqli_prepare($conn, "SELECT * FROM `users` WHERE `username` = ?");
    mysqli_stmt_bind_param($stmt, 's', $username);
    mysqli_stmt_execute($stmt);
    $result = mysqli_stmt_get_result($stmt);
    $user = mysqli_fetch_assoc($result);

    if ($user) {
        $isMatch = false;
        if (password_verify($password, $user['password'])) {
            $isMatch = true;
        } else if ($password === $user['password']) {
            $isMatch = true;
            // Upgrade raw password to hash
            $newHashed = password_hash($password, PASSWORD_DEFAULT);
            $updStmt = mysqli_prepare($conn, "UPDATE `users` SET `password` = ? WHERE `id` = ?");
            mysqli_stmt_bind_param($updStmt, 'si', $newHashed, $user['id']);
            mysqli_stmt_execute($updStmt);
        }

        if ($isMatch) {
            $_SESSION['adminLoggedIn'] = true;
            $_SESSION['adminUsername'] = $user['username'];
            $_SESSION['adminFullname'] = $user['fullname'];
            $_SESSION['adminRole'] = $user['role'];
            
            sendResponse('success', 'Login berhasil!', [
                'username' => $user['username'],
                'fullname' => $user['fullname'],
                'role' => $user['role']
            ]);
        }
    }
    sendResponse('error', 'Username atau password salah.');
}

// Register
if ($action === 'register') {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        sendResponse('error', 'Metode request tidak didukung.');
    }
    
    $input = json_decode(file_get_contents('php://input'), true);
    $username = isset($input['username']) ? trim(strtolower($input['username'])) : '';
    $password = isset($input['password']) ? $input['password'] : '';

    if (empty($username) || empty($password)) {
        sendResponse('error', 'Semua kolom pendaftaran wajib diisi.');
    }

    // Check if username already exists
    $chkStmt = mysqli_prepare($conn, "SELECT COUNT(*) FROM `users` WHERE `username` = ?");
    mysqli_stmt_bind_param($chkStmt, 's', $username);
    mysqli_stmt_execute($chkStmt);
    $cnt = 0;
    mysqli_stmt_bind_result($chkStmt, $cnt);
    mysqli_stmt_fetch($chkStmt);
    mysqli_stmt_close($chkStmt);

    if ($cnt > 0) {
        sendResponse('error', 'Username sudah terdaftar, silakan pilih nama lain.');
    }

    $hashed = password_hash($password, PASSWORD_DEFAULT);
    $fullname = ucfirst($username);

    $insStmt = mysqli_prepare($conn, "INSERT INTO `users` (`username`, `password`, `fullname`, `role`) VALUES (?, ?, ?, 'Admin')");
    mysqli_stmt_bind_param($insStmt, 'sss', $username, $hashed, $fullname);
    if (mysqli_stmt_execute($insStmt)) {
        sendResponse('success', 'Pendaftaran admin berhasil!');
    } else {
        sendResponse('error', 'Gagal menyimpan user baru: ' . mysqli_error($conn));
    }
}

// Logout
if ($action === 'logout') {
    session_unset();
    session_destroy();
    sendResponse('success', 'Sesi berhasil diakhiri.');
}

// --- Protected CRUD Actions ---
verifyAdminSession();

// Get All Data (Admin View)
if ($action === 'get_all_data') {
    $resUsers = mysqli_query($conn, "SELECT `id`, `username`, `fullname`, `role` FROM `users`");
    $usersList = [];
    while ($u = mysqli_fetch_assoc($resUsers)) {
        $usersList[] = $u;
    }

    sendResponse('success', 'Data admin berhasil diambil.', [
        'categories' => dbGetCategories($conn),
        'products' => dbGetProducts($conn),
        'profile' => dbGetProfile($conn),
        'faqs' => dbGetFaqs($conn),
        'users' => $usersList
    ]);
}

// Save Product (Insert / Update)
if ($action === 'save_product') {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        sendResponse('error', 'Metode request tidak didukung.');
    }

    $input = json_decode(file_get_contents('php://input'), true);
    $id = isset($input['id']) ? trim($input['id']) : '';
    $name = isset($input['name']) ? trim($input['name']) : '';
    $category = isset($input['category']) ? trim($input['category']) : '';
    $image = isset($input['image']) ? $input['image'] : '';

    if (empty($name) || empty($category) || empty($image)) {
        sendResponse('error', 'Semua kolom wajib diisi (Nama, Kategori, Foto).');
    }

    $catChk = mysqli_prepare($conn, "SELECT COUNT(*) FROM `categories` WHERE `slug` = ?");
    mysqli_stmt_bind_param($catChk, 's', $category);
    mysqli_stmt_execute($catChk);
    $catCnt = 0;
    mysqli_stmt_bind_result($catChk, $catCnt);
    mysqli_stmt_fetch($catChk);
    mysqli_stmt_close($catChk);

    if ($catCnt == 0) {
        sendResponse('error', 'Kategori produk tidak valid.');
    }

    $now = date('Y-m-d H:i:s');

    if (empty($id)) {
        $newId = 'prod-' . round(microtime(true) * 1000);
        $stmt = mysqli_prepare($conn, "INSERT INTO `products` (`id`, `name`, `category`, `image`, `uploaded_at`) VALUES (?, ?, ?, ?, ?)");
        mysqli_stmt_bind_param($stmt, 'sssss', $newId, $name, $category, $image, $now);
        
        if (mysqli_stmt_execute($stmt)) {
            sendResponse('success', 'Produk berhasil ditambahkan!', ['id' => $newId]);
        } else {
            sendResponse('error', 'Gagal menambahkan produk: ' . mysqli_error($conn));
        }
    } else {
        $existStmt = mysqli_prepare($conn, "SELECT COUNT(*) FROM `products` WHERE `id` = ?");
        mysqli_stmt_bind_param($existStmt, 's', $id);
        mysqli_stmt_execute($existStmt);
        $existCnt = 0;
        mysqli_stmt_bind_result($existStmt, $existCnt);
        mysqli_stmt_fetch($existStmt);
        mysqli_stmt_close($existStmt);

        if ($existCnt == 0) {
            sendResponse('error', 'Produk tidak ditemukan.');
        }

        // We update the name, category, image, but preserve uploaded_at
        $stmt = mysqli_prepare($conn, "UPDATE `products` SET `name` = ?, `category` = ?, `image` = ? WHERE `id` = ?");
        mysqli_stmt_bind_param($stmt, 'ssss', $name, $category, $image, $id);
        
        if (mysqli_stmt_execute($stmt)) {
            sendResponse('success', 'Produk berhasil diperbarui!', ['id' => $id]);
        } else {
            sendResponse('error', 'Gagal memperbarui produk: ' . mysqli_error($conn));
        }
    }
}

// Delete Product
if ($action === 'delete_product') {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        sendResponse('error', 'Metode request tidak didukung.');
    }

    $input = json_decode(file_get_contents('php://input'), true);
    $id = isset($input['id']) ? trim($input['id']) : '';

    if (empty($id)) {
        sendResponse('error', 'ID Produk tidak ditentukan.');
    }

    $stmt = mysqli_prepare($conn, "DELETE FROM `products` WHERE `id` = ?");
    mysqli_stmt_bind_param($stmt, 's', $id);
    
    if (mysqli_stmt_execute($stmt)) {
        sendResponse('success', 'Produk berhasil dihapus.');
    } else {
        sendResponse('error', 'Gagal menghapus produk: ' . mysqli_error($conn));
    }
}

// Save Category (Insert / Update)
if ($action === 'save_category') {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        sendResponse('error', 'Metode request tidak didukung.');
    }

    $input = json_decode(file_get_contents('php://input'), true);
    $id = isset($input['id']) ? trim($input['id']) : '';
    $name = isset($input['name']) ? trim($input['name']) : '';
    $slug = isset($input['slug']) ? trim($input['slug']) : '';
    $icon = isset($input['icon']) ? trim($input['icon']) : '';

    if (empty($name) || empty($slug) || empty($icon)) {
        sendResponse('error', 'Semua kolom wajib diisi (Nama, Slug, Ikon).');
    }

    $clashStmt = mysqli_prepare($conn, "SELECT `id` FROM `categories` WHERE `slug` = ?");
    mysqli_stmt_bind_param($clashStmt, 's', $slug);
    mysqli_stmt_execute($clashStmt);
    $clashRes = mysqli_stmt_get_result($clashStmt);
    $clashRow = mysqli_fetch_assoc($clashRes);
    mysqli_stmt_close($clashStmt);

    if ($clashRow && $clashRow['id'] !== $id) {
        sendResponse('error', 'Nama kategori ini menghasilkan slug/key filter yang bentrok dengan kategori lain! Gunakan nama lain.');
    }

    if (empty($id)) {
        $newId = 'cat-' . round(microtime(true) * 1000);
        $stmt = mysqli_prepare($conn, "INSERT INTO `categories` (`id`, `name`, `slug`, `icon`) VALUES (?, ?, ?, ?)");
        mysqli_stmt_bind_param($stmt, 'ssss', $newId, $name, $slug, $icon);
        
        if (mysqli_stmt_execute($stmt)) {
            sendResponse('success', 'Kategori berhasil ditambahkan!', ['id' => $newId]);
        } else {
            sendResponse('error', 'Gagal menambahkan kategori: ' . mysqli_error($conn));
        }
    } else {
        $stmt = mysqli_prepare($conn, "UPDATE `categories` SET `name` = ?, `slug` = ?, `icon` = ? WHERE `id` = ?");
        mysqli_stmt_bind_param($stmt, 'ssss', $name, $slug, $icon, $id);
        
        if (mysqli_stmt_execute($stmt)) {
            sendResponse('success', 'Kategori berhasil diperbarui!', ['id' => $id]);
        } else {
            sendResponse('error', 'Gagal memperbarui kategori: ' . mysqli_error($conn));
        }
    }
}

// Delete Category
if ($action === 'delete_category') {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        sendResponse('error', 'Metode request tidak didukung.');
    }

    $input = json_decode(file_get_contents('php://input'), true);
    $id = isset($input['id']) ? trim($input['id']) : '';

    if (empty($id)) {
        sendResponse('error', 'ID Kategori tidak ditentukan.');
    }

    $stmt = mysqli_prepare($conn, "SELECT `slug` FROM `categories` WHERE `id` = ?");
    mysqli_stmt_bind_param($stmt, 's', $id);
    mysqli_stmt_execute($stmt);
    $res = mysqli_stmt_get_result($stmt);
    $cat = mysqli_fetch_assoc($res);
    mysqli_stmt_close($stmt);

    if (!$cat) {
        sendResponse('error', 'Kategori tidak ditemukan.');
    }

    $prodChk = mysqli_prepare($conn, "SELECT COUNT(*) FROM `products` WHERE `category` = ?");
    mysqli_stmt_bind_param($prodChk, 's', $cat['slug']);
    mysqli_stmt_execute($prodChk);
    $prodCnt = 0;
    mysqli_stmt_bind_result($prodChk, $prodCnt);
    mysqli_stmt_fetch($prodChk);
    mysqli_stmt_close($prodChk);

    if ($prodCnt > 0) {
        sendResponse('error', "Kategori ini masih digunakan oleh $prodCnt produk. Silakan ubah atau hapus produk tersebut terlebih dahulu.");
    }

    $delStmt = mysqli_prepare($conn, "DELETE FROM `categories` WHERE `id` = ?");
    mysqli_stmt_bind_param($delStmt, 's', $id);
    
    if (mysqli_stmt_execute($delStmt)) {
        sendResponse('success', 'Kategori berhasil dihapus.');
    } else {
        sendResponse('error', 'Gagal menghapus kategori: ' . mysqli_error($conn));
    }
}

sendResponse('error', 'Aksi API tidak valid atau tidak dikenali.');
?>
