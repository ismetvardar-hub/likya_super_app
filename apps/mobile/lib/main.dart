import 'package:flutter/material.dart';
import 'core/theme/app_theme.dart';
import 'core/router/app_router.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  // SupabaseService.initialize(); // Uygulama başlatılırken Supabase istemcisi kurulur
  runApp(const LikyaSuperApp());
}

class LikyaSuperApp extends StatelessWidget {
  const LikyaSuperApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp.router(
      title: 'Likya Super-App',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.lightTheme,
      routerConfig: AppRouter.router,
    );
  }
}
