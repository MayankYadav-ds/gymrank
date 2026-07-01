# Achievements Module

Milestone 9 implements deterministic achievements and gamification.

Responsibilities:

- First workout
- First PR
- Consistency streaks
- Lift milestones
- Workout count milestones
- Volume milestones
- Ranking milestones

Achievements are based only on real training data:

- Completed workouts
- Completed-set volume
- Personal records
- Approved tracked lifts
- Current ranking snapshots

No achievement uses likes, followers, social activity, XP, coins, marketplace behavior, or AI.

Unlocks are idempotent through the `UserAchievement` unique user/achievement constraint.
