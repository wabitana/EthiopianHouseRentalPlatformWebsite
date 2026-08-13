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
  final IconData? trailingIcon;
  final CustomButtonVariant variant;
  final double? width;
  final double height;
  final Gradient? customGradient;

  const CustomButton({
    super.key,
    required this.text,
    this.onPressed,
    this.isLoading = false,
    this.icon,
    this.trailingIcon,
    this.variant = CustomButtonVariant.primary,
    this.width,
    this.height = 52,
    this.customGradient,
  });

  @override
  Widget build(BuildContext context) {
    Color bg;
    Color fg;
    BorderSide borderSide = BorderSide.none;
    Gradient? gradient = customGradient;
    List<BoxShadow>? shadows;

    switch (variant) {
      case CustomButtonVariant.primary:
        bg = AppColors.primary;
        fg = Colors.white;
        gradient ??= AppColors.primaryGradient;
        shadows = AppColors.primaryGlowShadow;
        break;
      case CustomButtonVariant.secondary:
        bg = AppColors.secondary;
        fg = Colors.white;
        gradient ??= AppColors.goldGradient;
        shadows = [
          BoxShadow(
            color: AppColors.secondary.withValues(alpha: 0.3),
            blurRadius: 14,
            offset: const Offset(0, 5),
          ),
        ];
        break;
      case CustomButtonVariant.outline:
        bg = Colors.transparent;
        fg = AppColors.primary;
        borderSide = const BorderSide(color: AppColors.primary, width: 1.5);
        gradient = null;
        shadows = null;
        break;
      case CustomButtonVariant.danger:
        bg = AppColors.rejected;
        fg = Colors.white;
        gradient = null;
        shadows = null;
        break;
    }

    final bool isDisabled = isLoading || onPressed == null;

    Widget buttonContent = Row(
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
            fontWeight: FontWeight.w700,
            letterSpacing: 0.2,
            color: fg,
          ),
        ),
        if (trailingIcon != null) ...[
          const SizedBox(width: 8),
          Icon(trailingIcon, size: 18, color: fg),
        ],
      ],
    );

    return Container(
      width: width ?? double.infinity,
      height: height,
      decoration: BoxDecoration(
        color: gradient == null ? bg : null,
        gradient: isDisabled ? null : gradient,
        borderRadius: BorderRadius.circular(14),
        border: borderSide != BorderSide.none ? Border.all(color: borderSide.color, width: borderSide.width) : null,
        boxShadow: isDisabled ? null : shadows,
      ),
      child: Material(
        color: Colors.transparent,
        borderRadius: BorderRadius.circular(14),
        child: InkWell(
          borderRadius: BorderRadius.circular(14),
          onTap: isDisabled ? null : onPressed,
          child: Center(
            child: isLoading
                ? SizedBox(
                    height: 22,
                    width: 22,
                    child: CircularProgressIndicator(
                      strokeWidth: 2.5,
                      valueColor: AlwaysStoppedAnimation<Color>(fg),
                    ),
                  )
                : buttonContent,
          ),
        ),
      ),
    );
  }
}
