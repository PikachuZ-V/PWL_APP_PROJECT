<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
   public function up()
{
    Schema::create('reports', function (Blueprint $table) {
        $table->id();
        $table->foreignId('user_id')->constrained()->onDelete('cascade');
        $table->string('title');
        $table->text('description');
        $table->string('latitude')->nullable();
        $table->string('longitude')->nullable();
        $table->json('images')->nullable(); // MENYIMPAN ARRAY FOTO (MULTI IMAGE)
        $table->enum('status', ['Pending', 'Proses', 'Selesai'])->default('Pending');
        
        // Data Penyelesaian (Diisi Admin nanti)
        $table->text('completion_note')->nullable();
        $table->string('completion_image')->nullable();
        $table->timestamp('completed_at')->nullable();

        $table->timestamps();
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
