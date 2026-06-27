import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class AppTheme {
  // ── Backgrounds ──────────────────────────────────────────────
  static const bg    = Color(0xFF0D0F14);
  static const bg1   = Color(0xFF13161D);
  static const bg2   = Color(0xFF181C25);
  static const bg3   = Color(0xFF1E2330);
  static const bg4   = Color(0xFF252B3A);

  // ── Lines / Surfaces ─────────────────────────────────────────
  static const line  = Color(0x0FFFFFFF);  // rgba(255,255,255,.06)
  static const line2 = Color(0x1AFFFFFF);  // rgba(255,255,255,.10)
  static const line3 = Color(0x2DFFFFFF);  // rgba(255,255,255,.18)

  // ── Gold (primary) ───────────────────────────────────────────
  static const primary    = Color(0xFFD4A853);
  static const primaryLight = Color(0xFFF0C878);
  static const primaryBg  = Color(0x1AD4A853);  // rgba(212,168,83,.10)
  static const primaryBd  = Color(0x47D4A853);  // rgba(212,168,83,.28)
  static const primaryGlow = Color(0x33D4A853); // rgba(212,168,83,.20)

  // ── Text ─────────────────────────────────────────────────────
  static const t1 = Color(0xFFF0EDE8);
  static const t2 = Color(0xFF9A97A0);
  static const t3 = Color(0xFF52505A);
  static const t4 = Color(0xFF3A3840);

  // ── Status ───────────────────────────────────────────────────
  static const ok    = Color(0xFF2ECC71);
  static const ok2   = Color(0xFF27AE60);
  static const warn  = Color(0xFFF39C12);
  static const warn2 = Color(0xFFE67E22);
  static const err   = Color(0xFFE74C3C);
  static const err2  = Color(0xFFC0392B);
  static const pur   = Color(0xFF9B59B6);
  static const pur2  = Color(0xFF8E44AD);

  // ── Gradients ────────────────────────────────────────────────
  static const goldGradient = LinearGradient(
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
    colors: [primary, primaryLight],
  );

  static const bgGradient = LinearGradient(
    begin: Alignment.topCenter,
    end: Alignment.bottomCenter,
    colors: [bg1, bg],
  );

  // ── Typography ───────────────────────────────────────────────
  static TextStyle syne({
    double size = 14,
    FontWeight weight = FontWeight.w600,
    Color color = t1,
    double? letterSpacing,
  }) =>
      GoogleFonts.syne(
        fontSize: size,
        fontWeight: weight,
        color: color,
        letterSpacing: letterSpacing,
      );

  static TextStyle inter({
    double size = 14,
    FontWeight weight = FontWeight.w400,
    Color color = t2,
    double? height,
    double? letterSpacing,
  }) =>
      GoogleFonts.inter(
        fontSize: size,
        fontWeight: weight,
        color: color,
        height: height,
        letterSpacing: letterSpacing,
      );

  // ── MaterialApp Theme ────────────────────────────────────────
  static ThemeData get theme => ThemeData.dark().copyWith(
        scaffoldBackgroundColor: bg,
        colorScheme: const ColorScheme.dark(
          primary: primary,
          surface: bg1,
        ),
        textTheme: GoogleFonts.interTextTheme(ThemeData.dark().textTheme).copyWith(
          bodyMedium: GoogleFonts.inter(color: t2),
          bodyLarge: GoogleFonts.inter(color: t1),
        ),
        appBarTheme: const AppBarTheme(
          backgroundColor: bg1,
          foregroundColor: t1,
          elevation: 0,
        ),
        inputDecorationTheme: InputDecorationTheme(
          filled: true,
          fillColor: bg3,
          border: OutlineInputBorder(
            borderRadius: BorderRadius.circular(12),
            borderSide: const BorderSide(color: line2),
          ),
          enabledBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(12),
            borderSide: const BorderSide(color: line2),
          ),
          focusedBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(12),
            borderSide: const BorderSide(color: primary, width: 1.5),
          ),
          hintStyle: inter(color: t3),
          contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
        ),
        elevatedButtonTheme: ElevatedButtonThemeData(
          style: ElevatedButton.styleFrom(
            backgroundColor: primary,
            foregroundColor: Colors.black,
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
            padding: const EdgeInsets.symmetric(vertical: 16),
            textStyle: GoogleFonts.syne(fontWeight: FontWeight.w700, fontSize: 15),
          ),
        ),
      );
}
