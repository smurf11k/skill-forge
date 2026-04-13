# Architecture

SkillForge is built as a full-stack web application with a clear separation between frontend, backend, and database layers.

## Overview

```
Frontend (React + Vite)
        ↓
   HTTP (Axios)
        ↓
Backend (Laravel API)
        ↓
 PostgreSQL Database
```

---

## Frontend

The frontend is built with:

- React 19
- Vite
- Tailwind CSS v3
- shadcn/ui
- react-router-dom
- axios
- @dnd-kit
- react-markdown
- @uiw/react-md-editor

### Responsibilities

- Routing and navigation
- Role-based UI (employee vs admin)
- Course interaction
- Markdown rendering
- Admin content management UI
- Progress visualization

---

## Backend

Built with Laravel 11.

### Responsibilities

- Authentication (Sanctum)
- Authorization (role-based access)
- CRUD for:
  - courses
  - lessons
  - quizzes
  - questions

- Lesson progress tracking
- Quiz submission and scoring
- Statistics endpoints

---

## Database

PostgreSQL stores:

- users
- tokens
- courses
- lessons
- lesson_progress
- quizzes
- questions
- results

---

## Roles

### Employee

- Access only published content
- Complete lessons
- Take quizzes
- Track personal progress

### Admin

- Access all content (including drafts)
- Manage courses, lessons, quizzes
- Reorder content
- Manage users
- View team statistics

---

## Content Flow

Courses contain:

- lessons
- quizzes

All items are:

- ordered
- mixed in one sequence

---

## Completion Logic

A course is complete when:

- all lessons are completed
- all quizzes are passed

### Pass threshold

```
80%
```

---

## Markdown System

Lesson content is written in Markdown and rendered in the frontend.

Supports:

- headings
- lists
- tables
- code blocks
- GitHub-style callouts

Callouts are powered by:

```
remark-github-blockquote-alert
```

and styled manually in the app.
