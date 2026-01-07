# CertiTrust - Quick Start Checklist

Get CertiTrust fully functional in the shortest time possible.

---

## ✅ Pre-Flight Checklist

### 1. Firebase Project Setup
- [ ] Create Firebase project at [console.firebase.google.com](https://console.firebase.google.com)
- [ ] Enable Firebase Authentication (Email/Password)
- [ ] Enable Cloud Firestore
- [ ] Enable Firebase Storage
- [ ] Create service account and download credentials

### 2. Environment Configuration
- [ ] Create `.env.local` file (copy from template below)
- [ ] Fill in Firebase credentials
- [ ] Generate encryption secret: `openssl rand -base64 32`
- [ ] Verify `.env.local` is in `.gitignore`

### 3. Install Dependencies
```bash
pnpm install
pnpm add xlsx pdf-lib crypto-js @sendgrid/mail
pnpm add -D @types/crypto-js
```

---

## 📋 Step-by-Step Implementation (Priority Order)

### Phase 1: Environment & Database (Day 1)

#### Task 1.1: Environment Setup ⏱️ 15 min
```bash
# Create .env.local with this template:
cat > .env.local << 'EOF'
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_DATABASE_URL=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=

FIREBASE_PROJECT_ID=
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY=

ENCRYPTION_SECRET=
EOF
```

- [ ] Fill in credentials from Firebase Console
- [ ] Test by running `pnpm dev` - verify no errors

#### Task 1.2: Firestore Collections ⏱️ 10 min
**In Firebase Console → Firestore Database:**
- [ ] Create collection `certificates` (add dummy document, then delete)
- [ ] Create collection `verification_logs`
- [ ] Create collection `admins`
- [ ] Create collection `templates` (optional)

#### Task 1.3: Create First Admin ⏱️ 10 min
**In Firebase Console → Authentication:**
- [ ] Add user with email/password
- [ ] Copy the user's UID

**In Firestore → `admins` collection:**
- [ ] Add document with ID = user's UID
- [ ] Fields:
  - `email`: "your-admin-email@example.com"
  - `role`: "superadmin"
  - `createdAt`: (timestamp) now
  - `lastLogin`: (timestamp) now

---

### Phase 2: Core Backend Files (Day 1-2)

#### Task 2.1: Update Firebase Configuration ⏱️ 20 min

**File: `lib/firebase.ts`**
- [ ] Add Firestore import: `import { getFirestore } from "firebase/firestore"`
- [ ] Add Storage import: `import { getStorage } from "firebase/storage"`
- [ ] Export: `export const db = getFirestore(app)`
- [ ] Export: `export const storage = getStorage(app)`

**File: `lib/firebase-admin.ts`**
- [ ] Add Storage import: `import { getStorage } from "firebase-admin/storage"`
- [ ] Export: `export const adminStorage = adminApp ? getStorage(adminApp) : null`

#### Task 2.2: Create Encoding Utility ⏱️ 30 min

**Create file: `lib/encoding.ts`**
```typescript
import CryptoJS from 'crypto-js';

const SECRET_KEY = process.env.ENCRYPTION_SECRET || '';

export function generateEncodedKey(certificateId: string): string {
  const timestamp = Date.now();
  const payload = `${certificateId}|${timestamp}`;
  return CryptoJS.AES.encrypt(payload, SECRET_KEY).toString();
}

export function decodeKey(encodedKey: string): { certificateId: string; timestamp: number } | null {
  try {
    const decrypted = CryptoJS.AES.decrypt(encodedKey, SECRET_KEY).toString(CryptoJS.enc.Utf8);
    if (!decrypted) return null;
    
    const [certificateId, timestampStr] = decrypted.split('|');
    const timestamp = parseInt(timestampStr, 10);
    
    if (!certificateId || isNaN(timestamp)) return null;
    return { certificateId, timestamp };
  } catch {
    return null;
  }
}

export function generateCertificateId(): string {
  const year = new Date().getFullYear();
  const random = Math.floor(Math.random() * 999999).toString().padStart(6, '0');
  return `CT-${year}-${random}`;
}
```

- [ ] Create file
- [ ] Test encoding/decoding works

#### Task 2.3: Create Excel Parser ⏱️ 30 min

**Create file: `lib/excel-parser.ts`**
```typescript
import * as XLSX from 'xlsx';

export interface ParticipantData {
  name: string;
  email: string;
  [key: string]: any;
}

export function parseExcelFile(buffer: ArrayBuffer): ParticipantData[] {
  const workbook = XLSX.read(buffer, { type: 'array' });
  const worksheet = workbook.Sheets[workbook.SheetNames[0]];
  const data = XLSX.utils.sheet_to_json<ParticipantData>(worksheet);
  
  data.forEach((row, index) => {
    if (!row.name || !row.email) {
      throw new Error(`Row ${index + 2} missing required fields`);
    }
  });
  
  return data;
}
```

- [ ] Create file
- [ ] Test with sample Excel file

#### Task 2.4: Create PDF Generator ⏱️ 1-2 hours

**Create file: `lib/pdf-generator.ts`**
- [ ] Implement basic certificate template
- [ ] Embed hidden verification code in PDF metadata
- [ ] Test PDF generation locally
- [ ] Verify PDF opens correctly

**Minimal implementation:**
```typescript
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { generateEncodedKey } from './encoding';

export interface CertificateData {
  participantName: string;
  eventName: string;
  organization: string;
  date: string;
  certificateId: string;
}

export async function generateCertificatePDF(data: CertificateData): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([792, 612]);
  const font = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);
  
  const { width, height } = page.getSize();
  
  // Title
  page.drawText('Certificate of Completion', {
    x: width / 2 - 150,
    y: height - 100,
    size: 30,
    font,
    color: rgb(0, 0.4, 0.8),
  });
  
  // Name
  page.drawText(data.participantName, {
    x: width / 2 - (data.participantName.length * 6),
    y: height - 200,
    size: 24,
    font,
  });
  
  // Event
  page.drawText(data.eventName, {
    x: width / 2 - (data.eventName.length * 4),
    y: height - 280,
    size: 18,
    font,
  });
  
  // Certificate ID
  page.drawText(`ID: ${data.certificateId}`, {
    x: 50,
    y: 50,
    size: 10,
    font,
  });
  
  // Embed hidden code
  const encodedKey = generateEncodedKey(data.certificateId);
  pdfDoc.setSubject(encodedKey);
  pdfDoc.setAuthor('CertiTrust');
  
  return await pdfDoc.save();
}
```

---

### Phase 3: API Routes (Day 2-3)

#### Task 3.1: Update Generate Certificates API ⏱️ 2-3 hours

**File: `app/api/generate-certificates/route.ts`**

Replace entire file with:
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { adminDb, adminStorage } from '@/lib/firebase-admin';
import { generateCertificatePDF } from '@/lib/pdf-generator';
import { generateCertificateId } from '@/lib/encoding';

export async function POST(request: NextRequest) {
  try {
    const { eventData, excelData, selectedTemplate } = await request.json();

    if (!eventData || !excelData || !selectedTemplate) {
      return NextResponse.json({ error: 'Missing required data' }, { status: 400 });
    }

    const certificates = [];

    for (const participant of excelData) {
      const certificateId = generateCertificateId();
      
      // Generate PDF
      const pdfBytes = await generateCertificatePDF({
        participantName: participant.name,
        eventName: eventData.eventName,
        organization: eventData.organization,
        date: eventData.date,
        certificateId,
      });

      // Upload to Firebase Storage
      const bucket = adminStorage?.bucket();
      const file = bucket?.file(`certificates/${certificateId}.pdf`);
      await file?.save(Buffer.from(pdfBytes));
      
      const pdfUrl = `gs://${bucket?.name}/certificates/${certificateId}.pdf`;

      // Store metadata in Firestore
      await adminDb?.collection('certificates').doc(certificateId).set({
        certificateId,
        participantName: participant.name,
        email: participant.email,
        eventName: eventData.eventName,
        organization: eventData.organization,
        date: eventData.date,
        status: 'Valid',
        template: selectedTemplate.name,
        pdfUrl,
        createdAt: new Date(),
      });

      certificates.push({ certificateId, name: participant.name });
    }

    return NextResponse.json({
      success: true,
      count: certificates.length,
      certificates,
      message: 'Certificates generated successfully',
    });
  } catch (error: any) {
    console.error('Certificate generation error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
```

- [ ] Replace file contents
- [ ] Test with sample data
- [ ] Verify Firestore entries
- [ ] Verify Storage uploads

#### Task 3.2: Update Verification API ⏱️ 1-2 hours

**File: `app/api/verify/route.ts`**

- [ ] Replace mock logic with Firestore lookup
- [ ] Add PDF decoding for hidden code
- [ ] Add verification logging
- [ ] Test both ID and PDF verification

**Implementation in IMPLEMENTATION_GUIDE.md Section 7.1**

---

### Phase 4: Authentication (Day 3-4)

#### Task 4.1: Create Auth Context ⏱️ 30 min

**Create file: `lib/auth-context.tsx`**
- [ ] Implement as shown in IMPLEMENTATION_GUIDE.md Section 3.3

#### Task 4.2: Wrap App with Auth Provider ⏱️ 10 min

**File: `app/layout.tsx`**
```typescript
import { AuthProvider } from '@/lib/auth-context';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
```

#### Task 4.3: Update Login Page ⏱️ 30 min

**File: `app/login/page.tsx`**
- [ ] Implement Firebase authentication
- [ ] Test login flow
- [ ] Verify redirect to dashboard

#### Task 4.4: Enhance Middleware ⏱️ 20 min

**File: `middleware.ts`**
- [ ] Add proper token verification
- [ ] Check admin role in Firestore
- [ ] Test protected routes

---

### Phase 5: Frontend Updates (Day 4-5)

#### Task 5.1: Update Excel Upload Component ⏱️ 30 min

**File: `components/admin/excel-upload.tsx`**
- [ ] Replace mock parsing with real Excel parsing
- [ ] Add proper error handling
- [ ] Test with real Excel files

#### Task 5.2: Update Dashboard ⏱️ 30 min

**File: `app/admin/dashboard/page.tsx`**
- [ ] Add authentication check
- [ ] Add loading states
- [ ] Add better error handling

#### Task 5.3: Update Verification Page ⏱️ 30 min

**File: `app/verify/page.tsx`**
- [ ] Add PDF file upload handling
- [ ] Convert PDF to base64 for API
- [ ] Improve result display

---

### Phase 6: Security & Deploy (Day 5-6)

#### Task 6.1: Firestore Security Rules ⏱️ 30 min

**Create file: `firestore.rules`**
- [ ] Implement as shown in IMPLEMENTATION_GUIDE.md Section 2.2
- [ ] Deploy: `firebase deploy --only firestore:rules`
- [ ] Test rules with Firestore emulator

#### Task 6.2: Storage Security Rules ⏱️ 20 min

**Create file: `storage.rules`**
```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /certificates/{certificateId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    match /templates/{templateId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```
- [ ] Deploy: `firebase deploy --only storage:rules`

#### Task 6.3: Final Testing ⏱️ 2-3 hours

**Test Suite:**
- [ ] Login as admin
- [ ] Upload Excel file with 5 participants
- [ ] Generate certificates
- [ ] Download a certificate PDF
- [ ] Verify certificate by ID
- [ ] Verify certificate by PDF upload
- [ ] Check Firestore for correct data
- [ ] Check Storage for PDF files
- [ ] Test invalid certificate
- [ ] Test revoked certificate (manually revoke one)
- [ ] Test non-admin access (should redirect)
- [ ] Test logout

#### Task 6.4: Deploy to Vercel ⏱️ 30 min

```bash
# Install Vercel CLI
pnpm add -g vercel

# Login
vercel login

# Deploy
vercel --prod
```

**In Vercel Dashboard:**
- [ ] Add all environment variables from `.env.local`
- [ ] Redeploy after adding variables
- [ ] Test production deployment

---

## 🎯 Critical Path Summary

**Absolute Minimum for Working MVP (8-12 hours):**

1. ✅ Environment setup (30 min)
2. ✅ Firestore collections (10 min)
3. ✅ Create admin user (10 min)
4. ✅ Encoding utility (`lib/encoding.ts`) (30 min)
5. ✅ PDF generator (`lib/pdf-generator.ts`) (2 hours)
6. ✅ Excel parser (`lib/excel-parser.ts`) (30 min)
7. ✅ Generate certificates API (2 hours)
8. ✅ Verification API (1 hour)
9. ✅ Authentication (login page) (1 hour)
10. ✅ Security rules (30 min)
11. ✅ Testing (1 hour)

**Total Estimated Time: 3-5 days** (for complete, production-ready implementation)

---

## 📝 Daily Progress Tracker

### Day 1
- [ ] Environment setup complete
- [ ] Firestore configured
- [ ] Admin user created
- [ ] Dependencies installed
- [ ] Encoding utility working

### Day 2
- [ ] Excel parser complete
- [ ] PDF generator working
- [ ] Generate certificates API functional
- [ ] Test certificate generation end-to-end

### Day 3
- [ ] Verification API complete
- [ ] Authentication working
- [ ] Protected routes functional

### Day 4
- [ ] Frontend updates complete
- [ ] Error handling improved
- [ ] UX polished

### Day 5
- [ ] Security rules deployed
- [ ] Full testing complete
- [ ] Bug fixes

### Day 6
- [ ] Production deployment
- [ ] Final verification
- [ ] Documentation updated

---

## 🚨 Common Pitfalls to Avoid

1. **Firebase Private Key**: Must replace `\n` with actual newlines
2. **CORS Issues**: Ensure Firebase Storage has proper CORS configuration
3. **File Size Limits**: Vercel has 4.5MB limit for serverless functions
4. **Excel Column Names**: Case-sensitive, ensure exact match
5. **PDF Encoding**: Verify hidden code is actually embedded
6. **Authentication State**: Always check auth state before protected operations
7. **Firestore Offline**: Enable offline persistence carefully (can cause issues)

---

## 📞 Need Help?

**Documentation References:**
- See `IMPLEMENTATION_GUIDE.md` for detailed code
- See `PRD_IMPLEMENTATION_STATUS.md` for feature gaps
- See Firebase docs: https://firebase.google.com/docs

**Next Steps After Completion:**
1. Add email delivery (SendGrid integration)
2. Build admin analytics dashboard
3. Add certificate revocation UI
4. Implement QR code generation
5. Add multi-language support

---

**Last Updated**: 2025-10-18  
**Version**: 1.0
