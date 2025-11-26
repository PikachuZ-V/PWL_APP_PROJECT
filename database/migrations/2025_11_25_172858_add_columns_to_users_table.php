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
    Schema::table('users', function (Blueprint $table) {
        // Pastikan baris-baris ini ada:
        if (!Schema::hasColumn('users', 'role')) {
            $table->string('role')->default('user')->after('email');
        }
        if (!Schema::hasColumn('users', 'phone')) {
            $table->string('phone')->nullable()->after('role');
        }
        if (!Schema::hasColumn('users', 'avatar')) {
            $table->string('avatar')->nullable()->after('phone');
        }
        
        // --- INI YANG TADI KETINGGALAN ---
        if (!Schema::hasColumn('users', 'address')) {
            $table->text('address')->nullable()->after('avatar'); 
        }
    });
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            //
        });
    }
    
};
