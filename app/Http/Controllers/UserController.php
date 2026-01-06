<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Report;

class UserController extends Controller
{
    public function index()
    {
        // AMBIL DATA LAPORAN & FORMAT ULANG
        $myReports = Report::where('user_id', auth()->id())
                        ->latest()
                        ->get()
                        ->map(function($report) {
                            // 1. Proses Gambar Laporan dari User (Banyak Foto)
                            $imageUrls = [];
                            if ($report->images) {
                                foreach ($report->images as $img) {
                                    $imageUrls[] = asset('storage/' . $img); 
                                }
                            }

                            // 2. FIX: Proses Gambar Bukti Pengerjaan Petugas (Max 3 Foto)
                            // Integrasi agar sama dengan AdminDashboard
                            $resolutionImages = [];
                            if ($report->completion_images) {
                                foreach ($report->completion_images as $resImg) {
                                    $resolutionImages[] = asset('storage/' . $resImg);
                                }
                            }

                            return [
                                'id' => $report->id,
                                'title' => $report->title,
                                'desc' => $report->description,
                                'location_address' => $report->location_address ?? 'Detail lokasi tidak diisi',
                                
                                // Sinkronisasi Tanggal
                                'date' => $report->date_incident ?? $report->created_at->format('Y-m-d'),
                                
                                'status' => $report->status,
                                'urgency' => $report->urgency ?? 'Low',
                                
                                // FIX: Sinkronisasi Koordinat untuk Peta TKP
                                'latitude' => $report->latitude,
                                'longitude' => $report->longitude,
                                
                                'images' => $imageUrls, 
                                
                                // FIX: Sinkronisasi Data Penyelesaian (Multiple Images)
                                'resolution' => $report->status == 'Selesai' ? [
                                    'note' => $report->completion_note,
                                    'images' => $resolutionImages, // Diubah ke plural agar sinkron dengan Admin
                                ] : null
                            ];
                        });

        return Inertia::render('User/UserDashboard', [
            'reports' => $myReports,
            'user' => auth()->user()
        ]);
    }
}