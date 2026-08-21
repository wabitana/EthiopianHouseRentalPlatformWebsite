import 'package:flutter/material.dart';
import '../../../data/repositories/auth_repository.dart';
import '../../../data/datasources/auth_remote_datasource_impl.dart';
import '../../../shared/models/user_model.dart';

class AuthProvider extends ChangeNotifier {
  final AuthRepository _authRepository;

  UserModel? _currentUser;
  UserRole? _activeRole;
  UserRole? _registeredRole;
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

  /// The registered account role (e.g. seeker or provider when registered)
  UserRole get registeredRole => _registeredRole ?? _currentUser?.role ?? UserRole.seeker;

  /// The currently active workspace mode (can be switched after login)
  UserRole get currentRole => _activeRole ?? _currentUser?.role ?? UserRole.seeker;
  UserRole get activeRole => currentRole;

  bool get isProvider => currentRole == UserRole.provider;
  bool get isSeeker => currentRole == UserRole.seeker;

  Future<void> _init() async {
    _isLoading = true;
    notifyListeners();
    try {
      _currentUser = await _authRepository.getCurrentUser();
      if (_currentUser != null) {
        _registeredRole = _currentUser!.role;
        _activeRole = _currentUser!.role;
      }
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
        _registeredRole = null;
        _activeRole = null;
        final registeredLabel = user.role == UserRole.seeker ? 'House Seeker' : 'House Provider';
        final selectedLabel = role == UserRole.seeker ? 'House Seeker' : 'House Provider';
        _errorMessage = 'This account is registered as a $registeredLabel. You cannot log in as $selectedLabel. Please select \'$registeredLabel\' to log in.';
        _isLoading = false;
        notifyListeners();
        return false;
      }

      _currentUser = user;
      _registeredRole = user.role;
      _activeRole = user.role;
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

  Future<bool> loginWithGoogle(
    UserRole role, {
    String? email,
    String? name,
    String? avatarUrl,
  }) async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      final user = await _authRepository.loginWithGoogle(role, email: email, name: name, avatarUrl: avatarUrl);

      if (user.role != role) {
        _currentUser = null;
        _registeredRole = null;
        _activeRole = null;
        final registeredLabel = user.role == UserRole.seeker ? 'House Seeker' : 'House Provider';
        final selectedLabel = role == UserRole.seeker ? 'House Seeker' : 'House Provider';
        _errorMessage = 'This Google account is registered as a $registeredLabel. You cannot log in as $selectedLabel.';
        _isLoading = false;
        notifyListeners();
        return false;
      }

      _currentUser = user;
      _registeredRole = user.role;
      _activeRole = user.role;
      _isLoading = false;
      notifyListeners();
      return true;
    } catch (e) {
      final msg = e.toString();
      _errorMessage = msg.startsWith('Exception: ')
          ? msg.replaceFirst('Exception: ', '')
          : (msg.isEmpty ? 'Failed to authenticate with Google' : msg);
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
    String? region,
    String? city,
    String? address,
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
        region: region,
        city: city,
        address: address,
      );
      _registeredRole = role;
      _activeRole = role;
      _isLoading = false;
      notifyListeners();
      return true;
    } catch (e) {
      final msg = e.toString();
      _errorMessage = msg.startsWith('Exception: ')
          ? msg.replaceFirst('Exception: ', '')
          : (msg.isEmpty ? 'Failed to register account' : msg);
      _isLoading = false;
      notifyListeners();
      return false;
    }
  }

  Future<bool> verifyEmail(String email, String code) async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();
    try {
      if (_authRepository is AuthRepositoryImpl) {
        final remoteDs = ApiAuthRemoteDataSource();
        final user = await remoteDs.verifyEmail(email, code);
        _currentUser = user;
        _registeredRole = user.role;
        _activeRole = user.role;
      } else {
        await Future.delayed(const Duration(milliseconds: 400));
      }
      _isLoading = false;
      notifyListeners();
      return true;
    } catch (e) {
      final msg = e.toString();
      _errorMessage = msg.startsWith('Exception: ')
          ? msg.replaceFirst('Exception: ', '')
          : (msg.isEmpty ? 'Invalid email verification code' : msg);
      _isLoading = false;
      notifyListeners();
      return false;
    }
  }

  Future<bool> sendPhoneOtp(String phone) async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();
    try {
      final remoteDs = ApiAuthRemoteDataSource();
      await remoteDs.sendPhoneOtp(phone);
      _isLoading = false;
      notifyListeners();
      return true;
    } catch (e) {
      _errorMessage = 'Failed to send SMS OTP';
      _isLoading = false;
      notifyListeners();
      return false;
    }
  }

  Future<bool> verifyPhoneOtp(String code) async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();
    try {
      final remoteDs = ApiAuthRemoteDataSource();
      final success = await remoteDs.verifyPhoneOtp(code);
      if (success) {
        await refreshCurrentUser();
        _isLoading = false;
        notifyListeners();
        return true;
      }
      _isLoading = false;
      notifyListeners();
      return false;
    } catch (e) {
      _errorMessage = 'Invalid phone SMS OTP code';
      _isLoading = false;
      notifyListeners();
      return false;
    }
  }

  /// Switch active role mode dynamically after logging in
  void switchRole(UserRole newRole) {
    if (_currentUser != null) {
      _activeRole = newRole;
      _currentUser = _currentUser!.copyWith(role: newRole);
      notifyListeners();
    }
  }

  Future<void> refreshCurrentUser() async {
    try {
      final remoteDs = ApiAuthRemoteDataSource();
      final freshUser = await remoteDs.fetchCurrentUser();
      if (freshUser != null) {
        _currentUser = freshUser;
        notifyListeners();
      }
    } catch (e) {
      debugPrint('Error refreshing current user profile: $e');
    }
  }

  Future<void> logout() async {
    await _authRepository.logout();
    _currentUser = null;
    _activeRole = null;
    _registeredRole = null;
    notifyListeners();
  }

  Future<void> updateProfile(String name, String phone, String email, [String? avatarUrl]) async {
    if (_currentUser != null) {
      final updated = _currentUser!.copyWith(
        name: name,
        phone: phone,
        email: email,
        avatarUrl: avatarUrl ?? _currentUser!.avatarUrl,
      );
      _currentUser = await _authRepository.updateProfile(updated);
      notifyListeners();
    }
  }

  Future<void> updateVerificationStatus(bool isVerified) async {
    if (_currentUser != null) {
      final updated = _currentUser!.copyWith(isVerified: isVerified);
      _currentUser = await _authRepository.updateProfile(updated);
      notifyListeners();
    }
  }

  Future<bool> verifyIdentity(String idType, String idNumber, {String? documentImage, String? selfieImage}) async {
    if (_currentUser != null) {
      _isLoading = true;
      notifyListeners();
      try {
        _currentUser = await _authRepository.verifyIdentity(idType, idNumber, documentImage: documentImage, selfieImage: selfieImage);
        _isLoading = false;
        notifyListeners();
        return true;
      } catch (e) {
        _errorMessage = 'Failed to process identity verification';
        _isLoading = false;
        notifyListeners();
        return false;
      }
    }
    return false;
  }

  Future<bool> sendForgotPassword(String email) async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();
    try {
      final success = await _authRepository.forgotPassword(email);
      _isLoading = false;
      notifyListeners();
      return success;
    } catch (e) {
      _errorMessage = 'Failed to send password reset code';
      _isLoading = false;
      notifyListeners();
      return false;
    }
  }

  Future<bool> resetPassword(String email, String code, String newPassword) async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();
    try {
      final success = await _authRepository.performResetPassword(email, code, newPassword);
      _isLoading = false;
      notifyListeners();
      return success;
    } catch (e) {
      _errorMessage = 'Failed to reset password. Check verification code.';
      _isLoading = false;
      notifyListeners();
      return false;
    }
  }

  Future<bool> changePassword(String currentPassword, String newPassword) async {
    _isLoading = true;
    notifyListeners();
    await Future.delayed(const Duration(milliseconds: 500));
    _isLoading = false;
    notifyListeners();
    return true;
  }
}
