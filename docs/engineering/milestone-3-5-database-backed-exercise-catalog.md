# Implementation Milestone 3.5: Database-Backed Exercise Catalog

## Scope

This milestone converts the exercise catalog from runtime in-memory data to database-backed reads.

## Included

- Prisma seed system
- Idempotent exercise/muscle seed data
- Runtime Prisma exercise repository
- Repository functions for list, detail, tracked lifts, search, category, and muscle filtering
- Preserved exercise API response shape
- Mobile exercise repository/service abstraction with temporary mock data

## Not Included

- Workout logging
- Templates
- PR engine
- Rankings
- Progressive overload
- Analytics
- Achievements
- Community/social features
- Full anatomy explorer
- Auth/profile changes

## API Compatibility

Existing endpoints remain:

- `GET /v1/exercises`
- `GET /v1/exercises/:id`
- `GET /v1/exercises?trackedOnly=true`

Response shape remains backward compatible.
