<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('members', function (Blueprint $table) {
            $table->string('address')->nullable()->after('phone');
            $table->string('gender')->nullable()->after('address');
            $table->date('birthdate')->nullable()->after('gender');

            $table->date('membership_start')->nullable()->after('membership_type');
            $table->date('membership_end')->nullable()->after('membership_start');
            $table->string('payment_status')->default('paid')->after('status');
        });
    }

    public function down(): void
    {
        Schema::table('members', function (Blueprint $table) {
            $table->dropColumn([
                'address',
                'gender',
                'birthdate',
                'membership_start',
                'membership_end',
                'payment_status',
            ]);
        });
    }
};