import { prisma } from "@/lib/prisma";

export interface LeaseAgreementOptions {
  tenantName: string;
  landlordName: string;
  propertyTitle: string;
  monthlyRentETB: number;
  securityDepositETB: number;
  leaseTermMonths: number;
  startDate: string;
  city: string;
  neighborhood: string;
}

/**
 * Server Function: Generate Bilingual (Amharic & English) Ethiopian Lease Contract Document
 */
export async function generateBilingualLeaseContract(options: LeaseAgreementOptions) {
  const {
    tenantName,
    landlordName,
    propertyTitle,
    monthlyRentETB,
    securityDepositETB,
    leaseTermMonths,
    startDate,
    city,
    neighborhood,
  } = options;

  return {
    contractId: `LEASE-ETB-${Math.floor(100000 + Math.random() * 900000)}`,
    lawReference: "Ethiopian Civil Code Article 2896–2974 (Rental & Lease Law)",
    escrowProvider: "Chapa Payment Gateway PLC (ETB Escrow Account)",
    englishText: `RESIDENTIAL LEASE AGREEMENT
This Lease Agreement is entered into on ${startDate} between Landlord (${landlordName}) and Tenant (${tenantName}) for the property "${propertyTitle}" situated in ${neighborhood}, ${city}, Ethiopia.
1. Monthly Rent: ${monthlyRentETB.toLocaleString()} ETB payable in advance.
2. Security Deposit: ${securityDepositETB.toLocaleString()} ETB securely held in Chapa Financial Escrow.
3. Term: ${leaseTermMonths} Months renewable upon mutual agreement.
4. Maintenance: Landlord guarantees structural integrity and plumbing water supply.`,
    amharicText: `የመኖሪያ ቤት ኪራይ ውል ስምምነት
ይህ ውል በ${startDate} ቀን በአከራይ (${landlordName}) እና በተከራይ (${tenantName}) መካከል በ${city}፣ ${neighborhood} ለሚገኘው "${propertyTitle}" መኖሪያ ቤት የተደረገ ውል ነው።
1. ወርሃዊ ኪራይ፡ ${monthlyRentETB.toLocaleString()} የኢትዮጵያ ብር።
2. የዋስትና ማስከበሪያ፡ ${securityDepositETB.toLocaleString()} የኢትዮጵያ ብር በቻፓ ኤስክሮው የተቀመጠ።
3. የውል ዘመን፡ ለ${leaseTermMonths} ወራት የሚያገለግል።`,
  };
}

/**
 * Server Function: Calculate Move-in Rent & Deposit Breakdown
 */
export function calculateMoveInBudget(rentETB: number, depositMonths: number, utilityReserve: boolean) {
  const depositETB = rentETB * depositMonths;
  const maintenanceReserveETB = utilityReserve ? Math.round(rentETB * 0.1) : 0;
  const platformFeeETB = 0; // Zero hidden fees
  const totalMoveInCostETB = rentETB + depositETB + maintenanceReserveETB;

  return {
    rentETB,
    depositMonths,
    depositETB,
    maintenanceReserveETB,
    platformFeeETB,
    totalMoveInCostETB,
    chapaEscrowProtection: true,
  };
}
