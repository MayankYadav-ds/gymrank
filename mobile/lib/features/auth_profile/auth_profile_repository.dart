import '../../core/api/api_client.dart';
import 'auth_profile_models.dart';

abstract class AuthProfileRepository {
  Future<AuthResult> register({
    required String email,
    required String password,
    required String displayName,
  });

  Future<AuthResult> login({
    required String email,
    required String password,
  });

  Future<UserProfile> getProfile();

  Future<UserProfile> updateProfile({
    String? displayName,
    String? country,
    String? unitPreference,
    String? dateOfBirth,
    String? sexCategory,
    double? bodyweight,
    bool? rankingParticipationEnabled,
  });

  Future<bool> hasSession();

  Future<void> logout();
}

class ApiAuthProfileRepository implements AuthProfileRepository {
  const ApiAuthProfileRepository({ApiClient? apiClient}) : _apiClient = apiClient ?? ApiClient.shared;

  final ApiClient _apiClient;

  @override
  Future<AuthResult> register({
    required String email,
    required String password,
    required String displayName,
  }) async {
    final json = await _apiClient.postJson('/v1/auth/register', body: {
      'email': email,
      'password': password,
      'displayName': displayName,
    });
    final result = AuthResult.fromJson(json);
    await _apiClient.tokenStorage.writeToken(result.token);
    return result;
  }

  @override
  Future<AuthResult> login({
    required String email,
    required String password,
  }) async {
    final json = await _apiClient.postJson('/v1/auth/login', body: {
      'email': email,
      'password': password,
    });
    final result = AuthResult.fromJson(json);
    await _apiClient.tokenStorage.writeToken(result.token);
    return result;
  }

  @override
  Future<UserProfile> getProfile() async {
    final json = await _apiClient.getJson('/v1/profile');
    return UserProfile.fromJson(json['profile'] as Map<String, dynamic>);
  }

  @override
  Future<UserProfile> updateProfile({
    String? displayName,
    String? country,
    String? unitPreference,
    String? dateOfBirth,
    String? sexCategory,
    double? bodyweight,
    bool? rankingParticipationEnabled,
  }) async {
    final body = <String, dynamic>{
      if (displayName != null) 'displayName': displayName,
      if (country != null) 'country': country,
      if (unitPreference != null) 'unitPreference': unitPreference,
      if (dateOfBirth != null) 'dateOfBirth': dateOfBirth,
      if (sexCategory != null) 'sexCategory': sexCategory,
      if (bodyweight != null) 'bodyweight': bodyweight,
      if (rankingParticipationEnabled != null) 'rankingParticipationEnabled': rankingParticipationEnabled,
    };
    final json = await _apiClient.patchJson('/v1/profile', body: body);
    return UserProfile.fromJson(json['profile'] as Map<String, dynamic>);
  }

  @override
  Future<bool> hasSession() async {
    return (await _apiClient.tokenStorage.readToken()) != null;
  }

  @override
  Future<void> logout() {
    return _apiClient.tokenStorage.clearToken();
  }
}
