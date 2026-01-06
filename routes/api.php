<?php
use App\Http\Controllers\AdminController;
use Illuminate\Support\Facades\Route;

// Route ini yang dipanggil oleh lonceng notifikasi

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});