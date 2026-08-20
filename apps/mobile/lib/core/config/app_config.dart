class AppConfig {
  static const String appName = 'Likya Super-App';
  static const String appVersion = '1.0.0';
  
  // Supabase Configurations (Enviroment veya Config üzerinden alınır)
  static const String supabaseUrl = String.fromEnvironment(
    'SUPABASE_URL',
    defaultValue: 'https://your-supabase-project.supabase.co',
  );

  static const String supabasePublishableKey = String.fromEnvironment(
    'SUPABASE_ANON_KEY',
    defaultValue: 'your-anon-key',
  );
}
