import '../../shared/models/user_model.dart';
import '../mock_data.dart';

abstract class AuthRemoteDataSource {
  Future<UserModel?> fetchCurrentUser();
  Future<UserModel> loginUser(String emailOrPhone, String password, UserRole role);
  Future<UserModel> registerUser({
    required String name,
    required String email,
    required String phone,
    required String password,
    required UserRole role,
  });
  Future<void> logoutUser();
}

class MockAuthRemoteDataSource implements AuthRemoteDataSource {
  UserModel? _currentUser = MockData.seekerUser;

  @override
  Future<UserModel?> fetchCurrentUser() async {
    // Simulate HTTP GET /api/v1/auth/me
    await Future.delayed(const Duration(milliseconds: 200));
    return _currentUser;
  }

  @override
  Future<UserModel> loginUser(String emailOrPhone, String password, UserRole role) async {
    // Simulate HTTP POST /api/v1/auth/login
    await Future.delayed(const Duration(milliseconds: 400));
    if (role == UserRole.provider) {
      _currentUser = MockData.providerUser;
    } else {
      _currentUser = MockData.seekerUser;
    }
    return _currentUser!;
  }

  @override
  Future<UserModel> registerUser({
    required String name,
    required String email,
    required String phone,
    required String password,
    required UserRole role,
  }) async {
    // Simulate HTTP POST /api/v1/auth/register
    await Future.delayed(const Duration(milliseconds: 500));
    _currentUser = UserModel(
      id: 'user_${DateTime.now().millisecondsSinceEpoch}',
      name: name,
      email: email,
      phone: phone,
      role: role,
      isVerified: false,
    );
    return _currentUser!;
  }

  @override
  Future<void> logoutUser() async {
    // Simulate HTTP POST /api/v1/auth/logout
    await Future.delayed(const Duration(milliseconds: 200));
    _currentUser = null;
  }
}
