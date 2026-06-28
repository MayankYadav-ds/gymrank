import type { PrismaClient } from "@prisma/client";

import type { PersonalRecord, PersonalRecordCandidate } from "./personal-record.types.js";

export type PersonalRecordRepository = {
  findCurrentByUser(userId: string): Promise<readonly PersonalRecord[]>;
  findHistoryByExercise(userId: string, exerciseId: string): Promise<readonly PersonalRecord[]>;
  findBestForExercise(userId: string, exerciseId: string): Promise<PersonalRecord | null>;
  createRecords(candidates: readonly PersonalRecordCandidate[]): Promise<readonly PersonalRecord[]>;
};

export class PrismaPersonalRecordRepository implements PersonalRecordRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findCurrentByUser(userId: string): Promise<readonly PersonalRecord[]> {
    const records = await this.prisma.personalRecord.findMany({
      where: { userId },
      include: personalRecordInclude,
      orderBy: [{ exerciseId: "asc" }, { weight: "desc" }, { reps: "desc" }, { achievedAt: "desc" }]
    });

    const currentByExercise = new Map<string, PersonalRecord>();

    for (const record of records.map(mapPersonalRecord)) {
      if (!currentByExercise.has(record.exerciseId)) {
        currentByExercise.set(record.exerciseId, record);
      }
    }

    return [...currentByExercise.values()];
  }

  async findHistoryByExercise(userId: string, exerciseId: string): Promise<readonly PersonalRecord[]> {
    const records = await this.prisma.personalRecord.findMany({
      where: { userId, exerciseId },
      include: personalRecordInclude,
      orderBy: { achievedAt: "desc" }
    });

    return records.map(mapPersonalRecord);
  }

  async findBestForExercise(userId: string, exerciseId: string): Promise<PersonalRecord | null> {
    const record = await this.prisma.personalRecord.findFirst({
      where: { userId, exerciseId },
      include: personalRecordInclude,
      orderBy: [{ weight: "desc" }, { reps: "desc" }, { achievedAt: "desc" }]
    });

    return record ? mapPersonalRecord(record) : null;
  }

  async createRecords(candidates: readonly PersonalRecordCandidate[]): Promise<readonly PersonalRecord[]> {
    const created: PersonalRecord[] = [];

    for (const candidate of candidates) {
      const record = await this.prisma.personalRecord.upsert({
        where: { workoutSetId: candidate.workoutSetId },
        create: {
          userId: candidate.userId,
          exerciseId: candidate.exerciseId,
          workoutSessionId: candidate.workoutSessionId,
          workoutSetId: candidate.workoutSetId,
          weight: candidate.weight,
          reps: candidate.reps,
          achievedAt: new Date(candidate.achievedAt)
        },
        update: {},
        include: personalRecordInclude
      });

      created.push(mapPersonalRecord(record));
    }

    return created;
  }
}

const personalRecordInclude = {
  exercise: true
} as const;

type PrismaPersonalRecord = {
  id: string;
  userId: string;
  exerciseId: string;
  workoutSessionId: string;
  workoutSetId: string;
  weight: { toNumber(): number };
  reps: number;
  achievedAt: Date;
  createdAt: Date;
  exercise: { name: string };
};

function mapPersonalRecord(record: PrismaPersonalRecord): PersonalRecord {
  return {
    id: record.id,
    userId: record.userId,
    exerciseId: record.exerciseId,
    exerciseName: record.exercise.name,
    workoutSessionId: record.workoutSessionId,
    workoutSetId: record.workoutSetId,
    weight: record.weight.toNumber(),
    reps: record.reps,
    achievedAt: record.achievedAt.toISOString(),
    createdAt: record.createdAt.toISOString()
  };
}
