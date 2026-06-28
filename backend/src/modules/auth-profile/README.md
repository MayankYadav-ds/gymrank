# Auth/Profile Module

Responsibilities:

- Authentication
- Profile fields
- Ranking eligibility inputs
- User-owned data access rules

## V1 Decisions

- Custom auth
- Required registration fields: email, password, display name
- Bodyweight is not required at sign-up
- Rankings are opt-in
- Users can use GymRank privately without joining rankings

## Ranking Eligibility Fields

- `rankingParticipationEnabled`
- `country`
- `dateOfBirth`
- `sexCategory`
- `bodyweight`
- Valid tracked-lift log, once workout logging exists

V1 sex/category values:

- `male`
- `female`
- `open`
- `prefer_not_to_say`

Only `male`, `female`, and `open` are ranking-eligible.
