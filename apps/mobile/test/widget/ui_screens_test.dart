import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:likya_mobile/features/dashboard/presentation/screens/dashboard_screen.dart';
import 'package:likya_mobile/features/fair_products/presentation/screens/product_list_screen.dart';
import 'package:likya_mobile/features/tickets/presentation/screens/my_tickets_screen.dart';

void main() {
  group('Likya Widget Tests', () {
    testWidgets('DashboardScreen renders greeting and quick action buttons', (WidgetTester tester) async {
      await tester.pumpWidget(
        const MaterialApp(
          home: DashboardScreen(),
        ),
      );

      expect(find.text('Selam, Likyalı! 👋'), findsOneWidget);
      expect(find.text('Ürün Ekle'), findsOneWidget);
      expect(find.text('Onarım Talebi'), findsOneWidget);
      expect(find.text('Biletlerim'), findsOneWidget);
    });

    testWidgets('ProductListScreen renders product title and filter chips', (WidgetTester tester) async {
      await tester.pumpWidget(
        const MaterialApp(
          home: ProductListScreen(),
        ),
      );

      expect(find.text('Adil Masa Pazar Yeri'), findsOneWidget);
      expect(find.text('Gıda & Organik'), findsWidgets);
      expect(find.text('El Sanatları'), findsWidgets);
    });

    testWidgets('MyTicketsScreen renders digital tickets title', (WidgetTester tester) async {
      await tester.pumpWidget(
        const MaterialApp(
          home: MyTicketsScreen(),
        ),
      );

      expect(find.text('Dijital Biletlerim'), findsOneWidget);
      expect(find.text('Girişte bu QR kodu görevliye okutunuz.'), findsWidgets);
    });
  });
}
