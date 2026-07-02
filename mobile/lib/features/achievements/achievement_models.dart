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

  factory AchievementSummary.fromProgressJson(Map<String, dynamic> json) {
    final achievement = json['achievement'] as Map<String, dynamic>? ?? const {};

    return AchievementSummary(
      id: achievement['id'] as String? ?? '',
      title: achievement['title'] as String? ?? 'Achievement',
      description: achievement['description'] as String? ?? '',
      category: achievement['category'] as String? ?? '',
      icon: achievement['icon'] as String? ?? '',
      rarity: achievement['rarity'] as String? ?? '',
      unlocked: json['unlocked'] as bool? ?? false,
      progressPercent: (json['progressPercent'] as num?)?.toDouble() ?? 0,
    );
  }

  factory AchievementSummary.fromUnlockedJson(Map<String, dynamic> json) {
    return AchievementSummary.fromProgressJson({
      'achievement': json['achievement'],
      'unlocked': true,
      'progressPercent': 100,
    });
  }
}
