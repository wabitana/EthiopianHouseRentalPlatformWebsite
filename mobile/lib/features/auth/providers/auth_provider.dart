import 'package:flutter/material.dart';
import '../../../data/repositories/auth_repository.dart';
import '../../../shared/models/user_model.dart';

class AuthProvider extends ChangeNotifier {
  final AuthRepository _authRepository;

  UserModel? _currentUser;
  bool _isLoading = false;
  String? _errorMessage;

  AuthProvider({AuthRepository? authRepository})
      : _authRepository = authRepository ?? MockAuthRepository() {
    _init();
  }

  UserModel? get currentUser => _currentUser;
  bool get isLoggedIn => _currentUser != null;
  bool get isLoading => _isLoading;
  String? get errorMessage => _errorMessage;
  UserRole get currentRole => _currentUser?.role ?? UserRole.seeker;
  bool get isProvider => currentRole == UserRole.provider;
  bool get isSeeker => currentRole == UserRole.seeker;

  Future<void> _init() async {
    _isLoading = true;
    notifyListeners();
    try {
      _currentUser = await _authRepository.getCurrentUser();
    } catch (e) {
      _errorMessage = e.toString();
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<bool> login(String emailOrPhone, String password, UserRole role) async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      final user = await _authRepository.login(emailOrPhone, password, role);

      if (user.role != role) {
        _currentUser = null;
        final registeredLabel = user.role == UserRole.seeker ? 'House Seeker' : 'House Provider';
        final selectedLabel = role == UserRole.seeker ? 'House Seeker' : 'House Provider';
        _errorMessage = 'This account is registered as a $registeredLabel. You cannot log in as $selectedLabel.';
        _isLoading = false;
        notifyListeners();
        return false;
      }

      _currentUser = user;
      _isLoading = false;
      notifyListeners();
      return true;
    } catch (e) {
      final msg = e.toString();
      _errorMessage = msg.startsWith('Exception: ')
          ? msg.replaceFirst('Exception: ', '')
          : (msg.isEmpty ? 'Invalid email/phone or password' : msg);
      _isLoading = false;
      notifyListeners();
      return false;
    }
  }

  Future<bool> register({
    required String name,
    required String email,
    required String phone,
    required String password,
    required UserRole role,
  }) async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      _currentUser = await _authRepository.register(
        name: name,
        email: email,
        phone: phone,
        password: password,
        role: role,
      );
      _isLoading = false;
      notifyListeners();
      return true;
    } catch (e) {
      _errorMessage = 'Failed to register account';
      _isLoading = false;
      notifyListeners();
      return false;
    }
  }

  // Handy demo helper to switch role dynamically during testing
  void switchRole(UserRole newRole) {
    if (_currentUser != null) {
      _currentUser = _currentUser!.copyWith(role: newRole);
      notifyListeners();
    }
  }

  Future<void> logout() async {
    await _authRepository.logout();
    _currentUser = null;
    notifyListeners();
  }

  Future<void> updateProfile(String name, String phone, String email) async {
    if (_currentUser != null) {
      final updated = _currentUser!.copyWith(
        name: name,
        phone: phone,
        email: email,
      );
      _currentUser = await _authRepository.updateProfile(updated);
      notifyListeners();
    }
  }
}
