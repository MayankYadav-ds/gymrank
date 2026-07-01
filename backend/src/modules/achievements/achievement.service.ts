import { AppError } from "../../shared/errors/app-error.js";
import { achievementDefinitions } from "./achievement.definitions.js";
import type { AchievementRepository } from "./achievement.repository.js";
import type { Achievement, AchievementProgress, UserAchievement } from "./achievement.types.js";

export class AchievementService {
  constructor(private readonly repository: AchievementRepository) {}

  async findAll(userId: string): Promise<readonly AchievementProgress[]> {
    await this.ensureDefinitionsAndUnlock(userId);
    return this.getProgress(userId);
  }

  async findUnlocked(userId: string): Promise<readonly UserAchievement[]> {
    await this.ensureDefinitionsAndUnlock(userId);
    return this.repository.findUnlockedByUser(userId);
  }

  async getProgress(userId: string): Promise<readonly AchievementProgress[]> {
    await this.repository.ensureDefinitions(achievementDefinitions);
    const [achievements, unlocked, source] = await Promise.all([
      this.repository.findAll(),
      this.repository.findUnlockedByUser(userId),
      this.repository.getEvaluationSource(userId)
    ]);
    const unlockedByAchievementId = new Map(unlocked.map((item) => [item.achievementId, item]));

    return achievementDefinitions.map((definition) => {
      const achievement = achievements.find((item) => item.id === definition.id) ?? toAchievement(definition);
      const userAchievement = unlockedByAchievementId.get(definition.id) ?? null;
      const currentValue = round(definition.evaluate(source));

      return {
        achievement,
        unlocked: Boolean(userAchievement),
        unlockedAt: userAchievement?.unlockedAt ?? null,
        currentValue,
        targetValue: definition.targetValue,
        progressPercent: calculateProgressPercent(currentValue, definition.targetValue)
      };
    });
  }

  async findDetail(userId: string, achievementId: string): Promise<AchievementProgress> {
    const progress = await this.findAll(userId);
    const achievement = progress.find((item) => item.achievement.id === achievementId);

    if (!achievement) {
      throw new AppError(404, "achievement_not_found", "Achievement was not found.");
    }

    return achievement;
  }

  async ensureDefinitionsAndUnlock(userId: string): Promise<readonly UserAchievement[]> {
    await this.repository.ensureDefinitions(achievementDefinitions);
    const [unlocked, source] = await Promise.all([
      this.repository.findUnlockedByUser(userId),
      this.repository.getEvaluationSource(userId)
    ]);
    const alreadyUnlocked = new Set(unlocked.map((item) => item.achievementId));
    const newlyUnlocked = achievementDefinitions
      .filter((definition) => !alreadyUnlocked.has(definition.id))
      .filter((definition) => definition.evaluate(source) >= definition.targetValue)
      .map((definition) => definition.id);

    return this.repository.unlockMany(userId, newlyUnlocked);
  }
}

function toAchievement(definition: (typeof achievementDefinitions)[number]): Achievement {
  return {
    id: definition.id,
    code: definition.code,
    title: definition.title,
    description: definition.description,
    category: definition.category,
    icon: definition.icon,
    rarity: definition.rarity,
    hidden: definition.hidden,
    createdAt: new Date(0).toISOString()
  };
}

function calculateProgressPercent(currentValue: number, targetValue: number): number {
  if (targetValue <= 0) {
    return currentValue > 0 ? 100 : 0;
  }

  return Math.min(100, round((currentValue / targetValue) * 100));
}

function round(value: number): number {
  return Math.round(value * 100) / 100;
}
