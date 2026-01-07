# Firebase Setup Guide

## Environment Variables Required

Add the following environment variables to your Vercel project:

### Client-side (NEXT_PUBLIC_*)
- `NEXT_PUBLIC_FIREBASE_API_KEY` - Your Firebase API key
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` - Your Firebase auth domain
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID` - Your Firebase project ID
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` - Your Firebase storage bucket
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` - Your Firebase messaging sender ID
- `NEXT_PUBLIC_FIREBASE_APP_ID` - Your Firebase app ID

### Server-side (for Firebase Admin SDK)
- `FIREBASE_PROJECT_ID` - Your Firebase project ID
- `FIREBASE_CLIENT_EMAIL` - Service account client email
- `FIREBASE_PRIVATE_KEY` - Service account private key

## How to Get These Values

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project
3. Go to Project Settings (gear icon)
4. Under "Your apps", find your web app
5. Copy the config object values

For Admin SDK credentials:
1. Go to Service Accounts tab
2. Click "Generate New Private Key"
3. Copy the values from the JSON file

## Setting Up in Vercel

1. Go to your Vercel project settings
2. Navigate to "Environment Variables"
3. Add all the variables listed above
4. Redeploy your project

## Features Enabled

- ✅ Email/Password Authentication
- ✅ Protected Admin Routes
- ✅ Session Management
- ✅ Logout Functionality
- ✅ User Context Provider

## Next Steps

1. Enable Email/Password authentication in Firebase Console
2. Create admin users in Firebase Authentication
3. Test login at `/login`
4. Access admin dashboard at `/admin/dashboard`
