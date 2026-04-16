# API Reference

All endpoints are rooted under `/api`.

Unless marked public, endpoints require Sanctum authentication.

## Auth

| Method | Endpoint  | Access        | Description                                |
| ------ | --------- | ------------- | ------------------------------------------ |
| POST   | `/login`  | Public        | Authenticate user and return token payload |
| POST   | `/logout` | Authenticated | Invalidate current token                   |

## Invites

| Method | Endpoint               | Access | Description                      |
| ------ | ---------------------- | ------ | -------------------------------- |
| GET    | `/invites/{token}`     | Public | Resolve invite token metadata    |
| POST   | `/invites/accept`      | Public | Create account from invite token |
| GET    | `/invites`             | Admin  | List pending invites             |
| POST   | `/invites`             | Admin  | Create invite                    |
| POST   | `/invites/{id}/resend` | Admin  | Refresh and resend invite        |
| DELETE | `/invites/{id}`        | Admin  | Revoke pending invite            |

## Courses

| Method | Endpoint        | Access        | Description                       |
| ------ | --------------- | ------------- | --------------------------------- |
| GET    | `/courses`      | Authenticated | List courses visible to user role |
| POST   | `/courses`      | Admin         | Create course                     |
| GET    | `/courses/{id}` | Authenticated | Get course details                |
| PUT    | `/courses/{id}` | Admin         | Update course                     |
| DELETE | `/courses/{id}` | Admin         | Delete course                     |

## Lessons and Progress

| Method | Endpoint                 | Access        | Description                       |
| ------ | ------------------------ | ------------- | --------------------------------- |
| GET    | `/courses/{id}/lessons`  | Authenticated | Lessons by course                 |
| POST   | `/lessons`               | Admin         | Create lesson                     |
| PUT    | `/lessons/reorder`       | Admin         | Reorder lessons                   |
| PUT    | `/lessons/{id}`          | Admin         | Update lesson                     |
| DELETE | `/lessons/{id}`          | Admin         | Delete lesson                     |
| POST   | `/lessons/{id}/complete` | Employee      | Mark lesson complete              |
| GET    | `/courses/{id}/progress` | Authenticated | Get completed lesson IDs for user |

## Quizzes and Questions

| Method | Endpoint                      | Access        | Description                   |
| ------ | ----------------------------- | ------------- | ----------------------------- |
| GET    | `/courses/{courseId}/quizzes` | Authenticated | Quizzes by course             |
| POST   | `/quizzes`                    | Admin         | Create quiz                   |
| PUT    | `/quizzes/reorder`            | Admin         | Reorder quizzes               |
| GET    | `/quizzes/{id}`               | Authenticated | Get quiz                      |
| PUT    | `/quizzes/{id}`               | Admin         | Update quiz                   |
| DELETE | `/quizzes/{id}`               | Admin         | Delete quiz                   |
| GET    | `/quizzes/{id}/questions`     | Authenticated | Get questions for quiz        |
| POST   | `/quizzes/{id}/submit`        | Employee      | Submit quiz and receive score |
| POST   | `/questions`                  | Admin         | Create question               |
| PUT    | `/questions/reorder`          | Admin         | Reorder questions             |
| PUT    | `/questions/{id}`             | Admin         | Update question               |
| DELETE | `/questions/{id}`             | Admin         | Delete question               |

## Results

| Method | Endpoint                  | Access        | Description             |
| ------ | ------------------------- | ------------- | ----------------------- |
| GET    | `/results/{userId}`       | Authenticated | Get user results data   |
| DELETE | `/results/{userId}/reset` | Authenticated | Reset progress for user |

## Users and Admin Analytics

| Method | Endpoint               | Access | Description                  |
| ------ | ---------------------- | ------ | ---------------------------- |
| GET    | `/users`               | Admin  | List users                   |
| PUT    | `/users/{id}/role`     | Admin  | Change user role             |
| DELETE | `/users/{id}`          | Admin  | Delete user                  |
| GET    | `/admin/stats`         | Admin  | Platform stats summary       |
| GET    | `/admin/team-progress` | Admin  | Team progress aggregate data |

## Assignments

| Method | Endpoint            | Access | Description          |
| ------ | ------------------- | ------ | -------------------- |
| GET    | `/assignments`      | Admin  | List assignments     |
| POST   | `/assignments`      | Admin  | Create assignment(s) |
| PUT    | `/assignments/{id}` | Admin  | Update assignment    |
| DELETE | `/assignments/{id}` | Admin  | Delete assignment    |

## Notes

- Employee and admin authorization is enforced by controller-level logic.
- Route definitions are maintained in backend `routes/api.php`.
- The pass threshold used by quiz completion logic is 80%.
