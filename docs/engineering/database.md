# Database Notes

## Milestone 2 Auth/Profile

Milestone 2 introduced:

- `User`
- `UnitPreference`
- `SexCategory`

## Milestone 3 Exercise/Muscle Catalog

Milestone 3 introduced:

- `Exercise`
- `Muscle`
- `ExerciseMuscle`
- `ExerciseCategory`
- `ExerciseDifficulty`
- `MuscleRegion`
- `MuscleTargetRole`

## Milestone 3.5 Database-Backed Catalog

Milestone 3.5 converts runtime exercise reads to Prisma/PostgreSQL.

The seed command is:

```bash
cd backend
npm run prisma:seed
```

The seed is idempotent:

- Muscles are upserted by stable IDs
- Exercises are upserted by stable IDs
- Exercise-muscle mappings are recreated per exercise with duplicate protection

## Pending Runtime Verification

Real PostgreSQL migration and seed verification depends on Dockerized PostgreSQL availability.

## Milestone 4 Workout Logging

Milestone 4 adds:

- `WorkoutSession`
- `WorkoutExercise`
- `WorkoutSet`
- `WorkoutStatus`
- `WorkoutSetType`

Workout sessions belong to users. Workout exercises belong to workout sessions and reference catalog exercises. Workout sets belong to workout exercises.

## Milestone 5 Personal Records

Milestone 5 adds:

- `PersonalRecord`

Personal records belong to users, reference catalog exercises, and point to the workout set that created the record.

## Milestone 6 Progressive Overload

Milestone 6 adds no database tables.

Recommendations are computed dynamically from completed workout sessions and completed sets.
