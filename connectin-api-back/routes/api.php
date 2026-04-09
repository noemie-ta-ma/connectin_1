<?php

use Illuminate\Support\Facades\Route;

use App\Http\Controllers\AuthController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\PostController;
use App\Http\Controllers\CommentController;
use App\Http\Controllers\LikeController;

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);

    // PROFILE (user connecté)
    Route::get('/profile', [UserController::class, 'show']);
    Route::get('/profile/posts', [UserController::class, 'myPosts']);
    Route::put('/profile', [UserController::class, 'update']);
    Route::delete('/profile', [UserController::class, 'destroy']);
    Route::post('/profile/picture', [UserController::class, 'updatePicture']);
    Route::delete('/profile/picture', [UserController::class, 'destroyPicture']);

    // USERS (autres profils)
    Route::get('/users/{user}', [UserController::class, 'showPublic']); 
    Route::get('/users/{user}/posts', [UserController::class, 'postsByUser']);

    // POSTS
    Route::get('/posts', [PostController::class, 'index']);
    Route::post('/posts', [PostController::class, 'store']);
    Route::get('/posts/{post}', [PostController::class, 'show']);
    Route::match(['post', 'put'], '/posts/{post}', [PostController::class, 'update']);    
    Route::delete('/posts/{post}', [PostController::class, 'destroy']);
    Route::post('/posts/{post}/image', [PostController::class, 'updateImage']);
    Route::delete('/posts/{post}/image', [PostController::class, 'destroyImage']);

    // COMMENTS
    Route::get('/posts/{post}/comments', [CommentController::class, 'index']);
    Route::post('/comments', [CommentController::class, 'store']);
    Route::put('/comments/{comment}', [CommentController::class, 'update']);
    Route::delete('/comments/{comment}', [CommentController::class, 'destroy']);
    Route::post('/comments/{comment}/image', [CommentController::class, 'updateImage']);

    // LIKES
    Route::post('/likes', [LikeController::class, 'store']);
});