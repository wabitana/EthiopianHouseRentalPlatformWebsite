import 'package:flutter_test/flutter_test.dart';
import 'package:ethiopian_house_rental/core/constants/app_strings.dart';
import 'package:ethiopian_house_rental/core/localization/language_provider.dart';

void main() {
  group('LanguageProvider Unit Tests', () {
    late LanguageProvider languageProvider;

    setUp(() {
      languageProvider = LanguageProvider();
    });

    test('Initial language defaults to English', () {
      expect(languageProvider.currentLanguage, AppLanguage.english);
    });

    test('setLanguage switches language to Amharic', () async {
      await languageProvider.setLanguage(AppLanguage.amharic);
      expect(languageProvider.currentLanguage, AppLanguage.amharic);
      expect(AppStrings.houseSeeker(AppLanguage.amharic), 'ቤት ፈላጊ');
      expect(AppStrings.houseProvider(AppLanguage.amharic), 'ቤት አከራይ');
    });

    test('setLanguage switches language to Afaan Oromoo', () async {
      await languageProvider.setLanguage(AppLanguage.afaanOromoo);
      expect(languageProvider.currentLanguage, AppLanguage.afaanOromoo);
      expect(AppStrings.houseSeeker(AppLanguage.afaanOromoo), 'Barbaadaa Manaa');
      expect(AppStrings.houseProvider(AppLanguage.afaanOromoo), 'Dhiyeessaa Manaa');
    });
  });
}
