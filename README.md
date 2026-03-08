# Sanshou Platform

Sanshou - The Fighters' Factory is a mobile-first global martial arts training marketplace built with:

- Next.js 14 (App Router)
- TypeScript
- TailwindCSS
- Framer Motion
- MongoDB + Mongoose
- NextAuth (JWT)
- Cloudinary media storage
- Stripe payments
- PWA support

## Features

- Course marketplace and trainer marketplace
- Structured learning journey (Mind, Body, Emotion)
- Course detail pages with lesson video player
- Enrollment and progress tracking APIs
- Live training booking APIs
- Role-based auth (student, trainer, admin)
- Trainer dashboard + admin panel
- PWA manifest and offline fallback route
- Railway-ready deployment configuration

## Local Setup

1. Install dependencies:
   `npm install`
2. Create `.env` from `.env.example`
3. Start development server:
   `npm run dev`
4. Open `http://localhost:3000`

## Seed Demo Data

Populate the app with demo users, trainers, courses, lessons, enrollments, reviews, and bookings:

- Ensure `MONGODB_URI` is set in `.env.local` (or environment)
- Run: `npm run seed`
- To reset and reseed local/dev data: `npm run seed:reset`

`seed:reset` is destructive and will clear users, trainers, courses, lessons, enrollments, reviews, and bookings before reseeding.
In production it is blocked unless you explicitly set `ALLOW_SEED_RESET=true`.

Demo credentials created by seed:

- `admin@sanshou.dev` / `Admin@12345`
- `student@sanshou.dev` / `Student@12345`
- `arjun@sanshou.dev` / `Trainer@12345`
- `kaori@sanshou.dev` / `Trainer@12345`
- `pending@sanshou.dev` / `Trainer@12345`

## Core Environment Variables

- `MONGODB_URI`
- `NEXTAUTH_SECRET`
- `NEXTAUTH_URL`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_SECRET`
- `STRIPE_SECRET`
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`

## Railway Deployment

1. Connect the repository to Railway.
2. Configure the environment variables listed above.
3. Run build command: `npm run build`
4. Run start command: `npm run start`

## Deployment Health Check

After deployment, verify runtime integrations at:

- `/health` (UI)
- `/api/health` (JSON)

## Smoke Tests

Run a lightweight end-to-end smoke suite against a running app:

- Local default: `npm run smoke`
- Custom target: `SMOKE_BASE_URL=https://your-app.up.railway.app npm run smoke`

What it validates:

- Core public pages return healthy responses
- `/api/health` and public listing APIs respond correctly
- Course detail API payload shape
- Protected routes redirect unauthenticated users to login
