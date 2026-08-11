import 'package:flutter/material.dart';
import '../../../../core/theme/app_theme.dart';
import '../../../../core/services/audio_feedback_service.dart';

class NatureSoundscapeScreen extends StatefulWidget {
  const NatureSoundscapeScreen({super.key});

  @override
  State<NatureSoundscapeScreen> createState() => _NatureSoundscapeScreenState();
}

class _NatureSoundscapeScreenState extends State<NatureSoundscapeScreen> {
  String? _activeSoundTitle;

  final List<Map<String, dynamic>> _soundscapes = [
    {
      'title': 'Phaselis Koyu & Akdeniz Dalgaları',
      'icon': '🌊',
      'sub': 'Sakinleştirici kıyı ve çakıl taşı sesleri',
      'color': const Color(0xFF0F4C81),
    },
    {
      'title': 'Toros Sedir Ormanı & Ilık Rüzgar',
      'icon': '🌲',
      'sub': 'Derin odaklanma ve çam hışırtısı',
      'color': AppTheme.accentColor,
    },
    {
      'title': 'Olympos Vadisi & Gece Ateşi',
      'icon': '🔥',
      'sub': 'Çıtırdayan odun ateşi ve cırcır böcekleri',
      'color': AppTheme.secondaryColor,
    },
    {
      'title': 'Likya Yaylası & Doğal Yağmur',
      'icon': '🌧️',
      'sub': 'Beyaz gürültü ve yaprak damlaları',
      'color': const Color(0xFF4A5568),
    },
  ];

  void _toggleSound(String title) {
    AudioFeedbackService().playCoinEarnChime();
    setState(() {
      if (_activeSoundTitle == title) {
        _activeSoundTitle = null;
      } else {
        _activeSoundTitle = title;
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Akustik Doğa Sesleri & Odak 🧘'),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Üst Bilgilendirme
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                gradient: const LinearGradient(
                  colors: [Color(0xFF2C3E50), Color(0xFF4CA1AF)],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
                borderRadius: BorderRadius.circular(24),
                boxShadow: [
                  BoxShadow(color: const Color(0xFF4CA1AF).withValues(alpha: 0.3), blurRadius: 16, offset: const Offset(0, 6)),
                ],
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text('Likya Doğal Akustiği', style: TextStyle(color: Colors.white70, fontSize: 12, fontWeight: FontWeight.bold)),
                      Icon(Icons.spa_rounded, color: Colors.white, size: 28),
                    ],
                  ),
                  const SizedBox(height: 10),
                  Text(
                    _activeSoundTitle != null ? 'Çalıyor: $_activeSoundTitle' : 'Zihnini Dinlendir & Odaklan 🍃',
                    style: const TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold),
                  ),
                  const SizedBox(height: 4),
                  const Text(
                    'Ders çalışırken veya meditasyon yaparken Likya havzasının otantik doğa kayıtlarını dinleyin.',
                    style: TextStyle(color: Colors.white70, fontSize: 12),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),

            Text(
              'Doğal Ambiyans Sesleri',
              style: Theme.of(context).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 12),

            ..._soundscapes.map((s) {
              final isPlaying = _activeSoundTitle == s['title'];
              return Card(
                margin: const EdgeInsets.only(bottom: 12),
                color: isPlaying ? AppTheme.primaryColor.withValues(alpha: 0.08) : Colors.white,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(18),
                  side: BorderSide(
                    color: isPlaying ? AppTheme.primaryColor : Colors.transparent,
                    width: 1.5,
                  ),
                ),
                child: ListTile(
                  contentPadding: const EdgeInsets.all(14),
                  onTap: () => _toggleSound(s['title'] as String),
                  leading: Text(s['icon'] as String, style: const TextStyle(fontSize: 30)),
                  title: Text(s['title'] as String, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
                  subtitle: Text(s['sub'] as String, style: const TextStyle(fontSize: 12, color: AppTheme.textMuted)),
                  trailing: CircleAvatar(
                    backgroundColor: isPlaying ? AppTheme.secondaryColor : Colors.grey.shade200,
                    child: Icon(
                      isPlaying ? Icons.pause : Icons.play_arrow,
                      color: isPlaying ? Colors.white : AppTheme.textDark,
                    ),
                  ),
                ),
              );
            }),
          ],
        ),
      ),
    );
  }
}
