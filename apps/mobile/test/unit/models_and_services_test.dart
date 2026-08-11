import 'package:flutter_test/flutter_test.dart';
import 'package:likya_mobile/features/auth/domain/models/user_model.dart';
import 'package:likya_mobile/features/fair_products/domain/models/fair_product_model.dart';
import 'package:likya_mobile/features/events/domain/models/event_model.dart';
import 'package:likya_mobile/features/tickets/domain/models/ticket_model.dart';
import 'package:likya_mobile/features/repair_donations/domain/models/repair_donation_model.dart';

void main() {
  group('Likya Model Unit Tests', () {
    test('UserModel JSON Serialization & Deserialization Test', () {
      final json = {
        'id': 'usr-123',
        'email': 'test@likya.org',
        'full_name': 'Ahmet Yılmaz',
        'phone': '+905551112233',
        'role': 'seller',
        'avatar_url': 'https://example.com/avatar.jpg',
        'created_at': '2026-08-10T12:00:00Z',
      };

      final user = UserModel.fromJson(json);

      expect(user.id, 'usr-123');
      expect(user.email, 'test@likya.org');
      expect(user.fullName, 'Ahmet Yılmaz');
      expect(user.role, 'seller');

      final outputJson = user.toJson();
      expect(outputJson['id'], 'usr-123');
      expect(outputJson['email'], 'test@likya.org');
    });

    test('FairProductModel JSON Serialization Test', () {
      final json = {
        'id': 'prd-456',
        'seller_id': 'usr-123',
        'name': 'Zeytinyağı 1L',
        'description': 'Doğal soğuk sıkım',
        'price': 180.50,
        'stock_quantity': 10,
        'category': 'Gıda & Organik',
        'status': 'active',
        'created_at': '2026-08-10T14:00:00Z',
      };

      final product = FairProductModel.fromJson(json);

      expect(product.id, 'prd-456');
      expect(product.price, 180.50);
      expect(product.stockQuantity, 10);
      expect(product.category, 'Gıda & Organik');
    });

    test('EventModel JSON Serialization Test', () {
      final json = {
        'id': 'evt-789',
        'organizer_id': 'usr-123',
        'title': 'Bahar Konseri',
        'location': 'Amfi Tiyatro',
        'start_time': '2026-08-15T19:00:00Z',
        'end_time': '2026-08-15T23:00:00Z',
        'total_capacity': 500,
        'available_capacity': 300,
        'ticket_price': 0.0,
        'status': 'published',
        'created_at': '2026-08-10T10:00:00Z',
      };

      final event = EventModel.fromJson(json);

      expect(event.id, 'evt-789');
      expect(event.title, 'Bahar Konseri');
      expect(event.totalCapacity, 500);
      expect(event.availableCapacity, 300);
    });

    test('TicketModel JSON Serialization Test', () {
      final json = {
        'id': 'tkt-111',
        'event_id': 'evt-789',
        'user_id': 'usr-999',
        'status': 'valid',
        'qr_code': 'LIKYA-QR-111-999',
        'created_at': '2026-08-10T15:00:00Z',
      };

      final ticket = TicketModel.fromJson(json);

      expect(ticket.id, 'tkt-111');
      expect(ticket.qrCode, 'LIKYA-QR-111-999');
      expect(ticket.status, 'valid');
    });

    test('RepairDonationModel JSON Serialization Test', () {
      final json = {
        'id': 'rep-222',
        'donor_id': 'usr-999',
        'item_name': 'Dizüstü Bilgisayar',
        'category': 'Elektronik',
        'repair_status': 'in_repair',
        'donation_amount': 0.0,
        'location': 'Kampüs Binası',
        'created_at': '2026-08-10T16:00:00Z',
      };

      final repairItem = RepairDonationModel.fromJson(json);

      expect(repairItem.id, 'rep-222');
      expect(repairItem.itemName, 'Dizüstü Bilgisayar');
      expect(repairItem.repairStatus, 'in_repair');
    });
  });
}
