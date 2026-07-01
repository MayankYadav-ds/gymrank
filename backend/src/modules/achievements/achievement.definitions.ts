import type { AchievementDefinition } from "./achievement.types.js";

export const achievementDefinitions: readonly AchievementDefinition[] = [
  workout("first_workout", "First Workout", "Complete your first workout.", 1, "common"),
  workout("workouts_10", "10 Workouts", "Complete 10 workouts.", 10, "common"),
  workout("workouts_25", "25 Workouts", "Complete 25 workouts.", 25, "uncommon"),
  workout("workouts_50", "50 Workouts", "Complete 50 workouts.", 50, "rare"),
  workout("workouts_100", "100 Workouts", "Complete 100 workouts.", 100, "epic"),
  workout("workouts_250", "250 Workouts", "Complete 250 workouts.", 250, "legendary"),
  streak("streak_3", "3-Day Streak", "Train on 3 consecutive days.", 3, "common"),
  streak("streak_7", "7-Day Streak", "Train on 7 consecutive days.", 7, "uncommon"),
  streak("streak_14", "14-Day Streak", "Train on 14 consecutive days.", 14, "rare"),
  streak("streak_30", "30-Day Streak", "Train on 30 consecutive days.", 30, "epic"),
  streak("streak_90", "90-Day Streak", "Train on 90 consecutive days.", 90, "legendary"),
  pr("first_pr", "First PR", "Set your first personal record.", 1, "common"),
  pr("prs_10", "10 PRs", "Set 10 personal records.", 10, "uncommon"),
  pr("prs_25", "25 PRs", "Set 25 personal records.", 25, "rare"),
  pr("prs_50", "50 PRs", "Set 50 personal records.", 50, "epic"),
  volume("volume_10000", "10,000 kg Volume", "Lift 10,000 kg of completed training volume.", 10_000, "common"),
  volume("volume_100000", "100,000 kg Volume", "Lift 100,000 kg of completed training volume.", 100_000, "rare"),
  strength("bench_100kg", "100 kg Bench", "Bench press 100 kg.", "bench_press", 100, 1, "rare"),
  strength("bench_140kg", "140 kg Bench", "Bench press 140 kg.", "bench_press", 140, 1, "epic"),
  strength("bench_180kg", "180 kg Bench", "Bench press 180 kg.", "bench_press", 180, 1, "legendary"),
  strength("squat_200kg", "200 kg Squat", "Squat 200 kg.", "squat", 200, 1, "epic"),
  strength("deadlift_250kg", "250 kg Deadlift", "Deadlift 250 kg.", "deadlift", 250, 1, "legendary"),
  strength(
    "bodyweight_pull_up",
    "Bodyweight Pull-Up",
    "Log a completed pull-up or weighted pull-up.",
    "pull_up_weighted_pull_up",
    0,
    1,
    "common"
  ),
  strength(
    "weighted_pull_up_20kg",
    "Weighted Pull-Up +20 kg",
    "Log a weighted pull-up with at least 20 kg added.",
    "pull_up_weighted_pull_up",
    20,
    1,
    "rare"
  ),
  ranking("ranking_top_100", "Top 100", "Reach the top 100 on any approved lift leaderboard.", 100, "uncommon"),
  ranking("ranking_top_50", "Top 50", "Reach the top 50 on any approved lift leaderboard.", 50, "rare"),
  ranking("ranking_top_10", "Top 10", "Reach the top 10 on any approved lift leaderboard.", 10, "epic"),
  ranking("ranking_top_3", "Top 3", "Reach the top 3 on any approved lift leaderboard.", 3, "legendary"),
  ranking("ranking_number_1", "#1", "Reach rank #1 on any approved lift leaderboard.", 1, "legendary")
];

function workout(
  code: string,
  title: string,
  description: string,
  targetValue: number,
  rarity: AchievementDefinition["rarity"]
): AchievementDefinition {
  return base(code, title, description, "workout", "fitness_center", rarity, targetValue, (source) => source.workoutCount);
}

function streak(
  code: string,
  title: string,
  description: string,
  targetValue: number,
  rarity: AchievementDefinition["rarity"]
): AchievementDefinition {
  return base(code, title, description, "consistency", "local_fire_department", rarity, targetValue, (source) =>
    longestStreak(source.workoutDates)
  );
}

function pr(
  code: string,
  title: string,
  description: string,
  targetValue: number,
  rarity: AchievementDefinition["rarity"]
): AchievementDefinition {
  return base(code, title, description, "personal_records", "emoji_events", rarity, targetValue, (source) => source.prCount);
}

function volume(
  code: string,
  title: string,
  description: string,
  targetValue: number,
  rarity: AchievementDefinition["rarity"]
): AchievementDefinition {
  return base(code, title, description, "volume", "bar_chart", rarity, targetValue, (source) => source.totalVolume);
}

function strength(
  code: string,
  title: string,
  description: string,
  exerciseId: string,
  targetWeight: number,
  targetReps: number,
  rarity: AchievementDefinition["rarity"]
): AchievementDefinition {
  return base(code, title, description, "strength", "bolt", rarity, targetWeight, (source) => {
    const record = source.personalRecords
      .filter((item) => item.exerciseId === exerciseId)
      .sort((left, right) => right.weight - left.weight || right.reps - left.reps)[0];

    if (!record || record.reps < targetReps) {
      return 0;
    }

    return record.weight;
  });
}

function ranking(
  code: string,
  title: string,
  description: string,
  targetRank: number,
  rarity: AchievementDefinition["rarity"]
): AchievementDefinition {
  return base(code, title, description, "rankings", "leaderboard", rarity, targetRank, (source) => {
    const bestRank = source.rankings.reduce<number | null>(
      (best, rankingSnapshot) => (best === null ? rankingSnapshot.currentRank : Math.min(best, rankingSnapshot.currentRank)),
      null
    );

    if (bestRank === null) {
      return 0;
    }

    return bestRank <= targetRank ? targetRank : Math.max(0, targetRank - (bestRank - targetRank));
  });
}

function base(
  code: string,
  title: string,
  description: string,
  category: AchievementDefinition["category"],
  icon: string,
  rarity: AchievementDefinition["rarity"],
  targetValue: number,
  evaluate: AchievementDefinition["evaluate"]
): AchievementDefinition {
  return {
    id: code,
    code,
    title,
    description,
    category,
    icon,
    rarity,
    hidden: false,
    targetValue,
    evaluate
  };
}

function longestStreak(dates: readonly string[]): number {
  const uniqueDates = [...new Set(dates)].sort();

  if (uniqueDates.length === 0) {
    return 0;
  }

  let longest = 1;
  let current = 1;

  for (let index = 1; index < uniqueDates.length; index += 1) {
    const previous = Date.parse(`${uniqueDates[index - 1]}T00:00:00.000Z`);
    const next = Date.parse(`${uniqueDates[index]}T00:00:00.000Z`);
    const gap = Math.round((next - previous) / 86_400_000);
    current = gap === 1 ? current + 1 : 1;
    longest = Math.max(longest, current);
  }

  return longest;
}
