import 'package:flutter/material.dart';
import '../../../../core/theme/app_theme.dart';
import '../../../../core/services/audio_feedback_service.dart';
import '../../domain/models/audio_track_model.dart';

class AudioGuideScreen extends StatefulWidget {
  const AudioGuideScreen({super.key});

  @override
  State<AudioGuideScreen> createState() => _AudioGuideScreenState();
}

class _AudioGuideScreenState extends State<AudioGuideScreen> {
  bool _isPlaying = false;
  double _currentProgress = 0.35;
  int _selectedTrackIndex = 0;

  final List<AudioTrackModel> _tracks = [
    AudioTrackModel(
      id: 'track-1',
      title: 'Phaselis Antik Limanı & Su Kemerleri',
      locationName: 'Likya Yolu 1. Etap',
      durationMinutes: 6,
      narrativeSummary: 'Doğal çam ormanlarıyla kucaklaşan antik liman ticaretinin ve sürdürülebilir su mühendisliğinin öyküsü.',
    ),
    AudioTrackModel(
      id: 'track-2',
      title: 'Olympos Vadisi & Sönmeyen Ateş Yanartaş',
      locationName: 'Likya Yolu 2. Etap',
      durationMinutes: 8,
      narrativeSummary: 'Bellerophon ve Chimera efsanesinden doğan bin yıllık doğal alevler ve Akdeniz biyolojik çeşitliliği.',
    ),
    AudioTrackModel(
      id: 'track-3',
      title: 'Patara Meclis Binası & Demokrasinin Beşiği',
      locationName: 'Likya Birliği Başkenti',
      durationMinutes: 7,
      narrativeSummary: 'Dünyanın ilk demokratik federasyon meclisi ve kum tepelerinin korunması mücadelesi.',
    ),
  ];

  void _togglePlay() {
    setState(() => _isPlaying = !_isPlaying);
    AudioFeedbackService().playCoinEarnChime();
  }

  @override
  Widget build(BuildContext context) {
    final currentTrack = _tracks[_selectedTrackIndex];

    return Scaffold(
      appBar: AppBar(
        title: const Text('Likya Sesli Kültür Rehberi 🎧'),
      ),
      body: Column(
        children: [
          // Üst Albüm / Görsel Kartı
          Expanded(
            child: Container(
              width: double.infinity,
              margin: const EdgeInsets.all(20),
              padding: const EdgeInsets.all(24),
              decoration: BoxDecoration(
                gradient: const LinearGradient(
                  colors: [Color(0xFF0F4C81), Color(0xFF1E3A8A), Color(0xFF0D1527)],
                  begin: Alignment.topCenter,
                  end: Alignment.bottomCenter,
                ),
                borderRadius: BorderRadius.circular(28),
                boxShadow: [
                  BoxShadow(
                    color: AppTheme.primaryColor.withValues(alpha: 0.4),
                    blurRadius: 20,
                    offset: const Offset(0, 8),
                  ),
                ],
              ),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Container(
                    padding: const EdgeInsets.all(20),
                    decoration: BoxDecoration(
                      color: Colors.white.withValues(alpha: 0.1),
                      shape: BoxShape.circle,
                    ),
                    child: const Icon(Icons.temple_buddhist, size: 64, color: Colors.white),
                  ),
                  const SizedBox(height: 20),
                  Text(
                    currentTrack.title,
                    style: const TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold),
                    textAlign: TextAlign.center,
                  ),
                  const SizedBox(height: 6),
                  Text(
                    currentTrack.locationName,
                    style: const TextStyle(color: Colors.white70, fontSize: 13),
                  ),
                  const SizedBox(height: 16),
                  Text(
                    currentTrack.narrativeSummary,
                    style: TextStyle(color: Colors.white.withValues(alpha: 0.8), fontSize: 12, height: 1.4),
                    textAlign: TextAlign.center,
                    maxLines: 3,
                    overflow: TextOverflow.ellipsis,
                  ),
                ],
              ),
            ),
          ),

          // Alt Oynatıcı Kontrolleri
          Container(
            padding: const EdgeInsets.all(24),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: const BorderRadius.vertical(top: Radius.circular(32)),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withValues(alpha: 0.06),
                  blurRadius: 20,
                  offset: const Offset(0, -6),
                ),
              ],
            ),
            child: Column(
              children: [
                // İlerleme Çubuğu
                Slider(
                  value: _currentProgress,
                  onChanged: (val) => setState(() => _currentProgress = val),
                  activeColor: AppTheme.primaryColor,
                  inactiveColor: Colors.grey.shade200,
                ),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text('02:15', style: TextStyle(fontSize: 11, color: Colors.grey.shade600)),
                    Text('0${currentTrack.durationMinutes}:00', style: TextStyle(fontSize: 11, color: Colors.grey.shade600)),
                  ],
                ),
                const SizedBox(height: 12),

                // Butonlar
                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    IconButton(
                      icon: const Icon(Icons.skip_previous_rounded, size: 36),
                      onPressed: () {
                        if (_selectedTrackIndex > 0) {
                          setState(() => _selectedTrackIndex--);
                        }
                      },
                    ),
                    const SizedBox(width: 16),
                    CircleAvatar(
                      radius: 32,
                      backgroundColor: AppTheme.primaryColor,
                      child: IconButton(
                        icon: Icon(_isPlaying ? Icons.pause : Icons.play_arrow, color: Colors.white, size: 36),
                        onPressed: _togglePlay,
                      ),
                    ),
                    const SizedBox(width: 16),
                    IconButton(
                      icon: const Icon(Icons.skip_next_rounded, size: 36),
                      onPressed: () {
                        if (_selectedTrackIndex < _tracks.length - 1) {
                          setState(() => _selectedTrackIndex++);
                        }
                      },
                    ),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
