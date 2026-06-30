import type { SexCategory } from "../auth-profile/auth-profile.types.js";

export type RankingFilters = {
  country?: string;
  sexCategory?: SexCategory;
  bodyweightClass?: string;
  limit: number;
  offset: number;
};

export type RankingEntry = {
  userId: string;
  displayName: string;
  exerciseId: string;
  exerciseName: string;
  bestWeight: number;
  bestReps: number;
  currentRank: number;
  percentile: number;
  achievedAt: string;
  country: string | null;
  sexCategory: SexCategory | null;
  bodyweight: number | null;
  bodyweightClass: string | null;
};

export type LeaderboardResult = {
  exerciseId: string;
  entries: readonly RankingEntry[];
  currentUser: RankingEntry | null;
  nearby: readonly RankingEntry[];
  total: number;
};

export type MyRankSummary = {
  currentRank: number;
  bestLift: RankingEntry | null;
  currentPr: RankingEntry | null;
  percentile: number | null;
  exerciseRanks: readonly RankingEntry[];
};
