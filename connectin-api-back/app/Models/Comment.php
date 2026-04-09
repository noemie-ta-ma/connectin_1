<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Comment extends Model
{
    // fillable : autorisation de remplir
    protected $fillable = ['content', 'user_id', 'post_id', 'image_path'];

    protected $appends = ['author_name'];

    // belongsTo : Le commentaire appartient à un post
    public function post() {
        return $this->belongsTo(Post::class);
    }

    // belongsTo : Le commentaire appartient à un utilisateur
    public function user() {
        return $this->belongsTo(User::class);
    }

    // utilisateur suppr
    public function getAuthorNameAttribute()
    {
        if (!$this->user) {
            return 'Utilisateur supprimé';
        }

        $first = $this->user->first_name ?? '';
        $last  = $this->user->last_name ?? '';
        $full  = trim($first . ' ' . $last);

        return $full !== '' ? $full : 'Utilisateur';
    }
}