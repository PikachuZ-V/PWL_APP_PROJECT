<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
   public function up(): void
{
    Schema::create('reports', function (Blueprint $table) {
        $table->id(); // Membuat kolom ID (Primary Key) otomatis
        
        // Relasi: Kolom ini menyimpan ID milik User yang melapor
        $table->foreignId('user_id')->constrained()->onDelete('cascade');
        
        $table->string('title');        // Judul Laporan
        $table->text('description');    // Isi Laporan Panjang
        $table->date('date_incident');  // Tanggal Kejadian
        $table->string('image_path')->nullable(); // Lokasi file foto
        
        // Koordinat Peta
        $table->string('latitude')->nullable();
        $table->string('longitude')->nullable();
        
        // Status Laporan (Pilihan: Pending, Proses, Selesai)
        $table->enum('status', ['Pending', 'Proses', 'Selesai'])->default('Pending');
        
        // Data Penyelesaian (Diisi Admin nanti)
        $table->text('resolution_note')->nullable();
        $table->string('resolution_image_path')->nullable();
        $table->timestamp('resolved_at')->nullable();
        $table->string('resolved_by')->nullable();
        
        $table->timestamps(); // Membuat kolom created_at dan updated_at
    });
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('reports');
    }

    
};
