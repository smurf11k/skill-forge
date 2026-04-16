# Тестування

Цей посібник підсумовує поточні команди тестування та рекомендовані локальні перевірки.

## Тести backend

Backend-тести запускаються через тестовий раннер Laravel з інтеграцією PHPUnit.

```powershell
cd backend
php artisan test
```

Запустити конкретний файл тестів:

```powershell
php artisan test tests/Feature/AuthTest.php
```

## Рекомендовані smoke-checks backend

Після великих змін backend перевіряйте:

- вхід і вихід із системи
- поведінку ендпоінтів із обмеженням ролей
- основні CRUD-ендпоінти (courses, lessons, quizzes, questions)
- скидання результатів
- потоки створення й прийняття запрошень
- створення й оновлення призначень

## Перевірки frontend

Наразі окремий frontend test suite не налаштовано.

Використовуйте такі quality gates:

```powershell
cd frontend
npm run lint
npm run build
```

Ручний регресійний чекліст:

- вхід як співробітник і як адмін
- сценарій курсу для співробітника (завершення уроку, відправлення квізу)
- редагування контенту адміністратором і перемикачі публікації
- робочі процеси призначень і запрошень
- перенаправлення через route guards

## Перевірки docs

Перевіряйте docs після будь-яких змін Markdown або theme:

```powershell
cd docs
npm run docs:build
```

Під час роботи над контентом використовуйте docs dev server:

```powershell
npm run docs:dev
```

## Рекомендація для CI

Якщо CI буде додано або розширено, включіть:

1. backend `php artisan test`
2. frontend `npm run lint` і `npm run build`
3. docs `npm run docs:build`
