<?php
/**
 * Percetakan Karya Mitra - Secure Database Backup & Restore (MySQLi version)
 * Handles MySQL export and import with strict security checks using mysqli_multi_query.
 */

// Error reporting for debugging
ini_set('display_errors', 0);
error_reporting(E_ALL);

require_once 'db_config.php';

session_start();

// Security guard: Ensure only Super Admin session can access this database utility
if (
    !isset($_SESSION['adminLoggedIn']) || 
    $_SESSION['adminLoggedIn'] !== true || 
    !isset($_SESSION['adminRole']) || 
    $_SESSION['adminRole'] !== 'Super Admin'
) {
    header('HTTP/1.1 403 Forbidden');
    header('Content-Type: application/json');
    echo json_encode([
        'status' => 'error', 
        'message' => 'Akses ditolak. Fitur Backup & Restore database ini hanya dapat diakses oleh Super Admin.'
    ]);
    exit;
}

$action = isset($_GET['action']) ? $_GET['action'] : '';

// Establish MySQLi Connection with auto-creation of database
$conn = mysqli_connect(DB_HOST, DB_USER, DB_PASS, null, DB_PORT);
if (!$conn) {
    header('Content-Type: application/json');
    echo json_encode([
        'status' => 'error', 
        'message' => 'Koneksi MySQL gagal! Periksa file db_config.php.',
        'details' => mysqli_connect_error()
    ]);
    exit;
}

// Create database if not exists
$dbNameEscaped = "`" . str_replace("`", "``", DB_NAME) . "`";
mysqli_query($conn, "CREATE DATABASE IF NOT EXISTS $dbNameEscaped CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");

// Select database
if (!mysqli_select_db($conn, DB_NAME)) {
    header('Content-Type: application/json');
    echo json_encode([
        'status' => 'error', 
        'message' => 'Gagal menyeleksi database ' . DB_NAME,
        'details' => mysqli_error($conn)
    ]);
    mysqli_close($conn);
    exit;
}

mysqli_set_charset($conn, 'utf8mb4');

// 1. EXPORT DATABASE ACTION
if ($action === 'export') {
    try {
        $sqlDump = "-- Percetakan Karya Mitra Database Backup\n";
        $sqlDump .= "-- Generated on: " . date('Y-m-d H:i:s') . "\n";
        $sqlDump .= "-- Host: " . DB_HOST . "\n\n";
        $sqlDump .= "SET FOREIGN_KEY_CHECKS=0;\n\n";

        // Get all tables
        $tablesResult = mysqli_query($conn, "SHOW TABLES");
        if (!$tablesResult) {
            throw new Exception("Ggal membaca tabel database: " . mysqli_error($conn));
        }

        $tables = [];
        while ($row = mysqli_fetch_row($tablesResult)) {
            $tables[] = $row[0];
        }

        foreach ($tables as $table) {
            // Get table structure (CREATE TABLE)
            $structureResult = mysqli_query($conn, "SHOW CREATE TABLE `$table`");
            if (!$structureResult) {
                throw new Exception("Gagal membaca struktur tabel `$table`: " . mysqli_error($conn));
            }
            $structureRow = mysqli_fetch_assoc($structureResult);
            
            $sqlDump .= "DROP TABLE IF EXISTS `$table`;\n";
            $sqlDump .= $structureRow['Create Table'] . ";\n\n";

            // Get table data
            $dataResult = mysqli_query($conn, "SELECT * FROM `$table`");
            if (!$dataResult) {
                throw new Exception("Gagal membaca data tabel `$table`: " . mysqli_error($conn));
            }

            while ($row = mysqli_fetch_assoc($dataResult)) {
                $keys = array_keys($row);
                $escapedKeys = array_map(function($key) use ($conn) {
                    return "`" . mysqli_real_escape_string($conn, $key) . "`";
                }, $keys);

                $values = array_values($row);
                $escapedValues = array_map(function($val) use ($conn) {
                    if ($val === null) {
                        return 'NULL';
                    }
                    return "'" . mysqli_real_escape_string($conn, $val) . "'";
                }, $values);

                $sqlDump .= "INSERT INTO `$table` (" . implode(', ', $escapedKeys) . ") VALUES (" . implode(', ', $escapedValues) . ");\n";
            }
            $sqlDump .= "\n";
        }

        $sqlDump .= "SET FOREIGN_KEY_CHECKS=1;\n";

        // Output download headers with specific filename prefix
        header('Content-Type: application/sql; charset=utf-8');
        header('Content-Disposition: attachment; filename="karyamitra_backup_' . date('Y-m-d') . '.sql"');
        header('Pragma: no-cache');
        header('Expires: 0');
        
        echo $sqlDump;
        mysqli_close($conn);
        exit;

    } catch (Exception $e) {
        header('Content-Type: application/json');
        echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
        mysqli_close($conn);
        exit;
    }
}

// 2. IMPORT DATABASE ACTION
if ($action === 'import') {
    header('Content-Type: application/json');

    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        echo json_encode(['status' => 'error', 'message' => 'Metode request tidak didukung.']);
        mysqli_close($conn);
        exit;
    }

    if (!isset($_FILES['sql_file']) || $_FILES['sql_file']['error'] === UPLOAD_ERR_NO_FILE) {
        echo json_encode(['status' => 'error', 'message' => 'Silakan pilih file SQL terlebih dahulu.']);
        mysqli_close($conn);
        exit;
    }

    $file = $_FILES['sql_file'];

    // Security Check 1: Check upload errors
    if ($file['error'] !== UPLOAD_ERR_OK) {
        echo json_encode(['status' => 'error', 'message' => 'Error saat mengunggah file. Error Code: ' . $file['error']]);
        mysqli_close($conn);
        exit;
    }

    // Security Check 2: Max file size (5MB limit)
    $maxSize = 5 * 1024 * 1024; // 5 Megabytes
    if ($file['size'] > $maxSize) {
        echo json_encode(['status' => 'error', 'message' => 'Ukuran file melebihi batas maksimal (5MB).']);
        mysqli_close($conn);
        exit;
    }

    // Security Check 3: File Extension (.sql only)
    $filename = $file['name'];
    $fileExtension = strtolower(pathinfo($filename, PATHINFO_EXTENSION));
    if ($fileExtension !== 'sql') {
        echo json_encode(['status' => 'error', 'message' => 'File tidak valid. Hanya menerima file dengan ekstensi .sql.']);
        mysqli_close($conn);
        exit;
    }

    // Security Check 4: MIME Type verification
    $tmpName = $file['tmp_name'];
    $mimeType = mime_content_type($tmpName);
    $validMimes = [
        'text/plain',
        'text/x-sql',
        'application/sql',
        'application/octet-stream' // fallback
    ];

    if (!in_array($mimeType, $validMimes)) {
        echo json_encode(['status' => 'error', 'message' => 'Tipe MIME file ditolak. File ini bukan file SQL yang valid.']);
        mysqli_close($conn);
        exit;
    }

    // Security Check 5: Code injection prevention (Scan for PHP tags)
    $sqlContent = file_get_contents($tmpName);
    if (preg_match('/<\?php/i', $sqlContent) || preg_match('/<\?/i', $sqlContent) || preg_match('/<script/i', $sqlContent)) {
        echo json_encode(['status' => 'error', 'message' => 'Keamanan: File terdeteksi berisi kode PHP atau skrip berbahaya. Proses dibatalkan.']);
        mysqli_close($conn);
        exit;
    }

    // Execute queries using mysqli_multi_query
    if (mysqli_multi_query($conn, $sqlContent)) {
        // Free results to allow connection to execute next statements
        do {
            if ($result = mysqli_store_result($conn)) {
                mysqli_free_result($result);
            }
        } while (mysqli_next_result($conn));

        if (mysqli_errno($conn)) {
            echo json_encode([
                'status' => 'error', 
                'message' => 'Gagal memulihkan database.', 
                'details' => mysqli_error($conn)
            ]);
        } else {
            echo json_encode([
                'status' => 'success', 
                'message' => 'Database berhasil dipulihkan dari file backup SQL!'
            ]);
        }
    } else {
        echo json_encode([
            'status' => 'error', 
            'message' => 'Gagal memulai eksekusi kueri multi database.',
            'details' => mysqli_error($conn)
        ]);
    }

    mysqli_close($conn);
    exit;
}

// Default response if action not recognized
header('Content-Type: application/json');
echo json_encode(['status' => 'error', 'message' => 'Aksi tidak valid atau tidak ditentukan.']);
mysqli_close($conn);
exit;
?>
