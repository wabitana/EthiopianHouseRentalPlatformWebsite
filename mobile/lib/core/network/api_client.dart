import 'dart:convert';
import 'dart:io';
import 'package:http/http.dart' as http;
import '../storage/token_storage.dart';

class ApiException implements Exception {
  final String message;
  final int? statusCode;

  ApiException(this.message, {this.statusCode});

  @override
  String toString() => message;
}

class ApiClient {
  static const Duration _timeout = Duration(seconds: 15);

  static Future<Map<String, String>> _getHeaders({bool requireAuth = true}) async {
    final headers = <String, String>{
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };

    if (requireAuth) {
      final token = await TokenStorage.getToken();
      if (token != null && token.isNotEmpty) {
        headers['Authorization'] = 'Bearer $token';
      }
    }

    return headers;
  }

  static dynamic _handleResponse(http.Response response) {
    dynamic body;
    try {
      body = jsonDecode(response.body);
    } catch (_) {
      body = null;
    }

    if (response.statusCode >= 200 && response.statusCode < 300) {
      return body;
    }

    String errorMessage = 'An error occurred. Please try again.';
    if (body is Map && body.containsKey('error')) {
      if (body['error'] is Map && (body['error'] as Map)['message'] != null) {
        errorMessage = (body['error'] as Map)['message'].toString();
      } else {
        errorMessage = body['error'].toString();
      }
    } else if (body is Map && body.containsKey('message')) {
      errorMessage = body['message'].toString();
    }

    switch (response.statusCode) {
      case 401:
        throw ApiException('Unauthorized / Session expired ($errorMessage)', statusCode: 401);
      case 403:
        throw ApiException('Permission denied ($errorMessage)', statusCode: 403);
      case 404:
        throw ApiException('Resource not found ($errorMessage)', statusCode: 404);
      case 422:
      case 400:
        throw ApiException(errorMessage, statusCode: response.statusCode);
      case 500:
      default:
        throw ApiException(errorMessage, statusCode: response.statusCode);
    }
  }

  static String _swapHost(String url) {
    if (url.contains('localhost')) {
      return url.replaceFirst('localhost', '10.0.2.2');
    } else if (url.contains('127.0.0.1')) {
      return url.replaceFirst('127.0.0.1', '10.0.2.2');
    } else if (url.contains('10.0.2.2')) {
      return url.replaceFirst('10.0.2.2', 'localhost');
    }
    return url;
  }

  static Future<dynamic> get(String url, {bool requireAuth = true}) async {
    try {
      final headers = await _getHeaders(requireAuth: requireAuth);
      final response = await http
          .get(Uri.parse(url), headers: headers)
          .timeout(_timeout);
      return _handleResponse(response);
    } on SocketException {
      final fallbackUrl = _swapHost(url);
      if (fallbackUrl != url) {
        try {
          final headers = await _getHeaders(requireAuth: requireAuth);
          final response = await http
              .get(Uri.parse(fallbackUrl), headers: headers)
              .timeout(_timeout);
          return _handleResponse(response);
        } on SocketException {
          // Fallback also failed to connect
        }
      }
      throw ApiException('Unable to connect to server. Please check internet connection.');
    } on ApiException {
      rethrow;
    } catch (e) {
      throw ApiException('Network request failed: ${e.toString()}');
    }
  }

  static Future<dynamic> post(
    String url, {
    Map<String, dynamic>? body,
    bool requireAuth = true,
  }) async {
    try {
      final headers = await _getHeaders(requireAuth: requireAuth);
      final response = await http
          .post(
            Uri.parse(url),
            headers: headers,
            body: body != null ? jsonEncode(body) : null,
          )
          .timeout(_timeout);
      return _handleResponse(response);
    } on SocketException {
      final fallbackUrl = _swapHost(url);
      if (fallbackUrl != url) {
        try {
          final headers = await _getHeaders(requireAuth: requireAuth);
          final response = await http
              .post(
                Uri.parse(fallbackUrl),
                headers: headers,
                body: body != null ? jsonEncode(body) : null,
              )
              .timeout(_timeout);
          return _handleResponse(response);
        } on SocketException {
          // Fallback also failed to connect
        }
      }
      throw ApiException('Unable to connect to server. Please check internet connection.');
    } on ApiException {
      rethrow;
    } catch (e) {
      throw ApiException('Network request failed: ${e.toString()}');
    }
  }

  static Future<dynamic> put(
    String url, {
    Map<String, dynamic>? body,
    bool requireAuth = true,
  }) async {
    try {
      final headers = await _getHeaders(requireAuth: requireAuth);
      final response = await http
          .put(
            Uri.parse(url),
            headers: headers,
            body: body != null ? jsonEncode(body) : null,
          )
          .timeout(_timeout);
      return _handleResponse(response);
    } on SocketException {
      final fallbackUrl = _swapHost(url);
      if (fallbackUrl != url) {
        try {
          final headers = await _getHeaders(requireAuth: requireAuth);
          final response = await http
              .put(
                Uri.parse(fallbackUrl),
                headers: headers,
                body: body != null ? jsonEncode(body) : null,
              )
              .timeout(_timeout);
          return _handleResponse(response);
        } on SocketException {
          // Fallback also failed to connect
        }
      }
      throw ApiException('Unable to connect to server. Please check internet connection.');
    } on ApiException {
      rethrow;
    } catch (e) {
      throw ApiException('Network request failed: ${e.toString()}');
    }
  }

  static Future<dynamic> patch(
    String url, {
    Map<String, dynamic>? body,
    bool requireAuth = true,
  }) async {
    try {
      final headers = await _getHeaders(requireAuth: requireAuth);
      final response = await http
          .patch(
            Uri.parse(url),
            headers: headers,
            body: body != null ? jsonEncode(body) : null,
          )
          .timeout(_timeout);
      return _handleResponse(response);
    } on SocketException {
      final fallbackUrl = _swapHost(url);
      if (fallbackUrl != url) {
        try {
          final headers = await _getHeaders(requireAuth: requireAuth);
          final response = await http
              .patch(
                Uri.parse(fallbackUrl),
                headers: headers,
                body: body != null ? jsonEncode(body) : null,
              )
              .timeout(_timeout);
          return _handleResponse(response);
        } on SocketException {
          // Fallback also failed to connect
        }
      }
      throw ApiException('Unable to connect to server. Please check internet connection.');
    } on ApiException {
      rethrow;
    } catch (e) {
      throw ApiException('Network request failed: ${e.toString()}');
    }
  }

  static Future<dynamic> delete(String url, {bool requireAuth = true}) async {
    try {
      final headers = await _getHeaders(requireAuth: requireAuth);
      final response = await http
          .delete(Uri.parse(url), headers: headers)
          .timeout(_timeout);
      return _handleResponse(response);
    } on SocketException {
      final fallbackUrl = _swapHost(url);
      if (fallbackUrl != url) {
        try {
          final headers = await _getHeaders(requireAuth: requireAuth);
          final response = await http
              .delete(Uri.parse(fallbackUrl), headers: headers)
              .timeout(_timeout);
          return _handleResponse(response);
        } on SocketException {
          // Fallback also failed to connect
        }
      }
      throw ApiException('Unable to connect to server. Please check internet connection.');
    } on ApiException {
      rethrow;
    } catch (e) {
      throw ApiException('Network request failed: ${e.toString()}');
    }
  }

  static Future<dynamic> uploadMultipart(
    String url,
    String filePath, {
    String fieldName = 'image',
    bool requireAuth = true,
  }) async {
    try {
      final request = http.MultipartRequest('POST', Uri.parse(url));
      if (requireAuth) {
        final token = await TokenStorage.getToken();
        if (token != null && token.isNotEmpty) {
          request.headers['Authorization'] = 'Bearer $token';
        }
      }
      request.files.add(await http.MultipartFile.fromPath(fieldName, filePath));
      final streamedResponse = await request.send().timeout(_timeout);
      final response = await http.Response.fromStream(streamedResponse);
      return _handleResponse(response);
    } on SocketException {
      throw ApiException('Unable to connect to server. Please check internet connection.');
    } on ApiException {
      rethrow;
    } catch (e) {
      throw ApiException('File upload failed: ${e.toString()}');
    }
  }

  static Future<dynamic> uploadImageBytes(
    String url,
    List<int> bytes,
    String filename, {
    String fieldName = 'image',
    bool requireAuth = true,
  }) async {
    try {
      final request = http.MultipartRequest('POST', Uri.parse(url));
      if (requireAuth) {
        final token = await TokenStorage.getToken();
        if (token != null && token.isNotEmpty) {
          request.headers['Authorization'] = 'Bearer $token';
        }
      }
      request.files.add(http.MultipartFile.fromBytes(
        fieldName,
        bytes,
        filename: filename.isEmpty ? 'upload.jpg' : filename,
      ));
      final streamedResponse = await request.send().timeout(_timeout);
      final response = await http.Response.fromStream(streamedResponse);
      return _handleResponse(response);
    } on SocketException {
      throw ApiException('Unable to connect to server. Please check internet connection.');
    } on ApiException {
      rethrow;
    } catch (e) {
      throw ApiException('Image upload failed: ${e.toString()}');
    }
  }
}
