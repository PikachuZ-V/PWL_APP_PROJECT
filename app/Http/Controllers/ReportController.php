<?php

namespace App\Http\Controllers;

use App\Models\Report;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class ReportController extends Controller
{
    public function store(Request $request)
    {
        // 1. Validasi Input
        $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'location_address' => 'required|string',
            'date' => 'required|date',
            'longitude' => 'required', 
            'latitude' => 'required',  
            'images.*' => 'image|mimes:jpeg,png,jpg|max:5048', // Tambahkan mimes untuk keamanan
            'user_address' => 'nullable|string'
        ]);

        // 2. Update Alamat Profil User (Opsional)
        if ($request->user_address) {
            User::where('id', auth()->id())->update(['address' => $request->user_address]);
        }

        // 3. Logika Smart Urgency
        $text = strtolower($request->title . ' ' . $request->description);
        $urgency = 'Low'; 
        if (Str::contains($text, ['kebakaran', 'pembunuhan', 'begal', 'tenggelam', 'darurat', 'korban', 'jiwa'])) {
            $urgency = 'Critical';
        } elseif (Str::contains($text, ['banjir', 'longsor', 'kecelakaan', 'pencurian', 'rampok', 'hanyut'])) {
            $urgency = 'High';
        } elseif (Str::contains($text, ['macet', 'sampah', 'jalan rusak', 'lampu mati', 'berlubang', 'pohon tumbang'])) {
            $urgency = 'Medium';
        }

        // 4. Upload Gambar Laporan (Banyak Foto dari User)
        $imagePaths = [];
        if($request->hasFile('images')) {
            foreach($request->file('images') as $file) {
                $imagePaths[] = $file->store('reports', 'public');
            }
        }

        // 5. Simpan ke Database
        Report::create([
            'user_id' => auth()->id(),
            'title' => $request->title,
            'description' => $request->description,
            'location_address' => $request->location_address,
            'date_incident' => $request->date, 
            'latitude' => $request->latitude,
            'longitude' => $request->longitude,
            'images' => $imagePaths, 
            'status' => 'Pending',
            'urgency' => $urgency 
        ]);

        return redirect()->back()->with('success', 'Laporan berhasil dikirim!');
    }

    public function process($id)
    {
        $report = Report::findOrFail($id);
        $report->update(['status' => 'Proses']);
        return redirect()->back()->with('success', 'Laporan sedang diproses.');
    }

    /**
     * FITUR SELESAIKAN LAPORAN
     * Mendukung Max 3 Foto Bukti Pengerjaan
     */
    public function complete(Request $request, $id)
    {
        // Validasi input sesuai kiriman dari AdminDashboard.tsx
        $request->validate([
            'note' => 'required|string',
            'images' => 'required|array|min:1|max:3', // Wajib minimal 1 foto
            'images.*' => 'image|mimes:jpeg,png,jpg|max:5048'
        ]);

        $report = Report::findOrFail($id);
        
        // Simpan banyak foto bukti pengerjaan ke folder 'completions'
        $completionPaths = [];
        if($request->hasFile('images')) {
            foreach($request->file('images') as $file) {
                $completionPaths[] = $file->store('completions', 'public');
            }
        }
        
        // Update data laporan
        // Menggunakan field 'completion_images' agar sinkron dengan database
        $report->update([
            'status' => 'Selesai',
            'completion_note' => $request->note,
            'completion_images' => $completionPaths, 
            'completed_at' => now()
        ]);

        return redirect()->back()->with('success', 'Laporan telah berhasil diselesaikan.');
    }
}