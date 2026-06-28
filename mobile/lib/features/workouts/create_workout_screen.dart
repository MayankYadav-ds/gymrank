import 'package:flutter/material.dart';

import 'exercise_picker_screen.dart';

class CreateWorkoutScreen extends StatelessWidget {
  const CreateWorkoutScreen({super.key});

  static const routeName = '/workouts/create';

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
              const TextField(decoration: InputDecoration(labelText: 'Workout title')),
              const SizedBox(height: 16),
              const TextField(decoration: InputDecoration(labelText: 'Notes')),
              const SizedBox(height: 24),
              FilledButton.icon(
                onPressed: () => Navigator.of(context).pushNamed(ExercisePickerScreen.routeName),
                icon: const Icon(Icons.fitness_center),
                label: const Text('Add exercise'),
              ),
              const SizedBox(height: 12),
              OutlinedButton.icon(
                onPressed: null,
                icon: const Icon(Icons.check),
                label: const Text('Start workout'),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
