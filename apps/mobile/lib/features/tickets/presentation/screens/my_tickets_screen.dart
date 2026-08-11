import 'package:flutter/material.dart';
import 'package:qr_flutter/qr_flutter.dart';
import '../../../../core/theme/app_theme.dart';

class MyTicketsScreen extends StatelessWidget {
  const MyTicketsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final sampleTickets = [
      {
        'id': 'tkt-001',
        'eventTitle': 'Likya Bahar Şenliği & Konser',
        'date': '15 Ağustos 2026 • 19:00',
        'location': 'Kampüs Ana Amfi Tiyatro',
        'qrData': 'LIKYA-TICKET-2026-EVENT-001-USER-777',
        'status': 'Geçerli',
      },
      {
        'id': 'tkt-002',
        'eventTitle': 'Permakültür Atölyesi',
        'date': '18 Ağustos 2026 • 14:00',
        'location': 'Kampüs Bahçesi',
        'qrData': 'LIKYA-TICKET-2026-EVENT-002-USER-777',
        'status': 'Geçerli',
      },
    ];

    return Scaffold(
      appBar: AppBar(
        title: const Text('Dijital Biletlerim'),
      ),
      body: ListView.builder(
        padding: const EdgeInsets.all(16),
        itemCount: sampleTickets.length,
        itemBuilder: (context, index) {
          final ticket = sampleTickets[index];
          return Card(
            margin: const EdgeInsets.only(bottom: 20),
            child: Padding(
              padding: const EdgeInsets.all(20.0),
              child: Column(
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        'Bilet #${ticket['id']}',
                        style: const TextStyle(fontWeight: FontWeight.bold, color: AppTheme.primaryColor),
                      ),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                        decoration: BoxDecoration(
                          color: AppTheme.successColor.withValues(alpha: 0.15),
                          borderRadius: BorderRadius.circular(10),
                        ),
                        child: Text(
                          ticket['status'] as String,
                          style: const TextStyle(
                            color: AppTheme.successColor,
                            fontWeight: FontWeight.bold,
                            fontSize: 12,
                          ),
                        ),
                      ),
                    ],
                  ),
                  const Divider(height: 24),

                  Text(
                    ticket['eventTitle'] as String,
                    style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                    textAlign: TextAlign.center,
                  ),
                  const SizedBox(height: 6),
                  Text(
                    '${ticket['date']} | ${ticket['location']}',
                    style: const TextStyle(color: AppTheme.textMuted, fontSize: 13),
                    textAlign: TextAlign.center,
                  ),
                  const SizedBox(height: 20),

                  // QR Kod Gösterici Widget
                  Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(color: Colors.grey.shade200),
                    ),
                    child: QrImageView(
                      data: ticket['qrData'] as String,
                      version: QrVersions.auto,
                      size: 180.0,
                      backgroundColor: Colors.white,
                      eyeStyle: const QrEyeStyle(
                        eyeShape: QrEyeShape.square,
                        color: AppTheme.primaryColor,
                      ),
                    ),
                  ),
                  const SizedBox(height: 12),

                  const Text(
                    'Girişte bu QR kodu görevliye okutunuz.',
                    style: TextStyle(fontSize: 12, color: AppTheme.textMuted),
                  ),
                ],
              ),
            ),
          );
        },
      ),
    );
  }
}
