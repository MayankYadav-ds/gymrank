import 'package:flutter/material.dart';

import '../exercises/exercise_sample_catalog.dart';

class ExercisePickerScreen extends StatelessWidget {
  const ExercisePickerScreen({super.key});

  static const routeName = '/workouts/exercise-picker';

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Choose exercise')),
      body: SafeArea(
        child: ListView.separated(
          padding: const EdgeInsets.all(16),
          itemBuilder: (context, index) {
            final exercise = sampleExercises[index];
            return ListTile(
              title: Text(exercise.name),
              subtitle: Text(exercise.equipment),
              onTap: () => Navigator.of(context).pop(exercise.id),
            );
          },
          separatorBuilder: (_, __) => const Divider(),
          itemCount: sampleExercises.length,
        ),
      ),
    );
  }
}
