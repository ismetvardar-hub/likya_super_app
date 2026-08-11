import 'dart:math';
import 'package:flutter/material.dart';
import '../../../../core/theme/app_theme.dart';

class VoiceAssistantWaveWidget extends StatefulWidget {
  final bool isListening;

  const VoiceAssistantWaveWidget({super.key, this.isListening = true});

  @override
  State<VoiceAssistantWaveWidget> createState() => _VoiceAssistantWaveWidgetState();
}

class _VoiceAssistantWaveWidgetState extends State<VoiceAssistantWaveWidget> with SingleTickerProviderStateMixin {
  late AnimationController _controller;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1200),
    )..repeat(reverse: true);
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: _controller,
      builder: (context, child) {
        return Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: List.generate(7, (index) {
            final double heightMultiplier = widget.isListening
                ? sin((_controller.value * pi) + (index * 0.5)).abs()
                : 0.15;
            final double height = 15.0 + (heightMultiplier * 45.0);

            return Container(
              width: 5,
              height: height,
              margin: const EdgeInsets.symmetric(horizontal: 4),
              decoration: BoxDecoration(
                gradient: const LinearGradient(
                  colors: [Color(0xFF38B6FF), AppTheme.accentColor],
                  begin: Alignment.topCenter,
                  end: Alignment.bottomCenter,
                ),
                borderRadius: BorderRadius.circular(4),
                boxShadow: widget.isListening
                    ? [
                        BoxShadow(
                          color: const Color(0xFF38B6FF).withValues(alpha: 0.6),
                          blurRadius: 8,
                        ),
                      ]
                    : [],
              ),
            );
          }),
        );
      },
    );
  }
}
