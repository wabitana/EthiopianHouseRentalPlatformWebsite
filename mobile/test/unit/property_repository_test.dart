import 'package:flutter_test/flutter_test.dart';
import 'package:ethiopian_house_rental/data/datasources/property_remote_datasource.dart';
import 'package:ethiopian_house_rental/data/repositories/property_repository.dart';
import 'package:ethiopian_house_rental/shared/models/property_model.dart';

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();

  group('PropertyRepository Tests', () {
    late PropertyRepositoryImpl repository;

    setUp(() {
      repository = PropertyRepositoryImpl(remoteDataSource: MockPropertyRemoteDataSource());
    });

    test('getProperties returns all mock listings initially', () async {
      final properties = await repository.getProperties();
      expect(properties.isNotEmpty, true);
    });

    test('getProperties filters correctly by City', () async {
      final addisProps = await repository.getProperties(city: 'Addis Ababa');
      expect(addisProps.every((p) => p.city == 'Addis Ababa'), true);

      final hawassaProps = await repository.getProperties(city: 'Hawassa');
      expect(hawassaProps.every((p) => p.city == 'Hawassa'), true);
    });

    test('getProperties filters correctly by ETB Price range', () async {
      final filteredProps = await repository.getProperties(
        minPrice: 10000,
        maxPrice: 20000,
      );
      expect(filteredProps.every((p) => p.price >= 10000 && p.price <= 20000), true);
    });

    test('toggleAvailability updates status to rented', () async {
      final updated = await repository.toggleAvailability('prop_1', false);
      expect(updated.availability, false);
      expect(updated.listingStatus, PropertyListingStatus.rented);
    });
  });
}
