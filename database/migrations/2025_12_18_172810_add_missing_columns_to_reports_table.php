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
    Schema::table('reports', function (Blueprint $table) {
        if (!Schema::hasColumn('reports', 'completion_note')) {
            $table->text('completion_note')->nullable();
        }
        if (!Schema::hasColumn('reports', 'completion_images')) {
            $table->json('completion_images')->nullable();
        }
        if (!Schema::hasColumn('reports', 'completed_at')) {
            $table->timestamp('completed_at')->nullable();
        }
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
