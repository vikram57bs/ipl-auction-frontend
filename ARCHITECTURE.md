# IPL Auction Portal - Architecture Documentation

## System Overview

The IPL Auction Portal is a full-stack web application designed to manage offline cricket auctions with real-time updates and analytics.

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Clients                              │
│  ┌────────────────┐              ┌─────────────────┐        │
│  │   Manager      │              │   Team 1-7      │        │
│  │   Browser      │              │   Browsers      │        │
│  └───────┬────────┘              └────────┬────────┘        │
└──────────┼──────────────────────────────┼──────────────────┘
           │                              │
           │ HTTP/WebSocket               │ HTTP/WebSocket
           │                              │
           └──────────────┬───────────────┘
                          │
┌─────────────────────────┴──────────────────────────────────┐
│                  Frontend (React + Vite)                    │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  - React Router (routing)                            │   │
│  │  - Auth Context (authentication)                     │   │
│  │  - Socket.IO Client (real-time)                      │   │
│  │  - API Service (REST calls)                          │   │
│  │  - Tailwind CSS (styling)                            │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────┬──────────────────────────────────┘
                          │
                          │ Port 3000
                          │
┌─────────────────────────┴──────────────────────────────────┐
│              Backend (Node.js + Express)                    │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  REST API Endpoints                                  │   │
│  │  ├─ /api/auth/* (authentication)                     │   │
│  │  ├─ /api/players/* (player operations)               │   │
│  │  ├─ /api/auction/* (auction control)                 │   │
│  │  └─ /api/teams/* (team data)                         │   │
│  │                                                       │   │
│  │  Socket.IO Server                                    │   │
│  │  ├─ auction:currentPlayerUpdated                     │   │
│  │  ├─ auction:playerSold                               │   │
│  │  └─ auction:stateSnapshot                            │   │
│  │                                                       │   │
│  │  Middleware                                          │   │
│  │  ├─ authenticate (JWT verification)                  │   │
│  │  └─ requireRole (role-based access)                  │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────┬──────────────────────────────────┘
                          │ Port 4000
                          │
┌─────────────────────────┴──────────────────────────────────┐
│               Database Layer (Prisma ORM)                   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Models:                                             │   │
│  │  - User (authentication & roles)                     │   │
│  │  - Team (budget & info)                              │   │
│  │  - Player (stats & auction status)                   │   │
│  │  - AuctionTransaction (sales history)                │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────┬──────────────────────────────────┘
                          │
┌─────────────────────────┴──────────────────────────────────┐
│                SQLite Database (dev.db)                     │
│  - Local file-based database                                │
│  - No separate server required                              │
│  - Transactional support                                    │
└─────────────────────────────────────────────────────────────┘
```

## Component Architecture

### Frontend Components

```
src/
├── App.tsx                      # Main app with routing
├── context/
│   └── AuthContext.tsx          # Authentication state management
├── services/
│   ├── api.ts                   # REST API client
│   └── socket.ts                # Socket.IO client
├── pages/
│   ├── Login.tsx                # Login page (common)
│   ├── ManagerDashboard.tsx     # Manager-only dashboard
│   └── TeamPortal.tsx           # Team-only portal
└── components/
    ├── MainAuctionView.tsx      # Live auction display (shared)
    └── Ticker.tsx               # Scrolling transaction ticker
```

### Backend Architecture

```
backend/
├── src/
│   ├── server.ts                # Express app setup
│   ├── socket.ts                # Socket.IO configuration
│   ├── middleware/
│   │   └── auth.ts              # JWT auth & role checking
│   ├── routes/
│   │   ├── auth.ts              # Login endpoint
│   │   ├── players.ts           # Player operations
│   │   ├── auction.ts           # Auction control
│   │   └── teams.ts             # Team data
│   ├── utils/
│   │   └── auth.ts              # Password hashing & JWT
│   └── seed.ts                  # Database seeding
└── prisma/
    ├── schema.prisma            # Database schema
    └── migrations/              # Migration history
```

## Data Flow

### 1. Authentication Flow

```
User Input (username/password)
    ↓
API POST /api/auth/login
    ↓
Backend validates credentials
    ↓
JWT token generated
    ↓
Token + user info returned
    ↓
Frontend stores in localStorage
    ↓
Token sent in Authorization header for all requests
```

### 2. Auction Flow

```
Manager puts player in auction
    ↓
API POST /api/auction/current
    ↓
Backend updates player status to IN_AUCTION
    ↓
Socket.IO emits: auction:currentPlayerUpdated
    ↓
All connected clients receive update
    ↓
UI updates in real-time
    ↓
Physical bidding occurs
    ↓
Manager enters winning team & amount
    ↓
API POST /api/auction/sell
    ↓
Backend validates team budget
    ↓
Updates: Player (SOLD), Team (budget), Transaction
    ↓
Socket.IO emits: auction:playerSold
    ↓
All clients update: squad, budget, ticker, analytics
```

### 3. Real-time Update Flow

```
Client connects
    ↓
Socket.IO connection established
    ↓
Client emits: request:state
    ↓
Backend sends: auction:stateSnapshot
    ↓
Client renders current state
    ↓
On any auction event:
    ↓
Backend broadcasts to all clients
    ↓
Clients update UI without refresh
```

## Database Schema

### Entity Relationship Diagram

```
┌─────────────┐         ┌──────────────┐
│    User     │────────▶│     Team     │
│             │ teamId  │              │
│ - id        │         │ - id         │
│ - username  │         │ - name       │
│ - role      │         │ - budget     │
└─────────────┘         └──────┬───────┘
                               │
                               │ soldToTeamId
                               │
                               ▼
                        ┌──────────────┐
                        │    Player    │
                        │              │
                        │ - id         │
                        │ - name       │
                        │ - stats      │
                        │ - status     │
                        │ - soldPrice  │
                        └──────┬───────┘
                               │
                               │
                               ▼
                        ┌──────────────┐
                        │ Transaction  │
                        │              │
                        │ - playerId   │
                        │ - teamId     │
                        │ - amount     │
                        │ - timestamp  │
                        └──────────────┘
```

## Security Architecture

### Authentication
- **JWT Tokens**: Stateless authentication
- **Bcrypt Hashing**: Password security (10 rounds)
- **Token Expiry**: 24 hours

### Authorization
- **Role-based Access Control (RBAC)**:
  - MANAGER: Full auction control
  - TEAM: Read-only access + own team management
- **Middleware Guards**: Route protection
- **Protected Routes**: Frontend route guards

### API Security
- **CORS**: Configured for localhost:3000
- **Request Validation**: Input sanitization
- **Error Handling**: Secure error messages

## State Management

### Frontend State

**Global State (Context)**:
- `AuthContext`: User authentication state
  - user object
  - token
  - login/logout functions

**Local Component State**:
- Auction state (current player, teams, transactions)
- UI state (loading, errors, form inputs)

**Real-time State**:
- Socket.IO event listeners update component state
- React hooks (useState, useEffect) manage updates

### Backend State

**Stateless Design**:
- No server-side session storage
- All state persisted in database
- Socket.IO manages connections only

## Performance Considerations

### Frontend Optimization
- **Code Splitting**: React Router lazy loading
- **Memoization**: Prevent unnecessary re-renders
- **Tailwind CSS**: JIT compilation for minimal CSS

### Backend Optimization
- **Connection Pooling**: Prisma manages DB connections
- **Efficient Queries**: Select only needed fields
- **Socket.IO Namespaces**: Organized event handling

### Database Optimization
- **Indexes**: Primary keys, unique constraints
- **SQLite**: Fast for local deployments
- **Transaction Support**: ACID compliance

## Scalability Path

### Current (Local Development)
- SQLite database
- Single server instance
- Localhost deployment

### Future (Production)
- **Database**: Migrate to PostgreSQL/MySQL
- **Backend**: Deploy to cloud (AWS, Heroku, DigitalOcean)
- **Frontend**: Static hosting (Vercel, Netlify)
- **Real-time**: Redis adapter for Socket.IO
- **Load Balancing**: Multiple backend instances
- **Authentication**: OAuth providers

## Error Handling

### Frontend
- Try-catch blocks in async functions
- Error states in components
- User-friendly error messages
- Toast notifications

### Backend
- Global error handlers
- HTTP status codes
- Structured error responses
- Console logging for debugging

### Database
- Transaction rollbacks on errors
- Foreign key constraints
- NOT NULL constraints
- Unique constraints

## Testing Strategy

### Backend Testing
- Unit tests for utility functions
- Integration tests for API endpoints
- Database migration testing

### Frontend Testing
- Component unit tests
- Integration tests for user flows
- E2E tests for critical paths

## Deployment Checklist

### Environment Variables
```bash
# Backend
JWT_SECRET=your-secure-secret-key
PORT=4000

# Frontend
VITE_API_URL=http://your-backend-url
VITE_SOCKET_URL=http://your-backend-url
```

### Production Optimizations
- [ ] Change JWT secret
- [ ] Update CORS origins
- [ ] Enable HTTPS
- [ ] Migrate to production database
- [ ] Enable compression
- [ ] Add rate limiting
- [ ] Set up monitoring
- [ ] Configure logging

## Maintenance

### Database Migrations
```bash
# Create new migration
npx prisma migrate dev --name migration_name

# Apply migrations in production
npx prisma migrate deploy
```

### Adding Features
1. Update Prisma schema if needed
2. Run migrations
3. Update backend API
4. Update frontend types
5. Update UI components

### Monitoring
- Server logs for errors
- Database query performance
- Socket.IO connection metrics
- User session analytics

## References

- [Prisma Documentation](https://www.prisma.io/docs)
- [Socket.IO Documentation](https://socket.io/docs/)
- [React Documentation](https://react.dev)
- [Express Documentation](https://expressjs.com)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
