# GymRank Backend

Node.js + TypeScript + Express API for GymRank V1.

## Setup

```bash
cp .env.example .env
npm install
docker compose up -d
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
npm run dev
```

## Scripts

- `npm run dev` - start the API in watch mode
- `npm run build` - compile TypeScript
- `npm start` - run compiled API
- `npm test` - run tests
- `npm run lint` - run ESLint
- `npm run format` - run Prettier
- `npm run prisma:generate` - generate Prisma client
- `npm run prisma:migrate` - run local development migrations
- `npm run prisma:seed` - seed the exercise and muscle catalog

## Scope Guard

Milestone 2 implements only custom authentication and profile foundation.

It does not implement workouts, rankings, PRs, overload, analytics, achievements, community, or social features.

## Auth/Profile Endpoints

- `POST /v1/auth/register`
- `POST /v1/auth/login`
- `GET /v1/profile`
- `PATCH /v1/profile`

Ranking eligibility is calculated at profile level only. The `valid_tracked_lift_log` requirement remains unmet until workout logging exists.

## Exercise Endpoints

- `GET /v1/exercises`
- `GET /v1/exercises/:id`

The exercise API is read-only in Milestone 3 and keeps anatomy exercise-centric.

Exercise data is database-backed as of Milestone 3.5. The seed is idempotent and can be rerun safely after migrations.

## Workout Endpoints

- `POST /v1/workouts`
- `GET /v1/workouts`
- `GET /v1/workouts/:id`
- `PATCH /v1/workouts/:id`
- `DELETE /v1/workouts/:id`
- `POST /v1/workouts/:id/exercises`
- `PATCH /v1/workouts/:id/exercises/:exerciseId`
- `DELETE /v1/workouts/:id/exercises/:exerciseId`
- `POST /v1/workouts/:id/sets`
- `PATCH /v1/workouts/:id/sets/:setId`
- `DELETE /v1/workouts/:id/sets/:setId`

Workout logging does not calculate rankings, overload recommendations, analytics, or achievements yet.

## Personal Record Endpoints

- `GET /v1/personal-records`
- `GET /v1/personal-records/:exerciseId`

Personal records are detected when a workout is completed. Only completed sets are eligible. Best set comparison uses highest weight, with reps as the tie-breaker.

## Progressive Overload Endpoints

- `GET /v1/overload/recommendations`
- `GET /v1/overload/:exerciseId`

Progressive overload recommendations are deterministic, conservative, and based only on completed workout history. No AI or random recommendation logic is used.
