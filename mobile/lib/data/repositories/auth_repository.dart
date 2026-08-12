import '../datasources/auth_remote_datasource.dart';
import '../../shared/models/user_model.dart';

abstract class AuthRepository {
  Future<UserModel?> getCurrentUser();
  Future<UserModel> login(String emailOrPhone, String password, UserRole role);
  Future<UserModel> register({
    required String name,
    required String email,
    required String phone,
    required String password,
    required UserRole role,
  });
  Future<void> logout();
  Future<void> resetPassword(String emailOrPhone);
  Future<UserModel> updateProfile(UserModel updatedUser);
}

class AuthRepositoryImpl implements AuthRepository {
  final AuthRemoteDataSource _remoteDataSource;

  AuthRepositoryImpl({AuthRemoteDataSource? remoteDataSource})
      : _remoteDataSource = remoteDataSource ?? MockAuthRemoteDataSource();

  @override
  Future<UserModel?> getCurrentUser() => _remoteDataSource.fetchCurrentUser();

  @override
  Future<UserModel> login(String emailOrPhone, String password, UserRole role) =>
      _remoteDataSource.loginUser(emailOrPhone, password, role);

  @override
  Future<UserModel> register({
    required String name,
    required String email,
    required String phone,
    required String password,
    required UserRole role,
  }) =>
      _remoteDataSource.registerUser(
        name: name,
        email: email,
        phone: phone,
        password: password,
        role: role,
      );

  @override
  Future<void> logout() => _remoteDataSource.logoutUser();

  @override
  Future<void> resetPassword(String emailOrPhone) async {
    await Future.delayed(const Duration(milliseconds: 300));
  }

  @override
  Future<UserModel> updateProfile(UserModel updatedUser) async {
    await Future.delayed(const Duration(milliseconds: 300));
    return updatedUser;
  }
}

// Backward compatibility alias for MockAuthRepository
typedef MockAuthRepository = AuthRepositoryImpl;
