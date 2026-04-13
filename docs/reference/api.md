# API Overview

## Auth

```http
POST /api/login
POST /api/logout
```

## Courses

```http
GET /api/courses
POST /api/courses
```

## Lessons

```http
POST /api/lessons/{id}/complete
GET /api/courses/{id}/progress
```

## Quizzes

```http
POST /api/quizzes/{id}/submit
```

## Results

```http
GET /api/results/{userId}
DELETE /api/results/{userId}/reset
```
