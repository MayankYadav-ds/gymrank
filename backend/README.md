# GymRank Backend

Node.js + TypeScript + Express API for GymRank V1.

## Setup

```bash
cp .env.example .env
npm install
docker compose up -d
npm run prisma:generate
npm run prisma:migrate
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
