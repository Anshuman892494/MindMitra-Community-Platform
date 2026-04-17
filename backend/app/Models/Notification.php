<?php

namespace App\Models;

use MongoDB\Laravel\Eloquent\Model;

class Notification extends Model
{
    protected $fillable = [
        'user_id',
        'actor_id',
        'actor_name',
        'post_id',
        'type',
        'is_read',
        'message'
    ];

    protected $casts = [
        'is_read' => 'boolean',
    ];

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function actor()
    {
        return $this->belongsTo(User::class, 'actor_id');
    }

    public function post()
    {
        return $this->belongsTo(Post::class, 'post_id');
    }
}
