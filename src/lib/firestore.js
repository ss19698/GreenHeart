
import {
  collection, doc, getDoc, getDocs, setDoc, updateDoc,
  addDoc, deleteDoc, query, where, orderBy, limit,
  serverTimestamp, runTransaction, increment, onSnapshot,
  arrayUnion, writeBatch, or,
} from 'firebase/firestore';
import { db } from './firebase';

// ── USERS ──────────────────────────────────────────────────────────────────

export async function createUserProfile(uid, data) {
  await setDoc(doc(db, 'users', uid), {
    ...data,
    role: 'subscriber',
    subscriptionStatus: 'inactive',
    subscriptionPlan: null,
    subscriptionRenewalDate: null,
    scores: [],
    charityId: null,
    charityContributionPercent: 10,
    totalWon: 0,
    drawsEntered: 0,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export async function getUserProfile(uid) {
  const snap = await getDoc(doc(db, 'users', uid));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

export async function updateUserProfile(uid, data) {
  await updateDoc(doc(db, 'users', uid), {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

export function subscribeToUserProfile(uid, callback) {
  return onSnapshot(doc(db, 'users', uid), (snap) => {
    if (snap.exists()) callback({ id: snap.id, ...snap.data() });
  });
}

export async function getAllUsers() {
  const snap = await getDocs(collection(db, 'users'));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

// ── SCORES ─────────────────────────────────────────────────────────────────

export async function addScore(uid, scoreEntry) {
  const userRef = doc(db, 'users', uid);
  await runTransaction(db, async (tx) => {
    const userSnap = await tx.get(userRef);
    if (!userSnap.exists()) throw new Error('User not found');
    let scores = userSnap.data().scores || [];
    scores = [{ ...scoreEntry, id: crypto.randomUUID() }, ...scores];
    if (scores.length > 5) scores = scores.slice(0, 5);
    tx.update(userRef, { scores, updatedAt: serverTimestamp() });
  });
}

export async function updateScore(uid, scoreId, newData) {
  const userRef = doc(db, 'users', uid);
  await runTransaction(db, async (tx) => {
    const userSnap = await tx.get(userRef);
    if (!userSnap.exists()) throw new Error('User not found');
    const scores = (userSnap.data().scores || []).map(s =>
      s.id === scoreId ? { ...s, ...newData } : s
    );
    tx.update(userRef, { scores, updatedAt: serverTimestamp() });
  });
}

export async function deleteScore(uid, scoreId) {
  const userRef = doc(db, 'users', uid);
  await runTransaction(db, async (tx) => {
    const userSnap = await tx.get(userRef);
    if (!userSnap.exists()) throw new Error('User not found');
    const scores = (userSnap.data().scores || []).filter(s => s.id !== scoreId);
    tx.update(userRef, { scores, updatedAt: serverTimestamp() });
  });
}

// ── SUBSCRIPTIONS ──────────────────────────────────────────────────────────

export async function activateSubscription(uid, plan, paymentId = null) {
  const renewalDate = new Date();
  if (plan === 'monthly') renewalDate.setMonth(renewalDate.getMonth() + 1);
  else renewalDate.setFullYear(renewalDate.getFullYear() + 1);

  const batch = writeBatch(db);

  batch.update(doc(db, 'users', uid), {
    subscriptionStatus: 'active',
    subscriptionPlan: plan,
    subscriptionRenewalDate: renewalDate.toISOString(),
    updatedAt: serverTimestamp(),
  });

  const subRef = doc(collection(db, 'subscriptions'));
  batch.set(subRef, {
    userId: uid,
    plan,
    status: 'active',
    paymentId: paymentId || null,
    startDate: serverTimestamp(),
    renewalDate: renewalDate.toISOString(),
    amount: plan === 'monthly' ? 1999 : 19190,
    createdAt: serverTimestamp(),
  });

  await batch.commit();
}

export async function cancelSubscription(uid) {
  await updateDoc(doc(db, 'users', uid), {
    subscriptionStatus: 'cancelled',
    updatedAt: serverTimestamp(),
  });
}

// ── CHARITIES ──────────────────────────────────────────────────────────────

export async function getCharities() {
  const snap = await getDocs(collection(db, 'charities'));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function getCharity(id) {
  const snap = await getDoc(doc(db, 'charities', id));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

export async function createCharity(data) {
  return await addDoc(collection(db, 'charities'), {
    ...data,
    featured: false,
    totalReceived: 0,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export async function updateCharity(id, data) {
  await updateDoc(doc(db, 'charities', id), {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteCharity(id) {
  await deleteDoc(doc(db, 'charities', id));
}

export async function getDraws(limitCount = 10) {
  try {
    const q = query(
      collection(db, 'draws'),
      where('status', '==', 'published'), 
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
    console.log(snap)
  } catch (err) {
    console.error('getDraws error:', err.message);
    return [];
  }
}

export async function getLatestPublishedDraw() {
  try {
    const q = query(
      collection(db, 'draws'),
      where('status', '==', 'published'),
      orderBy('createdAt', 'desc'),
      limit(1)
    );
    const snap = await getDocs(q);
    return snap.docs.length ? { id: snap.docs[0].id, ...snap.docs[0].data() } : null;
  } catch (err) {
    console.error('getLatestPublishedDraw:', err.message);
    return null;
  }
}

export async function createDraw(data) {
  return await addDoc(collection(db, 'draws'), {
    ...data,
    status: 'draft',
    winningNumbers: [],
    jackpotRolledOver: false,
    createdAt: serverTimestamp(),
  });
}

export async function updateDraw(id, data) {
  await updateDoc(doc(db, 'draws', id), {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

// ── WINNERS ────────────────────────────────────────────────────────────────

export async function getWinners(drawId) {
  try {
    const q = query(collection(db, 'winners'), where('drawId', '==', drawId));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch (err) {
    console.error('getWinners:', err.message);
    return [];
  }
}

export async function getAllWinners() {
  try {
    const q = query(collection(db, 'winners'), orderBy('createdAt', 'desc'));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch (err) {
    console.error('getAllWinners:', err.message);
    return [];
  }
}

export async function createWinner(data) {
  return await addDoc(collection(db, 'winners'), {
    ...data,
    paymentStatus: 'pending',
    verified: false,
    createdAt: serverTimestamp(),
  });
}

export async function submitWinnerProof(winnerId, proofUrl) {
  await updateDoc(doc(db, 'winners', winnerId), {
    proofUrl,
    paymentStatus: 'proof_submitted',
    submittedAt: serverTimestamp(),
  });
}

export async function updateWinnerStatus(winnerId, status) {
  await updateDoc(doc(db, 'winners', winnerId), {
    paymentStatus: status,
    verified: status === 'approved' || status === 'paid',
    updatedAt: serverTimestamp(),
  });
}

// ── ORDERS (PAYMENTS) ─────────────────────────────────────────────────────

export async function createOrder(uid, orderData) {
  const ref = await addDoc(collection(db, 'orders'), {
    userId: uid,
    ...orderData,
    status: 'created',
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

export async function updateOrder(orderId, data) {
  await updateDoc(doc(db, 'orders', orderId), {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

export async function getUserOrders(uid) {
  const q = query(collection(db, 'orders'), where('userId', '==', uid), orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

// ── EMAIL LOGGING ─────────────────────────────────────────────────────────

export async function logEmail(uid, type, details = {}) {
  try {
    await addDoc(collection(db, 'emailLogs'), {
      userId: uid,
      type,
      ...details,
      sentAt: serverTimestamp(),
    });
  } catch { /* non-critical */ }
}

// ── ANALYTICS ─────────────────────────────────────────────────────────────

export async function getPlatformStats() {
  try {
    const [usersSnap, charitiesSnap, drawsSnap, winnersSnap] = await Promise.all([
      getDocs(collection(db, 'users')),
      getDocs(collection(db, 'charities')),
      getDocs(collection(db, 'draws')),
      getDocs(collection(db, 'winners')),
    ]);
    const users = usersSnap.docs.map(d => d.data());
    const activeSubscribers = users.filter(u => u.subscriptionStatus === 'active').length;
    const totalCharityContrib = users.reduce((s, u) => s + (u.totalCharityContributed || 0), 0);
    const monthlyRevenue = activeSubscribers * 19.99;
    const prizePool = monthlyRevenue * 0.40;
    return {
      totalUsers: users.length, activeSubscribers,
      totalCharities: charitiesSnap.size, totalDraws: drawsSnap.size,
      totalWinners: winnersSnap.size, totalCharityContrib,
      monthlyRevenue: monthlyRevenue.toFixed(2),
      prizePool: prizePool.toFixed(2),
    };
  } catch (err) {
    console.error('getPlatformStats:', err.message);
    return { totalUsers:0, activeSubscribers:0, totalCharities:0, totalDraws:0, totalWinners:0, totalCharityContrib:0, monthlyRevenue:'0', prizePool:'0' };
  }
}
