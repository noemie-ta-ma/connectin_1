<?php

namespace App\Http\Controllers;

use OpenApi\Attributes as OA;
use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;

class UserController extends Controller
{

#[OA\Get(
    path: '/profile',
    summary: 'Afficher le profil connecté',
    tags: ['Profile'],
    security: [['bearerAuth' => []]],
    responses: [
        new OA\Response(response: 200, description: 'Profil'),
        new OA\Response(response: 401, description: 'Non authentifié')
    ]
)]
public function show(Request $request)
{
    return response()->json($request->user());
}

#[OA\Get(
    path: '/profile/posts',
    summary: 'Lister les posts du profil connecté',
    tags: ['Profile'],
    security: [['bearerAuth' => []]],
    responses: [
        new OA\Response(response: 200, description: 'Liste des posts du user connecté'),
        new OA\Response(response: 401, description: 'Non authentifié')
    ]
)]
public function myPosts(Request $request)
{
    $user = $request->user();

    // récupération de :: tous les posts de ce user, du plus récent au plus ancien + comments + likes
    return response()->json(
        $user->posts()
            ->with(['user', 'comments.user', 'likes'])
            ->latest()
            ->get()
    );
}

#[OA\Get(
    path: '/users/{user}',
    summary: 'Voir le profil d\'un utilisateur',
    tags: ['Users'],
    security: [['bearerAuth' => []]],
    parameters: [
        new OA\Parameter(
            name: 'user',
            in: 'path',
            required: true,
            description: 'ID du user',
            schema: new OA\Schema(type: 'integer', example: 1)
        )
    ],
    responses: [
        new OA\Response(response: 200, description: 'Profil user'),
        new OA\Response(response: 401, description: 'Non authentifié'),
        new OA\Response(response: 404, description: 'User introuvable')
    ]
)]
public function showPublic(User $user)
{
    // Profil "public" : on renvoie seulement ce qui est utile au front
    return response()->json([
        'id' => $user->id,
        'first_name' => $user->first_name,
        'last_name' => $user->last_name,
        'bio' => $user->bio,
        'profile_picture' => $user->profile_picture,
        'created_at' => $user->created_at,
    ]);
}

#[OA\Get(
    path: '/users/{user}/posts',
    summary: 'Lister les posts d\'un utilisateur',
    tags: ['Users'],
    security: [['bearerAuth' => []]],
    parameters: [
        new OA\Parameter(
            name: 'user',
            in: 'path',
            required: true,
            description: 'ID du user',
            schema: new OA\Schema(type: 'integer', example: 1)
        )
    ],
    responses: [
        new OA\Response(response: 200, description: 'Liste des posts du user'),
        new OA\Response(response: 401, description: 'Non authentifié'),
        new OA\Response(response: 404, description: 'User introuvable')
    ]
)]
public function postsByUser(User $user)
{
    // Tous les posts du user cliqué, du plus récent au plus ancien, avec comments + likes
    return response()->json(
        $user->posts()
            ->with(['user', 'comments.user', 'likes'])
            ->latest()
            ->get()
    );
}

#[OA\Put(
    path: '/profile',
    summary: 'Mettre à jour le profil',
    tags: ['Profile'],
    security: [['bearerAuth' => []]],
    requestBody: new OA\RequestBody(
        required: false,
        content: new OA\JsonContent(
            type: 'object',
            properties: [
                new OA\Property(property: 'first_name', type: 'string', example: 'Ada', nullable: true),
                new OA\Property(property: 'last_name', type: 'string', example: 'Lovelace', nullable: true),
                new OA\Property(property: 'bio', type: 'string', example: 'Ma nouvelle bio', nullable: true),
                new OA\Property(property: 'email', type: 'string', example: 'ada@connectin.com', nullable: true),
            ]
        )
    ),
    responses: [
        new OA\Response(response: 200, description: 'Profil mis à jour'),
        new OA\Response(response: 401, description: 'Non authentifié'),
        new OA\Response(response: 422, description: 'Validation error'),
    ]
)]
public function update(Request $request)
{
    $user = $request->user();

    $validated = $request->validate([
        'first_name' => 'sometimes|nullable|string|max:100',
        'last_name'  => 'sometimes|nullable|string|max:100',
        'bio'        => 'sometimes|nullable|string|max:1000',
        'email'      => 'sometimes|nullable|email|unique:users,email,' . $user->id,
    ]);

    $user->fill($validated);
    $user->save();

    return response()->json([
        'message' => 'Profil mis à jour avec succès',
        'user' => $user->fresh(),
    ]);
}

public function updatePassword(Request $request)
{
    $user = $request->user();

    $validated = $request->validate([
        'current_password' => 'required|string',
        'password' => 'required|string|min:8|confirmed',
    ]);

    if (!Hash::check($validated['current_password'], $user->password)) {
        return response()->json(['message' => 'Mot de passe actuel incorrect'], 422);
    }

    $user->password = Hash::make($validated['password']);
    $user->save();

    $user->tokens()->delete();

    return response()->json(['message' => 'Mot de passe modifié avec succès.']);
}

#[OA\Delete(
    path: '/profile',
    summary: 'Supprimer le compte',
    tags: ['Profile'],
    security: [['bearerAuth' => []]],
    parameters: [
        new OA\Parameter(
            name: 'delete_all',
            in: 'query',
            required: false,
            description: 'Option : Si le front envoie ?delete_all=true, on supprime le contenu associé (posts + commentaires). Sinon on garde le contenu et le nom/prénom devient "Utilisateur supprimé".',
            schema: new OA\Schema(type: 'boolean', example: true)
        )
    ],
    requestBody: new OA\RequestBody(
        required: true,
        content: new OA\JsonContent(
            required: ['password'],
            properties: [
                new OA\Property(property: 'password', type: 'string', format: 'password', example: 'MotDePasse123')
            ]
        )
    ),
    responses: [
        new OA\Response(response: 200, description: 'Compte supprimé'),
        new OA\Response(response: 401, description: 'Non authentifié'),
        new OA\Response(response: 422, description: 'Mot de passe incorrect / validation error')
    ]
)]
public function destroy(Request $request)
{
    $user = $request->user();

    $validated = $request->validate([
        'password' => 'required|string',
    ]);

    if (!Hash::check($validated['password'], $user->password)) {
        return response()->json(['message' => 'Mot de passe incorrect'], 422);
    }

    // Option : Si le front envoie ?delete_all=true
    if ($request->boolean('delete_all')) {
        // On force la suppression des contenus AVANT de supprimer l'user
        // comme ça y a le cascade

        // suppression des images + posts
        $user->posts()->each(function ($post) {
            if ($post->image_path) {
                Storage::disk('public')->delete($post->image_path);
            }
            $post->delete();
        });

        // suppression des images + commentaires
        $user->comments()->each(function ($comment) {
            if ($comment->image_path) {
                Storage::disk('public')->delete($comment->image_path);
            }
            $comment->delete();
        });
    }

    // Dans tous les cas, on révoque les tokens de connexion
    $user->tokens()->delete();

    // autre sécurité : on supprime la photo de profil s'il y en a une
    if ($user->profile_picture) {
        Storage::disk('public')->delete($user->profile_picture);
    }
    
    // On supprime l'utilisateur (hard delete)
    $user->forceDelete();

    return response()->json(['message' => 'Compte supprimé avec succès.']);
}

#[OA\Post(
    path: '/profile/picture',
    summary: 'Mettre à jour la photo de profil',
    tags: ['Profile'],
    security: [['bearerAuth' => []]],
    requestBody: new OA\RequestBody(
        required: true,
        content: new OA\MediaType(
            mediaType: 'multipart/form-data',
            schema: new OA\Schema(
                required: ['profile_picture'],
                properties: [
                    new OA\Property(property: 'profile_picture', type: 'string', format: 'binary'),
                ]
            )
        )
    ),
    responses: [
        new OA\Response(response: 200, description: 'Photo mise à jour'),
        new OA\Response(response: 401, description: 'Non authentifié'),
        new OA\Response(response: 422, description: 'Validation error'),
    ]
)]
public function updatePicture(Request $request)
{
    $user = $request->user();

    $validated = $request->validate([
        'profile_picture' => 'required|file|image|mimes:jpg,jpeg,png,webp|max:2048',
    ]);

    if ($user->profile_picture) {
        Storage::disk('public')->delete($user->profile_picture);
    }

    $path = $validated['profile_picture']->store('profile_pictures', 'public');
    $user->profile_picture = $path;
    $user->save();

    return response()->json([
        'message' => 'Photo mise à jour avec succès',
        'user' => $user->fresh(),
    ]);
}

#[OA\Delete(
    path: '/profile/picture',
    summary: 'Supprimer la photo de profil',
    tags: ['Profile'],
    security: [['bearerAuth' => []]],
    responses: [
        new OA\Response(response: 200, description: 'Photo de profil supprimée'),
        new OA\Response(response: 401, description: 'Non authentifié'),
    ]
)]
public function destroyPicture(Request $request)
{
    $user = $request->user();

    if ($user->profile_picture) {
        Storage::disk('public')->delete($user->profile_picture);
        $user->profile_picture = null;
        $user->save();
    }

    return response()->json([
        'message' => 'Photo de profil supprimée avec succès',
        'user' => $user->fresh(),
    ]);
}
}