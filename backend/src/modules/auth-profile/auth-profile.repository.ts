import type { PrismaClient, SexCategory as PrismaSexCategory, UnitPreference as PrismaUnitPreference } from "@prisma/client";

import type { UpdateProfileInput } from "./auth-profile.schemas.js";
import type { SexCategory, UnitPreference, UserProfile } from "./auth-profile.types.js";

export type CreateUserInput = {
  email: string;
  passwordHash: string;
  displayName: string;
};

export type StoredUser = UserProfile & {
  passwordHash: string;
};

export type AuthProfileRepository = {
  createUser(input: CreateUserInput): Promise<StoredUser>;
  findByEmail(email: string): Promise<StoredUser | null>;
  findById(id: string): Promise<StoredUser | null>;
  updateProfile(userId: string, input: UpdateProfileInput): Promise<StoredUser>;
  hasValidTrackedLiftLog(userId: string): Promise<boolean>;
};

export class PrismaAuthProfileRepository implements AuthProfileRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async createUser(input: CreateUserInput): Promise<StoredUser> {
    const user = await this.prisma.user.create({
      data: {
        email: input.email,
        passwordHash: input.passwordHash,
        displayName: input.displayName
      }
    });

    return mapUser(user);
  }

  async findByEmail(email: string): Promise<StoredUser | null> {
    const user = await this.prisma.user.findUnique({ where: { email } });
    return user ? mapUser(user) : null;
  }

  async findById(id: string): Promise<StoredUser | null> {
    const user = await this.prisma.user.findUnique({ where: { id } });
    return user ? mapUser(user) : null;
  }

  async updateProfile(userId: string, input: UpdateProfileInput): Promise<StoredUser> {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: toPrismaUpdate(input)
    });

    return mapUser(user);
  }

  async hasValidTrackedLiftLog(_userId: string): Promise<boolean> {
    return false;
  }
}

type PrismaUser = Awaited<ReturnType<PrismaClient["user"]["findUnique"]>>;

function mapUser(user: NonNullable<PrismaUser>): StoredUser {
  return {
    id: user.id,
    email: user.email,
    passwordHash: user.passwordHash,
    displayName: user.displayName,
    country: user.country,
    unitPreference: fromPrismaUnitPreference(user.unitPreference),
    dateOfBirth: user.dateOfBirth ? user.dateOfBirth.toISOString().slice(0, 10) : null,
    sexCategory: user.sexCategory ? fromPrismaSexCategory(user.sexCategory) : null,
    bodyweight: user.bodyweight === null ? null : user.bodyweight.toNumber(),
    rankingParticipationEnabled: user.rankingParticipationEnabled,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString()
  };
}

function toPrismaUpdate(input: UpdateProfileInput) {
  return {
    displayName: input.displayName,
    country: input.country,
    unitPreference: input.unitPreference ? toPrismaUnitPreference(input.unitPreference) : undefined,
    dateOfBirth:
      input.dateOfBirth === undefined
        ? undefined
        : input.dateOfBirth === null
          ? null
          : new Date(`${input.dateOfBirth}T00:00:00.000Z`),
    sexCategory:
      input.sexCategory === undefined
        ? undefined
        : input.sexCategory === null
          ? null
          : toPrismaSexCategory(input.sexCategory),
    bodyweight: input.bodyweight,
    rankingParticipationEnabled: input.rankingParticipationEnabled
  };
}

function fromPrismaUnitPreference(value: PrismaUnitPreference): UnitPreference {
  return value === "KG" ? "kg" : "lb";
}

function toPrismaUnitPreference(value: UnitPreference): PrismaUnitPreference {
  return value === "kg" ? "KG" : "LB";
}

function fromPrismaSexCategory(value: PrismaSexCategory): SexCategory {
  const map = {
    MALE: "male",
    FEMALE: "female",
    OPEN: "open",
    PREFER_NOT_TO_SAY: "prefer_not_to_say"
  } as const;

  return map[value];
}

function toPrismaSexCategory(value: SexCategory): PrismaSexCategory {
  const map = {
    male: "MALE",
    female: "FEMALE",
    open: "OPEN",
    prefer_not_to_say: "PREFER_NOT_TO_SAY"
  } as const;

  return map[value];
}
