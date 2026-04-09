<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Like extends Model
{
    // fillable : autorisation de remplir
    protected $fillable = ['user_id', 'post_id'];

    // belongsTo : Un like appartient à un utilisateur
    public function user() {
        return $this->belongsTo(User::class);
    }

    // belongsTo : Un like appartient à un post
    public function post() {
        return $this->belongsTo(Post::class);
    }
}