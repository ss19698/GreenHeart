
import 'dotenv/config';
import admin from 'firebase-admin';

if (!process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
  console.error('❌ Missing FIREBASE_SERVICE_ACCOUNT_KEY in .env');
  process.exit(1);
}

// Initialize Firebase Admin
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

// ── CHARITIES ─────────────────────────────────────────────────────────────

const charities = [
  { name: 'Golf for Good', description: 'Bringing golf to underserved youth communities worldwide.', category: 'Youth', emoji: '🏌️', featured: true, totalReceived: 14200 },
  { name: 'Green Fairways Foundation', description: 'Sustainable golf course ecology and environmental restoration.', category: 'Environment', emoji: '🌿', featured: false, totalReceived: 8900 },
  { name: 'Swing for Mental Health', description: 'Using golf therapy to support veterans and mental health recovery.', category: 'Health', emoji: '🧠', featured: true, totalReceived: 21000 },
  { name: 'Putts for Kids', description: "Children's hospital fundraising through community golf events.", category: 'Children', emoji: '👶', featured: false, totalReceived: 31700 },
  { name: 'Eagles for Education', description: 'Scholarships for young golfers from disadvantaged backgrounds.', category: 'Education', emoji: '🦅', featured: false, totalReceived: 17800 },
  { name: 'Birdies Against Hunger', description: 'Every birdie scored translates to a meal donated globally.', category: 'Hunger', emoji: '🍽️', featured: false, totalReceived: 9500 },
];

// ── SAMPLE DRAW ───────────────────────────────────────────────────────────

const sampleDraw = {
  month: 'March 2026',
  status: 'published',
  drawMode: 'random',
  winningNumbers: [18, 24, 31, 36, 42],
  jackpotRolledOver: false,
  prizes: {
    jackpotPoolTotal: 192000,
    pool4Total: 168000,
    pool3Total: 120000,
    perWinner5: 192000,
    perWinner4: 56000,
    perWinner3: 30000,
    rollsOver: false,
  },
};

// ── SEED FUNCTION ─────────────────────────────────────────────────────────

async function seed() {
  console.log('🌱 Seeding Firestore...\n');

  // Charities
  for (const c of charities) {
    const ref = await db.collection('charities').add({
      ...c,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    console.log(`✅ Charity: ${c.name} (${ref.id})`);
  }

  // Sample draw
  const drawRef = await db.collection('draws').add({
    ...sampleDraw,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  });
  console.log(`✅ Draw: ${sampleDraw.month} (${drawRef.id})`);

  // Admin user
  try {
    // Check if admin already exists
    let userRecord;
    try {
      userRecord = await admin.auth().getUserByEmail('admin@golfgives.com');
      console.log('ℹ️ Admin user already exists — skipping creation');
    } catch {
      // Create new admin user
      userRecord = await admin.auth().createUser({
        email: 'admin@golfgives.com',
        password: 'Admin@123456',
        displayName: 'Platform Admin',
      });
      console.log('✅ Admin user created');
    }

    // Set Firestore user doc
    await db.collection('users').doc(userRecord.uid).set({
      email: 'admin@golfgives.com',
      displayName: 'Platform Admin',
      role: 'admin',
      subscriptionStatus: 'active',
      subscriptionPlan: 'yearly',
      scores: [],
      charityId: null,
      charityContributionPercent: 10,
      totalWon: 0,
      drawsEntered: 0,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    }, { merge: true });

    console.log(`✅ Admin user doc set for UID: ${userRecord.uid}`);

  } catch (e) {
    console.error('Admin user error:', e.message);
  }

  console.log('\n🎉 Seed complete!');
  process.exit(0);
}

seed().catch(err => {
  console.error(err);
  process.exit(1);
});