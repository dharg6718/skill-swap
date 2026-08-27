# SkillSwap — Peer-to-Peer Skill Exchange Platform

A modern, full-stack MERN platform where users exchange knowledge and skills directly with one another without money. The platform features an intelligent bidirectional skill matching algorithm, real-time requests, session scheduling, peer reviews, user dashboards with interactive analytics, and comprehensive admin management.

---

## Table of Contents
1. [Project Overview](#project-overview)
2. [Tech Stack](#tech-stack)
3. [Architecture & Folder Structure](#architecture--folder-structure)
4. [Database Design & Models](#database-design--models)
5. [Skill Matching Algorithm](#skill-matching-algorithm)
6. [API Documentation](#api-documentation)
7. [Installation & Setup](#installation--setup)
8. [Environment Variables](#environment-variables)
9. [Seed Data & Demo Accounts](#seed-data--demo-accounts)
10. [Running the Application](#running-the-application)
11. [How to Explain This Project in an Interview](#how-to-explain-this-project-in-an-interview)

---

## 1. Project Overview

SkillSwap solves the problem of learning new technical and creative skills by connecting peers with complementary skill sets:
- **User A** knows *React, JavaScript, MongoDB* and wants to learn *Docker, AWS*.
- **User B** knows *Docker, AWS, Python* and wants to learn *React*.
- **SkillSwap Engine** computes a bidirectional match score, allows users to initiate swap requests, schedule live learning sessions, track progress, and leave verified ratings and reviews.

### Key Features:
- **Authentication & Authorization:** Secure JWT-based auth, role-based access control (`user` vs `admin`), bcrypt password hashing, and active user account checks.
- **Dynamic Skill Matching:** Deterministic, explainable matching algorithm calculating compatibility based on complementary skills, ratings, and profile completeness.
- **Discovery & Exploration:** Search by keyword/name with multi-parameter filtering (by skill, category, location, rating) and server-side MongoDB pagination.
- **Lifecycle Management:** Complete state-driven flows for Swap Requests (`pending` -> `accepted`/`rejected`/`cancelled`), Sessions (`scheduled` -> `completed`/`cancelled`), and Post-Session Verified Reviews.
- **Analytics & Dashboard:** Real-time metrics and charts powered by Recharts (session trends, request statuses, skill distribution).
- **Admin Control Panel:** Manage users (activate/deactivate, delete), manage skill taxonomy (CRUD), oversee requests and sessions, and monitor platform-wide analytics.
- **In-App Notifications:** Automated event notifications for incoming requests, status updates, scheduled sessions, and received reviews.

---

## 2. Tech Stack

### Frontend:
- **React.js (v18)** + **Vite**
- **Tailwind CSS** (Custom responsive design system)
- **React Router (v6)** (Protected and Admin routes)
- **Axios** (Centralized API client with JWT interceptor and error handlers)
- **Recharts** (Interactive data visualization)
- **Lucide React** (Modern iconography)
- **React Toastify** (Notifications and feedback alerts)

### Backend:
- **Node.js** & **Express.js**
- **MongoDB** & **Mongoose** (ODM with indexing and schema validation)
- **JWT (JSON Web Tokens)** & **bcryptjs**
- **express-validator** (Request payload validation)
- **Helmet** (HTTP security headers) & **Morgan** (HTTP request logger)
- **CORS** & **express-rate-limit** (DDoS and brute-force prevention on auth endpoints)

---

## 3. Architecture & Folder Structure

```
skillswap/
├── client/                     # Vite + React Frontend
│   ├── src/
│   │   ├── assets/             # Static assets
│   │   ├── components/
│   │   │   ├── common/         # Navbar, Footer, UserCard, MatchCard, StarRating, etc.
│   │   │   └── modals/         # SwapRequestModal, SessionModal, ReviewModal
│   │   ├── context/            # AuthContext (state, login, register, logout)
│   │   ├── hooks/              # useAuth, usePagination
│   │   ├── layouts/            # MainLayout, AdminLayout, AuthLayout
│   │   ├── pages/              # Landing, Dashboard, Explore, Matches, Requests, Sessions, etc.
│   │   │   └── admin/          # AdminDashboard, AdminUsers, AdminSkills, AdminRequests, AdminSessions
│   │   ├── routes/             # AppRoutes, ProtectedRoute, AdminRoute
│   │   ├── services/           # Axios API modules (auth, user, skill, match, request, session, review, etc.)
│   │   ├── utils/              # constants.js, formatDate.js
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   ├── .env.example
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.js
│
├── server/                     # Node.js + Express Backend
│   ├── config/
│   │   └── db.js               # MongoDB connection with graceful shutdown & retry logic
│   ├── controllers/            # Request handlers (auth, user, skill, match, request, session, review, admin)
│   ├── middleware/             # auth (protect, admin, activeUser), errorHandler, validate
│   ├── models/                 # Mongoose schemas (User, Skill, SwapRequest, Session, Review, Notification)
│   ├── routes/                 # Express API routes
│   ├── seed/
│   │   └── seed.js             # Database seeder with realistic test data
│   ├── services/               # matchService (matching algorithm), notificationService
│   ├── utils/                  # apiResponse.js, AppError.js
│   ├── validators/             # express-validator schema rules
│   ├── .env.example
│   ├── package.json
│   └── server.js               # Server entry point
│
├── package.json                # Root package.json with concurrent start scripts
├── .gitignore
└── README.md
```

---

## 4. Database Design & Models

### 1. User
- `name` (String, required, 2-50 chars)
- `email` (String, required, unique, lowercase)
- `password` (String, hashed with bcryptjs, select: false)
- `avatar`, `bio`, `location`
- `skillsKnown` (Array of ObjectId references to `Skill`)
- `skillsWanted` (Array of ObjectId references to `Skill`)
- `role` (Enum: `user`, `admin`)
- `rating` (Number, 0 to 5) & `totalReviews` (Number)
- `isActive` (Boolean, default: true)

### 2. Skill
- `name` (String, required, unique, trim)
- `category` (Enum: `Programming`, `Frontend`, `Backend`, `Database`, `Cloud`, `DevOps`, `AI/ML`, `Mobile`, `Design`, `Testing`, `Other`)
- `description` (String)

### 3. SwapRequest
- `sender` (ObjectId -> `User`)
- `receiver` (ObjectId -> `User`)
- `offeredSkill` (ObjectId -> `Skill`)
- `requestedSkill` (ObjectId -> `Skill`)
- `message` (String)
- `status` (Enum: `pending`, `accepted`, `rejected`, `cancelled`)

### 4. Session
- `request` (ObjectId -> `SwapRequest`)
- `mentor` (ObjectId -> `User`)
- `learner` (ObjectId -> `User`)
- `skill` (ObjectId -> `Skill`)
- `scheduledAt` (Date)
- `duration` (Number in minutes, 15 to 480)
- `meetingLink` (String)
- `status` (Enum: `scheduled`, `completed`, `cancelled`)
- `notes` (String)

### 5. Review
- `session` (ObjectId -> `Session`)
- `reviewer` (ObjectId -> `User`)
- `reviewee` (ObjectId -> `User`)
- `rating` (Number, 1 to 5)
- `comment` (String)
- *Compound unique index:* `{ session: 1, reviewer: 1 }` prevents double reviewing.

### 6. Notification
- `user` (ObjectId -> `User`)
- `type` (Enum: `swap_request`, `request_accepted`, `request_rejected`, `session`, `review`, `system`)
- `title`, `message`, `relatedId`, `isRead`

---

## 5. Skill Matching Algorithm

The platform features a deterministic, explainable matching algorithm located in `server/services/matchService.js`:

$$\text{outgoingMatches} = \text{candidate.skillsKnown} \cap \text{currentUser.skillsWanted}$$
$$\text{incomingMatches} = \text{candidate.skillsWanted} \cap \text{currentUser.skillsKnown}$$

### Match Score Calculation:
$$\text{Score} = \min\left(100, (\text{outgoingMatches.count} \times 15) + (\text{incomingMatches.count} \times 15) + (\text{candidate.rating} \times 4) + \text{profileBonus}\right)$$

Candidates are sorted in descending order by `matchScore`, returning:
```json
{
  "user": { ... },
  "matchScore": 88,
  "skillsYouCanTeach": [ ... ],
  "skillsYouCanLearn": [ ... ]
}
```

---

## 6. API Documentation

### Base URL: `http://localhost:5000/api`

| Method | Endpoint | Description | Access |
|---|---|---|---|
| **POST** | `/auth/register` | Register user & receive JWT token | Public |
| **POST** | `/auth/login` | Login user & receive JWT token | Public |
| **GET** | `/auth/me` | Fetch authenticated user's profile | Authenticated |
| **GET** | `/users` | Explore users (with search, filters, pagination) | Authenticated |
| **GET** | `/users/:id` | Get public profile of a user | Authenticated |
| **PUT** | `/users/:id` | Update current user's profile & skills | Owner |
| **GET** | `/skills` | Fetch all available skills or search by category | Public |
| **POST** | `/skills` | Create new skill | Admin |
| **PUT** | `/skills/:id` | Update skill | Admin |
| **DELETE** | `/skills/:id` | Delete skill | Admin |
| **GET** | `/matches` | Get ranked skill matches for current user | Authenticated |
| **GET** | `/requests` | Fetch sent and received swap requests | Authenticated |
| **POST** | `/requests` | Create a new swap request | Authenticated |
| **PUT** | `/requests/:id` | Accept, reject, or cancel swap request | Participant |
| **GET** | `/sessions` | Get user's learning sessions | Authenticated |
| **POST** | `/sessions` | Create a session from an accepted request | Participant |
| **PUT** | `/sessions/:id` | Update session or mark as completed | Participant |
| **POST** | `/reviews` | Submit post-session review & update ratings | Participant |
| **GET** | `/reviews/user/:userId` | Get verified reviews for a user | Authenticated |
| **GET** | `/notifications` | Get user notifications & unread count | Authenticated |
| **PUT** | `/notifications/:id/read`| Mark single notification as read | Owner |
| **PUT** | `/notifications/read-all`| Mark all notifications as read | Owner |
| **GET** | `/dashboard/stats` | Get personal dashboard analytics & recent items | Authenticated |
| **GET** | `/admin/stats` | Get platform-wide metrics & charts data | Admin |
| **GET** | `/admin/users` | Manage all registered platform users | Admin |
| **PUT** | `/admin/users/:id/status`| Activate/deactivate user account | Admin |
| **DELETE** | `/admin/users/:id` | Delete user and cascade cleanups | Admin |

---

## 7. Installation & Setup

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- MongoDB Atlas account (or local MongoDB Community Server)

### Step 1: Clone or Open Workspace
```bash
cd "skill swap"
```

### Step 2: Install All Dependencies
```bash
# Install root, backend, and frontend dependencies
npm run install-all
```

---

## 8. Environment Variables

### Backend Configuration (`server/.env`)
```env
PORT=5000
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/skillswap?retryWrites=true&w=majority
JWT_SECRET=skillswap_jwt_secret_key_2024_secure
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
```

> **Important note on MongoDB Atlas Connection:**
> If you are using MongoDB Atlas, make sure your IP is whitelisted in your MongoDB Atlas Dashboard:
> 1. Go to **Network Access** in the Atlas menu.
> 2. Click **Add IP Address**.
> 3. Select **Allow Access from Anywhere (`0.0.0.0/0`)** or add your current IP address.

### Frontend Configuration (`client/.env`)
```env
VITE_API_URL=http://localhost:5000/api
```

---

## 9. Seed Data & Demo Accounts

Populate the database with preconfigured skills, sample users, active swap requests, scheduled sessions, and reviews:

```bash
# Run from the server directory or root:
npm run seed
```

### Preconfigured Test Accounts (Development Only):

| Role | Email | Password | Details |
|---|---|---|---|
| **Admin** | `admin@skillswap.com` | `admin123` | Platform Administrator |
| **User 1** | `user1@skillswap.com` | `password123` | Developer with Frontend & Backend skills |
| **User 2** | `user2@skillswap.com` | `password123` | Cloud & DevOps enthusiast |
| **User 3** | `user3@skillswap.com` | `password123` | UI/UX Designer & Mobile developer |
| **User 4** | `user4@skillswap.com` | `password123` | AI/ML practitioner |
| *(Users 5-8)* | `user5@skillswap.com` to `user8@skillswap.com` | `password123` | Varied global profiles |

---

## 10. Running the Application

### Development Mode (Both Frontend and Backend concurrently):
```bash
npm run dev
```

- **Frontend:** `http://localhost:5173`
- **Backend API:** `http://localhost:5000/api`

### Or Run Individually:
```bash
# Terminal 1 (Backend)
cd server
npm run dev

# Terminal 2 (Frontend)
cd client
npm run dev
```

---

## 11. How to Explain This Project in an Interview

Here are clean, senior-level explanations for technical questions interviewers commonly ask about this architecture:

### 1. Why MERN Stack?
> "MERN allows end-to-end JavaScript/TypeScript development across the browser and server. JSON is the native data format across React, Express, and MongoDB, eliminating serialization mismatch and accelerating development while maintaining strong separation of concerns."

### 2. Why MongoDB for SkillSwap?
> "SkillSwap models profiles with dynamic arrays of skills (`skillsKnown`, `skillsWanted`), varied attributes (locations, bios), and relational document references (`ObjectId` references for sessions, reviews, and requests). MongoDB handles semi-structured document data natively while Mongoose provides strict schema validation and population when joins are required."

### 3. How does Authentication & Authorization work?
> "Authentication uses stateless JSON Web Tokens (JWT). When a user logs in, their password is verified using `bcrypt.compare`. Upon success, a signed JWT containing their `userId` and `role` is returned. A custom Express middleware (`protect`) intercepts subsequent requests via the `Authorization: Bearer <token>` header, verifies the token signature, and attaches the active user document to `req.user`. Role-based authorization (`admin` middleware) ensures only users with `role: 'admin'` can execute restricted mutations."

### 4. How is Password Security handled?
> "Passwords are hashed using `bcryptjs` with 10 salt rounds inside a Mongoose `pre('save')` hook whenever the password is created or modified. In the Mongoose schema, `select: false` ensures password hashes are never accidentally leaked in queries or API JSON responses."

### 5. How does the Bidirectional Skill Matching Algorithm work?
> "Instead of simple search, the matching algorithm computes a symmetric intersection between two users' skill sets: skills the candidate knows that the current user wants ($\text{outgoingMatches}$) and skills the current user knows that the candidate wants ($\text{incomingMatches}$). We then apply a deterministic scoring formula weighted by mutual skill overlap, candidate rating, and profile completeness to rank compatibility from 0 to 100%."

### 6. How does Server-Side Pagination work?
> "We avoid loading all records into memory by implementing server-side pagination with Mongoose `skip((page - 1) * limit)` and `limit(Number(limit))`. We execute a parallel `countDocuments()` query to return metadata (`total`, `totalPages`, `page`), enabling fast queries and minimal bandwidth."

### 7. How does the Frontend communicate with the Backend?
> "The client uses a singleton Axios instance configured with `baseURL: import.meta.env.VITE_API_URL`. A request interceptor automatically attaches `Bearer <token>` from `localStorage`. A response interceptor catches 401 Unauthorized responses to automatically log out expired sessions and redirect the user cleanly to `/login`."

### 8. How are Transactions and Relational Integrity enforced?
> "We use compound unique indexes (e.g. `{ session: 1, reviewer: 1 }` on `Review` and `{ sender: 1, receiver: 1, offeredSkill: 1, requestedSkill: 1, status: 1 }` on `SwapRequest`) at the database level to prevent race conditions and duplicate operations. Rating recalculation is executed on the backend by aggregating all submitted reviews rather than trusting user-provided client numbers."

### 9. How is Centralized Error Handling structured?
> "Express routes delegate errors to `next(err)`. A custom `AppError` class standardizes operational errors with HTTP status codes. A global error-handling middleware intercepts errors, distinguishes Mongoose validation and duplicate key errors (code 11000) from unexpected server bugs, and returns consistent `{ success: false, message, errors }` payloads without leaking sensitive stack traces in production."
