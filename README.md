# Connect'In — Réseau social interne d'entreprise

<p align="center">
  <a href="https://laravel.com/">
    <img alt="Laravel" src="https://img.shields.io/badge/Laravel-10%2B-FF2D20?logo=laravel&logoColor=white">
  </a>
  <a href="https://laravel.com/docs/sanctum">
    <img alt="Laravel Sanctum" src="https://img.shields.io/badge/Laravel%20Sanctum-Auth-FF2D20?logo=laravel&logoColor=white">
  </a>
  <a href="https://react.dev/">
    <img alt="React" src="https://img.shields.io/badge/React-18%2B-61DAFB?logo=react&logoColor=000">
  </a>
  <a href="https://vitejs.dev/">
    <img alt="Vite" src="https://img.shields.io/badge/Vite-5%2B-646CFF?logo=vite&logoColor=white">
  </a>
  <a href="https://tailwindcss.com/">
    <img alt="Tailwind CSS" src="https://img.shields.io/badge/TailwindCSS-3-06B6D4?logo=tailwindcss&logoColor=white">
  </a>
  <a href="https://www.mysql.com/">
    <img alt="MySQL" src="https://img.shields.io/badge/MySQL-4479A1?logo=mysql&logoColor=white">
  </a>
  <a href="https://swagger.io/specification/">
    <img alt="Swagger / OpenAPI" src="https://img.shields.io/badge/Swagger%20%2F%20OpenAPI-Documentation-85EA2D?logo=swagger&logoColor=000">
  </a>
</p>

## Présentation du projet
Connect'In est une application web composée de :
- **Back-end** : API REST Laravel + Laravel Sanctum
- **Front-end** : application React (Vite + Tailwind CSS)
- **Base de données** : MySQL
- **Documentation API** : Swagger (OpenAPI)

---

## Prévisualisation

<p align="center">
  <img src="connectin-api-front/src/assets/preview1.png" alt="Prévisualisation 1" width="1000">
</p>

<p align="center">
  <img src="connectin-api-front/src/assets/preview2.png" alt="Prévisualisation 2" width="1000">
</p>

<p align="center">
  <img src="connectin-api-front/src/assets/preview3.png" alt="Prévisualisation 3" width="1000">
</p>

---

## Pré-requis
- PHP 8.2+
- Composer
- Node.js + npm
- MySQL / MariaDB

---

## Installation & lancement

### 1) Backend (Laravel API)
```bash
cd connectin-api-back
composer install
cp .env.example .env
php artisan key:generate
```

Configurer la base MySQL dans `.env` :
```env
DB_DATABASE=
DB_USERNAME=
DB_PASSWORD=
SANCTUM_STATEFUL_DOMAINS=localhost:5173
FRONTEND_URL=http://localhost:5173
```

Puis lancer :
```bash
php artisan migrate
php artisan storage:link
php artisan serve
```

API disponible sur : `http://localhost:8000/api`

---

### 2) Frontend
```bash
cd connectin-api-front
npm install
npm run dev
```

Frontend disponible sur : `http://localhost:5173`

---

## Utilisation de l'API

Toutes les routes protégées nécessitent un token Bearer obtenu à la connexion.

**Inscription**
```http
POST /api/register
Content-Type: application/json

{ "first_name": "Jane", "last_name": "Doe", "email": "jane@company.com", "password": "secret123" }
```

**Connexion**
```http
POST /api/login
Content-Type: application/json

{ "email": "jane@company.com", "password": "secret123" }
```
Réponse : `{ "token": "..." }`

**Exemple de requête authentifiée**
```http
GET /api/posts
Authorization: Bearer {token}
```

---

## Documentation Swagger

Lancer le backend puis ouvrir :
`http://localhost:8000/api/documentation`

---

## Diagramme de la base de données

Disponible dans `Connect'In-Diagram.png`