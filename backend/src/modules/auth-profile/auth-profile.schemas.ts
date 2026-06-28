import { z } from "zod";

import { sexCategories, unitPreferences } from "./auth-profile.types.js";

const displayNameSchema = z.string().trim().min(2).max(40);
const emailSchema = z.string().trim().email().toLowerCase();
const passwordSchema = z.string().min(10).max(128);
const countrySchema = z.string().trim().length(2).toUpperCase();
const dateOfBirthSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/)
  .refine((value) => {
    const date = new Date(`${value}T00:00:00.000Z`);
    return !Number.isNaN(date.getTime()) && date < new Date();
  }, "Date of birth must be a valid past date.");

const bodyweightSchema = z.number().positive().max(700);

export const registerSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  displayName: displayNameSchema
});

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1).max(128)
});

export const updateProfileSchema = z
  .object({
    displayName: displayNameSchema.optional(),
    country: countrySchema.nullable().optional(),
    unitPreference: z.enum(unitPreferences).optional(),
    dateOfBirth: dateOfBirthSchema.nullable().optional(),
    sexCategory: z.enum(sexCategories).nullable().optional(),
    bodyweight: bodyweightSchema.nullable().optional(),
    rankingParticipationEnabled: z.boolean().optional()
  })
  .strict();

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
