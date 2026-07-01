# Milestone 9 Achievements

## Scope

Milestone 9 implements deterministic achievements and gamification only.

It does not implement community, social feed, messaging, AI, nutrition, programs, templates, coach tools, wearables, notifications, public PR sharing, XP, coins, or marketplace features.

## Backend

The achievements module follows the existing repository, service, and route structure.

Achievement unlocks are evaluated from:

- Completed workout count
- Completed workout dates
- Completed-set training volume
- Personal records
- Approved tracked-lift milestones
- Current ranking snapshots

Already unlocked achievements remain unlocked permanently and cannot duplicate.

## Database

Milestone 9 adds `Achievement` and `UserAchievement`.

The achievement catalog uses stable IDs and codes. Seeding is idempotent.

## Mobile

The mobile app includes:

- Achievements screen
- Achievement card
- Achievement detail screen
- Unlocked celebration dialog
- Profile achievement section

Screens use the existing GymRank theme and repository/service abstraction.
