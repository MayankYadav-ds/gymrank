import 'package:flutter/material.dart';

class RankingFilterBottomSheet extends StatelessWidget {
  const RankingFilterBottomSheet({super.key});

  @override
  Widget build(BuildContext context) {
    return SafeArea(
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Filters', style: Theme.of(context).textTheme.titleMedium),
            const SizedBox(height: 16),
            const Wrap(
              spacing: 8,
              runSpacing: 8,
              children: [
                Chip(label: Text('Global')),
                Chip(label: Text('Country')),
                Chip(label: Text('Sex/category')),
                Chip(label: Text('Bodyweight')),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
