<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Report;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AdminController extends Controller
{
    public function index()
    {
        // PERHATIKAN BARIS INI:
        // Saya ubah jadi 'AdminDashboard' saja (tanpa 'Admin/') 
        // karena file Anda ada di 'resources/js/Pages/AdminDashboard.tsx'
        return Inertia::render('AdminDashboard', [
            'auth' => ['user' => auth()->user()],
            'stats' => [
                'total' => Report::count(),
                'pending' => Report::where('status', 'Pending')->count(),
                'process' => Report::where('status', 'Proses')->count(),
                'completed' => Report::where('status', 'Selesai')->count(),
            ],
            'reportsData' => Report::with('user')->latest()->get()->map(function($report) {
                return [
                    'id' => $report->id,
                    'name' => $report->user->name ?? 'Unknown',
                    'title' => $report->title,
                    'desc' => $report->description,
                    'date' => $report->created_at->format('d M Y'),
                    'status' => $report->status,
                    'image' => $report->image ? asset('storage/'.$report->image) : null,
                    'resolution' => $report->status == 'Selesai' ? [
                        'note' => $report->completion_note,
                        'image' => asset('storage/'.$report->completion_image),
                        'timestamp' => $report->completed_at ? \Carbon\Carbon::parse($report->completed_at)->format('d M Y H:i') : '-',
                        'operator' => 'Admin'
                    ] : null
                ];
            }),
            'usersData' => User::where('role', 'user')->latest()->get()->map(function($user) {
                return [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'phone' => $user->phone ?? '-',
                    'status' => $user->status,
                    'joined' => $user->created_at->format('d M Y'),
                    'avatar' => $user->avatar ?? 'https://ui-avatars.com/api/?name='.urlencode($user->name)
                ];
            }),
        ]);
    }

    public function updateUser(Request $request, User $user)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'phone' => 'nullable|string|max:20',
            'status' => 'required|in:Verified,Pending,Banned',
        ]);

        $user->update($validated);

        return back()->with('success', 'Data user berhasil diperbarui');
    }
}