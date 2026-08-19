import 'package:flutter/material.dart';
import '../../../core/theme/app_colors.dart';
import '../../../shared/models/property_model.dart';

class ScheduleTourModal extends StatefulWidget {
  final PropertyModel property;

  const ScheduleTourModal({
    super.key,
    required this.property,
  });

  @override
  State<ScheduleTourModal> createState() => _ScheduleTourModalState();
}

class _ScheduleTourModalState extends State<ScheduleTourModal> {
  DateTime _selectedDate = DateTime.now().add(const Duration(days: 1));
  String _selectedTimeSlot = '10:00 AM - 11:30 AM';
  String _tourType = 'In-Person Physical Visit';
  final _notesController = TextEditingController();
  bool _isSubmitting = false;

  final List<String> _timeSlots = [
    '09:00 AM - 10:30 AM',
    '10:30 AM - 12:00 PM',
    '02:00 PM - 03:30 PM',
    '04:00 PM - 05:30 PM',
  ];

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: EdgeInsets.only(
        bottom: MediaQuery.of(context).viewInsets.bottom,
        left: 16,
        right: 16,
        top: 20,
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text(
                'Schedule Property Visit',
                style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: AppColors.textPrimary),
              ),
              IconButton(icon: const Icon(Icons.close), onPressed: () => Navigator.pop(context)),
            ],
          ),
          const SizedBox(height: 12),

          // Tour Type Choice Chips
          const Text('Select Tour Format', style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600)),
          const SizedBox(height: 8),
          Row(
            children: [
              Expanded(
                child: ChoiceChip(
                  avatar: const Icon(Icons.location_on_outlined, size: 16),
                  label: const Center(child: Text('Physical Visit', style: TextStyle(fontSize: 12))),
                  selected: _tourType == 'In-Person Physical Visit',
                  onSelected: (val) {
                    if (val) setState(() => _tourType = 'In-Person Physical Visit');
                  },
                ),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: ChoiceChip(
                  avatar: const Icon(Icons.videocam_outlined, size: 16),
                  label: const Center(child: Text('WhatsApp Video', style: TextStyle(fontSize: 12))),
                  selected: _tourType == 'Virtual Video Tour',
                  onSelected: (val) {
                    if (val) setState(() => _tourType = 'Virtual Video Tour');
                  },
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),

          // Date Selection
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                'Date: ${_selectedDate.day}/${_selectedDate.month}/${_selectedDate.year}',
                style: const TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: AppColors.primary),
              ),
              TextButton.icon(
                icon: const Icon(Icons.calendar_month, size: 16),
                label: const Text('Pick Date'),
                onPressed: () async {
                  final picked = await showDatePicker(
                    context: context,
                    initialDate: _selectedDate,
                    firstDate: DateTime.now(),
                    lastDate: DateTime.now().add(const Duration(days: 30)),
                  );
                  if (picked != null) {
                    setState(() => _selectedDate = picked);
                  }
                },
              ),
            ],
          ),
          const SizedBox(height: 12),

          // Time Slots
          const Text('Preferred Time Slot', style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600)),
          const SizedBox(height: 8),
          Wrap(
            spacing: 8,
            children: _timeSlots.map((slot) {
              final isSelected = _selectedTimeSlot == slot;
              return ChoiceChip(
                label: Text(slot, style: const TextStyle(fontSize: 11)),
                selected: isSelected,
                onSelected: (val) {
                  if (val) setState(() => _selectedTimeSlot = slot);
                },
              );
            }).toList(),
          ),
          const SizedBox(height: 16),

          TextField(
            controller: _notesController,
            decoration: const InputDecoration(
              labelText: 'Additional Request or Notes (Optional)',
              hintText: 'e.g. Please confirm if parking slot is available...',
              border: OutlineInputBorder(),
            ),
            maxLines: 2,
          ),
          const SizedBox(height: 20),

          ElevatedButton.icon(
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.primary,
              foregroundColor: Colors.white,
              minimumSize: const Size(double.infinity, 48),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
            ),
            icon: _isSubmitting ? const SizedBox(width: 16, height: 16, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white)) : const Icon(Icons.check_circle_outline),
            label: Text(_isSubmitting ? 'Booking Visit...' : 'Confirm Visit Booking'),
            onPressed: _isSubmitting
                ? null
                : () async {
                    final nav = Navigator.of(context);
                    final messenger = ScaffoldMessenger.of(context);
                    setState(() => _isSubmitting = true);
                    await Future.delayed(const Duration(milliseconds: 600));
                    if (!mounted) return;
                    nav.pop();
                    messenger.showSnackBar(
                      SnackBar(
                        content: Text('Visit appointment booked for ${_selectedDate.day}/${_selectedDate.month}/${_selectedDate.year} ($_selectedTimeSlot)!'),
                        backgroundColor: AppColors.success,
                      ),
                    );
                  },
          ),
          const SizedBox(height: 16),
        ],
      ),
    );
  }
}
