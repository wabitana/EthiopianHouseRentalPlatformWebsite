export interface UserItem {
  id: string;
  name: string;
  avatar: string;
  email: string;
  phone: string;
  role: "House Seeker" | "House Provider" | "Agent" | "Admin";
  location: string;
  verificationStatus: "Verified" | "Pending" | "Unverified" | "Rejected";
  accountStatus: "Active" | "Suspended" | "Pending" | "Disabled";
  registrationDate: string;
  activityCount: number;
}

export interface ProviderItem {
  id: string;
  name: string;
  avatar: string;
  phone: string;
  email: string;
  location: string;
  verificationStatus: "Verified" | "Pending" | "Rejected";
  totalProperties: number;
  activeListings: number;
  accountStatus: "Active" | "Suspended" | "Pending";
  registrationDate: string;
  idNumber: string;
  businessLicense?: string;
  recentActivity: Array<{ id: string; action: string; time: string }>;
  reportsCount: number;
}

export interface SeekerItem {
  id: string;
  name: string;
  avatar: string;
  phone: string;
  email: string;
  preferredLocation: string;
  savedPropertiesCount: number;
  inquiriesCount: number;
  accountStatus: "Active" | "Suspended";
  registrationDate: string;
  recentInquiries: Array<{ id: string; propertyTitle: string; date: string; status: string }>;
}

export interface AgentItem {
  id: string;
  name: string;
  avatar: string;
  email: string;
  phone: string;
  assignedArea: string;
  propertiesManaged: number;
  verificationsCompleted: number;
  activeTasks: number;
  performanceScore: number; // e.g. 98%
  status: "Active" | "On Leave" | "Suspended";
  joinedDate: string;
}

export interface PropertyItem {
  id: string;
  title: string;
  images: string[];
  providerId: string;
  providerName: string;
  providerPhone: string;
  providerAvatar: string;
  location: string; // Sub-city e.g. "Bole, Addis Ababa"
  woreda?: string;
  coordinates?: { lat: number; lng: number };
  propertyType: "Apartment" | "Villa" | "Condo" | "Studio" | "Commercial" | "Land";
  price: number; // Monthly rent in ETB
  period: "month" | "year";
  status: "Draft" | "Pending" | "Published" | "Rejected" | "Suspended" | "Rented" | "Expired";
  verificationStatus: "Verified" | "Pending" | "In Review" | "Rejected";
  datePosted: string;
  bedrooms: number;
  bathrooms: number;
  areaSqM: number;
  description: string;
  amenities: string[];
  documents: Array<{ name: string; type: string; url: string; date: string }>;
  agentAssigned?: string;
  listingHistory: Array<{ date: string; event: string; actor: string }>;
  reportsCount: number;
}

export interface VerificationItem {
  id: string;
  propertyId: string;
  propertyTitle: string;
  propertyImage: string;
  providerId: string;
  providerName: string;
  providerPhone: string;
  location: string;
  documentsCount: number;
  documents: Array<{ title: string; type: string; url: string; preview: string }>;
  submittedDate: string;
  status: "Pending" | "In Review" | "Approved" | "Rejected";
  aiPreCheckScore: number; // e.g. 94
  aiPreCheckDetails: {
    ownershipDocsValid: boolean;
    identityVerified: boolean;
    locationMatch: boolean;
    priceReasonable: boolean;
  };
  assignedAgent?: string;
  notes?: string;
}

export interface TaskItem {
  id: string;
  title: string;
  type: "Verify property" | "Contact provider" | "Review documents" | "Inspect property" | "Update property information" | "Follow up with provider";
  propertyTitle?: string;
  providerName?: string;
  assignedAgentId: string;
  dueDate: string;
  priority: "High" | "Medium" | "Low";
  status: "Pending" | "In Progress" | "Completed" | "Overdue";
  description: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  category: "Property" | "User" | "Verification" | "System" | "Message";
  link?: string;
}

export interface MessageConversation {
  id: string;
  participantName: string;
  participantRole: "Provider" | "Seeker" | "Agent" | "Admin";
  participantAvatar: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  online: boolean;
  messages: Array<{
    id: string;
    sender: "me" | "them";
    text: string;
    timestamp: string;
  }>;
}

export interface ReportItem {
  id: string;
  reporterName: string;
  reporterEmail: string;
  reportedEntityName: string;
  reportedEntityType: "Property" | "User" | "Provider" | "Agent";
  reportedEntityId: string;
  reason: "Fraudulent Listing" | "Incorrect Information" | "Spam" | "Harassment" | "Other";
  description: string;
  dateSubmitted: string;
  evidenceUrls: string[];
  status: "Pending" | "Reviewed" | "Dismissed" | "Action Taken";
}

// -------------------------------------------------------------------
// ASSISTED RURAL & OFFLINE TENANT STRUCTURES
// -------------------------------------------------------------------

export interface AssistedTenantItem {
  id: string;
  fullName: string;
  featurePhone: string; // Feature phone e.g. +251 91 122 3344
  kebeleIdNumber: string; // Kebele ID for rural verification
  region: string; // e.g. Oromia, Amhara, Sidama, SNNPR, Addis Ababa Peri-Urban
  woreda: string;
  preferredHouseType: "Apartment" | "Villa" | "Condo" | "Studio" | "Commercial";
  maxBudgetETB: number;
  familySize: number;
  hasSmartphone: boolean; // false for feature phone users
  registeredDate: string;
  status: "Active Search" | "House Matched" | "Lease Signed";
}

export interface AssistedBookingItem {
  id: string;
  tenantId: string;
  tenantName: string;
  tenantPhone: string;
  propertyId: string;
  propertyTitle: string;
  providerName: string;
  providerPhone: string;
  monthlyRentETB: number;
  depositETB: number;
  paymentMethod: "Cash collected by Agent" | "CBE Birr Agent Transfer" | "Telebirr Agent Voucher";
  receiptNumber: string;
  bookingDate: string;
  status: "Confirmed & Signed" | "Pending Payment" | "Lease Generated";
}

export interface LeaseAgreementItem {
  id: string;
  bookingId: string;
  tenantName: string;
  tenantKebeleId: string;
  providerName: string;
  providerIdNumber: string;
  propertyTitle: string;
  location: string;
  monthlyRentETB: number;
  startDate: string;
  endDate: string;
  kebeleWitnessName: string;
  kebeleWitnessStamp: string;
  status: "Official Draft" | "Signed & Sealed";
}

export interface FeaturePhoneSmsItem {
  id: string;
  recipientPhone: string;
  recipientName: string;
  messageAmharic: string;
  messageEnglish: string;
  sentTime: string;
  status: "Delivered (Feature Phone)" | "Queued";
}

// -------------------------------------------------------------------
// INITIAL MOCK DATA
// -------------------------------------------------------------------

export const mockUsers: UserItem[] = [
  {
    id: "usr-101",
    name: "Abebe Kebede",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80",
    email: "abebe.k@gmail.com",
    phone: "+251 91 123 4567",
    role: "House Provider",
    location: "Bole, Addis Ababa",
    verificationStatus: "Verified",
    accountStatus: "Active",
    registrationDate: "2024-01-15",
    activityCount: 42,
  },
  {
    id: "usr-102",
    name: "Bethlehem Tadesse",
    avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=150&q=80",
    email: "bethlehem.t@yahoo.com",
    phone: "+251 91 234 5678",
    role: "House Seeker",
    location: "Yeka, Addis Ababa",
    verificationStatus: "Verified",
    accountStatus: "Active",
    registrationDate: "2024-02-10",
    activityCount: 18,
  },
  {
    id: "usr-103",
    name: "Dawit Wolde",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80",
    email: "dawit.agent@delala.et",
    phone: "+251 91 345 6789",
    role: "Agent",
    location: "Kirkos & Bole",
    verificationStatus: "Verified",
    accountStatus: "Active",
    registrationDate: "2023-11-01",
    activityCount: 156,
  },
  {
    id: "usr-104",
    name: "Selamawit Girma",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80",
    email: "selam.girma@outlook.com",
    phone: "+251 91 456 7890",
    role: "House Provider",
    location: "CMC, Addis Ababa",
    verificationStatus: "Pending",
    accountStatus: "Active",
    registrationDate: "2024-03-01",
    activityCount: 5,
  },
  {
    id: "usr-105",
    name: "Tewodros Kassaye",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80",
    email: "tewodros.k@gmail.com",
    phone: "+251 91 567 8901",
    role: "House Seeker",
    location: "Arada, Addis Ababa",
    verificationStatus: "Unverified",
    accountStatus: "Active",
    registrationDate: "2024-03-12",
    activityCount: 3,
  },
  {
    id: "usr-106",
    name: "Marta Haile",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80",
    email: "marta.h@gmail.com",
    phone: "+251 91 678 9012",
    role: "House Provider",
    location: "Old Airport, Lideta",
    verificationStatus: "Rejected",
    accountStatus: "Suspended",
    registrationDate: "2024-02-20",
    activityCount: 11,
  },
  {
    id: "usr-107",
    name: "Solomon Tesfaye",
    avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=150&q=80",
    email: "admin@delala.et",
    phone: "+251 91 789 0123",
    role: "Admin",
    location: "Headquarters, Addis Ababa",
    verificationStatus: "Verified",
    accountStatus: "Active",
    registrationDate: "2023-08-01",
    activityCount: 540,
  },
];

export const mockProviders: ProviderItem[] = [
  {
    id: "prov-1",
    name: "Abebe Kebede",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80",
    phone: "+251 91 123 4567",
    email: "abebe.k@gmail.com",
    location: "Bole Atlas, Addis Ababa",
    verificationStatus: "Verified",
    totalProperties: 8,
    activeListings: 6,
    accountStatus: "Active",
    registrationDate: "2024-01-15",
    idNumber: "ETH-ID-98214",
    businessLicense: "LIC-ADDIS-2023-8821",
    recentActivity: [
      { id: "act-1", action: "Updated pricing for Bole Atlas Luxury Villa", time: "2 hours ago" },
      { id: "act-2", action: "Uploaded proof of title deed for Yeka Studio", time: "1 day ago" },
    ],
    reportsCount: 0,
  },
  {
    id: "prov-2",
    name: "Selamawit Girma",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80",
    phone: "+251 91 456 7890",
    email: "selam.girma@outlook.com",
    location: "CMC Michael, Addis Ababa",
    verificationStatus: "Pending",
    totalProperties: 2,
    activeListings: 1,
    accountStatus: "Active",
    registrationDate: "2024-03-01",
    idNumber: "ETH-ID-11029",
    recentActivity: [
      { id: "act-3", action: "Submitted new listing: CMC Modern Apartment", time: "3 hours ago" },
    ],
    reportsCount: 0,
  },
  {
    id: "prov-3",
    name: "Marta Haile",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80",
    phone: "+251 91 678 9012",
    email: "marta.h@gmail.com",
    location: "Old Airport, Lideta",
    verificationStatus: "Rejected",
    totalProperties: 4,
    activeListings: 0,
    accountStatus: "Suspended",
    registrationDate: "2024-02-20",
    idNumber: "ETH-ID-44910",
    recentActivity: [
      { id: "act-4", action: "Account suspended due to report verification", time: "5 days ago" },
    ],
    reportsCount: 3,
  },
];

export const mockSeekers: SeekerItem[] = [
  {
    id: "seek-1",
    name: "Bethlehem Tadesse",
    avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=150&q=80",
    phone: "+251 91 234 5678",
    email: "bethlehem.t@yahoo.com",
    preferredLocation: "Bole, Kazanchis, Yeka",
    savedPropertiesCount: 14,
    inquiriesCount: 6,
    accountStatus: "Active",
    registrationDate: "2024-02-10",
    recentInquiries: [
      { id: "inq-1", propertyTitle: "Luxury 3 Bedroom Apartment in Bole Medhanialem", date: "Yesterday", status: "Agent Responded" },
      { id: "inq-2", propertyTitle: "Cozy Studio Flat near Kazanchis", date: "3 days ago", status: "Scheduled Viewing" },
    ],
  },
  {
    id: "seek-2",
    name: "Tewodros Kassaye",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80",
    phone: "+251 91 567 8901",
    email: "tewodros.k@gmail.com",
    preferredLocation: "Arada, Piassa, Lideta",
    savedPropertiesCount: 3,
    inquiriesCount: 1,
    accountStatus: "Active",
    registrationDate: "2024-03-12",
    recentInquiries: [
      { id: "inq-3", propertyTitle: "Commercial Office Space in Kazanchis", date: "2 days ago", status: "Pending Response" },
    ],
  },
];

export const mockAgents: AgentItem[] = [
  {
    id: "agt-101",
    name: "Dawit Wolde",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80",
    email: "dawit.agent@delala.et",
    phone: "+251 91 345 6789",
    assignedArea: "Bole & Kazanchis",
    propertiesManaged: 42,
    verificationsCompleted: 88,
    activeTasks: 5,
    performanceScore: 98,
    status: "Active",
    joinedDate: "2023-11-01",
  },
  {
    id: "agt-102",
    name: "Hiwot Assefa",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80",
    email: "hiwot.agent@delala.et",
    phone: "+251 91 888 7766",
    assignedArea: "Yeka & CMC",
    propertiesManaged: 34,
    verificationsCompleted: 64,
    activeTasks: 3,
    performanceScore: 94,
    status: "Active",
    joinedDate: "2023-12-15",
  },
  {
    id: "agt-103",
    name: "Kassahun Bekele",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80",
    email: "kassahun.agent@delala.et",
    phone: "+251 91 999 0011",
    assignedArea: "Nifas Silk & Lideta",
    propertiesManaged: 28,
    verificationsCompleted: 45,
    activeTasks: 4,
    performanceScore: 91,
    status: "Active",
    joinedDate: "2024-01-10",
  },
];

export const mockProperties: PropertyItem[] = [
  {
    id: "prop-1",
    title: "Luxury 3 Bedroom Penthouse Apartment",
    images: [
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80",
    ],
    providerId: "prov-1",
    providerName: "Abebe Kebede",
    providerPhone: "+251 91 123 4567",
    providerAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80",
    location: "Bole Medhanialem, Addis Ababa",
    woreda: "Woreda 03",
    coordinates: { lat: 8.9984, lng: 38.7856 },
    propertyType: "Apartment",
    price: 85000,
    period: "month",
    status: "Published",
    verificationStatus: "Verified",
    datePosted: "2024-03-10",
    bedrooms: 3,
    bathrooms: 3,
    areaSqM: 210,
    description: "Stunning penthouse in prime Bole location. Features panoramic views of Addis Ababa skyline, modern kitchen with European appliances, 24/7 security, backup generator, and dedicated parking spaces.",
    amenities: ["Generator", "24/7 Security", "Elevator", "Water Tank", "Balcony", "WiFi Ready", "Furnished"],
    documents: [
      { name: "Title Deed Certificate.pdf", type: "PDF", url: "#", date: "2024-03-08" },
      { name: "Kebele ID Copy.jpg", type: "IMAGE", url: "#", date: "2024-03-08" },
      { name: "Sub-City Permit.pdf", type: "PDF", url: "#", date: "2024-03-08" },
    ],
    agentAssigned: "Dawit Wolde",
    listingHistory: [
      { date: "2024-03-08", event: "Listing Created", actor: "Abebe Kebede" },
      { date: "2024-03-09", event: "Document Verification Approved", actor: "Dawit Wolde" },
      { date: "2024-03-10", event: "Published to Marketplace", actor: "Admin System" },
    ],
    reportsCount: 0,
  },
  {
    id: "prop-2",
    title: "Elegant Modern G+2 Villa with Garden",
    images: [
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80",
    ],
    providerId: "prov-1",
    providerName: "Abebe Kebede",
    providerPhone: "+251 91 123 4567",
    providerAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80",
    location: "Old Airport, Lideta, Addis Ababa",
    woreda: "Woreda 01",
    coordinates: { lat: 8.9812, lng: 38.7345 },
    propertyType: "Villa",
    price: 180000,
    period: "month",
    status: "Published",
    verificationStatus: "Verified",
    datePosted: "2024-03-01",
    bedrooms: 5,
    bathrooms: 4,
    areaSqM: 450,
    description: "Exquisite G+2 villa featuring manicured lawn garden, guard house, staff quarters, underground water reservoir, high-end security system, and spacious master suite.",
    amenities: ["Private Garden", "Staff Quarters", "CCTV", "Generator", "Water Reservoir", "Double Garage"],
    documents: [
      { name: "Villa Title Ownership.pdf", type: "PDF", url: "#", date: "2024-02-28" },
      { name: "Property Tax Clearance.pdf", type: "PDF", url: "#", date: "2024-02-28" },
    ],
    agentAssigned: "Kassahun Bekele",
    listingHistory: [
      { date: "2024-02-28", event: "Listing Submitted", actor: "Abebe Kebede" },
      { date: "2024-03-01", event: "Approved & Published", actor: "Kassahun Bekele" },
    ],
    reportsCount: 0,
  },
  {
    id: "prop-3",
    title: "Cozy Furnished Studio Apartment",
    images: [
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80",
    ],
    providerId: "prov-2",
    providerName: "Selamawit Girma",
    providerPhone: "+251 91 456 7890",
    providerAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80",
    location: "CMC Michael, Yeka, Addis Ababa",
    woreda: "Woreda 08",
    coordinates: { lat: 9.0234, lng: 38.8312 },
    propertyType: "Studio",
    price: 32000,
    period: "month",
    status: "Published",
    verificationStatus: "Verified",
    datePosted: "2024-03-15",
    bedrooms: 1,
    bathrooms: 1,
    areaSqM: 55,
    description: "Modern studio flat ideal for expatriates or young professionals. Fully furnished with high-speed Internet connection, balcony, and elevator access.",
    amenities: ["Furnished", "Elevator", "Water Tank", "Balcony", "Security"],
    documents: [
      { name: "Condo Agreement.pdf", type: "PDF", url: "#", date: "2024-03-15" },
    ],
    agentAssigned: "Hiwot Assefa",
    listingHistory: [
      { date: "2024-03-15", event: "Approved & Published", actor: "Hiwot Assefa" },
    ],
    reportsCount: 0,
  },
  {
    id: "prop-4",
    title: "Prime Commercial Office Space",
    images: [
      "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80",
    ],
    providerId: "prov-3",
    providerName: "Marta Haile",
    providerPhone: "+251 91 678 9012",
    providerAvatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80",
    location: "Kazanchis, Kirkos, Addis Ababa",
    woreda: "Woreda 04",
    coordinates: { lat: 9.0167, lng: 38.7654 },
    propertyType: "Commercial",
    price: 120000,
    period: "month",
    status: "Published",
    verificationStatus: "Verified",
    datePosted: "2024-02-18",
    bedrooms: 0,
    bathrooms: 2,
    areaSqM: 300,
    description: "Open plan commercial office space on 4th floor with elevator, central air conditioning ready, and ample underground parking.",
    amenities: ["Generator", "Elevator", "Underground Parking", "Fire Alarm"],
    documents: [
      { name: "Ownership Certificate.pdf", type: "PDF", url: "#", date: "2024-02-18" },
    ],
    agentAssigned: "Dawit Wolde",
    listingHistory: [
      { date: "2024-02-18", event: "Published to Marketplace", actor: "Dawit Wolde" },
    ],
    reportsCount: 0,
  },
  {
    id: "prop-5",
    title: "Hawassa Lake View 3-Bedroom Family Villa",
    images: [
      "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=800&q=80",
    ],
    providerId: "prov-1",
    providerName: "Abebe Kebede",
    providerPhone: "+251 91 123 4567",
    providerAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80",
    location: "Hawassa, Sidama Region",
    woreda: "Tula Sub-City",
    coordinates: { lat: 7.0621, lng: 38.4763 },
    propertyType: "Villa",
    price: 28000,
    period: "month",
    status: "Published",
    verificationStatus: "Verified",
    datePosted: "2024-03-02",
    bedrooms: 3,
    bathrooms: 2,
    areaSqM: 280,
    description: "Spacious family villa overlooking Lake Hawassa. Features quiet residential compound, perimeter wall, fruit trees, and car parking.",
    amenities: ["Lake View", "Water Tank", "Private Garden", "Secured Wall"],
    documents: [{ name: "Sidama Land Cert.pdf", type: "PDF", url: "#", date: "2024-03-01" }],
    agentAssigned: "Dawit Wolde",
    listingHistory: [{ date: "2024-03-02", event: "Published", actor: "Dawit Wolde" }],
    reportsCount: 0,
  },
  {
    id: "prop-6",
    title: "Adama Expressway Modern 2-Bedroom Condo",
    images: [
      "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80",
    ],
    providerId: "prov-2",
    providerName: "Selamawit Girma",
    providerPhone: "+251 91 456 7890",
    providerAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80",
    location: "Adama (Nazret), Oromia Region",
    woreda: "Bole Sub-City, Adama",
    coordinates: { lat: 8.5412, lng: 39.2689 },
    propertyType: "Condo",
    price: 16000,
    period: "month",
    status: "Published",
    verificationStatus: "Verified",
    datePosted: "2024-03-05",
    bedrooms: 2,
    bathrooms: 1,
    areaSqM: 95,
    description: "Newly built condominium flat near Adama University and Toll Highway turnoff.",
    amenities: ["Water Heater", "Parking", "Security Guard", "Tile Flooring"],
    documents: [{ name: "Adama Condo Lease.pdf", type: "PDF", url: "#", date: "2024-03-04" }],
    agentAssigned: "Dawit Wolde",
    listingHistory: [{ date: "2024-03-05", event: "Published", actor: "Dawit Wolde" }],
    reportsCount: 0,
  },
  {
    id: "prop-7",
    title: "Bahir Dar Lake Tana View Resort Residence",
    images: [
      "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80",
    ],
    providerId: "prov-3",
    providerName: "Marta Haile",
    providerPhone: "+251 91 678 9012",
    providerAvatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80",
    location: "Bahir Dar, Amhara Region",
    woreda: "Belay Zeleke Kebele",
    coordinates: { lat: 11.5942, lng: 37.3892 },
    propertyType: "Apartment",
    price: 22000,
    period: "month",
    status: "Published",
    verificationStatus: "Verified",
    datePosted: "2024-03-12",
    bedrooms: 2,
    bathrooms: 2,
    areaSqM: 130,
    description: "Furnished apartment in peaceful Bahir Dar neighborhood close to Lake Tana palm trees promenade.",
    amenities: ["Lake View", "Balcony", "Backup Water", "Furnished"],
    documents: [{ name: "Amhara Registry.pdf", type: "PDF", url: "#", date: "2024-03-11" }],
    agentAssigned: "Dawit Wolde",
    listingHistory: [{ date: "2024-03-12", event: "Published", actor: "Dawit Wolde" }],
    reportsCount: 0,
  },
];

export const mockVerifications: VerificationItem[] = [
  {
    id: "ver-201",
    propertyId: "prop-3",
    propertyTitle: "Cozy Furnished Studio Apartment in CMC",
    propertyImage: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80",
    providerId: "prov-2",
    providerName: "Selamawit Girma",
    providerPhone: "+251 91 456 7890",
    location: "CMC Michael, Yeka, Addis Ababa",
    documentsCount: 3,
    documents: [
      { title: "Property Ownership Certificate", type: "PDF", url: "#", preview: "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=400&q=80" },
      { title: "National Identity Card", type: "ID Card", url: "#", preview: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=400&q=80" },
      { title: "Utility Bill & Kebele Stamp", type: "PDF", url: "#", preview: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=400&q=80" },
    ],
    submittedDate: "2024-03-15",
    status: "Pending",
    aiPreCheckScore: 94,
    aiPreCheckDetails: {
      ownershipDocsValid: true,
      identityVerified: true,
      locationMatch: true,
      priceReasonable: true,
    },
    assignedAgent: "Hiwot Assefa",
    notes: "Initial AI document scanner verified valid stamp from Yeka Sub-City land administration.",
  },
  {
    id: "ver-202",
    propertyId: "prop-4",
    propertyTitle: "Prime Commercial Office Space in Kazanchis",
    propertyImage: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80",
    providerId: "prov-3",
    providerName: "Marta Haile",
    providerPhone: "+251 91 678 9012",
    location: "Kazanchis, Kirkos, Addis Ababa",
    documentsCount: 2,
    documents: [
      { title: "Draft Commercial Lease", type: "PDF", url: "#", preview: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=400&q=80" },
    ],
    submittedDate: "2024-03-10",
    status: "In Review",
    aiPreCheckScore: 62,
    aiPreCheckDetails: {
      ownershipDocsValid: false,
      identityVerified: true,
      locationMatch: true,
      priceReasonable: false,
    },
    assignedAgent: "Dawit Wolde",
    notes: "Requires secondary power of attorney letter from primary landlord.",
  },
];

export const mockTasks: TaskItem[] = [
  {
    id: "tsk-1",
    title: "Perform Site Visit & Photoshoot for Bole Villa",
    type: "Inspect property",
    propertyTitle: "Modern Villa in Bole Rwanda",
    providerName: "Abebe Kebede",
    assignedAgentId: "agt-101",
    dueDate: "2024-03-20",
    priority: "High",
    status: "Pending",
    description: "Meet provider at site to verify layout dimensions, test water pressure, and capture exterior photography.",
  },
  {
    id: "tsk-2",
    title: "Verify Title Deed Documents for Studio Flat",
    type: "Review documents",
    propertyTitle: "Cozy Furnished Studio Apartment",
    providerName: "Selamawit Girma",
    assignedAgentId: "agt-101",
    dueDate: "2024-03-19",
    priority: "High",
    status: "In Progress",
    description: "Crosscheck registration number with Yeka Sub-City municipal registry.",
  },
  {
    id: "tsk-3",
    title: "Contact Provider regarding rental contract clause",
    type: "Contact provider",
    propertyTitle: "Luxury 3 Bedroom Penthouse",
    providerName: "Abebe Kebede",
    assignedAgentId: "agt-101",
    dueDate: "2024-03-18",
    priority: "Medium",
    status: "Completed",
    description: "Confirm if security deposit terms match the standard 3-month rental agreement.",
  },
  {
    id: "tsk-4",
    title: "Update property pricing and active availability",
    type: "Update property information",
    propertyTitle: "Old Airport Luxury Villa",
    providerName: "Marta Haile",
    assignedAgentId: "agt-101",
    dueDate: "2024-03-14",
    priority: "Low",
    status: "Overdue",
    description: "Confirm if previous tenant has completed checkout inventory.",
  },
];

export const mockNotifications: NotificationItem[] = [
  {
    id: "notif-1",
    title: "New Property Submitted",
    message: "Selamawit Girma submitted a new property listing in CMC for verification.",
    time: "10 mins ago",
    read: false,
    category: "Property",
    link: "/portal/admin/verification",
  },
  {
    id: "notif-2",
    title: "Provider Verification Required",
    message: "Abebe Kebede uploaded updated business registration license.",
    time: "1 hour ago",
    read: false,
    category: "Verification",
    link: "/portal/admin/providers",
  },
  {
    id: "notif-3",
    title: "Property Assigned to You",
    message: "Property #prop-3 in Yeka has been assigned to Dawit Wolde.",
    time: "3 hours ago",
    read: true,
    category: "Property",
    link: "/portal/agent/properties",
  },
  {
    id: "notif-4",
    title: "Document Review Complete",
    message: "AI pre-check finished for 'Commercial Office Space' with score 62/100.",
    time: "Yesterday",
    read: true,
    category: "Verification",
  },
];

export const mockConversations: MessageConversation[] = [
  {
    id: "conv-1",
    participantName: "Abebe Kebede",
    participantRole: "Provider",
    participantAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80",
    lastMessage: "Hello agent, when will the inspector arrive for the penthouse photo session?",
    lastMessageTime: "11:42 AM",
    unreadCount: 2,
    online: true,
    messages: [
      { id: "m1", sender: "them", text: "Selam! I submitted my luxury penthouse listing yesterday.", timestamp: "10:15 AM" },
      { id: "m2", sender: "me", text: "Tenayistilln Abebe! Our team has received your documents.", timestamp: "10:30 AM" },
      { id: "m3", sender: "them", text: "Hello agent, when will the inspector arrive for the penthouse photo session?", timestamp: "11:42 AM" },
    ],
  },
  {
    id: "conv-2",
    participantName: "Bethlehem Tadesse",
    participantRole: "Seeker",
    participantAvatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=150&q=80",
    lastMessage: "Thank you! I would like to schedule a viewing for Saturday afternoon.",
    lastMessageTime: "Yesterday",
    unreadCount: 0,
    online: false,
    messages: [
      { id: "m4", sender: "them", text: "Is the Bole Medhanialem penthouse still available for rent?", timestamp: "Yesterday" },
      { id: "m5", sender: "me", text: "Yes Bethlehem, it is verified and ready for viewing.", timestamp: "Yesterday" },
      { id: "m6", sender: "them", text: "Thank you! I would like to schedule a viewing for Saturday afternoon.", timestamp: "Yesterday" },
    ],
  },
];

export const mockReports: ReportItem[] = [
  {
    id: "rep-1",
    reporterName: "Bethlehem Tadesse",
    reporterEmail: "bethlehem.t@yahoo.com",
    reportedEntityName: "Commercial Office Space in Kazanchis",
    reportedEntityType: "Property",
    reportedEntityId: "prop-4",
    reason: "Incorrect Information",
    description: "The listing price posted (120,000 ETB) differs from the contract amount quoted during the site visit.",
    dateSubmitted: "2024-03-12",
    evidenceUrls: [
      "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=400&q=80",
    ],
    status: "Pending",
  },
  {
    id: "rep-2",
    reporterName: "Solomon Kassahun",
    reporterEmail: "solomon.k@gmail.com",
    reportedEntityName: "Marta Haile",
    reportedEntityType: "Provider",
    reportedEntityId: "prov-3",
    reason: "Fraudulent Listing",
    description: "Provider submitted listing without proper authorization from primary title holder.",
    dateSubmitted: "2024-03-08",
    evidenceUrls: [],
    status: "Reviewed",
  },
];

// -------------------------------------------------------------------
// MOCK DATA FOR ASSISTED RURAL & OFFLINE TENANTS
// -------------------------------------------------------------------

export const mockAssistedTenants: AssistedTenantItem[] = [
  {
    id: "rur-101",
    fullName: "Getachew Zewde",
    featurePhone: "+251 91 888 2211",
    kebeleIdNumber: "AMH-KBL-88210",
    region: "Amhara (Debre Berhan)",
    woreda: "Woreda 04",
    preferredHouseType: "Apartment",
    maxBudgetETB: 18000,
    familySize: 3,
    hasSmartphone: false,
    registeredDate: "2024-03-02",
    status: "Active Search",
  },
  {
    id: "rur-102",
    fullName: "Ayalnesh Bogale",
    featurePhone: "+251 92 444 9900",
    kebeleIdNumber: "ORO-KBL-44120",
    region: "Oromia (Bishoftu)",
    woreda: "Woreda 02",
    preferredHouseType: "Villa",
    maxBudgetETB: 35000,
    familySize: 5,
    hasSmartphone: false,
    registeredDate: "2024-03-05",
    status: "House Matched",
  },
  {
    id: "rur-103",
    fullName: "Worku Gemechu",
    featurePhone: "+251 97 111 5566",
    kebeleIdNumber: "ADD-KBL-99210",
    region: "Addis Ababa Peri-Urban (Akaki)",
    woreda: "Woreda 09",
    preferredHouseType: "Studio",
    maxBudgetETB: 12000,
    familySize: 1,
    hasSmartphone: false,
    registeredDate: "2024-03-10",
    status: "Lease Signed",
  },
];

export const mockAssistedBookings: AssistedBookingItem[] = [
  {
    id: "book-rur-01",
    tenantId: "rur-103",
    tenantName: "Worku Gemechu",
    tenantPhone: "+251 97 111 5566",
    propertyId: "prop-3",
    propertyTitle: "Cozy Studio Flat in CMC Michael",
    providerName: "Selamawit Girma",
    providerPhone: "+251 91 456 7890",
    monthlyRentETB: 12000,
    depositETB: 36000,
    paymentMethod: "Cash collected by Agent",
    receiptNumber: "REC-2024-8841",
    bookingDate: "2024-03-12",
    status: "Confirmed & Signed",
  },
];

export const mockLeaseAgreements: LeaseAgreementItem[] = [
  {
    id: "lease-701",
    bookingId: "book-rur-01",
    tenantName: "Worku Gemechu",
    tenantKebeleId: "ADD-KBL-99210",
    providerName: "Selamawit Girma",
    providerIdNumber: "ETH-ID-11029",
    propertyTitle: "Cozy Studio Flat in CMC Michael",
    location: "CMC Michael, Yeka, Addis Ababa",
    monthlyRentETB: 12000,
    startDate: "2024-04-01",
    endDate: "2025-03-31",
    kebeleWitnessName: "Ato Tesfaye Lemma (Kebele Administrator)",
    kebeleWitnessStamp: "Official Stamp Verified",
    status: "Signed & Sealed",
  },
];

export const mockSmsNotifications: FeaturePhoneSmsItem[] = [
  {
    id: "sms-101",
    recipientPhone: "+251 97 111 5566",
    recipientName: "Worku Gemechu",
    messageAmharic: "ሰላም ወርቁ ፤ በደላላ መድረክ የተከራዩት የኮንዶሚኒየም ቤት ውል በተሳካ ሁኔታ ተፈርሟል። የቤት አቤበ ስልክ፡ 0914567890",
    messageEnglish: "Selam Worku! Your house rental contract for CMC Studio has been officially signed. Landlord contact: +251 91 456 7890",
    sentTime: "Today at 10:15 AM",
    status: "Delivered (Feature Phone)",
  },
  {
    id: "sms-102",
    recipientPhone: "+251 91 888 2211",
    recipientName: "Getachew Zewde",
    messageAmharic: "ሰላም ጌታቸው ፤ ወኪል ዳዊት ለእርስዎ ተስማሚ 3 ክፍሎች ያሉት ቤት አግኝተዋል። ለማየት የካቲት 20 ይገናኙ።",
    messageEnglish: "Selam Getachew! Agent Dawit has found 2 matching house options for your budget. Inspection scheduled for Saturday.",
    sentTime: "Yesterday at 04:30 PM",
    status: "Delivered (Feature Phone)",
  },
];

export const mockAnalyticsData = {
  totalUsers: 12450,
  houseSeekers: 9120,
  houseProviders: 3330,
  totalProperties: 3284,
  activeProperties: 2840,
  pendingProperties: 318,
  verifiedProperties: 2750,
  pendingVerifications: 126,
  totalAgents: 54,
  activeAgents: 48,
  revenueETB: 4850000,
  pendingReports: 14,

  registrationsChart: [
    { month: "Oct", seekers: 420, providers: 110 },
    { month: "Nov", seekers: 580, providers: 145 },
    { month: "Dec", seekers: 790, providers: 210 },
    { month: "Jan", seekers: 920, providers: 260 },
    { month: "Feb", seekers: 1150, providers: 340 },
    { month: "Mar", seekers: 1420, providers: 410 },
  ],

  propertyStatusDistribution: [
    { status: "Published", count: 2840, color: "#10b981" },
    { status: "Pending", count: 318, color: "#f59e0b" },
    { status: "Rented", count: 85, color: "#3b82f6" },
    { status: "Draft", count: 24, color: "#6b7280" },
    { status: "Rejected/Suspended", count: 17, color: "#ef4444" },
  ],

  locationBreakdown: [
    { location: "Bole", count: 1120, percentage: 34 },
    { location: "Yeka & CMC", count: 680, percentage: 21 },
    { location: "Kirkos & Kazanchis", count: 490, percentage: 15 },
    { location: "Arada & Piassa", count: 320, percentage: 10 },
    { location: "Lideta & Old Airport", count: 280, percentage: 8 },
    { location: "Nifas Silk-Lafto", count: 210, percentage: 6 },
    { location: "Kolfe & Akaki", count: 184, percentage: 6 },
  ],

  revenueChart: [
    { month: "Oct", value: 2400000 },
    { month: "Nov", value: 3100000 },
    { month: "Dec", value: 3800000 },
    { month: "Jan", value: 4200000 },
    { month: "Feb", value: 4500000 },
    { month: "Mar", value: 4850000 },
  ],
};
