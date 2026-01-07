# CertiTrust - Technical Implementation Guide

This guide provides step-by-step instructions to complete the CertiTrust implementation according to the PRD requirements.

---

## Table of Contents

1. [Environment Setup](#1-environment-setup)
2. [Firestore Database Configuration](#2-firestore-database-configuration)
3. [Authentication System](#3-authentication-system)
4. [Excel Parsing Implementation](#4-excel-parsing-implementation)
5. [PDF Certificate Generation](#5-pdf-certificate-generation)
6. [Encoding/Decoding System](#6-encodingdecoding-system)
7. [Verification System](#7-verification-system)
8. [Email Delivery (Optional)](#8-email-delivery-optional)
9. [Security Rules](#9-security-rules)
10. [Testing & Deployment](#10-testing--deployment)

---

## 1. Environment Setup

### Step 1.1: Create Environment Files

**Create `.env.example`** (template for developers):
```env
# Firebase Client Configuration (Public)
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-app.firebaseapp.com
NEXT_PUBLIC_FIREBASE_DATABASE_URL=https://your-app.firebaseio.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-app.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcdef
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX

# Firebase Admin SDK (Server-side only - DO NOT EXPOSE)
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour-Private-Key\n-----END PRIVATE KEY-----\n"

# Certificate Encoding Secret
ENCRYPTION_SECRET=your-ultra-secure-random-secret-key-min-32-chars

# Optional: Email Service (SendGrid)
SENDGRID_API_KEY=SG.xxxxxxxxxxxxxxxxxxxxxx
EMAIL_FROM=noreply@certitrust.com

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**Create `.env.local`** (your actual credentials - DO NOT COMMIT):
- Copy `.env.example` to `.env.local`
- Fill in your actual Firebase credentials from Firebase Console
- Generate a secure `ENCRYPTION_SECRET` (use: `openssl rand -base64 32`)

### Step 1.2: Update .gitignore

Verify `.env.local` is in `.gitignore`:
```
.env.local
.env*.local
```

### Step 1.3: Install Required Dependencies

```bash
pnpm add xlsx pdf-lib crypto-js @sendgrid/mail
pnpm add -D @types/crypto-js
```

---

## 2. Firestore Database Configuration

### Step 2.1: Create Firestore Collections

**In Firebase Console:**
1. Go to Firestore Database
2. Create the following collections:
   - `certificates`
   - `verification_logs`
   - `admins`
   - `templates` (optional)

### Step 2.2: Firestore Security Rules

Create `firestore.rules` in project root:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Helper function to check if user is admin
    function isAdmin() {
      return request.auth != null && 
             exists(/databases/$(database)/documents/admins/$(request.auth.uid));
    }
    
    // Certificates Collection - Admin write, public read for verification
    match /certificates/{certificateId} {
      allow read: if true; // Public read for verification
      allow write: if isAdmin();
    }
    
    // Verification Logs - Write by anyone (for logging), read by admin
    match /verification_logs/{logId} {
      allow read: if isAdmin();
      allow create: if true; // Allow verification logging
      allow update, delete: if false;
    }
    
    // Admins Collection - Admin only
    match /admins/{adminId} {
      allow read, write: if isAdmin();
    }
    
    // Templates Collection - Admin only
    match /templates/{templateId} {
      allow read: if true; // Public read for preview
      allow write: if isAdmin();
    }
  }
}
```

**Deploy rules:**
```bash
firebase deploy --only firestore:rules
```

### Step 2.3: Create Admin Seeding Script

Create `scripts/seed-admin.ts`:

```typescript
import { adminDb } from '../lib/firebase-admin';

async function seedAdmin() {
  const adminEmail = 'admin@certitrust.com'; // Change this
  const adminUid = 'your-firebase-uid'; // Get from Firebase Auth
  
  await adminDb?.collection('admins').doc(adminUid).set({
    email: adminEmail,
    role: 'superadmin',
    createdAt: new Date(),
    lastLogin: new Date(),
  });
  
  console.log('Admin seeded successfully');
}

seedAdmin().catch(console.error);
```

Run: `tsx scripts/seed-admin.ts`

---

## 3. Authentication System

### Step 3.1: Update Firebase Client Configuration

Update `lib/firebase.ts` to include Firestore:

```typescript
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
```

### Step 3.2: Update Firebase Admin Configuration

Update `lib/firebase-admin.ts`:

```typescript
import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";

const firebaseAdminConfig = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
};

let adminApp = getApps().find((app) => app.name === "admin");

if (!adminApp && process.env.FIREBASE_PROJECT_ID) {
  adminApp = initializeApp(
    {
      credential: cert(firebaseAdminConfig as any),
    },
    "admin"
  );
}

export const adminAuth = adminApp ? getAuth(adminApp) : null;
export const adminDb = adminApp ? getFirestore(adminApp) : null;
export const adminStorage = adminApp ? getStorage(adminApp) : null;
```

### Step 3.3: Implement Auth Context Provider

Create `lib/auth-context.tsx`:

```typescript
'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { 
  User, 
  onAuthStateChanged, 
  signInWithEmailAndPassword,
  signOut as firebaseSignOut 
} from 'firebase/auth';
import { auth } from './firebase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signIn = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const signOut = async () => {
    await firebaseSignOut(auth);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
```

### Step 3.4: Implement Login Page

Update `app/login/page.tsx`:

```typescript
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { toast } from 'sonner';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await signIn(email, password);
      toast.success('Login successful!');
      router.push('/admin/dashboard');
    } catch (error: any) {
      toast.error(error.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-sky-50 to-blue-50">
      <div className="card-solid p-8 w-full max-w-md">
        <h1 className="text-3xl font-bold mb-6">Admin Login</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
}
```

---

## 4. Excel Parsing Implementation

### Step 4.1: Create Excel Parser Utility

Create `lib/excel-parser.ts`:

```typescript
import * as XLSX from 'xlsx';

export interface ParticipantData {
  name: string;
  email: string;
  course?: string;
  [key: string]: any;
}

export function parseExcelFile(buffer: ArrayBuffer): ParticipantData[] {
  const workbook = XLSX.read(buffer, { type: 'array' });
  const firstSheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[firstSheetName];
  
  const data = XLSX.utils.sheet_to_json<ParticipantData>(worksheet);
  
  // Validate required fields
  data.forEach((row, index) => {
    if (!row.name || !row.email) {
      throw new Error(`Row ${index + 2} is missing required fields (name, email)`);
    }
  });
  
  return data;
}
```

### Step 4.2: Update Excel Upload Component

Update `components/admin/excel-upload.tsx` to use real parsing (replace mock data section).

---

## 5. PDF Certificate Generation

### Step 5.1: Create PDF Generator Utility

Create `lib/pdf-generator.ts`:

```typescript
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { generateEncodedKey } from './encoding';

export interface CertificateData {
  participantName: string;
  eventName: string;
  organization: string;
  date: string;
  signatory: string;
  certificateId: string;
}

export async function generateCertificatePDF(
  data: CertificateData
): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([792, 612]); // Letter landscape
  
  const font = await pdfDoc.embedFont(StandardFonts.TimesRoman);
  const boldFont = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);
  
  const { width, height } = page.getSize();
  
  // Title
  page.drawText('Certificate of Completion', {
    x: width / 2 - 150,
    y: height - 100,
    size: 30,
    font: boldFont,
    color: rgb(0, 0.4, 0.8),
  });
  
  // Participant Name
  page.drawText(data.participantName, {
    x: width / 2 - (data.participantName.length * 6),
    y: height - 200,
    size: 24,
    font: boldFont,
  });
  
  // Event details
  page.drawText(`has successfully completed`, {
    x: width / 2 - 100,
    y: height - 250,
    size: 14,
    font,
  });
  
  page.drawText(data.eventName, {
    x: width / 2 - (data.eventName.length * 4),
    y: height - 280,
    size: 18,
    font: boldFont,
  });
  
  // Organization and date
  page.drawText(`${data.organization} • ${data.date}`, {
    x: width / 2 - 100,
    y: height - 320,
    size: 12,
    font,
  });
  
  // Certificate ID (visible)
  page.drawText(`Certificate ID: ${data.certificateId}`, {
    x: 50,
    y: 50,
    size: 10,
    font,
    color: rgb(0.5, 0.5, 0.5),
  });
  
  // Embed hidden encoded key in metadata
  const encodedKey = await generateEncodedKey(data.certificateId);
  pdfDoc.setTitle(`Certificate - ${data.participantName}`);
  pdfDoc.setSubject(encodedKey); // Hidden verification code
  pdfDoc.setAuthor('CertiTrust');
  pdfDoc.setCreator('CertiTrust Certificate Generator');
  
  return await pdfDoc.save();
}
```

---

## 6. Encoding/Decoding System

### Step 6.1: Create Encoding Utility

Create `lib/encoding.ts`:

```typescript
import CryptoJS from 'crypto-js';

const SECRET_KEY = process.env.ENCRYPTION_SECRET || 'fallback-secret-key';

export async function generateEncodedKey(certificateId: string): Promise<string> {
  const timestamp = Date.now();
  const payload = `${certificateId}|${timestamp}`;
  
  const encrypted = CryptoJS.AES.encrypt(payload, SECRET_KEY).toString();
  return encrypted;
}

export async function decodeKey(encodedKey: string): Promise<{ certificateId: string; timestamp: number } | null> {
  try {
    const decrypted = CryptoJS.AES.decrypt(encodedKey, SECRET_KEY).toString(CryptoJS.enc.Utf8);
    
    if (!decrypted) return null;
    
    const [certificateId, timestampStr] = decrypted.split('|');
    const timestamp = parseInt(timestampStr, 10);
    
    if (!certificateId || isNaN(timestamp)) return null;
    
    return { certificateId, timestamp };
  } catch (error) {
    console.error('Decoding error:', error);
    return null;
  }
}

export function generateCertificateId(): string {
  const year = new Date().getFullYear();
  const random = Math.floor(Math.random() * 999999).toString().padStart(6, '0');
  return `CT-${year}-${random}`;
}
```

---

## 7. Verification System

### Step 7.1: Update Verification API

Update `app/api/verify/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { PDFDocument } from 'pdf-lib';
import { decodeKey } from '@/lib/encoding';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { certificateId, method, pdfFile } = body;

    let decodedCertId = certificateId;

    // If PDF verification, extract hidden code
    if (method === 'pdf' && pdfFile) {
      const pdfBuffer = Buffer.from(pdfFile, 'base64');
      const pdfDoc = await PDFDocument.load(pdfBuffer);
      
      const encodedKey = pdfDoc.getSubject() || '';
      const decoded = await decodeKey(encodedKey);
      
      if (!decoded) {
        return NextResponse.json({ valid: false, message: 'Invalid certificate encoding' });
      }
      
      decodedCertId = decoded.certificateId;
    }

    // Query Firestore
    const certDoc = await adminDb?.collection('certificates').doc(decodedCertId).get();

    if (!certDoc?.exists) {
      await logVerification(decodedCertId, 'Invalid', request);
      return NextResponse.json({ valid: false, message: 'Certificate not found' });
    }

    const certData = certDoc.data();

    if (certData?.status === 'Revoked') {
      await logVerification(decodedCertId, 'Revoked', request);
      return NextResponse.json({ valid: false, message: 'Certificate has been revoked' });
    }

    await logVerification(decodedCertId, 'Verified', request);

    return NextResponse.json({
      valid: true,
      ...certData,
    });
  } catch (error) {
    console.error('Verification error:', error);
    return NextResponse.json({ error: 'Verification failed' }, { status: 500 });
  }
}

async function logVerification(certificateId: string, result: string, request: NextRequest) {
  const ipAddress = request.headers.get('x-forwarded-for') || 'unknown';
  const userAgent = request.headers.get('user-agent') || 'unknown';

  await adminDb?.collection('verification_logs').add({
    certificateId,
    result,
    verifiedAt: new Date(),
    ipAddress,
    userAgent,
  });
}
```

---

## 8. Email Delivery (Optional)

### Step 8.1: Create Email Utility

Create `lib/email-sender.ts`:

```typescript
import sgMail from '@sendgrid/mail';

sgMail.setApiKey(process.env.SENDGRID_API_KEY || '');

export async function sendCertificateEmail(
  recipientEmail: string,
  recipientName: string,
  pdfBuffer: Buffer
) {
  const msg = {
    to: recipientEmail,
    from: process.env.EMAIL_FROM || 'noreply@certitrust.com',
    subject: 'Your Certificate is Ready!',
    text: `Dear ${recipientName},

Your certificate has been generated. Please find it attached.

Best regards,
CertiTrust Team`,
    html: `<p>Dear ${recipientName},</p><p>Your certificate has been generated. Please find it attached.</p><p>Best regards,<br>CertiTrust Team</p>`,
    attachments: [
      {
        content: pdfBuffer.toString('base64'),
        filename: `certificate-${recipientName.replace(/\s/g, '_')}.pdf`,
        type: 'application/pdf',
        disposition: 'attachment',
      },
    ],
  };

  await sgMail.send(msg);
}
```

---

## 9. Testing & Deployment

### Step 9.1: Local Testing

```bash
# Start development server
pnpm dev

# Test workflow:
# 1. Login as admin
# 2. Upload Excel file
# 3. Generate certificates
# 4. Verify certificate by ID
# 5. Check Firestore for data
```

### Step 9.2: Deploy to Vercel

```bash
# Install Vercel CLI
pnpm add -g vercel

# Login
vercel login

# Deploy
vercel --prod
```

### Step 9.3: Environment Variables in Vercel

Add all `.env.local` variables in Vercel project settings.

---

## Troubleshooting

### Common Issues

1. **Firebase Admin not initializing**: Check private key format (replace `\n` with actual newlines)
2. **Firestore permission denied**: Verify security rules are deployed
3. **PDF generation fails**: Ensure `pdf-lib` is installed correctly
4. **Encoding errors**: Verify `ENCRYPTION_SECRET` is set in environment

---

**Last Updated**: 2025-10-18  
**Version**: 1.0
