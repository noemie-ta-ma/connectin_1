<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Database\Eloquent\SoftDeletes;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasApiTokens, HasFactory, Notifiable, SoftDeletes;

    // fillable : autorisation de remplir
    protected $fillable = [
        'first_name',
        'last_name',
        'email',
        'password',
        'bio',
        'profile_picture',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    // hasMany : L'utilisateur peut publier plusieurs posts
    public function posts() {
        return $this->hasMany(Post::class);
    }

    // hasMany : L'utilisateur peut écrire plusieurs commentaires
    public function comments() {
        return $this->hasMany(Comment::class);
    }

    // hasMany : L'utilisateur peut liker plusieurs posts
    public function likes() {
        return $this->hasMany(Like::class);
    }
}