import 'package:flutter/material.dart';

import 'add_set_screen.dart';
import 'workout_models.dart';
import 'workout_repository.dart';
import 'workout_service.dart';

class WorkoutDetailScreen extends StatelessWidget {
  const WorkoutDetailScreen({super.key});

  static const routeName = '/workouts/detail';
  static const _service = WorkoutService(MockWorkoutRepository());

  @override
  Widget build(BuildContext context) {
    final workoutId = ModalRoute.of(context)?.settings.arguments as String?;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Workout detail'),
        actions: [
          IconButton(
            onPressed: () => _confirmDelete(context),
            icon: const Icon(Icons.delete_outline),
            tooltip: 'Delete workout',
          ),
        ],
      ),
      body: SafeArea(
        child: FutureBuilder<WorkoutSessionDraft?>(
          future: workoutId == null ? Future.value(null) : _service.findWorkout(workoutId),
          builder: (context, snapshot) {
            final workout = snapshot.data;

            if (workout == null) {
              return const Center(child: Text('Workout unavailable'));
            }

            return ListView(
              padding: const EdgeInsets.all(16),
              children: [
                Text(workout.title, style: Theme.of(context).textTheme.headlineLarge),
                const SizedBox(height: 8),
                Text(workout.status),
                const SizedBox(height: 24),
                ...workout.exercises.map((exercise) => _WorkoutExercisePanel(exercise: exercise)),
              ],
            );
          },
        ),
      ),
    );
  }

  Future<void> _confirmDelete(BuildContext context) {
    return showDialog<void>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Delete workout?'),
        content: const Text('This removes the workout session and all logged sets.'),
        actions: [
          TextButton(onPressed: () => Navigator.of(context).pop(), child: const Text('Cancel')),
          FilledButton(onPressed: () => Navigator.of(context).pop(), child: const Text('Delete')),
        ],
      ),
    );
  }
}

class _WorkoutExercisePanel extends StatelessWidget {
  const _WorkoutExercisePanel({required this.exercise});

  final WorkoutExerciseDraft exercise;

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(12),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(exercise.exerciseName, style: Theme.of(context).textTheme.titleMedium),
            if (exercise.notes != null) Text(exercise.notes!),
            const SizedBox(height: 12),
            ...exercise.sets.map((set) => ListTile(
                  contentPadding: EdgeInsets.zero,
                  title: Text('${set.weight} x ${set.reps}'),
                  subtitle: Text(set.type),
                  trailing: Icon(set.completed ? Icons.check_circle : Icons.circle_outlined),
                  onTap: () => Navigator.of(context).pushNamed(AddSetScreen.routeName),
                )),
            TextButton.icon(
              onPressed: () => Navigator.of(context).pushNamed(AddSetScreen.routeName),
              icon: const Icon(Icons.add),
              label: const Text('Add set'),
            ),
          ],
        ),
      ),
    );
  }
}
