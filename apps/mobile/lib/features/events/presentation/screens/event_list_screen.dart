import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/theme/app_theme.dart';

class EventListScreen extends StatelessWidget {
  const EventListScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final sampleEvents = [
      {
        'id': 'evt-1',
        'title': 'Likya Bahar Festivali & Konser',
        'organizer': 'Likya Gençlik & Sanat Kulübü',
        'location': 'Kampüs Ana Amfi Tiyatro',
        'date': '15 Ağustos 2026 • 19:00',
        'price': 'Ücretsiz',
        'capacity': '320 / 500 Kalan',
        'category': 'Konser',
      },
      {
        'id': 'evt-2',
        'title': 'Permakültür & Kompost Atölyesi',
        'organizer': 'Ekolojik Yaşam Topluluğu',
        'location': 'Kampüs Bahçesi & Sera',
        'date': '18 Ağustos 2026 • 14:00',
        'price': '₺30.00',
        'capacity': '12 / 30 Kalan',
        'category': 'Atölye',
      },
      {
        'id': 'evt-3',
        'title': 'Otonom Yapay Zeka Hackathonu',
        'organizer': 'Likya AI Lab',
        'location': 'Mühendislik Fakültesi Konferans Salonu',
        'date': '22 Ağustos 2026 • 09:00',
        'price': 'Ücretsiz',
        'capacity': '45 / 100 Kalan',
        'category': 'Yarışma',
      },
    ];

    return Scaffold(
      appBar: AppBar(
        title: const Text('Topluluk Etkinlikleri'),
      ),
      body: ListView.builder(
        padding: const EdgeInsets.all(16),
        itemCount: sampleEvents.length,
        itemBuilder: (context, index) {
          final event = sampleEvents[index];
          return Card(
            margin: const EdgeInsets.only(bottom: 16),
            child: InkWell(
              onTap: () => context.push('/events/${event['id']}'),
              borderRadius: BorderRadius.circular(20),
              child: Padding(
                padding: const EdgeInsets.all(16.0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Chip(
                          label: Text(event['category'] as String),
                          backgroundColor: AppTheme.primaryColor.withOpacity(0.1),
                          labelStyle: const TextStyle(color: AppTheme.primaryColor, fontWeight: FontWeight.bold),
                        ),
                        Text(
                          event['price'] as String,
                          style: const TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.bold,
                            color: AppTheme.secondaryColor,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 8),

                    Text(
                      event['title'] as String,
                      style: Theme.of(context).textTheme.titleMedium?.copyWith(
                            fontWeight: FontWeight.bold,
                            fontSize: 18,
                          ),
                    ),
                    const SizedBox(height: 6),

                    Text(
                      'Organizatör: ${event['organizer']}',
                      style: const TextStyle(color: AppTheme.textMuted, fontSize: 13),
                    ),
                    const Divider(height: 24),

                    Row(
                      children: [
                        const Icon(Icons.calendar_today_rounded, size: 16, color: AppTheme.primaryLight),
                        const SizedBox(width: 6),
                        Text(event['date'] as String, style: const TextStyle(fontSize: 13)),
                      ],
                    ),
                    const SizedBox(height: 6),

                    Row(
                      children: [
                        const Icon(Icons.location_on_rounded, size: 16, color: AppTheme.secondaryColor),
                        const SizedBox(width: 6),
                        Expanded(
                          child: Text(
                            event['location'] as String,
                            style: const TextStyle(fontSize: 13),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 14),

                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          'Kontenjan: ${event['capacity']}',
                          style: const TextStyle(fontSize: 12, color: AppTheme.textMuted),
                        ),
                        ElevatedButton(
                          onPressed: () => context.push('/events/${event['id']}'),
                          style: ElevatedButton.styleFrom(
                            padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
                          ),
                          child: const Text('İncele & Bilet Al'),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ),
          );
        },
      ),
    );
  }
}
