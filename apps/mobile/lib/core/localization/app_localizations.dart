class AppLocalizations {
  final String languageCode;

  AppLocalizations(this.languageCode);

  static final Map<String, Map<String, String>> _localizedValues = {
    'tr': {
      'app_title': 'Likya Super-App',
      'welcome_greeting': 'Selam, Likyalı! 👋',
      'campus_stream': 'Sürdürülebilir Kampüs & Topluluk Akışı',
      'nav_campus': 'Kampüs',
      'nav_fair_market': 'Adil Masa',
      'nav_events': 'Etkinlik',
      'nav_tickets': 'Biletler',
      'nav_repair': 'Onarım',
      'nav_assistant': 'AI Asistan',
      'quick_add_product': 'Ürün Ekle',
      'quick_repair': 'Onarım Talebi',
      'quick_tickets': 'Biletlerim',
      'eco_impact_title': 'Döngüsel Kampüs Etkisi ♻️',
      'eco_impact_desc': 'Bu ay 142 eşya onarıldı, 385 adil ürün takas edildi!',
      'featured_events': 'Yaklaşan Etkinlikler 🎟️',
      'fair_products_title': 'Adil Masa Öne Çıkanlar 🌾',
      'see_all': 'Tümünü Gör →',
      'wallet_title': 'Likya Kampüs Cüzdanım',
      'balance': 'Bakiye',
      'points': 'Eko-Puan',
    },
    'en': {
      'app_title': 'Likya Super-App',
      'welcome_greeting': 'Hello, Lycian! 👋',
      'campus_stream': 'Sustainable Campus & Community Feed',
      'nav_campus': 'Campus',
      'nav_fair_market': 'Fair Market',
      'nav_events': 'Events',
      'nav_tickets': 'Tickets',
      'nav_repair': 'Repair',
      'nav_assistant': 'AI Assistant',
      'quick_add_product': 'List Item',
      'quick_repair': 'Repair Request',
      'quick_tickets': 'My Tickets',
      'eco_impact_title': 'Circular Campus Impact ♻️',
      'eco_impact_desc': '142 items repaired and 385 fair trade goods exchanged this month!',
      'featured_events': 'Upcoming Events 🎟️',
      'fair_products_title': 'Fair Market Highlights 🌾',
      'see_all': 'See All →',
      'wallet_title': 'Likya Campus Wallet',
      'balance': 'Balance',
      'points': 'Eco-Points',
    },
  };

  String translate(String key) {
    return _localizedValues[languageCode]?[key] ?? key;
  }
}
