import 'exercise_models.dart';

const _chest = MuscleSummary(id: 'chest', name: 'Chest', region: 'front');
const _frontDelts = MuscleSummary(id: 'front_delts', name: 'Front Delts', region: 'front');
const _sideDelts = MuscleSummary(id: 'side_delts', name: 'Side Delts', region: 'front');
const _triceps = MuscleSummary(id: 'triceps', name: 'Triceps', region: 'front');
const _lats = MuscleSummary(id: 'lats', name: 'Lats', region: 'back');
const _upperBack = MuscleSummary(id: 'upper_back', name: 'Upper Back', region: 'back');
const _spinalErectors =
    MuscleSummary(id: 'spinal_erectors', name: 'Spinal Erectors', region: 'back');
const _abs = MuscleSummary(id: 'abs', name: 'Abs', region: 'front');
const _glutes = MuscleSummary(id: 'glutes', name: 'Glutes', region: 'back');
const _quads = MuscleSummary(id: 'quads', name: 'Quads', region: 'front');
const _hamstrings = MuscleSummary(id: 'hamstrings', name: 'Hamstrings', region: 'back');
const _biceps = MuscleSummary(id: 'biceps', name: 'Biceps', region: 'front');

const sampleExercises = <ExerciseSummary>[
  ExerciseSummary(
    id: 'bench_press',
    name: 'Bench Press',
    equipment: 'barbell',
    difficulty: 'intermediate',
    isTrackedLift: true,
    primaryMuscles: [_chest],
    secondaryMuscles: [_frontDelts, _triceps],
  ),
  ExerciseSummary(
    id: 'squat',
    name: 'Squat',
    equipment: 'barbell',
    difficulty: 'intermediate',
    isTrackedLift: true,
    primaryMuscles: [_quads, _glutes],
    secondaryMuscles: [_hamstrings, _abs, _spinalErectors],
  ),
  ExerciseSummary(
    id: 'deadlift',
    name: 'Deadlift',
    equipment: 'barbell',
    difficulty: 'advanced',
    isTrackedLift: true,
    primaryMuscles: [_glutes, _hamstrings, _spinalErectors],
    secondaryMuscles: [_upperBack, _lats, _quads],
  ),
  ExerciseSummary(
    id: 'overhead_press',
    name: 'Overhead Press',
    equipment: 'barbell',
    difficulty: 'intermediate',
    isTrackedLift: true,
    primaryMuscles: [_frontDelts, _sideDelts],
    secondaryMuscles: [_triceps, _upperBack, _abs],
  ),
  ExerciseSummary(
    id: 'pull_up_weighted_pull_up',
    name: 'Pull-Up / Weighted Pull-Up',
    equipment: 'bodyweight',
    difficulty: 'intermediate',
    isTrackedLift: true,
    primaryMuscles: [_lats, _upperBack],
    secondaryMuscles: [_biceps, _abs],
  ),
];

ExerciseSummary? findSampleExercise(String? id) {
  if (id == null) {
    return null;
  }

  for (final exercise in sampleExercises) {
    if (exercise.id == id) {
      return exercise;
    }
  }

  return null;
}
