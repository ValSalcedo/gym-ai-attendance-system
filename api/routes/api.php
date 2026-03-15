<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AttendanceController;
use App\Http\Controllers\MemberController;

/*
|--------------------------------------------------------------------------
| Attendance
|--------------------------------------------------------------------------
*/

Route::post('/attendance/auto-log', [AttendanceController::class, 'autoLog']);
Route::get('/attendance/logs', [AttendanceController::class, 'logs']);

/*
|--------------------------------------------------------------------------
| Members
|--------------------------------------------------------------------------
*/

Route::get('/members', [MemberController::class, 'index']);
Route::get('/members/{id}', [MemberController::class, 'show']);
Route::post('/members', [MemberController::class, 'store']);
Route::put('/members/{id}', [MemberController::class, 'update']);
Route::delete('/members/{id}', [MemberController::class, 'destroy']);