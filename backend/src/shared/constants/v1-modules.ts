export const v1Modules = [
  "auth-profile",
  "workouts",
  "exercises",
  "muscle-targeting",
  "personal-records",
  "overload",
  "rankings",
  "physique",
  "analytics",
  "achievements"
] as const;

export type V1Module = (typeof v1Modules)[number];
