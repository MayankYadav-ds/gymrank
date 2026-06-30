# Rankings Module

Responsibilities:

- Overall strength score
- Per-lift leaderboard
- Ranking filters
- Eligibility handling

V1 rankings are restricted to the approved tracked lifts only.

## Milestone 7 Scope

- Rankings are sourced only from Personal Records
- No likes, followers, popularity, activity, or engagement data affects rank
- Supported filters: country, sex/category, bodyweight class
- Tie-breakers: highest weight, highest reps, earliest achievement date

## Endpoints

- `GET /v1/rankings`
- `GET /v1/rankings/:exerciseId`
- `GET /v1/rankings/me`
- `GET /v1/rankings/me/:exerciseId`
