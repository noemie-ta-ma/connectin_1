<?php

namespace App\Swagger;

use OpenApi\Attributes as OA;

#[OA\Info(
    title: "Connect'in API",
    version: "1.0.0",
    description: "Documentation Swagger de l'API Connect'in"
)]
#[OA\Server(
    url: "http://localhost:8000/api",
    description: "Serveur local"
)]
#[OA\SecurityScheme(
    securityScheme: "bearerAuth",
    type: "http",
    scheme: "bearer",
    bearerFormat: "JWT",
    description: "Entrer le token sous la forme: Bearer {token}"
)]
class OpenApi {}