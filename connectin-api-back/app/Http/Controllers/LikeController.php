<?php

namespace App\Http\Controllers;

use OpenApi\Attributes as OA;
use App\Models\Like;
use Illuminate\Http\Request;

class LikeController extends Controller
{

    #[OA\Post(
        path: "/likes",
        summary: "Like/Unlike (toggle) un post",
        tags: ["Likes"],
        security: [["bearerAuth" => []]],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                required: ["post_id"],
                properties: [
                    new OA\Property(property: "post_id", type: "integer", example: 1)
                ]
            )
        ),
        responses: [
            new OA\Response(response: 201, description: "Post liké"),
            new OA\Response(response: 200, description: "Like retiré (unliked)"),
            new OA\Response(response: 401, description: "Non authentifié"),
            new OA\Response(response: 422, description: "Validation error")
        ]
    )]
    public function store(Request $request)
    {
        $request->validate([
            'post_id' => 'required|exists:posts,id',
        ]);

        $userId = $request->user()->id;
        $postId = $request->post_id;

        // recherche d'existence du like pour ce post et cet utilisateur
        $like = Like::where('user_id', $userId)
                    ->where('post_id', $postId)
                    ->first();

        if ($like) {
            // si like existe on le supprime (unlike)
            $like->delete();

        $likesCount = Like::where('post_id', $postId)->count();

        return response()->json([
                'status' => 'unliked',
                'message' => 'Like retiré avec succès',
                'likes_count' => $likesCount,
            ]);
        }

        // si pas de like on le crée
        $newLike = Like::create([
            'user_id' => $userId,
            'post_id' => $postId
        ]);

        $likesCount = Like::where('post_id', $postId)->count();

        return response()->json([
            'status' => 'liked',
            'message' => 'Post liké !',
            'like' => $newLike,
            'likes_count' => $likesCount
        ], 201);
    }

}