import admin from "firebase-admin";
import { readFileSync, existsSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

let db;

export const initFirebase = () => {
  if (admin.apps.length) {
    db = admin.firestore();
    return db;
  }

  const keyPath = path.join(__dirname, "..", "serviceAccountKey.json");

  if (existsSync(keyPath)) {
    // Option 1: Use service account key file
    const serviceAccount = JSON.parse(readFileSync(keyPath, "utf8"));
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    console.log("✅ Firebase initialized with service account key file");
  } else if (process.env.FIREBASE_PROJECT_ID) {
    // Option 2: Use individual environment variables
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        // Replace escaped newlines in the private key
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
      }),
    });
    console.log("✅ Firebase initialized with environment variables");
  } else {
    console.error("❌ No Firebase credentials found!");
    console.error("   → Place serviceAccountKey.json in Backend/ folder");
    console.error("   → Or set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY in .env");
    process.exit(1);
  }

  db = admin.firestore();
  return db;
};

export const getDB = () => {
  if (!db) {
    throw new Error("Firebase not initialized. Call initFirebase() first.");
  }
  return db;
};
