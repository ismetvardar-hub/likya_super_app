import 'package:flutter_test/flutter_test.dart';
import 'package:likya_mobile/main.dart';

void main() {
  testWidgets('Likya SuperApp smoke test', (WidgetTester tester) async {
    await tester.pumpWidget(const LikyaSuperApp());
    await tester.pumpAndSettle();
    expect(find.byType(LikyaSuperApp), findsOneWidget);
  });
}
