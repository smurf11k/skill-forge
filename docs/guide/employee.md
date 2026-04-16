# Employee Guide

This guide explains the complete employee experience in SkillForge.

## Access and navigation

After login, employees are redirected to `/` (dashboard).

Available employee pages:

- Dashboard (`/`)
- Courses (`/courses`)
- Course view (`/courses/:id`)
- Results (`/results`)

Employees are blocked from all `/admin/*` pages.

## Dashboard

Dashboard provides:

- assigned course counts by status
- average score insights
- grouped course sections such as continue learning and completed
- assignment context like due dates and deadline status

Use this page as the starting point for daily learning tasks.

## Courses listing

The courses page shows published courses available to the employee with per-course metadata, including:

- progress percentage
- lesson and quiz totals
- average score
- assignment deadline signals

## Course view

A course combines lessons and quizzes in one ordered flow.

The page contains:

- sidebar content list (lessons and quizzes)
- content panel for the selected item
- contextual completion status

## Lesson completion

Lessons are markdown-driven learning units.

A lesson counts as complete when the employee triggers lesson completion from the course flow.

## Quiz completion

Quiz behavior:

- answers are submitted and scored immediately
- each attempt is recorded in history
- passing threshold is 80%

If a quiz is failed, it can be retried. Failed attempts are recorded but do not count as passed.

## Course completion logic

A course is complete only when:

- all lessons are completed
- all quizzes are passed

## Results page

Results view aggregates personal performance, including:

- course-level progress snapshots
- quiz attempt history
- score trends and best attempts

## Progress reset

Employees can reset their own progress from the results area to restart learning from scratch.

## Visibility rules

Employees can see only published content.

Draft courses, lessons, and quizzes remain hidden until published by admins.
