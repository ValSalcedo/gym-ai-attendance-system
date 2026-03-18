<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AttendanceController;
use App\Http\Controllers\MemberController;
use App\Http\Controllers\Api\RecognitionLogController;
use App\Http\Controllers\Api\SettingController;

Route::post('/attendance/auto-log', [AttendanceController::class, 'autoLog']);
Route::get('/attendance/logs', [AttendanceController::class, 'logs']);
Route::get('/attendance/member/{id}', [AttendanceController::class, 'memberLogs']);

Route::get('/recognition/logs', [RecognitionLogController::class, 'index']);

Route::get('/settings', [SettingController::class, 'index']);
Route::post('/settings', [SettingController::class, 'store']);

Route::get('/members', [MemberController::class, 'index']);
Route::get('/members/{id}', [MemberController::class, 'show']);
Route::post('/members', [MemberController::class, 'store']);
Route::put('/members/{id}', [MemberController::class, 'update']);
Route::delete('/members/{id}', [MemberController::class, 'destroy']);