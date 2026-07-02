import 'package:flutter/material.dart';

import 'workout_repository.dart';
import 'workout_service.dart';

class AddSetArgs {
  const AddSetArgs({
    required this.workoutId,
    required this.workoutExerciseId,
  });

  final String workoutId;
  final String workoutExerciseId;
}

class AddSetScreen extends StatefulWidget {
  const AddSetScreen({super.key});

  static const routeName = '/workouts/set';

  @override
  State<AddSetScreen> createState() => _AddSetScreenState();
}

class _AddSetScreenState extends State<AddSetScreen> {
  static const _service = WorkoutService(ApiWorkoutRepository());
  final _weightController = TextEditingController();
  final _repsController = TextEditingController();
  var _type = 'normal';
  var _loading = false;
  String? _error;

  @override
  void dispose() {
    _weightController.dispose();
    _repsController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final args = ModalRoute.of(context)?.settings.arguments as AddSetArgs?;

    return Scaffold(
      appBar: AppBar(title: const Text('Set')),
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              TextField(
                controller: _weightController,
                decoration: const InputDecoration(labelText: 'Weight'),
                keyboardType: TextInputType.number,
              ),
              const SizedBox(height: 16),
              TextField(
                controller: _repsController,
                decoration: const InputDecoration(labelText: 'Reps'),
                keyboardType: TextInputType.number,
              ),
              const SizedBox(height: 16),
              DropdownButtonFormField<String>(
                value: _type,
                items: const [
                  DropdownMenuItem(value: 'normal', child: Text('Normal')),
                  DropdownMenuItem(value: 'warm_up', child: Text('Warm-up')),
                  DropdownMenuItem(value: 'drop_set', child: Text('Drop Set')),
                  DropdownMenuItem(value: 'failure', child: Text('Failure')),
                ],
                onChanged: (value) => setState(() => _type = value ?? 'normal'),
                decoration: const InputDecoration(labelText: 'Set type'),
              ),
              if (_error != null) ...[
                const SizedBox(height: 16),
                Text(_error!, style: TextStyle(color: Theme.of(context).colorScheme.error)),
              ],
              const SizedBox(height: 24),
              FilledButton(
                onPressed: args == null || _loading ? null : () => _save(args),
                child: Text(_loading ? 'Saving...' : 'Save set'),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Future<void> _save(AddSetArgs args) async {
    final weight = double.tryParse(_weightController.text);
    final reps = int.tryParse(_repsController.text);

    if (weight == null || reps == null) {
      setState(() => _error = 'Enter valid weight and reps.');
      return;
    }

    setState(() {
      _loading = true;
      _error = null;
    });

    try {
      await _service.addSet(
        workoutId: args.workoutId,
        workoutExerciseId: args.workoutExerciseId,
        weight: weight,
        reps: reps,
        type: _type,
      );
      if (!mounted) return;
      Navigator.of(context).pop(true);
    } catch (error) {
      setState(() => _error = error.toString());
    } finally {
      if (mounted) {
        setState(() => _loading = false);
      }
    }
  }
}
