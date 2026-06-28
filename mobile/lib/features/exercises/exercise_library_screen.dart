import 'package:flutter/material.dart';

import 'exercise_detail_screen.dart';
import 'exercise_models.dart';
import 'exercise_sample_catalog.dart';

class ExerciseLibraryScreen extends StatelessWidget {
  const ExerciseLibraryScreen({super.key});

  static const routeName = '/exercises';

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Exercises')),
      body: SafeArea(
        child: ListView.separated(
          padding: const EdgeInsets.all(16),
          itemBuilder: (context, index) {
            final exercise = sampleExercises[index];
            return _ExerciseTile(exercise: exercise);
          },
          separatorBuilder: (_, __) => const SizedBox(height: 8),
          itemCount: sampleExercises.length,
        ),
      ),
    );
  }
}

class _ExerciseTile extends StatelessWidget {
  const _ExerciseTile({required this.exercise});

  final ExerciseSummary exercise;

  @override
  Widget build(BuildContext context) {
    final colorScheme = Theme.of(context).colorScheme;
    final primaryMuscles = exercise.primaryMuscles.map((muscle) => muscle.name).join(', ');

    return ListTile(
      shape: RoundedRectangleBorder(
        side: BorderSide(color: colorScheme.outline),
        borderRadius: BorderRadius.circular(8),
      ),
      title: Text(exercise.name),
      subtitle: Text(primaryMuscles),
      trailing: exercise.isTrackedLift ? const Icon(Icons.leaderboard_outlined) : null,
      onTap: () => Navigator.of(context).pushNamed(
        ExerciseDetailScreen.routeName,
        arguments: exercise.id,
      ),
    );
  }
}
