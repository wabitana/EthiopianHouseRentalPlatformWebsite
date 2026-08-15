# 🇪🇹 Ethiopian House Rental App (Flutter MVP)

A production-quality mobile application built with **Flutter** and **Dart** designed to connect **House Seekers** looking for rental homes with **House Providers** listing properties across Ethiopia.

---

## ✨ Features

### 👤 House Seeker Experience
- **Home Feed**: City filter picker (Addis Ababa, Hawassa, Adama, Bahir Dar, Mekelle, Gondar, Jimma, Dire Dawa), search bar, property type chips, featured carousel, and available listings grid.
- **Advanced Search & Filtering**: Multi-field search, subcities (Bole, Kazanchis, Megenagna, CMC, Saris, Gerji, etc.), ETB price slider, room/bath counts, amenity filters, and sort options.
- **Property Details & Swipe Gallery**: Multi-image slider, ETB price banners, verified badges, location details, room specs, provider card, and amenities grid.
- **Direct Provider Contact**: Modal inquiry form to message property owners directly.
- **Saved Houses**: Save favorite houses with availability alerts.
- **Inquiry Tracking**: Track sent inquiries and provider responses in real-time.

### 🏢 House Provider Experience
- **Provider Dashboard**: Metric stat cards (Total Listings, Active, Pending, Rented, New Inquiries), quick "+ Post New House" button, recent inquiries, and listings snippets.
- **7-Step Property Posting Wizard**: Photos, Basic Info, ETB Rent Price & Terms, Location, Amenities, Review Preview, and Published status transition.
- **Listings Management**: Filter by status (All, Active, Pending, Rented, Rejected). Toggle availability (*Mark Rented / Available*) or delete listings.
- **Inquiry Management**: Review seeker messages, reply with custom notes, and update status (*Viewing Arranged*, *Closed*).

### 🛡️ Trust & Security
- **Verification Indicators**: `✓ Verified Property` and `✓ Verified Provider` badges.
- **Report Suspicious Listings**: Modal for reporting fake or inappropriate property listings.
- **Notification Center**: Real-time notification list with unread state tracking.
- **Role Switcher**: Interactive role switcher in Profile to easily test both Seeker and Provider experiences.

---

## 🛠️ Technology Stack & Architecture

- **Framework**: Flutter 3.x (Dart 3.x)
- **State Management**: `Provider` (`ChangeNotifier`)
- **Architecture**: Feature-First Clean Architecture with API-Ready Repository Pattern
- **Design System**: Ethiopian Emerald Green (`#1B4D3E`), Warm Amber Gold (`#D97706`), Google Fonts (`Inter`), rounded cards, custom badges, skeleton loaders, and empty states.

---

## 🚀 Getting Started

### Prerequisites
- Flutter SDK (3.x or higher) installed and configured on your path
- Dart SDK

### Installation & Run

1. Clone or navigate to the project directory:
   ```bash
   cd HouseRentalApp
   ```

2. Fetch dependencies:
   ```bash
   flutter pub get
   ```

3. Run static code analysis:
   ```bash
   flutter analyze
   ```

4. Run unit and widget tests:
   ```bash
   flutter test
   ```

5. Launch the application:
   ```bash
   # Run on Web browser
   flutter run -d chrome

   # Run on connected mobile device or emulator
   flutter run
   ```

6. Build Web release:
   ```bash
   flutter build web --release
   ```
