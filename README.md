# Society Maintenance Tracker

A full-stack complaint management system for apartment societies.

## Project Structure

- `backend` - Express.js API, MongoDB models, auth, complaints, notices, dashboard, and cron jobs
- `client` - React + Vite frontend

## Tech Stack

- Node.js and Express.js
- MongoDB and Mongoose
- React and Vite
- JWT authentication
- Multer for file uploads
- Nodemailer for email notifications
- node-cron for overdue complaint monitoring

## Features

- Resident registration and login
- Admin and resident role-based access control
- Complaint creation, status tracking, and history
- Notice board management
- Admin dashboard analytics
- Email notifications
- Complaint photo uploads
- Overdue complaint monitoring

## Prerequisites

- Node.js 18 or newer
- npm
- MongoDB Atlas or a local MongoDB instance

## Setup Guide

### 1. Backend setup

Create a `.env` file inside `backend` using the template below.

Then run:

~~~bash
cd backend
npm install
npm run dev
~~~

To create the first admin account:

~~~bash
cd backend
npm run seed:admin
~~~

### 2. Frontend setup

Run:

~~~bash
cd client
npm install
npm run dev
~~~

The frontend usually runs on `http://localhost:5173/`. If that port is busy, Vite may choose another one automatically.

## Environment Variables

### Backend `.env.example`

~~~dotenv
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173

MONGO_URI=mongodb+srv://<username>:<password>@<cluster>/<database>

JWT_SECRET=<your_long_random_secret>
JWT_EXPIRE=7d
JWT_COOKIE_EXPIRE=7

EMAIL_HOST=smtp.example.com
EMAIL_PORT=587
EMAIL_USER=<smtp_username>
EMAIL_PASS=<smtp_password>
EMAIL_FROM="Society Maintenance Tracker <no-reply@example.com>"

OVERDUE_DAYS=5
MAX_FILE_SIZE_MB=5

ADMIN_EMAIL=admin@society.com
ADMIN_PASSWORD=Admin@12345
~~~

These values are validated at startup by `backend/src/config/env.js`.

## API Documentation

Base URL:

`/api/v1`

### Health

- `GET /health`
- Public
- Returns API and database health status

### Authentication

- `POST /auth/register`
- Public
- Create resident account

- `POST /auth/login`
- Public
- Login as resident or admin

- `POST /auth/logout`
- Authenticated
- Clear auth cookie

- `GET /auth/profile`
- Authenticated
- Get logged-in user profile

- `PUT /auth/profile`
- Authenticated
- Update profile fields like name, phone, and flat number

### Complaints

- `POST /complaints`
- Resident only
- Create complaint
- Supports optional `photo` upload

- `GET /complaints/my`
- Resident only
- Get complaints created by the logged-in resident

- `GET /complaints`
- Admin only
- Get all complaints with filters such as category, status, priority, overdue, sort, page, and limit

- `GET /complaints/:id`
- Owner or admin
- Get complaint by ID

- `GET /complaints/:id/history`
- Owner or admin
- Get immutable complaint history

- `PUT /complaints/:id/status`
- Admin only
- Update complaint status and optionally add a note

- `PUT /complaints/:id/priority`
- Admin only
- Update complaint priority

- `POST /complaints/:id/notes`
- Admin only
- Add a note to complaint history

- `DELETE /complaints/:id`
- Admin only
- Delete complaint and its history

### Notices

- `GET /notices`
- Authenticated
- Get all notices

- `GET /notices/:id`
- Authenticated
- Get notice by ID

- `POST /notices`
- Admin only
- Create notice

- `PUT /notices/:id`
- Admin only
- Update notice

- `PATCH /notices/:id/pin`
- Admin only
- Pin or unpin a notice

- `DELETE /notices/:id`
- Admin only
- Delete notice

### Dashboard

- `GET /dashboard/admin`
- Admin only
- Returns admin dashboard statistics

## Database Schema

### User

Fields:

- `name`
- `email`
- `password`
- `phone`
- `flatNumber`
- `role`
- `isActive`
- `createdAt`
- `updatedAt`

Rules:

- `email` is unique
- `password` is hashed before save
- `role` is either `resident` or `admin`

### Complaint

Fields:

- `title`
- `category`
- `description`
- `photo`
- `priority`
- `status`
- `resident`
- `closedAt`
- `createdAt`
- `updatedAt`

Rules:

- `category` must be one of the configured complaint categories
- `priority` defaults to `Medium`
- `status` defaults to `Open`
- `closedAt` is set when the complaint moves to `Resolved` or `Closed`

### ComplaintHistory

Fields:

- `complaint`
- `previousStatus`
- `newStatus`
- `actor`
- `note`
- `timestamp`

Rules:

- Stores an immutable audit trail of complaint status changes
- Entries are created only, not updated

### Notice

Fields:

- `title`
- `description`
- `important`
- `pinned`
- `createdBy`
- `createdAt`
- `updatedAt`

Rules:

- `pinned` controls ordering in the notices list
- `important` can be used for higher-priority communication

## Notes

- Uploaded complaint photos are served from `/uploads`.
- The frontend points to the backend using `VITE_API_URL` if provided, otherwise it defaults to `http://localhost:5000/api/v1`.
- On Windows, if port `5000` is already in use, stop the conflicting process before starting the backend.

## Quick Start

Run backend and frontend in separate terminals:

~~~bash
cd backend
npm install
npm run dev
~~~

~~~bash
cd client
npm install
npm run dev
~~~

## Postman

Import the Postman collection from:

`backend/postman/Society_Maintenance_Tracker.postman_collection.json`

It includes the main API endpoints for testing.  

## System Design

### Complaint History Model

The complaint history subsystem is designed as an append-only audit log. The main complaint record stores the current state, while every status change creates a separate history entry. Each history item captures the complaint reference, previous status, new status, acting user, optional note, and timestamp.

This design gives the system a reliable event trail for accountability and support. Because history entries are never updated or overwritten, the full lifecycle of a complaint can always be reconstructed, even if the complaint itself changes later.

### Overdue Detection

Overdue tracking is computed dynamically instead of being stored as a permanent flag. A complaint is considered overdue only when it is still in an active state and its age is greater than the configured `OVERDUE_DAYS` value.

This approach prevents stale overdue values and keeps the rule consistent at read time. A scheduled job also runs periodically to count overdue complaints for monitoring and operational visibility, but the overdue state itself remains a computed business rule rather than a stored field.

### Photo Handling

Complaint photos are handled through a lightweight upload flow. When a resident creates a complaint, they can optionally attach a photo. The backend processes the file using upload middleware and stores it on disk instead of embedding it directly in MongoDB.

This keeps complaint records small and avoids unnecessary database growth. The application also serves the upload folder as static content, so the frontend can display complaint photos using a generated public URL.

### Notification Flow

Notifications are event-driven and mainly delivered by email. The backend uses SMTP mail transport to send messages when important actions occur.

The main notification paths are:

- Complaint status updates: when an admin changes a complaint’s status, the resident receives an email update.
- Important notices: when an admin posts a high-priority notice, the system can broadcast email alerts to residents.

This keeps users informed without requiring them to constantly check the app. The notification logic is triggered close to the business event that caused it, which keeps the flow simple and easy to maintain.

### End-to-End Flow

The overall request flow is layered:

1. The controller receives the request.
2. Validation middleware checks the input.
3. The service applies business logic.
4. The model persists data in MongoDB.
5. Side effects such as history creation, file storage, and email notifications are executed as part of the workflow.

This separation keeps the system maintainable and makes the complaint history, overdue detection, photo handling, and notification behavior easy to reason about.
