# Smart Stay Homes

A rental platform for PGs, hostels, apartments and houses.

- **Frontend:** React 18 + Vite + React Router
- **Backend:** Node.js + Express + SQLite (better-sqlite3), JWT login
- **Needs:** Node.js 18 or newer

## Run it

Open two terminals.

**1. Backend** (http://localhost:5000)

```bash
cd backend
npm install
npm run seed     # optional: demo owner + 8 sample listings
npm run dev
```

**2. Frontend** (http://localhost:5173)

```bash
cd frontend
npm install
npm run dev
```

The frontend proxies `/api` to the backend, so nothing else needs configuring.

Demo owner login after seeding: `owner@smartstay.test` / `owner123`

## What it does

**Tenants:** browse and filter by type, city, budget, gender and area; open a listing; send an enquiry (no account needed).

**Owners:** sign up as an owner, add/edit/delete properties, mark them full or available, and manage enquiries (new, contacted, closed).

## API

| Method | Path | Who |
|---|---|---|
| POST | `/api/auth/register`, `/api/auth/login` | public |
| GET | `/api/auth/me` | logged in |
| GET | `/api/listings` (filters: `q, city, type, gender, sharing, minRent, maxRent, sort`) | public |
| GET | `/api/listings/:id`, `/api/cities` | public |
| POST | `/api/listings/:id/enquiries` | public |
| POST / PUT / DELETE | `/api/listings`, `/api/listings/:id` | owner |
| PATCH | `/api/listings/:id/availability` | owner |
| GET | `/api/owner/listings`, `/api/owner/enquiries` | owner |
| PATCH | `/api/enquiries/:id` | owner |

## Before going live

- Set a strong `JWT_SECRET` environment variable for the backend.
- Restrict CORS to your frontend domain in `backend/server.js`.
- Add image upload (listings currently take a photo link) and rate limiting.
- Build the frontend with `npm run build` and serve `frontend/dist` from your host.
