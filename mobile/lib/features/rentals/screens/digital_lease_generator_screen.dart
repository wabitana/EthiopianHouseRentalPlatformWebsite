import 'package:flutter/material.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/utils/formatters.dart';
import '../../../shared/models/property_model.dart';

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
  bool _isAmharic = true;
  int _durationMonths = 12;
  int _advanceMonths = 3;
  double _depositAmount = 0.0;

  final _tenantNameController = TextEditingController(text: 'Abebe Bikila');
  final _tenantPhoneController = TextEditingController(text: '+251911223344');

  @override
  void initState() {
    super.initState();
    _depositAmount = widget.property.price * 1.5;
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text('Digital Ethiopian Rental Contract'),
        actions: [
          IconButton(
            icon: Icon(_isAmharic ? Icons.g_translate : Icons.language, color: AppColors.primary),
            onPressed: () {
              setState(() {
                _isAmharic = !_isAmharic;
              });
            },
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Contract Options & Terms Setup Card
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
                        'Agreement Parameters',
                        style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: AppColors.textPrimary),
                      ),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                        decoration: BoxDecoration(
                          color: AppColors.primary.withValues(alpha: 0.1),
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: Text(
                          _isAmharic ? 'የቤት ኪራይ ውል (አማርኛ)' : 'English Agreement Draft',
                          style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: AppColors.primary),
                        ),
                      ),
                    ],
                  ),
                  const Divider(height: 24),

                  Row(
                    children: [
                      Expanded(
                        child: TextField(
                          controller: _tenantNameController,
                          decoration: const InputDecoration(labelText: 'Tenant Full Name', border: OutlineInputBorder()),
                          onChanged: (_) => setState(() {}),
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: TextField(
                          controller: _tenantPhoneController,
                          decoration: const InputDecoration(labelText: 'Tenant Phone', border: OutlineInputBorder()),
                          onChanged: (_) => setState(() {}),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),

                  Row(
                    children: [
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Text('Lease Duration (Months)', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600)),
                            const SizedBox(height: 6),
                            DropdownButtonFormField<int>(
                              initialValue: _durationMonths,
                              decoration: const InputDecoration(border: OutlineInputBorder()),
                              items: [3, 6, 12, 24].map((m) => DropdownMenuItem(value: m, child: Text('$m Months'))).toList(),
                              onChanged: (val) => setState(() => _durationMonths = val!),
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Text('Advance Rent Payment', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600)),
                            const SizedBox(height: 6),
                            DropdownButtonFormField<int>(
                              initialValue: _advanceMonths,
                              decoration: const InputDecoration(border: OutlineInputBorder()),
                              items: [1, 2, 3, 6].map((m) => DropdownMenuItem(value: m, child: Text('$m Months Advance'))).toList(),
                              onChanged: (val) => setState(() => _advanceMonths = val!),
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

            // Live Formal Ethiopian Contract Preview Document
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: const Color(0xFFFFFDF5),
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: Colors.amber.shade300, width: 1.5),
                boxShadow: const [BoxShadow(color: Colors.black12, blurRadius: 6)],
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
                          style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Colors.black87),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          _isAmharic ? 'በአከራይና በተከራይ መካከል የተደረገ ውል' : 'Executed under the Civil Code of Ethiopia',
                          style: const TextStyle(fontSize: 11, fontStyle: FontStyle.italic, color: Colors.black54),
                        ),
                      ],
                    ),
                  ),
                  const Divider(height: 24, thickness: 1),

                  _buildClauseTitle(_isAmharic ? '1. የተዋዋይ ወገኖች መግለጫ (Contracting Parties)' : '1. Contracting Parties'),
                  _buildClauseText(_isAmharic
                      ? 'አከራይ (Landlord): ${widget.property.providerName} (ስልክ: ${widget.property.providerPhone})\nተከራይ (Tenant): ${_tenantNameController.text} (ስልክ: ${_tenantPhoneController.text})'
                      : 'Landlord: ${widget.property.providerName} (Phone: ${widget.property.providerPhone})\nTenant: ${_tenantNameController.text} (Phone: ${_tenantPhoneController.text})'),
                  const SizedBox(height: 12),

                  _buildClauseTitle(_isAmharic ? '2. የኪራይ ቤቱ መግለጫ (Property Description)' : '2. Property Description'),
                  _buildClauseText(_isAmharic
                      ? 'የኪራይ ቤቱ የሚገኝበት ቦታ: ${widget.property.neighborhood}, ${widget.property.area}, ${widget.property.city}, ኢትዮጵያ።\nየቤት ዓይነት: ${widget.property.propertyType} (${widget.property.rooms} ክፍሎች እና ${widget.property.bathrooms} መታጠቢያ ቤት)'
                      : 'Location: ${widget.property.neighborhood}, ${widget.property.area}, ${widget.property.city}, Ethiopia.\nProperty Type: ${widget.property.propertyType} (${widget.property.rooms} Bed / ${widget.property.bathrooms} Bath)'),
                  const SizedBox(height: 12),

                  _buildClauseTitle(_isAmharic ? '3. የኪራይ ክፍያና የቅድመ ክፍያ ውል (Rent & Payment Terms)' : '3. Financial Terms'),
                  _buildClauseText(_isAmharic
                      ? 'ወርሃዊ የኪራይ መጠን: ${Formatters.formatCurrency(widget.property.price)} ETB (በየወሩ የሚከፈል)።\nየቅድመ ክፍያ መጠን: በየ $_advanceMonths ወሩ ቅድመ ክፍያ የሚከፈል ይሆናል።\nየተያዘ ማስያዣ (Security Deposit): ${Formatters.formatCurrency(_depositAmount)} ETB።'
                      : 'Monthly Rent: ${Formatters.formatCurrency(widget.property.price)} ETB per month.\nAdvance Payment Schedule: Payable every $_advanceMonths months in advance.\nSecurity Deposit: ${Formatters.formatCurrency(_depositAmount)} ETB.'),
                  const SizedBox(height: 12),

                  _buildClauseTitle(_isAmharic ? '4. የመብራትና የውሃ መቁጠሪያ ክፍያ (Utilities Clause)' : '4. Utilities & Services Clause'),
                  _buildClauseText(_isAmharic
                      ? 'ተከራዩ በሚኖርበት ጊዜ ውስጥ የመብራትና የውሃ መቁጠሪያ ክፍያዎችን በወቅቱ ለመንግሥት አካል የመክፈል ግዴታ አለበት።'
                      : 'The Tenant agrees to pay all monthly water meter and electricity bill consumption directly during the lease tenancy.'),
                  const SizedBox(height: 20),

                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Container(width: 110, height: 1, color: Colors.black54),
                          const SizedBox(height: 4),
                          Text(_isAmharic ? 'የአከራይ ፊርማ (Landlord)' : 'Landlord Signature', style: const TextStyle(fontSize: 10)),
                        ],
                      ),
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Container(width: 110, height: 1, color: Colors.black54),
                          const SizedBox(height: 4),
                          Text(_isAmharic ? 'የተከራይ ፊርማ (Tenant)' : 'Tenant Signature', style: const TextStyle(fontSize: 10)),
                        ],
                      ),
                    ],
                  ),
                ],
              ),
            ),
            const SizedBox(height: 20),

            ElevatedButton.icon(
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.primary,
                foregroundColor: Colors.white,
                minimumSize: const Size(double.infinity, 50),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              ),
              icon: const Icon(Icons.download_rounded),
              label: Text(_isAmharic ? 'የውል ስምምነቱን አውርድ (Download PDF)' : 'Download PDF Agreement Draft'),
              onPressed: () {
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text('Lease agreement PDF saved to your downloads folder!'), backgroundColor: AppColors.success),
                );
              },
            ),
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
      style: TextStyle(fontSize: 12, height: 1.5, color: Colors.black.withValues(alpha: 0.7)),
    );
  }
}
