<?php

namespace App\Http\Controllers;

use App\Models\Post;
use App\Models\Notification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class PostController extends Controller
{
    public function index()
    {
        $posts = Post::with('user')->orderBy('created_at', 'desc')->get();
        return response()->json($posts);
    }

    public function show($id)
    {
        $post = Post::with('user')->findOrFail($id);
        return response()->json($post);
    }

    public function store(Request $request)
    {
        $request->validate([
            'content' => 'required|string',
            'category' => 'required|string|in:Fitness,Mental Health,Diet,Yoga',
            'image' => 'nullable|image|max:10240', // Max 10MB
        ]);

        $imageUrl = null;

        if ($request->hasFile('image')) {
            try {
                $cloudName = env('CLOUDINARY_CLOUD_NAME');
                $apiKey = env('CLOUDINARY_API_KEY');
                $apiSecret = env('CLOUDINARY_API_SECRET');
                $timestamp = time();

                // Generate signature for authenticated upload
                $signatureString = "folder=feed_posts&timestamp=" . $timestamp . $apiSecret;
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
                        'folder' => 'feed_posts'
                    ]);

                if ($response->successful()) {
                    $imageUrl = $response->json('secure_url');
                } else {
                    throw new \Exception("Cloudinary API Error: " . $response->body());
                }
            } catch (\Exception $e) {
                \Log::error("Post Image Upload Error: " . $e->getMessage());
                return response()->json(['message' => 'Image upload failed: ' . $e->getMessage()], 400);
            }
        }

        $post = Post::create([
            'user_id' => (string) $request->user()->getAuthIdentifier(), 
            'content' => $request->content,
            'category' => $request->category,
            'image' => $imageUrl,
            'likes' => [],
            'comments' => []
        ]);

        $post->load('user');

        return response()->json($post, 201);
    }

    public function like(Request $request, $id)
    {
        $post = Post::findOrFail($id);
        $userId = (string) $request->user()->getAuthIdentifier();
        
        $likes = $post->likes ?? [];
        if (!in_array($userId, $likes)) {
            $likes[] = $userId;
            $post->likes = $likes;
            $post->save();

            // Create notification
            if ($post->user_id !== $userId) {
                Notification::create([
                    'user_id' => $post->user_id,
                    'actor_id' => $userId,
                    'actor_name' => $request->user()->name,
                    'post_id' => $post->id,
                    'type' => 'like',
                    'is_read' => false,
                    'message' => "{$request->user()->name} liked your post."
                ]);
            }
        } else {
            // Option to unlike
            $post->likes = array_values(array_diff($likes, [$userId]));
            $post->save();
        }

        $post->load('user');
        return response()->json($post);
    }

    public function comment(Request $request, $id)
    {
        $request->validate([
            'comment' => 'required|string'
        ]);

        $post = Post::findOrFail($id);
        
        $comments = $post->comments ?? [];
        $comments[] = [
            'user_id' => (string) $request->user()->getAuthIdentifier(),
            'user_name' => $request->user()->name,
            'user_image' => $request->user()->profile_image,
            'text' => $request->comment,
            'created_at' => now()->toDateTimeString()
        ];
        
        $post->comments = $comments;
        $post->save();

        // Create notification
        $userId = (string) $request->user()->getAuthIdentifier();
        if ($post->user_id !== $userId) {
            Notification::create([
                'user_id' => $post->user_id,
                'actor_id' => $userId,
                'actor_name' => $request->user()->name,
                'post_id' => $post->id,
                'type' => 'comment',
                'is_read' => false,
                'message' => "{$request->user()->name} commented on your post."
            ]);
        }

        $post->load('user');
        return response()->json($post);
    }

    public function update(Request $request, $id)
    {
        $request->validate([
            'content' => 'required|string',
            'category' => 'required|string|in:Fitness,Mental Health,Diet,Yoga',
        ]);

        $post = Post::findOrFail($id);
        
        if ($post->user_id !== (string) $request->user()->getAuthIdentifier()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $post->update([
            'content' => $request->content,
            'category' => $request->category
        ]);

        $post->load('user');
        return response()->json($post);
    }

    public function destroy(Request $request, $id)
    {
        $post = Post::findOrFail($id);
        
        if ($post->user_id !== (string) $request->user()->getAuthIdentifier()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        if ($post->image) {
            $this->deleteFromCloudinary($post->image);
        }

        $post->delete();

        return response()->json(['message' => 'Post deleted successfully']);
    }

    private function deleteFromCloudinary($url) {
        if (!$url) return;
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
}
