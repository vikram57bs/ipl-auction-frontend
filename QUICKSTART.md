# Quick Start Guide

Get your IPL Auction Portal running in 5 minutes!

## Prerequisites

- Node.js (v18+)
- npm

## Installation Steps

### 1. Install Backend Dependencies

```bash
cd backend
npm install
```

### 2. Set Up Database

```bash
# Generate Prisma Client
npm run prisma:generate

# Run migrations to create database
npm run migrate
```

This creates a SQLite database at `backend/prisma/dev.db`

### 3. Prepare Player Data (Optional)

If you have player data:
- Place your `players.xlsx` file in the `data/` directory
- See `data/README.md` for required Excel format

### 4. Seed Database

```bash
# Still in backend directory
npm run seed
```

This creates:
- 1 Manager account (username: `manager`, password: `manager123`)
- 7 Team accounts (username: `csk/mi/rcb/kkr/srh/gt/dc`, password: `team123`)
- Imports players from Excel (if file exists)

### 5. Install Frontend Dependencies

```bash
# Go back to project root
cd ..
npm install
```

### 6. Start the Application

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```
Backend runs on: http://localhost:4000

**Terminal 2 - Frontend:**
```bash
# From project root
npm run dev
```
Frontend runs on: http://localhost:3000

### 7. Access the App

Open browser: http://localhost:3000

## Login Credentials

### Manager
- Username: `manager`
- Password: `manager123`

### Teams
- Usernames: `csk`, `mi`, `rcb`, `kkr`, `srh`, `gt`, `dc`
- Password: `team123` (all teams)

## What's Next?

As **Manager**:
1. Browse unsold players
2. Click "Put in Auction" for any player
3. Conduct physical bidding
4. Select winning team and amount
5. Click "Sell Player"

As **Team**:
1. Watch live auction
2. View your squad
3. Analyze your purchases
4. Check other teams' squads

## Troubleshooting

### Port Already in Use

**Backend**: Change port in `backend/src/server.ts`
```typescript
const PORT = process.env.PORT || 4000; // Change 4000 to another port
```

**Frontend**: Vite will auto-suggest alternate port

### Reset Database

```bash
cd backend
rm prisma/dev.db
npm run migrate
npm run seed
```

### Excel Import Not Working

- Ensure file is named `players.xlsx`
- Place in `data/` directory at project root
- Check column names match exactly (see `data/README.md`)

## Features

- Real-time auction updates
- Manager controls (player selection & selling)
- Team dashboards with analytics
- Live ticker banner
- Budget tracking
- Transaction history
- Squad management
- Other teams viewing

## Need Help?

See full documentation in `README.md`
