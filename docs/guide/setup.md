# Setup

This page covers local development setup for backend API, frontend app, and docs site.

## Prerequisites

- Docker
- PHP 8.2+
- Composer
- Node.js 18+

## 1. Start PostgreSQL

From project root:

```powershell
docker compose up -d
```

## 2. Configure and start backend

```powershell
cd backend
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate --seed
php artisan serve
```

Default backend URL:

```txt
http://127.0.0.1:8000
```

## 3. Configure and start frontend

In a new terminal:

```powershell
cd frontend
npm install
npm run dev
```

Default frontend URL:

```txt
http://localhost:5173
```

## 4. Run docs site

In a third terminal:

```powershell
cd docs
npm install
npm run docs:dev
```

## Environment notes

- Backend uses Laravel Sanctum token auth.
- Ensure backend `FRONTEND_URL` matches your frontend dev URL.
- Invite and assignment emails require mail settings in `backend/.env`.

## Useful commands

```powershell
# backend tests
cd backend
php artisan test

# rebuild seeded database
php artisan migrate:fresh --seed

# production docs build
cd ../docs
npm run docs:build
```
