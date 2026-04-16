# Auth and Routing

This page explains route protection and role behavior across frontend and backend.

## Frontend route groups

Public routes:

- `/login`
- `/accept-invite`

Employee routes:

- `/`
- `/courses`
- `/courses/:id`
- `/results`

Admin routes:

- `/admin`
- `/admin/team`
- `/admin/users`
- `/admin/content`
- `/admin/courses/:id`
- `/admin/assignments`

## Frontend guards

`App.jsx` uses guard wrappers:

- `Protected`
- `EmployeeOnly`
- `AdminOnly`

Behavior:

- no token redirects to `/login`
- admin users are redirected away from employee routes
- non-admin users are redirected away from admin routes

## Backend auth model

Backend API uses Sanctum token authentication.

In `routes/api.php`:

- `/api/login` is public
- invite token endpoints for accept flow are public
- all other API routes are inside `auth:sanctum`

## Authorization model

Authorization is role-aware at controller level.

Typical restrictions:

- employees cannot manage users/content/admin stats
- admins can access management and analytics endpoints
- employees cannot access draft-only content

## Invite onboarding flow

1. Admin creates invite.
2. Recipient opens `/accept-invite?token=...`.
3. Frontend validates token via API.
4. Recipient sets name/password.
5. Backend creates user and returns auth payload.
6. User is signed in and routed by role.

## Practical checks

When changing routes or roles:

- verify frontend guard behavior
- verify backend endpoint protection
- test redirection for both roles
- test invite flow with valid and expired tokens
