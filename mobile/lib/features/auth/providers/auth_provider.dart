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
      _currentUser = await _authRepository.login(emailOrPhone, password, role);
      _isLoading = false;
      notifyListeners();
      return true;
    } catch (e) {
      _errorMessage = 'Invalid email/phone or password';
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
