import 'package:flutter/material.dart';

class UnderwaterAuvScreen extends StatelessWidget {
  const UnderwaterAuvScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Kekova Sualtı AUV Sonarı 🌊'),
        backgroundColor: const Color(0xFF0F4C81),
      ),
      body: Container(
        decoration: const BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topCenter,
            end: Alignment.bottomCenter,
            colors: [Color(0xFF0F4C81), Color(0xFF050A14)],
          ),
        ),
        padding: const EdgeInsets.all(16.0),
        child: Column(
          children: [
            Card(
              color: const Color(0x2200F2FE),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(16),
                side: const BorderSide(color: Color(0xFF00F2FE)),
              ),
              child: const Padding(
                padding: EdgeInsets.all(16.0),
                child: Column(
                  children: [
                    Icon(Icons.waves, size: 48, color: Color(0xFF00F2FE)),
                    SizedBox(height: 8),
                    Text(
                      '34.5m Kekova Batık Şehir Sonar Yayını',
                      style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold),
                    ),
                    SizedBox(height: 4),
                    Text(
                      'Antik Likya amfora ve sualtı merdivenleri tespit edildi.',
                      textAlign: TextAlign.center,
                      style: TextStyle(color: Colors.white70, fontSize: 12),
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
