# 🏢 Ethiopian House Rental Platform (Delala)

> A modern, multi-tier digital real estate marketplace connecting House Seekers and House Providers in Ethiopia with 3D spatial room walkthroughs, Chapa payment escrow, and dynamic property management.

[![Node.js](https://img.shields.io/badge/Node.js-18+-green?style=for-the-badge&logo=nodedotjs)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Flutter](https://img.shields.io/badge/Flutter-3.12+-02569B?style=for-the-badge&logo=flutter)](https://flutter.dev/)
[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Neon_Cloud-336791?style=for-the-badge&logo=postgresql)](https://neon.tech/)
[![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?style=for-the-badge&logo=prisma)](https://www.prisma.io/)

---

## 📂 Project Architecture

This repository is structured as a unified monorepo containing three core services:

```text
Ethiopian-House-Rental/
├── backend/            # Main Node.js REST API Server (Express + Prisma + Neon PostgreSQL)
├── mobile/             # Flutter Cross-Platform Mobile Application (iOS & Android)
└── web/                # Next.js 15 Web Platform & Admin Dashboard
```

### 🏛️ Unified System Flow
```text
  📱 Flutter Mobile App              🌐 Next.js Web Dashboard
   (Seekers & Providers)                (Admin & CMS Portal)
            │                                    │
            └───────────────┬────────────────────┘
                            │ HTTPS / REST API
                            ▼
                ⚙️ Main Node.js Backend Server
                  (Express.js @ /api/v1/)
                            │
                            │ Prisma ORM
                            ▼
              🐘 Neon Cloud PostgreSQL Database
```

---

## 👥 Team & Group Setup Instructions

Follow these steps to set up your local development environment and collaborate with the team.

### 1. Prerequisites
- **Node.js**: v18.0.0 or higher
- **Flutter SDK**: v3.12.0 or higher
- **Git**: v2.30.0 or higher

---

### 2. Environment Configuration (`.env`)

Each service component requires an environment configuration file before running. `.env.example` templates are provided in each folder.

#### A. Backend Setup (`/backend`)
Copy [.env.example](backend/.env.example) to create `backend/.env`:

```bash
cd backend
cp .env.example .env
```

Ensure `backend/.env` contains the team's Neon PostgreSQL connection string:
```env
PORT=3000
DATABASE_URL="postgresql://neondb_owner:npg_HiBAye05nWCg@ep-falling-hill-aydd9dr3.c-5.us-east-2.aws.neon.tech/neondb?sslmode=require"
JWT_SECRET="ethiopian_house_rental_super_secret_jwt_key_2026"
```

#### B. Web Platform Setup (`/web`)
Copy [.env.example](web/.env.example) to create `web/.env`:
```bash
cd ../web
cp .env.example .env
```

---

### 3. Database Migration & Seeding (Neon PostgreSQL)

To sync the Prisma schema with the shared Neon PostgreSQL database and seed demo data:

```bash
cd backend
npm install
npx prisma generate
npx prisma db push
npx ts-node src/seed.ts
```

---

### 4. Running the Applications

#### ⚙️ Run Backend Server
```bash
cd backend
npm run dev
```
The REST API server will run at: `http://localhost:3000/api/v1`

#### 📱 Run Flutter Mobile Application
```bash
cd mobile
flutter pub get
flutter run
```
*Note for Android Emulator testing*: The mobile app automatically connects to `http://10.0.2.2:3000/api/v1`.

#### 🌐 Run Web Platform
```bash
cd web
npm install
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📡 Main REST API Documentation (`/api/v1`)

| Category | Method | Endpoint | Authorization | Description |
| :--- | :--- | :--- | :--- | :--- |
| **Auth** | `POST` | `/api/v1/auth/register` | Public | Register new House Seeker or Provider |
| **Auth** | `POST` | `/api/v1/auth/login` | Public | Login & receive Bearer JWT Token |
| **Auth** | `POST` | `/api/v1/auth/logout` | Bearer | End user session |
| **User** | `GET` | `/api/v1/users/me` | Bearer | Get authenticated user profile |
| **User** | `PATCH` | `/api/v1/users/me` | Bearer | Update user profile details |
| **Properties** | `GET` | `/api/v1/properties` | Public | Filter, search, and browse active properties |
| **Properties** | `GET` | `/api/v1/properties/:id` | Public | Get detailed property specifications |
| **Properties** | `POST` | `/api/v1/properties` | Provider | Create new listing (Status: `pending`) |
| **Properties** | `PATCH` | `/api/v1/properties/:id` | Provider | Update property details |
| **Properties** | `DELETE` | `/api/v1/properties/:id` | Provider | Remove property listing |
| **Properties** | `PATCH` | `/api/v1/properties/:id/availability` | Provider | Toggle property availability (Available / Rented) |
| **Provider** | `GET` | `/api/v1/provider/properties` | Provider | Get listings owned by authenticated provider |
| **Provider** | `GET` | `/api/v1/provider/inquiries` | Provider | Get rental inquiries received for provider properties |
| **Favorites** | `GET` | `/api/v1/favorites` | Bearer | Get user's saved favorite properties |
| **Favorites** | `POST` | `/api/v1/favorites/:propertyId` | Bearer | Save property to favorites |
| **Favorites** | `DELETE` | `/api/v1/favorites/:propertyId` | Bearer | Remove property from favorites |
| **Inquiries** | `POST` | `/api/v1/inquiries` | Seeker | Send inquiry message to landlord/provider |
| **Inquiries** | `GET` | `/api/v1/inquiries` | Bearer | Get sent or received inquiries |
| **Inquiries** | `PATCH` | `/api/v1/inquiries/:id` | Provider | Respond to inquiry and update status |
| **Notifications** | `GET` | `/api/v1/notifications` | Bearer | List user notifications |
| **Notifications** | `PATCH` | `/api/v1/notifications/:id/read` | Bearer | Mark notification as read |
| **Admin** | `GET` | `/api/v1/admin/properties/pending` | Admin | Review pending property submissions |
| **Admin** | `PATCH` | `/api/v1/admin/properties/:id/approve` | Admin | Approve property and publish to marketplace |
| **Upload** | `POST` | `/api/v1/upload` | Bearer | Upload multi-part property images |

---

## 🔑 Pre-Seeded Demo Accounts

| Role | Email | Password | Account Purpose |
| :--- | :--- | :--- | :--- |
| **House Seeker** | `seeker@delala.com` | `password123` | House discovery, 360 walkthrough, favorites, inquiry submission |
| **House Provider** | `provider@delala.com` | `password123` | Post house, upload photos, manage listings & inquiry replies |
| **Platform Admin** | `admin@delala.com` | `password123` | Review & approve pending property listings |

---

## Group Members
## Name   ===============                ID

### 1. shanbel kibre CTC-416-26
### 2. wabi  Tena CTC-338-26
### 3. Serawit Shimels CTC-271-26
### 4. Tomas   Godefa CTC-2336-26






## 📄 License

This project is maintained for **Ethiopian House Rental PLC**.
