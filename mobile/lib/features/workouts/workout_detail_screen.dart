import 'package:flutter/material.dart';

import '../../shared/widgets/async_state_view.dart';
import 'add_set_screen.dart';
import 'exercise_picker_screen.dart';
import 'workout_models.dart';
import 'workout_repository.dart';
import 'workout_service.dart';

class WorkoutDetailScreen extends StatefulWidget {
  const WorkoutDetailScreen({super.key});

  static const routeName = '/workouts/detail';

  @override
  State<WorkoutDetailScreen> createState() => _WorkoutDetailScreenState();
}

class _WorkoutDetailScreenState extends State<WorkoutDetailScreen> {
  static const _service = WorkoutService(ApiWorkoutRepository());
  Future<WorkoutSessionDraft?>? _future;

  @override
  Widget build(BuildContext context) {
    final workoutId = ModalRoute.of(context)?.settings.arguments as String?;
    _future ??= workoutId == null ? Future.value(null) : _service.findWorkout(workoutId);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Workout detail'),
        actions: [
          IconButton(
            onPressed: workoutId == null ? null : () => _finish(context, workoutId),
            icon: const Icon(Icons.check),
            tooltip: 'Finish workout',
          ),
          IconButton(
            onPressed: workoutId == null ? null : () => _confirmDelete(context, workoutId),
            icon: const Icon(Icons.delete_outline),
            tooltip: 'Delete workout',
          ),
        ],
      ),
      body: SafeArea(
        child: FutureBuilder<WorkoutSessionDraft?>(
          future: _future,
          builder: (context, snapshot) {
            return AsyncStateView<WorkoutSessionDraft?>(
              snapshot: snapshot,
              emptyMessage: 'Workout unavailable.',
              isEmpty: (workout) => workout == null,
              onRetry: () => _refresh(workoutId),
              builder: (context, workout) => RefreshIndicator(
                onRefresh: () async => _refresh(workoutId),
                child: ListView(
                  padding: const EdgeInsets.all(16),
                  children: [
                    Text(workout!.title, style: Theme.of(context).textTheme.headlineLarge),
                    const SizedBox(height: 8),
                    Text(workout.status),
                    const SizedBox(height: 16),
                    FilledButton.icon(
                      onPressed: () => _addExercise(workout.id),
                      icon: const Icon(Icons.add),
                      label: const Text('Add exercise'),
                    ),
                    const SizedBox(height: 24),
                    ...workout.exercises.map((exercise) => _WorkoutExercisePanel(
                          workoutId: workout.id,
                          exercise: exercise,
                          onChanged: () => _refresh(workoutId),
                        )),
                  ],
                ),
              ),
            );
          },
        ),
      ),
    );
  }

  void _refresh(String? workoutId) {
    setState(() => _future = workoutId == null ? Future.value(null) : _service.findWorkout(workoutId));
  }

  Future<void> _addExercise(String workoutId) async {
    final exerciseId = await Navigator.of(context).pushNamed<String>(ExercisePickerScreen.routeName);
    if (exerciseId == null) return;
    await _service.addExercise(workoutId, exerciseId);
    _refresh(workoutId);
  }

  Future<void> _finish(BuildContext context, String workoutId) async {
    try {
      await _service.finishWorkout(workoutId);
      _refresh(workoutId);
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Workout completed. PRs and achievements updated.')),
      );
    } catch (error) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(error.toString())));
    }
  }

  Future<void> _confirmDelete(BuildContext context, String workoutId) {
    return showDialog<void>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Delete workout?'),
        content: const Text('This removes the workout session and all logged sets.'),
        actions: [
          TextButton(onPressed: () => Navigator.of(context).pop(), child: const Text('Cancel')),
          FilledButton(
            onPressed: () async {
              await _service.deleteWorkout(workoutId);
              if (!context.mounted) return;
              Navigator.of(context).pop();
              Navigator.of(context).pop();
            },
            child: const Text('Delete'),
          ),
        ],
      ),
    );
  }
}

class _WorkoutExercisePanel extends StatelessWidget {
  const _WorkoutExercisePanel({
    required this.workoutId,
    required this.exercise,
    required this.onChanged,
  });

  final String workoutId;
  final WorkoutExerciseDraft exercise;
  final VoidCallback onChanged;

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
                )),
            TextButton.icon(
              onPressed: () async {
                final changed = await Navigator.of(context).pushNamed<bool>(
                  AddSetScreen.routeName,
                  arguments: AddSetArgs(
                    workoutId: workoutId,
                    workoutExerciseId: exercise.id,
                  ),
                );
                if (changed == true) {
                  onChanged();
                }
              },
              icon: const Icon(Icons.add),
              label: const Text('Add set'),
            ),
          ],
        ),
      ),
    );
  }
}
