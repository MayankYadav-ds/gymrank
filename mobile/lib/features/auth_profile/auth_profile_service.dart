import 'auth_profile_models.dart';
import 'auth_profile_repository.dart';

class AuthProfileService {
  const AuthProfileService(this._repository);

  final AuthProfileRepository _repository;

  Future<AuthResult> register({
    required String email,
    required String password,
    required String displayName,
  }) {
    return _repository.register(email: email, password: password, displayName: displayName);
  }

  Future<AuthResult> login({
    required String email,
    required String password,
  }) {
    return _repository.login(email: email, password: password);
  }

  Future<UserProfile> getProfile() {
    return _repository.getProfile();
  }

  Future<UserProfile> updateProfile({
    String? displayName,
    String? country,
    String? unitPreference,
    String? dateOfBirth,
    String? sexCategory,
    double? bodyweight,
    bool? rankingParticipationEnabled,
  }) {
    return _repository.updateProfile(
      displayName: displayName,
      country: country,
      unitPreference: unitPreference,
      dateOfBirth: dateOfBirth,
      sexCategory: sexCategory,
      bodyweight: bodyweight,
      rankingParticipationEnabled: rankingParticipationEnabled,
    );
  }

  Future<bool> hasSession() {
    return _repository.hasSession();
  }

  Future<void> logout() {
    return _repository.logout();
  }
}
