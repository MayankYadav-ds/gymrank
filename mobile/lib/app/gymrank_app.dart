import 'package:flutter/material.dart';

import 'navigation/app_shell.dart';
import 'theme/gymrank_theme.dart';
import '../features/auth_profile/login_screen.dart';
import '../features/auth_profile/profile_setup_screen.dart';
import '../features/auth_profile/register_screen.dart';
import '../features/analytics/analytics_dashboard_screen.dart';
import '../features/analytics/bodyweight_screen.dart';
import '../features/analytics/consistency_screen.dart';
import '../features/analytics/muscle_distribution_screen.dart';
import '../features/analytics/strength_progress_screen.dart';
import '../features/analytics/volume_screen.dart';
import '../features/exercises/exercise_detail_screen.dart';
import '../features/exercises/exercise_library_screen.dart';
import '../features/workouts/add_set_screen.dart';
import '../features/workouts/create_workout_screen.dart';
import '../features/workouts/exercise_picker_screen.dart';
import '../features/workouts/workout_detail_screen.dart';
import '../features/workouts/workout_history_screen.dart';
import '../features/overload/recommendation_detail_screen.dart';
import '../features/overload/recommendations_screen.dart';
import '../features/rankings/exercise_leaderboard_screen.dart';
import '../features/rankings/leaderboard_screen.dart';
import '../features/rankings/my_rank_screen.dart';

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
        AnalyticsDashboardScreen.routeName: (_) => const AnalyticsDashboardScreen(),
        StrengthProgressScreen.routeName: (_) => const StrengthProgressScreen(),
        VolumeScreen.routeName: (_) => const VolumeScreen(),
        ConsistencyScreen.routeName: (_) => const ConsistencyScreen(),
        BodyweightScreen.routeName: (_) => const BodyweightScreen(),
        MuscleDistributionScreen.routeName: (_) => const MuscleDistributionScreen(),
        ExerciseLibraryScreen.routeName: (_) => const ExerciseLibraryScreen(),
        ExerciseDetailScreen.routeName: (_) => const ExerciseDetailScreen(),
        WorkoutHistoryScreen.routeName: (_) => const WorkoutHistoryScreen(),
        WorkoutDetailScreen.routeName: (_) => const WorkoutDetailScreen(),
        CreateWorkoutScreen.routeName: (_) => const CreateWorkoutScreen(),
        ExercisePickerScreen.routeName: (_) => const ExercisePickerScreen(),
        AddSetScreen.routeName: (_) => const AddSetScreen(),
        RecommendationsScreen.routeName: (_) => const RecommendationsScreen(),
        RecommendationDetailScreen.routeName: (_) => const RecommendationDetailScreen(),
        LeaderboardScreen.routeName: (_) => const LeaderboardScreen(),
        ExerciseLeaderboardScreen.routeName: (_) => const ExerciseLeaderboardScreen(),
        MyRankScreen.routeName: (_) => const MyRankScreen(),
      },
      home: const AppShell(),
    );
  }
}
