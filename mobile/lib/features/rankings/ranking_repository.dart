import 'ranking_models.dart';

abstract class RankingRepository {
  Future<List<RankingEntrySummary>> findLeaderboard(String exerciseId);

  Future<List<RankingEntrySummary>> findMyRanks();
}

class MockRankingRepository implements RankingRepository {
  const MockRankingRepository();

  @override
  Future<List<RankingEntrySummary>> findLeaderboard(String exerciseId) async {
    return sampleRankings;
  }

  @override
  Future<List<RankingEntrySummary>> findMyRanks() async {
    return sampleRankings.take(1).toList();
  }
}

const sampleRankings = <RankingEntrySummary>[
  RankingEntrySummary(
    rank: 1,
    displayName: 'Top Lifter',
    exerciseName: 'Bench Press',
    bestWeight: 140,
    bestReps: 3,
    percentile: 100,
  ),
  RankingEntrySummary(
    rank: 2,
    displayName: 'You',
    exerciseName: 'Bench Press',
    bestWeight: 120,
    bestReps: 5,
    percentile: 90,
  ),
];
