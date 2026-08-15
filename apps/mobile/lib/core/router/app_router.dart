import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../theme/app_theme.dart';
import '../../features/dashboard/presentation/screens/dashboard_screen.dart';
import '../../features/fair_products/presentation/screens/product_list_screen.dart';
import '../../features/fair_products/presentation/screens/product_detail_screen.dart';
import '../../features/fair_products/presentation/screens/add_product_screen.dart';
import '../../features/events/presentation/screens/event_list_screen.dart';
import '../../features/events/presentation/screens/event_detail_screen.dart';
import '../../features/events/presentation/screens/live_event_interaction_screen.dart';
import '../../features/tickets/presentation/screens/my_tickets_screen.dart';
import '../../features/tickets/presentation/screens/qr_scanner_screen.dart';
import '../../features/repair_donations/presentation/screens/repair_donation_screen.dart';
import '../../features/repair_donations/presentation/screens/create_repair_request_screen.dart';
import '../../features/ai_assistant/presentation/screens/ai_assistant_screen.dart';
import '../../features/ai_assistant/presentation/screens/voice_assistant_screen.dart';
import '../../features/wallet/presentation/screens/wallet_screen.dart';
import '../../features/map/presentation/screens/campus_map_screen.dart';
import '../../features/chat/presentation/screens/chat_list_screen.dart';
import '../../features/gamification/presentation/screens/leaderboard_screen.dart';
import '../../features/forest/presentation/screens/forest_screen.dart';
import '../../features/mobility/presentation/screens/bike_mobility_screen.dart';
import '../../features/food_rescue/presentation/screens/food_rescue_screen.dart';
import '../../features/volunteer/presentation/screens/volunteer_screen.dart';
import '../../features/passport/presentation/screens/passport_screen.dart';
import '../../features/smart_locker/presentation/screens/smart_locker_screen.dart';
import '../../features/energy/presentation/screens/solar_grid_screen.dart';
import '../../features/autonomous_logistics/presentation/screens/drone_delivery_screen.dart';
import '../../features/compost/presentation/screens/compost_screen.dart';
import '../../features/gateway/presentation/screens/campus_selector_screen.dart';
import '../../features/identity/presentation/screens/digital_id_screen.dart';
import '../../features/carbon_credits/presentation/screens/carbon_credits_screen.dart';
import '../../features/emergency/presentation/screens/sar_drone_dispatch_screen.dart';
import '../../features/water_refill/presentation/screens/water_refill_screen.dart';
import '../../features/packaging_deposit/presentation/screens/packaging_deposit_screen.dart';
import '../../features/soundscapes/presentation/screens/nature_soundscape_screen.dart';
import '../../features/book_sharing/presentation/screens/book_sharing_screen.dart';
import '../../features/smart_laundry/presentation/screens/smart_laundry_screen.dart';
import '../../features/transit/presentation/screens/eco_transit_screen.dart';
import '../../features/mesh/presentation/screens/mesh_radar_screen.dart';
import '../../features/sensors/presentation/screens/environmental_sensors_screen.dart';
import '../../features/audio_guide/presentation/screens/audio_guide_screen.dart';
import '../../features/ar_lens/presentation/screens/ar_lens_screen.dart';
import '../../features/emergency/presentation/screens/emergency_sos_screen.dart';
import '../../features/showcase/presentation/screens/component_showcase_screen.dart';
import '../../features/auth/presentation/screens/login_screen.dart';
import '../../features/auth/presentation/screens/register_screen.dart';

final GlobalKey<NavigatorState> _rootNavigatorKey = GlobalKey<NavigatorState>(debugLabel: 'root');
final GlobalKey<NavigatorState> _shellNavigatorKey = GlobalKey<NavigatorState>(debugLabel: 'shell');

class AppRouter {
  static final GoRouter router = GoRouter(
    navigatorKey: _rootNavigatorKey,
    initialLocation: '/',
    routes: [
      ShellRoute(
        navigatorKey: _shellNavigatorKey,
        builder: (context, state, child) {
          return MainShellScaffold(child: child);
        },
        routes: [
          GoRoute(
            path: '/',
            builder: (context, state) => const DashboardScreen(),
          ),
          GoRoute(
            path: '/fair-products',
            builder: (context, state) => const ProductListScreen(),
            routes: [
              GoRoute(
                path: 'add',
                parentNavigatorKey: _rootNavigatorKey,
                builder: (context, state) => const AddProductScreen(),
              ),
              GoRoute(
                path: ':id',
                parentNavigatorKey: _rootNavigatorKey,
                builder: (context, state) {
                  final productId = state.pathParameters['id'] ?? '';
                  return ProductDetailScreen(productId: productId);
                },
              ),
            ],
          ),
          GoRoute(
            path: '/events',
            builder: (context, state) => const EventListScreen(),
            routes: [
              GoRoute(
                path: 'live',
                parentNavigatorKey: _rootNavigatorKey,
                builder: (context, state) => const LiveEventInteractionScreen(),
              ),
              GoRoute(
                path: ':id',
                parentNavigatorKey: _rootNavigatorKey,
                builder: (context, state) {
                  final eventId = state.pathParameters['id'] ?? '';
                  return EventDetailScreen(eventId: eventId);
                },
              ),
            ],
          ),
          GoRoute(
            path: '/tickets',
            builder: (context, state) => const MyTicketsScreen(),
            routes: [
              GoRoute(
                path: 'scan',
                parentNavigatorKey: _rootNavigatorKey,
                builder: (context, state) => const QrScannerScreen(),
              ),
            ],
          ),
          GoRoute(
            path: '/repair-donations',
            builder: (context, state) => const RepairDonationScreen(),
            routes: [
              GoRoute(
                path: 'create',
                parentNavigatorKey: _rootNavigatorKey,
                builder: (context, state) => const CreateRepairRequestScreen(),
              ),
            ],
          ),
          GoRoute(
            path: '/map',
            builder: (context, state) => const CampusMapScreen(),
          ),
          GoRoute(
            path: '/ai-assistant',
            builder: (context, state) => const AIAssistantScreen(),
          ),
        ],
      ),
      GoRoute(
        path: '/voice-assistant',
        parentNavigatorKey: _rootNavigatorKey,
        builder: (context, state) => const VoiceAssistantScreen(),
      ),
      GoRoute(
        path: '/wallet',
        parentNavigatorKey: _rootNavigatorKey,
        builder: (context, state) => const WalletScreen(),
      ),
      GoRoute(
        path: '/chats',
        parentNavigatorKey: _rootNavigatorKey,
        builder: (context, state) => const ChatListScreen(),
      ),
      GoRoute(
        path: '/leaderboard',
        parentNavigatorKey: _rootNavigatorKey,
        builder: (context, state) => const LeaderboardScreen(),
      ),
      GoRoute(
        path: '/forest',
        parentNavigatorKey: _rootNavigatorKey,
        builder: (context, state) => const ForestScreen(),
      ),
      GoRoute(
        path: '/mobility',
        parentNavigatorKey: _rootNavigatorKey,
        builder: (context, state) => const BikeMobilityScreen(),
      ),
      GoRoute(
        path: '/food-rescue',
        parentNavigatorKey: _rootNavigatorKey,
        builder: (context, state) => const FoodRescueScreen(),
      ),
      GoRoute(
        path: '/volunteer',
        parentNavigatorKey: _rootNavigatorKey,
        builder: (context, state) => const VolunteerScreen(),
      ),
      GoRoute(
        path: '/passport',
        parentNavigatorKey: _rootNavigatorKey,
        builder: (context, state) => const PassportScreen(),
      ),
      GoRoute(
        path: '/smart-locker',
        parentNavigatorKey: _rootNavigatorKey,
        builder: (context, state) => const SmartLockerScreen(),
      ),
      GoRoute(
        path: '/solar-grid',
        parentNavigatorKey: _rootNavigatorKey,
        builder: (context, state) => const SolarGridScreen(),
      ),
      GoRoute(
        path: '/drone-delivery',
        parentNavigatorKey: _rootNavigatorKey,
        builder: (context, state) => const DroneDeliveryScreen(),
      ),
      GoRoute(
        path: '/compost',
        parentNavigatorKey: _rootNavigatorKey,
        builder: (context, state) => const CompostScreen(),
      ),
      GoRoute(
        path: '/campus-selector',
        parentNavigatorKey: _rootNavigatorKey,
        builder: (context, state) => const CampusSelectorScreen(),
      ),
      GoRoute(
        path: '/digital-id',
        parentNavigatorKey: _rootNavigatorKey,
        builder: (context, state) => const DigitalIdScreen(),
      ),
      GoRoute(
        path: '/carbon-credits',
        parentNavigatorKey: _rootNavigatorKey,
        builder: (context, state) => const CarbonCreditsScreen(),
      ),
      GoRoute(
        path: '/sar-drone',
        parentNavigatorKey: _rootNavigatorKey,
        builder: (context, state) => const SarDroneDispatchScreen(),
      ),
      GoRoute(
        path: '/water-refill',
        parentNavigatorKey: _rootNavigatorKey,
        builder: (context, state) => const WaterRefillScreen(),
      ),
      GoRoute(
        path: '/packaging-deposit',
        parentNavigatorKey: _rootNavigatorKey,
        builder: (context, state) => const PackagingDepositScreen(),
      ),
      GoRoute(
        path: '/soundscapes',
        parentNavigatorKey: _rootNavigatorKey,
        builder: (context, state) => const NatureSoundscapeScreen(),
      ),
      GoRoute(
        path: '/book-sharing',
        parentNavigatorKey: _rootNavigatorKey,
        builder: (context, state) => const BookSharingScreen(),
      ),
      GoRoute(
        path: '/smart-laundry',
        parentNavigatorKey: _rootNavigatorKey,
        builder: (context, state) => const SmartLaundryScreen(),
      ),
      GoRoute(
        path: '/eco-transit',
        parentNavigatorKey: _rootNavigatorKey,
        builder: (context, state) => const EcoTransitScreen(),
      ),
      GoRoute(
        path: '/mesh-radar',
        parentNavigatorKey: _rootNavigatorKey,
        builder: (context, state) => const MeshRadarScreen(),
      ),
      GoRoute(
        path: '/sensors',
        parentNavigatorKey: _rootNavigatorKey,
        builder: (context, state) => const EnvironmentalSensorsScreen(),
      ),
      GoRoute(
        path: '/audio-guide',
        parentNavigatorKey: _rootNavigatorKey,
        builder: (context, state) => const AudioGuideScreen(),
      ),
      GoRoute(
        path: '/ar-lens',
        parentNavigatorKey: _rootNavigatorKey,
        builder: (context, state) => const ARLensScreen(),
      ),
      GoRoute(
        path: '/emergency-sos',
        parentNavigatorKey: _rootNavigatorKey,
        builder: (context, state) => const EmergencySosScreen(),
      ),
      GoRoute(
        path: '/showcase',
        parentNavigatorKey: _rootNavigatorKey,
        builder: (context, state) => const ComponentShowcaseScreen(),
      ),
      GoRoute(
        path: '/auth/login',
        builder: (context, state) => const LoginScreen(),
      ),
      GoRoute(
        path: '/auth/register',
        builder: (context, state) => const RegisterScreen(),
      ),
    ],
  );
}

class MainShellScaffold extends StatelessWidget {
  final Widget child;

  const MainShellScaffold({super.key, required this.child});

  int _calculateSelectedIndex(BuildContext context) {
    final String location = GoRouterState.of(context).uri.toString();
    if (location.startsWith('/fair-products')) return 1;
    if (location.startsWith('/events')) return 2;
    if (location.startsWith('/tickets')) return 3;
    if (location.startsWith('/map')) return 4;
    if (location.startsWith('/repair-donations')) return 5;
    if (location.startsWith('/ai-assistant')) return 6;
    return 0;
  }

  void _onItemTapped(int index, BuildContext context) {
    switch (index) {
      case 0:
        context.go('/');
        break;
      case 1:
        context.go('/fair-products');
        break;
      case 2:
        context.go('/events');
        break;
      case 3:
        context.go('/tickets');
        break;
      case 4:
        context.go('/map');
        break;
      case 5:
        context.go('/repair-donations');
        break;
      case 6:
        context.go('/ai-assistant');
        break;
    }
  }

  @override
  Widget build(BuildContext context) {
    final selectedIndex = _calculateSelectedIndex(context);

    return Scaffold(
      body: child,
      bottomNavigationBar: Container(
        decoration: BoxDecoration(
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.08),
              blurRadius: 20,
              offset: const Offset(0, -4),
            ),
          ],
        ),
        child: BottomNavigationBar(
          currentIndex: selectedIndex,
          onTap: (index) => _onItemTapped(index, context),
          type: BottomNavigationBarType.fixed,
          backgroundColor: Colors.white,
          selectedItemColor: AppTheme.primaryColor,
          unselectedItemColor: AppTheme.textMuted,
          selectedFontSize: 10,
          unselectedFontSize: 10,
          elevation: 0,
          items: const [
            BottomNavigationBarItem(
              icon: Icon(Icons.dashboard_outlined),
              activeIcon: Icon(Icons.dashboard),
              label: 'Kampüs',
            ),
            BottomNavigationBarItem(
              icon: Icon(Icons.storefront_outlined),
              activeIcon: Icon(Icons.storefront),
              label: 'Adil Masa',
            ),
            BottomNavigationBarItem(
              icon: Icon(Icons.event_outlined),
              activeIcon: Icon(Icons.event),
              label: 'Etkinlik',
            ),
            BottomNavigationBarItem(
              icon: Icon(Icons.confirmation_number_outlined),
              activeIcon: Icon(Icons.confirmation_number),
              label: 'Biletler',
            ),
            BottomNavigationBarItem(
              icon: Icon(Icons.map_outlined),
              activeIcon: Icon(Icons.map),
              label: 'Harita',
            ),
            BottomNavigationBarItem(
              icon: Icon(Icons.handyman_outlined),
              activeIcon: Icon(Icons.handyman),
              label: 'Onarım',
            ),
            BottomNavigationBarItem(
              icon: Icon(Icons.auto_awesome_outlined),
              activeIcon: Icon(Icons.auto_awesome),
              label: 'AI Asistan',
            ),
          ],
        ),
      ),
    );
  }
}
