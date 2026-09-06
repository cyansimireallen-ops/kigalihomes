# KigaliHomes

**Find a place you'll love to call home.**

A full-stack real-estate marketplace for Kigali, Rwanda. Users can search, list, and manage houses, apartments, villas, commercial units, and plots for rent or sale. Built as a working MVP with a separate user site and admin dashboard.

---

## 1. Project overview

KigaliHomes is a MERN application (MongoDB, Express, React, Node.js) split into two independent apps that talk to each other over a REST API:

- `client/` — a React + Vite + Tailwind CSS single-page app: the public marketplace, user dashboard, and admin dashboard (`/admin`).
- `server/` — an Express + MongoDB (Mongoose) REST API: authentication, property CRUD, favorites, messaging, admin moderation, image uploads.

Core flows implemented: browsing/searching/filtering properties, registration & login (JWT), owners/agents submitting listings for admin approval, favorites, a simple in-platform messaging system, a locked-down admin dashboard with user & property moderation, reporting, and featured listings.

## 2. Technologies

| Layer | Stack |
|---|---|
| Frontend | React 18, Vite, React Router, Tailwind CSS, Axios, lucide-react, react-hot-toast |
| Backend | Node.js, Express.js |
| Database | MongoDB + Mongoose |
| Auth | JWT + bcryptjs |
| Uploads | Multer (local disk, structured so Cloudinary can be swapped in later) |
| Security | Helmet, CORS, express-rate-limit, express-validator |

No PHP, no MySQL, no XAMPP required.

## 3. Folder structure

```
kigalihomes/
├── client/                  React + Vite + Tailwind frontend
│   ├── src/
│   │   ├── api/              axios instance (attaches JWT, base URL)
│   │   ├── components/       Navbar, Footer, PropertyCard, layouts, admin/dashboard chrome, etc.
│   │   ├── context/          AuthContext (JWT session, current user)
│   │   ├── pages/             public pages, auth, dashboard/*, admin/*
│   │   └── App.jsx           route table
│   └── vite.config.js        dev server + proxy to the API
│
├── server/                  Express backend
│   ├── config/db.js          MongoDB connection
│   ├── models/                User, Property, Favorite, Message, Report
│   ├── controllers/           request handlers per resource
│   ├── routes/                 REST endpoints
│   ├── middleware/            JWT auth, admin/role guard, upload (Multer), error handler
│   ├── utils/                  token signing, query/filter helpers
│   ├── seed/seed.js            demo data seeder
│   ├── uploads/                 uploaded property images (gitignored)
│   └── server.js               app entry point
│
├── README.md
└── .gitignore
```

## 4. Requirements

- Node.js 18+ and npm
- MongoDB, either:
  - a local MongoDB server (`mongod`) running on `27017`, or
  - a free [MongoDB Atlas](https://www.mongodb.com/atlas) cluster (use its connection string instead)

## 5. MongoDB setup

**Local:** install MongoDB Community Server for your OS and start it (`mongod` or via your OS service manager). The default connection string in `.env.example` (`mongodb://127.0.0.1:27017/kigalihomes`) will work as-is.

**Atlas (cloud, no local install):** create a free cluster, create a database user, allow your IP, then copy the connection string (`mongodb+srv://...`) into `MONGO_URI` in `server/.env`.

## 6. Installation

Clone or unzip the project, then install each app's dependencies separately.

```bash
cd server
npm install

cd ../client
npm install
```

## 7. Environment variables

Copy the example file and fill in real values for local development:

```bash
cd server
cp .env.example .env
```

`server/.env`:

```
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://127.0.0.1:27017/kigalihomes
JWT_SECRET=change_this_secret
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
```

Change `JWT_SECRET` to a long random string before deploying anywhere real. Never commit your actual `.env` file (it's gitignored already).

The client does not need a `.env` file for local dev — Vite proxies `/api` and `/uploads` to `http://localhost:5000` (see `client/vite.config.js`).

## 8. How to start the backend

```bash
cd server
npm run dev      # nodemon, auto-restarts on changes
# or: npm start  # plain node
```

The API runs at `http://localhost:5000`. Health check: `GET http://localhost:5000/api/health`.

## 9. How to start the frontend

In a second terminal:

```bash
cd client
npm run dev
```

The site runs at `http://localhost:5173`. The admin dashboard lives at `http://localhost:5173/admin`.

## 10. How to create the first admin

The **first** admin account is created through the app itself, not the seed script:

1. With the backend and frontend running, visit `http://localhost:5173/admin/register`.
2. Fill in the form (name, username, email, password).
3. Submit — this creates the one and only admin account and logs you in.

Once an admin exists, `/admin/register` automatically shows **"Admin registration is closed"**, and the backend independently refuses `POST /api/auth/admin/register` with `403` — this is enforced server-side, not just hidden in the UI, so it can't be bypassed by calling the API directly.

From then on, admins sign in at `http://localhost:5173/admin/login`.

## 11. How to seed demo data

Optional, useful for browsing the UI with realistic content:

```bash
cd server
npm run seed            # inserts demo owners, seekers, and properties
npm run seed:destroy    # removes the demo data the seeder created
```

The seeder never creates an admin account — create your admin through `/admin/register` as described above. Demo login credentials are printed to the console when the seed script finishes; they are for local development only, not for production use.

## 12. API overview

Base URL: `http://localhost:5000/api`

| Method | Endpoint | Description |
|---|---|---|
| POST | `/auth/register` | Register a seeker or owner/agent |
| POST | `/auth/login` | User login (email or username) |
| POST | `/auth/admin/register` | Create the first admin (locked after one exists) |
| GET | `/auth/admin/register-status` | Whether admin registration is still open |
| POST | `/auth/admin/login` | Admin login |
| GET | `/properties` | List/search/filter properties (query params: `purpose`, `propertyType`, `location`, `minPrice`, `maxPrice`, `bedrooms`, `bathrooms`, `furnished`, `sort`, `page`) |
| GET | `/properties/:id` | Property details |
| POST | `/properties` | Create a listing (auth, owner/agent) |
| PUT | `/properties/:id` | Update a listing (owner or admin) |
| DELETE | `/properties/:id` | Delete a listing (owner or admin) |
| GET | `/users/me` | Current user profile |
| PUT | `/users/me` | Update profile / change password |
| GET | `/favorites` | Current user's saved properties |
| POST | `/favorites/:propertyId` | Save a property |
| DELETE | `/favorites/:propertyId` | Remove a saved property |
| GET | `/messages` | List conversations / a conversation's messages |
| POST | `/messages` | Send a message about a property |
| GET | `/reports` | List reports (auth) |
| POST | `/reports` | Report a listing |
| PUT | `/reports/:id` | Update report status (admin) |
| GET | `/admin/dashboard` | Admin stats (users, properties, pending, featured, reports) |
| GET/PUT | `/admin/users`, `/admin/users/:id` | List/search users, ban/restore/change role |
| GET/PUT/DELETE | `/admin/properties`, `/admin/properties/:id` | Moderate, approve/reject, feature/verify, delete |

All admin endpoints require a valid JWT **and** `role: "admin"`, checked in backend middleware — the frontend never decides authorization on its own.

## 13. Production notes

This is an MVP, not a hardened production deployment. Before going live, at minimum:

- Set a strong, unique `JWT_SECRET` and store it outside source control (e.g. your host's secret manager).
- Point `MONGO_URI` at a managed MongoDB (Atlas or equivalent) with authentication and backups enabled.
- Swap local Multer disk storage for a persistent object store (e.g. Cloudinary or S3) — local `server/uploads/` is not durable across redeploys and the code is structured so this swap only touches `middleware/uploadMiddleware.js`.
- Serve the client as a static build (`npm run build` in `client/`) behind a CDN/reverse proxy, and run the API behind HTTPS.
- Review rate limits, CORS origin, and Helmet config for your actual domains.
- Add real email delivery for the "Forgot password" flow (currently a placeholder-ready endpoint).

### Deliberately out of scope for v1

360° virtual tours, online payments/subscriptions for featured listings, real-time chat (Socket.IO), a blog/CMS, and multi-country support were intentionally left out to keep the MVP focused — the data models (e.g. `isFeatured` on `Property`) are structured so these can be added later without a schema rewrite.
