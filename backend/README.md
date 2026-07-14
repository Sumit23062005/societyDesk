# Society Maintenance Tracker — Backend

A REST API backend for a complaint management system used by apartment societies. Residents raise and track maintenance complaints; admins triage, prioritize, resolve them, publish notices, and monitor a dashboard.

## Tech Stack

- Node.js + Express.js (JavaScript)
- MongoDB + Mongoose
- JWT Authentication with Role-Based Access Control (Resident / Admin)
- Multer (photo uploads)
- Nodemailer (email notifications)
- bcrypt (password hashing)
- express-validator (request validation)
- helmet, cors, morgan, cookie-parser
- node-cron (overdue monitoring job)

## Architecture

```
Client → REST APIs → Express Server → Controllers → Services → Models (Mongoose) → MongoDB
```

Simple layered architecture. No microservices, no CQRS, no event sourcing, no DDD.

## Folder Structure

```
backend/
├── src/
│   ├── config/        # DB, env validation, multer, mailer config
│   ├── controllers/    # Request/response handlers
│   ├── middleware/     # auth, RBAC, error handler, validation
│   ├── models/         # Mongoose schemas
│   ├── routes/         # Express routers
│   ├── services/       # Business logic
│   ├── utils/          # Helpers (AppError, catchAsync, email templates, seed script)
│   ├── validations/    # express-validator chains
│   ├── uploads/        # Uploaded complaint photos (served statically)
│   ├── jobs/           # Cron jobs (overdue monitoring)
│   ├── constants/      # Enums (roles, statuses, categories, priorities)
│   ├── app.js
│   └── server.js
├── postman/
│   └── Society_Maintenance_Tracker.postman_collection.json
├── README.md
├── .env.example
├── package.json
└── package-lock.json
```

## Installation

```bash
npm install
```

## Environment Variables

Copy `.env.example` to `.env` and fill in real values:

| Variable | Description |
|---|---|
| `PORT` | Port the server listens on |
| `NODE_ENV` | `development` or `production` |
| `CLIENT_URL` | Allowed CORS origin |
| `MONGO_URI` | MongoDB connection string |
| `JWT_SECRET` | Secret used to sign JWTs |
| `JWT_EXPIRE` | JWT expiry (e.g. `7d`) |
| `JWT_COOKIE_EXPIRE` | Cookie expiry in days |
| `EMAIL_HOST` / `EMAIL_PORT` / `EMAIL_USER` / `EMAIL_PASS` / `EMAIL_FROM` | SMTP config for Nodemailer |
| `OVERDUE_DAYS` | Days after creation a non-resolved complaint becomes overdue |
| `MAX_FILE_SIZE_MB` | Max complaint photo size |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | Used only by the admin seed script |

## Running

```bash
# Development (auto-restart)
npm run dev

# Production
npm start
```

Since only resident self-registration is exposed publicly, seed the first admin account with:

```bash
npm run seed:admin
```

This creates an admin using `ADMIN_EMAIL` / `ADMIN_PASSWORD` from `.env` (defaults: `admin@society.com` / `Admin@12345`).

Health check: `GET /api/v1/health`

## Authentication

JWT is issued on register/login and returned both in the JSON response (`data.token`) and as an httpOnly cookie named `token`. Send it either as:

- `Authorization: Bearer <token>` header, or
- rely on the `token` cookie (automatically sent by browsers)

Roles: `resident`, `admin`. Enforced via RBAC middleware on every protected route.

## Complaint Lifecycle

```
Open → In Progress → Resolved → Closed
```

- Only admins can change status.
- Once `Resolved`, the only allowed transition is to `Closed`.
- Once `Closed`, no further updates are allowed.
- `closedAt` is stamped the first time a complaint reaches `Resolved` or `Closed`.
- Every status change writes an immutable `ComplaintHistory` entry (never updated/overwritten).
- A complaint is `isOverdue` (computed on read, not stored) when its status is `Open` or `In Progress` and `now - createdAt > OVERDUE_DAYS`.

## API Endpoints

Base URL: `/api/v1`

### Auth (`/auth`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/auth/register` | Public | Register a resident |
| POST | `/auth/login` | Public | Login (resident or admin) |
| POST | `/auth/logout` | Authenticated | Clear auth cookie |
| GET | `/auth/profile` | Authenticated | Get own profile |
| PUT | `/auth/profile` | Authenticated | Update own profile (name, phone, flatNumber) |

### Complaints (`/complaints`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/complaints` | Resident | Create complaint (`multipart/form-data`, optional `photo` file) |
| GET | `/complaints/my` | Resident | Own complaints |
| GET | `/complaints` | Admin | All complaints. Query: `category, status, priority, date, resident, overdue, sort(newest\|oldest\|priority\|overdue), page, limit` |
| GET | `/complaints/:id` | Owner or Admin | Single complaint |
| GET | `/complaints/:id/history` | Owner or Admin | Immutable status history |
| PUT | `/complaints/:id/status` | Admin | Update status (`status`, optional `note`) — sends email to resident |
| PUT | `/complaints/:id/priority` | Admin | Update priority |
| POST | `/complaints/:id/notes` | Admin | Add a history note without changing status |
| DELETE | `/complaints/:id` | Admin | Delete complaint (and its history) |

### Notices (`/notices`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/notices` | Authenticated | List notices, pinned first |
| GET | `/notices/:id` | Authenticated | Single notice |
| POST | `/notices` | Admin | Create notice (emails all residents if `important: true`) |
| PUT | `/notices/:id` | Admin | Update notice |
| PATCH | `/notices/:id/pin` | Admin | Pin/unpin (`{ "pinned": true }`) |
| DELETE | `/notices/:id` | Admin | Delete notice |

### Dashboard (`/dashboard`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/dashboard/admin` | Admin | Totals, by-status, by-category, by-priority, overdue count (via aggregation pipeline) |

### Health
| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/health` | Public | Service + DB connectivity status |

### Uploads
Uploaded photos are served statically at `GET /uploads/<filename>`. Each complaint response includes a `photoUrl` field with the full accessible URL.

## Response Format

Success:
```json
{ "success": true, "message": "...", "data": {} }
```

Error:
```json
{ "success": false, "message": "...", "errors": [] }
```

## Database Schema (summary)

**User**: name, email (unique), password (hashed, hidden by default), phone, flatNumber, role (`resident`|`admin`), isActive, timestamps.

**Complaint**: title, category (enum), description, photo, priority (enum), status (enum), resident (ref User), closedAt, timestamps. Indexed on resident, status, category, priority, createdAt.

**ComplaintHistory**: complaint (ref Complaint), previousStatus, newStatus, actor (ref User), note, timestamp. Immutable — created only, never updated.

**Notice**: title, description, important, pinned, createdBy (ref User), timestamps.

## Security

- Helmet for HTTP headers
- CORS restricted to `CLIENT_URL`
- Passwords hashed with bcrypt, never returned in API responses
- JWT-based auth with httpOnly cookie support
- RBAC middleware on every admin-only route
- Centralized express-validator validation on every input route
- Centralized error handler normalizes Mongoose/JWT/Multer errors into consistent JSON

## Postman Collection

Import `postman/Society_Maintenance_Tracker.postman_collection.json` into Postman. It includes every endpoint above, organized into folders, using `{{baseUrl}}` and `{{token}}` collection variables (the login/register requests auto-populate `{{token}}` via a test script).
