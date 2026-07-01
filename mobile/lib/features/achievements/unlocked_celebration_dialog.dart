import 'package:flutter/material.dart';

class UnlockedCelebrationDialog extends StatelessWidget {
  const UnlockedCelebrationDialog({
    required this.title,
    super.key,
  });

  final String title;

  @override
  Widget build(BuildContext context) {
    return AlertDialog(
      title: const Text('Achievement Unlocked'),
      content: Text(title),
      actions: [
        TextButton(
          onPressed: () => Navigator.of(context).pop(),
          child: const Text('Close'),
        ),
      ],
    );
  }
}
