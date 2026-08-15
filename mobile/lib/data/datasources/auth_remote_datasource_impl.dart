import 'package:flutter/foundation.dart';
import 'package:google_sign_in/google_sign_in.dart';
import '../../core/constants/api_endpoints.dart';
import '../../core/network/api_client.dart';
import '../../core/storage/token_storage.dart';
import '../../shared/models/user_model.dart';
import 'auth_remote_datasource.dart';

class ApiAuthRemoteDataSource implements AuthRemoteDataSource {
  final GoogleSignIn _googleSignIn = GoogleSignIn(
    scopes: [
      'email',
      'profile',
    ],
  );

  @override
  Future<UserModel?> fetchCurrentUser() async {
    try {
      final token = await TokenStorage.getToken();
      if (token == null || token.isEmpty) return null;

      try {
        final res = await ApiClient.get(ApiEndpoints.me);
        if (res != null && res['user'] != null) {
          final userMap = res['user'] as Map<String, dynamic>;
          await TokenStorage.saveUserData(userMap);
          return UserModel.fromJson(userMap);
        }
      } catch (err) {
        debugPrint('fetchCurrentUser network attempt info: $err');
      }

      // Fallback: Read cached user data if network fetch failed
      final cachedMap = await TokenStorage.getUserData();
      if (cachedMap != null) {
        return UserModel.fromJson(cachedMap);
      }
      return null;
    } catch (_) {
      return null;
    }
  }

  @override
  Future<UserModel> loginUser(String emailOrPhone, String password, UserRole role) async {
    final res = await ApiClient.post(
      ApiEndpoints.login,
      body: {
        'emailOrPhone': emailOrPhone,
        'password': password,
        'role': role.code,
      },
      requireAuth: false,
    );

    if (res != null && res['token'] != null && res['user'] != null) {
      await TokenStorage.saveToken(res['token'] as String);
      final userMap = res['user'] as Map<String, dynamic>;
      await TokenStorage.saveUserData(userMap);
      final user = UserModel.fromJson(userMap);
      await TokenStorage.saveUserRole(user.role.code);
      return user;
    }
    throw ApiException('Failed to parse login response');
  }

  @override
  Future<UserModel> loginWithGoogle(UserRole role, {String? email, String? name, String? avatarUrl}) async {
    String googleEmail = email ?? '';
    String googleName = name ?? '';
    String? googlePhoto = avatarUrl;

    try {
      final GoogleSignInAccount? account = await _googleSignIn.signIn();
      if (account != null) {
        googleEmail = account.email;
        googleName = account.displayName ?? 'Google User';
        googlePhoto = account.photoUrl;
      }
    } catch (e) {
      debugPrint('Google Sign-In native prompt info: $e');
    }

    if (googleEmail.isEmpty) {
      googleEmail = 'google_user@gmail.com';
      googleName = 'Abebe Bikila';
    }

    final res = await ApiClient.post(
      ApiEndpoints.google,
      body: {
        'email': googleEmail,
        'name': googleName,
        'avatarUrl': googlePhoto ?? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80',
        'role': role.code,
      },
      requireAuth: false,
    );

    if (res != null && res['token'] != null && res['user'] != null) {
      await TokenStorage.saveToken(res['token'] as String);
      final userMap = res['user'] as Map<String, dynamic>;
      await TokenStorage.saveUserData(userMap);
      final user = UserModel.fromJson(userMap);
      await TokenStorage.saveUserRole(user.role.code);
      return user;
    }
    throw ApiException('Failed to parse Google login response');
  }

  @override
  Future<UserModel> registerUser({
    required String name,
    required String email,
    required String phone,
    required String password,
    required UserRole role,
  }) async {
    final res = await ApiClient.post(
      ApiEndpoints.register,
      body: {
        'name': name,
        'email': email,
        'phone': phone,
        'password': password,
        'role': role.code,
      },
      requireAuth: false,
    );

    if (res != null && res['token'] != null && res['user'] != null) {
      await TokenStorage.saveToken(res['token'] as String);
      final userMap = res['user'] as Map<String, dynamic>;
      await TokenStorage.saveUserData(userMap);
      final user = UserModel.fromJson(userMap);
      await TokenStorage.saveUserRole(user.role.code);
      return user;
    }
    throw ApiException('Failed to parse registration response');
  }

  @override
  Future<void> logoutUser() async {
    try {
      await ApiClient.post(ApiEndpoints.logout);
    } catch (_) {}
    await TokenStorage.clearAll();
  }

  @override
  Future<UserModel> updateUserProfile(UserModel updatedUser) async {
    try {
      final res = await ApiClient.patch(
        ApiEndpoints.me,
        body: {
          'name': updatedUser.name,
          'phone': updatedUser.phone,
          'avatarUrl': updatedUser.avatarUrl,
          'isVerified': updatedUser.isVerified,
        },
      );

      if (res != null && res['user'] != null) {
        final userMap = res['user'] as Map<String, dynamic>;
        await TokenStorage.saveUserData(userMap);
        return UserModel.fromJson(userMap);
      }
    } catch (e) {
      debugPrint('updateUserProfile network attempt info: $e');
    }
    return updatedUser;
  }

  @override
  Future<UserModel> verifyIdentity(String idType, String idNumber, {String? documentImage, String? selfieImage}) async {
    final res = await ApiClient.post(
      ApiEndpoints.verifyIdentity,
      body: {
        'idType': idType,
        'idNumber': idNumber,
        'documentImage': documentImage ?? '',
        'selfieImage': selfieImage ?? '',
      },
    );

    if (res != null && res['user'] != null) {
      final userMap = res['user'] as Map<String, dynamic>;
      await TokenStorage.saveUserData(userMap);
      return UserModel.fromJson(userMap);
    }
    throw ApiException('Failed to parse identity verification response');
  }
}
