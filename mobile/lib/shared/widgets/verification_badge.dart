import 'package:flutter/material.dart';
import '../../core/theme/app_colors.dart';

class VerificationBadge extends StatelessWidget {
  final String label;
  final bool isSmall;

  const VerificationBadge({
    super.key,
    this.label = 'Verified',
    this.isSmall = false,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: EdgeInsets.symmetric(
        horizontal: isSmall ? 6 : 10,
        vertical: isSmall ? 2 : 4,
      ),
      decoration: BoxDecoration(
        color: AppColors.verifiedBackground,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: AppColors.verified.withValues(alpha: 0.3), width: 1),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(
            Icons.verified,
            color: AppColors.verified,
            size: isSmall ? 12 : 15,
          ),
          const SizedBox(width: 4),
          Text(
            label,
            style: TextStyle(
              color: AppColors.verified,
              fontWeight: FontWeight.w600,
              fontSize: isSmall ? 10 : 12,
            ),
          ),
        ],
      ),
    );
  }
}
