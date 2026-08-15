import '../datasources/auth_remote_datasource.dart';
import '../datasources/auth_remote_datasource_impl.dart';
import '../../shared/models/user_model.dart';

abstract class AuthRepository {
  Future<UserModel?> getCurrentUser();
  Future<UserModel> login(String emailOrPhone, String password, UserRole role);
  Future<UserModel> loginWithGoogle(UserRole role, {String? email, String? name, String? avatarUrl});
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
  Future<UserModel> verifyIdentity(String idType, String idNumber, {String? documentImage, String? selfieImage});
}

class AuthRepositoryImpl implements AuthRepository {
  final AuthRemoteDataSource _remoteDataSource;

  AuthRepositoryImpl({AuthRemoteDataSource? remoteDataSource})
      : _remoteDataSource = remoteDataSource ?? ApiAuthRemoteDataSource();

  @override
  Future<UserModel?> getCurrentUser() => _remoteDataSource.fetchCurrentUser();

  @override
  Future<UserModel> login(String emailOrPhone, String password, UserRole role) =>
      _remoteDataSource.loginUser(emailOrPhone, password, role);

  @override
  Future<UserModel> loginWithGoogle(UserRole role, {String? email, String? name, String? avatarUrl}) =>
      _remoteDataSource.loginWithGoogle(role, email: email, name: name, avatarUrl: avatarUrl);

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
  Future<UserModel> updateProfile(UserModel updatedUser) => _remoteDataSource.updateUserProfile(updatedUser);

  @override
  Future<UserModel> verifyIdentity(String idType, String idNumber, {String? documentImage, String? selfieImage}) =>
      _remoteDataSource.verifyIdentity(idType, idNumber, documentImage: documentImage, selfieImage: selfieImage);
}

// Backward compatibility alias for MockAuthRepository
typedef MockAuthRepository = AuthRepositoryImpl;
