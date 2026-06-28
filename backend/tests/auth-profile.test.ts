import request from "supertest";
import { describe, expect, it } from "vitest";

import { createApp } from "../src/app/create-app.js";
import type { AppConfig } from "../src/config/env.js";
import type {
  AuthProfileRepository,
  CreateUserInput,
  StoredUser
} from "../src/modules/auth-profile/auth-profile.repository.js";
import type { UpdateProfileInput } from "../src/modules/auth-profile/auth-profile.schemas.js";

const testConfig: AppConfig = {
  nodeEnv: "test",
  appName: "GymRank",
  port: 4000,
  corsOrigin: "http://localhost:3000",
  databaseUrl: "postgresql://gymrank:gymrank_dev_password@localhost:5432/gymrank_dev?schema=public",
  jwtSecret: "test-secret-that-is-at-least-thirty-two-characters",
  jwtExpiresIn: "7d"
};

describe("auth/profile routes", () => {
  it("registers a user without requiring bodyweight and returns ranking requirements", async () => {
    const app = createApp(testConfig, { authProfileRepository: new InMemoryAuthProfileRepository() });

    const response = await request(app).post("/v1/auth/register").send({
      email: "lifter@example.com",
      password: "strong-password",
      displayName: "Lifter"
    });

    expect(response.status).toBe(201);
    expect(response.body.token).toEqual(expect.any(String));
    expect(response.body.profile).toMatchObject({
      email: "lifter@example.com",
      displayName: "Lifter",
      bodyweight: null,
      rankingParticipationEnabled: false
    });
    expect(response.body.profile.passwordHash).toBeUndefined();
    expect(response.body.rankingEligibility).toEqual({
      eligible: false,
      missingRequirements: [
        "ranking_participation_enabled",
        "country",
        "date_of_birth",
        "ranking_eligible_sex_category",
        "bodyweight",
        "valid_tracked_lift_log"
      ]
    });
  });

  it("logs in and returns the profile", async () => {
    const app = createApp(testConfig, { authProfileRepository: new InMemoryAuthProfileRepository() });

    await request(app).post("/v1/auth/register").send({
      email: "login@example.com",
      password: "strong-password",
      displayName: "Login User"
    });

    const response = await request(app).post("/v1/auth/login").send({
      email: "login@example.com",
      password: "strong-password"
    });

    expect(response.status).toBe(200);
    expect(response.body.token).toEqual(expect.any(String));
    expect(response.body.profile.email).toBe("login@example.com");
  });

  it("updates profile fields and keeps ranking blocked until a valid tracked lift exists", async () => {
    const repository = new InMemoryAuthProfileRepository();
    const app = createApp(testConfig, { authProfileRepository: repository });

    const registerResponse = await request(app).post("/v1/auth/register").send({
      email: "ranker@example.com",
      password: "strong-password",
      displayName: "Ranker"
    });
    const token = registerResponse.body.token as string;

    const updateResponse = await request(app)
      .patch("/v1/profile")
      .set("Authorization", `Bearer ${token}`)
      .send({
        country: "US",
        unitPreference: "lb",
        dateOfBirth: "1998-04-20",
        sexCategory: "open",
        bodyweight: 185.5,
        rankingParticipationEnabled: true
      });

    expect(updateResponse.status).toBe(200);
    expect(updateResponse.body.profile).toMatchObject({
      country: "US",
      unitPreference: "lb",
      dateOfBirth: "1998-04-20",
      sexCategory: "open",
      bodyweight: 185.5,
      rankingParticipationEnabled: true
    });
    expect(updateResponse.body.rankingEligibility).toEqual({
      eligible: false,
      missingRequirements: ["valid_tracked_lift_log"]
    });
  });

  it("requires auth for profile access", async () => {
    const app = createApp(testConfig, { authProfileRepository: new InMemoryAuthProfileRepository() });

    const response = await request(app).get("/v1/profile");

    expect(response.status).toBe(401);
    expect(response.body.error.code).toBe("auth_required");
  });

  it("rejects duplicate emails", async () => {
    const app = createApp(testConfig, { authProfileRepository: new InMemoryAuthProfileRepository() });
    const payload = {
      email: "duplicate@example.com",
      password: "strong-password",
      displayName: "Duplicate"
    };

    await request(app).post("/v1/auth/register").send(payload);
    const response = await request(app).post("/v1/auth/register").send(payload);

    expect(response.status).toBe(409);
    expect(response.body.error.code).toBe("email_already_registered");
  });
});

class InMemoryAuthProfileRepository implements AuthProfileRepository {
  private readonly users = new Map<string, StoredUser>();
  private sequence = 1;

  async createUser(input: CreateUserInput): Promise<StoredUser> {
    const now = new Date().toISOString();
    const user: StoredUser = {
      id: `user_${this.sequence++}`,
      email: input.email,
      passwordHash: input.passwordHash,
      displayName: input.displayName,
      country: null,
      unitPreference: "kg",
      dateOfBirth: null,
      sexCategory: null,
      bodyweight: null,
      rankingParticipationEnabled: false,
      createdAt: now,
      updatedAt: now
    };

    this.users.set(user.id, user);
    return user;
  }

  async findByEmail(email: string): Promise<StoredUser | null> {
    return [...this.users.values()].find((user) => user.email === email) ?? null;
  }

  async findById(id: string): Promise<StoredUser | null> {
    return this.users.get(id) ?? null;
  }

  async updateProfile(userId: string, input: UpdateProfileInput): Promise<StoredUser> {
    const user = this.users.get(userId);

    if (!user) {
      throw new Error("User not found in test repository.");
    }

    const updated: StoredUser = {
      ...user,
      ...input,
      updatedAt: new Date().toISOString()
    };

    this.users.set(userId, updated);
    return updated;
  }

  async hasValidTrackedLiftLog(_userId: string): Promise<boolean> {
    return false;
  }
}
