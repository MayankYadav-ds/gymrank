import 'package:flutter/material.dart';

import 'navigation/app_shell.dart';
import 'theme/gymrank_theme.dart';
import '../features/auth_profile/login_screen.dart';
import '../features/auth_profile/profile_setup_screen.dart';
import '../features/auth_profile/register_screen.dart';
import '../features/exercises/exercise_detail_screen.dart';
import '../features/exercises/exercise_library_screen.dart';
import '../features/workouts/add_set_screen.dart';
import '../features/workouts/create_workout_screen.dart';
import '../features/workouts/exercise_picker_screen.dart';
import '../features/workouts/workout_detail_screen.dart';
import '../features/workouts/workout_history_screen.dart';
import '../features/overload/recommendation_detail_screen.dart';
import '../features/overload/recommendations_screen.dart';

class GymRankApp extends StatelessWidget {
  const GymRankApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'GymRank',
      debugShowCheckedModeBanner: false,
      theme: GymRankTheme.dark,
      routes: {
        LoginScreen.routeName: (_) => const LoginScreen(),
        RegisterScreen.routeName: (_) => const RegisterScreen(),
        ProfileSetupScreen.routeName: (_) => const ProfileSetupScreen(),
        ExerciseLibraryScreen.routeName: (_) => const ExerciseLibraryScreen(),
        ExerciseDetailScreen.routeName: (_) => const ExerciseDetailScreen(),
        WorkoutHistoryScreen.routeName: (_) => const WorkoutHistoryScreen(),
        WorkoutDetailScreen.routeName: (_) => const WorkoutDetailScreen(),
        CreateWorkoutScreen.routeName: (_) => const CreateWorkoutScreen(),
        ExercisePickerScreen.routeName: (_) => const ExercisePickerScreen(),
        AddSetScreen.routeName: (_) => const AddSetScreen(),
        RecommendationsScreen.routeName: (_) => const RecommendationsScreen(),
        RecommendationDetailScreen.routeName: (_) => const RecommendationDetailScreen(),
      },
      home: const AppShell(),
    );
  }
}
