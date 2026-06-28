import { describe, expect, it } from "vitest";

import { isTrackedLiftId, trackedLiftIds } from "../src/shared/constants/tracked-lifts.js";

describe("tracked lifts", () => {
  it("contains only the approved V1 ranking lifts", () => {
    expect(trackedLiftIds).toEqual([
      "bench_press",
      "squat",
      "deadlift",
      "overhead_press",
      "pull_up_weighted_pull_up"
    ]);
  });

  it("rejects non-ranking exercises", () => {
    expect(isTrackedLiftId("barbell_row")).toBe(false);
  });
});
