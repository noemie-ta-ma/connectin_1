<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\Storage;
use OpenApi\Attributes as OA;
use App\Models\Post;
use Illuminate\Http\Request;

class PostController extends Controller
{

    #[OA\Get(
        path: '/posts',
        summary: 'Lister tous les posts (du plus récent au plus ancien)',
        tags: ['Posts'],
        security: [['bearerAuth' => []]],
        responses: [
            new OA\Response(response: 200, description: 'Liste des posts'),
        ]
    )]
    public function index()
    {
        // récupération de :: tous les posts de ce user, du plus récent au plus ancien + comment
        return Post::with(['user', 'comments.user', 'likes'])->latest()->get();
    }

    #[OA\Post(
        path: '/posts',
        summary: 'Créer un post',
        tags: ['Posts'],
        security: [['bearerAuth' => []]],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                required: ['content'],
                properties: [
                    new OA\Property(property: 'content', type: 'string', maxLength: 500, example: 'Mon premier post !'),
                ]
            )
        ),
        responses: [
            new OA\Response(response: 201, description: 'Post créé'),
            new OA\Response(response: 401, description: 'Non authentifié'),
            new OA\Response(response: 422, description: 'Validation error')
        ]
    )]
    public function store(Request $request)
    {
        $validated = $request->validate([
            'content' => 'required|string|max:500',
            'image' => 'nullable|image|mimes:jpg,jpeg,png,webp|max:4096'
        ]);

        // création du post
        $post = $request->user()->posts()->create([
            'content' => $validated['content']
        ]);

        // si une image est envoyée
        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('post_images', 'public');
            $post->image_path = $path;
            $post->save();
        }

        return response()->json([
            'message' => 'Post créé avec succès !',
            'post' => $post->fresh()->load('user')
        ], 201);
    }

    #[OA\Get(
        path: '/posts/{post}',
        summary: 'Voir un post précis (avec commentaires + auteurs)',
        tags: ['Posts'],
        security: [['bearerAuth' => []]],
        parameters: [
            new OA\Parameter(
                name: 'post',
                in: 'path',
                required: true,
                description: 'ID du post',
                schema: new OA\Schema(type: 'integer', example: 1)
            )
        ],
        responses: [
            new OA\Response(response: 200, description: 'Post détaillé'),
            new OA\Response(response: 401, description: 'Non authentifié'),
            new OA\Response(response: 404, description: 'Post introuvable')
        ]
    )]
    public function show(Post $post)
    {
        $post->load(['user', 'comments.user']);
        return response()->json($post);
    }

    #[OA\Put(
        path: '/posts/{post}',
        summary: 'Modifier un post (uniquement l\'auteur)',
        tags: ['Posts'],
        security: [['bearerAuth' => []]],
        parameters: [
            new OA\Parameter(
                name: 'post',
                in: 'path',
                required: true,
                description: 'ID du post',
                schema: new OA\Schema(type: 'integer', example: 1)
            )
        ],
        requestBody: new OA\RequestBody(
            required: false,
            content: new OA\JsonContent(
                properties: [
                    new OA\Property(property: 'content', type: 'string', maxLength: 500, example: 'Nouveau contenu')
                ]
            )
        ),
        responses: [
            new OA\Response(response: 200, description: 'Post modifié'),
            new OA\Response(response: 401, description: 'Non authentifié'),
            new OA\Response(response: 403, description: 'Action non autorisée'),
            new OA\Response(response: 404, description: 'Post introuvable'),
            new OA\Response(response: 422, description: 'Validation error')
        ]
    )]
   public function update(Request $request, Post $post)
{
    if ($post->user_id !== $request->user()->id) {
        return response()->json(['message' => 'Action non autorisée'], 403);
    }

    $validated = $request->validate([
        'content' => 'sometimes|required|string|max:500',
        'image'   => 'nullable|image|mimes:jpg,jpeg,png,webp|max:4096'
    ]);

    // Mise à jour du texte
    if ($request->has('content')) {
        $post->content = $request->input('content');
    }

    // Gestion de l'image (si un nouveau fichier est présent)
    if ($request->hasFile('image')) {
        // Supprimer l'ancienne image si elle existe
        if ($post->image_path) {
            Storage::disk('public')->delete($post->image_path);
        }
        $path = $request->file('image')->store('post_images', 'public');
        $post->image_path = $path;
    }

    $post->save();

    return response()->json([
        'message' => 'Post mis à jour',
        'post' => $post->fresh()->load('user')
    ]);
}

    #[OA\Post(
        path: '/posts/{post}',
        summary: "Modifier un post (texte et/ou image) - Utiliser _method=PUT dans le FormData",
        tags: ['Posts'],
        security: [['bearerAuth' => []]],
        parameters: [
            new OA\Parameter(
                name: 'post',
                in: 'path',
                required: true,
                description: 'ID du post',
                schema: new OA\Schema(type: 'integer', example: 1)
            )
        ],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\MediaType(
                mediaType: 'multipart/form-data',
                schema: new OA\Schema(
                    properties: [
                        new OA\Property(property: 'content', type: 'string', maxLength: 500, example: 'Nouveau contenu'),
                        new OA\Property(property: 'image', type: 'string', format: 'binary'),
                        new OA\Property(property: '_method', type: 'string', example: 'PUT')
                    ]
                )
            )
        ),
        responses: [
            new OA\Response(response: 200, description: 'Post modifié'),
            new OA\Response(response: 401, description: 'Non authentifié'),
            new OA\Response(response: 403, description: 'Action non autorisée'),
            new OA\Response(response: 404, description: 'Post introuvable'),
            new OA\Response(response: 422, description: 'Validation error')
        ]
    )]
    public function updateImage(Request $request, Post $post)
    {
        // Sécurité : uniquement l'auteur
        if ($post->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Action non autorisée'], 403);
        }

        $validated = $request->validate([
            'image' => 'required|file|image|mimes:jpg,jpeg,png,webp|max:4096',
        ]);

        // On supprime l'ancienne image si elle existe
        if ($post->image_path) {
            Storage::disk('public')->delete($post->image_path);
        }

        $path = $validated['image']->store('post_images', 'public');
        $post->image_path = $path;
        $post->save();

        return response()->json([
            'message' => 'Image ajoutée au post',
            'post' => $post->fresh()->load('user'),
        ]);
    }

    #[OA\Delete(
        path: '/posts/{post}/image',
        summary: "Supprimer l'image d'un post",
        tags: ['Posts'],
        security: [['bearerAuth' => []]],
        parameters: [
            new OA\Parameter(
                name: 'post',
                in: 'path',
                required: true,
                description: 'ID du post',
                schema: new OA\Schema(type: 'integer', example: 1)
            )
        ],
        responses: [
            new OA\Response(response: 200, description: 'Image supprimée'),
            new OA\Response(response: 401, description: 'Non authentifié'),
            new OA\Response(response: 403, description: 'Action non autorisée'),
            new OA\Response(response: 404, description: 'Post introuvable')
        ]
    )]
    public function destroyImage(Request $request, Post $post)
    {
        // Sécurité : Uniquement l'auteur du post peut supprimer l'image
        if ($post->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Action non autorisée'], 403);
        }

        // Si le post possède une image, on la supprime physiquement et en base
        if ($post->image_path) {
            Storage::disk('public')->delete($post->image_path);
            $post->image_path = null;
            $post->save();
        }

        return response()->json([
            'message' => 'Image du post supprimée avec succès',
            'post' => $post->fresh()->load('user')
        ]);
    }

    #[OA\Delete(
        path: '/posts/{post}',
        summary: 'Supprimer un post (uniquement l\'auteur)',
        tags: ['Posts'],
        security: [['bearerAuth' => []]],
        parameters: [
            new OA\Parameter(
                name: 'post',
                in: 'path',
                required: true,
                description: 'ID du post',
                schema: new OA\Schema(type: 'integer', example: 1)
            )
        ],
        responses: [
            new OA\Response(response: 200, description: 'Post supprimé'),
            new OA\Response(response: 401, description: 'Non authentifié'),
            new OA\Response(response: 403, description: 'Action non autorisée'),
            new OA\Response(response: 404, description: 'Post introuvable')
        ]
    )]
    public function destroy(Request $request, Post $post)
    {
        // Sécurité : On vérifie que c'est bien l'auteur qui supprime
        if ($post->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Action non autorisée'], 403);
        }

        // autre sécurité : on supprime l'image du post s'il y en a une
        if ($post->image_path) {
            Storage::disk('public')->delete($post->image_path);
        }

        $post->delete();

        return response()->json(['message' => 'Post supprimé']);
    }
}