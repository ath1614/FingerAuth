# FingerAuth Demo

A fingerprint verification demo app built for internship assignment.

## Tech Stack

- **Frontend**: React Native (Expo Go)
- **Backend**: Node.js + Express
- **Fingerprint Logic**: Image similarity matching

## Project Structure

```
FingerAuth/
├── frontend/          # React Native app
│   ├── src/
│   │   ├── screens/   # App screens
│   │   ├── components/
│   │   └── utils/
│   └── App.js
├── backend/           # Node.js API
│   ├── server.js
│   └── uploads/       # Fingerprint images
└── README.md
```

## Features

- **Landing Screen**: Navigation to enrollment/authentication
- **Enrollment**: Capture and store fingerprint
- **Authentication**: Verify against enrolled fingerprints
- **Result Screen**: Display success/failure with actions

## Setup

### Frontend
```bash
cd frontend
npm install
npm start
```

### Backend
```bash
cd backend
npm install
npm start
```

## API Endpoints

- `POST /api/enroll` - Enroll fingerprint
- `POST /api/authenticate` - Authenticate fingerprint
- `GET /api/enrolled` - Get enrolled count
- `DELETE /api/clear` - Clear all enrolled fingerprints

## Demo Features

- Image capture via camera
- Basic similarity matching
- Clean enterprise UI
- Expo Go compatible