import 'package:flutter/material.dart';

import 'exercise_picker_screen.dart';
import 'workout_detail_screen.dart';
import 'workout_repository.dart';
import 'workout_service.dart';

class CreateWorkoutScreen extends StatefulWidget {
  const CreateWorkoutScreen({super.key});

  static const routeName = '/workouts/create';

  @override
  State<CreateWorkoutScreen> createState() => _CreateWorkoutScreenState();
}

class _CreateWorkoutScreenState extends State<CreateWorkoutScreen> {
  static const _service = WorkoutService(ApiWorkoutRepository());
  var _loading = false;
  String? _error;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Create workout')),
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('Start a session and add exercises from the library.', style: Theme.of(context).textTheme.titleMedium),
              if (_error != null) ...[
                const SizedBox(height: 16),
                Text(_error!, style: TextStyle(color: Theme.of(context).colorScheme.error)),
              ],
              const SizedBox(height: 24),
              FilledButton.icon(
                onPressed: _loading ? null : _startWorkout,
                icon: const Icon(Icons.fitness_center),
                label: Text(_loading ? 'Starting...' : 'Start workout'),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Future<void> _startWorkout() async {
    setState(() {
      _loading = true;
      _error = null;
    });

    try {
      final workout = await _service.createWorkout();
      if (!mounted) return;
      final exerciseId = await Navigator.of(context).pushNamed<String>(ExercisePickerScreen.routeName);
      if (exerciseId != null) {
        await _service.addExercise(workout.id, exerciseId);
      }
      if (!mounted) return;
      Navigator.of(context).pushReplacementNamed(WorkoutDetailScreen.routeName, arguments: workout.id);
    } catch (error) {
      setState(() => _error = error.toString());
    } finally {
      if (mounted) {
        setState(() => _loading = false);
      }
    }
  }
}
