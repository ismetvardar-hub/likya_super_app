import 'package:flutter/material.dart';
import '../../../../core/theme/app_theme.dart';

/// ============================================================================
/// LİKYA SAHA / ÇALIŞAN (STAFF/CREW) PANELİ
/// Faz 2: Turnike doğrulama, bilet tarama ve anlık görev/ikram talimatları
/// ============================================================================

class StaffPanelScreen extends StatefulWidget {
  const StaffPanelScreen({super.key});

  @override
  State<StaffPanelScreen> createState() => _StaffPanelScreenState();
}

class _StaffPanelScreenState extends State<StaffPanelScreen> {
  // Örnek görevler
  final List<Map<String, dynamic>> _tasks = [
    {'id': 'TSK-101', 'title': 'Parsel #04: Karavan Çıkış & Temizlik', 'zone': 'Karavan Parkı', 'status': 'Beklemede', 'priority': 'Yüksek'},
    {'id': 'TSK-102', 'title': 'Padel Kortu #1 Ağ Kontrolü', 'zone': 'Spor Kompleksi', 'status': 'Beklemede', 'priority': 'Normal'},
    {'id': 'TSK-103', 'title': 'GES Canopi Panel Voltaj Ölçümü', 'zone': 'Eco-Tech Center', 'status': 'Tamamlandı', 'priority': 'Normal'},
  ];

  // Örnek bilet doğrulama
  String _ticketCode = '';
  String? _ticketResult;

  void _verifyTicket() {
    if (_ticketCode.startsWith('LIKYA-TICKET')) {
      setState(() => _ticketResult = '✅ Geçerli Bilet — Giriş İzni Verildi');
    } else {
      setState(() => _ticketResult = '❌ Geçersiz Bilet');
    }
  }

  void _completeTask(String id) {
    setState(() {
      final index = _tasks.indexWhere((t) => t['id'] == id);
      if (index != -1) {
        _tasks[index]['status'] = 'Tamamlandı';
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.darkBg,
      appBar: AppBar(
        title: const Text('🟡 Saha / Çalışan Paneli'),
        backgroundColor: AppTheme.darkBg,
        foregroundColor: Colors.white,
        elevation: 0,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Turnike Bilet Doğrulama
            _buildTurnikeBolumu(),
            const SizedBox(height: 16),

            // Görev Listesi
            _buildGorevBolumu(),
          ],
        ),
      ),
    );
  }

  Widget _buildTurnikeBolumu() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          colors: [Color(0xFF10B981), Color(0xFF48bb78)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: const Color(0xFF48bb78).withOpacity(0.3),
            blurRadius: 20,
            offset: const Offset(0, 8),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            '🎟️ TURNİKE BİLET DOĞRULAMA',
            style: TextStyle(
              color: Colors.white,
              fontSize: 16,
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 12),
          TextField(
            onChanged: (value) => _ticketCode = value,
            decoration: InputDecoration(
              hintText: 'QR kodu tarayın veya yapıştırın...',
              hintStyle: const TextStyle(color: Colors.white54),
              filled: true,
              fillColor: Colors.white.withOpacity(0.1),
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(12),
                borderSide: BorderSide.none,
              ),
              prefixIcon: const Icon(Icons.qr_code_scanner, color: Colors.white),
            ),
            style: const TextStyle(color: Colors.white),
          ),
          const SizedBox(height: 12),
          SizedBox(
            width: double.infinity,
            child: ElevatedButton(
              onPressed: _verifyTicket,
              style: ElevatedButton.styleFrom(
                backgroundColor: Colors.white,
                foregroundColor: const Color(0xFF10B981),
                padding: const EdgeInsets.symmetric(vertical: 14),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
              ),
              child: const Text(
                '📷 Bileti Doğrula',
                style: TextStyle(fontWeight: FontWeight.bold),
              ),
            ),
          ),
          if (_ticketResult != null) ...[
            const SizedBox(height: 12),
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: Colors.white.withOpacity(0.15),
                borderRadius: BorderRadius.circular(10),
              ),
              child: Text(
                _ticketResult!,
                style: const TextStyle(
                  color: Colors.white,
                  fontSize: 14,
                  fontWeight: FontWeight.bold,
                ),
                textAlign: TextAlign.center,
              ),
            ),
          ],
        ],
      ),
    );
  }

  Widget _buildGorevBolumu() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.05),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.white.withOpacity(0.1)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            '📋 SAHA GÖREVLERİ',
            style: TextStyle(
              color: Colors.white,
              fontSize: 16,
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 12),
          ..._tasks.map((task) => Padding(
            padding: const EdgeInsets.symmetric(vertical: 8),
            child: Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: Colors.white.withOpacity(0.03),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: Colors.white.withOpacity(0.08)),
              ),
              child: Row(
                children: [
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          task['title'],
                          style: const TextStyle(
                            color: Colors.white,
                            fontSize: 13,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          '${task['id']} • ${task['zone']}',
                          style: const TextStyle(color: Colors.white54, fontSize: 11),
                        ),
                      ],
                    ),
                  ),
                  if (task['status'] == 'Beklemede')
                    ElevatedButton(
                      onPressed: () => _completeTask(task['id']),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFFecc94b),
                        foregroundColor: Colors.black,
                        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(8),
                        ),
                      ),
                      child: const Text('✓ Tamamla', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold)),
                    )
                  else
                    const Text(
                      '✅ Tamamlandı',
                      style: TextStyle(
                        color: Color(0xFF48bb78),
                        fontSize: 12,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                ],
              ),
            ),
          )),
        ],
      ),
    );
  }
}
