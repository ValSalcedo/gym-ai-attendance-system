<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Member extends Model
{
    protected $fillable = [
        'name',
        'email',
        'phone',
        'address',
        'gender',
        'birthdate',
        'height',
        'weight',
        'membership_type',
        'membership_start',
        'membership_end',
        'status',
        'payment_status',
    ];

    public function attendances(): HasMany
    {
        return $this->hasMany(Attendance::class);
    }
}