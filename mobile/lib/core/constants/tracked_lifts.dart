enum TrackedLift {
  benchPress('bench_press', 'Bench Press'),
  squat('squat', 'Squat'),
  deadlift('deadlift', 'Deadlift'),
  overheadPress('overhead_press', 'Overhead Press'),
  pullUpWeightedPullUp('pull_up_weighted_pull_up', 'Pull-Up / Weighted Pull-Up');

  const TrackedLift(this.id, this.label);

  final String id;
  final String label;
}

const trackedLiftIds = <String>{
  'bench_press',
  'squat',
  'deadlift',
  'overhead_press',
  'pull_up_weighted_pull_up',
};

bool isTrackedLiftId(String value) => trackedLiftIds.contains(value);
