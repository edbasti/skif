# SKIF Bataan (React + Vite + Firebase + Tailwind)

Karate-themed web app with these pages:

- Home (with Firebase-backed carousel)
- Blog
- Events
- Gallery
- My Profile (auth required)
- Admin only:
  - Fund Management (CRUD)
  - Player Profiles (CRUD)

## Requirements

- Node \(recommended\): 20.19+ or 22.12+

## Setup

1. Create a Firebase project in the Firebase Console.
2. Enable **Authentication → Email/Password**.
3. Create **Firestore Database**.
4. Enable **Storage**.
5. Copy `.env.example` to `.env` and fill in your Firebase web app config values.

```bash
cp .env.example .env
```

## Run

```bash
npm install
npm run dev
```

## Roles (admin vs player)

- Users are stored in Firestore under `users/{uid}` with a `role` field.
- The Sign Up screen supports creating **player** accounts, and **admin** accounts if `VITE_ADMIN_INVITE_CODE` is set and provided.
- You can also manually promote a user by changing `users/{uid}.role` to `"admin"` in Firestore.
