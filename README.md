# 🎓 CertiTrust - Secure Certificate Generator & Verification Platform

> **Version**: 1.2  
> **Status**: 🚧 In Development (35% Complete)  
> **Owner**: Amulya A  
> **Last Updated**: October 2025

---

## 📋 Project Overview

CertiTrust is a secure, cloud-based certificate generation and verification system that enables organizations to:

- **Generate** bulk certificates with hidden encoded verification codes
- **Store** certificates securely in Firebase with tamper-proof metadata
- **Verify** certificate authenticity via PDF upload or certificate ID lookup
- **Track** all verification attempts with comprehensive logging

### Key Features

✅ **Automated Bulk Certificate Generation**  
✅ **Tamper-Proof Encoded Certificates**  
✅ **Reliable Verification System with Logs**  
✅ **Professional Frontend with Dark Mode Support**  
✅ **Secure Firebase Backend**

---

## 🎯 Current Status

### What's Working ✅

- ✅ Beautiful, responsive UI built with Next.js 15 + React 19
- ✅ Admin dashboard with multi-step certificate generation flow
- ✅ Verification portal with dual verification methods (PDF/ID)
- ✅ Firebase client & admin SDK initialized
- ✅ Theme support (light/dark mode)
- ✅ Component library (Radix UI + Tailwind CSS)

### What Needs Work 🚧

- ⚠️ **Excel parsing** - Currently returns mock data
- ⚠️ **PDF generation** - Not implemented (critical)
- ⚠️ **Encoding/decoding system** - Not implemented (critical)
- ⚠️ **Firestore integration** - Not connected
- ⚠️ **Authentication** - Login page exists but not functional
- ⚠️ **Verification API** - Mock data only

**See [`PRD_IMPLEMENTATION_STATUS.md`](./PRD_IMPLEMENTATION_STATUS.md) for detailed gap analysis.**

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and pnpm
- Firebase project with Firestore, Auth, and Storage enabled
- Firebase service account credentials

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd CertifyTrust

# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your Firebase credentials

# Run development server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

---

## 📚 Documentation

| Document | Description |
|----------|-------------|
| **[PRD_IMPLEMENTATION_STATUS.md](./PRD_IMPLEMENTATION_STATUS.md)** | Detailed gap analysis between PRD requirements and current implementation |
| **[IMPLEMENTATION_GUIDE.md](./IMPLEMENTATION_GUIDE.md)** | Step-by-step technical implementation guide with code examples |
| **[QUICK_START_CHECKLIST.md](./QUICK_START_CHECKLIST.md)** | Prioritized checklist to get the system fully functional ASAP |
| **[ARCHITECTURE.md](./ARCHITECTURE.md)** | System architecture, data flows, and database schemas |
| **[FIREBASE_SETUP.md](./FIREBASE_SETUP.md)** | Firebase project configuration guide |
| **[THEME_CONFIGURATION.md](./THEME_CONFIGURATION.md)** | UI theme and styling customization |

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 15.2.4 (App Router)
- **UI**: React 19 with TypeScript
- **Styling**: Tailwind CSS 4.x
- **Components**: Radix UI primitives
- **Forms**: React Hook Form + Zod validation
- **Icons**: Lucide React
- **Notifications**: Sonner

### Backend
- **Runtime**: Node.js (Vercel serverless)
- **Authentication**: Firebase Auth
- **Database**: Cloud Firestore
- **Storage**: Firebase Storage
- **PDF Generation**: pdf-lib *(to be implemented)*
- **Excel Parsing**: xlsx *(to be implemented)*
- **Encryption**: crypto-js *(to be implemented)*

### Infrastructure
- **Hosting**: Vercel / Firebase Hosting
- **CDN**: Vercel Edge Network
- **SSL**: Automatic (Vercel/Firebase)

---

## 📂 Project Structure

```
CertifyTrust/
├── app/                          # Next.js App Router
│   ├── admin/dashboard/          # Admin portal
│   ├── api/                      # API routes
│   │   ├── generate-certificates/
│   │   ├── verify/
│   │   └── auth/
│   ├── login/                    # Login page
│   ├── verify/                   # Verification page
│   └── page.tsx                  # Home page
│
├── components/                   # React components
│   ├── admin/                    # Admin-specific components
│   ├── home/                     # Home page sections
│   └── ui/                       # Reusable UI components
│
├── lib/                          # Utility libraries
│   ├── firebase.ts               # Firebase client config
│   ├── firebase-admin.ts         # Firebase admin config
│   └── utils.ts                  # Helper functions
│
├── hooks/                        # Custom React hooks
├── styles/                       # Global styles
├── middleware.ts                 # Auth middleware
└── [Documentation files]
```

---

## 🔐 Security

### Current Security Measures
- ✅ Firebase Authentication for admin access
- ✅ Middleware-based route protection
- ✅ HTTPS enforced (Vercel/Firebase)

### Planned Security Features
- ⚠️ Firestore security rules (to be deployed)
- ⚠️ Salted AES-256 encryption for verification codes
- ⚠️ File upload validation (server-side)
- ⚠️ Rate limiting for verification API

---

## 📊 Database Schema

### Firestore Collections

#### `certificates`
```javascript
{
  certificateId: "CT-2025-123456",
  participantName: "John Doe",
  email: "john@example.com",
  eventName: "Web Development Bootcamp",
  organization: "Tech Academy",
  date: Timestamp,
  encodedKey: "encrypted_verification_code",
  status: "Valid",  // Valid | Revoked
  template: "Blue Professional",
  pdfUrl: "gs://bucket/certificates/cert.pdf",
  createdAt: Timestamp
}
```

#### `verification_logs`
```javascript
{
  certificateId: "CT-2025-123456",
  result: "Verified",  // Verified | Invalid
  verifiedAt: Timestamp,
  ipAddress: "192.168.1.1",
  userAgent: "Mozilla/5.0..."
}
```

#### `admins`
```javascript
{
  email: "admin@certitrust.com",
  role: "superadmin",  // superadmin | admin
  lastLogin: Timestamp,
  createdAt: Timestamp
}
```

See [`ARCHITECTURE.md`](./ARCHITECTURE.md) for complete schema details.

---

## 🎨 UI Preview

### Home Page
- Hero section with CTA buttons
- Benefits showcase
- How it works (process steps)
- Testimonials
- Call-to-action section

### Admin Dashboard
- Multi-step certificate generation wizard
- Event details form
- Excel file upload with preview
- Template selection with preview cards
- Progress tracking with status indicators

### Verification Portal
- Dual verification methods (PDF upload / ID lookup)
- Beautiful result cards (verified/invalid)
- Certificate details display
- Responsive design for mobile

---

## 🔄 Workflows

### Certificate Generation Flow
1. Admin logs in (Firebase Auth)
2. Enters event details (name, org, date, signatory)
3. Uploads Excel file with participant data
4. Selects certificate template
5. System generates PDFs with hidden encoded keys
6. PDFs uploaded to Firebase Storage
7. Metadata stored in Firestore
8. Optional: Email certificates to participants

### Verification Flow
1. User navigates to `/verify`
2. Chooses verification method:
   - Upload certificate PDF
   - Enter certificate ID
3. System extracts/decodes verification code
4. Queries Firestore for certificate
5. Displays verification result
6. Logs attempt to `verification_logs`

---

## 🚧 Implementation Roadmap

### Phase 1: Foundation (Week 1-2) ⏳
- [ ] Set up `.env.local` with Firebase credentials
- [ ] Configure Firestore collections
- [ ] Implement Firebase Authentication
- [ ] Create admin user seeding script

### Phase 2: Core Backend (Week 3-4) 🎯 **CRITICAL**
- [ ] Implement Excel parsing with `xlsx` library
- [ ] Build PDF generation system with templates
- [ ] Implement encoding/decoding algorithm (AES-256)
- [ ] Integrate Firestore for certificate storage
- [ ] Integrate Firebase Storage for PDF files

### Phase 3: Verification (Week 5)
- [ ] Build PDF metadata extraction
- [ ] Implement verification logic with Firestore lookup
- [ ] Add verification logging
- [ ] Test end-to-end verification flow

### Phase 4: Polish & Testing (Week 6)
- [ ] Add email delivery (SendGrid)
- [ ] Build admin dashboard features (view/revoke)
- [ ] Comprehensive testing
- [ ] Security audit

### Phase 5: Deployment (Week 7)
- [ ] Deploy to Vercel/Firebase Hosting
- [ ] Configure production environment
- [ ] User acceptance testing

**See [`QUICK_START_CHECKLIST.md`](./QUICK_START_CHECKLIST.md) for prioritized tasks.**

---

## 🧪 Testing

### Manual Testing Checklist
- [ ] Admin login/logout
- [ ] Excel file upload and parsing
- [ ] Certificate generation (single & bulk)
- [ ] PDF download
- [ ] Verification by ID
- [ ] Verification by PDF upload
- [ ] Invalid certificate handling
- [ ] Revoked certificate handling
- [ ] Non-admin access blocking

### Automated Testing (Future)
- Unit tests for encoding/decoding
- Integration tests for API routes
- E2E tests with Playwright

---

## 🤝 Contributing

This is a proprietary project. If you're a team member:

1. Review the [`IMPLEMENTATION_GUIDE.md`](./IMPLEMENTATION_GUIDE.md)
2. Pick a task from [`QUICK_START_CHECKLIST.md`](./QUICK_START_CHECKLIST.md)
3. Create a feature branch
4. Submit a pull request with tests

---

## 📝 License

Proprietary - All rights reserved © 2025 CertiTrust

---

## 📞 Support

For questions or issues:
- Check documentation files in this repository
- Contact project owner: Amulya A
- Review Firebase docs: https://firebase.google.com/docs

---

## 🎯 Success Metrics

### MVP Goals
- ✅ Generate certificates in <5 seconds per participant
- ✅ 100% accurate field-to-field verification
- ✅ Zero false validations
- ✅ Responsive UI on all devices
- ✅ 99.9% uptime (Vercel + Firebase)

### Future Enhancements
- QR code embedding for quick verification
- Analytics dashboard for certificate stats
- Multi-language template support
- Batch email automation
- API for third-party integrations

---

## 🔗 Quick Links

- **[Firebase Console](https://console.firebase.google.com)**
- **[Vercel Dashboard](https://vercel.com/dashboard)**
- **[Next.js Documentation](https://nextjs.org/docs)**
- **[Tailwind CSS](https://tailwindcss.com/docs)**

---

**Built with ❤️ using Next.js, React, and Firebase**

---

## 📅 Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.2 | 2025-10-18 | Added comprehensive documentation |
| 1.1 | 2025-10-15 | Initial frontend implementation |
| 1.0 | 2025-10-01 | Project kickoff |
