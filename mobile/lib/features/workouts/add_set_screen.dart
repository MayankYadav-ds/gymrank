import 'package:flutter/material.dart';

class AddSetScreen extends StatelessWidget {
  const AddSetScreen({super.key});

  static const routeName = '/workouts/set';

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Set')),
      body: const SafeArea(
        child: Padding(
          padding: EdgeInsets.all(24),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              TextField(
                decoration: InputDecoration(labelText: 'Weight'),
                keyboardType: TextInputType.number,
              ),
              SizedBox(height: 16),
              TextField(
                decoration: InputDecoration(labelText: 'Reps'),
                keyboardType: TextInputType.number,
              ),
              SizedBox(height: 16),
              DropdownMenu<String>(
                enabled: false,
                initialSelection: 'normal',
                dropdownMenuEntries: [
                  DropdownMenuEntry(value: 'normal', label: 'Normal'),
                  DropdownMenuEntry(value: 'warm_up', label: 'Warm-up'),
                  DropdownMenuEntry(value: 'drop_set', label: 'Drop Set'),
                  DropdownMenuEntry(value: 'failure', label: 'Failure'),
                ],
              ),
              SizedBox(height: 24),
              FilledButton(
                onPressed: null,
                child: Text('Save set'),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
