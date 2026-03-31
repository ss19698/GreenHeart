# GreenHeart — Golf Charity Subscription Platform

A full-stack React + Firebase subscription platform combining golf performance tracking, charity fundraising, and a monthly prize draw engine.

---

## 🚀 Tech Stack

| Layer | Tech |
|---|---|
| Frontend | React 18, Vite, Tailwind CSS |
| Animations | Framer Motion |
| Auth | Firebase Authentication (Email + Google) |
| Database | Firebase Firestore |
| Storage | Firebase Storage |
| Forms | React Hook Form |
| Routing | React Router v6 |
| Toasts | React Hot Toast |

---

## 📁 Project Structure

```
src/
├── components/
│   ├── dashboard/
│   │   ├── ScoreManager.jsx      # Score CRUD (5-score rolling logic)
│   │   └── CharitySelector.jsx   # Charity picker + contribution slider
│   └── ui/
│       ├── Layout.jsx            # Page wrapper with Navbar + Footer
│       ├── Navbar.jsx            # Responsive nav with user menu
│       └── Footer.jsx
├── context/
│   └── AuthContext.jsx           # Firebase auth state + helpers
├── lib/
│   ├── firebase.js               # Firebase app init
│   ├── firestore.js              # All Firestore CRUD helpers
│   └── drawEngine.js             # Draw logic (random + algorithmic)
├── pages/
│   ├── HomePage.jsx              # Landing page with hero + features
│   ├── LoginPage.jsx             # Email + Google auth
│   ├── SignupPage.jsx            # User registration
│   ├── SubscribePage.jsx         # Plan selection (monthly/yearly)
│   ├── DashboardPage.jsx         # User dashboard
│   ├── CharitiesPage.jsx         # Charity directory
│   ├── CharityDetailPage.jsx     # Individual charity profile
│   ├── DrawsPage.jsx             # Monthly draw results
│   ├── AdminPage.jsx             # Full admin panel (nested routes)
│   └── NotFoundPage.jsx
└── styles/
    └── globals.css               # Tailwind + custom design tokens
```

---

## ⚙️ Setup

### 1. Clone and install
```bash
git clone <your-repo>
cd golf-charity-platform
npm install
```

### 2. Firebase setup
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Create a new project
3. Enable **Authentication** → Email/Password AND Google
4. Create a **Firestore Database** (start in test mode, then apply rules)
5. Create a **Storage bucket**
6. Go to Project Settings → Add Web App → copy config

### 3. Environment variables
```bash
cp .env.example .env.local
# Fill in your Firebase credentials
```

### 4. Deploy Firestore rules
```bash
npm install -g firebase-tools
firebase login
firebase init  # select Firestore + Hosting
firebase deploy --only firestore:rules
```

### 5. Seed sample data (optional)
```bash
node scripts/seed.js
```

### 6. Run dev server
```bash
npm run dev
```

---

## 🔐 User Roles

| Role | Access |
|---|---|
| Public | Home, Charities, Draws |
| Subscriber | + Dashboard, Score entry, Charity selection |
| Admin | + Full admin panel |

To make a user admin, manually set `role: "admin"` in their Firestore user document.

---

## 🏌️ Score Logic (PRD §05)

- Users enter up to **5 Stableford scores** (range: 1–45)
- Each score must include a date
- Scores stored as array in user document, sorted newest-first
- Adding a 6th score automatically removes the oldest
- Logic in `src/lib/firestore.js → addScore()`

---

## 🎰 Draw Engine (PRD §06–07)

### Random Mode
Standard lottery — 5 unique numbers from 1–45.

### Algorithmic Mode
Weighted draw based on frequency of user scores across all active subscribers. Can favour most or least common scores.

### Prize Pool Distribution
| Match | Pool Share | Rollover? |
|---|---|---|
| 5-Number | 40% (Jackpot) | ✅ Yes |
| 4-Number | 35% | ❌ No |
| 3-Number | 25% | ❌ No |

Logic in `src/lib/drawEngine.js`

---

## 🏗️ Deployment (Vercel)

1. Push to GitHub
2. Import into Vercel
3. Set environment variables (VITE_FIREBASE_*)
4. Deploy — Vercel handles the SPA routing automatically

For Firebase Hosting:
```bash
npm run build
firebase deploy --only hosting
```

---

## ✅ PRD Checklist

- [x] User signup & login (Email + Google)
- [x] Subscription flow (monthly + yearly plans)
- [x] Score entry — 5-score rolling logic with date
- [x] Draw system — random & algorithmic modes
- [x] Draw simulation & publish flow
- [x] Charity directory with search/filter
- [x] Charity contribution slider (10%–50%)
- [x] Winner verification flow (admin)
- [x] Payout status tracking (Pending → Approved → Paid)
- [x] User Dashboard — all modules
- [x] Admin Panel — users, draws, charities, winners, analytics
- [x] Responsive design (mobile-first)
- [x] Firestore security rules
- [x] Environment variable configuration
- [x] Seed script for demo data
