import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:provider/provider.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../../core/services/currency_service.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/utils/formatters.dart';
import '../../../data/repositories/rental_repository.dart';
import '../../../shared/models/inquiry_model.dart';
import '../../../shared/models/property_model.dart';
import '../../auth/providers/auth_provider.dart';
import '../../house_seeker/providers/inquiry_provider.dart';
import '../../house_seeker/screens/inquiry_chat_screen.dart';
import '../../notifications/providers/notification_provider.dart';

class DigitalLeaseGeneratorScreen extends StatefulWidget {
  final PropertyModel property;

  const DigitalLeaseGeneratorScreen({
    super.key,
    required this.property,
  });

  @override
  State<DigitalLeaseGeneratorScreen> createState() => _DigitalLeaseGeneratorScreenState();
}

class _DigitalLeaseGeneratorScreenState extends State<DigitalLeaseGeneratorScreen> {
  final RentalRepository _rentalRepository = ApiRentalRepository();

  bool _isAmharic = true;
  int _durationMonths = 12;
  int _advanceMonths = 3;
  double _depositMultiplier = 1.0;
  DateTime _startDate = DateTime.now().add(const Duration(days: 3));

  late final TextEditingController _tenantNameController;
  late final TextEditingController _tenantPhoneController;
  late final TextEditingController _customDepositController;
  bool _useCustomDeposit = false;
  bool _isSubmitting = false;

  @override
  void initState() {
    super.initState();
    final user = context.read<AuthProvider>().currentUser;
    _tenantNameController = TextEditingController(text: user?.name ?? '');
    _tenantPhoneController = TextEditingController(text: user?.phone ?? '');
    _customDepositController = TextEditingController(text: (widget.property.price).round().toString());
  }

  @override
  void dispose() {
    _tenantNameController.dispose();
    _tenantPhoneController.dispose();
    _customDepositController.dispose();
    super.dispose();
  }

  double get _calculatedDeposit {
    if (_useCustomDeposit) {
      return double.tryParse(_customDepositController.text) ?? widget.property.price;
    }
    return widget.property.price * _depositMultiplier;
  }

  DateTime get _calculatedEndDate {
    final end = DateTime(_startDate.year, _startDate.month + _durationMonths, _startDate.day);
    return end;
  }

  String _formatDate(DateTime d) {
    return '${d.day.toString().padLeft(2, '0')}/${d.month.toString().padLeft(2, '0')}/${d.year}';
  }

  String _generateContractPlainText() {
    final tenantName = _tenantNameController.text.trim().isEmpty ? 'Tenant' : _tenantNameController.text.trim();
    final tenantPhone = _tenantPhoneController.text.trim();
    final landlordName = widget.property.providerName;
    final landlordPhone = widget.property.providerPhone;
    final monthlyRent = '${Formatters.formatCurrency(widget.property.price)} (${widget.property.price.toStringAsFixed(0)} ETB)';
    final deposit = '${Formatters.formatCurrency(_calculatedDeposit)} (${_calculatedDeposit.toStringAsFixed(0)} ETB)';
    final startStr = _formatDate(_startDate);
    final endStr = _formatDate(_calculatedEndDate);

    if (_isAmharic) {
      return '''
የኢትዮጵያ የኪራይ ውል ስምምነት (Ethiopian Residential Lease Agreement)
በኢትዮጵያ ፍትሐብሔር ሕግ (Civil Code of Ethiopia) መሠረት የተዘጋጀ

1. የተዋዋይ ወገኖች:
- አከራይ (Landlord): $landlordName (ስልክ: $landlordPhone)
- ተከራይ (Tenant): $tenantName (ስልክ: $tenantPhone)

2. የኪራይ ቤቱ መግለጫ:
- ስም: ${widget.property.title}
- አድራሻ: ${widget.property.neighborhood}, ${widget.property.area}, ${widget.property.city}, ኢትዮጵያ
- ዓይነት: ${widget.property.propertyType} (${widget.property.rooms} ክፍሎች, ${widget.property.bathrooms} መታጠቢያ ቤቶች)

3. የኪራይ ዘመን እና ክፍያ ውል:
- የውል ቆይታ: $_durationMonths ወራት (ከ $startStr እስከ $endStr)
- ወርሃዊ ኪራይ: $monthlyRent
- የቅድመ ክፍያ ሁኔታ: በየ $_advanceMonths ወሩ የሚከፈል
- ማስያዣ (Security Deposit): $deposit

4. የመገልገያዎች ክፍያ:
- ተከራዩ በውሉ ቆይታ ወቅት የመብራት እና የውሃ መቁጠሪያ ፍጆታ ክፍያዎችን በወቅቱ ለመንግሥት አካላት ይከፍላል።

5. የውል ማቋረጫ:
- ማናቸውም ተዋዋይ ወገን ውሉን ለማቋረጥ ከ 30 ቀናት በፊት የጽሑፍ ማስጠንቀቂያ መስጠት አለበት።

ፊርማዎች:
የአከራይ ፊርማ: ___________________  ቀን: _________
የተከራይ ፊርማ: ___________________  ቀን: _________
የምስክር 1: _____________________  ቀን: _________
የምስክር 2: _____________________  ቀን: _________
''';
    } else {
      return '''
RESIDENTIAL LEASE AGREEMENT
Governed under the Ethiopian Civil Code (Art. 2896 - 2974)

1. CONTRACTING PARTIES:
- Landlord: $landlordName (Phone: $landlordPhone)
- Tenant: $tenantName (Phone: $tenantPhone)

2. PREMISES DESCRIPTION:
- Property: ${widget.property.title}
- Location: ${widget.property.neighborhood}, ${widget.property.area}, ${widget.property.city}, Ethiopia
- Configuration: ${widget.property.propertyType} (${widget.property.rooms} Bedrooms, ${widget.property.bathrooms} Bathrooms)

3. TERM AND FINANCIAL TERMS:
- Lease Duration: $_durationMonths Months (Effective $startStr to $endStr)
- Monthly Rent: $monthlyRent per calendar month
- Advance Payment: Due every $_advanceMonths months in advance
- Security Deposit: $deposit (refundable upon lease completion)

4. UTILITIES AND MAINTENANCE:
- Tenant shall be responsible for monthly water and electricity consumption charges.

5. TERMINATION NOTICE:
- Either party must provide at least 30 days written notice prior to termination.

SIGNATURES:
Landlord: _________________________  Date: _________
Tenant:   _________________________  Date: _________
Witness 1: ________________________  Date: _________
Witness 2: ________________________  Date: _________
''';
    }
  }

  Future<void> _submitContractProposal() async {
    final tenantName = _tenantNameController.text.trim();
    if (tenantName.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: const Text('Please enter tenant full name'), backgroundColor: AppColors.error),
      );
      return;
    }

    setState(() => _isSubmitting = true);

    try {
      final result = await _rentalRepository.createContractProposal(
        propertyId: widget.property.id,
        durationMonths: _durationMonths,
        advanceMonths: _advanceMonths,
        depositAmount: _calculatedDeposit,
        monthlyRent: widget.property.price,
        startDate: _startDate,
        tenantName: tenantName,
        tenantPhone: _tenantPhoneController.text.trim(),
        language: _isAmharic ? 'am' : 'en',
      );

      if (!mounted) return;

      final user = context.read<AuthProvider>().currentUser;
      if (user != null) {
        context.read<InquiryProvider>().fetchSeekerInquiries(user.id);
        context.read<NotificationProvider>().fetchNotifications(user.id);
      }

      InquiryModel? createdInquiry;
      try {
        final rawInquiry = result['data']?['inquiry'];
        if (rawInquiry != null && rawInquiry is Map<String, dynamic>) {
          createdInquiry = InquiryModel.fromJson(rawInquiry);
        }
      } catch (_) {}

      setState(() => _isSubmitting = false);

      _showProposalSuccessDialog(createdInquiry);
    } catch (e) {
      if (!mounted) return;
      setState(() => _isSubmitting = false);
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Failed to submit proposal: ${e.toString().replaceAll("Exception: ", "")}'),
          backgroundColor: AppColors.error,
        ),
      );
    }
  }

  void _showProposalSuccessDialog(InquiryModel? createdInquiry) {
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        title: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                color: AppColors.success.withValues(alpha: 0.15),
                shape: BoxShape.circle,
              ),
              child: const Icon(Icons.check_circle, color: AppColors.success, size: 28),
            ),
            const SizedBox(width: 12),
            const Expanded(
              child: Text(
                'Proposal Sent to Landlord!',
                style: TextStyle(fontSize: 17, fontWeight: FontWeight.bold),
              ),
            ),
          ],
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Your $_durationMonths-month digital lease proposal for "${widget.property.title}" has been transmitted to ${widget.property.providerName}.',
              style: const TextStyle(fontSize: 13, color: AppColors.textSecondary, height: 1.4),
            ),
            const SizedBox(height: 12),
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: AppColors.primary.withValues(alpha: 0.05),
                borderRadius: BorderRadius.circular(10),
                border: Border.all(color: AppColors.primary.withValues(alpha: 0.15)),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('Term: $_durationMonths Months', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 12)),
                  const SizedBox(height: 4),
                  Text('Start Date: ${_formatDate(_startDate)}', style: const TextStyle(fontSize: 12)),
                  const SizedBox(height: 4),
                  Text('Monthly Rent: ${Formatters.formatCurrency(widget.property.price)}', style: const TextStyle(fontSize: 12)),
                  const SizedBox(height: 4),
                  Text('Advance Schedule: Every $_advanceMonths Months', style: const TextStyle(fontSize: 12)),
                ],
              ),
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text('Close'),
          ),
          if (createdInquiry != null)
            ElevatedButton.icon(
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.primary,
                foregroundColor: Colors.white,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
              ),
              icon: const Icon(Icons.chat, size: 16),
              label: const Text('View in Chat'),
              onPressed: () {
                Navigator.pop(ctx);
                Navigator.push(
                  context,
                  MaterialPageRoute(builder: (_) => InquiryChatScreen(inquiry: createdInquiry)),
                );
              },
            ),
        ],
      ),
    );
  }

  void _shareViaWhatsApp() async {
    final text = _generateContractPlainText();
    final cleanPhone = widget.property.providerPhone.replaceAll(RegExp(r'[^0-9+]'), '');
    final uri = Uri.parse('whatsapp://send?phone=$cleanPhone&text=${Uri.encodeComponent(text)}');
    final fallbackWebUri = Uri.parse('https://wa.me/$cleanPhone?text=${Uri.encodeComponent(text)}');

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
              content: Text('WhatsApp not installed. Full agreement copied to clipboard!'),
              backgroundColor: AppColors.success,
            ),
          );
        }
      }
    } catch (_) {
      await Clipboard.setData(ClipboardData(text: text));
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Full contract copied to clipboard!'), backgroundColor: AppColors.success),
        );
      }
    }
  }

  void _copyToClipboard() {
    Clipboard.setData(ClipboardData(text: _generateContractPlainText()));
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('Full Ethiopian Lease Agreement copied to clipboard!'),
        backgroundColor: AppColors.success,
      ),
    );
  }

  void _showPrintDialog() {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: Row(
          children: [
            const Icon(Icons.print, color: AppColors.primary),
            const SizedBox(width: 8),
            Text(_isAmharic ? 'የሕትመት ቅጽ' : 'Printable Agreement Preview'),
          ],
        ),
        content: SizedBox(
          width: double.maxFinite,
          child: SingleChildScrollView(
            child: SelectableText(
              _generateContractPlainText(),
              style: const TextStyle(fontFamily: 'monospace', fontSize: 11, height: 1.4),
            ),
          ),
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('Close')),
          ElevatedButton.icon(
            style: ElevatedButton.styleFrom(backgroundColor: AppColors.primary, foregroundColor: Colors.white),
            icon: const Icon(Icons.copy, size: 16),
            label: const Text('Copy All'),
            onPressed: () {
              Navigator.pop(ctx);
              _copyToClipboard();
            },
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    context.watch<CurrencyProvider>(); // ensure real-time currency conversion

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: Text(_isAmharic ? 'ዲጂታል የቤት ኪራይ ውል' : 'Digital Ethiopian Lease'),
        actions: [
          TextButton.icon(
            style: TextButton.styleFrom(
              foregroundColor: AppColors.primary,
              textStyle: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13),
            ),
            icon: Icon(_isAmharic ? Icons.language : Icons.g_translate, size: 18),
            label: Text(_isAmharic ? 'English' : 'አማርኛ'),
            onPressed: () => setState(() => _isAmharic = !_isAmharic),
          ),
          const SizedBox(width: 8),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Property & Landlord Header Banner
            Container(
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: AppColors.border),
                boxShadow: AppColors.cardShadow,
              ),
              child: Row(
                children: [
                  Container(
                    width: 50,
                    height: 50,
                    decoration: BoxDecoration(
                      color: AppColors.primary.withValues(alpha: 0.1),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: const Icon(Icons.apartment, color: AppColors.primary, size: 28),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          widget.property.title,
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                          style: const TextStyle(fontSize: 14, fontWeight: FontWeight.bold),
                        ),
                        const SizedBox(height: 2),
                        Text(
                          '${widget.property.neighborhood}, ${widget.property.city}',
                          style: const TextStyle(fontSize: 11, color: AppColors.textSecondary),
                        ),
                        const SizedBox(height: 2),
                        Text(
                          'Landlord: ${widget.property.providerName} (${widget.property.providerPhone})',
                          style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w600, color: AppColors.primary),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 16),

            // Agreement Parameters Form
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
                      Text(
                        _isAmharic ? 'የውል ዝርዝሮች' : 'Agreement Parameters',
                        style: const TextStyle(fontSize: 15, fontWeight: FontWeight.bold, color: AppColors.textPrimary),
                      ),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                        decoration: BoxDecoration(
                          color: AppColors.primary.withValues(alpha: 0.1),
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: Text(
                          _isAmharic ? 'የኢትዮጵያ ፍትሐብሔር ሕግ' : 'Ethiopian Civil Code',
                          style: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: AppColors.primary),
                        ),
                      ),
                    ],
                  ),
                  const Divider(height: 20),

                  // Tenant Name & Phone
                  Row(
                    children: [
                      Expanded(
                        child: TextField(
                          controller: _tenantNameController,
                          decoration: InputDecoration(
                            labelText: _isAmharic ? 'የተከራይ ሙሉ ስም' : 'Tenant Full Name',
                            prefixIcon: const Icon(Icons.person_outline, size: 18),
                            border: const OutlineInputBorder(),
                            contentPadding: const EdgeInsets.symmetric(horizontal: 10, vertical: 12),
                          ),
                          onChanged: (_) => setState(() {}),
                        ),
                      ),
                      const SizedBox(width: 10),
                      Expanded(
                        child: TextField(
                          controller: _tenantPhoneController,
                          decoration: InputDecoration(
                            labelText: _isAmharic ? 'የተከራይ ስልክ' : 'Tenant Phone',
                            prefixIcon: const Icon(Icons.phone_outlined, size: 18),
                            border: const OutlineInputBorder(),
                            contentPadding: const EdgeInsets.symmetric(horizontal: 10, vertical: 12),
                          ),
                          onChanged: (_) => setState(() {}),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 14),

                  // Duration & Advance Payment
                  Row(
                    children: [
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              _isAmharic ? 'የውል ቆይታ (ወራት)' : 'Lease Duration',
                              style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w600),
                            ),
                            const SizedBox(height: 6),
                            DropdownButtonFormField<int>(
                              initialValue: _durationMonths,
                              decoration: const InputDecoration(
                                border: OutlineInputBorder(),
                                contentPadding: EdgeInsets.symmetric(horizontal: 10, vertical: 12),
                              ),
                              items: [3, 6, 12, 24, 36]
                                  .map((m) => DropdownMenuItem(value: m, child: Text('$m Months', style: const TextStyle(fontSize: 12))))
                                  .toList(),
                              onChanged: (val) {
                                if (val != null) setState(() => _durationMonths = val);
                              },
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(width: 10),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              _isAmharic ? 'የቅድመ ክፍያ ዙር' : 'Advance Payment',
                              style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w600),
                            ),
                            const SizedBox(height: 6),
                            DropdownButtonFormField<int>(
                              initialValue: _advanceMonths,
                              decoration: const InputDecoration(
                                border: OutlineInputBorder(),
                                contentPadding: EdgeInsets.symmetric(horizontal: 10, vertical: 12),
                              ),
                              items: [1, 2, 3, 6]
                                  .map((m) => DropdownMenuItem(value: m, child: Text('Every $m Mo', style: const TextStyle(fontSize: 12))))
                                  .toList(),
                              onChanged: (val) {
                                if (val != null) setState(() => _advanceMonths = val);
                              },
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 14),

                  // Start Date Picker & Security Deposit
                  Row(
                    children: [
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              _isAmharic ? 'የውል መጀመሪያ ቀን' : 'Lease Start Date',
                              style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w600),
                            ),
                            const SizedBox(height: 6),
                            InkWell(
                              onTap: () async {
                                final picked = await showDatePicker(
                                  context: context,
                                  initialDate: _startDate,
                                  firstDate: DateTime.now().subtract(const Duration(days: 7)),
                                  lastDate: DateTime.now().add(const Duration(days: 90)),
                                );
                                if (picked != null) setState(() => _startDate = picked);
                              },
                              child: Container(
                                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 12),
                                decoration: BoxDecoration(
                                  border: Border.all(color: Colors.grey.shade400),
                                  borderRadius: BorderRadius.circular(4),
                                ),
                                child: Row(
                                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                  children: [
                                    Text(_formatDate(_startDate), style: const TextStyle(fontSize: 12)),
                                    const Icon(Icons.calendar_today, size: 16, color: AppColors.primary),
                                  ],
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(width: 10),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              _isAmharic ? 'ማስያዣ (Deposit)' : 'Security Deposit',
                              style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w600),
                            ),
                            const SizedBox(height: 6),
                            DropdownButtonFormField<double>(
                              initialValue: _depositMultiplier,
                              decoration: const InputDecoration(
                                border: OutlineInputBorder(),
                                contentPadding: EdgeInsets.symmetric(horizontal: 10, vertical: 12),
                              ),
                              items: const [
                                DropdownMenuItem(value: 0.0, child: Text('No Deposit', style: TextStyle(fontSize: 12))),
                                DropdownMenuItem(value: 1.0, child: Text('1 Month Rent', style: TextStyle(fontSize: 12))),
                                DropdownMenuItem(value: 1.5, child: Text('1.5 Months Rent', style: TextStyle(fontSize: 12))),
                                DropdownMenuItem(value: 2.0, child: Text('2 Months Rent', style: TextStyle(fontSize: 12))),
                              ],
                              onChanged: (val) {
                                if (val != null) {
                                  setState(() {
                                    _depositMultiplier = val;
                                    _useCustomDeposit = false;
                                  });
                                }
                              },
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
            const SizedBox(height: 20),

            // Live Official Legal Document Preview
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: const Color(0xFFFFFDF5),
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: Colors.amber.shade400, width: 1.5),
                boxShadow: const [BoxShadow(color: Colors.black12, blurRadius: 8, offset: Offset(0, 3))],
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Center(
                    child: Column(
                      children: [
                        Text(
                          _isAmharic ? 'የኢትዮጵያ የሕግ የቤት ኪራይ ውል ስምምነት' : 'ETHIOPIAN RESIDENTIAL LEASE AGREEMENT',
                          textAlign: TextAlign.center,
                          style: const TextStyle(fontSize: 15, fontWeight: FontWeight.bold, color: Colors.black87),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          _isAmharic
                              ? 'በኢትዮጵያ ፍትሐብሔር ሕግ ቁጥር 2896 - 2974 መሠረት የተደረገ ውል'
                              : 'Concluded pursuant to Articles 2896–2974 of the Civil Code of Ethiopia',
                          textAlign: TextAlign.center,
                          style: const TextStyle(fontSize: 11, fontStyle: FontStyle.italic, color: Colors.black54),
                        ),
                      ],
                    ),
                  ),
                  const Divider(height: 24, thickness: 1),

                  _buildClauseTitle(_isAmharic ? '1. የተዋዋይ ወገኖች መግለጫ (Contracting Parties)' : '1. Contracting Parties'),
                  _buildClauseText(
                    _isAmharic
                        ? 'አከራይ (Landlord): ${widget.property.providerName} (ስልክ: ${widget.property.providerPhone})\nተከራይ (Tenant): ${_tenantNameController.text.trim().isEmpty ? '[የተከራይ ስም]' : _tenantNameController.text.trim()} (ስልክ: ${_tenantPhoneController.text.trim().isEmpty ? '[ስልክ ቁጥር]' : _tenantPhoneController.text.trim()})'
                        : 'Landlord: ${widget.property.providerName} (Phone: ${widget.property.providerPhone})\nTenant: ${_tenantNameController.text.trim().isEmpty ? '[Tenant Name]' : _tenantNameController.text.trim()} (Phone: ${_tenantPhoneController.text.trim().isEmpty ? '[Phone Number]' : _tenantPhoneController.text.trim()})',
                  ),
                  const SizedBox(height: 12),

                  _buildClauseTitle(_isAmharic ? '2. የኪራይ ቤቱ መግለጫ (Premises Description)' : '2. Property Description'),
                  _buildClauseText(
                    _isAmharic
                        ? 'የቤቱ ስም: ${widget.property.title}\nየሚገኝበት ቦታ: ${widget.property.neighborhood}, ${widget.property.area}, ${widget.property.city}, ኢትዮጵያ።\nየቤት ዓይነት: ${widget.property.propertyType} (${widget.property.rooms} የመኝታ ክፍሎች እና ${widget.property.bathrooms} መታጠቢያ ቤቶች)'
                        : 'Property: ${widget.property.title}\nLocation: ${widget.property.neighborhood}, ${widget.property.area}, ${widget.property.city}, Ethiopia.\nDetails: ${widget.property.propertyType} (${widget.property.rooms} Bed / ${widget.property.bathrooms} Bath)',
                  ),
                  const SizedBox(height: 12),

                  _buildClauseTitle(_isAmharic ? '3. የኪራይ ዘመን እና የክፍያ ውል (Terms & Rent)' : '3. Financial Terms'),
                  _buildClauseText(
                    _isAmharic
                        ? 'የውል ቆይታ: $_durationMonths ወራት (ከ ${_formatDate(_startDate)} እስከ ${_formatDate(_calculatedEndDate)})\nወርሃዊ የኪራይ መጠን: ${Formatters.formatCurrency(widget.property.price)} (በየወሩ የሚከፈል)\nየቅድመ ክፍያ መጠን: በየ $_advanceMonths ወሩ ቅድመ ክፍያ የሚፈጸም ይሆናል።\nየተያዘ ማስያዣ (Security Deposit): ${Formatters.formatCurrency(_calculatedDeposit)} (ውሉ በሰላም ሲጠናቀቅ ተመላሽ የሚደረግ)።'
                        : 'Duration: $_durationMonths Months (from ${_formatDate(_startDate)} to ${_formatDate(_calculatedEndDate)})\nMonthly Rent: ${Formatters.formatCurrency(widget.property.price)} per month\nAdvance Payment Schedule: Payable every $_advanceMonths months in advance\nSecurity Deposit: ${Formatters.formatCurrency(_calculatedDeposit)} (refundable at lease completion).',
                  ),
                  const SizedBox(height: 12),

                  _buildClauseTitle(_isAmharic ? '4. የመብራትና የውሃ መቁጠሪያ (Utilities)' : '4. Utilities & Services Clause'),
                  _buildClauseText(
                    _isAmharic
                        ? 'ተከራዩ በሚኖርበት ጊዜ ውስጥ የመብራትና የውሃ መቁጠሪያ ፍጆታ ክፍያዎችን በወቅቱ ለመንግሥት አካል የመክፈል ግዴታ አለበት።'
                        : 'The Tenant covenants to pay monthly water and electricity consumption charges directly to the relevant utility authorities during the term.',
                  ),
                  const SizedBox(height: 12),

                  _buildClauseTitle(_isAmharic ? '5. የውል ማቋረጫ ማስጠንቀቂያ (Termination Notice)' : '5. Termination Notice'),
                  _buildClauseText(
                    _isAmharic
                        ? 'ማናቸውም ተዋዋይ ወገን ውሉን ከጊዜው በፊት ለማቋረጥ ከ 30 ቀናት በፊት ለሌላኛው ወገን በጽሑፍ ማስጠንቀቂያ መስጠት ይኖርበታል።'
                        : 'Either party may terminate this agreement prior to expiration by providing a minimum 30-day written notice to the other party.',
                  ),
                  const SizedBox(height: 24),

                  // Signature lines
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Container(width: 120, height: 1, color: Colors.black54),
                          const SizedBox(height: 4),
                          Text(_isAmharic ? 'የአከራይ ፊርማ (Landlord)' : 'Landlord Signature', style: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold)),
                        ],
                      ),
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Container(width: 120, height: 1, color: Colors.black54),
                          const SizedBox(height: 4),
                          Text(_isAmharic ? 'የተከራይ ፊርማ (Tenant)' : 'Tenant Signature', style: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold)),
                        ],
                      ),
                    ],
                  ),
                ],
              ),
            ),
            const SizedBox(height: 20),

            // Action Buttons
            ElevatedButton.icon(
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.primary,
                foregroundColor: Colors.white,
                minimumSize: const Size(double.infinity, 50),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                elevation: 2,
              ),
              icon: _isSubmitting
                  ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                  : const Icon(Icons.send_rounded),
              label: Text(
                _isSubmitting
                    ? 'Transmitting Contract Proposal...'
                    : (_isAmharic ? 'የውል ስምምነቱን ለአከራዩ ላክ (Submit Proposal)' : 'Submit Proposal to Landlord'),
                style: const TextStyle(fontSize: 14, fontWeight: FontWeight.bold),
              ),
              onPressed: _isSubmitting ? null : _submitContractProposal,
            ),
            const SizedBox(height: 10),

            Row(
              children: [
                Expanded(
                  child: OutlinedButton.icon(
                    style: OutlinedButton.styleFrom(
                      foregroundColor: AppColors.primary,
                      padding: const EdgeInsets.symmetric(vertical: 12),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                    ),
                    icon: const Icon(Icons.share, size: 16),
                    label: const Text('WhatsApp Share', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
                    onPressed: _shareViaWhatsApp,
                  ),
                ),
                const SizedBox(width: 8),
                Expanded(
                  child: OutlinedButton.icon(
                    style: OutlinedButton.styleFrom(
                      foregroundColor: AppColors.primary,
                      padding: const EdgeInsets.symmetric(vertical: 12),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                    ),
                    icon: const Icon(Icons.copy, size: 16),
                    label: const Text('Copy Contract', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
                    onPressed: _copyToClipboard,
                  ),
                ),
                const SizedBox(width: 8),
                IconButton.filledTonal(
                  icon: const Icon(Icons.print_outlined),
                  onPressed: _showPrintDialog,
                  tooltip: 'Printable Preview',
                ),
              ],
            ),
            const SizedBox(height: 20),
          ],
        ),
      ),
    );
  }

  Widget _buildClauseTitle(String title) {
    return Text(
      title,
      style: const TextStyle(fontSize: 13, fontWeight: FontWeight.bold, color: Colors.black87),
    );
  }

  Widget _buildClauseText(String text) {
    return Text(
      text,
      style: TextStyle(fontSize: 12, height: 1.5, color: Colors.black.withValues(alpha: 0.75)),
    );
  }
}
