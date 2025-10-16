# Firebase Auth Backend

A NestJS backend application with Firebase Authentication integration.

## Setup Instructions

### 1. Firebase Configuration

#### Option A: Using Environment Variables (Recommended)

Create a `.env` file in the root directory with your Firebase credentials:

```env
# Firebase Configuration
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY_HERE\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project-id.iam.gserviceaccount.com
FIREBASE_WEB_API_KEY=your-web-api-key

# Application Configuration
PORT=3000
NODE_ENV=development
```

#### Option B: Using Service Account JSON

Replace the dummy `firebase-service-account.json` file with your actual Firebase service account JSON file.

### 2. Getting Firebase Credentials

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Go to Project Settings > Service Accounts
4. Click "Generate new private key"
5. Download the JSON file
6. Extract the following values:
   - `project_id` → `FIREBASE_PROJECT_ID`
   - `private_key` → `FIREBASE_PRIVATE_KEY`
   - `client_email` → `FIREBASE_CLIENT_EMAIL`
7. For Web API Key:
   - Go to Project Settings > General
   - Copy the "Web API Key"

### 3. Installation

```bash
npm install
```

### 4. Running the Application

```bash
# Development
npm run start:dev

# Production
npm run start:prod
```

## API Endpoints

- `POST /auth/signup` - Create new user
- `POST /auth/signin` - Sign in user
- `POST /auth/signout` - Sign out user
- `GET /auth/profile` - Get user profile (requires authentication)

## Authentication

Use the `Authorization: Bearer <firebase-id-token>` header for protected endpoints.

## Environment Variables

| Variable | Description |
|----------|-------------|
| `FIREBASE_PROJECT_ID` | Your Firebase project ID |
| `FIREBASE_PRIVATE_KEY` | Service account private key |
| `FIREBASE_CLIENT_EMAIL` | Service account client email |
| `FIREBASE_WEB_API_KEY` | Firebase Web API key |
| `PORT` | Application port (default: 3000) |
| `NODE_ENV` | Environment (development/production) |