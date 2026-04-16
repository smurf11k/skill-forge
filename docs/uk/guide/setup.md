# Налаштування

Ця сторінка описує локальне налаштування backend API, frontend-застосунку та сайту документації.

## Необхідно

- Docker
- PHP 8.2+
- Composer
- Node.js 18+

## 1. Запустити PostgreSQL

З кореня проєкту:

```powershell
docker compose up -d
```

## 2. Налаштувати та запустити backend

```powershell
cd backend
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate --seed
php artisan serve
```

Типовий backend URL:

```txt
http://127.0.0.1:8000
```

## 3. Налаштувати та запустити frontend

У новому терміналі:

```powershell
cd frontend
npm install
npm run dev
```

Типовий frontend URL:

```txt
http://localhost:5173
```

## 4. Запустити сайт документації

У третьому терміналі:

```powershell
cd docs
npm install
npm run docs:dev
```

## Примітки щодо середовища

- Backend використовує токенну аутентифікацію Laravel Sanctum.
- Переконайтеся, що `FRONTEND_URL` у backend відповідає URL вашого frontend dev-сервера.
- Для надсилання листів із запрошеннями замість логування потрібні налаштування пошти в `backend/.env`.

## Корисні команди

```powershell
# тести backend
cd backend
php artisan test

# перебудувати базу з демо-даними
php artisan migrate:fresh --seed

# production build для docs
cd ../docs
npm run docs:build
```
