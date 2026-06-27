# Student Placement Portal

A full-stack placement management system for colleges — connecting students with companies through a streamlined job application workflow.

## Features

- **Admin Portal** — Manage students, companies, jobs, and applications. View placement statistics and charts.
- **Student Portal** — Browse job drives, apply, track application status, manage profile.
- **Role-based Auth** — JWT authentication with separate admin and student dashboards.
- **Dark Mode** — Toggle between light and dark themes.
- **Notifications** — System-wide announcements for placement drives and updates.

## Tech Stack

- **Frontend:** React + Vite, Tailwind CSS, shadcn/ui, Recharts, React Query
- **Backend:** Express 5, Node.js 24, TypeScript
- **Database:** PostgreSQL + Drizzle ORM
- **Auth:** JWT (HS256), bcryptjs
- **Monorepo:** pnpm workspaces

## Getting Started

### Prerequisites

- Node.js 24+
- pnpm
- PostgreSQL (via `DATABASE_URL` env var)

### Environment Variables

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `SESSION_SECRET` | JWT signing secret |

### Commands

```bash
# Install dependencies
pnpm install

# Push DB schema
pnpm --filter @workspace/db run push

# Seed database with sample data
pnpm --filter @workspace/scripts run seed

# Start API server (port 5000)
pnpm --filter @workspace/api-server run dev

# Start frontend
pnpm --filter @workspace/placement-portal run dev

# Typecheck everything
pnpm run typecheck

# Regenerate API hooks from OpenAPI spec
pnpm --filter @workspace/api-spec run codegen
```

## Demo Credentials

| Role | Email | Password |
|---|---|---|
| Admin | admin@placement.edu | admin123 |
| Student | arjun.sharma@student.edu | student123 |

## Project Structure

```
artifacts/
  api-server/        # Express API (routes, middleware, auth)
  placement-portal/  # React + Vite frontend
lib/
  api-spec/          # OpenAPI spec + generated hooks/schemas
  api-client-react/  # Shared React Query client
  db/                # Drizzle ORM schema + migrations
scripts/
  src/seed.ts        # Database seeder
```
