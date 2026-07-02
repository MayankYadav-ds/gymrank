import 'package:flutter/material.dart';

import '../../shared/widgets/async_state_view.dart';
import 'auth_profile_models.dart';
import 'auth_profile_repository.dart';
import 'auth_profile_service.dart';
import 'login_screen.dart';

class ProfileSetupScreen extends StatefulWidget {
  const ProfileSetupScreen({super.key});

  static const routeName = '/profile/setup';

  @override
  State<ProfileSetupScreen> createState() => _ProfileSetupScreenState();
}

class _ProfileSetupScreenState extends State<ProfileSetupScreen> {
  static const _service = AuthProfileService(ApiAuthProfileRepository());
  final _displayNameController = TextEditingController();
  final _countryController = TextEditingController();
  final _dateOfBirthController = TextEditingController();
  final _bodyweightController = TextEditingController();
  late Future<UserProfile> _future;
  var _unitPreference = 'kg';
  String? _sexCategory;
  var _rankingParticipationEnabled = false;
  var _saving = false;
  String? _error;

  @override
  void initState() {
    super.initState();
    _future = _load();
  }

  @override
  void dispose() {
    _displayNameController.dispose();
    _countryController.dispose();
    _dateOfBirthController.dispose();
    _bodyweightController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Profile setup'),
        actions: [
          IconButton(
            onPressed: _logout,
            icon: const Icon(Icons.logout),
            tooltip: 'Log out',
          ),
        ],
      ),
      body: SafeArea(
        child: FutureBuilder<UserProfile>(
          future: _future,
          builder: (context, snapshot) {
            return AsyncStateView<UserProfile>(
              snapshot: snapshot,
              emptyMessage: 'Profile unavailable.',
              onRetry: _refresh,
              builder: (context, profile) {
                return RefreshIndicator(
                  onRefresh: () async => _refresh(),
                  child: ListView(
                    padding: const EdgeInsets.all(24),
                    children: [
                      TextFormField(
                        controller: _displayNameController,
                        decoration: const InputDecoration(labelText: 'Display name'),
                      ),
                      const SizedBox(height: 16),
                      TextFormField(
                        controller: _countryController,
                        decoration: const InputDecoration(labelText: 'Country'),
                      ),
                      const SizedBox(height: 16),
                      DropdownButtonFormField<String>(
                        value: _unitPreference,
                        items: const [
                          DropdownMenuItem(value: 'kg', child: Text('kg')),
                          DropdownMenuItem(value: 'lb', child: Text('lb')),
                        ],
                        onChanged: (value) => setState(() => _unitPreference = value ?? 'kg'),
                        decoration: const InputDecoration(labelText: 'Unit preference'),
                      ),
                      const SizedBox(height: 16),
                      TextFormField(
                        controller: _dateOfBirthController,
                        decoration: const InputDecoration(labelText: 'Date of birth YYYY-MM-DD'),
                      ),
                      const SizedBox(height: 16),
                      DropdownButtonFormField<String>(
                        value: _sexCategory,
                        items: const [
                          DropdownMenuItem(value: 'male', child: Text('Male')),
                          DropdownMenuItem(value: 'female', child: Text('Female')),
                          DropdownMenuItem(value: 'open', child: Text('Open')),
                          DropdownMenuItem(value: 'prefer_not_to_say', child: Text('Prefer not to say')),
                        ],
                        onChanged: (value) => setState(() => _sexCategory = value),
                        decoration: const InputDecoration(labelText: 'Sex/category'),
                      ),
                      const SizedBox(height: 16),
                      TextFormField(
                        controller: _bodyweightController,
                        decoration: const InputDecoration(labelText: 'Bodyweight'),
                        keyboardType: TextInputType.number,
                      ),
                      const SizedBox(height: 16),
                      SwitchListTile(
                        value: _rankingParticipationEnabled,
                        onChanged: (value) => setState(() => _rankingParticipationEnabled = value),
                        title: const Text('Join rankings'),
                        subtitle: const Text('Optional. Bodyweight and profile fields are required before ranking.'),
                      ),
                      if (_error != null) ...[
                        const SizedBox(height: 16),
                        Text(_error!, style: TextStyle(color: Theme.of(context).colorScheme.error)),
                      ],
                      const SizedBox(height: 24),
                      FilledButton(
                        onPressed: _saving ? null : _save,
                        child: _saving
                            ? const SizedBox.square(
                                dimension: 18,
                                child: CircularProgressIndicator(strokeWidth: 2),
                              )
                            : const Text('Save profile'),
                      ),
                    ],
                  ),
                );
              },
            );
          },
        ),
      ),
    );
  }

  Future<UserProfile> _load() async {
    final profile = await _service.getProfile();
    _displayNameController.text = profile.displayName;
    _countryController.text = profile.country ?? '';
    _dateOfBirthController.text = profile.dateOfBirth?.split('T').first ?? '';
    _bodyweightController.text = profile.bodyweight?.toString() ?? '';
    _unitPreference = profile.unitPreference;
    _sexCategory = profile.sexCategory;
    _rankingParticipationEnabled = profile.rankingParticipationEnabled;
    return profile;
  }

  void _refresh() {
    setState(() => _future = _load());
  }

  Future<void> _save() async {
    setState(() {
      _saving = true;
      _error = null;
    });

    try {
      await _service.updateProfile(
        displayName: _displayNameController.text.trim(),
        country: _countryController.text.trim().isEmpty ? null : _countryController.text.trim(),
        unitPreference: _unitPreference,
        dateOfBirth: _dateOfBirthController.text.trim().isEmpty ? null : _dateOfBirthController.text.trim(),
        sexCategory: _sexCategory,
        bodyweight: double.tryParse(_bodyweightController.text),
        rankingParticipationEnabled: _rankingParticipationEnabled,
      );
      _refresh();
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Profile saved')));
    } catch (error) {
      setState(() => _error = error.toString());
    } finally {
      if (mounted) {
        setState(() => _saving = false);
      }
    }
  }

  Future<void> _logout() async {
    await _service.logout();
    if (!mounted) return;
    Navigator.of(context).pushNamedAndRemoveUntil(LoginScreen.routeName, (_) => false);
  }
}
