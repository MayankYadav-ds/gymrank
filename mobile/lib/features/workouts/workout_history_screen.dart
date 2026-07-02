import 'package:flutter/material.dart';

import '../../shared/widgets/async_state_view.dart';
import 'create_workout_screen.dart';
import 'workout_detail_screen.dart';
import 'workout_models.dart';
import 'workout_repository.dart';
import 'workout_service.dart';

class WorkoutHistoryScreen extends StatefulWidget {
  const WorkoutHistoryScreen({super.key});

  static const routeName = '/workouts';

  @override
  State<WorkoutHistoryScreen> createState() => _WorkoutHistoryScreenState();
}

class _WorkoutHistoryScreenState extends State<WorkoutHistoryScreen> {
  static const _service = WorkoutService(ApiWorkoutRepository());
  late Future<List<WorkoutSessionDraft>> _future;

  @override
  void initState() {
    super.initState();
    _future = _service.findHistory();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Workouts'),
        actions: [
          IconButton(
            onPressed: () async {
              await Navigator.of(context).pushNamed(CreateWorkoutScreen.routeName);
              _refresh();
            },
            icon: const Icon(Icons.add),
            tooltip: 'Create workout',
          ),
        ],
      ),
      body: SafeArea(
        child: FutureBuilder<List<WorkoutSessionDraft>>(
          future: _future,
          builder: (context, snapshot) {
            return AsyncStateView<List<WorkoutSessionDraft>>(
              snapshot: snapshot,
              emptyMessage: 'No workouts yet.',
              isEmpty: (workouts) => workouts.isEmpty,
              onRetry: _refresh,
              builder: (context, workouts) => RefreshIndicator(
                onRefresh: () async => _refresh(),
                child: ListView.separated(
                  padding: const EdgeInsets.all(16),
                  itemBuilder: (context, index) {
                    final workout = workouts[index];
                    return ListTile(
                      title: Text(workout.title),
                      subtitle: Text('${workout.exercises.length} exercises • ${workout.status}'),
                      trailing: const Icon(Icons.chevron_right),
                      onTap: () async {
                        await Navigator.of(context).pushNamed(WorkoutDetailScreen.routeName, arguments: workout.id);
                        _refresh();
                      },
                    );
                  },
                  separatorBuilder: (_, __) => const Divider(),
                  itemCount: workouts.length,
                ),
              ),
            );
          },
        ),
      ),
    );
  }

  void _refresh() {
    setState(() => _future = _service.findHistory());
  }
}
