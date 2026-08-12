enum AppLanguage {
  english,
  amharic,
  afaanOromoo,
}

extension AppLanguageExtension on AppLanguage {
  String get displayName {
    switch (this) {
      case AppLanguage.english:
        return 'English 🇬🇧';
      case AppLanguage.amharic:
        return 'አማርኛ 🇪🇹';
      case AppLanguage.afaanOromoo:
        return 'Afaan Oromoo 🇪🇹';
    }
  }

  String get code {
    switch (this) {
      case AppLanguage.english:
        return 'en';
      case AppLanguage.amharic:
        return 'am';
      case AppLanguage.afaanOromoo:
        return 'om';
    }
  }

  static AppLanguage fromCode(String code) {
    switch (code) {
      case 'am':
        return AppLanguage.amharic;
      case 'om':
        return AppLanguage.afaanOromoo;
      default:
        return AppLanguage.english;
    }
  }
}

class AppStrings {
  static String appName(AppLanguage lang) {
    switch (lang) {
      case AppLanguage.amharic:
        return 'የኢትዮጵያ የቤት ኪራይ';
      case AppLanguage.afaanOromoo:
        return 'Kireessaa Manaa Itoophiyaa';
      case AppLanguage.english:
        return 'Ethiopian House Rental';
    }
  }

  static String appTagline(AppLanguage lang) {
    switch (lang) {
      case AppLanguage.amharic:
        return 'በኢትዮጵያ ውስጥ ያሉ የቤት ኪራዮችን በቀላሉ ያግኙ';
      case AppLanguage.afaanOromoo:
        return 'Manneen kireeffaman Itoophiyaa keessaa salphaatti argadhaa';
      case AppLanguage.english:
        return 'Find & Rent Homes Across Ethiopia';
    }
  }

  static String findNextHome(AppLanguage lang) {
    switch (lang) {
      case AppLanguage.amharic:
        return 'ቀጣዩን ቤትዎን ያግኙ';
      case AppLanguage.afaanOromoo:
        return 'Mana jireenyaa keessan isa itti aanu argadhaa';
      case AppLanguage.english:
        return 'Find your next home';
    }
  }

  static String searchPlaceholder(AppLanguage lang) {
    switch (lang) {
      case AppLanguage.amharic:
        return 'በከተማ፣ በሰፈር ወይም በስም ይፈልጉ...';
      case AppLanguage.afaanOromoo:
        return 'Magaalaa, naannoo fi maqaan barbaadaa...';
      case AppLanguage.english:
        return 'Search by city, area or neighborhood...';
    }
  }

  static String houseSeeker(AppLanguage lang) {
    switch (lang) {
      case AppLanguage.amharic:
        return 'ቤት ፈላጊ';
      case AppLanguage.afaanOromoo:
        return 'Barbaadaa Manaa';
      case AppLanguage.english:
        return 'House Seeker';
    }
  }

  static String houseProvider(AppLanguage lang) {
    switch (lang) {
      case AppLanguage.amharic:
        return 'ቤት አከራይ';
      case AppLanguage.afaanOromoo:
        return 'Dhiyeessaa Manaa';
      case AppLanguage.english:
        return 'House Provider';
    }
  }

  static String postNewHouse(AppLanguage lang) {
    switch (lang) {
      case AppLanguage.amharic:
        return '+ አዲስ ቤት ያቅርቡ';
      case AppLanguage.afaanOromoo:
        return '+ Mana Haaraa Maxxansaa';
      case AppLanguage.english:
        return '+ Post New House for Rent';
    }
  }

  static String contactProvider(AppLanguage lang) {
    switch (lang) {
      case AppLanguage.amharic:
        return 'አከራዩን ያነጋግሩ';
      case AppLanguage.afaanOromoo:
        return 'Abbaa Manaa qunnamaa';
      case AppLanguage.english:
        return 'Contact Provider';
    }
  }

  static String savedHouses(AppLanguage lang) {
    switch (lang) {
      case AppLanguage.amharic:
        return 'የተቀመጡ ቤቶች';
      case AppLanguage.afaanOromoo:
        return 'Manneen Ol-kaa\'aman';
      case AppLanguage.english:
        return 'Saved Houses';
    }
  }

  static String myInquiries(AppLanguage lang) {
    switch (lang) {
      case AppLanguage.amharic:
        return 'የእኔ ጥያቄዎች';
      case AppLanguage.afaanOromoo:
        return 'Gaaffiilee Koo';
      case AppLanguage.english:
        return 'My Inquiries';
    }
  }

  static String verifiedProperty(AppLanguage lang) {
    switch (lang) {
      case AppLanguage.amharic:
        return 'የተረጋገጠ ቤት';
      case AppLanguage.afaanOromoo:
        return 'Mana Mirkanaa\'e';
      case AppLanguage.english:
        return 'Verified Property';
    }
  }

  static String verifiedProvider(AppLanguage lang) {
    switch (lang) {
      case AppLanguage.amharic:
        return 'የተረጋገጠ አከራይ';
      case AppLanguage.afaanOromoo:
        return 'Dhiyeessaa Mirkanaa\'e';
      case AppLanguage.english:
        return 'Verified Provider';
    }
  }

  // Navigation Items
  static String navHome(AppLanguage lang) => lang == AppLanguage.amharic ? 'መነሻ' : lang == AppLanguage.afaanOromoo ? 'Manatti' : 'Home';
  static String navSearch(AppLanguage lang) => lang == AppLanguage.amharic ? 'ፈልግ' : lang == AppLanguage.afaanOromoo ? 'Barbaadi' : 'Search';
  static String navSaved(AppLanguage lang) => lang == AppLanguage.amharic ? 'የተቀመጡ' : lang == AppLanguage.afaanOromoo ? 'Ol-kaa\'aman' : 'Saved';
  static String navInquiries(AppLanguage lang) => lang == AppLanguage.amharic ? 'ጥያቄዎች' : lang == AppLanguage.afaanOromoo ? 'Gaaffiilee' : 'Inquiries';
  static String navProfile(AppLanguage lang) => lang == AppLanguage.amharic ? 'መገለጫ' : lang == AppLanguage.afaanOromoo ? 'Profayilii' : 'Profile';
  static String navDashboard(AppLanguage lang) => lang == AppLanguage.amharic ? 'ዳሽቦርድ' : lang == AppLanguage.afaanOromoo ? 'Daashboordii' : 'Dashboard';
  static String navMyListings(AppLanguage lang) => lang == AppLanguage.amharic ? 'የእኔ ቤቶች' : lang == AppLanguage.afaanOromoo ? 'Tarree Koo' : 'My Listings';
}
