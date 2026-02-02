# Product Feedback App

A full-stack product feedback platform inspired by the Frontend Mentor challenge. It lets teams collect feedback, track status, and discuss ideas with votes and threaded comments.

## Features
- Create feedback with category and status
- Browse feedback with tag filters and per-item detail views
- Vote on feedback items
- Threaded comments and replies
- Admin-oriented status updates with history support (backend)

## Tech Stack
- Frontend: Next.js (App Router), React, Tailwind CSS, React Query
- Backend: NestJS, Prisma, PostgreSQL
- Deployment: Vercel serverless handler for the API

## Project Structure
```
.
├── backend/          # NestJS API + Prisma
├── img/              # Screenshots
└── web/              # Next.js frontend
```

## Screenshots
Home page: overview of feedback, category filters, and weekly summary cards.
![Home](img/Home.png)

Feedback detail page: full description, status, likes, and threaded comments.
![Feedback Detail](img/Detail.png)

Submit feedback page: create a new feedback item with title, description, and category.
![Submit Feedback](img/Submit.png)

## Local Development

### 1) Backend (NestJS + Prisma)
1. Install dependencies:
   ```bash
   cd backend
   npm install
   ```
2. Create `backend/.env` with the following variables:
   - `DATABASE_URL` (Prisma connection string)
   - `DIRECT_URL` (direct database connection for migrations)
   - `WEB_ORIGIN` (frontend origin for CORS, e.g. `http://localhost:3000`)
3. Run migrations (and optional seed):
   ```bash
   npx prisma migrate dev
   npm run prisma:seed
   ```
4. Start the API:
   ```bash
   npm run start:dev
   ```

The API runs at `http://localhost:3001` by default.

### 2) Frontend (Next.js)
1. Install dependencies:
   ```bash
   cd web
   npm install
   ```
2. Create `web/.env.local`:
   - `NEXT_PUBLIC_API_BASE_URL` (e.g. `http://localhost:3001`)
3. Start the web app:
   ```bash
   npm run dev
   ```

Open `http://localhost:3000` to view the app.

## Notes
- The backend is configured for Vercel serverless via `backend/api/index.ts` and `backend/vercel.json`.
- Prisma schema lives in `backend/prisma/schema.prisma`.
