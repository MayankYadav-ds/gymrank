# Implementation Milestone 5: Personal Records Engine

## Scope

Milestone 5 implements personal records only.

## Included

- Best set PR detection when a workout is completed
- Completed-set-only eligibility
- Highest weight comparison
- Reps tie-breaker
- PR history storage
- Current PR API
- Per-exercise PR history API

## Not Included

- Estimated 1RM
- Rankings
- Progressive overload
- Analytics
- Achievements
- Social sharing

## Detection Rule

For each exercise in a completed workout, the strongest completed set is compared against the user's previous best for that exercise.

A set is stronger when:

1. Its weight is higher, or
2. Its weight is equal and reps are higher
