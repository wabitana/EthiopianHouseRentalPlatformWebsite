import 'package:flutter_test/flutter_test.dart';
import 'package:ethiopian_house_rental/data/datasources/auth_remote_datasource.dart';
import 'package:ethiopian_house_rental/data/repositories/auth_repository.dart';
import 'package:ethiopian_house_rental/features/auth/providers/auth_provider.dart';
import 'package:ethiopian_house_rental/shared/models/user_model.dart';

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();

  group('AuthProvider Unit Tests', () {
    late AuthProvider authProvider;

    setUp(() {
      authProvider = AuthProvider(
        authRepository: AuthRepositoryImpl(remoteDataSource: MockAuthRemoteDataSource()),
      );
    });

    test('Initial user is set to seeker default', () async {
      await Future.delayed(const Duration(milliseconds: 350));
      expect(authProvider.currentUser, isNotNull);
      expect(authProvider.currentRole, UserRole.seeker);
    });

    test('login as House Provider sets role to provider', () async {
      final success = await authProvider.login('provider@example.com', 'password123', UserRole.provider);
      expect(success, true);
      expect(authProvider.currentRole, UserRole.provider);
      expect(authProvider.isProvider, true);
    });

    test('switchRole toggles role dynamically', () async {
      await authProvider.login('seeker@example.com', 'password123', UserRole.seeker);
      expect(authProvider.isSeeker, true);

      authProvider.switchRole(UserRole.provider);
      expect(authProvider.isProvider, true);
    });

    test('logout clears user session', () async {
      await authProvider.logout();
      expect(authProvider.currentUser, isNull);
      expect(authProvider.isLoggedIn, false);
    });
  });
}
