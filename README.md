# SkillForge

An internal employee training platform built for engineering teams. Employees work through structured courses made up of lessons and quizzes, track their own progress, and get scored on knowledge checks. Admins manage all content, monitor team progress, and control who has access.

---

## Stack

**Frontend** — React 19 + Vite, shadcn/ui, Tailwind CSS v3, @dnd-kit (drag reorder), axios, react-router-dom, lucide-react, react-markdown, remark-gfm, remark-github-blockquote-alert, @uiw/react-md-editor

**Backend** — Laravel 11, Sanctum (token auth), PostgreSQL

**Infrastructure** — PostgreSQL runs in Docker, frontend dev server on Vite, backend on `php artisan serve`, and project documentation is built with VitePress in the `docs/` folder

---

## How It Works

### For Employees

Employees log in and see a personal dashboard showing their progress across all courses — how many are assigned, completed, in progress, or not started, along with their average quiz score. Course cards show due dates and assignment deadline status badges. Each course is made up of lessons and quizzes mixed together in a defined order. Lessons are marked complete when the employee clicks Next, and quizzes are scored immediately on submission. A quiz must be passed with 80% or higher to count toward course completion. Failed attempts are recorded but do not block progress, so the employee can retry. Once all lessons are read and all quizzes are passed, the course is marked complete.

Employees can also open a dedicated results page with per-course progress, quiz history, due dates, and reset their own progress.

Lesson content supports Markdown formatting and is rendered directly in the course view.

Extended Markdown features are supported, including GitHub-style callouts (e.g. TIP, NOTE, WARNING, CAUTION). These are parsed using `remark-github-blockquote-alert` and styled manually to match the application's design system.

### For Admins

Admins get a separate dashboard showing platform-wide stats — average completion rate across all employees, at-risk employees (below 50% progress), and per-course completion rates. The Team Progress page gives a per-employee, per-course breakdown including lessons completed, quizzes passed, scores, and status. The Users page has two responsibilities: managing active users (role changes and deletion) and managing pending invites (create, resend, revoke).

Admins also manage course assignments and deadlines from a dedicated Assignments page, where they can assign courses to one or many users, set due dates, resend notifications, and monitor assignment status.

Content is managed through the Manage Content page. Courses, lessons, and quizzes can be created, edited, published, or saved as drafts. Draft content is invisible to employees. Inside a dedicated course editor, lessons and quizzes appear in a unified ordered list that can be reordered by dragging. Quiz questions are managed inline on the quiz edit page. Lesson content can be authored in Markdown using a write/preview editor.

### Auth

Login is token-based via Laravel Sanctum. Admins are redirected to `/admin` on login, employees to `/`. Admin-only routes are protected on both the frontend (redirect if not admin) and backend (403 if not admin). Draft courses are also blocked from employee access.

New users are onboarded through invite tokens. Admins can create a pending invite, optionally send the email immediately, and the recipient completes account creation on the public `/accept-invite` page. Invite tokens can expire, be revoked, or be resent with a fresh expiry window.

---

## Architecture

```txt
skill-forge-pr/
├── docker-compose.yml
├── backend/                  # Laravel 11
│   ├── app/Http/Controllers/
│   │   ├── AuthController.php
│   │   ├── CourseController.php
│   │   ├── InviteController.php
│   │   ├── CourseAssignmentController.php
│   │   ├── LessonController.php
│   │   ├── LessonProgressController.php
│   │   ├── QuizController.php
│   │   ├── QuestionController.php
│   │   ├── ResultController.php
│   │   └── UserController.php
│   ├── database/
│   │   ├── migrations/
│   │   └── seeders/
│   └── routes/api.php
├── frontend/                 # React + Vite
│   └── src/
│       ├── App.jsx
│       ├── api/auth.js
│       ├── hooks/useCourseProgress.js
│       ├── components/
│       │   ├── admin/
│       │   │   └── ContentEditors.jsx
│       │   ├── common/
│       │   │   └── PageLoader.jsx
│       │   ├── EmployeeCourseCard.jsx
│       │   ├── Layout.jsx
│       │   ├── StatCard.jsx
│       │   ├── StatusBadge.jsx
│       │   ├── course/
│       │   │   ├── buildCourseContentItems.js
│       │   │   ├── contentTypeMeta.js
│       │   │   ├── CourseMetaLine.jsx
│       │   │   └── CourseSection.jsx
│       │   └── markdown/
│       │       ├── LessonMarkdownEditor.jsx
│       │       └── MarkdownContent.jsx
│       └── pages/
│           ├── AdminAssignments.jsx
│           ├── AdminContent.jsx
│           ├── AdminCourseView.jsx
│           ├── AdminDashboard.jsx
│           ├── AdminTeamProgress.jsx
│           ├── AdminUsers.jsx
│           ├── AcceptInvite.jsx
│           ├── CourseView.jsx
│           ├── Courses.jsx
│           ├── Login.jsx
│           ├── Dashboard.jsx
│           └── Results.jsx
└── docs/                     # VitePress documentation
    ├── .vitepress/
    ├── guide/
    ├── reference/
    ├── index.md
    └── roadmap.md
```

### Backend Responsibilities

- `AuthController` handles login/logout and Sanctum token issuance.
- `InviteController` manages the invite lifecycle: list pending invites, create invites, resend/revoke them, validate public invite tokens, and convert accepted invites into real user accounts.
- `CourseAssignmentController` manages assignment CRUD, due dates, deadline status calculation, and assignment notifications.
- `UserController` serves admin-facing user management plus platform-level stats and team progress aggregation.
- Course, lesson, quiz, question, result, and progress controllers implement the training workflow and completion tracking.

### Frontend Responsibilities

- `App.jsx` wires public, employee, and admin routes, including the public invite acceptance screen.
- `hooks/useCourseProgress.js` enriches course data with progress metrics, quiz/lesson totals, average score, and assignment metadata.
- `components/EmployeeCourseCard.jsx` is the shared employee course-card component used in both Dashboard and Courses views.
- `components/common/PageLoader.jsx` standardizes the repeated loading state wrapper used across pages.
- `components/course/` holds shared course UI helpers, including the lesson/quiz metadata line, content-type icons, and the merged course-content builder used by the course editor pages.
- `components/admin/ContentEditors.jsx` centralizes the reusable course, lesson, quiz, and question editor forms.
- `components/StatCard.jsx` is a reusable stat card component with customizable visual accents (emoji or icon).
- `pages/AdminUsers.jsx` combines active-user management with pending-invite management in a tabbed admin UI.
- `pages/AdminAssignments.jsx` manages assigning courses, due dates, and assignment lifecycle actions.
- `pages/AcceptInvite.jsx` validates an invite token, collects the new user's name/password, and signs them in immediately after account creation.
- `api/auth.js` centralizes axios configuration, bearer token attachment, and auth persistence in local storage.

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
# Set FRONTEND_URL=http://localhost:5173
# Configure MAIL_* if you want invite emails to be sent instead of logged

# 4. Build the schema and seed demo data
php artisan migrate --seed

# 5. Start the backend
php artisan serve

# 6. Install frontend dependencies and start dev server
cd ../frontend
npm install
npm run dev
```

The database schema now lives in Laravel migrations under `backend/database/migrations`, and the mock/demo dataset is seeded through `backend/database/seeders`.
After starting PostgreSQL, run `php artisan migrate --seed` from the backend to build and populate the database.

---

## Testing

Backend tests are implemented with PHPUnit (Laravel feature tests) and cover auth, courses, lessons, quizzes, questions, results, users, invites, and assignments.

To run tests locally:

```powershell
cd backend
php artisan test
```

---

## Documentation

Project documentation is stored in the `docs/` folder and built with VitePress.

To run the docs locally:

```powershell
cd docs
npm install
npm run docs:dev
```

This starts the documentation site in development mode with live reload.

---

## API Overview

| Method | Endpoint                      | Description                                |
| ------ | ----------------------------- | ------------------------------------------ |
| POST   | `/api/login`                  | Authenticate, returns token                |
| POST   | `/api/logout`                 | Invalidate token                           |
| GET    | `/api/courses`                | List courses                               |
| POST   | `/api/courses`                | Create course                              |
| GET    | `/api/courses/{id}`           | Get single course                          |
| PUT    | `/api/courses/{id}`           | Update course                              |
| DELETE | `/api/courses/{id}`           | Delete course                              |
| GET    | `/api/courses/{id}/lessons`   | Lessons for a course                       |
| POST   | `/api/lessons`                | Create lesson                              |
| PUT    | `/api/lessons/reorder`        | Reorder lessons                            |
| PUT    | `/api/lessons/{id}`           | Update lesson                              |
| DELETE | `/api/lessons/{id}`           | Delete lesson                              |
| POST   | `/api/lessons/{id}/complete`  | Mark lesson complete                       |
| GET    | `/api/courses/{id}/progress`  | Completed lesson IDs for current user      |
| GET    | `/api/courses/{id}/quizzes`   | Quizzes for a course                       |
| POST   | `/api/quizzes`                | Create quiz                                |
| PUT    | `/api/quizzes/reorder`        | Reorder quizzes                            |
| GET    | `/api/quizzes/{id}`           | Get single quiz                            |
| PUT    | `/api/quizzes/{id}`           | Update quiz                                |
| DELETE | `/api/quizzes/{id}`           | Delete quiz                                |
| GET    | `/api/quizzes/{id}/questions` | List questions for quiz                    |
| POST   | `/api/quizzes/{id}/submit`    | Submit quiz answers, returns score         |
| POST   | `/api/questions`              | Create question                            |
| PUT    | `/api/questions/reorder`      | Reorder questions                          |
| PUT    | `/api/questions/{id}`         | Update question                            |
| DELETE | `/api/questions/{id}`         | Delete question                            |
| GET    | `/api/results/{userId}`       | Quiz results for a user                    |
| DELETE | `/api/results/{userId}/reset` | Reset all progress for a user              |
| GET    | `/api/users`                  | All users (admin only)                     |
| PUT    | `/api/users/{id}/role`        | Change user role (admin only)              |
| DELETE | `/api/users/{id}`             | Remove user (admin only)                   |
| GET    | `/api/invites/{token}`        | Resolve a public invite token              |
| POST   | `/api/invites/accept`         | Accept invite and create account           |
| GET    | `/api/invites`                | List pending invites (admin only)          |
| POST   | `/api/invites`                | Create invite (admin only)                 |
| POST   | `/api/invites/{id}/resend`    | Refresh and resend invite (admin only)     |
| DELETE | `/api/invites/{id}`           | Revoke invite (admin only)                 |
| GET    | `/api/assignments`            | List course assignments                    |
| POST   | `/api/assignments`            | Create assignment(s)                       |
| PUT    | `/api/assignments/{id}`       | Update assignment                          |
| DELETE | `/api/assignments/{id}`       | Delete assignment                          |
| GET    | `/api/admin/stats`            | Platform-wide stats (admin only)           |
| GET    | `/api/admin/team-progress`    | All results + lesson progress (admin only) |

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
- [x] Markdown style polishing
- [x] Custom callouts (tip, warning, caution, note, etc.)
- [x] Lesson import from `.md` files
- [x] Project documentation site with VitePress
- [x] Search across content and users
- [ ] Statistics page with charts and trends
- [x] General email notifications (assignments)
- [x] Assignment management UI (admin)
- [x] User invitation by email
- [ ] Password reset
- [ ] Modules or categories for courses
- [ ] Multiple correct answers for quiz questions
- [ ] Estimated durations for courses, lessons, and quizzes
- [ ] Timed quizzes
- [x] Course deadlines
- [ ] General UI polish
- [x] Tests (unit, feature)

---

## Additional

[Design Template](https://practice-skill-forge-template.netlify.app/)
