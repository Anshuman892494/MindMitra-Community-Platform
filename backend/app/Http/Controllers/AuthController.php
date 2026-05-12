<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;
use Illuminate\Support\Facades\Http;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8',
            'bio' => 'nullable|string',
            'goals' => 'nullable|string',
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'bio' => $request->bio,
            'goals' => $request->goals,
        ]);

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'User created successfully',
            'user' => $user,
            'token' => $token,
        ], 201);
    }

    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|string|email',
            'password' => 'required|string',
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['Invalid credentials.'],
            ]);
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'user' => $user,
            'token' => $token,
        ]);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Logged out successfully'
        ]);
    }

    public function updateProfile(Request $request)
    {
        \Log::info('Update Profile Request Received', [
            'has_file' => $request->hasFile('image'),
            'all' => $request->all()
        ]);
        $user = $request->user();

        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email,' . $user->id,
            'bio' => 'nullable|string',
            'goals' => 'nullable|string',
            'mobile' => 'nullable|string|max:20',
            'image' => 'nullable|image|max:5120', // Max 5MB
        ]);

        $profileImageUrl = $user->profile_image;

        if ($request->hasFile('image')) {
            try {
                $cloudName = env('CLOUDINARY_CLOUD_NAME');
                $apiKey = env('CLOUDINARY_API_KEY');
                $apiSecret = env('CLOUDINARY_API_SECRET');
                $timestamp = time();

                // Generate signature for authenticated upload
                $signatureString = "folder=profile_images&timestamp=" . $timestamp . $apiSecret;
                $signature = sha1($signatureString);

                // Upload image directly using Laravel's Http client to bypass SSL locally
                $response = Http::withoutVerifying()
                    ->attach(
                        'file',
                        file_get_contents($request->file('image')->getRealPath()),
                        $request->file('image')->getClientOriginalName()
                    )
                    ->post("https://api.cloudinary.com/v1_1/{$cloudName}/image/upload", [
                        'api_key' => $apiKey,
                        'timestamp' => $timestamp,
                        'signature' => $signature,
                        'folder' => 'profile_images'
                    ]);

                if ($response->successful()) {
                    $profileImageUrl = $response->json('secure_url');
                } else {
                    throw new \Exception("Cloudinary API Error: " . $response->body());
                }
            } catch (\Exception $e) {
                \Log::error("Cloudinary Upload Error: " . $e->getMessage());
                $errorMsg = $e->getMessage();
                if (str_contains($errorMsg, 'Must supply cloud_name')) {
                    $errorMsg = "Cloudinary Configuration Error: Please set your actual cloud_name, api_key, and api_secret in the backend .env file.";
                }
                return response()->json([
                    'message' => $errorMsg,
                    'debug' => $e->getMessage()
                ], 400);
            }
        }

        $user->update([
            'name' => $request->name,
            'email' => $request->email,
            'bio' => $request->bio,
            'goals' => $request->goals,
            'mobile' => $request->mobile,
            'profile_image' => $profileImageUrl,
        ]);

        return response()->json([
            'message' => 'Profile updated successfully',
            'user' => $user
        ]);
    }

    public function changePassword(Request $request)
    {
        $user = $request->user();

        $request->validate([
            'current_password' => 'required',
            'new_password' => 'required|string|min:8|confirmed',
        ]);

        if (!Hash::check($request->current_password, $user->password)) {
            return response()->json([
                'message' => 'The provided password does not match your current password.'
            ], 422);
        }

        $user->update([
            'password' => Hash::make($request->new_password)
        ]);

        return response()->json([
            'message' => 'Password changed successfully'
        ]);
    }

    public function removeProfileImage(Request $request)
    {
        $user = $request->user();
        if ($user->profile_image) {
            $this->deleteFromCloudinary($user->profile_image);
            $user->update(['profile_image' => null]);
        }
        return response()->json([
            'message' => 'Profile image removed successfully',
            'user' => $user
        ]);
    }

    private function deleteFromCloudinary($url)
    {
        if (!$url)
            return;
        preg_match('/upload\/(?:v\d+\/)?([^\.]+)/', $url, $matches);
        if (isset($matches[1])) {
            $publicId = $matches[1];
            $cloudName = env('CLOUDINARY_CLOUD_NAME');
            $apiKey = env('CLOUDINARY_API_KEY');
            $apiSecret = env('CLOUDINARY_API_SECRET');
            $timestamp = time();
            $signature = sha1("public_id={$publicId}&timestamp={$timestamp}{$apiSecret}");

            try {
                Http::withoutVerifying()->asForm()->post("https://api.cloudinary.com/v1_1/{$cloudName}/image/destroy", [
                    'public_id' => $publicId,
                    'api_key' => $apiKey,
                    'timestamp' => $timestamp,
                    'signature' => $signature
                ]);
            } catch (\Exception $e) {
                \Log::error("Cloudinary Delete Error: " . $e->getMessage());
            }
        }
    }

    public function showProfile($id)
    {
        $user = User::find($id);

        if (!$user) {
            return response()->json(['message' => 'User not found'], 404);
        }

        // Return only safe public fields
        return response()->json([
            'user' => [
                'id' => $user->id,
                '_id' => $user->_id,
                'name' => $user->name,
                'email' => $user->email,
                'bio' => $user->bio,
                'goals' => $user->goals,
                'profile_image' => $user->profile_image,
                'created_at' => $user->created_at,
            ]
        ]);
    }

    //Global Search
    public function searchUsers(Request $request)
    {
        $query = $request->input('q');
        if (!$query) {
            $currentUser = $request->user();
            $users = User::where('_id', '!=', $currentUser?->_id)
                         ->orderBy('created_at', 'desc')
                         ->limit(30)
                         ->get(['id', '_id', 'name', 'email', 'profile_image'])
                         ->shuffle()
                         ->take(5)
                         ->values();
            return response()->json($users);
        }

        // MongoDB wildcard search
        $users = User::where('name', 'like', "%{$query}%")
            ->orWhere('email', 'like', "%{$query}%")
            ->limit(10)
            ->get(['id', 'name', 'email', 'profile_image']);

        return response()->json($users);
    }
}
