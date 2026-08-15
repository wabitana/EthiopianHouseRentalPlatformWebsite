# 🏢 Delala - Next-Gen Ethiopian Home Rental Platform

> A state-of-the-art, interactive digital real estate ecosystem tailored for property rentals, 3D spatial room walkthroughs, automated Chapa escrow payments, and landlord management in Ethiopia.

[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![Three.js](https://img.shields.io/badge/Three.js-3D-black?style=for-the-badge&logo=three.js)](https://threejs.org/)
[![Chapa Pay](https://img.shields.io/badge/Chapa-Payment_Gateway-emerald?style=for-the-badge)](https://chapa.co/)
[![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?style=for-the-badge&logo=prisma)](https://www.prisma.io/)

---

## 🌟 Key Features

### 🏡 1. Interactive Real Estate Catalog (`/browse-houses`)
- **Multi-Filter Search**: Instant search and filtering by city (*Addis Ababa, Hawassa, Adama, Bahir Dar*), neighborhood (*Bole, Kazanchis, Old Airport*), room count, and monthly ETB budget.
- **Rich Listing Details**: High-resolution photography, property specs (Beds, Baths, m²), verified landlord badges, and 360° virtual tour tags.
- **Direct Scheduling**: Interactive modal for booking in-person viewings or initiating digital leases.

### 🌐 2. 3D Spatial Canvas & Virtual Walkthroughs
- **Three.js Architectural Engine**: Real-time rotating 3D wireframe house model built with `@react-three/fiber` and `@react-three/drei`.
- **Room Switcher**: Instant spatial preview across Executive Living Rooms, Master Suites, and European Fitted Kitchens with feature hotspots.

### 💳 3. Chapa Payment Gateway & Escrow Protection
- **100% Deposit Guarantee**: Security deposits are securely held in Chapa financial escrow until physical key handover and walkthrough verification.
- **Direct Payouts**: Automated monthly rent payouts into landlord Ethiopian bank accounts (*Commercial Bank of Ethiopia, Awash, Telebirr*).

### 📜 4. Bilingual Digital Lease Contracts
- Standardized digital rental lease agreements in both **Amharic & English**, legally binding under Ethiopian civil code law.

### 🏙️ 5. City Living & Neighborhood Intelligence
- Interactive guide analyzing median ETB rent prices, safety ratings (98%), walkability scores, and international school proximity for top diplomatic and business quarters.

### 🧮 6. Move-In Rent & Deposit Budget Calculator
- Real-time interactive budget slider (15,000 ETB - 100,000 ETB), security deposit terms selector (1–3 months), utility reserve toggles, and payment mode breakdowns with zero hidden fees.

### 📱 7. Scroll-Driven Horizontal Property Showcase
- Framer Motion scroll-driven horizontal track that translates property cards smoothly based on vertical page scroll.

### 👩‍💼 8. Landlord & Seller Portal
- Property owner onboarding with verified tenant background screening, national ID verification, move-in photo inventory, and rental yield metrics.

---

## 🛠️ Technology Stack

| Layer | Technology |
| :--- | :--- |
| **Framework** | [Next.js 15](https://nextjs.org/) (App Router, Server Components & Actions) |
| **Language** | [TypeScript](https://www.typescriptlang.org/) |
| **Styling** | [Tailwind CSS](https://tailwindcss.com/), Vanilla CSS, Glassmorphism design system |
| **3D & Canvas** | [Three.js](https://threejs.org/), `@react-three/fiber`, `@react-three/drei` |
| **Animations** | [Framer Motion](https://www.framer.com/motion/), Lucide Icons |
| **Database & ORM**| [Prisma ORM](https://www.prisma.io/) (SQLite for local dev / PostgreSQL for production) |
| **Payments** | [Chapa Payment Gateway API](https://chapa.co/) (Local ETB Payouts) |
| **Authentication** | Custom JWT Session Auth with role-based access control (Admin, Vendor/Landlord, Tenant) |

---

## 📂 Project Architecture

```text
platform/
├── prisma/
│   └── schema.prisma          # Database schema (Users, Properties, Bookings, Leases)
├── public/
│   └── images/                # High-resolution property & branding assets
├── src/
│   ├── app/
│   │   ├── api/               # API routes (Auth, Chapa, Properties, Bookings, Uploads)
│   │   ├── browse-houses/     # Real estate catalog & filtering page
│   │   ├── cms/               # CMS Admin dashboard & configuration
│   │   ├── login/             # User login portal
│   │   ├── register/          # User registration portal
│   │   ├── services/          # Move-in & home maintenance services
│   │   ├── layout.tsx         # Root app layout & global providers
│   │   └── page.tsx           # Home landing page with interactive sections
│   ├── components/
│   │   ├── home/              # 3D spatial visualizers, calculators, marquee tracks
│   │   ├── layout/            # Navbar, Footer, Mobile Navigation
│   │   ├── ui/                # Reusable UI components (Buttons, Cards, Inputs)
│   │   └── Chatbot.tsx        # Automated AI rental concierge assistant
│   └── lib/
│       ├── auth.ts            # Authentication & JWT session helpers
│       ├── chapa.ts           # Chapa payment integration helpers
│       ├── cms.ts             # Dynamic CMS configuration
│       ├── prisma.ts          # Singleton Prisma client instance
│       └── utils.ts           # Currency formatting & class merge utilities
└── package.json
```

---

## 🚀 Getting Started (Local Development)

### 1. Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher

### 2. Clone Repository & Install Dependencies
```bash
git clone https://github.com/your-username/delala-platform.git
cd delala-platform
npm install
```

### 3. Environment Setup
Create a `.env` file in the root directory:
```env
DATABASE_URL="file:./dev.db"
JWT_SECRET="your-super-secret-jwt-key"
CHAPA_SECRET_KEY="CHASECK_TEST-your-chapa-secret-key"
CHAPA_PUBLIC_KEY="CHAPUBK_TEST-your-chapa-public-key"
```

### 4. Database Initialization
```bash
npx prisma db push
```

### 5. Launch Development Server
```bash
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser to view the platform.

---

## 🔑 Demo Accounts

| Role | Email | Password |
| :--- | :--- | :--- |
| **Admin / CMS** | `admin@delala.com` | `password123` |
| **Landlord / Agent** | `vendor@delala.com` | `password123` |
| **Tenant** | `customer@delala.com` | `password123` |

---

## 📄 License

This project is released under the **MIT License**.

Built with ❤️ for **Delala Home Rentals PLC**.
