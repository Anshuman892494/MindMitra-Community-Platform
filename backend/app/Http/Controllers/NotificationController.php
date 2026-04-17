<?php

namespace App\Http\Controllers;

use App\Models\Notification;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    public function index(Request $request)
    {
        $notifications = Notification::where('user_id', (string) $request->user()->getAuthIdentifier())
            ->orderBy('created_at', 'desc')
            ->limit(20)
            ->get();

        return response()->json($notifications);
    }

    public function markAsRead(Request $request)
    {
        Notification::where('user_id', (string) $request->user()->getAuthIdentifier())
            ->where('is_read', false)
            ->update(['is_read' => true]);

        return response()->json(['message' => 'Notifications marked as read']);
    }
}
