import 'package:flutter/material.dart';
import '../../core/theme/app_colors.dart';
import '../models/property_model.dart';

class StatusBadge extends StatelessWidget {
  final PropertyListingStatus status;

  const StatusBadge({
    super.key,
    required this.status,
  });

  @override
  Widget build(BuildContext context) {
    Color bg;
    Color fg;
    IconData icon;

    switch (status) {
      case PropertyListingStatus.active:
        bg = AppColors.successBackground;
        fg = AppColors.success;
        icon = Icons.check_circle_outline;
        break;
      case PropertyListingStatus.pending:
        bg = AppColors.pendingBackground;
        fg = AppColors.pending;
        icon = Icons.hourglass_empty;
        break;
      case PropertyListingStatus.rented:
        bg = AppColors.rentedBackground;
        fg = AppColors.rented;
        icon = Icons.key_rounded;
        break;
      case PropertyListingStatus.rejected:
        bg = AppColors.rejectedBackground;
        fg = AppColors.rejected;
        icon = Icons.cancel_outlined;
        break;
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(
        color: bg,
        borderRadius: BorderRadius.circular(20),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 13, color: fg),
          const SizedBox(width: 4),
          Text(
            status.displayName,
            style: TextStyle(
              color: fg,
              fontWeight: FontWeight.w600,
              fontSize: 12,
            ),
          ),
        ],
      ),
    );
  }
}
