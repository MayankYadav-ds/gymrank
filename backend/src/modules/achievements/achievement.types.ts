export const achievementCategories = [
  "workout",
  "strength",
  "consistency",
  "volume",
  "personal_records",
  "rankings"
] as const;
export type AchievementCategory = (typeof achievementCategories)[number];

export const achievementRarities = ["common", "uncommon", "rare", "epic", "legendary"] as const;
export type AchievementRarity = (typeof achievementRarities)[number];

export type Achievement = {
  id: string;
  code: string;
  title: string;
  description: string;
  category: AchievementCategory;
  icon: string;
  rarity: AchievementRarity;
  hidden: boolean;
  createdAt: string;
};

export type UserAchievement = {
  id: string;
  userId: string;
  achievementId: string;
  unlockedAt: string;
  achievement: Achievement;
};

export type AchievementProgress = {
  achievement: Achievement;
  unlocked: boolean;
  unlockedAt: string | null;
  currentValue: number;
  targetValue: number;
  progressPercent: number;
};

export type AchievementDefinition = Omit<Achievement, "createdAt"> & {
  targetValue: number;
  evaluate(source: AchievementEvaluationSource): number;
};

export type AchievementEvaluationSource = {
  workoutCount: number;
  workoutDates: readonly string[];
  prCount: number;
  totalVolume: number;
  personalRecords: readonly AchievementPersonalRecord[];
  rankings: readonly AchievementRankingSnapshot[];
};

export type AchievementPersonalRecord = {
  exerciseId: string;
  weight: number;
  reps: number;
};

export type AchievementRankingSnapshot = {
  exerciseId: string;
  currentRank: number;
};
