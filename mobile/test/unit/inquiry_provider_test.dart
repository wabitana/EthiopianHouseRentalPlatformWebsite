import 'package:flutter_test/flutter_test.dart';
import 'package:ethiopian_house_rental/features/house_seeker/providers/inquiry_provider.dart';
import 'package:ethiopian_house_rental/shared/models/inquiry_model.dart';
import 'package:ethiopian_house_rental/shared/models/property_model.dart';
import 'package:ethiopian_house_rental/shared/models/user_model.dart';

void main() {
  group('InquiryProvider Unit Tests', () {
    late InquiryProvider inquiryProvider;

    setUp(() {
      inquiryProvider = InquiryProvider();
    });

    test('sendInquiry inserts new inquiry for property provider', () async {
      final property = PropertyModel(
        id: 'prop_test',
        providerId: 'user_provider_1',
        providerName: 'Abebe Bikila',
        providerPhone: '+251 91 987 6543',
        title: 'Test Apartment',
        description: 'Description',
        propertyType: 'Apartment',
        price: 20000,
        rooms: 2,
        bathrooms: 1,
        city: 'Addis Ababa',
        area: 'Bole',
        neighborhood: 'Atlas',
        images: [],
        amenities: [],
      );

      final seeker = UserModel(
        id: 'user_seeker_1',
        name: 'Tigist Assefa',
        email: 'tigist@example.com',
        phone: '+251 91 123 4567',
        role: UserRole.seeker,
      );

      final success = await inquiryProvider.sendInquiry(
        property: property,
        seeker: seeker,
        message: 'Is this available?',
      );

      expect(success, true);
      expect(inquiryProvider.seekerInquiries.isNotEmpty, true);
    });

    test('respondToInquiry updates reply and status', () async {
      await inquiryProvider.fetchProviderInquiries('user_provider_1');
      if (inquiryProvider.providerInquiries.isNotEmpty) {
        final targetInquiry = inquiryProvider.providerInquiries.first;
        await inquiryProvider.respondToInquiry(
          targetInquiry.id,
          'Viewing confirmed for tomorrow',
          InquiryStatus.viewingArranged,
        );

        final updated = inquiryProvider.providerInquiries.firstWhere((inq) => inq.id == targetInquiry.id);
        expect(updated.providerReply, 'Viewing confirmed for tomorrow');
        expect(updated.status, InquiryStatus.viewingArranged);
      }
    });
  });
}
