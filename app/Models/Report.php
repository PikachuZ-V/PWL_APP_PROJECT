<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Report extends Model
{
    use HasFactory;

    // --- BAGIAN PENTING YANG MENGATASI ERROR TADI ---
    // $guarded = ['id'] artinya: "Semua kolom BOLEH diisi kecuali ID".
    // Ini adalah cara paling cepat mengatasi MassAssignmentException.
    protected $guarded = ['id']; 

    // Ubah format tanggal otomatis jadi objek Carbon
    protected $casts = [
        'date_incident' => 'date',
        'resolved_at' => 'datetime',
    ];

    // Relasi: Laporan milik 1 User
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    // --- FITUR TAMBAHAN: URL GAMBAR ---
    // Ini agar di Frontend React, kita bisa panggil .image_url langsung
    protected $appends = ['image_url', 'resolution_image_url'];

    public function getImageUrlAttribute()
    {
        return $this->image_path ? asset('storage/' . $this->image_path) : null;
    }

    public function getResolutionImageUrlAttribute()
    {
        return $this->resolution_image_path ? asset('storage/' . $this->resolution_image_path) : null;
    }
}