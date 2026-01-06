<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Report extends Model
{
    // Tambahkan semua kolom agar bisa diisi oleh Controller
    protected $fillable = [
        'user_id', 
        'title', 
        'description', 
        'location_address', 
        'date_incident', 
        'latitude', 
        'longitude', 
        'images', 
        'status', 
        'urgency',
        'completion_note',
        'completion_images',
        'completed_at'
    ];
    use HasFactory;

    protected $guarded = ['id'];

    // PENTING: Agar foto bisa disimpan & diambil sebagai Array
    protected $casts = [
        'images' => 'array',
        'completed_at' => 'datetime',
        'completion_images' => 'array',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}