<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Report;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    public function index()
    {
        // Ambil 5 laporan terbaru yang statusnya 'Pending'
        $reports = Report::with('user')
                    ->where('status', 'Pending')
                    ->latest()
                    ->take(5)
                    ->get();

        // Format data agar mudah dibaca oleh React
        $notifications = $reports->map(function($report) {
            return [
                'id' => $report->id,
                'title' => 'Laporan Masuk: ' . substr($report->title, 0, 20) . '...',
                'message' => $report->user->name . ' mengirim aduan baru.',
                'time' => $report->created_at->diffForHumans(), // Contoh: "Baru saja", "5 menit lalu"
                'type' => 'Laporan Baru'
            ];
        });

        // Kembalikan data JSON
        return response()->json([
            'notifications' => $notifications,
            'unread_count' => Report::where('status', 'Pending')->count()
        ]);
    }
}