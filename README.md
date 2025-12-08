# Bacterial Pathogen Analyzer

A professional mobile application for identifying Burkholderia pseudomallei bacteria using React Native, Expo, Supabase, and AI-powered analysis. Built for laboratory technicians and medical professionals.

## 🔬 Overview

The Bacterial Pathogen Analyzer is a comprehensive diagnostic tool designed to assist healthcare professionals in identifying Burkholderia pseudomallei, the causative agent of melioidosis. The application provides a guided workflow for bacterial analysis, image capture, and AI-powered identification with confidence scoring.

## ✨ Features

### 🧪 Core Functionality

- **Multi-step Analysis Workflow**: Guided 4-step process for bacterial identification
  - Bacterial characteristics selection
  - Culture medium identification
  - High-quality image capture
  - Colony age specification
- **Camera Integration**: Native camera support with gallery fallback
- **AI-Powered Analysis**: Mock ML analysis with configurable confidence scores (ready for production ML integration)
- **Comprehensive Reporting**: Detailed analysis reports with images and metadata
- **Analysis History**: Complete history with filtering and search capabilities
- **Data Export**: Export analysis data for external review

### 🔐 Authentication & Security

- **Supabase Authentication**: Email/password registration and login
- **Row Level Security (RLS)**: Database-level security for user data isolation
- **Secure Image Storage**: Encrypted image storage with signed URLs
- **User Session Management**: Automatic token refresh and session persistence
- **Account Management**: Profile editing, password updates, and account deletion

### 📱 User Experience

- **Professional Design**: Medical-grade interface with lime accent colors
- **Accessibility**: High contrast ratios and readable typography
- **Cross-platform**: Native iOS and Android support via React Native
- **Responsive Design**: Optimized for various screen sizes
- **Offline Capability**: Local data caching for network resilience

### 🎨 Design System

- **Custom Theme**: Professional lime (#B6E92D) and white-smoke (#F2F2F2) color palette
- **Inter Font Family**: Optimized for medical/scientific readability
- **Modular Components**: Reusable UI components with consistent styling
- **Micro-interactions**: Smooth animations and transitions

## 🛠 Technology Stack

### Frontend

- **React Native 0.81.4** with TypeScript
- **Expo SDK 54** for rapid development and deployment
- **Expo Router 6.0** for file-based navigation
- **React Native Reanimated** for smooth animations
- **Expo Camera 17.0** for image capture functionality
- **Lucide React Native** for consistent iconography

### Backend & Database

- **Supabase** for authentication, database, and storage
- **PostgreSQL** with Row Level Security (RLS)
- **Real-time subscriptions** for live data updates
- **Supabase Storage** for secure image handling

### Development Tools

- **TypeScript** for type safety
- **Expo CLI** for development workflow
- **ESLint & Prettier** for code quality

## 🚀 Quick Start

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
```

2. **Environment Setup**
   Create a `.env` file in the root directory:

```env
EXPO_PUBLIC_SUPABASE_URL=your_supabase_project_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
EXPO_PUBLIC_API_URL=http://localhost:3001
```

3. **Supabase Configuration**

#### Database Setup

The application includes pre-built migrations. Run these in your Supabase SQL editor:

```sql
-- The migrations are located in supabase/migrations/
-- Run them in order:
-- 1. 20250622041524_foggy_lantern.sql (main schema)
-- 2. 20250902120536_graceful_moon.sql (colony age column)
-- 3. 20250915191000_add_delete_user_function.sql (user deletion)
```

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

## 🔧 Configuration

### Environment Variables

```env
# Required - Supabase Configuration
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_anon_key

# Optional - Development API
EXPO_PUBLIC_API_URL=http://localhost:3001

# Production - Additional configurations
EXPO_PUBLIC_SENTRY_DSN=your_sentry_dsn
EXPO_PUBLIC_ANALYTICS_ID=your_analytics_id
```

### Supabase Setup Checklist

- [ ] Create new Supabase project
- [ ] Run database migrations in order
- [ ] Configure authentication settings
- [ ] Set up SMTP for email delivery (production)
- [ ] Configure storage bucket policies
- [ ] Set up Row Level Security policies
- [ ] Configure site URL and redirect URLs

## 🧪 Analysis Workflow

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

## 📊 Database Schema

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

## 🚀 Deployment

### Mobile App Deployment

#### iOS App Store

```bash
# Build for iOS
eas build --platform ios --profile production

# Submit to App Store
eas submit --platform ios
```

#### Google Play Store

```bash
# Build for Android
eas build --platform android --profile production

# Submit to Play Store
eas submit --platform android
```

### Backend Deployment

- **Database**: Supabase (managed PostgreSQL)
- **Storage**: Supabase Storage (S3-compatible)
- **Authentication**: Supabase Auth
- **API**: Mock server for development (replace with production ML service)

### Environment Configuration

#### Development

```json
{
  "expo": {
    "extra": {
      "eas": {
        "projectId": "f144ea13-2608-4503-9bee-09221635cb32"
      }
    }
  }
}
```

#### Production

- Configure production Supabase project
- Set up custom SMTP for email delivery
- Configure analytics and error tracking
- Set up CI/CD pipeline with EAS

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

## 🔮 Future Enhancements

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

## 📞 Support & Maintenance

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

## 🙏 Acknowledgments

- **Supabase**: Backend infrastructure and authentication
- **Expo**: React Native development platform
- **Lucide**: Icon library
- **Inter Font**: Typography design

---

**Bacterial Pathogen Analyzer v1.0.0**  
Professional diagnostic tool for laboratory use  
Built with React Native, Expo, Supabase, and modern web technologies

For technical documentation and API references, see the `/docs` directory.
