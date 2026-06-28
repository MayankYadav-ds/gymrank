export const trackedLiftIds = [
  "bench_press",
  "squat",
  "deadlift",
  "overhead_press",
  "pull_up_weighted_pull_up"
] as const;

export type TrackedLiftId = (typeof trackedLiftIds)[number];

export type TrackedLift = {
  id: TrackedLiftId;
  name: string;
};

export const trackedLifts: readonly TrackedLift[] = [
  { id: "bench_press", name: "Bench Press" },
  { id: "squat", name: "Squat" },
  { id: "deadlift", name: "Deadlift" },
  { id: "overhead_press", name: "Overhead Press" },
  { id: "pull_up_weighted_pull_up", name: "Pull-Up / Weighted Pull-Up" }
] as const;

export function isTrackedLiftId(value: string): value is TrackedLiftId {
  return trackedLiftIds.includes(value as TrackedLiftId);
}
