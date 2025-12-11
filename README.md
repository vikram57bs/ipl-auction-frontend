# IPL Auction Portal

A comprehensive web application for managing offline IPL-style cricket auctions with real-time updates, rich visuals, and analytics.

## Features

- **Manager Dashboard**: Control auctions, select players, and manage sales
- **Team Portal**: View live auctions, manage squad, analyze purchases, and spy on other teams
- **Real-time Updates**: Socket.IO powered live updates across all connected clients
- **Rich Analytics**: Detailed team statistics and spending analysis
- **Animated UI**: Smooth transitions, ticker banners, and visual feedback
- **Excel Import**: Bulk player data import from Excel files

## Tech Stack

### Backend
- Node.js + Express
- TypeScript
- Prisma ORM
- SQLite (local database)
- Socket.IO (real-time updates)
- JWT authentication

### Frontend
- React 18
- TypeScript
- Vite
- Tailwind CSS
- React Router
- Socket.IO Client

## Project Structure

```
ipl-auction-portal/
├── backend/                 # Backend server
│   ├── prisma/
│   │   └── schema.prisma   # Database schema
│   ├── src/
│   │   ├── middleware/     # Auth middleware
│   │   ├── routes/         # API routes
│   │   ├── utils/          # Utility functions
│   │   ├── server.ts       # Main server file
│   │   ├── socket.ts       # Socket.IO setup
│   │   └── seed.ts         # Database seeding
│   ├── package.json
│   └── tsconfig.json
├── data/                    # Player data directory
│   ├── players.xlsx        # Place your Excel file here
│   └── README.md
├── src/                     # Frontend source
│   ├── components/         # React components
│   ├── context/            # React context
│   ├── pages/              # Page components
│   ├── services/           # API and Socket services
│   └── App.tsx
└── package.json
```

## Setup Instructions

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn or pnpm

### Step 1: Install Dependencies

#### Install Backend Dependencies

```bash
cd backend
npm install
```

#### Install Frontend Dependencies

```bash
# From project root
npm install
```

### Step 2: Set Up Database with Prisma

#### Generate Prisma Client

```bash
cd backend
npm run prisma:generate
```

#### Run Database Migrations

```bash
npm run migrate
```

This will create the SQLite database file at `backend/prisma/dev.db` with all required tables.

### Step 3: Prepare Player Data

1. Place your **players.xlsx** file in the `data/` directory at the project root
2. The Excel file should have the following columns:
   - `Player` - Player name
   - `Age` - Age in years
   - `Type` - Role (Batsman, Bowler, All-Rounder, Wicket-Keeper)
   - `Matches` - Number of matches
   - `Runs` - Total runs scored
   - `50s` - Number of fifties
   - `100s` - Number of hundreds
   - `SR` - Strike rate
   - `Wickets` - Number of wickets
   - `Economy` - Economy rate
   - `BasePrice` (optional) - Base price in crores (defaults to 1.0)

See `data/README.md` for example format.

### Step 4: Seed the Database

Run the seed script to:
- Create the manager account
- Create 7 team accounts
- Import all players from the Excel file

```bash
cd backend
npm run seed
```

You should see output confirming:
- Manager user created
- 7 teams created (CSK, MI, RCB, KKR, SRH, GT, DC)
- Number of players imported

### Step 5: Start the Application

#### Start Backend Server (Terminal 1)

```bash
cd backend
npm run dev
```

Backend will start on: **http://localhost:4000**

#### Start Frontend Dev Server (Terminal 2)

```bash
# From project root
npm run dev
```

Frontend will start on: **http://localhost:3000**

### Step 6: Access the Application

Open your browser and navigate to: **http://localhost:3000**

## Login Credentials

### Manager Account
- Username: `manager`
- Password: `manager123`

### Team Accounts
All team passwords are: `team123`

- CSK: `csk`
- MI: `mi`
- RCB: `rcb`
- KKR: `kkr`
- SRH: `srh`
- GT: `gt`
- DC: `dc`

## How to Use

### As Manager

1. **Login** with manager credentials
2. **Select Players**: Browse unsold players, search by name, filter by role
3. **Put Player in Auction**: Click button to start auction for a player
4. **Conduct Physical Bidding**: Teams bid physically in the room
5. **Sell Player**: Select winning team and enter final amount
6. **Monitor**: View analytics, team budgets, and transaction history

### As Team

1. **Login** with team credentials
2. **Live Auction Tab**: Watch current auction in real-time
3. **My Squad Tab**: View your purchased players and budget
4. **Analytics Tab**: Analyze your purchases by role, spending patterns
5. **Other Teams Tab**: View other teams' squads and budgets

## Database Schema

### User
- id, username, passwordHash, role (MANAGER/TEAM), teamId

### Team
- id, name, initialBudget (100 Cr), remainingBudget

### Player
- id, name, age, role, stats (matches, runs, wickets, etc.)
- basePrice, status (UNSOLD/IN_AUCTION/SOLD)
- soldPrice, soldToTeamId

### AuctionTransaction
- id, playerId, teamId, amount, createdAt

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login

### Players
- `GET /api/players/unsold` - Get unsold players (Manager only)
- `GET /api/players/all` - Get all players

### Auction
- `POST /api/auction/current` - Set current player in auction (Manager only)
- `POST /api/auction/sell` - Sell player to team (Manager only)
- `GET /api/auction/state` - Get current auction state

### Teams
- `GET /api/teams/summary` - Get all teams summary
- `GET /api/teams/:id/squad` - Get team squad
- `GET /api/teams/:id/analytics` - Get team analytics

## Socket.IO Events

### Emitted by Server
- `auction:currentPlayerUpdated` - New player in auction
- `auction:playerSold` - Player sold to team
- `auction:stateSnapshot` - Full state snapshot on connection

### Emitted by Client
- `request:state` - Request current state

## Customization

### Change Team Budget

Edit `backend/src/seed.ts`:
```typescript
const INITIAL_BUDGET = 100.0; // Change to desired amount
```

### Add More Teams

1. Edit `backend/src/seed.ts` - Add team to TEAMS array
2. Re-run seed script

### Styling

- Colors: Edit Tailwind config in `tailwind.config.js`
- Animations: Modify `src/index.css`
- Components: Update individual component files

## Troubleshooting

### Port Already in Use

If ports 3000 or 4000 are in use:

**Backend**: Edit `backend/src/server.ts`:
```typescript
const PORT = process.env.PORT || 4000; // Change to available port
```

**Frontend**: Vite will prompt to use alternate port automatically

### Database Errors

Reset database:
```bash
cd backend
rm prisma/dev.db
npm run migrate
npm run seed
```

### Excel Import Issues

- Ensure column names match exactly (case-sensitive)
- Check that numeric columns contain valid numbers
- Verify file is named `players.xlsx` and placed in `data/` directory

### Socket Connection Issues

- Ensure backend is running on port 4000
- Check CORS settings in `backend/src/server.ts` if frontend port changes
- Clear browser cache and reload

## Production Deployment

### Backend

1. Build TypeScript:
```bash
cd backend
npm run build
```

2. Set environment variables:
```bash
export JWT_SECRET="your-secure-secret-key"
export PORT=4000
```

3. Run production server:
```bash
npm start
```

### Frontend

1. Update API URLs in `src/services/api.ts` and `src/services/socket.ts`
2. Build for production:
```bash
npm run build
```

3. Serve the `dist` folder using any static hosting service

## Architecture

```
┌─────────────┐         ┌──────────────┐
│   Browser   │ ◄──────►│   Frontend   │
│  (Manager)  │  HTTP   │   (Vite)     │
└─────────────┘ WebSocket└─────┬────────┘
                              │
┌─────────────┐               │
│   Browser   │               │
│   (Teams)   │ ◄─────────────┤
└─────────────┘               │
                              ▼
                     ┌─────────────────┐
                     │   Backend       │
                     │   (Express)     │
                     │                 │
                     │  ┌───────────┐  │
                     │  │ Socket.IO │  │
                     │  └───────────┘  │
                     │                 │
                     │  ┌───────────┐  │
                     │  │ REST API  │  │
                     │  └───────────┘  │
                     └────────┬────────┘
                              │
                              ▼
                     ┌─────────────────┐
                     │    SQLite       │
                     │  (Prisma ORM)   │
                     └─────────────────┘
```

## License

MIT

## Support

For issues or questions, please create an issue in the project repository.
