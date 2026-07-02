class UserProfile {
  const UserProfile({
    required this.id,
    required this.email,
    required this.displayName,
    required this.unitPreference,
    required this.rankingParticipationEnabled,
    this.country,
    this.dateOfBirth,
    this.sexCategory,
    this.bodyweight,
  });

  final String id;
  final String email;
  final String displayName;
  final String? country;
  final String unitPreference;
  final String? dateOfBirth;
  final String? sexCategory;
  final double? bodyweight;
  final bool rankingParticipationEnabled;

  factory UserProfile.fromJson(Map<String, dynamic> json) {
    return UserProfile(
      id: json['id'] as String,
      email: json['email'] as String,
      displayName: json['displayName'] as String,
      country: json['country'] as String?,
      unitPreference: json['unitPreference'] as String? ?? 'kg',
      dateOfBirth: json['dateOfBirth'] as String?,
      sexCategory: json['sexCategory'] as String?,
      bodyweight: (json['bodyweight'] as num?)?.toDouble(),
      rankingParticipationEnabled: json['rankingParticipationEnabled'] as bool? ?? false,
    );
  }
}

class AuthResult {
  const AuthResult({
    required this.token,
    required this.profile,
  });

  final String token;
  final UserProfile profile;

  factory AuthResult.fromJson(Map<String, dynamic> json) {
    return AuthResult(
      token: json['token'] as String,
      profile: UserProfile.fromJson(json['profile'] as Map<String, dynamic>),
    );
  }
}
