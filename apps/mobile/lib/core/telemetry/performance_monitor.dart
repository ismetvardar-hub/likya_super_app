import 'dart:developer' as dev;

class PerformanceMetric {
  final String operationName;
  final int durationMs;
  final DateTime timestamp;

  PerformanceMetric({
    required this.operationName,
    required this.durationMs,
    required this.timestamp,
  });
}

class PerformanceMonitor {
  static final PerformanceMonitor _instance = PerformanceMonitor._internal();
  factory PerformanceMonitor() => _instance;
  PerformanceMonitor._internal();

  final List<PerformanceMetric> _metrics = [];

  // İşlem Süresi Ölçümü
  Future<T> trackOperation<T>(String operationName, Future<T> Function() action) async {
    final stopwatch = Stopwatch()..start();
    try {
      final result = await action();
      stopwatch.stop();
      _recordMetric(operationName, stopwatch.elapsedMilliseconds);
      return result;
    } catch (e) {
      stopwatch.stop();
      _recordMetric('$operationName (FAILED)', stopwatch.elapsedMilliseconds);
      rethrow;
    }
  }

  void _recordMetric(String operationName, int durationMs) {
    final metric = PerformanceMetric(
      operationName: operationName,
      durationMs: durationMs,
      timestamp: DateTime.now(),
    );
    _metrics.add(metric);
    dev.log('⏱️ [PERF] $operationName: ${durationMs}ms');
  }

  List<PerformanceMetric> getMetrics() => List.unmodifiable(_metrics);

  double getAverageDuration(String operationName) {
    final matches = _metrics.where((m) => m.operationName == operationName).toList();
    if (matches.isEmpty) return 0.0;
    final total = matches.fold<int>(0, (sum, m) => sum + m.durationMs);
    return total / matches.length;
  }
}
