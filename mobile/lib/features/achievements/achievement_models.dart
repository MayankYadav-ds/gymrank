class AchievementSummary {
  const AchievementSummary({
    required this.id,
    required this.title,
    required this.description,
    required this.category,
    required this.icon,
    required this.rarity,
    required this.unlocked,
    required this.progressPercent,
  });

  final String id;
  final String title;
  final String description;
  final String category;
  final String icon;
  final String rarity;
  final bool unlocked;
  final double progressPercent;
}
