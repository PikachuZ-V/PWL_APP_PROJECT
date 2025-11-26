<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use App\Models\Report;
use App\Models\User;

class AppController extends Controller
{
    public function dashboard()
    {
        $user = Auth::user();

        // --- JIKA ADMIN ---
        if ($user->role === 'admin') {
            
            // 1. Hitung Statistik untuk Chart & Kartu Atas
            $stats = [
                'total' => Report::count(),
                'pending' => Report::where('status', 'Pending')->count(),
                'process' => Report::where('status', 'Proses')->count(),
                'completed' => Report::where('status', 'Selesai')->count(),
            ];

            // 2. Ambil Laporan (Mapping agar sesuai dengan Props React)
            $reports = Report::with('user')->latest()->get()->map(function ($report) {
                return [
                    'id' => $report->id,
                    'date' => $report->created_at->format('d M Y'),
                    'name' => $report->user->name,
                    'title' => $report->title,
                    'desc' => $report->description,
                    'status' => $report->status,
                    'image' => $report->image_url, // <--- DITAMBAHKAN: Agar foto laporan muncul
                    'resolution' => $report->status === 'Selesai' ? [
                        'note' => $report->resolution_note,
                        'image' => $report->resolution_image_url,
                        'operator' => $report->resolved_by,
                        'timestamp' => $report->resolved_at ? $report->resolved_at->format('d M Y, H:i') . ' WIB' : '-',
                    ] : null
                ];
            });

            // 3. Ambil Data User untuk Tab "Database User"
            $users = User::where('role', '!=', 'admin')->latest()->get()->map(function ($u) {
                return [
                    'id' => $u->id,
                    'name' => $u->name,
                    'email' => $u->email,
                    'phone' => $u->phone ?? '-',
                    'joined' => $u->created_at->format('d M Y'),
                    'status' => $u->email_verified_at ? 'Verified' : 'Pending', // Logic Status yang lebih baik
                    'avatar' => $u->avatar ?? 'https://ui-avatars.com/api/?name='.urlencode($u->name).'&background=0D8ABC&color=fff'
                ];
            });

            // Kirim semua data ke AdminDashboard
            return Inertia::render('admin/AdminDashboard', [
                'stats' => $stats,
                'reportsData' => $reports, 
                'usersData' => $users
            ]);
        } 
        
        // --- JIKA USER BIASA ---
        else {
            // Ambil laporan milik User yang sedang login saja
            $myReports = Report::where('user_id', $user->id)->latest()->get()->map(function ($report) {
                return [
                    'id' => $report->id,
                    'date' => $report->created_at->format('d M Y'),
                    'title' => $report->title,
                    'desc' => $report->description,
                    'status' => $report->status,
                    'image' => $report->image_url, // <--- DITAMBAHKAN: Agar foto laporan muncul
                    'resolution' => $report->status === 'Selesai' ? [
                        'note' => $report->resolution_note,
                        'image' => $report->resolution_image_url,
                        'operator' => $report->resolved_by,
                    ] : null
                ];
            });

            // Kirim ke UserDashboard
            return Inertia::render('settings/UserDashboard', [
                'reports' => $myReports,
                'stats' => ['total' => $myReports->count()]
            ]);
        }
    }

    // Fungsi Simpan Laporan (User)
    public function storeReport(Request $request)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required',
            'date' => 'required|date',
            'image' => 'nullable|image|max:5120',
        ]);

        $path = null;
        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('reports', 'public');
        }

        Report::create([
            'user_id' => Auth::id(),
            'title' => $request->title,
            'description' => $request->description,
            'date_incident' => $request->date,
            'image_path' => $path,
            'latitude' => $request->latitude,
            'longitude' => $request->longitude,
            'status' => 'Pending'
        ]);

        return redirect()->back()->with('success', 'Laporan berhasil dikirim!');
    }

    // Fungsi Selesaikan Laporan (Admin)
    public function completeReport(Request $request, $id)
    {
        $request->validate([
            'note' => 'required|string',
            'image' => 'required|image|max:5120',
        ]);

        $report = Report::findOrFail($id);

        $path = null;
        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('resolutions', 'public');
        }

        $report->update([
            'status' => 'Selesai',
            'resolution_note' => $request->note,
            'resolution_image_path' => $path,
            'resolved_at' => now(),
            'resolved_by' => Auth::user()->name
        ]);

        return redirect()->back()->with('success', 'Laporan telah diselesaikan.');
    }

    // --- FITUR ADMIN: MEMPROSES LAPORAN ---
    public function processReport($id)
    {
        $report = Report::findOrFail($id);
        
        // Update status jadi 'Proses'
        $report->update([
            'status' => 'Proses'
        ]);

        return redirect()->back()->with('success', 'Laporan sedang diproses.');
    }

    // Fitur Logout
    public function logout(Request $request)
    {
        Auth::guard('web')->logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();
        return redirect('/');
    }

    // Fitur Update Profil User
    public function updateProfile(Request $request)
    {
        $user = User::find(Auth::id());
        $request->validate(['name' => 'required|string|max:255']);
        $user->update(['name' => $request->name]);
        return redirect()->back()->with('success', 'Profil berhasil diperbarui!');
    }

    // Fitur Update User oleh Admin
    public function updateUser(Request $request, $id)
    {
        $user = User::findOrFail($id);
        $request->validate(['name' => 'required|string', 'status' => 'required']);
        
        // Logic status Verified/Pending
        $verifiedAt = $request->status === 'Verified' ? now() : null;
        
        $user->update([
            'name' => $request->name, 
            'phone' => $request->phone, 
            'email_verified_at' => $verifiedAt
        ]);
        
        return redirect()->back()->with('success', 'Data user berhasil diubah Admin.');
    }
}