# CherifLifestyle

A full-stack e-commerce and portfolio platform for a luxury interior design and art curation business. Built with **Next.js 16**, **MongoDB**, and **NextAuth.js** — featuring an art shop, lifestyle blog, user authentication, admin dashboard, and a WhatsApp-integrated checkout system.

---

## Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Features](#features)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Variables](#environment-variables)
  - [Running the Development Server](#running-the-development-server)
- [Authentication](#authentication)
- [Database](#database)
- [API Reference](#api-reference)
- [Admin Dashboard](#admin-dashboard)
- [Image Uploads](#image-uploads)
- [Deployment](#deployment)
- [Known Limitations](#known-limitations)
- [Contributing](#contributing)

---

## Overview

CherifLifestyle is an elegant web platform built for an Abuja-based luxury interior design and art gallery brand. It allows visitors to browse and acquire curated artworks, read editorial blog posts, and book design consultations. Authenticated users have access to a profile dashboard with order history, saved favourites, and a feedback system.

The checkout flow is WhatsApp-first: orders are logged to the database and then the user is redirected to a pre-filled WhatsApp message to complete the transaction with the studio concierge.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Styling | CSS Modules + CSS Variables |
| Auth | NextAuth.js v4 (Google OAuth + Credentials + Email Magic Link) |
| Database | MongoDB via Mongoose |
| ORM Adapter | `@auth/mongodb-adapter` (for OAuth sessions) |
| Image Storage | Cloudinary |
| Email | Nodemailer (Gmail SMTP) |
| Deployment | Render / Vercel |

---

## Project Structure

```
cheriflifestyle/
├── data/                        # JSON flat-file storage (reviews, feedback, legacy)
│   ├── art.json
│   ├── blog.json
│   ├── feedback.json
│   ├── notifications.json
│   ├── orders.json
│   ├── reviews.json
│   └── users.json
├── public/                      # Static assets (SVGs)
├── src/
│   ├── app/                     # Next.js App Router pages
│   │   ├── about/               # About page
│   │   ├── admin/               # Admin dashboard (password-protected)
│   │   ├── api/                 # API route handlers
│   │   │   ├── admin/login/
│   │   │   ├── art/
│   │   │   ├── auth/            # NextAuth + register + verify + reset
│   │   │   ├── blog/
│   │   │   ├── feedback/
│   │   │   ├── notifications/
│   │   │   ├── orders/
│   │   │   ├── reviews/
│   │   │   └── users/
│   │   ├── auth/                # Sign in / Register / Forgot & Reset password
│   │   ├── blog/[id]/           # Dynamic blog post page
│   │   ├── cart/                # Shopping cart & checkout
│   │   ├── contact/             # Contact form (mailto)
│   │   ├── profile/             # User profile, orders, favourites, feedback
│   │   ├── shop/                # Art collection shop with modal detail view
│   │   ├── globals.css
│   │   ├── layout.tsx           # Root layout (Navbar, Footer, Providers)
│   │   └── page.tsx             # Home page
│   ├── components/
│   │   ├── home/                # Section components (Hero, About, Services, etc.)
│   │   ├── layout/              # Navbar, Footer, NotificationCenter
│   │   └── ui/                  # Button, Modal, Reveal (scroll animation)
│   ├── context/
│   │   ├── CartContext.tsx      # Cart state (localStorage-persisted)
│   │   └── UserContext.tsx      # User/session state (wraps NextAuth)
│   ├── lib/
│   │   ├── cloudinary.ts        # Cloudinary upload helper
│   │   ├── config.ts            # Central APP_CONFIG (contacts, socials, admin fallback)
│   │   ├── data.ts              # Static art data (legacy reference)
│   │   ├── db.ts                # JSON flat-file read/write helpers
│   │   ├── mongodb.ts           # MongoClient singleton (for NextAuth adapter)
│   │   └── mongoose.ts          # Mongoose connection singleton
│   └── models/                  # Mongoose schemas
│       ├── Art.ts
│       ├── Blog.ts
│       ├── Notification.ts
│       ├── Order.ts
│       └── User.ts
├── .gitignore
├── eslint.config.mjs
├── next.config.ts
├── package.json
└── tsconfig.json
```

---

## Features

### Public
- **Homepage** — Hero banner, About section, Services, Featured Projects, Art Collection teaser, Lifestyle Journal preview, Testimonials
- **Shop** — Browse artworks with category filters, favourite items, and a detailed modal with size/frame selection and artwork reviews
- **Blog** — Editorial lifestyle journal with individual post pages
- **About Page** — Studio philosophy and services
- **Contact Page** — Inquiry form (opens `mailto:`) with studio contact details

### Authenticated Users
- **Account** — Google OAuth, email/password with email verification, forgot/reset password flow
- **Profile Dashboard** — Order history, saved favourites, brand feedback submission
- **Notifications** — Real-time notification centre in the navbar (polled every 30 seconds)
- **Cart & Checkout** — Add items with size and frame options, WhatsApp-redirect checkout

### Admin (`/admin`)
- **Orders** — View, approve, or cancel orders
- **Customers** — View registered users and their order counts
- **Art Collection** — Add, edit, delete artworks (Cloudinary image upload)
- **Lifestyle Journal** — Create, edit, delete blog posts (Cloudinary image upload)
- **Service Feedback** — View all user feedback with star ratings
- **Broadcast** — Send hub-wide notifications to all registered members

---

## Getting Started

### Prerequisites

- Node.js `>= 18`
- A MongoDB Atlas cluster (or local MongoDB instance)
- A Cloudinary account
- A Google Cloud project with OAuth 2.0 credentials
- A Gmail account with an app password (for Nodemailer)

### Installation

```bash
# Clone the repository
git clone https://github.com/your-org/cherifs-lifestyle-hub.git
cd cherifs-lifestyle-hub

# Install dependencies
npm install
```

### Environment Variables

Create a `.env.local` file in the project root. **Never commit this file.**

```env
# ─── Database ────────────────────────────────────────────────
MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/cherifs-hub

# ─── NextAuth ────────────────────────────────────────────────
NEXTAUTH_SECRET=your-random-secret-string-here
NEXTAUTH_URL=http://localhost:3000

# ─── Google OAuth ────────────────────────────────────────────
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret

# ─── Email (Gmail SMTP via Nodemailer) ───────────────────────
EMAIL_SERVER_HOST=smtp.gmail.com
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER=your-gmail@gmail.com
EMAIL_SERVER_PASSWORD=your-gmail-app-password
EMAIL_FROM=your-gmail@gmail.com

# ─── Cloudinary ──────────────────────────────────────────────
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# ─── Admin ───────────────────────────────────────────────────
ADMIN_PASSWORD=your-secure-admin-password

# ─── Public Variables ────────────────────────────────────────
NEXT_PUBLIC_CALENDLY_LINK=https://calendly.com/your-link/30min
```

> **Gmail Note:** You must enable 2-Step Verification on your Google account and generate an **App Password** to use as `EMAIL_SERVER_PASSWORD`. Do not use your regular Gmail password.

### Running the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Authentication

Authentication is handled by **NextAuth.js v4** with three providers:

| Provider | Use Case |
|---|---|
| `GoogleProvider` | Sign in with Google (OAuth) |
| `CredentialsProvider` | Email + password sign in |
| `EmailProvider` | Magic link sign in (requires email server config) |

**Registration flow (Credentials):**
1. User submits name, email, and password to `POST /api/auth/register`
2. Password is hashed with `bcryptjs`
3. A verification token is generated and emailed to the user via Nodemailer
4. User clicks the link → `GET /auth/verify-email?token=...` → account is verified
5. User can now sign in

**Password Reset flow:**
1. User submits email to `POST /api/auth/forgot-password`
2. A reset token (valid for 1 hour) is emailed to the user
3. User clicks the link → `/auth/reset-password?token=...&email=...`
4. User submits a new password to `POST /api/auth/reset-password`

**Session strategy:** JWT (stateless). The JWT callback attaches `role`, `id`, and `createdAt` to the token, which are then forwarded to the session.

---

## Database

The project uses **two data layers**:

### MongoDB (Mongoose) — Primary
Used for all transactional and user data. Models are defined in `src/models/`:

| Model | Collection | Description |
|---|---|---|
| `User` | `users` | Registered users, roles, favorites, verification tokens |
| `Art` | `arts` | Artwork listings with Cloudinary image URLs |
| `Blog` | `blogs` | Journal/editorial posts |
| `Order` | `orders` | Customer orders with item snapshots |
| `Notification` | `notifications` | Hub-wide and user-specific notifications |

### JSON Flat Files — Legacy/Secondary
Located in `/data/`. Used for `reviews` and `feedback` via `src/lib/db.ts`. These are read/written directly from the filesystem and **will not persist on stateless deployment platforms** (Vercel Serverless, Render ephemeral storage). 

> ⚠️ **Action required for production:** Migrate `reviews` and `feedback` to MongoDB models to ensure data persistence. The pattern for doing so already exists in the other models.

---

## API Reference

All routes are under `/api/`. Authentication is not enforced at the middleware level — endpoints trust the client for now.

### Art

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/art` | Fetch all artworks |
| `POST` | `/api/art` | Create artwork (multipart/form-data, admin) |
| `PUT` | `/api/art` | Update artwork by `id` (multipart/form-data, admin) |
| `DELETE` | `/api/art?id=` | Delete artwork by ID (admin) |

### Blog

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/blog` | Fetch all blog posts |
| `POST` | `/api/blog` | Create post (multipart/form-data, admin) |
| `PUT` | `/api/blog` | Update post by `id` (multipart/form-data, admin) |
| `DELETE` | `/api/blog?id=` | Delete post by ID (admin) |

### Orders

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/orders` | Fetch all orders |
| `POST` | `/api/orders` | Create a new order |
| `PUT` | `/api/orders` | Update order status by `id` |

### Users

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/users` | Fetch all users (passwords excluded) |
| `POST` | `/api/users` | Toggle favourite (`action: "toggle-favorite"`) |

### Notifications

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/notifications?userId=` | Fetch notifications for user + broadcast |
| `POST` | `/api/notifications` | Create a notification |
| `PUT` | `/api/notifications` | Mark notification as read by user |

### Reviews & Feedback

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/reviews?artId=` | Fetch reviews for a specific artwork |
| `POST` | `/api/reviews` | Submit a review |
| `GET` | `/api/feedback` | Fetch all brand feedback |
| `POST` | `/api/feedback` | Submit brand feedback |

### Auth (Custom Routes)

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/register` | Register a new user |
| `GET` | `/auth/verify-email?token=` | Verify email address |
| `POST` | `/api/auth/forgot-password` | Send password reset email |
| `POST` | `/api/auth/reset-password` | Reset password with token |
| `POST` | `/api/admin/login` | Authenticate admin dashboard access |

---

## Admin Dashboard

The admin dashboard lives at `/admin` and is protected by a simple password check against `ADMIN_PASSWORD` (set via environment variable).

**To access:**
1. Navigate to `yoursite.com/admin`
2. Enter the admin access code (value of `ADMIN_PASSWORD` env var)

The fallback credentials defined in `src/lib/config.ts` under `adminFallback` are for emergency access if the environment variable is not set. **Change these before deploying to production.**

---

## Image Uploads

All user-uploaded images (artworks and blog headers) are uploaded to **Cloudinary** via the `uploadToCloudinary` helper in `src/lib/cloudinary.ts`.

Images are organised into two folders on Cloudinary:
- `art-collection/` — Artwork images
- `journal/` — Blog post header images

The `next.config.ts` whitelist includes `res.cloudinary.com` and `images.unsplash.com` for the Next.js `<Image>` component.

---

## Deployment

### Render (Current)

The app is configured to deploy on Render. Note:
- Set all environment variables in the Render dashboard under **Environment**
- The `/data/` directory is **not** persisted between deploys on Render's ephemeral filesystem. Ensure MongoDB is used for all critical data
- The verification email link is hardcoded to `https://cherifs-lifestyle-hub.onrender.com` in `src/app/api/auth/register/route.ts` — update this to use `NEXTAUTH_URL` dynamically before deploying to a different domain

### Vercel (Alternative)

```bash
npm run build   # Verify build succeeds locally first
vercel deploy
```

Set all `.env.local` variables as Vercel Environment Variables in the project settings.

---

## Known Limitations

- **Reviews and Feedback use JSON flat files** — these will be lost on serverless/ephemeral environments. Migrate to MongoDB for production.
- **Admin routes are not middleware-protected** — the `/admin` page uses a client-side password check. For a production hardening, add server-side session checks or Next.js Middleware.
- **WhatsApp number is hardcoded in config** — update `APP_CONFIG.whatsappNumber` in `src/lib/config.ts` if the business number changes.
- **Email verification URL** in `register/route.ts` points to the Render deployment URL — make this dynamic using `process.env.NEXTAUTH_URL`.
- **No rate limiting** on API routes — consider adding rate limiting (e.g., `upstash/ratelimit`) before exposing to high traffic.

---

## Contributing

1. Fork the repository and create a feature branch: `git checkout -b feature/your-feature-name`
2. Make your changes and ensure the project builds: `npm run build`
3. Run the linter: `npm run lint`
4. Open a pull request with a clear description of your changes

> For questions about the business logic or design system, refer to `src/lib/config.ts` for all centralised brand constants and `src/app/globals.css` for the design token system (CSS variables).