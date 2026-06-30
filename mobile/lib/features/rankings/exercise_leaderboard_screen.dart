import 'package:flutter/material.dart';

import 'nearby_ranking_list.dart';
import 'ranking_repository.dart';
import 'ranking_service.dart';

class ExerciseLeaderboardScreen extends StatelessWidget {
  const ExerciseLeaderboardScreen({super.key});

  static const routeName = '/rankings/exercise';
  static const _service = RankingService(MockRankingRepository());

  @override
  Widget build(BuildContext context) {
    final exerciseId = ModalRoute.of(context)?.settings.arguments as String? ?? 'bench_press';

    return Scaffold(
      appBar: AppBar(title: const Text('Leaderboard')),
      body: SafeArea(
        child: FutureBuilder(
          future: _service.findLeaderboard(exerciseId),
          builder: (context, snapshot) {
            final entries = snapshot.data ?? [];

            return ListView(
              padding: const EdgeInsets.all(16),
              children: [
                NearbyRankingList(entries: entries),
              ],
            );
          },
        ),
      ),
    );
  }
}
