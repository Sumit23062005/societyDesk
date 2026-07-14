# Society Maintenance Tracker

Simple complaint-management web app for apartment societies (backend + frontend).

## Overview

This repository contains two main folders:

- `backend` — Express.js API and background jobs
- `client` — Vite + React frontend

The backend exposes REST endpoints for authentication, complaints, notices and a scheduled job for overdue complaints. The frontend is a small React SPA that talks to the backend.

## Prerequisites

- Node.js >= 18
- npm
- A MongoDB instance (Atlas or local)

## Required environment variables (backend)

Create a `.env` file in the `backend` folder with the following variables:

- `PORT` — port for backend (default example: `5000`)
- `MONGO_URI` — MongoDB connection string
- `JWT_SECRET` — secret used to sign JWTs
- `JWT_EXPIRE` — JWT expiry (e.g. `7d`)
- `EMAIL_HOST` — SMTP host for outgoing mail
- `EMAIL_PORT` — SMTP port
- `EMAIL_USER` — SMTP username
- `EMAIL_PASS` — SMTP password
- `EMAIL_FROM` — From address for emails
- `OVERDUE_DAYS` — integer days after which a complaint is considered overdue

These keys are validated by the backend on start-up (see `backend/src/config/env.js`).

## Quick start

From the repository root run the following commands in two terminals.

Backend:
```bash
cd backend
npm install
# development (nodemon)
npm run dev
```

To create the seeded admin user (if provided by the project):
```bash
cd backend
npm run seed:admin
```

Frontend:
```bash
cd client
npm install
npm run dev
```

Frontend will be available at `http://localhost:5173/` (Vite default). The backend default port is commonly `5000`.

## Folder structure

Top-level layout (important files/folders):

- `backend/`
	- `src/` — server source
		- `config/` — configuration and env validation
		- `controllers/` — route handlers
		- `models/` — Mongoose models
		- `routes/` — Express routes
		- `services/` — business logic and helpers
		- `utils/` — utility scripts (including `seedAdmin`)
	- `package.json` — backend scripts and dependencies

- `client/`
	- `src/` — React app source
	- `package.json` — frontend scripts and dependencies

## Notes and troubleshooting

- On Windows, native `bcrypt` binaries can cause startup failures. If you see a binary load error, install `bcryptjs` and update the import to use it (this repository already uses `bcryptjs` in the `User` model).
- If port `5000` is already in use, either stop the occupying process or change `PORT` in the backend `.env`.

## Next steps

- Add or review `.env` values in `backend/.env` and start both servers.
- If you want, I can commit the small `User` model change (to use `bcryptjs`) and remove `bcrypt` from `backend/package.json`.
