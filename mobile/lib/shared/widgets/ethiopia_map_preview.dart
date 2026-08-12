import 'package:flutter/material.dart';
import '../../core/theme/app_colors.dart';

class EthiopiaMapPreview extends StatelessWidget {
  final String city;
  final String area;
  final String neighborhood;

  const EthiopiaMapPreview({
    super.key,
    required this.city,
    required this.area,
    required this.neighborhood,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      height: 160,
      width: double.infinity,
      decoration: BoxDecoration(
        color: const Color(0xFFE2E8F0),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.border),
      ),
      child: Stack(
        children: [
          // Stylized map background pattern
          Positioned.fill(
            child: CustomPaint(
              painter: _MapGridPainter(),
            ),
          ),

          // Center Pin & Subcity Card Overlay
          Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Container(
                  padding: const EdgeInsets.all(10),
                  decoration: BoxDecoration(
                    color: AppColors.primary,
                    shape: BoxShape.circle,
                    boxShadow: [
                      BoxShadow(
                        color: AppColors.primary.withValues(alpha: 0.3),
                        blurRadius: 10,
                        spreadRadius: 3,
                      ),
                    ],
                  ),
                  child: const Icon(Icons.home, color: Colors.white, size: 22),
                ),
                const SizedBox(height: 6),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(12),
                    boxShadow: const [BoxShadow(color: Colors.black12, blurRadius: 4)],
                  ),
                  child: Text(
                    '$neighborhood, $area',
                    style: const TextStyle(
                      fontSize: 12,
                      fontWeight: FontWeight.bold,
                      color: AppColors.textPrimary,
                    ),
                  ),
                ),
              ],
            ),
          ),

          // Bottom Bar Tag
          Positioned(
            bottom: 10,
            left: 12,
            right: 12,
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                  decoration: BoxDecoration(
                    color: Colors.white.withValues(alpha: 0.9),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Row(
                    children: [
                      const Icon(Icons.map_rounded, size: 14, color: AppColors.primary),
                      const SizedBox(width: 4),
                      Text(
                        '$city, Ethiopia',
                        style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: AppColors.primary),
                      ),
                    ],
                  ),
                ),
                ElevatedButton.icon(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.primary,
                    foregroundColor: Colors.white,
                    minimumSize: const Size(90, 32),
                    padding: const EdgeInsets.symmetric(horizontal: 10),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                  ),
                  icon: const Icon(Icons.directions, size: 14),
                  label: const Text('Directions', style: TextStyle(fontSize: 11)),
                  onPressed: () {
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(content: Text('Opening map directions for $neighborhood, $area...')),
                    );
                  },
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _MapGridPainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    if (!size.isFinite || size.width <= 0 || size.height <= 0) return;
    final paint = Paint()
      ..color = Colors.white.withValues(alpha: 0.6)
      ..strokeWidth = 2
      ..style = PaintingStyle.stroke;

    // Draw stylized road grid
    canvas.drawLine(Offset(0, size.height * 0.3), Offset(size.width, size.height * 0.4), paint);
    canvas.drawLine(Offset(0, size.height * 0.7), Offset(size.width, size.height * 0.6), paint);
    canvas.drawLine(Offset(size.width * 0.3, 0), Offset(size.width * 0.4, size.height), paint);
    canvas.drawLine(Offset(size.width * 0.7, 0), Offset(size.width * 0.65, size.height), paint);
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}
