"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CmsService = exports.defaultCmsConfig = void 0;
const prisma_1 = require("../../prisma");
exports.defaultCmsConfig = {
    cms_navbar: {
        siteName: "Delala Rentals",
        siteTagline: "Ethiopian Home Rental Platform",
        logoLetter: "H",
        logoColor: "#059669",
    },
    cms_hero: {
        badge: "Ethiopia's Premier Home Rental Platform",
        title: "Find & Rent Your Next Dream Home in Ethiopia",
        subtitle: "Explore verified apartments, luxury villas, studio flats, and family houses in Addis Ababa, Hawassa, Adama & Bahir Dar with transparent ETB pricing and digital lease agreements.",
        primaryButtonText: "Explore Home Rentals",
        primaryButtonLink: "/marketplace",
        secondaryButtonText: "Book Rental Inspection",
        secondaryButtonLink: "/services",
        backgroundType: "animation",
        backgroundColor: "#059669",
        backgroundImage: "",
        backgroundVideo: "",
    },
    cms_features: [
        { icon: "Store", image: "", title: "Verified Rental Listings", desc: "Browse verified apartments, luxury villas, and studio flats with 360° virtual tours and zero hidden broker fees." },
        { icon: "Wrench", image: "", title: "Move-In & Property Services", desc: "Book pre-rental property inspections, move-in deep cleaning, tenant relocation, and maintenance on-demand." },
        { icon: "CreditCard", image: "", title: "Chapa Rent Payments", desc: "Pay monthly rent, security deposits, and booking fees securely via Chapa with automated digital receipts and invoices." },
        { icon: "Smartphone", image: "", title: "Tenant & Landlord App", desc: "Track lease agreements, pay rent on the go, chat with verified landlords, and request home repairs 24/7." },
    ],
    cms_platform_highlights: [
        { category: "Residential Rentals", image: "", name: "Addis Luxury Apartments", desc: "Fully furnished & unfurnished 1-4 bedroom apartments in Bole, Kazanchis, and Old Airport." },
        { category: "Villas & Houses", image: "", name: "Gated Family Homes", desc: "Spacious multi-bedroom villas with private yards, parking, and 24/7 neighborhood security." },
        { category: "Move-In Services", image: "", name: "Tenant Relocation & Cleaning", desc: "Hassle-free move-in cleaning, luggage transport, locksmiths, and utility connection support." },
        { category: "Digital Leases", image: "", name: "Instant Chapa Verification", desc: "Generate legal rental contracts in ETB and complete security deposit payments in minutes." },
    ],
    cms_vendor_cta: {
        badge: "Landlord & Agent Portal",
        title: "Are you a homeowner, landlord, or property manager?",
        subtitle: "List your property on Ethiopia's leading rental platform. Reach thousands of verified tenants, automate monthly rent collection via Chapa, track maintenance requests, and manage leases effortlessly.",
        buttonText: "List Your Property Now",
        buttonLink: "/register?role=vendor",
    },
    cms_theme_colors: {
        primaryColor: "#059669",
        secondaryColor: "#0f172a",
        accentColor: "#a3e635",
        heroGradientFrom: "#064e3b",
        heroGradientTo: "#0f172a",
        navbarBg: "#ffffff",
        footerBg: "#0f172a",
    },
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
class CmsService {
    static async getConfig() {
        try {
            const records = await prisma_1.prisma.platformConfig.findMany();
            const dbConfig = {};
            for (const r of records) {
                try {
                    dbConfig[r.key] = JSON.parse(r.value);
                }
                catch {
                    dbConfig[r.key] = r.value;
                }
            }
            return {
                ...exports.defaultCmsConfig,
                ...dbConfig,
            };
        }
        catch (err) {
            console.error('Error fetching CMS config from DB, using fallback:', err);
            return exports.defaultCmsConfig;
        }
    }
    static async updateConfig(key, value) {
        return prisma_1.prisma.platformConfig.upsert({
            where: { key },
            update: { value },
            create: { key, value },
        });
    }
}
exports.CmsService = CmsService;
