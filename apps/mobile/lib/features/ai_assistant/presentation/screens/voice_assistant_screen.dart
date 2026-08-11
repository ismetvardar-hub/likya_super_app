import 'package:flutter/material.dart';
import '../../../../core/theme/app_theme.dart';
import '../../../../core/services/audio_feedback_service.dart';
import '../widgets/voice_assistant_wave_widget.dart';

class VoiceAssistantScreen extends StatefulWidget {
  const VoiceAssistantScreen({super.key});

  @override
  State<VoiceAssistantScreen> createState() => _VoiceAssistantScreenState();
}

class _VoiceAssistantScreenState extends State<VoiceAssistantScreen> {
  bool _isListening = true;
  String _userSpokenText = 'Bugün kampüste saat kaçta konser var?';
  String _aiResponseText = 'Merhaba efendim! Bugün saat 19:00\'da Açık Hava Amfi Tiyatrosu\'nda Likya Bahar Konseri gerçekleştirilecek. Ücretsiz biletinizi rezerve edebilirim.';

  void _toggleMic() {
    AudioFeedbackService().playCoinEarnChime();
    setState(() {
      _isListening = !_isListening;
      if (_isListening) {
        _userSpokenText = 'Dinliyorum...';
        _aiResponseText = '';
      } else {
        _userSpokenText = 'En yakın onarım atölyesi nerede?';
        _aiResponseText = 'Mühendislik binası zemin katındaki Maker Atölyesi 120 metre mesafede açıktır efendim.';
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0D1527),
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        title: const Text('Likya Sesli AI Asistanı 🎙️'),
        elevation: 0,
      ),
      body: Padding(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          children: [
            const Spacer(),

            // AI Küre & Dalga Görseli
            Container(
              width: 140,
              height: 140,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                gradient: const RadialGradient(
                  colors: [Color(0xFF38B6FF), Color(0xFF0F4C81)],
                ),
                boxShadow: [
                  BoxShadow(
                    color: const Color(0xFF38B6FF).withValues(alpha: 0.5),
                    blurRadius: 30,
                    spreadRadius: 6,
                  ),
                ],
              ),
              child: const Icon(Icons.auto_awesome, color: Colors.white, size: 54),
            ),
            const SizedBox(height: 32),

            // Ses Dalgaları
            VoiceAssistantWaveWidget(isListening: _isListening),
            const SizedBox(height: 36),

            // Kullanıcının Söylediği Cümle
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
              decoration: BoxDecoration(
                color: Colors.white.withValues(alpha: 0.06),
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: Colors.white12),
              ),
              child: Text(
                '"$_userSpokenText"',
                style: const TextStyle(color: Colors.white70, fontSize: 15, fontStyle: FontStyle.italic),
                textAlign: TextAlign.center,
              ),
            ),
            const SizedBox(height: 20),

            // AI Sesli Yanıtı
            if (_aiResponseText.isNotEmpty)
              Container(
                padding: const EdgeInsets.all(18),
                decoration: BoxDecoration(
                  color: AppTheme.primaryColor.withValues(alpha: 0.3),
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(color: const Color(0xFF38B6FF).withValues(alpha: 0.4)),
                ),
                child: Text(
                  _aiResponseText,
                  style: const TextStyle(color: Colors.white, fontSize: 14, height: 1.4),
                  textAlign: TextAlign.center,
                ),
              ),

            const Spacer(),

            // Mikrofon Açma / Kapatma Butonu
            GestureDetector(
              onTap: _toggleMic,
              child: CircleAvatar(
                radius: 38,
                backgroundColor: _isListening ? Colors.redAccent : const Color(0xFF38B6FF),
                child: Icon(
                  _isListening ? Icons.mic : Icons.mic_none,
                  color: Colors.white,
                  size: 36,
                ),
              ),
            ),
            const SizedBox(height: 10),
            Text(
              _isListening ? 'Konuşmanız dinleniyor...' : 'Konuşmak için dokunun',
              style: const TextStyle(color: Colors.white60, fontSize: 12),
            ),
            const SizedBox(height: 20),
          ],
        ),
      ),
    );
  }
}
