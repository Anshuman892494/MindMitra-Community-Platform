<?php

namespace App\Models;

use MongoDB\Laravel\Eloquent\Model;

class Post extends Model
{
    protected $fillable = [
        'user_id',
        'content',
        'category',
        'likes',
        'comments',
        'image'
    ];

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}
