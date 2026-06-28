import 'package:flutter/material.dart';

import 'exercise_models.dart';
import 'exercise_sample_catalog.dart';

class ExerciseDetailScreen extends StatelessWidget {
  const ExerciseDetailScreen({super.key});

  static const routeName = '/exercises/detail';

  @override
  Widget build(BuildContext context) {
    final exerciseId = ModalRoute.of(context)?.settings.arguments as String?;
    final exercise = findSampleExercise(exerciseId) ?? sampleExercises.first;

    return Scaffold(
      appBar: AppBar(title: Text(exercise.name)),
      body: SafeArea(
        child: ListView(
          padding: const EdgeInsets.all(24),
          children: [
            _MetadataRow(exercise: exercise),
            const SizedBox(height: 24),
            _MuscleSection(
              title: 'Primary muscles',
              muscles: exercise.primaryMuscles,
            ),
            const SizedBox(height: 16),
            _MuscleSection(
              title: 'Secondary muscles',
              muscles: exercise.secondaryMuscles,
            ),
            const SizedBox(height: 24),
            _AnatomyPlaceholder(exercise: exercise),
          ],
        ),
      ),
    );
  }
}

class _MetadataRow extends StatelessWidget {
  const _MetadataRow({required this.exercise});

  final ExerciseSummary exercise;

  @override
  Widget build(BuildContext context) {
    final labels = [
      exercise.equipment,
      exercise.difficulty,
      if (exercise.isTrackedLift) 'Ranking lift',
    ];

    return Wrap(
      spacing: 8,
      runSpacing: 8,
      children: labels.map((label) => Chip(label: Text(label))).toList(),
    );
  }
}

class _MuscleSection extends StatelessWidget {
  const _MuscleSection({
    required this.title,
    required this.muscles,
  });

  final String title;
  final List<MuscleSummary> muscles;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(title, style: Theme.of(context).textTheme.titleMedium),
        const SizedBox(height: 8),
        Wrap(
          spacing: 8,
          runSpacing: 8,
          children: muscles.map((muscle) => Chip(label: Text(muscle.name))).toList(),
        ),
      ],
    );
  }
}

class _AnatomyPlaceholder extends StatelessWidget {
  const _AnatomyPlaceholder({required this.exercise});

  final ExerciseSummary exercise;

  @override
  Widget build(BuildContext context) {
    final front = exercise.highlightedFrontMuscles.map((muscle) => muscle.name).join(', ');
    final back = exercise.highlightedBackMuscles.map((muscle) => muscle.name).join(', ');

    return DecoratedBox(
      decoration: BoxDecoration(
        border: Border.all(color: Theme.of(context).colorScheme.outline),
        borderRadius: BorderRadius.circular(8),
      ),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Exercise muscle highlights', style: Theme.of(context).textTheme.titleMedium),
            const SizedBox(height: 12),
            Text('Front: ${front.isEmpty ? 'None' : front}'),
            const SizedBox(height: 8),
            Text('Back: ${back.isEmpty ? 'None' : back}'),
          ],
        ),
      ),
    );
  }
}
