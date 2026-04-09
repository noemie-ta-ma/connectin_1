<?php

namespace App\Http\Controllers;

use OpenApi\Attributes as OA;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;

class AuthController extends Controller
{
    #[OA\Post(
        path: '/register',
        summary: 'Inscription (création de compte)',
        tags: ['Auth'],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                required: ['first_name', 'last_name', 'email', 'password', 'password_confirmation'],
                properties: [
                    new OA\Property(property: 'first_name', type: 'string', maxLength: 100, example: 'Ada'),
                    new OA\Property(property: 'last_name', type: 'string', maxLength: 100, example: 'Lovelace'),
                    new OA\Property(property: 'email', type: 'string', format: 'email', maxLength: 200, example: 'ada@connectin.com'),
                    new OA\Property(property: 'password', type: 'string', format: 'password', minLength: 8, example: 'MotDePasse123'),
                    new OA\Property(property: 'password_confirmation', type: 'string', format: 'password', example: 'MotDePasse123'),
                ]
            )
        ),
        responses: [
            new OA\Response(
                response: 201,
                description: 'Compte créé + token',
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: 'access_token', type: 'string', example: '1|xxxxxxxxxxxxxxxx'),
                        new OA\Property(property: 'token_type', type: 'string', example: 'Bearer'),
                        new OA\Property(property: 'user', type: 'object')
                    ]
                )
            ),
            new OA\Response(response: 422, description: 'Validation error')
        ]
    )]
    // function pour register (inscription)
    public function register(Request $request)
    {
        $request->validate([
            'first_name' => 'required|string|max:100',
            'last_name' => 'required|string|max:100',
            'email' => 'required|string|email|max:200|unique:users,email',
            'password' => 'required|string|min:8|confirmed',
        ]);

        $user = User::create([
            'first_name' => $request->first_name,
            'last_name' => $request->last_name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
        ]);

        // Création du token d'authentification pour l'utilisateur
        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'access_token' => $token,
            'token_type' => 'Bearer',
            'user' => $user
        ], 201);
    }

    #[OA\Post(
        path: '/login',
        summary: 'Connexion',
        tags: ['Auth'],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                required: ['email', 'password'],
                properties: [
                    new OA\Property(property: 'email', type: 'string', example: 'test@connectin.com'),
                    new OA\Property(property: 'password', type: 'string', example: 'MotDePasse123')
                ]
            )
        ),
        responses: [
            new OA\Response(response: 200, description: 'Token + user'),
            new OA\Response(response: 401, description: 'Identifiants invalides'),
            new OA\Response(response: 422, description: 'Validation error')
        ]
    )]
    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|string|email|max:200',
            'password' => 'required|string',
        ]);

        if (!Auth::attempt($request->only('email', 'password'))) {
            return response()->json(['message' => 'Identifiants invalides'], 401);
        }

        $user = User::where('email', $request->email)->firstOrFail();
        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'access_token' => $token,
            'token_type' => 'Bearer',
            'user' => $user
        ]);
    }

    #[OA\Post(
        path: '/logout',
        summary: 'Déconnexion',
        tags: ['Auth'],
        security: [['bearerAuth' => []]],
        responses: [
            new OA\Response(response: 200, description: 'Déconnecté'),
            new OA\Response(response: 401, description: 'Non authentifié')
        ]
    )]
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Déconnecté']);
    }
}