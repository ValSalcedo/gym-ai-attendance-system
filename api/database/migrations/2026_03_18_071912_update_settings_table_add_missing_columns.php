<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('settings', function (Blueprint $table) {
            if (!Schema::hasColumn('settings', 'camera_url')) {
                $table->string('camera_url')->nullable();
            }

            if (!Schema::hasColumn('settings', 'recognition_threshold')) {
                $table->string('recognition_threshold')->default('70');
            }

            if (!Schema::hasColumn('settings', 'auto_refresh_interval')) {
                $table->string('auto_refresh_interval')->default('3000');
            }

            if (!Schema::hasColumn('settings', 'attendance_cooldown')) {
                $table->string('attendance_cooldown')->default('10');
            }
        });
    }

    public function down(): void
    {
        Schema::table('settings', function (Blueprint $table) {
            if (Schema::hasColumn('settings', 'camera_url')) {
                $table->dropColumn('camera_url');
            }

            if (Schema::hasColumn('settings', 'recognition_threshold')) {
                $table->dropColumn('recognition_threshold');
            }

            if (Schema::hasColumn('settings', 'auto_refresh_interval')) {
                $table->dropColumn('auto_refresh_interval');
            }

            if (Schema::hasColumn('settings', 'attendance_cooldown')) {
                $table->dropColumn('attendance_cooldown');
            }
        });
    }
};