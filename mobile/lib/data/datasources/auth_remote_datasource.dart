import '../../shared/models/user_model.dart';
import '../mock_data.dart';

abstract class AuthRemoteDataSource {
  Future<UserModel?> fetchCurrentUser();
  Future<UserModel> loginUser(String emailOrPhone, String password, UserRole role);
  Future<UserModel> loginWithGoogle(UserRole role, {String? email, String? name, String? avatarUrl});
  Future<UserModel> registerUser({
    required String name,
    required String email,
    required String phone,
    required String password,
    required UserRole role,
    String? region,
    String? city,
    String? address,
  });
  Future<void> logoutUser();
  Future<UserModel> updateUserProfile(UserModel user);
  Future<UserModel> verifyIdentity(String idType, String idNumber, {String? documentImage, String? selfieImage});
  Future<bool> forgotPassword(String email);
  Future<bool> resetPassword(String email, String code, String newPassword);
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
  Future<UserModel> loginWithGoogle(UserRole role, {String? email, String? name, String? avatarUrl}) async {
    await Future.delayed(const Duration(milliseconds: 600));
    _currentUser = UserModel(
      id: 'google_user_101',
      name: name ?? 'Abebe Bikila (Google User)',
      email: email ?? 'abebe.google@gmail.com',
      phone: '+251 91 122 3344',
      role: role,
      avatarUrl: avatarUrl ?? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80',
      isVerified: true,
    );
    return _currentUser!;
  }

  @override
  Future<UserModel> registerUser({
    required String name,
    required String email,
    required String phone,
    required String password,
    required UserRole role,
    String? region,
    String? city,
    String? address,
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

  @override
  Future<UserModel> updateUserProfile(UserModel user) async {
    await Future.delayed(const Duration(milliseconds: 300));
    _currentUser = user;
    return user;
  }

  @override
  Future<UserModel> verifyIdentity(String idType, String idNumber, {String? documentImage, String? selfieImage}) async {
    await Future.delayed(const Duration(milliseconds: 300));
    if (_currentUser != null) {
      _currentUser = _currentUser!.copyWith(isVerified: true);
    }
    return _currentUser!;
  }

  @override
  Future<bool> forgotPassword(String email) async {
    await Future.delayed(const Duration(milliseconds: 400));
    return true;
  }

  @override
  Future<bool> resetPassword(String email, String code, String newPassword) async {
    await Future.delayed(const Duration(milliseconds: 400));
    return true;
  }
}
