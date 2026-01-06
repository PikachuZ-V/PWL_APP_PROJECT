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
    Schema::table('reports', function (Blueprint $table) {
        $table->text('completion_note')->nullable();
        $table->json('completion_images')->nullable(); // Menggunakan JSON untuk menampung max 3 foto
        $table->timestamp('completed_at')->nullable();
    });
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('reports', function (Blueprint $table) {
            //
        });
    }
};
