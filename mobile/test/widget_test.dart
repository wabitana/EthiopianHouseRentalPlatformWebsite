import 'package:flutter_test/flutter_test.dart';
import 'package:ethiopian_house_rental/main.dart';

void main() {
  testWidgets('App loads splash screen widget test', (WidgetTester tester) async {
    await tester.pumpWidget(const EthiopianHouseRentalApp());
    await tester.pumpAndSettle(const Duration(seconds: 3));
    expect(find.byType(EthiopianHouseRentalApp), findsOneWidget);
  });
}
