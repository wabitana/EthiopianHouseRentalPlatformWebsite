# 🏛️ Ethiopian House Rental Platform — Backend API Engine

Enterprise-grade RESTful API built on **Node.js, Express, TypeScript, and Neon PostgreSQL (via Prisma ORM)**. Serves both the **Next.js Web Admin/Agent Portal** and the **Flutter Mobile App**.

---

## 🔄 Core Workflows

1. **Authentication & Authorization**: Registration with Ethiopian Region/City hierarchy, 16-digit Fayda ID validation, JWT token sessions, and bcrypt password hashing.
2. **House Listing & Verification Pipeline**:
   - Landlords post listings -> State initialized as `pending` (`isVerified: false`).
   - Admin / Field Agent reviews document deeds & site plan -> Approves (`active`) or Rejects listing.
   - Seekers browse only verified `active` properties.
3. **Monetization & Chapa Payments**: Owner listing subscription enforcement (`Basic`, `Professional`, `Business`) integrated with Chapa API gateway.
4. **Real-Time Inquiries & Chat**: JSON-based chat thread persistence in PostgreSQL with real-time sync across Web and Mobile UI.
5. **AI Scam Detection & Search**: LangChain / GPT-4o powered safety risk audit and vector search recommendations.

---

## 🛡️ Security Architecture

- **JWT Session Tokens**: Stateless authentication passed via HTTP Bearer headers.
- **bcryptjs**: One-way salt hashing (10 rounds) for password security.
- **Zod Schema Validation**: Enforces strict payload validation on all endpoints.
- **Role-Based Access Control (RBAC)**: Middleware permissions for `admin`, `agent`, `provider`, and `seeker`.
- **CORS Protection**: Origin restriction and header sanitation.

---

## 📦 Package Dependencies

- **Framework**: `express`, `typescript`, `ts-node-dev`
- **Database & ORM**: `@prisma/client`, `@prisma/adapter-neon`, `@neondatabase/serverless`
- **Auth & Security**: `jsonwebtoken`, `bcryptjs`, `cors`, `cookie-parser`
- **Validation**: `zod`, `multer`
- **Communications**: `nodemailer`, `cloudinary`, `node-telegram-bot-api`
- **AI Engine**: `@langchain/openai`, `@langchain/core`, `@langchain/langgraph`