import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:provider/provider.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../../core/services/currency_service.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/utils/formatters.dart';

enum SplitMode { equal, weighted }

class RoommateInfo {
  String name;
  double weight; // percentage weight or share

  RoommateInfo({required this.name, this.weight = 1.0});

  Map<String, dynamic> toJson() => {'name': name, 'weight': weight};

  factory RoommateInfo.fromJson(Map<String, dynamic> json) => RoommateInfo(
        name: json['name'] as String? ?? 'Roommate',
        weight: (json['weight'] as num?)?.toDouble() ?? 1.0,
      );
}

class RoommateRentSplitterScreen extends StatefulWidget {
  final double? initialPrice;
  final String? propertyTitle;

  const RoommateRentSplitterScreen({
    super.key,
    this.initialPrice,
    this.propertyTitle,
  });

  @override
  State<RoommateRentSplitterScreen> createState() => _RoommateRentSplitterScreenState();
}

class _RoommateRentSplitterScreenState extends State<RoommateRentSplitterScreen> {
  SplitMode _splitMode = SplitMode.equal;

  late final TextEditingController _totalRentController;
  final _waterCostController = TextEditingController(text: '1200');
  final _electricityCostController = TextEditingController(text: '900');
  final _internetCostController = TextEditingController(text: '1500');
  final _compoundFeeController = TextEditingController(text: '600');
  final _customExpenseController = TextEditingController(text: '0');
  final _customExpenseLabelController = TextEditingController(text: 'Cleaning / Helper');

  bool _includeInternet = true;
  bool _includeCustomExpense = false;

  List<RoommateInfo> _roommates = [
    RoommateInfo(name: 'Roommate 1 (Master)', weight: 1.2),
    RoommateInfo(name: 'Roommate 2', weight: 1.0),
  ];

  @override
  void initState() {
    super.initState();
    final defaultPrice = widget.initialPrice ?? 18000;
    _totalRentController = TextEditingController(text: defaultPrice.round().toString());
    _loadSavedPreferences();
  }

  @override
  void dispose() {
    _totalRentController.dispose();
    _waterCostController.dispose();
    _electricityCostController.dispose();
    _internetCostController.dispose();
    _compoundFeeController.dispose();
    _customExpenseController.dispose();
    _customExpenseLabelController.dispose();
    super.dispose();
  }

  Future<void> _loadSavedPreferences() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final savedWater = prefs.getString('splitter_water');
      final savedElectric = prefs.getString('splitter_electric');
      final savedInternet = prefs.getString('splitter_internet');
      final savedCompound = prefs.getString('splitter_compound');
      final savedRoommates = prefs.getString('splitter_roommates');

      if (savedWater != null) _waterCostController.text = savedWater;
      if (savedElectric != null) _electricityCostController.text = savedElectric;
      if (savedInternet != null) _internetCostController.text = savedInternet;
      if (savedCompound != null) _compoundFeeController.text = savedCompound;

      if (savedRoommates != null) {
        final List<dynamic> list = jsonDecode(savedRoommates);
        if (list.length >= 2) {
          setState(() {
            _roommates = list.map((e) => RoommateInfo.fromJson(e as Map<String, dynamic>)).toList();
          });
        }
      }
    } catch (_) {}
  }

  Future<void> _persistPreferences() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString('splitter_water', _waterCostController.text);
      await prefs.setString('splitter_electric', _electricityCostController.text);
      await prefs.setString('splitter_internet', _internetCostController.text);
      await prefs.setString('splitter_compound', _compoundFeeController.text);
      await prefs.setString(
        'splitter_roommates',
        jsonEncode(_roommates.map((r) => r.toJson()).toList()),
      );
    } catch (_) {}
  }

  double get _rentAmount => double.tryParse(_totalRentController.text) ?? 0.0;
  double get _waterCost => double.tryParse(_waterCostController.text) ?? 0.0;
  double get _electricCost => double.tryParse(_electricityCostController.text) ?? 0.0;
  double get _internetCost => _includeInternet ? (double.tryParse(_internetCostController.text) ?? 0.0) : 0.0;
  double get _compoundCost => double.tryParse(_compoundFeeController.text) ?? 0.0;
  double get _customExpense => _includeCustomExpense ? (double.tryParse(_customExpenseController.text) ?? 0.0) : 0.0;

  double get _totalUtilities => _waterCost + _electricCost + _internetCost + _compoundCost + _customExpense;
  double get _grandTotal => _rentAmount + _totalUtilities;

  double get _equalSharePerPerson => _roommates.isNotEmpty ? (_grandTotal / _roommates.length) : 0.0;
  double get _equalRentShare => _roommates.isNotEmpty ? (_rentAmount / _roommates.length) : 0.0;
  double get _equalUtilitiesShare => _roommates.isNotEmpty ? (_totalUtilities / _roommates.length) : 0.0;

  double _getRoommateRentShare(RoommateInfo roommate) {
    if (_splitMode == SplitMode.equal) {
      return _equalRentShare;
    }
    final totalWeight = _roommates.fold(0.0, (sum, r) => sum + r.weight);
    if (totalWeight <= 0) return _equalRentShare;
    return (_rentAmount * (roommate.weight / totalWeight));
  }

  double _getRoommateTotalShare(RoommateInfo roommate) {
    final rentShare = _getRoommateRentShare(roommate);
    final utilitiesShare = _equalUtilitiesShare;
    return rentShare + utilitiesShare;
  }

  void _addRoommate() {
    if (_roommates.length >= 10) return;
    setState(() {
      _roommates.add(RoommateInfo(name: 'Roommate ${_roommates.length + 1}', weight: 1.0));
    });
    _persistPreferences();
  }

  void _removeRoommate() {
    if (_roommates.length <= 2) return;
    setState(() {
      _roommates.removeLast();
    });
    _persistPreferences();
  }

  void _editRoommateName(int index) {
    final controller = TextEditingController(text: _roommates[index].name);
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Edit Roommate Name', style: TextStyle(fontSize: 16)),
        content: TextField(
          controller: controller,
          autofocus: true,
          decoration: const InputDecoration(labelText: 'Name', border: OutlineInputBorder()),
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('Cancel')),
          ElevatedButton(
            style: ElevatedButton.styleFrom(backgroundColor: AppColors.primary, foregroundColor: Colors.white),
            onPressed: () {
              if (controller.text.trim().isNotEmpty) {
                setState(() => _roommates[index].name = controller.text.trim());
                _persistPreferences();
              }
              Navigator.pop(ctx);
            },
            child: const Text('Save'),
          ),
        ],
      ),
    );
  }

  String _generateShareText() {
    final title = widget.propertyTitle ?? 'Rental Property';
    final buffer = StringBuffer();
    buffer.writeln('🏠 Monthly Roommate Rent & Utility Breakdown');
    buffer.writeln('Property: $title');
    buffer.writeln('Monthly Rent: ${Formatters.formatCurrency(_rentAmount)}');
    buffer.writeln('Utilities Total: ${Formatters.formatCurrency(_totalUtilities)}');
    buffer.writeln('  • Water Tanker/Bill: ${Formatters.formatCurrency(_waterCost)}');
    buffer.writeln('  • Electricity Meter: ${Formatters.formatCurrency(_electricCost)}');
    if (_includeInternet) buffer.writeln('  • Fiber Internet: ${Formatters.formatCurrency(_internetCost)}');
    buffer.writeln('  • Compound/Security: ${Formatters.formatCurrency(_compoundCost)}');
    if (_includeCustomExpense) {
      buffer.writeln('  • ${_customExpenseLabelController.text}: ${Formatters.formatCurrency(_customExpense)}');
    }
    buffer.writeln('------------------------------------');
    buffer.writeln('Grand Total: ${Formatters.formatCurrency(_grandTotal)}');
    buffer.writeln('------------------------------------');
    buffer.writeln('👥 Individual Payment Shares (${_roommates.length} Roommates):');

    for (final r in _roommates) {
      final rent = _getRoommateRentShare(r);
      final util = _roommates.isNotEmpty ? (_totalUtilities / _roommates.length) : 0.0;
      final total = rent + util;
      buffer.writeln('• ${r.name}: ${Formatters.formatCurrency(total)} (Rent: ${Formatters.formatCurrency(rent)} + Utilities: ${Formatters.formatCurrency(util)})');
    }

    buffer.writeln('\nCalculated via Ethiopian House Rental Platform');
    return buffer.toString();
  }

  Future<void> _shareViaWhatsApp() async {
    final text = _generateShareText();
    final uri = Uri.parse('whatsapp://send?text=${Uri.encodeComponent(text)}');
    final fallbackWebUri = Uri.parse('https://wa.me/?text=${Uri.encodeComponent(text)}');

    try {
      if (await canLaunchUrl(uri)) {
        await launchUrl(uri);
      } else if (await canLaunchUrl(fallbackWebUri)) {
        await launchUrl(fallbackWebUri, mode: LaunchMode.externalApplication);
      } else {
        await Clipboard.setData(ClipboardData(text: text));
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('WhatsApp not detected. Breakdown copied to clipboard!'),
              backgroundColor: AppColors.success,
            ),
          );
        }
      }
    } catch (_) {
      await Clipboard.setData(ClipboardData(text: text));
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Breakdown copied to clipboard!'), backgroundColor: AppColors.success),
        );
      }
    }
  }

  void _copyBreakdown() {
    Clipboard.setData(ClipboardData(text: _generateShareText()));
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('Full breakdown copied to clipboard!'),
        backgroundColor: AppColors.success,
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    context.watch<CurrencyProvider>(); // Trigger dynamic currency re-render

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text('Roommate Rent & Utility Splitter'),
        actions: [
          IconButton(
            icon: const Icon(Icons.share, color: AppColors.primary),
            tooltip: 'Share on WhatsApp',
            onPressed: _shareViaWhatsApp,
          ),
          IconButton(
            icon: const Icon(Icons.copy, color: AppColors.primary),
            tooltip: 'Copy Breakdown',
            onPressed: _copyBreakdown,
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Per Person Hero Summary Card
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                gradient: const LinearGradient(
                  colors: [AppColors.primary, Color(0xFF1B4332)],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
                borderRadius: BorderRadius.circular(20),
                boxShadow: AppColors.cardShadow,
              ),
              child: Column(
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        _splitMode == SplitMode.equal
                            ? 'Equal Monthly Share per Person'
                            : 'Average Monthly Share per Person',
                        style: const TextStyle(color: Colors.white70, fontSize: 13, fontWeight: FontWeight.w500),
                      ),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                        decoration: BoxDecoration(
                          color: Colors.white.withValues(alpha: 0.2),
                          borderRadius: BorderRadius.circular(10),
                        ),
                        child: Text(
                          '${_roommates.length} Roommates',
                          style: const TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.bold),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 8),
                  Text(
                    Formatters.formatCurrency(_equalSharePerPerson),
                    style: const TextStyle(color: Colors.white, fontSize: 32, fontWeight: FontWeight.w800),
                  ),
                  const SizedBox(height: 14),
                  Container(height: 1, color: Colors.white24),
                  const SizedBox(height: 12),

                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceAround,
                    children: [
                      Column(
                        children: [
                          const Text('Total House Rent', style: TextStyle(color: Colors.white70, fontSize: 11)),
                          const SizedBox(height: 2),
                          Text(Formatters.formatCurrency(_rentAmount),
                              style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 13)),
                        ],
                      ),
                      Container(width: 1, height: 26, color: Colors.white24),
                      Column(
                        children: [
                          const Text('Total Utilities', style: TextStyle(color: Colors.white70, fontSize: 11)),
                          const SizedBox(height: 2),
                          Text(Formatters.formatCurrency(_totalUtilities),
                              style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 13)),
                        ],
                      ),
                      Container(width: 1, height: 26, color: Colors.white24),
                      Column(
                        children: [
                          const Text('Grand Total', style: TextStyle(color: Colors.white70, fontSize: 11)),
                          const SizedBox(height: 2),
                          Text(Formatters.formatCurrency(_grandTotal),
                              style: const TextStyle(color: Colors.amberAccent, fontWeight: FontWeight.bold, fontSize: 13)),
                        ],
                      ),
                    ],
                  ),
                ],
              ),
            ),
            const SizedBox(height: 16),

            // Split Mode Switcher (Equal vs Master Bedroom Weighted)
            Container(
              padding: const EdgeInsets.all(4),
              decoration: BoxDecoration(
                color: Colors.grey.shade200,
                borderRadius: BorderRadius.circular(12),
              ),
              child: Row(
                children: [
                  Expanded(
                    child: GestureDetector(
                      onTap: () => setState(() => _splitMode = SplitMode.equal),
                      child: Container(
                        padding: const EdgeInsets.symmetric(vertical: 10),
                        decoration: BoxDecoration(
                          color: _splitMode == SplitMode.equal ? Colors.white : Colors.transparent,
                          borderRadius: BorderRadius.circular(10),
                          boxShadow: _splitMode == SplitMode.equal
                              ? [BoxShadow(color: Colors.black.withValues(alpha: 0.06), blurRadius: 4)]
                              : null,
                        ),
                        child: Center(
                          child: Text(
                            'Equal Split (እኩል ክፍፍል)',
                            style: TextStyle(
                              fontSize: 12,
                              fontWeight: _splitMode == SplitMode.equal ? FontWeight.bold : FontWeight.normal,
                              color: _splitMode == SplitMode.equal ? AppColors.primary : AppColors.textSecondary,
                            ),
                          ),
                        ),
                      ),
                    ),
                  ),
                  Expanded(
                    child: GestureDetector(
                      onTap: () => setState(() => _splitMode = SplitMode.weighted),
                      child: Container(
                        padding: const EdgeInsets.symmetric(vertical: 10),
                        decoration: BoxDecoration(
                          color: _splitMode == SplitMode.weighted ? Colors.white : Colors.transparent,
                          borderRadius: BorderRadius.circular(10),
                          boxShadow: _splitMode == SplitMode.weighted
                              ? [BoxShadow(color: Colors.black.withValues(alpha: 0.06), blurRadius: 4)]
                              : null,
                        ),
                        child: Center(
                          child: Text(
                            'Room Size / Master Bed',
                            style: TextStyle(
                              fontSize: 12,
                              fontWeight: _splitMode == SplitMode.weighted ? FontWeight.bold : FontWeight.normal,
                              color: _splitMode == SplitMode.weighted ? AppColors.primary : AppColors.textSecondary,
                            ),
                          ),
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 16),

            // Roommates List Card
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: AppColors.border),
                boxShadow: AppColors.cardShadow,
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text(
                        'Roommates & Individual Shares',
                        style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold),
                      ),
                      Row(
                        children: [
                          IconButton(
                            visualDensity: VisualDensity.compact,
                            icon: const Icon(Icons.remove_circle_outline, color: AppColors.primary),
                            onPressed: _roommates.length > 2 ? _removeRoommate : null,
                          ),
                          Text('${_roommates.length}', style: const TextStyle(fontSize: 14, fontWeight: FontWeight.bold)),
                          IconButton(
                            visualDensity: VisualDensity.compact,
                            icon: const Icon(Icons.add_circle_outline, color: AppColors.primary),
                            onPressed: _roommates.length < 10 ? _addRoommate : null,
                          ),
                        ],
                      ),
                    ],
                  ),
                  const Divider(height: 16),

                  ...List.generate(_roommates.length, (index) {
                    final roommate = _roommates[index];
                    final rentShare = _getRoommateRentShare(roommate);
                    final totalShare = _getRoommateTotalShare(roommate);
                    final utilShare = _roommates.isNotEmpty ? (_totalUtilities / _roommates.length) : 0.0;

                    return Container(
                      margin: const EdgeInsets.only(bottom: 10),
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: AppColors.background,
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(color: AppColors.border.withValues(alpha: 0.6)),
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            children: [
                              CircleAvatar(
                                radius: 14,
                                backgroundColor: AppColors.primary.withValues(alpha: 0.15),
                                child: Text('${index + 1}',
                                    style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: AppColors.primary)),
                              ),
                              const SizedBox(width: 8),
                              Expanded(
                                child: InkWell(
                                  onTap: () => _editRoommateName(index),
                                  child: Row(
                                    children: [
                                      Flexible(
                                        child: Text(
                                          roommate.name,
                                          style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13),
                                          overflow: TextOverflow.ellipsis,
                                        ),
                                      ),
                                      const SizedBox(width: 4),
                                      const Icon(Icons.edit, size: 13, color: Colors.grey),
                                    ],
                                  ),
                                ),
                              ),
                              Text(
                                Formatters.formatCurrency(totalShare),
                                style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 14, color: AppColors.primary),
                              ),
                            ],
                          ),
                          const SizedBox(height: 6),
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Text(
                                'Rent: ${Formatters.formatCurrency(rentShare)}  •  Utilities: ${Formatters.formatCurrency(utilShare)}',
                                style: const TextStyle(fontSize: 11, color: AppColors.textSecondary),
                              ),
                              if (_splitMode == SplitMode.weighted)
                                Text(
                                  'Weight: ${roommate.weight.toStringAsFixed(1)}x',
                                  style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: AppColors.secondary),
                                ),
                            ],
                          ),
                          if (_splitMode == SplitMode.weighted) ...[
                            Slider(
                              value: roommate.weight,
                              min: 0.5,
                              max: 2.5,
                              divisions: 20,
                              label: '${roommate.weight.toStringAsFixed(1)}x share',
                              activeColor: AppColors.secondary,
                              onChanged: (val) {
                                setState(() => roommate.weight = val);
                                _persistPreferences();
                              },
                            ),
                          ],
                        ],
                      ),
                    );
                  }),
                ],
              ),
            ),
            const SizedBox(height: 16),

            // Base House Rent Input
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: AppColors.border),
                boxShadow: AppColors.cardShadow,
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('Base Monthly Rent', style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold)),
                  const SizedBox(height: 10),
                  TextField(
                    controller: _totalRentController,
                    keyboardType: TextInputType.number,
                    decoration: const InputDecoration(
                      labelText: 'Total Property Monthly Rent (ETB)',
                      prefixIcon: Icon(Icons.home, color: AppColors.primary),
                      border: OutlineInputBorder(),
                    ),
                    onChanged: (_) {
                      setState(() {});
                      _persistPreferences();
                    },
                  ),
                ],
              ),
            ),
            const SizedBox(height: 16),

            // Shared Utilities Breakdown Card
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: AppColors.border),
                boxShadow: AppColors.cardShadow,
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text('Shared Utilities & Fees', style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold)),
                      Text(
                        'Total: ${Formatters.formatCurrency(_totalUtilities)}',
                        style: const TextStyle(fontWeight: FontWeight.bold, color: AppColors.primary, fontSize: 13),
                      ),
                    ],
                  ),
                  const Divider(height: 20),

                  // Water
                  TextField(
                    controller: _waterCostController,
                    keyboardType: TextInputType.number,
                    decoration: const InputDecoration(
                      labelText: 'Monthly Water Tank / Tap Bill (ETB)',
                      prefixIcon: Icon(Icons.water_drop, color: Colors.blue),
                      border: OutlineInputBorder(),
                      contentPadding: EdgeInsets.symmetric(horizontal: 12, vertical: 12),
                    ),
                    onChanged: (_) {
                      setState(() {});
                      _persistPreferences();
                    },
                  ),
                  const SizedBox(height: 12),

                  // Electricity
                  TextField(
                    controller: _electricityCostController,
                    keyboardType: TextInputType.number,
                    decoration: const InputDecoration(
                      labelText: 'Electricity Card / Meter Recharge (ETB)',
                      prefixIcon: Icon(Icons.bolt, color: Colors.amber),
                      border: OutlineInputBorder(),
                      contentPadding: EdgeInsets.symmetric(horizontal: 12, vertical: 12),
                    ),
                    onChanged: (_) {
                      setState(() {});
                      _persistPreferences();
                    },
                  ),
                  const SizedBox(height: 12),

                  // Internet WiFi Toggle & Input
                  Row(
                    children: [
                      Expanded(
                        child: TextField(
                          controller: _internetCostController,
                          keyboardType: TextInputType.number,
                          enabled: _includeInternet,
                          decoration: InputDecoration(
                            labelText: 'Ethio Telecom Fiber / WiFi (ETB)',
                            prefixIcon: const Icon(Icons.wifi, color: Colors.teal),
                            border: const OutlineInputBorder(),
                            contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
                            filled: !_includeInternet,
                            fillColor: Colors.grey.shade100,
                          ),
                          onChanged: (_) {
                            setState(() {});
                            _persistPreferences();
                          },
                        ),
                      ),
                      const SizedBox(width: 8),
                      Switch(
                        value: _includeInternet,
                        activeThumbColor: AppColors.primary,
                        onChanged: (val) => setState(() => _includeInternet = val),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),

                  // Compound Fee
                  TextField(
                    controller: _compoundFeeController,
                    keyboardType: TextInputType.number,
                    decoration: const InputDecoration(
                      labelText: 'Compound Security & Sanitation Fee (ETB)',
                      prefixIcon: Icon(Icons.security, color: Colors.indigo),
                      border: OutlineInputBorder(),
                      contentPadding: EdgeInsets.symmetric(horizontal: 12, vertical: 12),
                    ),
                    onChanged: (_) {
                      setState(() {});
                      _persistPreferences();
                    },
                  ),
                  const SizedBox(height: 12),

                  // Custom Expense Toggle
                  Row(
                    children: [
                      Expanded(
                        child: Text(
                          _includeCustomExpense ? 'Include Custom / Helper Fee' : 'Add Custom Shared Fee (e.g. Maid)',
                          style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600),
                        ),
                      ),
                      Switch(
                        value: _includeCustomExpense,
                        activeThumbColor: AppColors.primary,
                        onChanged: (val) => setState(() => _includeCustomExpense = val),
                      ),
                    ],
                  ),

                  if (_includeCustomExpense) ...[
                    const SizedBox(height: 8),
                    Row(
                      children: [
                        Expanded(
                          flex: 3,
                          child: TextField(
                            controller: _customExpenseLabelController,
                            decoration: const InputDecoration(
                              labelText: 'Expense Label',
                              border: OutlineInputBorder(),
                              contentPadding: EdgeInsets.symmetric(horizontal: 10, vertical: 10),
                            ),
                            onChanged: (_) => setState(() {}),
                          ),
                        ),
                        const SizedBox(width: 8),
                        Expanded(
                          flex: 2,
                          child: TextField(
                            controller: _customExpenseController,
                            keyboardType: TextInputType.number,
                            decoration: const InputDecoration(
                              labelText: 'Cost (ETB)',
                              border: OutlineInputBorder(),
                              contentPadding: EdgeInsets.symmetric(horizontal: 10, vertical: 10),
                            ),
                            onChanged: (_) => setState(() {}),
                          ),
                        ),
                      ],
                    ),
                  ],
                ],
              ),
            ),
            const SizedBox(height: 20),

            // Share & Action Buttons
            ElevatedButton.icon(
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFF25D366), // WhatsApp Green
                foregroundColor: Colors.white,
                minimumSize: const Size(double.infinity, 50),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                elevation: 2,
              ),
              icon: const Icon(Icons.share),
              label: const Text(
                'Share Breakdown via WhatsApp Group',
                style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold),
              ),
              onPressed: _shareViaWhatsApp,
            ),
            const SizedBox(height: 10),

            OutlinedButton.icon(
              style: OutlinedButton.styleFrom(
                foregroundColor: AppColors.primary,
                minimumSize: const Size(double.infinity, 46),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              ),
              icon: const Icon(Icons.copy),
              label: const Text('Copy Itemized Summary to Clipboard'),
              onPressed: _copyBreakdown,
            ),
            const SizedBox(height: 24),
          ],
        ),
      ),
    );
  }
}
