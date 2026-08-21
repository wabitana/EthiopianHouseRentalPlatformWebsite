class EthiopiaLocations {
  static const Map<String, List<String>> regionsAndCities = {
    'Addis Ababa': [
      'Bole',
      'Kazanchis',
      'Yeka',
      'CMC',
      'Kirkos',
      'Arada',
      'Lideta',
      'Kolfe Keranio',
      'Akaki Kality',
      'Nifas Silk',
    ],
    'Amhara': [
      'Bahir Dar',
      'Gondar',
      'Debre Birhan',
      'Dessie',
      'Debre Markos',
      'Kombolcha',
      'Woldiya',
    ],
    'Oromia': [
      'Adama (Nazret)',
      'Jimma',
      'Bishoftu',
      'Shashamane',
      'Ambo',
      'Nekemte',
      'Asella',
      'Bale Robe',
    ],
    'Sidama': [
      'Hawassa',
      'Yirgalem',
      'Aleta Wendo',
    ],
    'Tigray': [
      'Mekelle',
      'Shire',
      'Aksum',
      'Adigrat',
      'Alamata',
    ],
    'Somali': [
      'Jijiga',
      'Gode',
      'Degehabur',
      'Kebri Dahar',
    ],
    'Dire Dawa': [
      'Dire Dawa City',
      'Melka Jebdu',
    ],
    'Harari': [
      'Harar City',
    ],
    'South Ethiopia': [
      'Arba Minch',
      'Sodo (Wolaita)',
      'Dilla',
      'Jinka',
    ],
    'Central Ethiopia': [
      'Hosaena',
      'Butajira',
      'Gurage Zone',
      'Worabe',
    ],
    'Afar': [
      'Semera',
      'Logia',
      'Asaita',
    ],
    'Gambela': [
      'Gambela City',
    ],
    'Benishangul-Gumuz': [
      'Asosa',
      'Metekel',
    ],
  };

  static List<String> get regions => regionsAndCities.keys.toList();

  static List<String> getCitiesForRegion(String region) {
    final list = List<String>.from(regionsAndCities[region] ?? ['Central Area']);
    list.add('+ Other / Custom City Keyword');
    return list;
  }
}
