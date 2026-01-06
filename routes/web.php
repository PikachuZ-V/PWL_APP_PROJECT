<?php

use App\Http\Controllers\AdminController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\Auth\PasswordResetLinkController;
use App\Http\Controllers\Auth\NewPasswordController;
use Illuminate\Support\Facades\Route;

// 1. Redirect Root ke Login
Route::get('/', function () {
    return redirect()->route('login');
});

// 2. Rute Khusus Guest (Belum Login) - Solusi Lupa Password
Route::middleware('guest')->group(function () {
    // Halaman Minta Link Reset
    Route::get('forgot-password', [PasswordResetLinkController::class, 'create'])
                ->name('password.request');

    // Kirim Email Link Reset
    Route::post('forgot-password', [PasswordResetLinkController::class, 'store'])
                ->name('password.email');

    // Halaman Input Password Baru
    Route::get('reset-password/{token}', [NewPasswordController::class, 'create'])
                ->name('password.reset');

    // Simpan Password Baru
    Route::post('reset-password', [NewPasswordController::class, 'store'])
                ->name('password.store');

                
});

// 3. Dashboard Gateway (Pengatur Arah Login)
Route::get('/dashboard', function () {
    if (auth()->user()->role === 'admin') {
        return redirect()->route('admin.dashboard');
    }
    return redirect()->route('user.dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

// 4. Group Authenticated (Sudah Login)
Route::middleware(['auth', 'verified'])->group(function () {
    
    // --- ADMIN ROUTES ---
    Route::prefix('admin')->group(function () {
        Route::get('/dashboard', [AdminController::class, 'index'])->name('admin.dashboard');
        Route::get('/notifications', [AdminController::class, 'notifications'])->name('admin.notifications');
        
        // Rute Manajemen Warga (Tombol Database User)
        Route::patch('/users/{user}', [AdminController::class, 'updateUser'])->name('admin.users.update');
    });

    // --- REPORT MANAGEMENT (Admin & Petugas) ---
    Route::patch('/reports/{report}/process', [ReportController::class, 'process'])->name('reports.process');
    Route::post('/reports/{report}/complete', [ReportController::class, 'complete'])->name('reports.complete');

    // --- USER ROUTES ---
    Route::get('/user/dashboard', [UserController::class, 'index'])->name('user.dashboard');
    Route::post('/reports', [ReportController::class, 'store'])->name('reports.store');

    // --- PROFILE ROUTES (Edit Profil User) ---
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';