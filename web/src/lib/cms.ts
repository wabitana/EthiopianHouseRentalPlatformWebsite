import { prisma } from "./prisma";

export const defaultCmsConfig = {
  // --- NAVBAR ---
  cms_navbar: {
    siteName: "Delala Rentals",
    siteTagline: "Ethiopian Home Rental Platform",
    logoLetter: "H",
    logoColor: "#059669", // emerald-600
  },

  // --- HERO SECTION ---
  cms_hero: {
    badge: "Ethiopia's Premier Home Rental Platform",
    title: "Find & Rent Your Next Dream Home in Ethiopia",
    subtitle: "Explore verified apartments, luxury villas, studio flats, and family houses in Addis Ababa, Hawassa, Adama & Bahir Dar with transparent ETB pricing and digital lease agreements.",
    primaryButtonText: "Explore Home Rentals",
    primaryButtonLink: "/marketplace",
    secondaryButtonText: "Book Rental Inspection",
    secondaryButtonLink: "/services",
    backgroundType: "animation", // options: "animation", "color", "image", "video"
    backgroundColor: "#059669",
    backgroundImage: "",
    backgroundVideo: "",
  },

  // --- FEATURES (4 cards under hero) ---
  cms_features: [
    { icon: "Store", image: "", title: "Verified Rental Listings", desc: "Browse verified apartments, luxury villas, and studio flats with 360° virtual tours and zero hidden broker fees." },
    { icon: "Wrench", image: "", title: "Move-In & Property Services", desc: "Book pre-rental property inspections, move-in deep cleaning, tenant relocation, and maintenance on-demand." },
    { icon: "CreditCard", image: "", title: "Chapa Rent Payments", desc: "Pay monthly rent, security deposits, and booking fees securely via Chapa with automated digital receipts and invoices." },
    { icon: "Smartphone", image: "", title: "Tenant & Landlord App", desc: "Track lease agreements, pay rent on the go, chat with verified landlords, and request home repairs 24/7." },
  ],

  // --- PLATFORM HIGHLIGHTS ---
  cms_platform_highlights: [
    { category: "Residential Rentals", image: "", name: "Addis Luxury Apartments", desc: "Fully furnished & unfurnished 1-4 bedroom apartments in Bole, Kazanchis, and Old Airport." },
    { category: "Villas & Houses", image: "", name: "Gated Family Homes", desc: "Spacious multi-bedroom villas with private yards, parking, and 24/7 neighborhood security." },
    { category: "Move-In Services", image: "", name: "Tenant Relocation & Cleaning", desc: "Hassle-free move-in cleaning, luggage transport, locksmiths, and utility connection support." },
    { category: "Digital Leases", image: "", name: "Instant Chapa Verification", desc: "Generate legal rental contracts in ETB and complete security deposit payments in minutes." },
  ],

  // --- COUNTER STATS ---
  cms_counters: [
    { value: 2018, label: "Years Experience in Real Estate" },
    { value: 3500, label: "Verified Rental Properties" },
    { value: 12500, label: "Satisfied Tenants & Families" },
    { value: 8500, label: "Completed Lease Bookings" },
  ],

  // --- CTA SECTION ---
  cms_cta: {
    title: "Ready to Find Your Ideal Ethiopian Home?",
    subtitle: "Join thousands of tenants, landlords, and property managers operating on Ethiopia's unified rental ecosystem.",
    buttonText: "Browse All Home Rentals",
    buttonLink: "/register",
  },

  // --- ABOUT US ---
  cms_about: {
    badge: "About Delala Rentals",
    title: "Your comfort, security & peace of mind is our mission!",
    mission: "To transform home renting in Ethiopia by delivering transparent property listings, verified landlords, and hassle-free move-in services.",
    vision: "To be the go-to home rental and property management platform across Ethiopia and East Africa.",
    paragraph1: "Delala Home Rentals is Ethiopia's dedicated digital rental platform connecting property owners with qualified tenants across Addis Ababa and key regional capitals. We simplify the entire rental journey—from property discovery and physical tours to digital lease contracts and rent payments.",
    paragraph2: "With years of real estate experience, we eliminate fake listings, exorbitant broker commissions, and paperwork stress through verified landlord profiles, legal lease contracts, and transparent ETB pricing.",
    paragraph3: "Our dedicated customer team coordinates everything you need: tenant move-in logistics, professional home cleaning, maintenance assistance, and 24/7 landlord-tenant communication.",
    phone: "+251 911 819 145",
    services: ["Verified residential & luxury villa home rentals", "Move-in cleaning, inspection & tenant logistics", "Instant Chapa rent payments & digital lease agreements"],
    explorebuttonText: "Find Your Home Now",
    exploreButtonLink: "/register",
    videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-industrial-facility-with-pipelines-at-sunset-41481-large.mp4",
  },

  // --- HOW IT WORKS ---
  cms_how_it_works: {
    badge: "Simple Rental Process",
    title: "How Delala Home Rentals Works",
    subtitle: "From searching verified listings to signing your digital lease and moving in—renting a home in Ethiopia is fast and secure.",
    steps: [
      { step: "01", title: "Search & Filter Homes", description: "Filter apartments, villas, and townhouses by location, monthly budget, bedrooms, and amenities across Addis Ababa." },
      { step: "02", title: "Schedule Inspection & Tour", description: "Book in-person physical property walkthroughs or 360° virtual tours directly with verified property owners." },
      { step: "03", title: "Secure Lease & Chapa Pay", description: "Pay security deposit and first month's rent securely via Chapa with instant digital lease contract generation." },
      { step: "04", title: "Move In & Enjoy Services", description: "Schedule move-in deep cleaning, luggage transport, key collection, and access 24/7 tenant maintenance support." },
    ],
    ctaText: "Start Renting Today",
    ctaLink: "/services",
  },

  // --- APP DOWNLOAD SECTION ---
  cms_app_section: {
    badge: "Now Available on iOS & Android",
    title: "Delala Home Rentals App",
    titleHighlight: "In the Palm of Your Hand",
    subtitle: "Discover new rental listings, chat directly with property owners, pay monthly rent via Chapa, and request maintenance services right from your smartphone.",
    features: [
      "Real-time rental availability alerts",
      "Instant Chapa rent payments & receipts",
      "24/7 direct landlord & maintenance chat",
      "Move-in service booking & contract history",
    ],
    playStoreLink: "#play-store",
    appStoreLink: "#app-store",
  },

  // --- VENDOR CTA SECTION ---
  cms_vendor_cta: {
    badge: "Landlord & Agent Portal",
    title: "Are you a homeowner, landlord, or property manager?",
    subtitle: "List your property on Ethiopia's leading rental platform. Reach thousands of verified tenants, automate monthly rent collection via Chapa, track maintenance requests, and manage leases effortlessly.",
    buttonText: "List Your Property Now",
    buttonLink: "/register?role=vendor",
  },

  // --- THEME COLORS ---
  cms_theme_colors: {
    primaryColor: "#059669",
    secondaryColor: "#0f172a",
    accentColor: "#a3e635",
    heroGradientFrom: "#064e3b",
    heroGradientTo: "#0f172a",
    navbarBg: "#ffffff",
    footerBg: "#0f172a",
  },

  // --- EXISTING SECTIONS ---
  cms_landing_content: {
    heroTitle: "Find & Rent Your Next Dream Home in Ethiopia",
    heroSubtitle: "Delala Home Rentals connects property owners, qualified tenants, and service providers across Ethiopia.",
  },
  cms_meet_the_minds: [
    { id: "1", name: "Abebe Tadesse", role: "Founder & CEO", photo: "https://ui-avatars.com/api/?name=Abebe+Tadesse", linkedin: "#" },
  ],
  cms_partner_companies: [
    { id: "1", name: "INSA", logo: "/logos/insa.png" },
    { id: "2", name: "Ethiopian Airlines", logo: "/logos/ethiopian.png" },
    { id: "3", name: "Safaricom", logo: "/logos/safaricom.png" },
    { id: "4", name: "Huawei", logo: "/logos/huawei.png" },
    { id: "5", name: "CBE", logo: "/logos/cbe.png" },
    { id: "6", name: "Ethio Telecom", logo: "/logos/ethio.png" },
  ],
  cms_testimonials: [
    {
      id: "1",
      name: "Tigist Alemu",
      role: "Tenant in Bole",
      company: "Addis Ababa",
      image: "https://ui-avatars.com/api/?name=Tigist+Alemu",
      content: "Finding an apartment in Addis Ababa used to take weeks of hassle with brokers. With Delala Home Rentals, I inspected and moved into my 2-bedroom home in 3 days!",
    },
  ],
  cms_footer: {
    address: "Bole Medhaniallem, Addis Ababa, Ethiopia",
    phone: "+251 911 819 145",
    email: "rentals@delala.com",
    officeHoursWeekday: "08:30 AM - 06:00 PM",
    officeHoursWeekend: "09:00 AM - 01:00 PM",
    copyright: "© Delala Home Rentals PLC, All Rights Reserved.",
    services: ["Apartments & Condos", "Luxury Villas & Family Houses", "Move-In & Cleaning Services"],
  },
};

const ALL_CMS_KEYS = Object.keys(defaultCmsConfig);

export async function getCmsConfig() {
  return defaultCmsConfig;
}

