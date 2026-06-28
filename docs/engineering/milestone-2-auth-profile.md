# Implementation Milestone 2: Authentication And Profile

## Scope

Milestone 2 implements only the auth/profile foundation for GymRank V1.

## Included

- Custom registration and login
- Password hashing
- Bearer auth token
- Profile retrieval and update
- Required account fields: email, password, display name
- Optional profile fields for ranking eligibility
- Profile-level ranking eligibility calculation
- Backend tests for auth/profile flows
- Mobile auth/profile skeleton screens

## Not Included

- Workouts
- Rankings engine
- PR engine
- Progressive overload engine
- Analytics
- Achievements
- Community or social features

## Ranking Eligibility

A user is ranking-eligible only when:

- `rankingParticipationEnabled = true`
- Country is set
- Date of birth is set
- Sex/category is ranking-eligible
- Bodyweight is set
- At least one valid tracked-lift log exists

The tracked-lift-log requirement remains false until workout logging is implemented.
