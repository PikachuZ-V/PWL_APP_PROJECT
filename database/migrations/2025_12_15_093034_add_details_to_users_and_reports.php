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
    //Schema::table('users', function (Blueprint $table) {
    //    $table->text('address')->nullable()->after('password'); // Tambah Alamat
   // });

    Schema::table('reports', function (Blueprint $table) {
        // Tambah Urgensi (Low, Medium, High, Critical)
        $table->enum('urgency', ['Low', 'Medium', 'High', 'Critical'])->default('Low')->after('status');
    });
}

public function down()
{
    Schema::table('users', function (Blueprint $table) { $table->dropColumn('address'); });
    Schema::table('reports', function (Blueprint $table) { $table->dropColumn('urgency'); });
}
};
