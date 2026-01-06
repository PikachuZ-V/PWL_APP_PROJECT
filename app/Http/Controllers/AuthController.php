<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class AuthController extends Controller
{
    public function showLoginForm()
    {
        // Pastikan nama folder di resources/js/Pages adalah 'auth' (huruf kecil)
        return Inertia::render('auth/Login'); 
    }

   public function login(Request $request)
    {
        $credentials = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required'],
        ]);

        if (Auth::attempt($credentials)) {
            $request->session()->regenerate();

            $user = Auth::user();

            // KITA PAKSA REDIRECT (Hapus 'intended')
            if ($user->role === 'admin') {
                return redirect('/dashboard'); // Wajib ke Admin
            } else {
                return redirect('/user/dashboard'); // Wajib ke User
            }
        }

        return back()->withErrors([
            'email' => 'Email atau password salah.',
        ]);
    }

     
    

    public function logout(Request $request)
    {
        Auth::logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();
        return redirect('/login');
    }
}