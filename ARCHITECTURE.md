# CertiTrust - System Architecture

## System Overview

CertiTrust is a Next.js-based certificate generation and verification platform with Firebase backend.

---

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Client Browser                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │  Home Page   │  │ Admin Portal │  │ Verification Portal  │  │
│  │  (Public)    │  │ (Protected)  │  │     (Public)         │  │
│  └──────────────┘  └──────────────┘  └──────────────────────┘  │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            │ HTTPS
                            │
┌───────────────────────────▼─────────────────────────────────────┐
│                  Next.js Application (Vercel)                   │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                    App Router Pages                       │  │
│  │  /              /login         /admin/dashboard  /verify │  │
│  └───────────────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                      API Routes                           │  │
│  │  /api/generate-certificates  /api/verify  /api/auth/*    │  │
│  └───────────────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                   Server-Side Logic                       │  │
│  │  • PDF Generation (pdf-lib)                               │  │
│  │  • Excel Parsing (xlsx)                                   │  │
│  │  • Encoding/Decoding (crypto-js)                          │  │
│  │  • Firebase Admin SDK                                     │  │
│  └───────────────────────────────────────────────────────────┘  │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            │ Firebase SDK
                            │
┌───────────────────────────▼─────────────────────────────────────┐
│                     Firebase Services (GCP)                     │
│  ┌──────────────┐  ┌──────────────┐  ┌────────────────────┐   │
│  │  Firebase    │  │  Cloud       │  │  Cloud Storage     │   │
│  │  Auth        │  │  Firestore   │  │  (PDF Files)       │   │
│  │              │  │              │  │                    │   │
│  │ • Email/Pass │  │ • Certs DB   │  │ • Generated PDFs   │   │
│  │ • Sessions   │  │ • Logs       │  │ • Templates        │   │
│  │ • Tokens     │  │ • Admins     │  │                    │   │
│  └──────────────┘  └──────────────┘  └────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

---

## Data Flow Diagrams

### 1. Certificate Generation Flow

```
Admin User
    │
    ├─► Login (Firebase Auth)
    │        │
    │        └─► Verify Admin Role (Firestore)
    │
    ├─► Upload Excel File
    │        │
    │        └─► Parse Excel (xlsx)
    │                 │
    │                 ├─► Extract: Name, Email, etc.
    │                 └─► Validate Required Fields
    │
    ├─► Input Event Details
    │        │
    │        └─► Event Name, Org, Date, Signatory
    │
    ├─► Select Template
    │
    └─► Click "Generate"
             │
             ▼
    API: /api/generate-certificates
             │
             ├─► For Each Participant:
             │        │
             │        ├─► Generate Certificate ID (CT-2025-XXXXXX)
             │        │
             │        ├─► Create Encoded Key (AES Encryption)
             │        │        │
             │        │        └─► certificateId + timestamp → encrypted
             │        │
             │        ├─► Generate PDF (pdf-lib)
             │        │        │
             │        │        ├─► Add participant name
             │        │        ├─► Add event details
             │        │        ├─► Embed hidden code in metadata
             │        │        └─► Return PDF bytes
             │        │
             │        ├─► Upload PDF to Firebase Storage
             │        │        │
             │        │        └─► gs://bucket/certificates/{id}.pdf
             │        │
             │        └─► Store Metadata in Firestore
             │                 │
             │                 └─► certificates/{id}
             │                      {
             │                        certificateId,
             │                        participantName,
             │                        email,
             │                        eventName,
             │                        organization,
             │                        date,
             │                        encodedKey,
             │                        status: "Valid",
             │                        pdfUrl,
             │                        createdAt
             │                      }
             │
             └─► Return Success Response
                      │
                      ├─► Total count
                      ├─► Certificate IDs
                      └─► Download links (optional)
```

### 2. Certificate Verification Flow

```
User
    │
    ├─► Navigate to /verify
    │
    ├─► Choose Verification Method:
    │        │
    │        ├─► Option A: Upload PDF File
    │        │        │
    │        │        └─► Convert to base64
    │        │
    │        └─► Option B: Enter Certificate ID
    │
    └─► Click "Verify"
             │
             ▼
    API: /api/verify
             │
             ├─► If PDF Method:
             │        │
             │        ├─► Load PDF (pdf-lib)
             │        │
             │        ├─► Extract Hidden Code from Metadata
             │        │        │
             │        │        └─► pdfDoc.getSubject()
             │        │
             │        └─► Decode Certificate ID
             │                 │
             │                 └─► AES Decrypt → certificateId + timestamp
             │
             ├─► Query Firestore
             │        │
             │        └─► certificates/{certificateId}
             │
             ├─► Check Certificate Status
             │        │
             │        ├─► Not Found → Invalid
             │        ├─► status: "Revoked" → Revoked
             │        └─► status: "Valid" → Verified ✓
             │
             ├─► Log Verification Attempt
             │        │
             │        └─► verification_logs/
             │                 {
             │                   certificateId,
             │                   result: "Verified" | "Invalid",
             │                   verifiedAt: timestamp,
             │                   ipAddress,
             │                   userAgent
             │                 }
             │
             └─► Return Result
                      │
                      ├─► If Valid:
                      │        {
                      │          valid: true,
                      │          participantName,
                      │          eventName,
                      │          organization,
                      │          date,
                      │          certificateId
                      │        }
                      │
                      └─► If Invalid:
                               {
                                 valid: false,
                                 message: "Certificate not found"
                               }
```

### 3. Authentication Flow

```
Admin
    │
    ├─► Navigate to /login
    │
    ├─► Enter Email & Password
    │
    └─► Click "Login"
             │
             ▼
    Firebase Authentication
             │
             ├─► Verify Credentials
             │        │
             │        ├─► Invalid → Error
             │        └─► Valid → Generate Auth Token
             │
             ├─► Check Admin Role
             │        │
             │        └─► Query Firestore: admins/{uid}
             │                 │
             │                 ├─► Not Found → Access Denied
             │                 └─► Found → Grant Access
             │
             ├─► Set Auth Cookie/Session
             │
             └─► Redirect to /admin/dashboard
```

---

## Database Schema

### Firestore Collections

#### 1. `certificates`

```javascript
{
  certificateId: "CT-2025-123456",         // Primary Key
  participantName: "John Doe",
  email: "john@example.com",
  eventName: "Web Development Bootcamp",
  organization: "Tech Academy",
  date: Timestamp(2025-10-01),
  encodedKey: "U2FsdGVkX1...",             // AES encrypted
  status: "Valid",                         // Valid | Revoked
  template: "Blue Professional",
  pdfUrl: "gs://bucket/certificates/...",
  createdAt: Timestamp(2025-10-01T10:00:00Z),
  
  // Optional fields
  signatory: "Dean Name",
  metadata: { ... }
}
```

**Indexes:**
- `certificateId` (primary)
- `email`
- `status`
- `createdAt` (desc)

#### 2. `verification_logs`

```javascript
{
  logId: "auto-generated",                 // Primary Key
  certificateId: "CT-2025-123456",         // Foreign Key
  result: "Verified",                      // Verified | Invalid | Revoked
  verifiedAt: Timestamp(2025-10-15T14:30:00Z),
  ipAddress: "192.168.1.1",
  userAgent: "Mozilla/5.0 ...",
  method: "pdf",                           // pdf | id
}
```

**Indexes:**
- `certificateId`
- `verifiedAt` (desc)
- `result`

#### 3. `admins`

```javascript
{
  userId: "firebase-auth-uid",             // Primary Key (matches Auth UID)
  email: "admin@certitrust.com",
  role: "superadmin",                      // superadmin | admin
  createdAt: Timestamp(2025-09-01T00:00:00Z),
  lastLogin: Timestamp(2025-10-15T09:00:00Z),
  
  // Optional fields
  displayName: "Admin User",
  permissions: ["generate", "verify", "revoke"]
}
```

#### 4. `templates` (Optional)

```javascript
{
  templateId: "template-001",              // Primary Key
  name: "Blue Professional",
  previewUrl: "https://storage.../preview.png",
  pdfPath: "gs://bucket/templates/...",
  themeColor: "#0066CC",
  createdAt: Timestamp(2025-09-01),
  
  // Optional
  isActive: true,
  category: "professional",
}
```

---

## Security Architecture

### 1. Firestore Security Rules

```javascript
// Read: Public for verification
// Write: Admin only
match /certificates/{certId} {
  allow read: if true;
  allow write: if isAdmin();
}

// Verification logs: Write by anyone, read by admin
match /verification_logs/{logId} {
  allow read: if isAdmin();
  allow create: if true;
  allow update, delete: if false;
}

// Admins: Admin only
match /admins/{adminId} {
  allow read, write: if isAdmin();
}
```

### 2. Authentication Layers

```
Request
    │
    ├─► Frontend Route Protection
    │        │ (middleware.ts)
    │        └─► Check auth token in cookies
    │
    ├─► API Route Protection
    │        │ (API routes)
    │        └─► Verify Firebase Auth token
    │
    └─► Database Access Control
             │ (Firestore rules)
             └─► Verify admin role
```

### 3. Data Encryption

```
Certificate ID Generation:
    CT-2025-XXXXXX
    └─► Random 6-digit number

Encoding Process:
    Input: "CT-2025-123456|1729267200000"
           └─► certificateId|timestamp
    
    Process: AES-256 Encryption
    
    Output: "U2FsdGVkX1+abc123..."
            └─► Hidden in PDF metadata
```

---

## Technology Stack

### Frontend
- **Framework**: Next.js 15.2.4 (App Router)
- **UI Library**: React 19
- **Styling**: Tailwind CSS 4.x
- **Components**: Radix UI primitives
- **Forms**: React Hook Form + Zod
- **State**: React hooks + Context API
- **Icons**: Lucide React
- **Notifications**: Sonner

### Backend
- **Runtime**: Node.js (Vercel serverless)
- **Language**: TypeScript 5
- **Authentication**: Firebase Auth
- **Database**: Cloud Firestore
- **Storage**: Firebase Storage
- **PDF Generation**: pdf-lib
- **Excel Parsing**: xlsx
- **Encryption**: crypto-js (AES-256)

### Infrastructure
- **Hosting**: Vercel (Frontend + API)
- **Backend Services**: Firebase (Google Cloud Platform)
- **CDN**: Vercel Edge Network
- **SSL**: Automatic (Vercel/Firebase)

---

## File Structure

```
CertifyTrust/
├── app/                          # Next.js App Router
│   ├── admin/dashboard/          # Admin portal
│   │   └── page.tsx
│   ├── api/                      # API routes
│   │   ├── auth/
│   │   │   ├── session/route.ts
│   │   │   └── logout/route.ts
│   │   ├── generate-certificates/route.ts
│   │   └── verify/route.ts
│   ├── login/page.tsx            # Login page
│   ├── verify/page.tsx           # Verification page
│   ├── layout.tsx                # Root layout
│   ├── page.tsx                  # Home page
│   └── globals.css               # Global styles
│
├── components/                   # React components
│   ├── admin/                    # Admin-specific
│   │   ├── event-details-form.tsx
│   │   ├── excel-upload.tsx
│   │   ├── template-selector.tsx
│   │   └── generation-result.tsx
│   ├── home/                     # Home page sections
│   │   ├── hero-section.tsx
│   │   ├── benefits-section.tsx
│   │   └── ...
│   ├── ui/                       # Reusable UI components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   └── ...
│   ├── navbar.tsx
│   ├── footer.tsx
│   └── theme-provider.tsx
│
├── lib/                          # Utility libraries
│   ├── firebase.ts               # Firebase client SDK
│   ├── firebase-admin.ts         # Firebase Admin SDK
│   ├── encoding.ts               # Encode/decode utilities
│   ├── pdf-generator.ts          # PDF generation
│   ├── excel-parser.ts           # Excel parsing
│   ├── auth-context.tsx          # Auth context provider
│   └── utils.ts                  # General utilities
│
├── hooks/                        # Custom React hooks
│   ├── use-mobile.ts
│   └── use-toast.ts
│
├── styles/                       # Additional styles
│   └── globals.css
│
├── public/                       # Static assets
│   └── ...
│
├── middleware.ts                 # Next.js middleware (auth)
├── firestore.rules               # Firestore security rules
├── storage.rules                 # Storage security rules
├── .env.local                    # Environment variables (gitignored)
├── .env.example                  # Environment template
├── next.config.mjs               # Next.js configuration
├── tailwind.config.ts            # Tailwind configuration
├── tsconfig.json                 # TypeScript configuration
└── package.json                  # Dependencies
```

---

## Performance Considerations

### 1. PDF Generation
- Generate PDFs server-side (avoid client-side overhead)
- Use streaming for large batches
- Consider background job queue for >100 certificates

### 2. Database Queries
- Index frequently queried fields
- Use pagination for verification logs
- Cache template data client-side

### 3. File Storage
- Use Firebase Storage CDN for PDF delivery
- Compress PDFs where possible
- Set appropriate cache headers

### 4. Frontend Optimization
- Server-side rendering for public pages
- Client-side rendering for admin portal
- Code splitting by route
- Image optimization (Next.js Image component)

---

## Deployment Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Vercel Platform                        │
│  ┌───────────────────────────────────────────────────────┐  │
│  │           Next.js Application (SSR/SSG/API)           │  │
│  │                                                       │  │
│  │  Edge Regions: Global CDN                            │  │
│  │  Serverless Functions: us-east-1 (default)           │  │
│  └───────────────────────────────────────────────────────┘  │
└───────────────────────────┬─────────────────────────────────┘
                            │
                            │ Firebase SDK
                            │
┌───────────────────────────▼─────────────────────────────────┐
│              Firebase (Google Cloud Platform)               │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Multi-Region Replication                             │  │
│  │  • Firestore: us-central1 (configurable)             │  │
│  │  • Storage: multi-region bucket                      │  │
│  │  • Auth: Global                                      │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### Environment Variables

**Production (.env.production)**
- Same structure as `.env.local`
- Configured in Vercel dashboard
- Auto-injected during build

---

## Monitoring & Logging

### Application Monitoring
- Vercel Analytics (built-in)
- Firebase Analytics (optional)
- Custom error logging to Firestore

### Key Metrics to Track
- Certificate generation success rate
- Verification attempts (valid vs invalid)
- API response times
- Error rates by endpoint
- User authentication success/failure

---

## Scalability Considerations

### Current Limits
- Vercel: 100GB bandwidth/month (Hobby), unlimited (Pro)
- Firestore: 50K reads/day (free), unlimited (paid)
- Firebase Storage: 5GB storage (free), pay-as-you-go (paid)
- API Routes: 10s timeout (Vercel Hobby), 60s (Pro)

### Scaling Strategies
1. **High Certificate Volume**: Use batch processing with queues
2. **High Verification Traffic**: Enable Firestore caching
3. **Large PDFs**: Optimize template file size
4. **Global Users**: Enable multi-region Firestore

---

**Last Updated**: 2025-10-18  
**Version**: 1.0
