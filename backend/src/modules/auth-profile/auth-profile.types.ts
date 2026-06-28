export const unitPreferences = ["kg", "lb"] as const;
export type UnitPreference = (typeof unitPreferences)[number];

export const sexCategories = ["male", "female", "open", "prefer_not_to_say"] as const;
export type SexCategory = (typeof sexCategories)[number];

export const rankingEligibleSexCategories: readonly SexCategory[] = ["male", "female", "open"];

export type UserProfile = {
  id: string;
  email: string;
  displayName: string;
  country: string | null;
  unitPreference: UnitPreference;
  dateOfBirth: string | null;
  sexCategory: SexCategory | null;
  bodyweight: number | null;
  rankingParticipationEnabled: boolean;
  createdAt: string;
  updatedAt: string;
};

export type RankingEligibility = {
  eligible: boolean;
  missingRequirements: string[];
};

export type AuthenticatedUser = {
  userId: string;
  email: string;
};
