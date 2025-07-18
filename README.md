# Bacterial Pathogen Analyzer

A professional mobile application for identifying Burkholderia pseudomallei bacteria using React Native, Supabase, and machine learning analysis.

## Features

### 🔬 Core Functionality

- **Multi-step Analysis Workflow**: Guided process for bacterial characteristic selection and culture media identification
- **Camera Integration**: Capture high-quality images of bacterial colonies using device camera
- **Mock AI Analysis**: Simulated machine learning analysis with configurable confidence scores
- **Comprehensive Reporting**: Generate detailed reports with characteristics, media, images, and results
- **Analysis History**: View and filter past analyses with search capabilities

### 🔐 Authentication & Security

- **Supabase Authentication**: Email/password and Google OAuth integration
- **Secure Data Storage**: All data encrypted and stored in Supabase PostgreSQL
- **User Session Management**: Automatic token refresh and session persistence
- **Access Control**: Role-based access for lab technicians and clinicians

### 📱 User Experience

- **Professional Design**: Clean, medical-grade interface with lime accent colors
- **Accessibility**: WCAG 2.1 compliant with high contrast ratios
- **Cross-platform**: Native iOS and Android support via React Native
- **Offline Capability**: Local data caching for network resilience

## Technology Stack

### Frontend

- **React Native 0.79** with TypeScript
- **Expo SDK 53** for rapid development and deployment
- **Expo Router** for file-based navigation
- **React Native Reanimated** for smooth animations
- **Expo Camera** for image capture functionality

### Backend

- **Node.js + Express.js** for API endpoints
- **Supabase** for authentication, database, and storage
- **PostgreSQL** for structured data storage
- **Real-time subscriptions** for live data updates

### Design System

- **Custom theme** with professional lime and white-smoke colors
- **Inter font family** for optimal readability
- **Modular components** with consistent spacing and shadows
- **Responsive layouts** for multiple screen sizes

## Quick Start

### Prerequisites

- Node.js 18+ and npm
- React Native development environment
- iOS Simulator (macOS) or Android Studio
- Supabase account

### Installation

1. **Clone and install dependencies**

```bash
git clone <repository-url>
cd bacterial-pathogen-analyzer
npm install
```

2. **Set up Supabase**
   - Create a new project at [supabase.com](https://supabase.com)
   - Copy your project URL and anon key
   - Update `.env` file with your credentials:

```env
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url_here
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
EXPO_PUBLIC_API_URL=http://localhost:3001
```

3. **Initialize Database**
   Run these SQL commands in your Supabase SQL editor:

```sql
-- Create analyses table
CREATE TABLE analyses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  characteristics TEXT[] NOT NULL,
  culture_medium TEXT NOT NULL,
  image_url TEXT,
  result TEXT,
  confidence DECIMAL(3,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE analyses ENABLE ROW LEVEL SECURITY;

-- Create policy for authenticated users
CREATE POLICY "Users can manage their own analyses" ON analyses
  FOR ALL USING (auth.uid() = user_id);

-- Create storage bucket for images
INSERT INTO storage.buckets (id, name, public)
VALUES ('colony-images', 'colony-images', false);

-- Create storage policy
CREATE POLICY "Users can upload their own images" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'colony-images' AND auth.uid()::text = (storage.foldername(name))[1]);
```

4. **Start the backend server**

```bash
npm run server
```

5. **Start the Expo development server**

```bash
npm run dev
```

6. **Run on device/simulator**
   - Install Expo Go app on your phone
   - Scan the QR code displayed in terminal
   - Or press `i` for iOS simulator, `a` for Android emulator

## Project Structure

```
bacterial-pathogen-analyzer/
├── app/                     # Expo Router pages
│   ├── (auth)/             # Authentication screens
│   ├── (tabs)/             # Main app tabs
│   └── _layout.tsx         # Root layout
├── components/             # Reusable UI components
│   └── ui/                # Base UI components
├── constants/              # App constants and theme
├── context/               # React context providers
├── lib/                   # Utility libraries
├── server/                # Backend API server
├── types/                 # TypeScript type definitions
└── README.md
```

## API Endpoints

The backend provides several mock endpoints for development:

### `POST /api/analyze-image`

Analyzes bacterial colony images and returns identification results.

**Request**: Multipart form with image file
**Response**:

```json
{
  "result": "Probably Burkholderia pseudomallei",
  "confidence": 0.92,
  "analysisId": "analysis_1234567890_abc123",
  "timestamp": "2024-01-15T10:30:00Z",
  "details": {
    "morphology": "Gram-negative bacilli with characteristic bipolar appearance",
    "biochemical": "Oxidase positive, consistent with B. pseudomallei",
    "recommendation": "Further confirmation recommended through molecular methods"
  }
}
```

### `POST /api/send-report`

Sends analysis reports to laboratory for review.

**Request**:

```json
{
  "characteristics": [
    "Gram Negative bacilli",
    "Bipolar appearance",
    "Oxidase positive"
  ],
  "medium": "Ashdown Agar",
  "result": "Probably Burkholderia pseudomallei",
  "confidence": 0.92,
  "userId": "user-id"
}
```

**Response**:

```json
{
  "reportId": "report_1234567890_xyz789",
  "status": "sent",
  "sentTo": "laboratory@hospital.com",
  "priority": "high",
  "estimatedReviewTime": "2-4 hours"
}
```

## Development Workflow

### Adding New Features

1. Create feature branch: `git checkout -b feature/new-feature`
2. Implement changes following existing patterns
3. Test on iOS and Android
4. Update documentation
5. Create pull request

### Testing

- **Manual Testing**: Test on iOS and Android simulators
- **API Testing**: Use provided endpoints for development
- **Database Testing**: Verify Supabase integration
- **Authentication Testing**: Test login/logout flows

### Deployment

1. **Frontend**: Use Expo's build service for app store deployment
2. **Backend**: Deploy Node.js server to your preferred platform
3. **Database**: Supabase handles hosting and scaling automatically

## Configuration

### Environment Variables

```env
# Supabase Configuration
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_anon_key

# API Configuration
EXPO_PUBLIC_API_URL=http://localhost:3001

# Optional: Google OAuth (for production)
GOOGLE_CLIENT_ID=your_google_client_id
```

### Supabase Setup Checklist

- [ ] Create new Supabase project
- [ ] Run database schema SQL
- [ ] Configure authentication providers
- [ ] Set up storage bucket with policies
- [ ] Update RLS policies for your needs
- [ ] Configure OAuth providers (optional)

## Future Enhancements

### Python ML Integration

The app is designed to integrate with a Python machine learning microservice:

1. **Replace Mock API**: Update `/api/analyze-image` to call Python service
2. **Image Processing**: Add preprocessing pipeline for colony images
3. **Model Training**: Implement continuous learning from new samples
4. **Confidence Calibration**: Fine-tune confidence scoring

### Example Python Integration:

```python
# ml_service.py
from fastapi import FastAPI, File, UploadFile
import tensorflow as tf
import numpy as np

app = FastAPI()

@app.post("/analyze")
async def analyze_image(file: UploadFile = File(...)):
    # Load and preprocess image
    image = await file.read()
    processed = preprocess_image(image)

    # Run ML model
    prediction = model.predict(processed)
    confidence = float(prediction.max())

    result = "Probably Burkholderia pseudomallei" if prediction[0] > 0.5 else "Not Burkholderia pseudomallei"

    return {"result": result, "confidence": confidence}
```

## Support

For technical support or questions:

- Review the documentation in this README
- Check the GitHub issues page
- Contact your laboratory administrator
- Email: support@bacterial-analyzer.com

## License

This project is licensed under the MIT License. See LICENSE file for details.

---

**Bacterial Pathogen Analyzer v1.0.0**  
Professional diagnostic tool for laboratory use  
Built with React Native, Supabase, and modern web technologies
