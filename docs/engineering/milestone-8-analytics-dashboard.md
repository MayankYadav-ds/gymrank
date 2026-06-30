# Milestone 8 Analytics Dashboard

## Scope

Milestone 8 implements factual analytics only:

- Dashboard totals
- Strength analytics
- Volume analytics
- Consistency analytics
- Bodyweight analytics
- Muscle distribution

It does not implement achievements, community, social features, AI, predictions, programs, templates, notifications, coach tools, nutrition, or wearables.

## Backend

Analytics use the existing repository, service, and route module structure.

The repository loads completed workouts, nested exercises, sets, muscle mappings, personal records, and current profile bodyweight in a small number of aggregate reads to avoid N+1 query behavior.

The service computes analytics dynamically and does not persist derived analytics records.

## Mobile

The mobile app includes analytics screens backed by a repository/service abstraction and temporary mock data.

Screens:

- Analytics dashboard
- Strength progress
- Volume
- Consistency
- Bodyweight
- Muscle distribution

## Database

No new database tables or migrations are introduced.

Bodyweight history is represented by the current profile bodyweight only until a real bodyweight history model is approved.
