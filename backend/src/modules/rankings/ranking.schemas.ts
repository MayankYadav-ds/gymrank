import { z } from "zod";

import { sexCategories } from "../auth-profile/auth-profile.types.js";
import { bodyweightClasses } from "./bodyweight-classes.js";

const bodyweightClassIds = bodyweightClasses.map((bodyweightClass) => bodyweightClass.id) as [
  string,
  ...string[]
];

export const rankingQuerySchema = z.object({
  country: z.string().trim().length(2).toUpperCase().optional(),
  sexCategory: z.enum(sexCategories).optional(),
  bodyweightClass: z.enum(bodyweightClassIds).optional(),
  limit: z.coerce.number().int().min(1).max(100).default(50),
  offset: z.coerce.number().int().min(0).default(0)
});

export type RankingQuery = z.infer<typeof rankingQuerySchema>;
