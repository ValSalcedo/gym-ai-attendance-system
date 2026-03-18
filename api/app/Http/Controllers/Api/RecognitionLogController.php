<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\RecognitionLog;

class RecognitionLogController extends Controller
{
    public function index()
    {
        $logs = RecognitionLog::with('member')
            ->latest()
            ->get();

        return response()->json([
            'success' => true,
            'data' => $logs
        ]);
    }
}