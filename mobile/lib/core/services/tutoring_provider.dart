import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';

enum TutoringTargetArea {
  homeHeader,
  topNavbarMenu,
  searchBar,
  aiAssistantFab,
  savedTab,
  inquiriesTab,
  profileTab,
  providerDashboard,
  providerAddProperty,
  providerInquiries,
  providerRepairs,
  providerAnalytics,
}

class TutoringStep {
  final String title;
  final String description;
  final TutoringTargetArea targetArea;
  final Color primaryColor;

  const TutoringStep({
    required this.title,
    required this.description,
    required this.targetArea,
    this.primaryColor = const Color(0xFF1B4D3E),
  });
}

class TutoringProvider extends ChangeNotifier {
  static const String _seekerTourKey = 'has_completed_seeker_tour_v2';
  static const String _providerTourKey = 'has_completed_provider_tour_v2';

  bool _isTourActive = false;
  int _currentStepIndex = 0;
  String _activeRole = 'seeker'; // 'seeker' | 'provider'
  List<TutoringStep> _currentSteps = [];

  bool get isTourActive => _isTourActive;
  int get currentStepIndex => _currentStepIndex;
  String get activeRole => _activeRole;
  List<TutoringStep> get currentSteps => _currentSteps;
  int get totalSteps => _currentSteps.length;
  TutoringStep? get currentStep =>
      (_isTourActive && _currentStepIndex < _currentSteps.length) ? _currentSteps[_currentStepIndex] : null;

  static final List<TutoringStep> seekerSteps = [
    const TutoringStep(
      title: 'Welcome to Ethiopian House Rental! 🏠🇪🇹',
      description: 'Discover verified rental houses, luxury villas, and apartments across Addis Ababa and major Ethiopian cities.',
      targetArea: TutoringTargetArea.homeHeader,
      primaryColor: Color(0xFF1B4D3E),
    ),
    const TutoringStep(
      title: 'App Menu & Currency Switcher',
      description: 'Access your profile, settings, and switch between ETB (Birr), USD, and EUR pricing anytime from the top bar.',
      targetArea: TutoringTargetArea.topNavbarMenu,
      primaryColor: Color(0xFF1B4D3E),
    ),
    const TutoringStep(
      title: 'Search & Subcity Filters',
      description: 'Filter houses by subcities like Bole, Kazanchis, Old Airport, price limits, bedrooms, and reserve water tank options.',
      targetArea: TutoringTargetArea.searchBar,
      primaryColor: Color(0xFF1B4D3E),
    ),
    const TutoringStep(
      title: '24/7 AI Housing Assistant ✨',
      description: 'Tap the AI button anytime to ask for real-time house recommendations, interactive maps, or legal lease summaries.',
      targetArea: TutoringTargetArea.aiAssistantFab,
      primaryColor: Color(0xFFE07A5F),
    ),
    const TutoringStep(
      title: 'Saved Houses & Favorites ❤️',
      description: 'Tap the heart icon on any house listing to save it here for offline access and price drop notifications.',
      targetArea: TutoringTargetArea.savedTab,
      primaryColor: Color(0xFF1B4D3E),
    ),
    const TutoringStep(
      title: 'Direct Landlord Messaging 💬',
      description: 'Contact verified house providers directly, send inquiry requests, and track your active rental applications.',
      targetArea: TutoringTargetArea.inquiriesTab,
      primaryColor: Color(0xFF0077B6),
    ),
    const TutoringStep(
      title: 'Seeker Profile & Verification 👤',
      description: 'Manage your verified ID status, preferences, and switch seamlessly to House Provider Mode anytime.',
      targetArea: TutoringTargetArea.profileTab,
      primaryColor: Color(0xFF1B4D3E),
    ),
  ];

  static final List<TutoringStep> providerSteps = [
    const TutoringStep(
      title: 'Welcome to Provider Dashboard! 🔑',
      description: 'Manage your rental properties, track tenant inquiries, and monitor your monthly rental earnings.',
      targetArea: TutoringTargetArea.providerDashboard,
      primaryColor: Color(0xFF1B4D3E),
    ),
    const TutoringStep(
      title: 'List New Property Listing ➕',
      description: 'List your house or apartment with photos, price per month, subcity location, and verified ownership documents.',
      targetArea: TutoringTargetArea.providerAddProperty,
      primaryColor: Color(0xFF1B4D3E),
    ),
    const TutoringStep(
      title: 'Tenant Inquiries & Bookings 💬',
      description: 'Review incoming tenant inquiry messages, chat directly with seekers, and confirm physical house viewings.',
      targetArea: TutoringTargetArea.providerInquiries,
      primaryColor: Color(0xFF0077B6),
    ),
    const TutoringStep(
      title: 'Maintenance & Repair Requests 🛠️',
      description: 'Receive tenant maintenance requests (plumbing, water tank, generator) and update repair progress.',
      targetArea: TutoringTargetArea.providerRepairs,
      primaryColor: Color(0xFFD97706),
    ),
    const TutoringStep(
      title: 'Earnings & Analytics 📊',
      description: 'View listing views, inquiry conversion rates, and total rental revenue collected.',
      targetArea: TutoringTargetArea.providerAnalytics,
      primaryColor: Color(0xFF10B981),
    ),
  ];

  // Auto Check First Launch (Disabled auto popup)
  Future<void> checkAndStartFirstLaunchTour(String role) async {
    _activeRole = role;
    _isTourActive = false;
    notifyListeners();
  }

  void startTour(String role) {
    _activeRole = role;
    _currentSteps = role == 'provider' ? providerSteps : seekerSteps;
    _currentStepIndex = 0;
    _isTourActive = true;
    notifyListeners();
  }

  void nextStep() {
    if (!_isTourActive) return;
    if (_currentStepIndex < _currentSteps.length - 1) {
      _currentStepIndex++;
      notifyListeners();
    } else {
      finishTour();
    }
  }

  void previousStep() {
    if (!_isTourActive) return;
    if (_currentStepIndex > 0) {
      _currentStepIndex--;
      notifyListeners();
    }
  }

  Future<void> skipTour() async {
    await finishTour();
  }

  Future<void> finishTour() async {
    _isTourActive = false;
    _currentStepIndex = 0;
    notifyListeners();

    try {
      final prefs = await SharedPreferences.getInstance();
      final key = _activeRole == 'provider' ? _providerTourKey : _seekerTourKey;
      await prefs.setBool(key, true);
    } catch (_) {}
  }

  Future<void> resetAndReplayTours() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.remove(_seekerTourKey);
      await prefs.remove(_providerTourKey);
    } catch (_) {}
    startTour(_activeRole);
  }
}
