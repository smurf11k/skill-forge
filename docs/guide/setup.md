# Setup

## Prerequisites

- Docker
- PHP 8.2+
- Composer
- Node 18+

## Start database

```bash
docker compose up -d
```

## Backend

```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
php artisan serve
```

## Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on:

```
http://localhost:5173
```
