# Admin Guide

This guide covers all admin-facing workflows in SkillForge.

## Admin route map

Main admin pages:

- `/admin` dashboard
- `/admin/team` team progress
- `/admin/users` users and invites
- `/admin/content` content management
- `/admin/courses/:id` per-course editor
- `/admin/assignments` assignment management

Only users with role `admin` can access these routes.

## Admin dashboard

Dashboard summarizes platform state with metrics such as:

- completion indicators
- at-risk learning signals
- course-level performance snapshots

## Team progress

Team progress aggregates employee learning across courses:

- lesson completion depth
- quiz pass/fail outcomes
- average score context

Use this page for coaching and follow-up planning.

## Users and invites

Admins can:

- list users
- change user roles
- delete users
- create invitation links/emails
- resend invitations
- revoke pending invitations

Invite acceptance is handled publicly through `/accept-invite`.

## Assignment management

Assignments page supports:

- assigning courses to one or many users
- setting and editing due dates
- monitoring assignment statuses
- deleting outdated assignments

Assignments drive the employee deadline signals shown in course cards.

## Content management

The content workspace allows CRUD for:

- courses
- lessons
- quizzes
- quiz questions

Each content type supports publish state management.

## Course editor

Each course has a dedicated editor where admins can:

- view lessons and quizzes in one merged ordered list
- reorder items by drag and drop
- jump into inline editing flows quickly

## Lesson authoring

Lesson content is markdown-based and supports:

- rich text structures
- tables and code blocks
- alert callouts

Admins can write and preview markdown before publishing.

## Quiz and question model

Quizzes contain ordered questions.

Current question model uses one correct answer per question.

## Draft and publish lifecycle

Recommended release flow:

1. Create course as draft
2. Add lesson and quiz items
3. Author markdown and quiz questions
4. Reorder sequence
5. Validate in admin preview flow
6. Publish content for employees
