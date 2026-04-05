# Prepdom (Vault)

[![Next.js](https://img.shields.io/badge/Next.js-16.2.1-black)](#)
[![React](https://img.shields.io/badge/React-19.2.4-149eca)](#)
[![MongoDB](https://img.shields.io/badge/Database-MongoDB-13aa52)](#)
[![Supabase Storage](https://img.shields.io/badge/File%20Storage-Supabase-3ecf8e)](#)
[![Gemini](https://img.shields.io/badge/AI-Gemini%202.5%20Flash-4285f4)](#)

Prepdom is a student-focused exam preparation platform where users can:

- Upload previous-year papers (PDF)
- Parse papers into structured JSON using Gemini
- Earn and spend in-app coins
- Unlock and read approved papers in a protected reader
- Generate AI mock papers and MCQ tests (premium)
- Get AI-assisted MCQ performance reports

The brand in UI is often shown as **Vault**, while the repository/app identity is **Prepdom**.

## Table Of Contents

- [What This Project Solves](#what-this-project-solves)
- [Core Features](#core-features)
- [Tech Stack](#tech-stack)
- [Architecture At A Glance](#architecture-at-a-glance)
- [Project Structure](#project-structure)
- [Data Model](#data-model)
- [Environment Variables](#environment-variables)
- [Local Setup](#local-setup)
- [Google OAuth Setup](#google-oauth-setup)
- [How Key Workflows Work](#how-key-workflows-work)
- [Routes And APIs](#routes-and-apis)
- [Coin Economy Rules](#coin-economy-rules)
- [Premium Access Rules](#premium-access-rules)
- [Security And Access Control](#security-and-access-control)
- [Troubleshooting](#troubleshooting)
- [Known Gaps / Notes](#known-gaps--notes)
- [Development Commands](#development-commands)
- [Suggested Next Improvements](#suggested-next-improvements)

## What This Project Solves

Students often struggle to find quality exam papers and practice with realistic patterns. Prepdom creates a contribution-driven loop:

- Students upload useful papers.
- AI validates and structures papers.
- Community gets a searchable paper library.
- Coins reward contribution and regulate access.
- Premium users get AI practice tools (mock papers and MCQ analytics).

## Core Features

### 1) Authentication And User Sync

- Google OAuth via NextAuth
- JWT session strategy
- Auto user creation on first login with:
	- `100` signup bonus coins
	- generated referral code
	- default free plan

### 2) Paper Upload + AI Parsing Pipeline

- User uploads PDF to Supabase Storage
- `/api/parse-pdf` uses Gemini (`gemini-2.5-flash`) to extract strict exam JSON
- Server action stores:
	- paper metadata
	- extraction payload
	- publication/rejection status

### 3) Library + Unlocks

- Approved papers are listed in `/api/library/papers`
- Users unlock papers for coins (`8` coins per paper)
- Unlock is transaction-safe and idempotent
- Reader loads PDF through authenticated stream endpoint

### 4) Save, Dashboard, Leaderboard, Wallet

- Save papers for quick revision
- Wallet shows live transaction history and stats
- Contributor leaderboard scoring:
	- `10` points per published upload
	- `2` points per unlock
	- `1` point per save

### 5) Premium AI Tools

- Plan tiers: `free`, `premium`, `premium_plus`
- Mock paper generation from extracted source papers
- Fixed-size MCQ test generation (`20` questions)
- Deterministic scoring + AI report generation

## Tech Stack

### Frontend

- Next.js 16 (App Router)
- React 19
- Tailwind CSS 4
- Framer Motion
- Lucide React

### Backend / Platform

- Next.js Route Handlers and Server Actions
- NextAuth v4 (Google provider)
- MongoDB + Mongoose
- Supabase Storage (PDF files)
- Google Gemini API

### Tooling

- ESLint 9 + `eslint-config-next/core-web-vitals`

## Architecture At A Glance

```text
Browser UI (App Router pages + client components)
	 |
	 +--> Server Actions (upload, admin moderation, plan selection, referral, wallet)
	 |
	 +--> Route Handlers (/api/*)
						|
						+--> MongoDB (users, papers, unlocks, transactions, saved, extractions, generations)
						+--> Supabase Storage (PDF upload/download)
						+--> Gemini API (parse PDF, generate mock paper, MCQ, report)
```

## Project Structure

High-level map:

- `app/`
	- UI pages and layouts
	- `api/` route handlers
	- `actions/` server actions
	- `components/` reusable client/server components
- `lib/`
	- auth, db connection, models
	- premium and library configs
	- Gemini integration + response schemas
	- Supabase clients
- `public/`
	- static assets

Important folders:

- `app/user/*`: student-facing pages (dashboard, library, wallet, saves, unlocks, profile)
- `app/admin/papers`: moderation panel
- `app/premium/*`: premium features (plan, AI tutor, mock paper)
- `app/api/library/*`: library listing, unlock, protected PDF stream
- `lib/models/*`: MongoDB domain model layer

## Data Model

Main collections in MongoDB:

### `users`

- auth identity (`email`, `googleId`)
- role (`student` | `admin`)
- economy and plan (`coins`, `isPremium`, `planTier`)
- referral fields (`referralCode`, `referredBy`)
- profile fields (`university`, `program`, `specialization`, `semester`)

### `papers`

- uploader and academic metadata
- storage metadata (`fileUrl`, `storagePath`, `fileBucket`, `mimeType`)
- moderation lifecycle (`pending`, `published`, `rejected`, ...)
- extraction flags (`hasExtraction`, `extractionStatus`, `isExamPaper`)
- engagement counters (`unlockCount`, `saveCount`)

### `paper_extractions`

- one extraction record per paper
- parsed structured JSON from Gemini
- extraction status + failure reasons

### `unlocks`

- user-paper unlock relation
- unique compound index (`user`, `paper`)
- coin spend linkage to source transaction

### `coin_transactions`

- immutable credit/debit ledger with:
	- reason (`unlock`, `reward`, `purchase`, `bonus`, ...)
	- before/after balances
	- optional links to paper/unlock

### `saved`

- user saved-paper relation for revision lists

### `mockpapergenerations`

- generated mock paper JSON
- optional generated MCQ test JSON
- generation metadata and model tracking

## Environment Variables

Copy and start from `.env.example`:

```bash
cp .env.example .env.local
```

Required variables:

| Variable | Required | Purpose |
| --- | --- | --- |
| `MONGODB_URI` | Yes | MongoDB connection |
| `NEXTAUTH_URL` | Yes | Public app URL (local: `http://localhost:3000`) |
| `NEXTAUTH_SECRET` | Yes | NextAuth JWT/cookie signing secret |
| `GOOGLE_CLIENT_ID` | Yes | Google OAuth client id |
| `GOOGLE_CLIENT_SECRET` | Yes | Google OAuth client secret |
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase project URL (client) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase anon key (client upload) |
| `NEXT_PUBLIC_SUPABASE_BUCKET` | Yes | Supabase bucket for papers |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Supabase server key for protected downloads |
| `SUPABASE_URL` | Optional | Explicit server Supabase URL override |
| `GEMINI_API_KEY` | Yes | Gemini API key for parsing/generation |

Note: `GEMINI_API_KEY` is used in code and required for AI flows, but it is not currently listed in `.env.example`. Add it manually.

## Local Setup

### Prerequisites

- Node.js 20+ recommended
- MongoDB instance
- Supabase project and storage bucket
- Google OAuth credentials
- Gemini API key

### Install + run

```bash
npm install
npm run dev
```

Open:

```text
http://localhost:3000
```

### Build checks

```bash
npm run lint
npm run build
npm run start
```

## Google OAuth Setup

In Google Cloud Console:

1. Create OAuth client credentials (Web application)
2. Add JavaScript origin:
	 - `http://localhost:3000`
3. Add redirect URI:
	 - `http://localhost:3000/api/auth/callback/google`

## How Key Workflows Work

### A) New user sign-in

1. User signs in with Google.
2. User record is created/updated in MongoDB.
3. On first creation:
	 - gets `100` bonus coins
	 - gets unique referral code
4. JWT/session carries user role, coins, plan, and referral code.

### B) Upload and moderation

1. Client uploads PDF to Supabase.
2. `/api/parse-pdf` extracts structured exam data using Gemini.
3. Server action persists `Paper` and `PaperExtraction`.
4. Paper auto transitions to:
	 - `published` if valid exam paper
	 - `rejected` if invalid/non-exam/parse failure
5. Admin can review pending items at `/admin/papers`.
6. Admin approval can award uploader `20` coins if reward not granted before.

### C) Unlock and read

1. User browses approved papers via `/api/library/papers`.
2. User spends coins via `/api/library/unlock`.
3. Unlock + coin debit + ledger entries are transactionally committed.
4. Reader opens `/api/library/papers/[paperId]/pdf` only for unlocked papers.

### D) Premium mock exam pipeline

1. Paid user requests mock generation.
2. Server validates plan tier and source paper extraction context.
3. Gemini generates mock paper JSON.
4. Optional MCQ test is generated (`20` questions).
5. User submits answers.
6. Server computes deterministic result and requests AI report summary.

## Routes And APIs

### Main Pages

- `/` landing page
- `/user/login` auth entry
- `/user/dashboard` personal dashboard
- `/user/library` paper library
- `/user/library/[paperId]` protected reader
- `/user/uploads` upload papers
- `/user/wallet` wallet and coin actions
- `/user/profile` profile management
- `/user/saves` saved papers
- `/user/unlocks` unlocked papers
- `/user/leaderboard` contributor leaderboard
- `/admin/papers` admin moderation
- `/premium/plan` plan selector
- `/premium/mock-paper` mock paper tools
- `/premium/ai-tutor` tutor UI shell

### API Endpoints

- `GET|POST /api/auth/[...nextauth]` NextAuth handlers
- `GET /api/user/navbar` live user summary for navbar
- `POST /api/parse-pdf` parse uploaded PDF via Gemini
- `GET /api/library/papers` filtered paper listing
- `POST /api/library/unlock` coin-based unlock
- `GET /api/library/papers/[paperId]/pdf` protected stream
- `POST /api/premium/mock-paper` generate mock paper
- `POST /api/premium/mock-paper/mcq` generate MCQ test
- `POST /api/premium/mock-paper/mcq/report` generate performance report

## Coin Economy Rules

- Signup bonus: `+100`
- Referral reward: `+50` for both inviter and invitee
- Paper unlock: `-8` coins
- Admin approval reward for upload: `+20` coins
- Purchase packs (wallet UI):
	- 100 coins
	- 200 coins
	- 500 coins

All economy-impacting actions write to `coin_transactions` for auditability.

## Premium Access Rules

Plan tiers in code:

- `free`
- `premium`
- `premium_plus`

Capabilities:

- AI Tutor: paid tiers
- Mock paper generation: paid tiers
- All papers free access: `premium_plus`

## Security And Access Control

- Proxy-based auth guard on `/user/:path*`
- NextAuth JWT-backed sessions
- API handlers verify session before protected operations
- PDF stream endpoint checks unlock ownership before serving file
- Mongoose transaction usage in coin + unlock critical path

## Troubleshooting

### Login loop or auth errors

- Confirm `NEXTAUTH_URL` and `NEXTAUTH_SECRET`
- Verify Google OAuth redirect URI exactly matches local URL

### Upload succeeds but parse fails

- Check `GEMINI_API_KEY`
- Validate PDF is readable and text-rich
- Ensure uploaded file URL is from your Supabase project

### Cannot open unlocked PDF

- Confirm `SUPABASE_SERVICE_ROLE_KEY`
- Check paper has valid `fileBucket` and `storagePath`
- Ensure unlock record exists for the current user

### Empty library

- Library only returns papers with `status = published`
- Confirm paper moderation outcome and extraction status

## Known Gaps / Notes

- `.env.example` currently does not include `GEMINI_API_KEY`.
- AI Tutor client calls `/api/auth/chat`, but this route is not present in this repository snapshot.
- `proxy.js` currently guards `/user/:path*`; admin route checks are handled in page logic.

## Development Commands

```bash
npm run dev    # start dev server
npm run lint   # run eslint
npm run build  # create production build
npm run start  # run production server
```

## Suggested Next Improvements

1. Add `GEMINI_API_KEY` to `.env.example`.
2. Implement or reconnect the missing AI tutor backend endpoint (`/api/auth/chat`).
3. Add automated tests for unlock transaction integrity and parse pipeline error states.
4. Introduce role-based middleware guard for `/admin/*` at proxy layer.
5. Add observability hooks (request ids, structured logs, timing metrics).

---

If you are onboarding contributors, start with:

1. [Environment Variables](#environment-variables)
2. [Local Setup](#local-setup)
3. [How Key Workflows Work](#how-key-workflows-work)
4. [Routes And APIs](#routes-and-apis)
