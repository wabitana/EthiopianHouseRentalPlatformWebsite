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
      errorMessage = body['error'].toString();
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

  static Future<dynamic> get(String url, {bool requireAuth = true}) async {
    try {
      final headers = await _getHeaders(requireAuth: requireAuth);
      final response = await http
          .get(Uri.parse(url), headers: headers)
          .timeout(_timeout);
      return _handleResponse(response);
    } on SocketException {
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
      throw ApiException('Unable to connect to server. Please check internet connection.');
    } on ApiException {
      rethrow;
    } catch (e) {
      throw ApiException('Network request failed: ${e.toString()}');
    }
  }
}
