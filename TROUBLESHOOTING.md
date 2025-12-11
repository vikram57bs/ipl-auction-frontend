# Troubleshooting Guide

Common issues and their solutions for the IPL Auction Portal.

---

## Installation Issues

### Error: "Cannot find module 'xyz'"

**Cause:** Dependencies not installed

**Solution:**
```bash
# Backend
cd backend
rm -rf node_modules package-lock.json
npm install

# Frontend
cd ..
rm -rf node_modules package-lock.json
npm install
```

### Error: "Prisma schema validation failed"

**Cause:** Prisma client not generated

**Solution:**
```bash
cd backend
npm run prisma:generate
```

### Error: "Port 3000/4000 is already in use"

**Solution Option 1 - Kill existing process:**
```bash
# Find process
lsof -i :3000  # or :4000

# Kill process (replace PID with actual process ID)
kill -9 PID
```

**Solution Option 2 - Change port:**

For backend (port 4000):
- Edit `backend/src/server.ts`
- Change: `const PORT = process.env.PORT || 4000;` to another port
- Update frontend API URLs in `src/services/api.ts` and `src/services/socket.ts`

For frontend (port 3000):
- Vite will automatically prompt to use next available port
- Click Yes or press Enter

---

## Database Issues

### Error: "Database dev.db does not exist"

**Cause:** Database not created

**Solution:**
```bash
cd backend
npm run migrate
```

### Error: "Migration failed" or "Cannot read property 'map'"

**Cause:** Corrupted database or migration

**Solution - Reset database:**
```bash
cd backend
rm -rf prisma/dev.db prisma/dev.db-journal prisma/migrations
npm run migrate
npm run seed
```

### Error: "No players in database" after seed

**Cause:** Excel file not found or incorrect format

**Solution:**
1. Ensure `players.xlsx` is in `data/` directory
2. Check file name is exactly `players.xlsx`
3. Verify column names match (see `data/SAMPLE_PLAYERS.md`)
4. Re-run seed: `npm run seed`

### Players imported but not showing in UI

**Cause:** Status might be incorrect

**Solution - Check database:**
```bash
cd backend
npm run prisma:studio
```
- Open `Player` table
- Check `status` field is "UNSOLD" (not "unsold" or null)

---

## Authentication Issues

### Error: "Invalid credentials" with correct password

**Cause:** User not seeded or password mismatch

**Solution:**
```bash
cd backend
npm run seed
```

This will recreate all user accounts.

### Error: "No token provided"

**Cause:** Token not stored or expired

**Solution:**
1. Clear browser localStorage: DevTools → Application → Local Storage → Clear
2. Refresh page and login again

### Stuck on login page after successful login

**Cause:** Routing issue or role mismatch

**Solution:**
1. Open browser console (F12)
2. Check for errors
3. Clear localStorage and try again
4. Verify user role in database:
   ```bash
   npm run prisma:studio
   # Check User table → role field
   ```

### Redirected to login after accessing protected route

**Cause:** Token expired or invalid

**Solution:**
- Login again (tokens expire after 24 hours)
- Check browser console for specific error

---

## Real-time / Socket.IO Issues

### Live updates not working

**Cause 1:** Socket.IO not connected

**Check connection:**
- Open browser DevTools → Network tab
- Filter by "WS" (WebSocket)
- Look for connection to localhost:4000
- Should show "101 Switching Protocols"

**Solution if not connected:**
1. Verify backend is running
2. Check CORS settings in `backend/src/server.ts`
3. Ensure frontend socket URL is correct in `src/services/socket.ts`

**Cause 2:** Event listeners not registered

**Solution:**
- Refresh page
- Check browser console for errors
- Verify Socket.IO client version matches server version

### Updates work for manager but not teams (or vice versa)

**Cause:** Some clients not receiving broadcasts

**Solution:**
1. Refresh affected client browsers
2. Check if backend console shows "Client connected"
3. Restart backend server

### Delayed updates (> 1 second)

**Cause:** Network latency or server performance

**Solution:**
1. Check if backend is under heavy load
2. Restart backend: `Ctrl+C` then `npm run dev`
3. Clear browser cache

---

## UI / Display Issues

### Blank page or "Loading..." forever

**Check:**
1. Backend is running (http://localhost:4000/health should return `{"status":"ok"}`)
2. Browser console for errors (F12)
3. Network tab for failed requests

**Solution:**
```bash
# Restart backend
cd backend
npm run dev

# In another terminal, restart frontend
cd ..
npm run dev
```

### Styles not loading / UI looks broken

**Cause:** Tailwind not compiled or CSS not loaded

**Solution:**
```bash
# Rebuild
npm run build

# Or restart dev server
npm run dev
```

### Ticker not scrolling

**Cause:** CSS animation not applied

**Solution:**
1. Hard refresh: `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)
2. Check `src/index.css` has ticker animations
3. Clear browser cache

### Data not updating after action (sell player, etc.)

**Cause:** State not refreshing

**Solution:**
1. Check browser console for errors
2. Verify API response is successful (Network tab)
3. Refresh page manually
4. Check if Socket.IO is connected

---

## API / Backend Issues

### Error: "Failed to fetch"

**Cause:** Backend not running or wrong URL

**Check:**
```bash
# Test backend health
curl http://localhost:4000/health
# Should return: {"status":"ok"}
```

**Solution:**
1. Start backend: `cd backend && npm run dev`
2. Verify backend logs show "Server running on http://localhost:4000"

### Error: "Insufficient team budget"

**Cause:** Team doesn't have enough money

**Solution:**
1. Check team's remaining budget in Team panel
2. Choose a lower amount
3. Or reset database to restore budgets:
   ```bash
   cd backend
   rm prisma/dev.db
   npm run migrate
   npm run seed
   ```

### Error: "No player currently in auction"

**Cause:** No player in IN_AUCTION status

**Solution:**
1. Manager must click "Put in Auction" for a player first
2. Check if player status is stuck (use Prisma Studio)
3. Restart backend if issue persists

### API returns 401 Unauthorized

**Cause:** Token missing or invalid

**Solution:**
1. Logout and login again
2. Check localStorage has valid token
3. Verify JWT_SECRET matches between requests

### API returns 403 Forbidden

**Cause:** User doesn't have required role

**Solution:**
- Verify you're logged in with correct account
- Managers can't access team-only routes and vice versa
- Check user role in database (Prisma Studio)

---

## Build / Compilation Issues

### TypeScript errors during build

**Common errors:**

**"Cannot find module"**
```bash
npm install
```

**"Property does not exist"**
- Check for typos in property names
- Verify types match API response

**"Argument of type X is not assignable to Y"**
- Check function signatures
- Add proper type annotations

### Vite build fails

**Solution:**
```bash
# Clear cache
rm -rf node_modules .vite dist
npm install
npm run build
```

### ESLint errors

**Solution:**
```bash
# Fix auto-fixable issues
npm run lint

# Or disable specific rules in eslint.config.js
```

---

## Excel Import Issues

### "Excel file not found"

**Checklist:**
- [ ] File exists at `data/players.xlsx` (from project root)
- [ ] File name is exactly `players.xlsx` (not `Players.xlsx` or `players.xls`)
- [ ] File is in correct directory

**Verify:**
```bash
ls -la data/players.xlsx
# Should show file details
```

### "Error importing player X"

**Cause:** Invalid or missing data in Excel

**Solution:**
1. Open `players.xlsx`
2. Check row for player X
3. Verify all columns have valid values
4. Ensure numeric columns contain numbers (not text)
5. Check for special characters or formulas

### All players show 0 stats

**Cause:** Column names don't match expected format

**Solution:**
- Verify column headers exactly match:
  - `Player`, `Age`, `Type`, `Matches`, `Runs`, `50s`, `100s`, `SR`, `Wickets`, `Economy`
- Column names are case-sensitive
- No extra spaces before/after column names

### Players imported with wrong role

**Cause:** Invalid value in `Type` column

**Solution:**
- Use only these exact values:
  - `Batsman`
  - `Bowler`
  - `All-Rounder`
  - `Wicket-Keeper`
- Check for typos or extra spaces

---

## Performance Issues

### Slow page load

**Solutions:**
1. Clear browser cache
2. Check if backend is running on same machine
3. Reduce number of players in database
4. Use production build: `npm run build && npm run preview`

### Laggy animations

**Solutions:**
1. Close other browser tabs
2. Disable browser extensions
3. Use Chrome/Firefox (better performance than Safari)
4. Check CPU usage (close other apps)

### Socket.IO reconnecting frequently

**Cause:** Network instability or backend crashes

**Check backend console for errors**

**Solution:**
1. Restart backend
2. Check firewall isn't blocking WebSocket
3. Increase Socket.IO timeout in `backend/src/socket.ts`

---

## Data / State Issues

### Player sold but still shows as UNSOLD

**Cause:** Database not updated or state not synced

**Solution:**
```bash
# Check database
cd backend
npm run prisma:studio
# Look at Player table → status field

# If stuck, restart backend
npm run dev
```

### Team budget not updating

**Cause:** Transaction failed or state not refreshed

**Solution:**
1. Check browser console for errors
2. Refresh page
3. Verify in database:
   ```bash
   npm run prisma:studio
   # Check Team table → remainingBudget
   ```

### Duplicate players in squad

**Cause:** Database constraint issue

**Solution:**
```bash
cd backend
rm prisma/dev.db
npm run migrate
npm run seed
```

### Missing transactions in history

**Cause:** Transaction not created or query issue

**Check:**
```bash
npm run prisma:studio
# Check AuctionTransaction table
```

---

## Development Issues

### Hot reload not working

**Frontend:**
- Restart Vite: `Ctrl+C` then `npm run dev`
- Clear `.vite` cache: `rm -rf .vite`

**Backend:**
- TSX should auto-reload
- If not, restart: `Ctrl+C` then `npm run dev`
- Check `tsx watch` is running (not plain `node`)

### Changes not reflecting

**Solution:**
1. Hard refresh browser: `Ctrl+Shift+R`
2. Clear browser cache
3. Restart dev server
4. Check file is saved

### Browser console errors

**Common errors:**

**"Failed to fetch"**
- Backend not running
- Wrong API URL

**"TypeError: Cannot read property 'X'"**
- Object is null/undefined
- Check API response structure

**"WebSocket connection failed"**
- Backend not running
- CORS issue
- Wrong socket URL

---

## Production Deployment Issues

### Build succeeds but app doesn't work

**Checklist:**
- [ ] Update API URLs to production backend
- [ ] Set environment variables
- [ ] Database migrated
- [ ] CORS configured for production domain
- [ ] HTTPS enabled

### Socket.IO not working in production

**Cause:** WebSocket blocked or wrong URL

**Solution:**
1. Ensure HTTPS for WebSocket (wss://)
2. Check proxy/load balancer WebSocket support
3. Verify CORS allows production origin

### JWT tokens not working

**Cause:** JWT_SECRET mismatch or not set

**Solution:**
```bash
export JWT_SECRET="your-secure-production-secret"
```
- Use same secret across all backend instances
- Use long, random string (32+ characters)

---

## Getting Help

If issue persists:

1. **Check logs:**
   - Backend: Console output
   - Frontend: Browser DevTools console
   - Database: `npm run prisma:studio`

2. **Verify setup:**
   - Backend running on 4000
   - Frontend running on 3000
   - Database exists and seeded
   - Both terminals show no errors

3. **Reset everything:**
   ```bash
   # Backend
   cd backend
   rm -rf node_modules prisma/dev.db
   npm install
   npm run prisma:generate
   npm run migrate
   npm run seed
   npm run dev

   # Frontend (new terminal)
   cd ..
   rm -rf node_modules dist
   npm install
   npm run dev
   ```

4. **Still stuck?**
   - Review README.md for setup steps
   - Check ARCHITECTURE.md for system design
   - Verify all files are present
   - Ensure Node.js version is 18+

---

## Quick Fixes

```bash
# Complete reset
cd backend && rm -rf node_modules prisma/dev.db && npm install && npm run prisma:generate && npm run migrate && npm run seed && cd .. && rm -rf node_modules dist && npm install && npm run dev

# Backend only reset
cd backend && rm prisma/dev.db && npm run migrate && npm run seed && npm run dev

# Frontend only reset
rm -rf node_modules dist .vite && npm install && npm run dev

# Database only reset
cd backend && rm prisma/dev.db prisma/dev.db-journal && npm run migrate && npm run seed
```

---

**Pro Tip:** Keep both backend and frontend terminals visible to catch errors immediately!
