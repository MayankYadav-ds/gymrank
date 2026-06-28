# Implementation Milestone 4: Workout Session Logging

## Scope

Milestone 4 implements workout session logging only.

## Included

- Workout sessions
- Workout history/detail
- Finish/cancel/delete workout
- Workout exercises
- Exercise notes and ordering
- Workout sets
- Set weight, reps, type, and completion state
- Authenticated ownership checks

## Not Included

- Templates
- Programs
- Personal records
- Progressive overload
- Rankings
- Analytics
- Achievements
- Community/social features

## Set Types

- `normal`
- `warm_up`
- `drop_set`
- `failure`

## Validation

- Weight must be `>= 0`
- Reps must be `>= 0`
- Workout must contain at least one exercise before completion
- Exercise must exist before adding it to a workout
- Users can only access their own workouts
