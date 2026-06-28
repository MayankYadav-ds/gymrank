# Module Boundaries

GymRank V1 modules:

- `auth-profile`
- `workouts`
- `exercises`
- `muscle-targeting`
- `personal-records`
- `overload`
- `rankings`
- `physique`
- `analytics`
- `achievements`

Each module should own its product behavior, validation rules, and tests. Cross-module shared logic must live under `shared/` only when it is truly reused.
