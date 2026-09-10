# Ledgerly Expense Tracker

Ledgerly is a simple full-stack expense tracker built for a portfolio. Users can register, log in, record expenses, filter and search their history, review spending by category, update their preferred display currency and theme, and permanently delete their account.

Ledgerly is manual-entry software only. It does not connect to cards or bank accounts, hold money, process payments, or provide financial advice. Never enter card numbers, CVV/CVC codes, PINs, or banking credentials.

Users can add manual wallet displays such as `BPI`, `Cash`, or `Savings` with a balance and visual style. These are personal labels and balances only; they are not connected to the named bank or account.

## Technologies

- React, React Router, JavaScript, CSS, and Vite
- Node.js and Express.js REST API
- MongoDB with Mongoose
- JWT authentication
- bcryptjs password hashing

## Project structure

```text
expense-tracker/
├── client/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── styles.css
│   └── package.json
├── server/
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   ├── server.js
│   ├── .env.example
│   └── package.json
└── README.md
```

## Setup

1. Install Node.js 18+ and run MongoDB locally, or create a MongoDB Atlas database.
2. Install dependencies from the project root:

```bash
npm install
npm run install:all
```

3. Create `server/.env` by copying `server/.env.example` and set the values:

```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/expense_tracker
JWT_SECRET=use-a-long-random-secret
CLIENT_URL=http://localhost:5173
```

Keep `.env` private and do not commit it.

## Run locally

Start both applications from the root:

```bash
npm run dev
```

Or run them separately:

```bash
npm run dev --prefix server
npm run dev --prefix client
```

The frontend runs at `http://localhost:5173` and the API runs at `http://localhost:5000`.

## Deploying

Deploy the `server` and `client` as separate services. Set these environment variables on the deployed services:

```env
# server
MONGODB_URI=...
JWT_SECRET=...
CLIENT_URL=https://your-frontend-domain.example

# client (set before building)
VITE_API_URL=https://your-api-domain.example/api
```

`CLIENT_URL` may contain multiple comma-separated frontend origins. A production client build without `VITE_API_URL` falls back to `http://localhost:5000/api`, which cannot work from a deployed website.

## API overview

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/me`
- `PUT /api/me`
- `DELETE /api/me`
- `GET /api/wallets`
- `POST /api/wallets`
- `PUT /api/wallets/:id`
- `DELETE /api/wallets/:id`
- `GET /api/expenses`
- `POST /api/expenses`
- `PUT /api/expenses/:id`
- `DELETE /api/expenses/:id`

Private endpoints require a JWT in the `Authorization: Bearer <token>` header. Expense queries and mutations always include the authenticated user's ID, preventing cross-account access.
