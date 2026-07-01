import { PrismaClient } from "@prisma/client";

import { seedExercises, seedMuscles } from "./seed-data/exercise-seed-data.js";
import { validateExerciseSeedData } from "./seed-data/validate-exercise-seed-data.js";
import { achievementDefinitions } from "../src/modules/achievements/achievement.definitions.js";

const prisma = new PrismaClient();

export async function seedExerciseCatalog(client: PrismaClient): Promise<void> {
  validateExerciseSeedData(seedMuscles, seedExercises);

  await client.$transaction(async (transaction) => {
    for (const muscle of seedMuscles) {
      await transaction.muscle.upsert({
        where: { id: muscle.id },
        create: muscle,
        update: {
          name: muscle.name,
          region: muscle.region
        }
      });
    }

    for (const exercise of seedExercises) {
      await transaction.exercise.upsert({
        where: { id: exercise.id },
        create: {
          id: exercise.id,
          name: exercise.name,
          category: exercise.category,
          equipment: exercise.equipment,
          difficulty: exercise.difficulty,
          isTrackedLift: exercise.isTrackedLift,
          trackedLiftId: exercise.trackedLiftId
        },
        update: {
          name: exercise.name,
          category: exercise.category,
          equipment: exercise.equipment,
          difficulty: exercise.difficulty,
          isTrackedLift: exercise.isTrackedLift,
          trackedLiftId: exercise.trackedLiftId
        }
      });

      await transaction.exerciseMuscle.deleteMany({
        where: { exerciseId: exercise.id }
      });

      await transaction.exerciseMuscle.createMany({
        data: exercise.muscles.map((muscle) => ({
          exerciseId: exercise.id,
          muscleId: muscle.muscleId,
          role: muscle.role
        })),
        skipDuplicates: true
      });
    }
  });
}

export async function seedAchievements(client: PrismaClient): Promise<void> {
  await client.$transaction(
    achievementDefinitions.map((achievement) =>
      client.achievement.upsert({
        where: { code: achievement.code },
        create: {
          id: achievement.id,
          code: achievement.code,
          title: achievement.title,
          description: achievement.description,
          category: achievement.category,
          icon: achievement.icon,
          rarity: achievement.rarity,
          hidden: achievement.hidden
        },
        update: {
          title: achievement.title,
          description: achievement.description,
          category: achievement.category,
          icon: achievement.icon,
          rarity: achievement.rarity,
          hidden: achievement.hidden
        }
      })
    )
  );
}

async function main(): Promise<void> {
  await seedExerciseCatalog(prisma);
  await seedAchievements(prisma);
  console.log(
    `Seeded ${seedMuscles.length} muscles, ${seedExercises.length} exercises, and ${achievementDefinitions.length} achievements.`
  );
}

if (import.meta.url === `file://${process.argv[1]?.replace(/\\/g, "/")}`) {
  main()
    .catch((error: unknown) => {
      console.error(error);
      process.exitCode = 1;
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
