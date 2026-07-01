import 'achievement_models.dart';

abstract class AchievementRepository {
  Future<List<AchievementSummary>> findAchievements();

  Future<AchievementSummary> findAchievement(String id);
}

class MockAchievementRepository implements AchievementRepository {
  const MockAchievementRepository();

  @override
  Future<List<AchievementSummary>> findAchievements() async {
    return sampleAchievements;
  }

  @override
  Future<AchievementSummary> findAchievement(String id) async {
    return sampleAchievements.firstWhere(
      (achievement) => achievement.id == id,
      orElse: () => sampleAchievements.first,
    );
  }
}

const sampleAchievements = <AchievementSummary>[
  AchievementSummary(
    id: 'first_workout',
    title: 'First Workout',
    description: 'Complete your first workout.',
    category: 'Workout',
    icon: 'fitness_center',
    rarity: 'Common',
    unlocked: true,
    progressPercent: 100,
  ),
  AchievementSummary(
    id: 'bench_100kg',
    title: '100 kg Bench',
    description: 'Bench press 100 kg.',
    category: 'Strength',
    icon: 'bolt',
    rarity: 'Rare',
    unlocked: true,
    progressPercent: 100,
  ),
  AchievementSummary(
    id: 'streak_7',
    title: '7-Day Streak',
    description: 'Train on 7 consecutive days.',
    category: 'Consistency',
    icon: 'local_fire_department',
    rarity: 'Uncommon',
    unlocked: false,
    progressPercent: 71,
  ),
];
