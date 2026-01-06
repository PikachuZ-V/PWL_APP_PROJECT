<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Report;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;

class AdminController extends Controller
{
    public function index()
    {
        return Inertia::render('AdminDashboard', [
            'auth' => ['user' => auth()->user()],
            'stats' => [
                'total' => Report::count(),
                'pending' => Report::where('status', 'Pending')->count(),
                'process' => Report::where('status', 'Proses')->count(),
                'completed' => Report::where('status', 'Selesai')->count(),
            ],
            'reportsData' => Report::with('user')
                ->orderByRaw("FIELD(urgency, 'Critical', 'High', 'Medium', 'Low')")
                ->latest()
                ->get()
                ->map(function($report) {
                    // Mapping Foto Laporan Warga
                    $imageUrls = [];
                    if ($report->images) {
                        foreach ($report->images as $img) {
                            $imageUrls[] = asset('storage/' . $img);
                        }
                    }

                    // Mapping Foto Bukti Penyelesaian (Max 3)
                    $resolutionImages = [];
                    if ($report->completion_images) { // Pastikan kolom ini sesuai di DB
                        foreach ($report->completion_images as $resImg) {
                            $resolutionImages[] = asset('storage/' . $resImg);
                        }
                    }
                    
                    return [
                        'id' => $report->id,
                        'title' => $report->title,
                        'desc' => $report->description,
                        'location_address' => $report->location_address ?? 'Detail lokasi tidak diisi',
                        'status' => $report->status,
                        'urgency' => $report->urgency,
                        'date' => $report->date_incident ?? $report->created_at->format('d M Y'),
                        
                        // --- FIX PETA: Kirim langsung di root agar terbaca Dashboard ---
                        'latitude' => $report->latitude,
                        'longitude' => $report->longitude,
                        'maps_url' => ($report->latitude) 
                            ? "https://www.google.com/maps?q={$report->latitude},{$report->longitude}" 
                            : null,

                        'reporter' => [
                            'name' => $report->user->name ?? 'Unknown',
                            'email' => $report->user->email ?? '-',
                            'phone' => $report->user->phone ?? '-',
                            'address' => $report->user->address ?? '-', 
                            'avatar' => 'https://ui-avatars.com/api/?name='.urlencode($report->user->name ?? 'X')
                        ],
                        
                        'images' => $imageUrls,

                        // --- FIX PENYELESAIAN: Kirim data resolusi ---
                        'resolution' => $report->status == 'Selesai' ? [
                            'note' => $report->completion_note,
                            'images' => $resolutionImages, // Mendukung multiple images
                        ] : null
                    ];
                }),
            'usersData' => User::where('role', 'user')->latest()->get(),
        ]);
    }

    public function notifications()
    {
        $pendingCount = Report::where('status', 'Pending')->count();
        $latestReports = Report::where('status', 'Pending')
            ->latest()
            ->take(5)
            ->get()
            ->map(function($r){
                $date = $r->created_at ? Carbon::parse($r->created_at) : null;
                return [
                    'id' => $r->id,
                    'title' => substr($r->title, 0, 25) . '...',
                    'message' => substr($r->description, 0, 40) . '...',
                    'type' => $r->urgency ?? 'Low',
                    'time' => $date ? $date->format('d M, H:i') : '-',
                    'ago' => $date ? $date->diffForHumans() : '-',
                ];
            });

        return response()->json([
            'unread_count' => $pendingCount,
            'notifications' => $latestReports
        ]);
    }

    public function updateUser(Request $request, User $user)
    {
        $user->update($request->validate([
            'name'=>'required', 
            'phone'=>'nullable', 
            'address'=>'nullable', 
            'status'=>'required'
        ]));
        return back()->with('success', 'User updated');
    }
}