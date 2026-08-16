import 'package:flutter/material.dart';
import '../../core/theme/app_colors.dart';

class VerificationBadge extends StatelessWidget {
  final String label;
  final bool isSmall;
  final bool isUnverified;

  const VerificationBadge({
    super.key,
    this.label = 'Verified',
    this.isSmall = false,
    this.isUnverified = false,
  });

  @override
  Widget build(BuildContext context) {
    final badgeColor = isUnverified ? const Color(0xFFDC2626) : AppColors.verified;
    final bgColor = isUnverified ? const Color(0xFFFEF2F2) : AppColors.verifiedBackground;

    return Container(
      padding: EdgeInsets.symmetric(
        horizontal: isSmall ? 8 : 10,
        vertical: isSmall ? 3 : 5,
      ),
      decoration: BoxDecoration(
        color: bgColor,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: badgeColor.withValues(alpha: 0.3), width: 1),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(
            isUnverified ? Icons.gpp_maybe_rounded : Icons.verified,
            color: badgeColor,
            size: isSmall ? 13 : 15,
          ),
          const SizedBox(width: 4),
          Text(
            isUnverified ? (label == 'Verified' ? 'Not Verified ⚠️' : label) : label,
            style: TextStyle(
              color: badgeColor,
              fontWeight: FontWeight.bold,
              fontSize: isSmall ? 10 : 12,
            ),
          ),
        ],
      ),
    );
  }
}
