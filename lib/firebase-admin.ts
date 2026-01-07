import { initializeApp, cert, getApps } from "firebase-admin/app"
import { getAuth } from "firebase-admin/auth"
import { getFirestore } from "firebase-admin/firestore"

// Initialize Firebase Admin SDK
// This should only be used in server-side code
const firebaseAdminConfig = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
}

let adminApp = getApps().find((app) => app.name === "admin")

if (!adminApp && process.env.FIREBASE_PROJECT_ID) {
  adminApp = initializeApp(
    {
      credential: cert(firebaseAdminConfig as any),
    },
    "admin",
  )
}

export const adminAuth = adminApp ? getAuth(adminApp) : null
export const adminDb = adminApp ? getFirestore(adminApp) : null
