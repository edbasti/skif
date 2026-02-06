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
5. Set **Firestore rules**: in Firebase Console go to **Firestore Database → Rules**, then paste and publish the contents of `firestore.rules` in this repo (or deploy with Firebase CLI). Without these rules, the Setup page and sign-in will get "Missing or insufficient permissions".
6. **Configure CORS for Storage** (required for carousel uploads from the browser): Firebase Storage is backed by Google Cloud Storage. To allow uploads from your app origin (e.g. `http://localhost:5173`), set CORS on the bucket once:

   - Install [Google Cloud SDK](https://cloud.google.com/sdk/docs/install) and run `gcloud auth login` (use the same Google account as your Firebase project).
   - From this directory, run (replace `skif-ff3dc` with your Firebase project ID if different):

   ```bash
   gcloud storage buckets update gs://skif-ff3dc.appspot.com --cors-file=storage-cors.json
   ```

   If your Storage bucket uses a different name (e.g. `your-project.firebasestorage.app`), use that as the bucket name. To list buckets: `gcloud storage buckets list`. When you deploy to production, add your production origin (e.g. `https://your-site.netlify.app`) to `storage-cors.json` and run the same command again.
7. Copy `.env.example` to `.env` and fill in your Firebase web app config values.

```bash
cp .env.example .env
```

## Run

```bash
npm install
npm run dev
```

## Seed an admin + player (optional)

1. Set `VITE_SETUP_SECRET` in `.env`
2. Visit `/setup` and enter the secret + the two accounts’ emails/passwords

## Roles (admin vs player)

- Users are stored in Firestore under `users/{uid}` with a `role` field.
- The Sign Up screen supports creating **player** accounts, and **admin** accounts if `VITE_ADMIN_INVITE_CODE` is set and provided.
- You can also manually promote a user by changing `users/{uid}.role` to `"admin"` in Firestore.
