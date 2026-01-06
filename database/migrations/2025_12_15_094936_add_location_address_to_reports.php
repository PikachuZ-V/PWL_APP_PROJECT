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
        // Kolom khusus untuk alamat kejadian (beda dengan alamat user)
        $table->text('location_address')->nullable()->after('description');
    });
}

public function down()
{
    Schema::table('reports', function (Blueprint $table) {
        $table->dropColumn('location_address');
    });
}
};
