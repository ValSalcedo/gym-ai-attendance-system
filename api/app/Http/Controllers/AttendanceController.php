<?php

namespace App\Http\Controllers;

use App\Models\Attendance;
use App\Models\Member;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class AttendanceController extends Controller
{
    public function autoLog(Request $request)
    {
        $authHeader = trim((string) $request->header('Authorization'));
        $expectedToken = 'Bearer gym-ai-secret-2026';

        if ($authHeader !== $expectedToken) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized'
            ], 401);
        }

        $validator = Validator::make($request->all(), [
            'member_id' => 'required|integer|exists:members,id',
            'confidence' => 'nullable|numeric',
            'camera_name' => 'nullable|string|max:255',
            'recognized_at' => 'nullable|date'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $member = Member::find($request->member_id);

        if (!$member) {
            return response()->json([
                'success' => false,
                'message' => 'Member not found'
            ], 404);
        }

        if (($member->status ?? 'active') !== 'active') {
            return response()->json([
                'success' => false,
                'message' => 'Membership inactive',
                'member_status' => $member->status
            ], 403);
        }

        if (!empty($member->membership_end) && Carbon::parse($member->membership_end)->isPast()) {
            return response()->json([
                'success' => false,
                'message' => 'Membership expired',
                'membership_end' => $member->membership_end
            ], 403);
        }

        $memberId = $member->id;
        $recognizedAt = $request->recognized_at
            ? Carbon::parse($request->recognized_at)
            : now();

        $alreadyLogged = Attendance::where('member_id', $memberId)
            ->whereDate('recognized_at', $recognizedAt->toDateString())
            ->where('type', 'IN')
            ->exists();

        if ($alreadyLogged) {
            return response()->json([
                'success' => true,
                'message' => 'Attendance already logged today'
            ], 200);
        }

        $attendance = Attendance::create([
            'member_id' => $memberId,
            'type' => 'IN',
            'confidence' => $request->confidence,
            'camera_name' => $request->camera_name,
            'recognized_at' => $recognizedAt
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Attendance logged successfully',
            'data' => $attendance
        ], 201);
    }

    public function logs()
    {
        $logs = Attendance::with('member')
            ->orderByDesc('recognized_at')
            ->take(50)
            ->get();

        return response()->json([
            'success' => true,
            'data' => $logs
        ]);
    }
}