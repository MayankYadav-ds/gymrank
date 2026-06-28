import { AppError } from "../../shared/errors/app-error.js";
import { signAuthToken } from "./auth-token.js";
import type { AuthProfileRepository, StoredUser } from "./auth-profile.repository.js";
import type { LoginInput, RegisterInput, UpdateProfileInput } from "./auth-profile.schemas.js";
import type { AppConfig } from "../../config/env.js";
import type { RankingEligibility, UserProfile } from "./auth-profile.types.js";
import { hashPassword, verifyPassword } from "./password.js";
import { calculateRankingEligibility } from "./ranking-eligibility.js";

export type AuthProfileResponse = {
  profile: UserProfile;
  rankingEligibility: RankingEligibility;
};

export type AuthResponse = AuthProfileResponse & {
  token: string;
};

export class AuthProfileService {
  constructor(
    private readonly repository: AuthProfileRepository,
    private readonly config: AppConfig
  ) {}

  async register(input: RegisterInput): Promise<AuthResponse> {
    const existingUser = await this.repository.findByEmail(input.email);

    if (existingUser) {
      throw new AppError(409, "email_already_registered", "Email is already registered.");
    }

    const passwordHash = await hashPassword(input.password);
    const user = await this.repository.createUser({
      email: input.email,
      passwordHash,
      displayName: input.displayName
    });

    return this.toAuthResponse(user);
  }

  async login(input: LoginInput): Promise<AuthResponse> {
    const user = await this.repository.findByEmail(input.email);

    if (!user) {
      throw new AppError(401, "invalid_credentials", "Email or password is incorrect.");
    }

    const passwordValid = await verifyPassword(input.password, user.passwordHash);

    if (!passwordValid) {
      throw new AppError(401, "invalid_credentials", "Email or password is incorrect.");
    }

    return this.toAuthResponse(user);
  }

  async getProfile(userId: string): Promise<AuthProfileResponse> {
    const user = await this.findExistingUser(userId);
    return this.toProfileResponse(user);
  }

  async updateProfile(userId: string, input: UpdateProfileInput): Promise<AuthProfileResponse> {
    await this.findExistingUser(userId);
    const user = await this.repository.updateProfile(userId, input);
    return this.toProfileResponse(user);
  }

  private async findExistingUser(userId: string): Promise<StoredUser> {
    const user = await this.repository.findById(userId);

    if (!user) {
      throw new AppError(404, "profile_not_found", "Profile was not found.");
    }

    return user;
  }

  private async toAuthResponse(user: StoredUser): Promise<AuthResponse> {
    const profileResponse = await this.toProfileResponse(user);
    const token = signAuthToken({ userId: user.id, email: user.email }, this.config);

    return {
      token,
      ...profileResponse
    };
  }

  private async toProfileResponse(user: StoredUser): Promise<AuthProfileResponse> {
    const hasValidTrackedLiftLog = await this.repository.hasValidTrackedLiftLog(user.id);
    const profile = { ...user };
    delete (profile as Partial<StoredUser>).passwordHash;

    return {
      profile: profile as UserProfile,
      rankingEligibility: calculateRankingEligibility(profile, hasValidTrackedLiftLog)
    };
  }
}
