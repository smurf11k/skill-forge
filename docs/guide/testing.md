# Testing

This guide summarizes current testing commands and recommended local checks.

## Backend tests

Backend tests run with Laravel's test runner (PHPUnit integration).

```powershell
cd backend
php artisan test
```

Run a specific test file:

```powershell
php artisan test tests/Feature/AuthTest.php
```

## Recommended backend smoke checks

After major backend changes, validate:

- auth login and logout
- role-restricted endpoint behavior
- core CRUD endpoints (courses, lessons, quizzes, questions)
- results reset behavior
- invite create and accept flows
- assignment create and update flows

## Frontend checks

There is no dedicated frontend test suite currently configured.

Use these quality gates:

```powershell
cd frontend
npm run lint
npm run build
```

Manual regression checklist:

- login as employee and admin
- employee course flow (lesson complete, quiz submit)
- admin content edit and publish toggles
- assignments and invites workflows
- route guard redirects

## Docs checks

Validate docs after any markdown or theme update:

```powershell
cd docs
npm run docs:build
```

Use docs dev server while editing:

```powershell
npm run docs:dev
```

## CI recommendation

If CI is introduced or extended, include:

1. backend `php artisan test`
2. frontend `npm run lint` and `npm run build`
3. docs `npm run docs:build`
