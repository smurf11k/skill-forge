# SkillForge

An internal employee training platform built for engineering teams. Employees work through structured courses made up of lessons and quizzes, track their own progress, and get scored on knowledge checks. Admins manage all content, monitor team progress, and control who has access.

---

## Stack

**Frontend** — React 19 + Vite, shadcn/ui, Tailwind CSS v3, @dnd-kit (drag reorder), axios, react-router-dom, react-markdown, remark-gfm, @uiw/react-md-editor

**Backend** — Laravel 11, Sanctum (token auth), PostgreSQL

**Infrastructure** — PostgreSQL runs in Docker, frontend dev server on Vite, backend on `php artisan serve`

---

## How It Works

### For Employees

Employees log in and see a personal dashboard showing their progress across all courses — how many are completed, in progress, or not started yet, along with their average quiz score. Each course is made up of lessons and quizzes mixed together in a defined order. Lessons are marked complete when the employee clicks Next, and quizzes are scored immediately on submission. A quiz must be passed with 80% or higher to count toward course completion. Failed attempts are recorded but do not block progress, so the employee can retry. Once all lessons are read and all quizzes are passed, the course is marked complete.

Lesson content supports Markdown formatting and is rendered directly in the course view.

### For Admins

Admins get a separate dashboard showing platform-wide stats — average completion rate across all employees, at-risk employees (below 50% progress), and per-course completion rates. The Team Progress page gives a per-employee, per-course breakdown including lessons completed, quizzes passed, scores, and status. The Users page lets admins change roles and remove users.

Content is managed through the Manage Content page. Courses, lessons, and quizzes can be created, edited, published, or saved as drafts. Draft content is invisible to employees. Inside a dedicated course editor, lessons and quizzes appear in a unified ordered list that can be reordered by dragging. Quiz questions are managed inline on the quiz edit page. Lesson content can be authored in Markdown using a write/preview editor.

### Auth

Login is token-based via Laravel Sanctum. Admins are redirected to `/admin` on login, employees to `/`. Admin-only routes are protected on both the frontend (redirect if not admin) and backend (403 if not admin). Draft courses are also blocked from employee access.

---

## Project Structure

```txt
skill-forge-pr/
├── docker-compose.yml
├── database/
│   └── schema.sql
├── backend/                  # Laravel 11
│   ├── app/Http/Controllers/
│   │   ├── AuthController.php
│   │   ├── CourseController.php
│   │   ├── LessonController.php
│   │   ├── LessonProgressController.php
│   │   ├── QuizController.php
│   │   ├── QuestionController.php
│   │   ├── ResultController.php
│   │   └── UserController.php
│   └── routes/api.php
└── frontend/                 # React + Vite
    └── src/
        ├── api/auth.js
        ├── hooks/useCourseProgress.js
        ├── components/
        │   ├── Layout.jsx
        │   ├── StatusBadge.jsx
        │   └── markdown/
        │       ├── LessonMarkdownEditor.jsx
        │       └── MarkdownContent.jsx
        └── pages/
            ├── Login.jsx
            ├── Dashboard.jsx
            ├── Courses.jsx
            ├── CourseView.jsx
            ├── Results.jsx
            ├── AdminDashboard.jsx
            ├── AdminTeamProgress.jsx
            ├── AdminUsers.jsx
            ├── AdminContent.jsx
            └── AdminCourseView.jsx
```

---

## Getting Started

**Prerequisites** — Docker, PHP 8.2+, Composer, Node 18+

```powershell
# 1. Start the database
docker compose up -d

# 2. Install backend dependencies
cd backend
composer install

# 3. Configure environment
cp .env.example .env
# Set DB_HOST=127.0.0.1, DB_PORT=5432, DB_DATABASE=skillforge
# DB_USERNAME=skillforge_user, DB_PASSWORD=skillforge_pass

# 4. Start the backend
php artisan serve

# 5. Install frontend dependencies and start dev server
cd ../frontend
npm install
npm run dev
```

The schema is applied automatically on first Docker start via `database/schema.sql`. Default credentials and mock data can be seeded from SQL files during initialization.

---

## API Overview

| Method              | Endpoint                      | Description                                |
| ------------------- | ----------------------------- | ------------------------------------------ |
| POST                | `/api/login`                  | Authenticate, returns token                |
| POST                | `/api/logout`                 | Invalidate token                           |
| GET/POST/PUT/DELETE | `/api/courses`                | Course CRUD                                |
| GET                 | `/api/courses/{id}/lessons`   | Lessons for a course                       |
| POST/PUT/DELETE     | `/api/lessons/{id}`           | Lesson CRUD                                |
| POST                | `/api/lessons/{id}/complete`  | Mark lesson complete                       |
| GET                 | `/api/courses/{id}/progress`  | Completed lesson IDs for current user      |
| GET                 | `/api/courses/{id}/quizzes`   | Quizzes for a course                       |
| POST/PUT/DELETE     | `/api/quizzes/{id}`           | Quiz CRUD                                  |
| POST                | `/api/quizzes/{id}/submit`    | Submit quiz answers, returns score         |
| GET                 | `/api/results/{userId}`       | Quiz results for a user                    |
| DELETE              | `/api/results/{userId}/reset` | Reset all progress for a user              |
| GET                 | `/api/users`                  | All users (admin only)                     |
| PUT                 | `/api/users/{id}/role`        | Change user role (admin only)              |
| DELETE              | `/api/users/{id}`             | Remove user (admin only)                   |
| GET                 | `/api/admin/stats`            | Platform-wide stats (admin only)           |
| GET                 | `/api/admin/team-progress`    | All results + lesson progress (admin only) |

---

## Pass Threshold

Quizzes require **80%** to pass. A course is complete when all lessons are read and all quizzes are passed. Failed attempts are saved and shown in the employee's progress history but do not count toward completion. Employees can retake passed quizzes, and the course stays marked complete regardless.

---

## Roadmap

- [x] Auth logic
- [x] Basic CRUD (courses, lessons, quizzes, questions)
- [x] Roles (employee / admin)
- [x] Database setup (PostgreSQL + Docker)
- [x] Drag-and-drop reordering for lessons and quizzes
- [x] Draft and publish workflow
- [x] Employee dashboard with progress tracking
- [x] Admin dashboard with team overview
- [x] Per-course and per-employee progress breakdown
- [x] Lesson completion tracking
- [x] Quiz attempt history
- [x] User management (role change, delete)
- [x] Mock and seed data
- [x] Markdown support for lesson content
- [ ] Markdown style polishing
- [ ] Custom callouts (tip, warning, danger, info, steps, etc.)
- [ ] Lesson import from `.md` files
- [ ] Search across content and users
- [ ] Statistics page with charts and trends
- [ ] Password reset
- [ ] Email notifications
- [ ] User invitation by email
- [ ] Modules or categories for courses
- [ ] Multiple correct answers for quiz questions
- [ ] Estimated durations for courses, lessons, and quizzes
- [ ] Timed quizzes
- [ ] Course deadlines
- [ ] First-visit onboarding tutorial
- [ ] Admin guide for writing lessons in Markdown
- [ ] General UI polish
- [ ] Tests

## Additional

[Design Template](https://practice-skill-forge-template.netlify.app/)
