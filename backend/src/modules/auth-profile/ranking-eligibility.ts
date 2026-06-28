import {
  rankingEligibleSexCategories,
  type RankingEligibility,
  type UserProfile
} from "./auth-profile.types.js";

export function calculateRankingEligibility(
  profile: UserProfile,
  hasValidTrackedLiftLog: boolean
): RankingEligibility {
  const missingRequirements: string[] = [];

  if (!profile.rankingParticipationEnabled) {
    missingRequirements.push("ranking_participation_enabled");
  }

  if (!profile.country) {
    missingRequirements.push("country");
  }

  if (!profile.dateOfBirth) {
    missingRequirements.push("date_of_birth");
  }

  if (!profile.sexCategory || !rankingEligibleSexCategories.includes(profile.sexCategory)) {
    missingRequirements.push("ranking_eligible_sex_category");
  }

  if (profile.bodyweight === null) {
    missingRequirements.push("bodyweight");
  }

  if (!hasValidTrackedLiftLog) {
    missingRequirements.push("valid_tracked_lift_log");
  }

  return {
    eligible: missingRequirements.length === 0,
    missingRequirements
  };
}
