<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Setting extends Model
{
    protected $fillable = [
        'camera_url',
        'recognition_threshold',
        'auto_refresh_interval',
        'attendance_cooldown',
    ];
}