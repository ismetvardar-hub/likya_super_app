import 'package:flutter/material.dart';
import '../../../../core/theme/app_theme.dart';
import '../../../../core/services/audio_feedback_service.dart';

class LiveEventInteractionScreen extends StatefulWidget {
  final String eventTitle;

  const LiveEventInteractionScreen({
    super.key,
    this.eventTitle = 'Likya Bahar Şenliği & Akustik Konser',
  });

  @override
  State<LiveEventInteractionScreen> createState() => _LiveEventInteractionScreenState();
}

class _LiveEventInteractionScreenState extends State<LiveEventInteractionScreen> {
  int _applauseCount = 428;
  String _selectedSongVote = 'Akdeniz Akşamları (Akustik)';

  final Map<String, int> _songVotes = {
    'Akdeniz Akşamları (Akustik)': 142,
    'Likya Rüzgarı & Ney Solosu': 98,
    'Toros Zeybeği Modern Yorum': 76,
  };

  final List<String> _liveMessages = [
    'Zeynep: Sahne ışıkları ve akustik harika! 🔥',
    'Ahmet: Bir sonraki şarkı ne zaman oylanacak?',
    'Mert: Likya orkestrası muhteşem çalıyor 👏',
  ];

  final _textController = TextEditingController();

  void _sendApplause() {
    setState(() => _applauseCount++);
    AudioFeedbackService().playCoinEarnChime();
  }

  void _sendMessage() {
    final text = _textController.text.trim();
    if (text.isEmpty) return;
    setState(() {
      _liveMessages.insert(0, 'Ben: $text');
    });
    _textController.clear();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Canlı Etkinlik Etkileşimi 🎙️'),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Canlı Etkinlik Başlığı
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                gradient: AppTheme.primaryGradient,
                borderRadius: BorderRadius.circular(20),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                        decoration: BoxDecoration(
                          color: Colors.redAccent,
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: const Row(
                          children: [
                            CircleAvatar(radius: 4, backgroundColor: Colors.white),
                            SizedBox(width: 6),
                            Text('CANLI YAYINDA', style: TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.bold)),
                          ],
                        ),
                      ),
                      Text('$_applauseCount Alkış 👏', style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                    ],
                  ),
                  const SizedBox(height: 10),
                  Text(
                    widget.eventTitle,
                    style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 18),
                  ),
                  const SizedBox(height: 4),
                  const Text('Kampüs Ana Amfi Sahnesi • 320 Katılımcı Canlı', style: TextStyle(color: Colors.white70, fontSize: 12)),
                ],
              ),
            ),
            const SizedBox(height: 20),

            // Canlı Alkış Gönder Butonu
            Center(
              child: ElevatedButton.icon(
                onPressed: _sendApplause,
                icon: const Icon(Icons.favorite, color: Colors.redAccent),
                label: const Text('Sanatçıya Canlı Alkış Gönder 👏'),
                style: ElevatedButton.styleFrom(
                  padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 14),
                  backgroundColor: AppTheme.secondaryColor,
                ),
              ),
            ),
            const SizedBox(height: 24),

            // Anlık Şarkı / Bis Oylaması
            Text(
              'Sıradaki Şarkıyı Oyla! 🎵',
              style: Theme.of(context).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 10),

            ..._songVotes.entries.map((entry) {
              final isSelected = _selectedSongVote == entry.key;
              return Card(
                margin: const EdgeInsets.only(bottom: 8),
                color: isSelected ? AppTheme.primaryColor.withValues(alpha: 0.08) : Colors.white,
                child: ListTile(
                  onTap: () {
                    setState(() => _selectedSongVote = entry.key);
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(content: Text('Oyunuz "${entry.key}" şarkısına kaydedildi!')),
                    );
                  },
                  leading: Icon(
                    isSelected ? Icons.check_circle : Icons.radio_button_unchecked,
                    color: isSelected ? AppTheme.primaryColor : Colors.grey,
                  ),
                  title: Text(entry.key, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600)),
                  trailing: Text('${entry.value} Oy', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 12)),
                ),
              );
            }),
            const SizedBox(height: 24),

            // Canlı Katılımcı Mesaj Akışı
            Text(
              'Canlı Seyirci Akışı',
              style: Theme.of(context).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 10),

            Container(
              height: 140,
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: Colors.grey.shade200),
              ),
              child: ListView.builder(
                itemCount: _liveMessages.length,
                itemBuilder: (context, index) {
                  return Padding(
                    padding: const EdgeInsets.only(bottom: 6.0),
                    child: Text(_liveMessages[index], style: const TextStyle(fontSize: 12)),
                  );
                },
              ),
            ),
            const SizedBox(height: 10),

            Row(
              children: [
                Expanded(
                  child: TextField(
                    controller: _textController,
                    decoration: const InputDecoration(
                      hintText: 'Sahneye selam gönder...',
                      contentPadding: EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                    ),
                    onSubmitted: (_) => _sendMessage(),
                  ),
                ),
                const SizedBox(width: 8),
                IconButton.filled(
                  onPressed: _sendMessage,
                  icon: const Icon(Icons.send),
                  style: IconButton.styleFrom(backgroundColor: AppTheme.primaryColor),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
