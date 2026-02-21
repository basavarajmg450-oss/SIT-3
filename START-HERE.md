# PlacementPro - Quick Start

---

## ⚠️ If you see "Connection Failed" or "ERR_CONNECTION_REFUSED"

This means **no server is running** on the port you're trying to open (usually `http://localhost:3000`).

**Do this:**

1. **Start the backend first** (Terminal 1):
   ```bash
   cd placementpro-backend
   npm run dev
   ```
   Wait until you see: `🚀 PlacementPro Server running on port 5000`

2. **Start the frontend** (Terminal 2):
   ```bash
   cd placementpro-frontend
   npm run dev
   ```
   Wait until you see: `Local: http://localhost:3000`

3. **Open in your browser:** http://localhost:3000  
   (Use your normal browser, e.g. Chrome or Edge, not an in-app browser if it gives connection errors.)

**Or from project root (after one-time setup):**
```bash
npm install
npm run dev
```
This starts both backend and frontend together. Then open http://localhost:3000.

---

## If login fails, follow these steps in order:

### Step 1: Set up MongoDB

**Option A - MongoDB Atlas (recommended, free):**
1. Go to [mongodb.com/atlas](https://www.mongodb.com/atlas) and create a free account
2. Create a free cluster (M0)
3. Create a database user (note username & password)
4. Get connection string: Database → Connect → Connect your application
5. Copy the URI (e.g. `mongodb+srv://user:pass@cluster0.xxxxx.mongodb.net/`)

**Option B - Local MongoDB:**
- Install MongoDB Community Edition
- Use: `mongodb://localhost:27017/placementpro`

---

### Step 2: Configure Backend

```bash
cd placementpro-backend
```

Create or edit `.env` file with:

```
PORT=5000
MONGODB_URI=your_mongodb_connection_string_here
JWT_SECRET=any_random_string_at_least_32_characters_long
FRONTEND_URL=http://localhost:3000
```

Replace `your_mongodb_connection_string_here` with your Atlas URI + database name, e.g.:
`mongodb+srv://user:password@cluster0.xxxxx.mongodb.net/placementpro`

---

### Step 3: Install & Seed

```bash
cd placementpro-backend
npm install
npm run seed
```

You should see: `✅ Seed data created successfully!`

---

### Step 4: Start Backend

```bash
cd placementpro-backend
npm run dev
```

Keep this terminal open. You should see: `✅ MongoDB Connected` and `🚀 PlacementPro Server running on port 5000`

---

### Step 5: Start Frontend

Open a **new terminal**:

```bash
cd placementpro-frontend
npm install
npm run dev
```

Open http://localhost:3000 in your browser.

---

### Step 6: Login

1. Scroll to "Choose Your Dashboard"
2. Click "Login as Student" (or TPO / Alumni)
3. Click "Use demo credentials"
4. Click "Sign In"

**Demo credentials:** Email `student1@college.edu`, Password `Password123`

---

## Additional Features
- **Forgot Password:** Click "Reset here" in the login modal, enter email, check your inbox
- **Register:** Click "Don't have an account? Register" in the login modal
- **Postman:** Import `PlacementPro-API.postman_collection.json` for API testing

---

## Troubleshooting

| Error | Fix |
|-------|-----|
| **Connection Failed / ERR_CONNECTION_REFUSED** | Start **backend** first (`cd placementpro-backend` → `npm run dev`), then **frontend** (`cd placementpro-frontend` → `npm run dev`). Open http://localhost:3000 in your browser. |
| "Backend not running" | Run `npm run dev` in `placementpro-backend` and keep that terminal open. |
| "Server error. Check MongoDB" | Fix MONGODB_URI in `.env`, run `npm run seed` |
| "Invalid email or password" | Run `npm run seed` again to create users |
| MongoClientError / connection timeout | Check Atlas IP whitelist (allow 0.0.0.0/0 for testing) |
| Page loads but login/API fails | Backend must be running on port 5000. Restart `placementpro-backend` with `npm run dev`. |
