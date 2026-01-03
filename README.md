# Bacterial Pathogen Analyzer

A professional mobile application for identifying Burkholderia pseudomallei bacteria using React Native, Expo, Supabase, and AI-powered analysis. Built for laboratory technicians and medical professionals.

## Overview

The Bacterial Pathogen Analyzer is a diagnostic mobile application designed for laboratory technicians and clinicians to assist in identifying Burkholderia pseudomallei, the pathogen responsible for melioidosis.
Built using React Native + Expo, with Supabase powering authentication, data storage, and secure workflows.

## Features

### 🔬 Core Diagnostic Functionality

- **Hybrid AI Analysis Engine**:
  - **Visual Analysis**: Utilizes **EfficientNetB0** (TensorFlow/Keras) for state-of-the-art image classification of colony morphology.
  - **Metadata Integration**: Processes clinical metadata (Agar type, Colony age, Characteristics) via a Multi-Layer Perceptron (MLP).
  - **Real-time Inference**: Delivers instant diagnostic predictions with confidence intervals.
- **Smart Image Processing**:
  - **Intelligent Capture**: Native camera integration with auto-focus and flash control.
  - **Preprocessing Pipeline**: Automatic cropping, grayscale conversion, and normalization to ensure consistent analysis quality.
- **Structured Analysis Workflow**: Guided 4-step process ensuring standardized data collection:
  1. **Bacterial Characteristics**: Selection of key morphological traits.
  2. **Culture Medium**: Identification of growth substrate (e.g., Ashdown Agar).
  3. **High-Fidelity Capture**: Image acquisition with quality checks.
  4. **Colony Aging**: Temporal data for precise growth stage analysis.

### 🛡️ Authentication & Security

- **Enterprise-Grade Identity Management**:
  - **Supabase Authentication**: Secure email/password flows with JWT session management.
  - **Row Level Security (RLS)**: Strict database policies ensuring complete data isolation and privacy.
- **Encrypted Data Storage**:
  - **Secure Asset Management**: AES-256 encrypted storage for sensitive clinical images.
  - **Signed Access URLs**: Temporary, time-bounded access links for enhanced security.
- **Account Control**: Comprehensive profile management including secure password updates and data purging capabilities.

### 📱 Professional User Experience

- **Clinical Interface Design**:
  - **Medical Aesthetics**: Clean, high-contrast "Lime & Smoke" theme optimized for laboratory environments.
  - **Responsive Layouts**: Adaptive design ensuring usability across various mobile devices.
- **Analysis History & Insights**:
  - **Smart Filtering**: Quickly filter results by Positive/Negative classifications.
  - **Detailed Reporting**: Comprehensive history view with re-analysis capabilities.
- **Offline Resilience**: Local data caching ensuring continuity in low-connectivity lab settings.

## 🛠 Technology Stack

### Frontend Application
- **Framework**: React Native 0.81.4 (via Expo SDK 54)
- **Language**: TypeScript 5.x
- **Navigation**: Expo Router 6.0 (File-based routing)
- **UI/UX**: 
  - **React Native Reanimated**: Fluid, 60fps animations.
  - **Lucide React Native**: Consistent clinical iconography.
  - **Expo Camera**: Advanced image capture and manipulation.

### AI & Backend Infrastructure
- **Machine Learning**: 
  - **TensorFlow & Keras**: Core Deep Learning framework.
  - **EfficientNetB0**: Optimized CNN architecture for image classification.
  - **Scikit-learn**: Data preprocessing and encoding pipelines.
- **API Server**: 
  - **Python Flask**: Lightweight, high-performance WSGI server.
  - **Gunicorn**: Production-grade HTTP server.
  - **Hosting**: Deployed on **Render Cloud** for high availability.
- **Database & Auth**:
  - **Supabase**: Managed PostgreSQL with Real-time capabilities.
  - **PostgreSQL**: Robust relational database engine.

### Development & Quality Assurance
- **Versioning**: Git & GitHub
- **Linting**: ESLint & Prettier
- **Build System**: EAS (Expo Application Services) for CI/CD

## Quick Start

### Prerequisites

- Node.js 18+ and npm
- Expo CLI (`npm install -g @expo/cli`)
- iOS Simulator (macOS) or Android Studio
- Supabase account

### Installation

1. **Clone and install dependencies**

```bash
git clone https://github.com/ojasvatstyagi/BacterialPathogenAnalyzer.git
cd BacterialPathogenAnalyzer
npm install
expo install expo-image-manipulator
```

## 📁 Project Structure

```
bacterial-pathogen-analyzer/
├── app/                          # Expo Router pages
│   ├── (auth)/                  # Authentication screens
│   │   ├── login.tsx           # Login screen
│   │   ├── register.tsx        # Registration screen
│   │   └── _layout.tsx         # Auth layout
│   ├── (tabs)/                 # Main app tabs
│   │   ├── index.tsx           # Home dashboard
│   │   ├── analyze/            # Analysis workflow
│   │   │   ├── index.tsx       # Analysis start
│   │   │   ├── characteristics.tsx
│   │   │   ├── media.tsx
│   │   │   ├── capture.tsx
│   │   │   ├── colony-age.tsx
│   │   │   └── results.tsx
│   │   ├── history.tsx         # Analysis history
│   │   ├── profile/            # User profile
│   │   │   ├── index.tsx
│   │   │   └── edit-profile.tsx
│   │   └── _layout.tsx         # Tab layout
│   ├── _layout.tsx             # Root layout
│   └── +not-found.tsx          # 404 page
├── components/                  # Reusable components
│   └── ui/                     # Base UI components
│       ├── Button.tsx
│       ├── Card.tsx
│       ├── Checkbox.tsx
│       ├── Input.tsx
│       └── TopBar.tsx
├── constants/                   # App constants
│   └── theme.ts                # Design system
├── context/                     # React context
│   └── AuthContext.tsx         # Authentication state
├── hooks/                       # Custom hooks
│   └── useFrameworkReady.ts    # Framework initialization
├── lib/                        # Utility libraries
│   └── supabase.ts            # Supabase client
├── server/                     # Mock API server
│   └── index.js               # Express server for development
├── supabase/                   # Database migrations
│   └── migrations/            # SQL migration files
├── types/                      # TypeScript definitions
│   └── env.d.ts               # Environment types
└── README.md
```

## Configuration

1. **Environment Setup**
   Create a `.env` file in the root directory:

```env
EXPO_PUBLIC_SUPABASE_URL=your_supabase_project_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
# Production ML Endpoint
EXPO_PUBLIC_API_URL=https://bacterialpathogenanalyzer.onrender.com
```

⚠️ Do NOT commit your .env file.

Expo loads these automatically for expo start, but EAS cloud builds do not use `.env`
→ See next section for production builds.

2. **Production Build: EAS Build Configuration**

Expo now uses EAS Environment Variables instead of storing secrets locally.

1. Create Secrets for cloud builds:
   Run the following commands and enter values when prompted:

```bash
eas secret:create EXPO_PUBLIC_SUPABASE_URL your_supabase_project_url
eas secret:create EXPO_PUBLIC_SUPABASE_ANON_KEY your_supabase_anon_key
eas secret:create EXPO_PUBLIC_API_URL http://localhost:3001
```

Why EAS Secrets?

1. `.env` is NOT included in EAS cloud builds for security.
2. EAS Secrets securely store environment variables for production builds.
3. Ensures consistent builds across devices and CI

### Build with EAS

```bash
eas build --platform ios --profile preview
eas build --platform android --profile preview
```

Or for production:

```bash
eas build --platform ios --profile production
eas build --platform android --profile production
```

4. **Supabase Configuration**

### Database Setup

The application includes pre-built migrations. Run these in your Supabase SQL editor:

```sql
-- The migrations are located in supabase/migrations/
-- Run them in order:
-- 1. 20250622041524_foggy_lantern.sql (main schema)
-- 2. 20250902120536_graceful_moon.sql (colony age column)
-- 3. 20250915191000_add_delete_user_function.sql (user deletion)
```

## Database Schema

### Tables

#### `analyses`

- `id` (UUID, Primary Key)
- `user_id` (UUID, Foreign Key → auth.users)
- `characteristics` (Text Array)
- `culture_medium` (Text)
- `colony_age` (Text)
- `image_url` (Text, Nullable)
- `result` (Text, Nullable)
- `confidence` (Decimal, 0.0-1.0)
- `created_at` (Timestamp)

### Storage Buckets

- `colony-images`: Secure storage for bacterial colony images

### Functions

- `get_user_analysis_stats()`: User statistics aggregation
- `delete_user()`: Complete user data deletion

### Supabase Setup Checklist

- [ ] Create new Supabase project
- [ ] Run database migrations in order
- [ ] Configure authentication settings
- [ ] Set up SMTP for email delivery (production)
- [ ] Configure storage bucket policies
- [ ] Set up Row Level Security policies
- [ ] Configure site URL and redirect URLs

#### Authentication Settings

1. Go to Supabase Dashboard → Authentication → Settings
2. **Email Confirmations**: Enable if you want email verification
3. **Site URL**: Set to your app's URL (development: `exp://localhost:8081`)
4. **SMTP Settings**: Configure for production email delivery

#### Storage Setup

1. Go to Storage in Supabase Dashboard
2. The `colony-images` bucket is created automatically via migration
3. Verify RLS policies are in place for user data isolation

4. **Start Development**

```bash
# Start the development server
npm run dev

# For specific platforms
npm run ios     # iOS simulator
npm run android # Android emulator
npm run web     # Web browser
```

## Analysis Workflow

### Step 1: Bacterial Characteristics

- **Required**: Gram Negative bacilli, Oxidase positive
- **Optional**: Bipolar appearance
- Progress tracking with validation

### Step 2: Culture Medium Selection

- Blood Agar
- MacConkey Agar
- Nutrient Agar
- Ashdown Agar (recommended for B. pseudomallei)

### Step 3: Image Capture

- Native camera integration
- Gallery selection fallback
- Image quality validation
- Secure upload to Supabase Storage

### Step 4: Colony Age Specification

- 24 hours (young colonies)
- 48 hours (optimal for analysis)
- 72 hours (well-developed)
- 96 hours (older colonies)

### Results & Analysis

- AI-powered identification (mock implementation)
- Confidence scoring (80-95% range)
- Detailed analysis summary
- Save to history or send to laboratory

## 🔒 Security Features

### Authentication

- Email/password authentication via Supabase Auth
- Secure session management with automatic refresh
- Password strength validation
- Account verification (configurable)

### Data Protection

- Row Level Security (RLS) for all user data
- Encrypted image storage with signed URLs
- User data isolation at database level
- Secure API endpoints with authentication

### Privacy

- User data export functionality
- Complete account deletion
- GDPR-compliant data handling
- No third-party tracking (configurable)

### Backend Deployment

- **Database**: Supabase (managed PostgreSQL)
- **Storage**: Supabase Storage (S3-compatible)
- **Authentication**: Supabase Auth
- **API**: Mock server for development (replace with production ML service)

## 🧪 Testing

### Manual Testing Checklist

- [ ] User registration and login
- [ ] Complete analysis workflow
- [ ] Image capture and upload
- [ ] Analysis history and filtering
- [ ] Profile management
- [ ] Data export functionality
- [ ] Account deletion

### Platform Testing

- [ ] iOS simulator testing
- [ ] Android emulator testing
- [ ] Physical device testing
- [ ] Web browser compatibility (limited)

### Machine Learning Integration

Replace mock analysis with production ML service:

```python
# Example Python ML service integration
from fastapi import FastAPI, File, UploadFile
import tensorflow as tf

app = FastAPI()

@app.post("/analyze")
async def analyze_colony(file: UploadFile = File(...)):
    # Load and preprocess image
    image = await file.read()
    processed = preprocess_image(image)

    # Run ML model
    prediction = model.predict(processed)
    confidence = float(prediction.max())

    result = "Probably Burkholderia pseudomallei" if prediction[0] > 0.5 else "Not Burkholderia pseudomallei"

    return {
        "result": result,
        "confidence": confidence,
        "details": {
            "morphology": "Analysis details...",
            "biochemical": "Biochemical profile...",
            "recommendation": "Clinical recommendations..."
        }
    }
```

### Advanced Features

- **Laboratory Integration**: LIMS system connectivity
- **Batch Processing**: Multiple sample analysis
- **Quality Control**: Internal standards and controls
- **Reporting**: PDF report generation
- **Collaboration**: Multi-user laboratory workflows
- **Audit Trail**: Complete analysis tracking
- **Offline Mode**: Full offline capability with sync

### Analytics & Monitoring

- **Usage Analytics**: User behavior tracking
- **Performance Monitoring**: App performance metrics
- **Error Tracking**: Crash reporting and debugging
- **A/B Testing**: Feature experimentation

## Support & Maintenance

### Technical Support

- **Email**: ojas.vats.tyagi@gmail.com
- **Documentation**: In-app help system
- **Issue Tracking**: GitHub Issues

### Maintenance Schedule

- **Security Updates**: Monthly
- **Feature Updates**: Quarterly
- **Database Maintenance**: Automated via Supabase
- **Performance Monitoring**: Continuous

### Backup & Recovery

- **Database**: Automated daily backups via Supabase
- **Images**: Redundant storage with Supabase Storage
- **User Data**: Export functionality for data portability

## 📄 License

This project is licensed under the MIT License. See LICENSE file for details.

## Acknowledgments

- **Supabase**: Backend infrastructure and authentication
- **Expo**: React Native development platform
- **Lucide**: Icon library
- **Inter Font**: Typography design

## 🚀 Future Roadmap & Investment Opportunities

### Phase 1: Institutional Security & Compliance (Q2 2026)
- **On-Premise Deployment**: Transition from cloud to localized server infrastructure for total data sovereignty.
- **HIPAA/GDPR Compliance Suite**: Enhanced audit logs, role-based access control (RBAC), and data encryption at rest.

### Phase 2: Edge Computing & Performance (Q3 2026)
- **On-Device AI (Edge Inference)**: Implementation of **TensorFlow Lite** models directly on mobile devices.
  - **Zero-Latency**: Instant results without network dependency.
  - **Offline-First**: Critical functionality for rural and austere environments.

### Phase 3: Clinical Interoperability (Q4 2026)
- **LIMS Integration**: Standardized HL7/FHIR interfaces for seamless data exchange with hospital laboratory information systems.
- **Epidemiological Dashboard**: Aggregated, anonymized reporting for regional surveillance of Melioidosis outbreaks.
- **Multi-Pathogen Support**: Expansion of the AI engine to detect other clinically significant bacterial pathogens.

---

**Bacterial Pathogen Analyzer v1.0.0**  
*Precision Diagnostics. Anywhere.*
Built with React Native, Expo, Supabase, and TensorFlow.

For technical partnerships or investment inquiries, please contact:
**Ojas Vats Tyagi** - ojastyagi753@gmail.com