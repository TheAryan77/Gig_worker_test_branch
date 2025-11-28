import admin from "firebase-admin";

let firebaseApp = null;

export function initFirebase() {
  if (firebaseApp) return firebaseApp;

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const rawPrivateKey = process.env.FIREBASE_PRIVATE_KEY;

  if (!projectId || !clientEmail || !rawPrivateKey) {
    console.warn("[firebase] FIREBASE_PROJECT_ID/CLIENT_EMAIL/PRIVATE_KEY not fully set; Firestore will be disabled");
    return null;
  }

  const privateKey = rawPrivateKey.replace(/\\n/g, "\n");

  firebaseApp = admin.initializeApp({
    credential: admin.credential.cert({
      projectId,
      clientEmail,
      privateKey,
    }),
  });

  return firebaseApp;
}

export function getDb() {
  const app = initFirebase();
  return app ? admin.firestore() : null;
}

export { admin };
