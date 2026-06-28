# GymRank

GymRank V1 is a competitive strength progress platform.

Core loop:

```text
log workout -> detect PRs -> recommend overload -> update rankings -> show progress analytics
```

## Locked V1 Scope

- Authentication and profile
- Workout tracking
- Exercise library
- Per-exercise muscle targeting display
- Personal records tracking
- Progressive overload recommendations
- Lift-based rankings for approved tracked lifts only
- Basic physique tracking
- Basic analytics dashboard
- Basic achievements

V1 does not include community, DMs, public posting, video content, AI coaching, or a full interactive anatomy explorer.

## Approved V1 Ranking Lifts

- Bench Press
- Squat
- Deadlift
- Overhead Press
- Pull-Up / Weighted Pull-Up

No other exercises are ranking-eligible in V1.

## Repository Layout

```text
docs/       Product and engineering documentation
mobile/     Flutter mobile app skeleton
backend/    Node.js + TypeScript + Express API skeleton
shared/     Cross-app docs and constants
```

## Local Development

### Backend

```bash
cd backend
cp .env.example .env
npm install
docker compose up -d
npm run prisma:generate
npm run dev
```

Health check:

```text
GET http://localhost:4000/health
```

### Mobile

Flutter is required locally.

```bash
cd mobile
flutter pub get
flutter test
flutter run
```

## Milestone 1 Status

This foundation milestone intentionally contains skeletons, module boundaries, environment templates, tests, and setup files only. Feature implementation begins in later approved milestones.
