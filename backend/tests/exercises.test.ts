import request from "supertest";
import { describe, expect, it } from "vitest";

import { createApp } from "../src/app/create-app.js";
import type { AppConfig } from "../src/config/env.js";
import { trackedLiftIds } from "../src/shared/constants/tracked-lifts.js";

const testConfig: AppConfig = {
  nodeEnv: "test",
  appName: "GymRank",
  port: 4000,
  corsOrigin: "http://localhost:3000",
  databaseUrl: "postgresql://gymrank:gymrank_dev_password@localhost:5432/gymrank_dev?schema=public",
  jwtSecret: "test-secret-that-is-at-least-thirty-two-characters",
  jwtExpiresIn: "7d"
};

describe("exercise routes", () => {
  it("lists exercises with muscle targeting summaries", async () => {
    const response = await request(createApp(testConfig)).get("/v1/exercises");

    expect(response.status).toBe(200);
    expect(response.body.exercises.length).toBeGreaterThan(5);
    expect(response.body.exercises[0]).toEqual(
      expect.objectContaining({
        id: expect.any(String),
        name: expect.any(String),
        primaryMuscles: expect.any(Array),
        secondaryMuscles: expect.any(Array)
      })
    );
  });

  it("restricts tracked lifts to the approved V1 ranking lift ids", async () => {
    const response = await request(createApp(testConfig)).get("/v1/exercises?trackedOnly=true");

    expect(response.status).toBe(200);
    expect(response.body.exercises.map((exercise: { trackedLiftId: string }) => exercise.trackedLiftId)).toEqual(
      [...trackedLiftIds]
    );
  });

  it("returns exercise-centric anatomy data for exercise detail", async () => {
    const response = await request(createApp(testConfig)).get("/v1/exercises/bench_press");

    expect(response.status).toBe(200);
    expect(response.body.exercise).toMatchObject({
      id: "bench_press",
      name: "Bench Press",
      isTrackedLift: true,
      trackedLiftId: "bench_press",
      anatomy: {
        frontHighlightedMuscles: expect.arrayContaining([
          expect.objectContaining({ id: "chest", name: "Chest" })
        ]),
        backHighlightedMuscles: []
      }
    });
  });

  it("does not mark unsupported exercise variants as ranking lifts", async () => {
    const response = await request(createApp(testConfig)).get("/v1/exercises/barbell_row");

    expect(response.status).toBe(200);
    expect(response.body.exercise.isTrackedLift).toBe(false);
    expect(response.body.exercise.trackedLiftId).toBeNull();
  });

  it("returns 404 for unknown exercises", async () => {
    const response = await request(createApp(testConfig)).get("/v1/exercises/unknown_lift");

    expect(response.status).toBe(404);
    expect(response.body.error.code).toBe("exercise_not_found");
  });
});
