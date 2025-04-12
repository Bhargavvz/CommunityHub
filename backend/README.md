# Residential Community Hub - Backend

This is the backend API for the Residential Community Hub application, built with Express, TypeScript, and Firebase.

## Features

- Authentication using Firebase Auth
- User management (residents, admins)
- Announcements and notifications
- Community events and activities
- Maintenance requests
- Secure role-based permissions

## Prerequisites

- Node.js 14+
- npm or yarn
- Firebase account with Firestore and Authentication enabled

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Set up environment variables:
   ```
   cp .env.example .env
   ```
4. Update `.env` with your Firebase configuration:
   - Get Firebase Admin SDK credentials from Firebase Console > Project Settings > Service Accounts
   - Get Firebase Client SDK credentials from Firebase Console > Project Settings > General > Your Apps

5. Start the development server:
   ```
   npm run dev
   ```
   Or use the provided script:
   ```
   ./scripts/start-dev.sh
   ```

6. The API will be available at http://localhost:8000

## API Endpoints

- **Base**
  - `GET /health` - Server health check
  - `GET /api` - API information

- **Authentication**
  - `POST /api/auth/register` - Register a new user
  - `GET /api/auth/me` - Get current user profile
  - `PUT /api/auth/me` - Update user profile

- **Residents**
  - `GET /api/residents` - Get all residents (admin only)
  - `GET /api/residents/:id` - Get resident by ID (admin or self)
  - `POST /api/residents` - Create a new resident (admin only)
  - `PUT /api/residents/:id` - Update a resident (admin or self)
  - `DELETE /api/residents/:id` - Delete a resident (admin only)

- **Announcements**
  - `GET /api/announcements` - Get all announcements
  - `GET /api/announcements/:id` - Get announcement by ID
  - `POST /api/announcements` - Create a new announcement (admin only)
  - `PUT /api/announcements/:id` - Update an announcement (admin only)
  - `DELETE /api/announcements/:id` - Delete an announcement (admin only)

## Testing

To test basic API endpoints:
```
node scripts/test-api.js
```

## Project Structure

```
backend/
├── src/
│   ├── config/          # Configuration files
│   ├── controllers/     # Request handlers
│   ├── middleware/      # Express middleware
│   ├── models/          # Data models
│   ├── routes/          # API routes
│   ├── services/        # Business logic
│   ├── utils/           # Utility functions
│   └── index.ts         # Entry point
├── scripts/             # Helper scripts
├── .env                 # Environment variables (private)
├── .env.example         # Example environment variables
└── package.json         # Dependencies and scripts
```

## License

MIT 