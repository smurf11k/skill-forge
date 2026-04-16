# Architecture

SkillForge is a three-layer system: React frontend, Laravel API backend, and PostgreSQL database.

## System Overview

```txt
Frontend (React 19 + Vite)
          |
          | HTTP (axios)
          v
Backend (Laravel 12 API + Sanctum)
          |
          v
PostgreSQL (Docker)
```

## Frontend Layer

Core technologies:

- React 19
- Vite
- Tailwind CSS
- shadcn/ui primitives
- react-router-dom
- @dnd-kit (ordering UX)
- react-markdown + remark-gfm + remark-github-blockquote-alert

Key responsibilities:

- Role-aware route protection (employee vs admin)
- Content consumption flow (course, lesson, quiz)
- Admin management interfaces
- Progress and result visualization
- Markdown rendering and editing

Shared component groups:

- `components/common`: cross-page UI primitives like loaders
- `components/course`: course-specific metadata and composition helpers
- `components/admin`: reusable admin editor forms
- `components/markdown`: markdown renderer and editor wrappers

## Backend Layer

Core technologies:

- Laravel 12
- Laravel Sanctum
- PHPUnit/Laravel test tooling

Key responsibilities:

- Authentication and token lifecycle
- Role-based authorization and data visibility
- CRUD for courses, lessons, quizzes, and questions
- Lesson progress and quiz scoring
- Assignment lifecycle with due dates
- Invite lifecycle (create, resend, revoke, accept)
- Admin stats and team-progress aggregation

## Database Layer

Primary entities:

- users
- courses
- lessons
- quizzes
- questions
- results
- lesson progress
- course assignments
- invites

Migrations and seeders are maintained in backend Laravel directories and should be treated as source of truth.

## Runtime Access Rules

- Employees can see only published content.
- Admins can manage draft and published content.
- Admin routes are protected on frontend and backend.
- Public invite acceptance remains unauthenticated by design.

## Learning Model

- A course contains lessons and quizzes in one ordered sequence.
- Lessons must be marked complete.
- Quizzes must be passed with at least 80%.
- Course completion requires all lessons complete and all quizzes passed.

## Markdown Content Model

Lesson bodies are authored in Markdown and rendered in-app.

Supported authoring features include:

- headings, emphasis, lists, links
- tables and fenced code blocks
- task lists and standard GFM features
- alert callouts: note, tip, warning, caution
