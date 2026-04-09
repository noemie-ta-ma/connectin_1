<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Post extends Model
{
    // fillable : autorisation de remplir
    protected $fillable = ['content', 'image_path', 'user_id'];

    protected $appends = ['author_name'];

    // belongsTo : Un post appartient à un utilisateur
    public function user() {
        return $this->belongsTo(User::class);
    }

    // hasMany : Un post possède plusieurs commentaires
    public function comments() {
        return $this->hasMany(Comment::class);
    }

    // hasMany : Un post possède plusieurs likes
    public function likes() {
        return $this->hasMany(Like::class);
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