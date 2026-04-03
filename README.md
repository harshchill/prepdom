# Prepdom

Prepdom is a student-first platform where learners upload exam papers, extract structured question JSON with Gemini, unlock papers using coins, and generate mock papers.

## Authentication Setup

This project uses **NextAuth.js v4** with **Google OAuth only**.

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

Create a local env file from [.env.example](.env.example):

```bash
cp .env.example .env.local
```

Required variables:

- `MONGODB_URI`: MongoDB connection string
- `NEXTAUTH_URL`: App URL (for local: `http://localhost:3000`)
- `NEXTAUTH_SECRET`: Long random secret used by NextAuth JWT and cookies
- `GOOGLE_CLIENT_ID`: Google OAuth client id
- `GOOGLE_CLIENT_SECRET`: Google OAuth client secret

### 3. Google OAuth Console configuration

In Google Cloud Console:

- Create OAuth credentials (Web application)
- Add Authorized JavaScript origin: `http://localhost:3000`
- Add Authorized redirect URI: `http://localhost:3000/api/auth/callback/google`

### 4. Run the app

```bash
npm run dev
```

## Auth Routes and Pages

- Sign-in page: `/user/login`
- OAuth endpoint: `/api/auth/[...nextauth]`
- Protected dashboard: `/user/dashboard`

## Notes

- Session strategy is JWT.
- User records are synced to MongoDB on successful Google sign-in.
- Referral code is auto-generated for users who do not already have one.
- Proxy currently protects selected private routes (`/user/dashboard`).
