import 'dart:async';
import 'dart:convert';
import 'dart:io';

import 'package:http/http.dart' as http;

import 'api_exception.dart';
import 'token_storage.dart';

class ApiClient {
  ApiClient({
    required this.baseUrl,
    required this.tokenStorage,
    http.Client? httpClient,
    this.timeout = const Duration(seconds: 12),
    this.maxRetries = 1,
  }) : _httpClient = httpClient ?? http.Client();

  static final shared = ApiClient(
    baseUrl: const String.fromEnvironment(
      'GYMRANK_API_BASE_URL',
      defaultValue: 'http://localhost:4000',
    ),
    tokenStorage: const SecureTokenStorage(),
  );

  final String baseUrl;
  final TokenStorage tokenStorage;
  final http.Client _httpClient;
  final Duration timeout;
  final int maxRetries;

  Future<Map<String, dynamic>> getJson(String path, {Map<String, String>? query}) {
    return _sendJson('GET', path, query: query);
  }

  Future<Map<String, dynamic>> postJson(String path, {Map<String, dynamic>? body}) {
    return _sendJson('POST', path, body: body);
  }

  Future<Map<String, dynamic>> patchJson(String path, {Map<String, dynamic>? body}) {
    return _sendJson('PATCH', path, body: body);
  }

  Future<void> delete(String path) async {
    await _send('DELETE', path);
  }

  Future<Map<String, dynamic>> _sendJson(
    String method,
    String path, {
    Map<String, String>? query,
    Map<String, dynamic>? body,
  }) async {
    final response = await _send(method, path, query: query, body: body);

    if (response.body.isEmpty) {
      return const {};
    }

    final decoded = jsonDecode(response.body);
    if (decoded is Map<String, dynamic>) {
      return decoded;
    }

    throw const ApiException(message: 'Unexpected server response.');
  }

  Future<http.Response> _send(
    String method,
    String path, {
    Map<String, String>? query,
    Map<String, dynamic>? body,
  }) async {
    var attempt = 0;

    while (true) {
      try {
        final uri = _uri(path, query);
        final headers = await _headers();
        final requestBody = body == null ? null : jsonEncode(body);
        final response = await _request(method, uri, headers, requestBody).timeout(timeout);

        if (response.statusCode >= 200 && response.statusCode < 300) {
          return response;
        }

        if (response.statusCode == 401) {
          await tokenStorage.clearToken();
        }

        throw _exceptionForResponse(response);
      } on TimeoutException {
        if (attempt < maxRetries) {
          attempt += 1;
          continue;
        }
        throw const ApiException(message: 'Request timed out. Check your connection and try again.');
      } on SocketException {
        if (attempt < maxRetries) {
          attempt += 1;
          continue;
        }
        throw const ApiException(message: 'Network unavailable. Check your connection and try again.');
      } on http.ClientException {
        if (attempt < maxRetries) {
          attempt += 1;
          continue;
        }
        throw const ApiException(message: 'Could not reach GymRank. Try again.');
      }
    }
  }

  Future<Map<String, String>> _headers() async {
    final token = await tokenStorage.readToken();

    return {
      HttpHeaders.acceptHeader: 'application/json',
      HttpHeaders.contentTypeHeader: 'application/json',
      if (token != null) HttpHeaders.authorizationHeader: 'Bearer $token',
    };
  }

  Uri _uri(String path, Map<String, String>? query) {
    final normalizedBase = baseUrl.endsWith('/') ? baseUrl.substring(0, baseUrl.length - 1) : baseUrl;
    return Uri.parse('$normalizedBase$path').replace(queryParameters: query);
  }

  Future<http.Response> _request(
    String method,
    Uri uri,
    Map<String, String> headers,
    String? body,
  ) {
    switch (method) {
      case 'GET':
        return _httpClient.get(uri, headers: headers);
      case 'POST':
        return _httpClient.post(uri, headers: headers, body: body);
      case 'PATCH':
        return _httpClient.patch(uri, headers: headers, body: body);
      case 'DELETE':
        return _httpClient.delete(uri, headers: headers);
      default:
        throw ApiException(message: 'Unsupported request method: $method');
    }
  }

  ApiException _exceptionForResponse(http.Response response) {
    String? code;
    var message = _friendlyMessage(response.statusCode);

    try {
      final decoded = jsonDecode(response.body);
      if (decoded is Map<String, dynamic>) {
        final error = decoded['error'];
        if (error is Map<String, dynamic>) {
          code = error['code'] as String?;
          message = error['message'] as String? ?? message;
        }
      }
    } catch (_) {
      // Fall back to the friendly status-based message.
    }

    return ApiException(
      statusCode: response.statusCode,
      code: code,
      message: message,
    );
  }

  String _friendlyMessage(int statusCode) {
    switch (statusCode) {
      case 400:
        return 'Some information looks invalid. Please check and try again.';
      case 401:
        return 'Your session expired. Please log in again.';
      case 403:
        return 'You do not have permission to do that.';
      case 404:
        return 'That item could not be found.';
      case 409:
        return 'That action conflicts with existing data.';
      case 422:
        return 'Please fix the highlighted information and try again.';
      default:
        if (statusCode >= 500) {
          return 'GymRank is having trouble. Try again shortly.';
        }
        return 'Something went wrong. Try again.';
    }
  }
}
