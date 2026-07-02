import 'package:flutter/material.dart';

import '../../shared/widgets/async_state_view.dart';
import '../exercises/exercise_models.dart';
import '../exercises/exercise_repository.dart';
import '../exercises/exercise_service.dart';

class ExercisePickerScreen extends StatefulWidget {
  const ExercisePickerScreen({super.key});

  static const routeName = '/workouts/exercise-picker';

  @override
  State<ExercisePickerScreen> createState() => _ExercisePickerScreenState();
}

class _ExercisePickerScreenState extends State<ExercisePickerScreen> {
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
      appBar: AppBar(title: const Text('Choose exercise')),
      body: SafeArea(
        child: FutureBuilder<List<ExerciseSummary>>(
          future: _future,
          builder: (context, snapshot) {
            return AsyncStateView<List<ExerciseSummary>>(
              snapshot: snapshot,
              emptyMessage: 'No exercises available.',
              isEmpty: (exercises) => exercises.isEmpty,
              onRetry: _refresh,
              builder: (context, exercises) => RefreshIndicator(
                onRefresh: () async => _refresh(),
                child: ListView.separated(
                  padding: const EdgeInsets.all(16),
                  itemBuilder: (context, index) {
                    final exercise = exercises[index];
                    return ListTile(
                      title: Text(exercise.name),
                      subtitle: Text(exercise.equipment),
                      onTap: () => Navigator.of(context).pop(exercise.id),
                    );
                  },
                  separatorBuilder: (_, __) => const Divider(),
                  itemCount: exercises.length,
                ),
              ),
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
