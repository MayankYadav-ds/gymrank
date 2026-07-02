import 'package:flutter/material.dart';

import '../../shared/widgets/async_state_view.dart';
import 'exercise_detail_screen.dart';
import 'exercise_models.dart';
import 'exercise_repository.dart';
import 'exercise_service.dart';

class ExerciseLibraryScreen extends StatefulWidget {
  const ExerciseLibraryScreen({super.key});

  static const routeName = '/exercises';

  @override
  State<ExerciseLibraryScreen> createState() => _ExerciseLibraryScreenState();
}

class _ExerciseLibraryScreenState extends State<ExerciseLibraryScreen> {
  static const _service = ExerciseService(ApiExerciseRepository());
  late Future<List<ExerciseSummary>> _future;

  @override
  void initState() {
    super.initState();
    _future = _service.listExercises();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Exercises')),
      body: SafeArea(
        child: FutureBuilder<List<ExerciseSummary>>(
          future: _future,
          builder: (context, snapshot) {
            return AsyncStateView<List<ExerciseSummary>>(
              snapshot: snapshot,
              emptyMessage: 'No exercises available yet.',
              isEmpty: (exercises) => exercises.isEmpty,
              onRetry: _refresh,
              builder: (context, exercises) {
                return RefreshIndicator(
                  onRefresh: () async => _refresh(),
                  child: ListView.separated(
                    padding: const EdgeInsets.all(16),
                    itemBuilder: (context, index) {
                      final exercise = exercises[index];
                      return _ExerciseTile(exercise: exercise);
                    },
                    separatorBuilder: (_, __) => const SizedBox(height: 8),
                    itemCount: exercises.length,
                  ),
                );
              },
            );
          },
        ),
      ),
    );
  }

  void _refresh() {
    setState(() => _future = _service.listExercises());
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
      subtitle: Text(primaryMuscles.isEmpty ? exercise.equipment : primaryMuscles),
      trailing: exercise.isTrackedLift ? const Icon(Icons.leaderboard_outlined) : null,
      onTap: () => Navigator.of(context).pushNamed(
        ExerciseDetailScreen.routeName,
        arguments: exercise.id,
      ),
    );
  }
}
