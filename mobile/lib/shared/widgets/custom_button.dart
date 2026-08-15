import 'package:flutter/material.dart';
import '../../core/theme/app_colors.dart';

enum CustomButtonVariant {
  primary,
  secondary,
  outline,
  danger,
}

class CustomButton extends StatelessWidget {
  final String text;
  final VoidCallback? onPressed;
  final bool isLoading;
  final IconData? icon;
  final CustomButtonVariant variant;
  final double? width;
  final double height;

  const CustomButton({
    super.key,
    required this.text,
    this.onPressed,
    this.isLoading = false,
    this.icon,
    this.variant = CustomButtonVariant.primary,
    this.width,
    this.height = 50,
  });

  @override
  Widget build(BuildContext context) {
    Color bg;
    Color fg;
    BorderSide borderSide = BorderSide.none;

    switch (variant) {
      case CustomButtonVariant.primary:
        bg = AppColors.primary;
        fg = Colors.white;
        break;
      case CustomButtonVariant.secondary:
        bg = AppColors.secondary;
        fg = Colors.white;
        break;
      case CustomButtonVariant.outline:
        bg = Colors.transparent;
        fg = AppColors.primary;
        borderSide = const BorderSide(color: AppColors.primary, width: 1.5);
        break;
      case CustomButtonVariant.danger:
        bg = AppColors.rejected;
        fg = Colors.white;
        break;
    }

    return SizedBox(
      width: width ?? double.infinity,
      height: height,
      child: ElevatedButton(
        style: ElevatedButton.styleFrom(
          backgroundColor: bg,
          foregroundColor: fg,
          elevation: variant == CustomButtonVariant.outline ? 0 : 1,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
            side: borderSide,
          ),
        ),
        onPressed: isLoading ? null : onPressed,
        child: isLoading
            ? SizedBox(
                height: 20,
                width: 20,
                child: CircularProgressIndicator(
                  strokeWidth: 2.5,
                  valueColor: AlwaysStoppedAnimation<Color>(fg),
                ),
              )
            : Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  if (icon != null) ...[
                    Icon(icon, size: 20, color: fg),
                    const SizedBox(width: 8),
                  ],
                  Text(
                    text,
                    style: TextStyle(
                      fontSize: 15,
                      fontWeight: FontWeight.w600,
                      color: fg,
                    ),
                  ),
                ],
              ),
      ),
    );
  }
}
