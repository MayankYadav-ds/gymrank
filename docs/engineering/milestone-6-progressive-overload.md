# Implementation Milestone 6: Progressive Overload Engine

## Scope

Milestone 6 implements deterministic progressive overload recommendations only.

## Included

- Read-only overload recommendation engine
- Current recommendations endpoint
- Per-exercise recommendation endpoint
- Conservative upper-body increment: `+2.5 kg`
- Conservative lower-body increment: `+5 kg`
- Repeat-weight recommendation when target reps are missed
- Rep-progression fallback when a weight jump is inappropriate
- Mobile recommendation list/detail skeletons

## Not Included

- AI coaching
- Rankings
- Analytics
- Achievements
- Templates
- Programs
- Nutrition
- Social features

## Rule

Recommendations are computed dynamically from previous completed workouts. No recommendation is generated when no completed history exists for an exercise.
