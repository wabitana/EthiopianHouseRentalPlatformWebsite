import 'package:latlong2/latlong.dart';

class EthiopianCoordinates {
  // Default center: Addis Ababa, Ethiopia
  static const LatLng defaultCenter = LatLng(9.0192, 38.7525);

  static const Map<String, LatLng> _cityCoordinates = {
    'addis ababa': LatLng(9.0192, 38.7525),
    'mekelle': LatLng(13.4967, 39.4753),
    'hawassa': LatLng(7.0621, 38.4763),
    'adama': LatLng(8.5400, 39.2700),
    'nazret': LatLng(8.5400, 39.2700),
    'bahir dar': LatLng(11.5936, 37.3908),
    'gondar': LatLng(12.6000, 37.4667),
    'jimma': LatLng(7.6734, 36.8344),
    'dire dawa': LatLng(9.5931, 41.8661),
    'dilla': LatLng(6.4083, 38.3083),
    'harar': LatLng(9.3139, 42.1181),
    'jigjiga': LatLng(9.3500, 42.8000),
    'arba minch': LatLng(6.0333, 37.5500),
    'dessie': LatLng(11.1333, 39.6333),
    'shashemene': LatLng(7.2000, 38.6000),
    'bishoftu': LatLng(8.7500, 38.9833),
    'debre zeit': LatLng(8.7500, 38.9833),
    'debre birhan': LatLng(9.6833, 39.5333),
    'wolaita sodo': LatLng(6.8500, 37.7667),
  };

  static const Map<String, LatLng> _subcityCoordinates = {
    'bole': LatLng(8.9806, 38.7836),
    'bole bulbula': LatLng(8.9500, 38.7700),
    'bulbula': LatLng(8.9500, 38.7700),
    'bole atlas': LatLng(8.9950, 38.7840),
    'atlas': LatLng(8.9950, 38.7840),
    'bole medhanealem': LatLng(8.9980, 38.7880),
    'medhanealem': LatLng(8.9980, 38.7880),
    'kazanchis': LatLng(9.0220, 38.7660),
    'sarbet': LatLng(9.0020, 38.7400),
    'cmc': LatLng(9.0150, 38.8250),
    'old airport': LatLng(8.9850, 38.7350),
    'ayat': LatLng(9.0250, 38.8550),
    'summit': LatLng(9.0200, 38.8400),
    'piassa': LatLng(9.0350, 38.7520),
    'mexico': LatLng(9.0100, 38.7450),
    'megenagna': LatLng(9.0200, 38.8000),
    'gurd sholla': LatLng(9.0210, 38.8120),
    'lebu': LatLng(8.9450, 38.7200),
    'gotera': LatLng(8.9800, 38.7550),
    'kera': LatLng(8.9900, 38.7480),
    'nifas silk': LatLng(8.9600, 38.7400),
    'akaki kality': LatLng(8.8900, 38.7700),
    'kolfe keranio': LatLng(9.0200, 38.7000),
    'gullele': LatLng(9.0600, 38.7400),
    'arada': LatLng(9.0350, 38.7550),
    'yeka': LatLng(9.0300, 38.8000),
    'addis ketema': LatLng(9.0300, 38.7350),
    'kirkos': LatLng(9.0100, 38.7600),
    'lideta': LatLng(9.0100, 38.7350),
  };

  /// Resolves the best (latitude, longitude) coordinate pair for a given location query.
  static LatLng resolveLocation({
    double? latitude,
    double? longitude,
    String? city,
    String? area,
    String? neighborhood,
  }) {
    if (latitude != null && longitude != null && latitude != 0 && longitude != 0) {
      return LatLng(latitude, longitude);
    }

    final queryNeighborhood = (neighborhood ?? '').trim().toLowerCase();
    final queryArea = (area ?? '').trim().toLowerCase();
    final queryCity = (city ?? '').trim().toLowerCase();

    // Check subcity / neighborhood match
    for (final entry in _subcityCoordinates.entries) {
      if (queryNeighborhood.contains(entry.key) || queryArea.contains(entry.key)) {
        return entry.value;
      }
    }

    // Check city match
    for (final entry in _cityCoordinates.entries) {
      if (queryCity.contains(entry.key)) {
        return entry.value;
      }
    }

    return defaultCenter;
  }
}
