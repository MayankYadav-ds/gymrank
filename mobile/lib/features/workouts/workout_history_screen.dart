import 'package:flutter/material.dart';

import 'create_workout_screen.dart';
import 'workout_detail_screen.dart';
import 'workout_models.dart';
import 'workout_repository.dart';
import 'workout_service.dart';

class WorkoutHistoryScreen extends StatelessWidget {
  const WorkoutHistoryScreen({super.key});

  static const routeName = '/workouts';
  static const _service = WorkoutService(MockWorkoutRepository());

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Workouts'),
        actions: [
          IconButton(
            onPressed: () => Navigator.of(context).pushNamed(CreateWorkoutScreen.routeName),
            icon: const Icon(Icons.add),
            tooltip: 'Create workout',
          ),
        ],
      ),
      body: SafeArea(
        child: FutureBuilder<List<WorkoutSessionDraft>>(
          future: _service.findHistory(),
          builder: (context, snapshot) {
            final workouts = snapshot.data ?? const <WorkoutSessionDraft>[];

            return ListView.separated(
              padding: const EdgeInsets.all(16),
              itemBuilder: (context, index) {
                final workout = workouts[index];
                return ListTile(
                  title: Text(workout.title),
                  subtitle: Text('${workout.exercises.length} exercises'),
                  trailing: const Icon(Icons.chevron_right),
                  onTap: () => Navigator.of(context).pushNamed(
                    WorkoutDetailScreen.routeName,
                    arguments: workout.id,
                  ),
                );
              },
              separatorBuilder: (_, __) => const Divider(),
              itemCount: workouts.length,
            );
          },
        ),
      ),
    );
  }
}
