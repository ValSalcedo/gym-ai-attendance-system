<?php

namespace App\Http\Controllers;

use App\Models\Member;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class MemberController extends Controller
{
    public function index()
    {
        return response()->json([
            'success' => true,
            'data' => Member::orderByDesc('id')->get()
        ]);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'nullable|email|max:255|unique:members,email',
            'phone' => 'nullable|string|max:50',
            'address' => 'nullable|string|max:255',
            'gender' => 'nullable|string|max:50',
            'birthdate' => 'nullable|date',
            'height' => 'nullable|integer|min:1|max:300',
            'weight' => 'nullable|integer|min:1|max:500',
            'membership_type' => 'nullable|string|max:100',
            'membership_start' => 'nullable|date',
            'membership_end' => 'nullable|date|after_or_equal:membership_start',
            'status' => 'nullable|string|max:50',
            'payment_status' => 'nullable|string|max:50',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $member = Member::create([
            'name' => $request->name,
            'email' => $request->email,
            'phone' => $request->phone,
            'address' => $request->address,
            'gender' => $request->gender,
            'birthdate' => $request->birthdate,
            'height' => $request->height,
            'weight' => $request->weight,
            'membership_type' => $request->membership_type,
            'membership_start' => $request->membership_start,
            'membership_end' => $request->membership_end,
            'status' => $request->status ?? 'active',
            'payment_status' => $request->payment_status ?? 'paid',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Member created successfully',
            'data' => $member
        ], 201);
    }

    public function show($id)
    {
        $member = Member::find($id);

        if (!$member) {
            return response()->json([
                'success' => false,
                'message' => 'Member not found'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $member
        ]);
    }

    public function update(Request $request, $id)
    {
        $member = Member::find($id);

        if (!$member) {
            return response()->json([
                'success' => false,
                'message' => 'Member not found'
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|required|string|max:255',
            'email' => 'nullable|email|max:255|unique:members,email,' . $id,
            'phone' => 'nullable|string|max:50',
            'address' => 'nullable|string|max:255',
            'gender' => 'nullable|string|max:50',
            'birthdate' => 'nullable|date',
            'height' => 'nullable|integer|min:1|max:300',
            'weight' => 'nullable|integer|min:1|max:500',
            'membership_type' => 'nullable|string|max:100',
            'membership_start' => 'nullable|date',
            'membership_end' => 'nullable|date|after_or_equal:membership_start',
            'status' => 'nullable|string|max:50',
            'payment_status' => 'nullable|string|max:50',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $member->update($request->only([
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
        ]));

        return response()->json([
            'success' => true,
            'message' => 'Member updated successfully',
            'data' => $member
        ]);
    }

    public function destroy($id)
    {
        $member = Member::find($id);

        if (!$member) {
            return response()->json([
                'success' => false,
                'message' => 'Member not found'
            ], 404);
        }

        $member->delete();

        return response()->json([
            'success' => true,
            'message' => 'Member deleted successfully'
        ]);
    }
}