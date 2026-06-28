import { z } from "zod";

import { workoutSetTypes, workoutStatuses } from "./workout.types.js";

const optionalTextSchema = z.string().trim().min(1).max(500).nullable().optional();
const titleSchema = z.string().trim().min(1).max(120).nullable().optional();
const orderIndexSchema = z.number().int().min(0).max(500);

export const createWorkoutSchema = z
  .object({
    title: titleSchema,
    notes: optionalTextSchema
  })
  .strict();

export const updateWorkoutSchema = z
  .object({
    title: titleSchema,
    notes: optionalTextSchema,
    status: z.enum(workoutStatuses).optional()
  })
  .strict();

export const addWorkoutExerciseSchema = z
  .object({
    exerciseId: z.string().trim().min(1).max(120),
    notes: optionalTextSchema,
    orderIndex: orderIndexSchema.optional()
  })
  .strict();

export const updateWorkoutExerciseSchema = z
  .object({
    notes: optionalTextSchema,
    orderIndex: orderIndexSchema.optional()
  })
  .strict();

export const addWorkoutSetSchema = z
  .object({
    workoutExerciseId: z.string().trim().min(1),
    weight: z.number().min(0).max(5000),
    reps: z.number().int().min(0).max(1000),
    type: z.enum(workoutSetTypes).default("normal"),
    completed: z.boolean().default(false),
    orderIndex: orderIndexSchema.optional()
  })
  .strict();

export const updateWorkoutSetSchema = z
  .object({
    weight: z.number().min(0).max(5000).optional(),
    reps: z.number().int().min(0).max(1000).optional(),
    type: z.enum(workoutSetTypes).optional(),
    completed: z.boolean().optional(),
    orderIndex: orderIndexSchema.optional()
  })
  .strict();

export type CreateWorkoutInput = z.infer<typeof createWorkoutSchema>;
export type UpdateWorkoutInput = z.infer<typeof updateWorkoutSchema>;
export type AddWorkoutExerciseInput = z.infer<typeof addWorkoutExerciseSchema>;
export type UpdateWorkoutExerciseInput = z.infer<typeof updateWorkoutExerciseSchema>;
export type AddWorkoutSetInput = z.infer<typeof addWorkoutSetSchema>;
export type UpdateWorkoutSetInput = z.infer<typeof updateWorkoutSetSchema>;
