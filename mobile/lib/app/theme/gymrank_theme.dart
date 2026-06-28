import 'package:flutter/material.dart';

class GymRankTheme {
  const GymRankTheme._();

  static const Color matteBlack = Color(0xFF0B0B0F);
  static const Color surfaceBlack = Color(0xFF15151C);
  static const Color musclePurple = Color(0xFF8B5CF6);
  static const Color textPrimary = Color(0xFFF5F3FF);
  static const Color textSecondary = Color(0xFFC4B5FD);

  static ThemeData get dark {
    final colorScheme = ColorScheme.fromSeed(
      seedColor: musclePurple,
      brightness: Brightness.dark,
      surface: surfaceBlack,
    );

    return ThemeData(
      useMaterial3: true,
      brightness: Brightness.dark,
      scaffoldBackgroundColor: matteBlack,
      colorScheme: colorScheme.copyWith(
        primary: musclePurple,
        surface: surfaceBlack,
        outline: const Color(0xFF2D2A3A),
      ),
      textTheme: const TextTheme(
        headlineLarge: TextStyle(
          color: textPrimary,
          fontSize: 34,
          fontWeight: FontWeight.w800,
          letterSpacing: 0,
        ),
        titleMedium: TextStyle(
          color: textSecondary,
          fontSize: 16,
          fontWeight: FontWeight.w600,
          letterSpacing: 0,
        ),
        bodyMedium: TextStyle(
          color: textPrimary,
          fontSize: 14,
          height: 1.4,
          letterSpacing: 0,
        ),
      ),
    );
  }
}
