import 'package:flutter/material.dart';

import 'ranking_card.dart';
import 'ranking_models.dart';

class NearbyRankingList extends StatelessWidget {
  const NearbyRankingList({
    required this.entries,
    super.key,
  });

  final List<RankingEntrySummary> entries;

  @override
  Widget build(BuildContext context) {
    return Column(
      children: entries.map((entry) => RankingCard(entry: entry)).toList(),
    );
  }
}
