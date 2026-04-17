/**
 * localDB.js — NoRog Firebase Firestore Database Layer
 *
 * Firestore data layout:
 *   users/{userId}              ← name, email, hashedPassword, age, gender, location
 *   profiles/{userId}           ← health profile (symptoms, history, lifestyle, medicines)
 *   users/{userId}/symptom_logs/{logId}    ← symptom log entries
 *   users/{userId}/predictions/{predId}    ← AI prediction entries
 *   users/{userId}/whatif_logs/{logId}     ← what-if analysis entries
 *   users/{userId}/medicine_logs/{logId}   ← medicine interaction checks
 */

import { getDB } from "../config/db.js";

// ── Helpers ──────────────────────────────────────────────────────────────────

function db() {
  return getDB();
}

// ─────────────────────────────────────────────────────────────────────────────
// USER
// ─────────────────────────────────────────────────────────────────────────────

export async function createUser({ id, name, email, password }) {
  const userData = {
    id,
    name,
    email: email.toLowerCase(),
    password,
    createdAt: new Date().toISOString(),
  };
  await db().collection("users").doc(id).set(userData);
  return userData;
}

export async function findUserByEmail(email) {
  const snapshot = await db()
    .collection("users")
    .where("email", "==", email.toLowerCase())
    .limit(1)
    .get();

  if (snapshot.empty) return null;
  return snapshot.docs[0].data();
}

export async function findUserById(id) {
  const doc = await db().collection("users").doc(id).get();
  if (!doc.exists) return null;
  return doc.data();
}

export async function updateUser(id, updates) {
  const existing = await findUserById(id);
  if (!existing) return null;

  const updated = { ...existing, ...updates, id }; // always keep id
  await db().collection("users").doc(id).update(updates);
  return updated;
}

// ─────────────────────────────────────────────────────────────────────────────
// HEALTH PROFILE
// ─────────────────────────────────────────────────────────────────────────────

const DEFAULT_PROFILE = {
  currentSymptoms: [],
  medicalHistory: [],
  familyHistory: [],
  lifestyle: {},
  medicines: [],
  onboardingComplete: false,
  updatedAt: null,
};

export async function getProfile(userId) {
  const doc = await db().collection("profiles").doc(userId).get();
  if (!doc.exists) return { ...DEFAULT_PROFILE, userId };
  return { ...DEFAULT_PROFILE, ...doc.data(), userId };
}

export async function saveProfile(userId, data) {
  const existing = await getProfile(userId);
  const updated = {
    ...existing,
    ...data,
    userId,
    updatedAt: new Date().toISOString(),
  };
  await db().collection("profiles").doc(userId).set(updated, { merge: true });
  return updated;
}

// ─────────────────────────────────────────────────────────────────────────────
// SYMPTOM LOGS  (subcollection under users)
// ─────────────────────────────────────────────────────────────────────────────

export async function addSymptomLog(userId, log) {
  const entry = {
    userId,
    ...log,
    createdAt: new Date().toISOString(),
  };
  const docRef = await db()
    .collection("users")
    .doc(userId)
    .collection("symptom_logs")
    .add(entry);

  entry._id = docRef.id;
  // Also store the _id inside the document for consistency
  await docRef.update({ _id: docRef.id });
  return entry;
}

export async function getSymptomLogs(userId, limit = 50) {
  const snapshot = await db()
    .collection("users")
    .doc(userId)
    .collection("symptom_logs")
    .orderBy("createdAt", "desc")
    .limit(limit)
    .get();

  return snapshot.docs.map((doc) => doc.data());
}

export async function updateSymptomLog(userId, logId, updates) {
  const docRef = db()
    .collection("users")
    .doc(userId)
    .collection("symptom_logs")
    .doc(logId);

  const doc = await docRef.get();
  if (!doc.exists) return null;

  await docRef.update(updates);
  return { ...doc.data(), ...updates };
}

// ─────────────────────────────────────────────────────────────────────────────
// PREDICTIONS  (subcollection under users)
// ─────────────────────────────────────────────────────────────────────────────

export async function addPrediction(userId, data) {
  const entry = {
    userId,
    ...data,
    createdAt: new Date().toISOString(),
  };
  const docRef = await db()
    .collection("users")
    .doc(userId)
    .collection("predictions")
    .add(entry);

  entry._id = docRef.id;
  await docRef.update({ _id: docRef.id });
  return entry;
}

export async function getLatestPrediction(userId) {
  const snapshot = await db()
    .collection("users")
    .doc(userId)
    .collection("predictions")
    .orderBy("createdAt", "desc")
    .limit(1)
    .get();

  if (snapshot.empty) return null;
  return snapshot.docs[0].data();
}

// ─────────────────────────────────────────────────────────────────────────────
// WHAT-IF LOGS  (subcollection under users)
// ─────────────────────────────────────────────────────────────────────────────

export async function addWhatIfLog(userId, data) {
  const entry = {
    userId,
    ...data,
    createdAt: new Date().toISOString(),
  };
  const docRef = await db()
    .collection("users")
    .doc(userId)
    .collection("whatif_logs")
    .add(entry);

  entry._id = docRef.id;
  await docRef.update({ _id: docRef.id });
  return entry;
}

// ─────────────────────────────────────────────────────────────────────────────
// MEDICINE LOGS  (subcollection under users)
// ─────────────────────────────────────────────────────────────────────────────

export async function addMedicineLog(userId, data) {
  const entry = {
    userId,
    ...data,
    createdAt: new Date().toISOString(),
  };
  const docRef = await db()
    .collection("users")
    .doc(userId)
    .collection("medicine_logs")
    .add(entry);

  entry._id = docRef.id;
  await docRef.update({ _id: docRef.id });
  return entry;
}

export async function getLatestMedicineLog(userId) {
  const snapshot = await db()
    .collection("users")
    .doc(userId)
    .collection("medicine_logs")
    .orderBy("createdAt", "desc")
    .limit(1)
    .get();

  if (snapshot.empty) return null;
  return snapshot.docs[0].data();
}

// ─────────────────────────────────────────────────────────────────────────────
// UTILITIES
// ─────────────────────────────────────────────────────────────────────────────

let _counter = 0;
export function generateId() {
  return `${Date.now().toString(36)}${(++_counter).toString(36)}${Math.random().toString(36).slice(2, 6)}`;
}
