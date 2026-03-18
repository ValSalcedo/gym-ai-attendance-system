<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use Illuminate\Http\Request;

class SettingController extends Controller
{
    public function index()
    {
        $setting = Setting::first();

        if (!$setting) {
            $setting = Setting::create([
                'camera_url' => '',
                'recognition_threshold' => '70',
                'auto_refresh_interval' => '3000',
                'attendance_cooldown' => '10',
            ]);
        }

        return response()->json([
            'success' => true,
            'data' => $setting
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'camera_url' => 'nullable|string',
            'recognition_threshold' => 'required',
            'auto_refresh_interval' => 'required',
            'attendance_cooldown' => 'required',
        ]);

        $setting = Setting::first();

        if (!$setting) {
            $setting = Setting::create($validated);
        } else {
            $setting->update($validated);
        }

        return response()->json([
            'success' => true,
            'message' => 'Settings saved successfully.',
            'data' => $setting
        ]);
    }
}