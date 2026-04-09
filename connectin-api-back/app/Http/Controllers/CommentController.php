<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\Storage;
use OpenApi\Attributes as OA;
use App\Models\Comment;
use App\Models\Post;
use Illuminate\Http\Request;

class CommentController extends Controller
{
    #[OA\Get(
        path: "/posts/{post}/comments",
        summary: "Lister les commentaires d'un post",
        tags: ["Comments"],
        security: [["bearerAuth" => []]],
        parameters: [
            new OA\Parameter(
                name: "post",
                in: "path",
                required: true,
                description: "ID du post",
                schema: new OA\Schema(type: "integer", example: 1)
            )
        ],
        responses: [
            new OA\Response(response: 200, description: "Liste des commentaires"),
            new OA\Response(response: 401, description: "Non authentifié"),
            new OA\Response(response: 404, description: "Post introuvable")
        ]
    )]
    public function index(Post $post)
    {
        return $post->comments()
            ->with('user')
            ->latest()
            ->get();
    }

    #[OA\Post(
        path: "/comments",
        summary: "Créer un commentaire sur un post",
        tags: ["Comments"],
        security: [["bearerAuth" => []]],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                required: ["post_id", "content"],
                properties: [
                    new OA\Property(property: "post_id", type: "integer", example: 1),
                    new OA\Property(property: "content", type: "string", maxLength: 500, example: "Super post !")
                ]
            )
        ),
        responses: [
            new OA\Response(response: 201, description: "Commentaire créé"),
            new OA\Response(response: 401, description: "Non authentifié"),
            new OA\Response(response: 422, description: "Validation error")
        ]
    )]
    public function store(Request $request)
    {
        $validated = $request->validate([
            'post_id' => 'required|exists:posts,id',
            'content' => 'required|string|max:500',
        ]);

        // On lie le commentaire à l'utilisateur connecté
        $comment = $request->user()->comments()->create($validated);

        return response()->json([
            'message' => 'Commentaire ajouté !',
            'comment' => $comment->load('user') // On charge l'auteur pour l'affichage front
        ], 201);
    }

    #[OA\Put(
        path: "/comments/{comment}",
        summary: "Modifier son commentaire",
        tags: ["Comments"],
        security: [["bearerAuth" => []]],
        parameters: [
            new OA\Parameter(
                name: "comment",
                in: "path",
                required: true,
                description: "ID du commentaire",
                schema: new OA\Schema(type: "integer", example: 10)
            )
        ],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                required: ["content"],
                properties: [
                    new OA\Property(property: "content", type: "string", maxLength: 500, example: "Commentaire modifié")
                ]
            )
        ),
        responses: [
            new OA\Response(response: 200, description: "Commentaire modifié"),
            new OA\Response(response: 401, description: "Non authentifié"),
            new OA\Response(response: 403, description: "Action non autorisée"),
            new OA\Response(response: 404, description: "Commentaire introuvable"),
            new OA\Response(response: 422, description: "Validation error")
        ]
    )]
    public function update(Request $request, Comment $comment)
    {
        if ($comment->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Action non autorisée'], 403);
        }

        $validated = $request->validate([
            'content' => 'required|string|max:500',
        ]);

        $comment->update($validated);

        return response()->json([
            'message' => 'Commentaire modifié !',
            'comment' => $comment->fresh()->load('user')
        ]);
    }

    #[OA\Post(
        path: "/comments/{comment}/image",
        summary: "Ajouter / remplacer l'image d'un commentaire",
        tags: ["Comments"],
        security: [["bearerAuth" => []]],
        parameters: [
            new OA\Parameter(
                name: "comment",
                in: "path",
                required: true,
                description: "ID du commentaire",
                schema: new OA\Schema(type: "integer", example: 10)
            )
        ],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\MediaType(
                mediaType: "multipart/form-data",
                schema: new OA\Schema(
                    required: ["image"],
                    properties: [
                        new OA\Property(property: "image", type: "string", format: "binary")
                    ]
                )
            )
        ),
        responses: [
            new OA\Response(response: 200, description: "Image mise à jour"),
            new OA\Response(response: 401, description: "Non authentifié"),
            new OA\Response(response: 403, description: "Action non autorisée"),
            new OA\Response(response: 422, description: "Validation error"),
        ]
    )]
    public function updateImage(Request $request, Comment $comment)
    {
        if ($comment->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Action non autorisée'], 403);
        }

        $validated = $request->validate([
            'image' => 'required|file|image|mimes:jpg,jpeg,png,webp|max:2048',
        ]);

        // On supprime l'ancienne image si elle existe
        if ($comment->image_path) {
            Storage::disk('public')->delete($comment->image_path);
        }

        $path = $validated['image']->store('comment_images', 'public');
        $comment->image_path = $path;
        $comment->save();

        return response()->json([
            'message' => 'Image ajoutée au commentaire',
            'comment' => $comment->fresh()->load('user'),
        ]);
    }

    #[OA\Delete(
        path: "/comments/{comment}",
        summary: "Supprimer son commentaire",
        tags: ["Comments"],
        security: [["bearerAuth" => []]],
        parameters: [
            new OA\Parameter(
                name: "comment",
                in: "path",
                required: true,
                description: "ID du commentaire",
                schema: new OA\Schema(type: "integer", example: 10)
            )
        ],
        responses: [
            new OA\Response(response: 200, description: "Commentaire supprimé"),
            new OA\Response(response: 401, description: "Non authentifié"),
            new OA\Response(response: 403, description: "Action non autorisée"),
            new OA\Response(response: 404, description: "Commentaire introuvable")
        ]
    )]
    public function destroy(Request $request, Comment $comment)
    {
        // Vérification de sécurité pour que ce soit le user qui a écrit le commentaire qui puisse le supprimer
        if ($comment->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Action non autorisée'], 403);
        }

        // supprimer le fichier associé si nécessaire
        if ($comment->image_path) {
            Storage::disk('public')->delete($comment->image_path);
        }

        $comment->delete();

        return response()->json(['message' => 'Commentaire supprimé']);
    }
}