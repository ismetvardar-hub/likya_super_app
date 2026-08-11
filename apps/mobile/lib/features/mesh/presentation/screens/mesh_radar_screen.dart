import 'package:flutter/material.dart';
import '../../../../core/theme/app_theme.dart';
import '../../../../core/services/mesh_network_service.dart';
import '../../../../core/services/audio_feedback_service.dart';

class MeshRadarScreen extends StatefulWidget {
  const MeshRadarScreen({super.key});

  @override
  State<MeshRadarScreen> createState() => _MeshRadarScreenState();
}

class _MeshRadarScreenState extends State<MeshRadarScreen> with SingleTickerProviderStateMixin {
  late AnimationController _radarController;
  final _msgController = TextEditingController();
  final List<String> _meshBroadcasts = [
    'Zeynep (Rehber): Likya Yolu 4. km etabı açık ve güvenli.',
    'Phaselis Röle: Acil su ikmal noktası amfi tiyatro arkasındadır.',
  ];

  @override
  void initState() {
    super.initState();
    _radarController = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 3),
    )..repeat();
  }

  @override
  void dispose() {
    _radarController.dispose();
    super.dispose();
  }

  void _sendMeshBroadcast() {
    final text = _msgController.text.trim();
    if (text.isEmpty) return;

    AudioFeedbackService().playCoinEarnChime();
    setState(() {
      _meshBroadcasts.insert(0, 'Ben (Mesh): $text');
    });
    _msgController.clear();
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('Mesaj 4 yakındaki Mesh düğümüne aktarıldı (İnternetsiz) 📡')),
    );
  }

  @override
  Widget build(BuildContext context) {
    final nodes = MeshNetworkService().discoveredNodes;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Çevrimdışı Mesh Ağı & Telsiz 📡'),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Üst Radar Kartı
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                gradient: const LinearGradient(
                  colors: [Color(0xFF0D1527), Color(0xFF162238)],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
                borderRadius: BorderRadius.circular(24),
                border: Border.all(color: AppTheme.accentColor.withOpacity(0.4)),
              ),
              child: Column(
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Row(
                        children: [
                          CircleAvatar(radius: 4, backgroundColor: AppTheme.accentColor),
                          SizedBox(width: 8),
                          Text('İNTERNETSİZ P2P RÖLE', style: TextStyle(color: AppTheme.accentColor, fontSize: 11, fontWeight: FontWeight.bold)),
                        ],
                      ),
                      Text('${nodes.length} Aktif Düğüm', style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                    ],
                  ),
                  const SizedBox(height: 20),

                  // Dönen Radar Animasyonu
                  RotationTransition(
                    turns: _radarController,
                    child: Container(
                      width: 100,
                      height: 100,
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        border: Border.all(color: AppTheme.accentColor.withOpacity(0.5), width: 1.5),
                      ),
                      child: Center(
                        child: Container(
                          width: 8,
                          height: 8,
                          decoration: const BoxDecoration(
                            color: AppTheme.accentColor,
                            shape: BoxShape.circle,
                          ),
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(height: 16),
                  const Text(
                    'Bluetooth Low Energy & Wi-Fi Direct ile hücresel hat ve internet olmadan cihazdan cihaza atlayarak iletişim kuruluyor.',
                    style: TextStyle(color: Colors.white70, fontSize: 11),
                    textAlign: TextAlign.center,
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),

            // Yakındaki Mesh Düğümleri
            Text(
              'Bağlı Likya Düğümleri (Mesh Peers)',
              style: Theme.of(context).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 10),

            ...nodes.map((node) {
              return Card(
                margin: const EdgeInsets.only(bottom: 10),
                child: ListTile(
                  leading: CircleAvatar(
                    backgroundColor: AppTheme.primaryColor.withOpacity(0.1),
                    child: const Icon(Icons.sensors, color: AppTheme.primaryColor),
                  ),
                  title: Text(node.peerName, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
                  subtitle: Text(
                    node.isDirectNeighbor ? 'Doğrudan Komşu (1 Atlama)' : 'Çoklu Atlama (Röle: ${node.hopsCount})',
                    style: const TextStyle(fontSize: 11, color: AppTheme.textMuted),
                  ),
                  trailing: Text(
                    '${node.signalRssi} dBm',
                    style: const TextStyle(fontWeight: FontWeight.bold, color: AppTheme.successColor, fontSize: 12),
                  ),
                ),
              );
            }),
            const SizedBox(height: 20),

            // Mesh Mesaj Yayını
            Text(
              'Mesh Telsiz Mesaj Akışı',
              style: Theme.of(context).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 10),

            Container(
              height: 110,
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: Colors.grey.shade200),
              ),
              child: ListView.builder(
                itemCount: _meshBroadcasts.length,
                itemBuilder: (context, index) {
                  return Padding(
                    padding: const EdgeInsets.only(bottom: 6.0),
                    child: Text(_meshBroadcasts[index], style: const TextStyle(fontSize: 12)),
                  );
                },
              ),
            ),
            const SizedBox(height: 10),

            Row(
              children: [
                Expanded(
                  child: TextField(
                    controller: _msgController,
                    decoration: const InputDecoration(
                      hintText: 'Tüm çevreye internetsiz yayınla...',
                      contentPadding: EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                    ),
                    onSubmitted: (_) => _sendMeshBroadcast(),
                  ),
                ),
                const SizedBox(width: 8),
                IconButton.filled(
                  onPressed: _sendMeshBroadcast,
                  icon: const Icon(Icons.cell_tower),
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
