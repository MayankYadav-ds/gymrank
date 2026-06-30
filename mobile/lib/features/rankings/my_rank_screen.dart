import 'package:flutter/material.dart';

import 'ranking_card.dart';
import 'ranking_repository.dart';
import 'ranking_service.dart';

class MyRankScreen extends StatelessWidget {
  const MyRankScreen({super.key});

  static const routeName = '/rankings/me';
  static const _service = RankingService(MockRankingRepository());

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('My rank')),
      body: SafeArea(
        child: FutureBuilder(
          future: _service.findMyRanks(),
          builder: (context, snapshot) {
            final entries = snapshot.data ?? [];

            return ListView(
              padding: const EdgeInsets.all(16),
              children: entries.map((entry) => RankingCard(entry: entry)).toList(),
            );
          },
        ),
      ),
    );
  }
}
