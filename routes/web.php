<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\AppController;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
*/

// --- 1. HALAMAN PUBLIK (GUEST) ---

// Redirect halaman depan ke login
Route::get('/', function () {
    return redirect('/login');
});

// Halaman Login
Route::get('/login', function () {
    return Inertia::render('auth/Login');
})->name('login');

// Halaman Register
Route::get('/register', function () {
    return Inertia::render('auth/Register');
})->name('register');

// Halaman Lupa Password
Route::get('/forgot-password', function () {
    return Inertia::render('auth/ForgotPassword');
})->name('password.request');

 Route::get('/admin-preview', function () {
    return Inertia::render('admin/AdminDashboard');
});


// --- 2. AREA TERPROTEKSI (WAJIB LOGIN) ---

Route::middleware(['auth'])->group(function () {
    
    // Dashboard Utama (Controller akan otomatis arahkan ke Admin atau User)
    Route::get('/dashboard', [AppController::class, 'dashboard'])->name('dashboard');

    // --- FITUR USER ---
    // Kirim Laporan Baru
    Route::post('/reports', [AppController::class, 'storeReport'])->name('reports.store');
    // Update Profil Sendiri (Nama/HP)
    Route::patch('/profile/update', [AppController::class, 'updateProfile'])->name('profile.update');

    // --- FITUR ADMIN ---
    // Selesaikan Laporan (Upload Bukti)
    Route::post('/reports/{id}/complete', [AppController::class, 'completeReport'])->name('reports.complete');
    // Edit Data User (Ganti Status/Nama)
    Route::patch('/admin/users/{id}', [AppController::class, 'updateUser'])->name('admin.users.update');

// Fitur Admin: Ubah status dari Pending ke Proses
Route::patch('/reports/{id}/process', [AppController::class, 'processReport'])->name('reports.process');

});

// Route Logout (Keluar dari sistem)
Route::post('/logout', [AppController::class, 'logout'])->name('logout');


// --- 3. ROUTE DEVELOPMENT (OPSIONAL) ---
// Bisa dihapus nanti saat aplikasi sudah live/production
Route::get('/admin-preview', function () {
    // Shortcut untuk intip tampilan Admin tanpa login (Data dummy)
    return Inertia::render('admin/AdminDashboard');
});