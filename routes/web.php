<?php

use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// --- HALAMAN PUBLIK ---

// Redirect halaman depan ke login
Route::get('/', function () {
    return redirect('/login');
});

// Route Login
Route::get('/login', function () {
    return Inertia::render('auth/Login');
})->name('login');

// Route Register
Route::get('/register', function () {
    return Inertia::render('auth/Register');
})->name('register');


// --- HALAMAN DASHBOARD (LOGIKA RESEPSIONIS) ---

Route::get('/dashboard', function () {
    
    // 1. Ambil data user yang sedang login
    $user = Auth::user();

    // 2. Cek Role Admin
    // Jika User Login DAN Role-nya 'admin', arahkan ke Dashboard Admin
    if ($user && isset($user->role) && $user->role === 'admin') {
        // Mengarah ke file: resources/js/pages/admin/AdminDashboard.tsx
        return Inertia::render('admin/AdminDashboard'); 
    }

    // 3. Default: Ke Dashboard User (Masyarakat)
    // Jika user biasa atau belum login, masuk ke sini
    return Inertia::render('settings/UserDashboard'); 
    
})->name('dashboard');


// --- KHUSUS DEVELOPMENT (HAPUS NANTI SAAT SUDAH LIVE) ---
// Gunakan link ini untuk melihat Tampilan Admin tanpa harus setting database/login dulu
Route::get('/admin-preview', function () {
    return Inertia::render('admin/AdminDashboard');
});


/* CATATAN PENTING UNTUK NANTI:
Saat fitur Login Backend sudah jadi, bungkus route dashboard 
ke dalam middleware auth seperti ini:

Route::middleware(['auth'])->group(function () {
    // Pindahkan logic dashboard ke sini
});
*/

// Route Lupa Password
Route::get('/forgot-password', function () {
    return Inertia::render('auth/ForgotPassword');
})->name('password.request'); // Nama route standar untuk link 'Lupa Password'