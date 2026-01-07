# CertiTrust – System Design Document

**Version:** 1.2  
**Project Owner:** Amulya A  
**Date:** October 2025  
**Repository Type:** Full-Stack Web Application

---

## 1. Overview

### 1.1 Project Purpose
CertiTrust is a secure, cloud-based certificate generation and verification platform designed to automate the creation of tamper-proof digital certificates and provide a reliable verification mechanism. The system enables authorized administrators to generate bulk certificates with encoded verification keys and allows public users to verify certificate authenticity through multiple methods.

### 1.2 Core Value Proposition
- **Automation:** Eliminate manual certificate creation by processing batch participant data through Excel uploads
- **Security:** Embed hidden encoded verification codes within certificates to prevent tampering and forgery
- **Traceability:** Maintain comprehensive logs of all certificate generation and verification activities
- **Accessibility:** Provide intuitive interfaces for both administrators and public verifiers

### 1.3 Key Stakeholders

| Stakeholder Type | Description | Primary Goals |
|-----------------|-------------|---------------|
| Administrator | Authorized certificate issuer (educational institutions, organizations, HR departments) | Generate bulk certificates efficiently, manage templates, monitor issuance |
| Verifier/Public User | Anyone seeking to validate certificate authenticity | Quickly verify certificates without requiring account registration |
| System Owner | Platform operator (Amulya A) | Maintain system security, monitor usage, manage platform health |

---

## 2. Technology Stack & Architecture

### 2.1 Technology Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Frontend Framework | Next.js 15.2.4 (App Router) | Server-side rendering, routing, and API routes |
| UI Library | React 19 | Component-based user interface |
| Language | TypeScript | Type-safe development |
| Styling | Tailwind CSS | Utility-first CSS framework |
| Component Library | Radix UI, Lucide Icons | Accessible UI primitives and icons |
| Form Management | React Hook Form + Zod | Form validation and schema validation |
| Authentication | Firebase Authentication | User authentication and session management |
| Database | Firebase Firestore | NoSQL document database |
| Storage | Firebase Storage | Binary file storage (PDFs, templates) |
| Backend Functions | Next.js API Routes | Serverless API endpoints |
| Hosting | Firebase Hosting / Vercel | Static site and serverless function hosting |

### 2.2 System Architecture

```mermaid
graph TB
    subgraph "Client Layer"
        A[Admin Dashboard]
        B[Verification Portal]
        C[Public Landing Page]
    end
    
    subgraph "Application Layer - Next.js"
        D[API Routes]
        E[Authentication Middleware]
        F[Server Components]
    end
    
    subgraph "Business Logic Layer"
        G[Certificate Generator Service]
        H[Verification Service]
        I[Excel Parser Service]
        J[Encoding/Decoding Service]
    end
    
    subgraph "Data Layer"
        K[(Firebase Firestore)]
        L[Firebase Storage]
        M[Firebase Auth]
    end
    
    A --> E
    B --> D
    C --> F
    E --> D
    D --> G
    D --> H
    G --> I
    G --> J
    H --> J
    G --> K
    G --> L
    H --> K
    E --> M
    
    style A fill:#e3f2fd
    style B fill:#e3f2fd
    style G fill:#fff3e0
    style H fill:#fff3e0
    style K fill:#f3e5f5
    style L fill:#f3e5f5
```

### 2.3 Deployment Architecture

```mermaid
graph LR
    A[User Browser] -->|HTTPS| B[CDN/Edge Network]
    B --> C[Next.js Frontend]
    C --> D[API Routes - Serverless]
    D --> E[Firebase Services]
    
    subgraph "Firebase Cloud"
        E --> F[Firestore Database]
        E --> G[Cloud Storage]
        E --> H[Authentication]
    end
    
    style A fill:#e8f5e9
    style C fill:#e3f2fd
    style D fill:#fff3e0
    style E fill:#f3e5f5
```

---

## 3. Data Models & Database Schema

### 3.1 Firestore Collections

#### 3.1.1 certificates Collection

| Field Name | Data Type | Description | Constraints |
|-----------|-----------|-------------|-------------|
| certificateId | string | Unique identifier (e.g., CERT-2025-001234) | Primary key, indexed |
| participantName | string | Full name of certificate recipient | Required, max 200 chars |
| participantEmail | string | Email address of participant | Required, valid email format |
| eventName | string | Name of event/course/achievement | Required, max 300 chars |
| organization | string | Issuing organization name | Required, max 200 chars |
| issueDate | timestamp | Date certificate was issued | Required, ISO 8601 format |
| encodedKey | string | Hidden verification code (salted hash) | Required, unique, indexed |
| status | enum | Certificate validity status | Values: 'valid', 'revoked', 'expired' |
| templateId | string | Reference to template used | Foreign key to templates collection |
| signatoryName | string | Name of authorized signatory | Optional, max 200 chars |
| signatoryTitle | string | Title/designation of signatory | Optional, max 200 chars |
| pdfUrl | string | Cloud Storage URL to generated PDF | Required, secure URL |
| metadata | map | Additional custom fields | Optional, flexible schema |
| createdAt | timestamp | Record creation timestamp | Auto-generated |
| updatedAt | timestamp | Last modification timestamp | Auto-updated |
| createdBy | string | Admin user ID who generated certificate | Foreign key to admins collection |

**Indexes:**
- `certificateId` (ascending)
- `encodedKey` (ascending)
- `participantEmail` (ascending)
- `status` + `createdAt` (compound index)

#### 3.1.2 verification_logs Collection

| Field Name | Data Type | Description | Constraints |
|-----------|-----------|-------------|-------------|
| logId | string | Auto-generated unique log ID | Primary key |
| certificateId | string | Certificate being verified | Nullable (may be invalid ID) |
| verificationMethod | enum | Method used for verification | Values: 'pdf_upload', 'certificate_id', 'qr_code' |
| verificationResult | enum | Outcome of verification | Values: 'verified', 'invalid', 'not_found', 'revoked' |
| verifiedAt | timestamp | Timestamp of verification attempt | Required, indexed |
| ipAddress | string | Client IP address (anonymized) | Optional, privacy-compliant |
| userAgent | string | Browser/client information | Optional, max 500 chars |
| geoLocation | map | Approximate location data | Optional (country, city) |
| processingTimeMs | number | Verification processing duration | Performance metric |

**Indexes:**
- `verifiedAt` (descending)
- `certificateId` + `verifiedAt` (compound index)

#### 3.1.3 admins Collection

| Field Name | Data Type | Description | Constraints |
|-----------|-----------|-------------|-------------|
| adminId | string | Unique admin user ID (Firebase UID) | Primary key |
| email | string | Admin login email | Required, unique, valid email |
| displayName | string | Admin full name | Required, max 200 chars |
| role | enum | Admin privilege level | Values: 'superadmin', 'admin', 'viewer' |
| status | enum | Account status | Values: 'active', 'suspended', 'inactive' |
| permissions | array | Granular permission flags | ['generate_certificates', 'view_logs', 'manage_templates'] |
| lastLogin | timestamp | Last successful login timestamp | Auto-updated |
| loginCount | number | Total number of logins | Auto-incremented |
| createdAt | timestamp | Account creation timestamp | Auto-generated |
| createdBy | string | Admin ID who created this account | Foreign key (superadmin only) |

**Indexes:**
- `email` (ascending, unique)
- `role` + `status` (compound index)

#### 3.1.4 templates Collection

| Field Name | Data Type | Description | Constraints |
|-----------|-----------|-------------|-------------|
| templateId | string | Unique template identifier | Primary key |
| name | string | Display name of template | Required, max 200 chars |
| description | string | Template description | Optional, max 500 chars |
| category | enum | Template classification | Values: 'academic', 'professional', 'participation', 'custom' |
| previewUrl | string | Cloud Storage URL for preview image | Required, HTTPS URL |
| basePdfPath | string | Cloud Storage path to base PDF template | Required |
| placeholderMap | map | Field mapping configuration | JSON object defining variable positions |
| themeColor | string | Primary color for template | Hex color code (e.g., #1E40AF) |
| fontFamily | string | Default font for dynamic text | Font name from allowed list |
| isActive | boolean | Template availability status | Default: true |
| usageCount | number | Number of times template used | Auto-incremented |
| createdAt | timestamp | Template creation timestamp | Auto-generated |
| updatedAt | timestamp | Last modification timestamp | Auto-updated |

**Indexes:**
- `isActive` + `category` (compound index)
- `usageCount` (descending)

### 3.2 Data Relationships

```mermaid
erDiagram
    ADMINS ||--o{ CERTIFICATES : creates
    CERTIFICATES }o--|| TEMPLATES : uses
    CERTIFICATES ||--o{ VERIFICATION_LOGS : generates
    
    ADMINS {
        string adminId PK
        string email UK
        enum role
        enum status
        timestamp lastLogin
    }
    
    CERTIFICATES {
        string certificateId PK
        string participantName
        string participantEmail
        string encodedKey UK
        enum status
        string templateId FK
        string createdBy FK
        timestamp createdAt
    }
    
    TEMPLATES {
        string templateId PK
        string name
        enum category
        boolean isActive
        number usageCount
    }
    
    VERIFICATION_LOGS {
        string logId PK
        string certificateId FK
        enum verificationMethod
        enum verificationResult
        timestamp verifiedAt
    }
```

---

## 4. API Design & Endpoints

### 4.1 API Endpoint Reference

#### 4.1.1 POST /api/generate-certificates

**Purpose:** Generate bulk certificates from uploaded participant data

**Authentication:** Required (Admin role)

**Request Schema:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| eventData | object | Yes | Event-level metadata |
| eventData.eventName | string | Yes | Name of event/course |
| eventData.organization | string | Yes | Issuing organization |
| eventData.issueDate | string | Yes | ISO 8601 date string |
| eventData.signatoryName | string | No | Signatory full name |
| eventData.signatoryTitle | string | No | Signatory designation |
| excelData | array | Yes | Array of participant objects |
| excelData[].name | string | Yes | Participant full name |
| excelData[].email | string | Yes | Participant email |
| excelData[].additionalFields | object | No | Custom metadata |
| selectedTemplate | object | Yes | Template configuration |
| selectedTemplate.templateId | string | Yes | Template identifier |
| selectedTemplate.name | string | Yes | Template display name |

**Response Schema:**

| Field | Type | Description |
|-------|------|-------------|
| success | boolean | Operation success status |
| count | number | Number of certificates generated |
| certificates | array | Array of generated certificate metadata |
| certificates[].certificateId | string | Unique certificate ID |
| certificates[].pdfUrl | string | Download URL for PDF |
| certificates[].verificationCode | string | Public verification code |
| message | string | Human-readable status message |
| errors | array | List of failed certificates (if any) |

**Business Logic Flow:**

```mermaid
sequenceDiagram
    participant Client as Admin Dashboard
    participant API as API Route
    participant Parser as Excel Parser
    participant Encoder as Encoding Service
    participant Generator as PDF Generator
    participant Firestore as Firestore DB
    participant Storage as Cloud Storage
    
    Client->>API: POST /api/generate-certificates
    API->>API: Validate authentication
    API->>API: Validate request schema
    API->>Parser: Parse participant data
    Parser-->>API: Structured participant list
    
    loop For each participant
        API->>Encoder: Generate unique encoded key
        Encoder-->>API: Salted hash verification code
        API->>Generator: Create PDF with embedded code
        Generator-->>API: PDF binary data
        API->>Storage: Upload PDF
        Storage-->>API: Public download URL
        API->>Firestore: Store certificate metadata
    end
    
    API-->>Client: Success response with certificate list
```

#### 4.1.2 POST /api/verify

**Purpose:** Verify certificate authenticity using PDF upload or certificate ID

**Authentication:** Not required (public endpoint)

**Request Schema:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| verificationMethod | enum | Yes | 'pdf_upload' or 'certificate_id' |
| certificateId | string | Conditional | Required if method is 'certificate_id' |
| pdfFile | binary | Conditional | Required if method is 'pdf_upload' (multipart/form-data) |

**Response Schema:**

| Field | Type | Description |
|-------|------|-------------|
| valid | boolean | Certificate validity status |
| certificateId | string | Verified certificate ID (if valid) |
| participantName | string | Certificate holder name (if valid) |
| eventName | string | Event/course name (if valid) |
| organization | string | Issuing organization (if valid) |
| issueDate | string | Certificate issue date (if valid) |
| status | enum | Current certificate status ('valid', 'revoked', 'expired') |
| message | string | Verification result message |
| verificationTimestamp | string | ISO 8601 timestamp of verification |

**Verification Logic Flow:**

```mermaid
flowchart TD
    A[Receive Verification Request] --> B{Method Type?}
    
    B -->|PDF Upload| C[Extract Encoded Key from PDF Metadata]
    B -->|Certificate ID| D[Query Firestore by Certificate ID]
    
    C --> E{Key Extracted?}
    E -->|No| F[Return Invalid - Code Not Found]
    E -->|Yes| G[Query Firestore by Encoded Key]
    
    G --> H{Record Found?}
    D --> H
    
    H -->|No| I[Return Invalid - Not Found]
    H -->|Yes| J{Status Check}
    
    J -->|Revoked| K[Return Invalid - Revoked]
    J -->|Expired| L[Return Invalid - Expired]
    J -->|Valid| M[Return Verified + Certificate Data]
    
    F --> N[Log Verification Attempt]
    I --> N
    K --> N
    L --> N
    M --> N
    
    N --> O[Return Response to Client]
    
    style M fill:#c8e6c9
    style F fill:#ffcdd2
    style I fill:#ffcdd2
    style K fill:#ffcdd2
    style L fill:#ffcdd2
```

#### 4.1.3 GET /api/admin/logs

**Purpose:** Retrieve verification logs for administrative monitoring

**Authentication:** Required (Admin or Superadmin role)

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| page | number | No | Page number (default: 1) |
| limit | number | No | Records per page (default: 50, max: 200) |
| certificateId | string | No | Filter by specific certificate ID |
| startDate | string | No | ISO 8601 start date for time range |
| endDate | string | No | ISO 8601 end date for time range |
| result | enum | No | Filter by result type ('verified', 'invalid', 'not_found') |

**Response Schema:**

| Field | Type | Description |
|-------|------|-------------|
| logs | array | Array of verification log entries |
| totalCount | number | Total number of matching records |
| page | number | Current page number |
| totalPages | number | Total number of pages |
| hasNext | boolean | Indicates if more pages exist |

#### 4.1.4 POST /api/upload-excel

**Purpose:** Parse and validate Excel file before certificate generation

**Authentication:** Required (Admin role)

**Request:** Multipart/form-data with Excel file

**Response Schema:**

| Field | Type | Description |
|-------|------|-------------|
| success | boolean | Parsing success status |
| participantCount | number | Number of valid participants |
| participants | array | Preview of parsed participant data |
| errors | array | List of validation errors (if any) |
| warnings | array | Non-critical issues (duplicate emails, etc.) |

---

## 5. Component Architecture

### 5.1 Frontend Component Hierarchy

```mermaid
graph TB
    A[App Root Layout]
    
    A --> B[Public Routes]
    A --> C[Protected Routes - Admin]
    
    B --> D[Landing Page]
    B --> E[Verification Page]
    B --> F[Login Page]
    
    C --> G[Admin Dashboard]
    
    D --> H[Hero Section]
    D --> I[Benefits Section]
    D --> J[Process Section]
    D --> K[Testimonials Section]
    D --> L[CTA Section]
    
    E --> M[Verification Form]
    E --> N[PDF Upload Component]
    E --> O[ID Input Component]
    E --> P[Verification Result Display]
    
    G --> Q[Event Details Form]
    G --> R[Excel Upload Component]
    G --> S[Template Selector]
    G --> T[Generation Progress]
    G --> U[Result Summary]
    
    Q --> V[Form Fields - React Hook Form]
    R --> W[File Dropzone]
    R --> X[Data Preview Table]
    S --> Y[Template Cards]
    S --> Z[Template Preview Modal]
    
    style A fill:#1e3a8a
    style C fill:#dc2626
    style G fill:#ea580c
```

### 5.2 Component Specifications

#### 5.2.1 Admin Dashboard (Page Component)

**Location:** `app/admin/dashboard/page.tsx`

**Purpose:** Multi-step wizard for certificate generation workflow

**State Management:**

| State Variable | Type | Purpose |
|---------------|------|---------|
| currentStep | number | Tracks wizard progression (1-4) |
| eventData | object | Stores event-level metadata |
| excelData | array | Parsed participant list |
| selectedTemplate | object | Chosen template configuration |
| generationStatus | enum | 'idle', 'processing', 'complete', 'error' |
| generatedCertificates | array | List of generated certificate URLs |

**Workflow Steps:**

1. **Step 1 - Event Details:** Form to capture event name, organization, date, signatory
2. **Step 2 - Excel Upload:** File upload with validation and preview
3. **Step 3 - Template Selection:** Visual template picker with preview
4. **Step 4 - Generation:** Progress indicator and final confirmation

**Component Composition:**

```mermaid
graph LR
    A[Admin Dashboard Container] --> B[Step Indicator]
    A --> C[Event Details Form]
    A --> D[Excel Upload]
    A --> E[Template Selector]
    A --> F[Generation Summary]
    A --> G[Generation Result]
    
    C --> H[Form Validation - Zod]
    D --> I[Excel Parser]
    D --> J[Data Preview Table]
    E --> K[Template Cards Grid]
    F --> L[Confirmation Dialog]
    G --> M[Download All Button]
    G --> N[Email Certificates Button]
```

#### 5.2.2 Verification Page (Page Component)

**Location:** `app/verify/page.tsx`

**Purpose:** Public interface for certificate verification

**State Management:**

| State Variable | Type | Purpose |
|---------------|------|---------|
| verificationMethod | enum | 'pdf' or 'id' |
| uploadedFile | File | PDF file object |
| certificateId | string | Manual ID input |
| verificationStatus | enum | 'idle', 'verifying', 'verified', 'invalid' |
| certificateData | object | Verified certificate information |

**User Interaction Flow:**

```mermaid
stateDiagram-v2
    [*] --> MethodSelection
    MethodSelection --> PDFUpload: Select PDF Method
    MethodSelection --> IDInput: Select ID Method
    
    PDFUpload --> FileValidation
    FileValidation --> VerificationReady: Valid PDF
    FileValidation --> PDFUpload: Invalid File
    
    IDInput --> VerificationReady: ID Entered
    
    VerificationReady --> Verifying: Click Verify
    Verifying --> VerifiedSuccess: Valid Certificate
    Verifying --> VerifiedFailed: Invalid/Not Found
    
    VerifiedSuccess --> [*]: Reset
    VerifiedFailed --> [*]: Reset
```

#### 5.2.3 Excel Upload Component

**Location:** `components/admin/excel-upload.tsx`

**Purpose:** Handle Excel file upload, parsing, and validation

**Props Interface:**

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| onUpload | function | Yes | Callback with parsed participant data |
| maxFileSize | number | No | Maximum file size in MB (default: 5) |
| requiredColumns | array | No | List of mandatory column names |

**Validation Rules:**

- File extension must be `.xlsx`
- File size must not exceed configured maximum
- Must contain required columns: `name`, `email`
- Email format validation for all entries
- No duplicate email addresses
- Participant count must be between 1 and 1000

**Component Behavior:**

1. Display drag-and-drop upload zone
2. On file selection, validate file type and size
3. Parse Excel file (using library like xlsx or papaparse)
4. Validate data structure and content
5. Display preview table (first 5 rows)
6. Show validation warnings/errors if any
7. Enable "Continue" button only if validation passes

#### 5.2.4 Template Selector Component

**Location:** `components/admin/template-selector.tsx`

**Purpose:** Visual template selection with preview capability

**Data Source:** Fetches from Firestore `templates` collection (filtered by `isActive: true`)

**Props Interface:**

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| onSelect | function | Yes | Callback with selected template object |
| selectedTemplateId | string | No | Pre-selected template ID |
| category | string | No | Filter templates by category |

**Component Structure:**

```mermaid
graph TB
    A[Template Selector Container] --> B[Category Filter Tabs]
    A --> C[Template Grid]
    C --> D[Template Card 1]
    C --> E[Template Card 2]
    C --> F[Template Card N]
    
    D --> G[Preview Image]
    D --> H[Template Name]
    D --> I[Usage Count Badge]
    D --> J[Select Button]
    
    J --> K[Preview Modal]
    K --> L[Full-size Preview]
    K --> M[Template Details]
    K --> N[Confirm Selection]
```

---

## 6. Business Logic Layer

### 6.1 Certificate Generation Service

**Purpose:** Orchestrate the complete certificate generation workflow

**Core Responsibilities:**

1. **Data Validation:** Validate event metadata and participant data
2. **Code Generation:** Create unique, salted verification codes
3. **PDF Generation:** Merge participant data with template PDF
4. **Storage Management:** Upload generated PDFs to Cloud Storage
5. **Database Persistence:** Store certificate metadata in Firestore
6. **Email Delivery:** Send certificates to participants (optional)

**Processing Algorithm:**

```mermaid
flowchart TD
    A[Start Generation] --> B[Validate Input Data]
    B --> C{Validation Passed?}
    C -->|No| D[Return Validation Errors]
    C -->|Yes| E[Fetch Template from Storage]
    
    E --> F[Initialize Batch Process]
    F --> G[Start Transaction]
    
    G --> H{For Each Participant}
    H --> I[Generate Unique Certificate ID]
    I --> J[Create Salted Encoded Key]
    J --> K[Merge Data with Template PDF]
    K --> L[Embed Encoded Key in PDF Metadata]
    L --> M[Upload PDF to Storage]
    M --> N[Get Public URL]
    N --> O[Create Firestore Document]
    O --> P{More Participants?}
    
    P -->|Yes| H
    P -->|No| Q[Commit Transaction]
    
    Q --> R{Email Delivery Enabled?}
    R -->|Yes| S[Queue Email Jobs]
    R -->|No| T[Return Success Response]
    S --> T
    
    style D fill:#ffcdd2
    style T fill:#c8e6c9
```

**Encoding Strategy:**

The verification code generation must ensure uniqueness and tamper resistance:

1. **Input:** Certificate ID + Participant Email + Issue Date + Secret Salt
2. **Algorithm:** SHA-256 hashing
3. **Output:** 16-character alphanumeric code (e.g., `A3F7K9M2P5Q8R1T4`)
4. **Embedding:** Store hash in PDF metadata field (hidden from visual display)

**Performance Considerations:**

| Metric | Target | Strategy |
|--------|--------|----------|
| Generation Speed | < 5 seconds per certificate | Use parallel processing for batch operations |
| Throughput | 100 certificates in < 30 seconds | Implement queue-based processing |
| Error Recovery | Retry failed certificates | Track failures separately, allow re-generation |
| Resource Management | Avoid memory overflow | Process in batches of 50 certificates |

### 6.2 Verification Service

**Purpose:** Authenticate certificate validity using embedded codes

**Verification Methods:**

#### 6.2.1 PDF Upload Verification

**Process:**

1. Extract PDF metadata using PDF parsing library
2. Locate embedded verification code in metadata field
3. Query Firestore using encoded key as index
4. Match certificate data with PDF content
5. Validate certificate status (not revoked/expired)
6. Return verification result

#### 6.2.2 Certificate ID Verification

**Process:**

1. Normalize input (trim whitespace, convert to uppercase)
2. Query Firestore by `certificateId` field
3. Validate certificate status
4. Return verification result

**Verification Response Matrix:**

| Condition | Valid Status | Response Message | HTTP Status |
|-----------|--------------|------------------|-------------|
| Certificate found + status valid | `true` | "Certificate Verified – Valid" | 200 |
| Certificate found + status revoked | `false` | "Certificate has been revoked" | 200 |
| Certificate found + status expired | `false` | "Certificate has expired" | 200 |
| Certificate not found | `false` | "Certificate not found or invalid" | 200 |
| Invalid verification code format | `false` | "Invalid verification code format" | 400 |
| PDF parsing error | `false` | "Unable to process certificate file" | 400 |

**Logging Mechanism:**

Every verification attempt (successful or failed) must be logged to `verification_logs` collection with:

- Certificate ID (if identifiable)
- Verification method used
- Result status
- Timestamp
- Anonymized client metadata (IP, user agent)

### 6.3 Excel Parser Service

**Purpose:** Extract and validate participant data from uploaded Excel files

**Parsing Logic:**

1. **File Reading:** Use XLSX library to parse binary Excel file
2. **Sheet Selection:** Use first sheet by default (or allow sheet name specification)
3. **Header Detection:** Identify header row (typically row 1)
4. **Column Mapping:** Map columns to expected fields

**Expected Column Structure:**

| Column Name (Case-insensitive) | Required | Data Type | Validation Rules |
|-------------------------------|----------|-----------|------------------|
| Name / Participant Name | Yes | string | 2-200 characters |
| Email / Email Address | Yes | string | Valid email format, unique |
| Course / Event (optional) | No | string | Max 300 characters |
| Phone / Mobile (optional) | No | string | Valid phone format |
| Custom Field 1-5 (optional) | No | string | Max 500 characters |

**Validation Output:**

```typescript
{
  success: boolean,
  data: [
    { name: string, email: string, ... }
  ],
  errors: [
    { row: number, column: string, message: string }
  ],
  warnings: [
    { row: number, message: string }
  ],
  summary: {
    totalRows: number,
    validRows: number,
    errorRows: number
  }
}
```

---

## 7. Authentication & Authorization

### 7.1 Authentication Flow

**Technology:** Firebase Authentication (Email/Password)

```mermaid
sequenceDiagram
    participant User as Admin User
    participant UI as Login Page
    participant Auth as Firebase Auth
    participant Middleware as Next.js Middleware
    participant Dashboard as Admin Dashboard
    
    User->>UI: Enter email & password
    UI->>Auth: signInWithEmailAndPassword()
    Auth-->>UI: ID Token + User Object
    UI->>UI: Store token in secure cookie
    UI->>Dashboard: Redirect to /admin/dashboard
    Dashboard->>Middleware: Request with auth cookie
    Middleware->>Auth: Verify ID token
    Auth-->>Middleware: Token valid + Claims
    Middleware-->>Dashboard: Allow access
    Dashboard-->>User: Render admin interface
```

### 7.2 Authorization Rules

**Role-Based Access Control (RBAC):**

| Role | Permissions | Scope |
|------|-------------|-------|
| Superadmin | Full system access | Create/delete admins, manage templates, generate certificates, view all logs, revoke certificates |
| Admin | Certificate management | Generate certificates, view own logs, select templates |
| Viewer | Read-only access | View verification logs, view certificate metadata (no generation) |

**Firestore Security Rules Strategy:**

The following access control policies must be enforced at the database level:

**certificates Collection:**
- **Read:** Authenticated admins only (filter by `createdBy` for regular admins)
- **Write:** Authenticated admins with `generate_certificates` permission
- **Update:** Superadmin only (for status changes like revocation)

**verification_logs Collection:**
- **Read:** Authenticated admins only
- **Write:** System-generated only (via API routes)

**admins Collection:**
- **Read:** Self-read allowed, list view for superadmin only
- **Write:** Superadmin only

**templates Collection:**
- **Read:** Authenticated admins only
- **Write:** Superadmin only

### 7.3 Session Management

**Strategy:** HTTP-only secure cookies with token refresh

| Parameter | Value | Purpose |
|-----------|-------|---------|
| Cookie Name | `auth_token` | Firebase ID token |
| HttpOnly | true | Prevent XSS attacks |
| Secure | true | HTTPS-only transmission |
| SameSite | Strict | CSRF protection |
| Max-Age | 3600 seconds (1 hour) | Token expiration |
| Refresh Strategy | Automatic refresh at 50 minutes | Maintain session without re-login |

**Middleware Protection:**

Next.js middleware intercepts protected routes and validates authentication before rendering:

- `/admin/*` routes require valid admin token
- `/api/generate-certificates` requires admin authentication
- `/api/admin/*` routes require admin authentication
- `/api/verify` is public (no authentication required)

---

## 8. Security Requirements

### 8.1 Data Protection

| Security Measure | Implementation | Purpose |
|-----------------|----------------|---------|
| HTTPS Enforcement | Force SSL/TLS on all connections | Encrypt data in transit |
| Encoded Key Encryption | SHA-256 with secret salt | Prevent code forgery |
| PDF Metadata Embedding | Invisible verification code | Tamper detection |
| Input Validation | Zod schema validation on all API inputs | Prevent injection attacks |
| File Upload Validation | Restrict file types, scan for malware | Prevent malicious uploads |
| Rate Limiting | Limit verification requests to 10/minute per IP | Prevent abuse |
| Environment Variables | Store secrets in `.env.local` (never committed) | Protect API keys |

### 8.2 Authentication Security

**Password Requirements:**
- Minimum 8 characters
- Must include uppercase, lowercase, number, special character
- Enforce password reset every 90 days (configurable)

**Account Protection:**
- Maximum 5 failed login attempts before temporary lockout (15 minutes)
- Email verification required for new admin accounts
- Two-factor authentication (future enhancement)

### 8.3 Firestore Security Rules

**Implementation Strategy:**

All database access must be validated through security rules that enforce:

1. **Authentication requirement** for write operations
2. **Role-based read access** based on user claims
3. **Field-level validation** to prevent invalid data
4. **Owner-based filtering** (regular admins see only their certificates)

**Example Rule Logic (Conceptual):**

For the `certificates` collection:
- Allow read if user is authenticated AND (user is superadmin OR certificate.createdBy matches user ID)
- Allow create if user is authenticated AND user has 'generate_certificates' permission
- Allow update if user is superadmin (for status changes only)
- Deny delete operations (soft delete via status field instead)

### 8.4 API Security

**Request Validation:**

All API endpoints must validate:
- Authentication tokens (except public verification endpoint)
- Request payload schema (using Zod validators)
- File uploads (type, size, content scanning)
- Rate limit compliance

**Response Security:**

- Never expose internal error details in production
- Sanitize all output data (prevent XSS)
- Use appropriate HTTP status codes
- Include security headers (CSP, X-Frame-Options, etc.)

---

## 9. User Interface Design

### 9.1 Design System

**Theme Configuration:**

| Element | Value | Usage |
|---------|-------|-------|
| Primary Color | `#1E40AF` (Blue 800) | Buttons, links, active states |
| Secondary Color | `#3B82F6` (Blue 500) | Hover states, accents |
| Success Color | `#10B981` (Green 500) | Verified certificates, success messages |
| Error Color | `#EF4444` (Red 500) | Invalid certificates, error states |
| Surface | `#F9FAFB` (Gray 50) | Card backgrounds |
| Text Primary | `#111827` (Gray 900) | Main content text |
| Text Secondary | `#6B7280` (Gray 500) | Helper text, labels |

**Typography:**

| Element | Font Family | Size | Weight |
|---------|------------|------|--------|
| H1 (Page Titles) | Inter | 2.25rem (36px) | 700 (Bold) |
| H2 (Section Headers) | Inter | 1.5rem (24px) | 600 (Semibold) |
| Body Text | Inter | 1rem (16px) | 400 (Regular) |
| Labels | Inter | 0.875rem (14px) | 500 (Medium) |
| Buttons | Inter | 1rem (16px) | 600 (Semibold) |

**Component Styling Standards:**

- Border Radius: `0.75rem` (12px) for cards, `0.5rem` (8px) for buttons
- Shadows: Subtle shadows (`0 1px 3px rgba(0,0,0,0.1)`) for elevation
- Spacing: 8px base unit (use multiples: 8, 16, 24, 32, 48, 64)
- Animations: 200ms ease-in-out transitions for interactive elements

### 9.2 Page Specifications

#### 9.2.1 Landing Page (`app/page.tsx`)

**Purpose:** Public-facing homepage showcasing platform value and navigation

**Sections:**

1. **Hero Section**
   - Headline: "Secure Certificate Generation & Verification"
   - Subheadline: "Automate certificate issuance with tamper-proof verification"
   - Primary CTA: "Generate Certificates" (Admin Login)
   - Secondary CTA: "Verify Certificate" (Public Verification)

2. **Benefits Section**
   - Grid of 3-4 benefit cards (automation, security, traceability, simplicity)
   - Icons with descriptive text

3. **Process Section**
   - Step-by-step visual workflow (3 steps)
   - Admin flow: Upload → Select → Generate
   - Verifier flow: Upload → Verify → Result

4. **Testimonials Section** (Optional)
   - Social proof from educational institutions or organizations

5. **CTA Section**
   - Final call-to-action to get started

#### 9.2.2 Login Page (`app/login/page.tsx`)

**Layout:**

- Centered card (max-width 400px)
- Email input field
- Password input field (with show/hide toggle)
- "Remember Me" checkbox (optional)
- Login button (full width, primary color)
- Forgot password link
- Error message display area (for invalid credentials)

**Form Validation:**

- Email format validation (on blur)
- Password minimum length check
- Display validation errors inline
- Disable submit button while authenticating

#### 9.2.3 Admin Dashboard (`app/admin/dashboard/page.tsx`)

**Layout Structure:**

- Top navigation bar (Navbar component)
- Page header with title and description
- Step-by-step wizard interface
- Progress indicator showing current step (1/4, 2/4, etc.)

**Step Visualization:**

Each step displayed in expandable card format:

- **Step 1:** Event Details Form (always visible)
- **Step 2:** Excel Upload (visible after Step 1 completion)
- **Step 3:** Template Selection (visible after Step 2 completion)
- **Step 4:** Generation Confirmation (visible after Step 3 completion)

**Generation Result Screen:**

- Success: Green checkmark icon, total count, download/email options
- Failure: Red error icon, error message, retry button

#### 9.2.4 Verification Page (`app/verify/page.tsx`)

**Layout:**

- Centered interface (max-width 600px)
- Method toggle (PDF Upload vs. Certificate ID)
- Conditional input area based on selected method
- Verify button (disabled until valid input)
- Result display area (card format)

**Result Display States:**

**Verified Certificate (Green Card):**
- Large checkmark icon
- "Certificate Verified" headline
- Participant name
- Event name
- Organization
- Issue date
- Certificate ID

**Invalid Certificate (Red Card):**
- Warning icon
- "Invalid Certificate" headline
- Error message explaining why verification failed
- "Try Again" button

---

## 10. Testing Strategy

### 10.1 Unit Testing

**Target Coverage:** 80% minimum for business logic services

**Test Frameworks:**
- **Testing Library:** Jest
- **React Testing:** React Testing Library
- **Type Checking:** TypeScript strict mode

**Critical Test Suites:**

| Service/Component | Test Scenarios |
|------------------|----------------|
| Certificate Generation Service | Valid data generation, invalid input handling, encoding correctness, database write verification |
| Verification Service | Valid code verification, invalid code handling, PDF parsing, status checks (revoked/expired) |
| Excel Parser Service | Valid Excel parsing, malformed file handling, validation errors, column mapping |
| Encoding Service | Unique code generation, salt integration, collision testing |
| Event Details Form | Field validation, required fields, date validation, form submission |
| Excel Upload Component | File type validation, size limit, preview display, error handling |
| Template Selector | Template fetching, selection state, preview modal |

**Example Test Cases (Verification Service):**

1. **Test:** Verify valid certificate by ID
   - **Given:** A valid certificate ID exists in database
   - **When:** Verification request submitted with correct ID
   - **Then:** Return `valid: true` with certificate details

2. **Test:** Verify revoked certificate
   - **Given:** Certificate exists but status is 'revoked'
   - **When:** Verification request submitted
   - **Then:** Return `valid: false` with revoked message

3. **Test:** Verify non-existent certificate
   - **Given:** Certificate ID does not exist in database
   - **When:** Verification request submitted
   - **Then:** Return `valid: false` with not found message

### 10.2 Integration Testing

**Purpose:** Validate end-to-end workflows and API integrations

**Test Scenarios:**

1. **Complete Certificate Generation Flow**
   - Admin login → Upload Excel → Select template → Generate → Verify storage
   - Validate Firestore documents created
   - Validate PDFs uploaded to Storage
   - Validate verification codes functional

2. **PDF Verification Flow**
   - Upload generated certificate PDF → Extract code → Verify against database
   - Validate logging of verification attempt

3. **Authentication Flow**
   - Login with valid credentials → Access dashboard → Logout
   - Attempt access without authentication (expect redirect)

### 10.3 User Acceptance Testing (UAT)

**Testing Checklist:**

| Feature | Acceptance Criteria |
|---------|-------------------|
| Certificate Generation | Admin can generate 100 certificates in under 30 seconds |
| Verification Accuracy | 100% accuracy - no false positives or false negatives |
| UI Responsiveness | Interface functional on mobile, tablet, desktop |
| Error Handling | Clear error messages for invalid inputs |
| Template Preview | All templates display preview images correctly |
| Email Delivery | Certificates delivered to participant emails (if enabled) |

---

## 11. Performance & Scalability

### 11.1 Performance Targets

| Metric | Target | Measurement Method |
|--------|--------|-------------------|
| Certificate Generation Speed | < 5 seconds per certificate | Server-side timing logs |
| Batch Generation (100 certs) | < 30 seconds total | End-to-end workflow timing |
| Verification Response Time | < 2 seconds | API response time monitoring |
| Page Load Time | < 3 seconds (First Contentful Paint) | Lighthouse audit |
| Database Query Time | < 500ms for single document reads | Firestore monitoring |

### 11.2 Scalability Strategies

**Horizontal Scaling:**

- **Serverless Architecture:** Next.js API routes deployed on Vercel auto-scale based on demand
- **Firebase Firestore:** Auto-scales to handle increased read/write operations
- **Cloud Storage:** Unlimited scalability for PDF storage

**Optimization Techniques:**

| Area | Strategy | Expected Impact |
|------|----------|----------------|
| PDF Generation | Queue-based processing with worker functions | Handle 1000+ concurrent generations |
| Image Assets | CDN caching (Vercel Edge Network) | Reduce latency by 70% |
| Database Queries | Indexed fields (certificateId, encodedKey) | Query time < 100ms |
| Static Pages | Static generation for landing page | Instant page loads |
| API Responses | Response caching for template list | Reduce database reads by 80% |

### 11.3 Resource Management

**Batch Processing Strategy:**

For bulk certificate generation:

1. Accept request with participant data
2. Validate entire dataset before processing
3. Process in batches of 50 certificates
4. Use background job queue for large batches (>100)
5. Provide progress updates via WebSocket or polling
6. Implement retry logic for failed individual certificates

**Storage Optimization:**

- Compress PDF files (target < 500KB per certificate)
- Set Cloud Storage lifecycle rules to archive old certificates (>2 years)
- Implement cleanup jobs for orphaned files

---

## 12. Error Handling & Logging

### 12.1 Error Classification

| Error Type | HTTP Status | User-Facing Message | Internal Logging |
|-----------|-------------|-------------------|------------------|
| Validation Error | 400 | Specific field error (e.g., "Invalid email format") | Log validation details |
| Authentication Error | 401 | "Authentication required. Please log in." | Log attempted access |
| Authorization Error | 403 | "You don't have permission to perform this action." | Log user ID and attempted action |
| Not Found | 404 | "Certificate not found." | Log search parameters |
| Rate Limit Exceeded | 429 | "Too many requests. Please try again later." | Log IP and request count |
| Server Error | 500 | "An unexpected error occurred. Please try again." | Log full error stack trace |

### 12.2 Logging Strategy

**Log Levels:**

- **ERROR:** System failures, unhandled exceptions
- **WARN:** Validation failures, rate limit violations
- **INFO:** Successful operations (generation, verification)
- **DEBUG:** Detailed operation traces (development only)

**Logged Events:**

| Event | Log Level | Data Captured |
|-------|-----------|---------------|
| Certificate Generation Started | INFO | Admin ID, participant count, template ID |
| Certificate Generation Completed | INFO | Admin ID, generated count, duration |
| Certificate Generation Failed | ERROR | Admin ID, error message, stack trace |
| Verification Attempt | INFO | Method, certificate ID, result, IP address |
| Authentication Success | INFO | User ID, timestamp, IP |
| Authentication Failure | WARN | Email attempted, timestamp, IP |
| Template Selection | DEBUG | Admin ID, template ID |

**Log Storage:**

- Use Firebase Cloud Logging or integrate with external logging service (e.g., Sentry, LogRocket)
- Retain logs for 90 days minimum
- Archive critical logs (authentication, certificate generation) for 2 years

---

## 13. Deployment & Environment Configuration

### 13.1 Environment Variables

**Required Configuration:**

| Variable Name | Purpose | Example Value | Storage Location |
|--------------|---------|---------------|------------------|
| NEXT_PUBLIC_FIREBASE_API_KEY | Firebase client API key | `AIzaSyC...` | `.env.local` |
| NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN | Firebase auth domain | `project.firebaseapp.com` | `.env.local` |
| NEXT_PUBLIC_FIREBASE_PROJECT_ID | Firebase project ID | `certitrust-prod` | `.env.local` |
| NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET | Storage bucket name | `project.appspot.com` | `.env.local` |
| FIREBASE_ADMIN_PROJECT_ID | Admin SDK project ID | `certitrust-prod` | `.env.local` (server-only) |
| FIREBASE_ADMIN_CLIENT_EMAIL | Service account email | `firebase-adminsdk@...` | `.env.local` (server-only) |
| FIREBASE_ADMIN_PRIVATE_KEY | Service account private key | `-----BEGIN PRIVATE KEY-----...` | `.env.local` (server-only) |
| ENCODING_SECRET_SALT | Secret salt for verification codes | Random 32-char string | `.env.local` (server-only) |
| NEXT_PUBLIC_APP_URL | Application base URL | `https://certitrust.vercel.app` | `.env.local` |

**Environment-Specific Values:**

- **Development:** `.env.local` with development Firebase project
- **Staging:** Vercel environment variables with staging Firebase project
- **Production:** Vercel environment variables with production Firebase project

### 13.2 Deployment Pipeline

**Platform:** Vercel (recommended) or Firebase Hosting

```mermaid
flowchart LR
    A[Developer Push to Main] --> B[GitHub Actions Triggered]
    B --> C[Run TypeScript Checks]
    B --> D[Run ESLint]
    B --> E[Run Unit Tests]
    
    C --> F{All Checks Passed?}
    D --> F
    E --> F
    
    F -->|No| G[Fail Deployment]
    F -->|Yes| H[Build Next.js Application]
    
    H --> I[Deploy to Vercel Staging]
    I --> J[Run Smoke Tests]
    J --> K{Tests Passed?}
    
    K -->|No| L[Rollback Deployment]
    K -->|Yes| M[Promote to Production]
    
    M --> N[Production Live]
    
    style G fill:#ffcdd2
    style L fill:#ffcdd2
    style N fill:#c8e6c9
```

**Deployment Checklist:**

- [ ] Environment variables configured in Vercel dashboard
- [ ] Firebase project created and configured
- [ ] Firestore security rules deployed
- [ ] Cloud Storage CORS configured
- [ ] Domain DNS configured (if custom domain)
- [ ] SSL certificate active
- [ ] Admin accounts created in Firestore
- [ ] Initial templates uploaded to Cloud Storage
- [ ] Monitoring and alerting configured

### 13.3 Firebase Configuration

**Firestore Indexes:**

Composite indexes must be created for:

1. `certificates` collection:
   - `status` (ascending) + `createdAt` (descending)
   - `createdBy` (ascending) + `createdAt` (descending)

2. `verification_logs` collection:
   - `certificateId` (ascending) + `verifiedAt` (descending)

**Cloud Storage Bucket Structure:**

```
/templates
  /academic-blue.pdf
  /professional-green.pdf
  /participation-orange.pdf
/certificates
  /2025
    /01
      /cert-2025-001234.pdf
      /cert-2025-001235.pdf
    /02
      /cert-2025-002001.pdf
/previews
  /academic-blue.png
  /professional-green.png
```

**Storage Security Rules:**

- `/templates`: Read: authenticated admins, Write: superadmin only
- `/certificates`: Read: authenticated admins (filter by uploader), Write: server-only
- `/previews`: Read: authenticated admins, Write: superadmin only

---

## 14. Future Enhancements

### 14.1 Planned Features (Post v1.0)

| Feature | Description | Priority | Estimated Effort |
|---------|-------------|----------|-----------------|
| QR Code Verification | Embed QR codes on certificates for mobile scanning | High | 2 weeks |
| Analytics Dashboard | Visual analytics for certificate issuance trends | Medium | 3 weeks |
| Email Automation | Automatic email delivery after certificate generation | High | 2 weeks |
| Multi-Language Support | Support for certificate templates in multiple languages | Medium | 4 weeks |
| Certificate Revocation | Admin interface to revoke fraudulent certificates | High | 1 week |
| Batch Email Customization | Custom email templates for different event types | Low | 2 weeks |
| API Access for Integrations | REST API for third-party integrations | Medium | 3 weeks |
| Mobile App | Native mobile apps for iOS/Android verification | Low | 12 weeks |
| Blockchain Integration | Store verification hashes on blockchain for immutability | Low | 6 weeks |

### 14.2 Enhancement Workflows

#### QR Code Implementation (Future)

**Design Approach:**

```mermaid
flowchart TD
    A[Certificate Generation] --> B[Generate QR Code]
    B --> C[Encode: Certificate ID + Verification URL]
    C --> D[Embed QR Code Image in PDF]
    D --> E[Store in Cloud Storage]
    
    F[Mobile Scan] --> G[Decode QR Code]
    G --> H[Extract Certificate ID]
    H --> I[Redirect to Verification Page]
    I --> J[Auto-populate Certificate ID]
    J --> K[Display Verification Result]
    
    style A fill:#e3f2fd
    style K fill:#c8e6c9
```

**Data Encoded in QR Code:**

```
https://certitrust.app/verify?id=CERT-2025-001234&v=A3F7K9M2P5Q8R1T4
```

**Mobile Scanning Flow:**

1. User scans QR code with camera
2. Browser opens verification URL with pre-filled certificate ID
3. System automatically triggers verification
4. Result displayed instantly (no manual input required)

---

## Appendix

### A. Glossary

| Term | Definition |
|------|------------|
| Certificate ID | Unique alphanumeric identifier assigned to each certificate (e.g., CERT-2025-001234) |
| Encoded Key | Salted hash verification code embedded in certificate PDF metadata |
| Template | Pre-designed PDF layout with placeholder fields for participant data |
| Verification Log | Record of each certificate verification attempt with timestamp and result |
| Firebase Firestore | NoSQL cloud database service by Google Firebase |
| Next.js App Router | File-system based routing in Next.js 13+ using app directory |

### B. File Structure Reference

```
CertiTrust/
├── app/
│   ├── admin/
│   │   └── dashboard/
│   │       └── page.tsx              # Admin certificate generation interface
│   ├── api/
│   │   ├── generate-certificates/
│   │   │   └── route.ts              # Certificate generation API endpoint
│   │   ├── verify/
│   │   │   └── route.ts              # Certificate verification API endpoint
│   │   └── auth/
│   │       ├── session/route.ts      # Session management
│   │       └── logout/route.ts       # Logout handler
│   ├── login/
│   │   └── page.tsx                  # Admin login page
│   ├── verify/
│   │   └── page.tsx                  # Public verification interface
│   ├── layout.tsx                    # Root layout with providers
│   ├── page.tsx                      # Landing page
│   └── globals.css                   # Global styles
├── components/
│   ├── admin/
│   │   ├── event-details-form.tsx    # Event metadata input form
│   │   ├── excel-upload.tsx          # Excel file upload component
│   │   ├── template-selector.tsx     # Template selection interface
│   │   └── generation-result.tsx     # Result display after generation
│   ├── ui/                           # Reusable UI components (Radix-based)
│   ├── navbar.tsx                    # Navigation bar
│   ├── footer.tsx                    # Footer component
│   └── auth-provider.tsx             # Authentication context provider
├── lib/
│   ├── firebase.ts                   # Firebase client initialization
│   ├── firebase-admin.ts             # Firebase Admin SDK initialization
│   └── utils.ts                      # Utility functions
├── .env.local                        # Environment variables (not committed)
└── .env.example                      # Environment variable template
```

### C. API Response Examples

**Successful Certificate Generation:**

```json
{
  "success": true,
  "count": 5,
  "certificates": [
    {
      "certificateId": "CERT-2025-001234",
      "participantName": "John Smith",
      "pdfUrl": "https://storage.googleapis.com/...",
      "verificationCode": "A3F7K9M2P5Q8R1T4"
    }
  ],
  "message": "Certificates Generated Successfully"
}
```

**Successful Verification:**

```json
{
  "valid": true,
  "certificateId": "CERT-2025-001234",
  "participantName": "John Smith",
  "eventName": "Advanced React Workshop",
  "organization": "Tech Academy",
  "issueDate": "2025-01-15",
  "status": "valid",
  "verificationTimestamp": "2025-01-20T14:30:00Z"
}
```

**Failed Verification:**

```json
{
  "valid": false,
  "message": "Certificate not found or invalid",
  "verificationTimestamp": "2025-01-20T14:30:00Z"
}
```
