# Pulseboard demo application

Next.js + Supabase reference application for the AI-assisted PR QA portfolio. It implements email/password authentication, email confirmation callbacks, password recovery, protected sessions, task CRUD APIs, task ownership through PostgreSQL RLS, deterministic QA identities, and Vercel-ready health checks.

See the workspace root README for setup and deployment. Configure `QA_PLATFORM_REPOSITORY=owner/qa-platform` as a repository variable and `QA_PLATFORM_TOKEN` as a secret; no workflow source edit is required.

## API contract

- `GET /api/health` — public readiness response.
- `GET /api/tasks?status=todo|in_progress|done` — list the signed-in user’s tasks.
- `POST /api/tasks` — create a task with `title`, `description`, `status`, and `priority`.
- `PATCH /api/tasks/:id` — update at least one accepted task field.
- `DELETE /api/tasks/:id` — delete an owned task.

Errors use `{ "error": { "code": string, "message": string, "details"?: object } }`. Unauthenticated requests return 401, malformed identifiers return 400, invalid bodies return 422, and inaccessible/missing resources return 404 without revealing ownership.
