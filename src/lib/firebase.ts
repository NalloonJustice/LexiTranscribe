import { initializeApp, getApps, getApp } from "firebase/app";
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut as fbSignOut, 
  onAuthStateChanged,
  User 
} from "firebase/auth";
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  getDocs, 
  getDoc, 
  query, 
  orderBy, 
  deleteDoc,
  serverTimestamp 
} from "firebase/firestore";
import type { TranscriptProject, ChatMessage, VeoVideoProject } from "../types";

// Firebase Applet Configuration
const firebaseConfig = {
  projectId: "gen-lang-client-0443938474",
  appId: "1:756738291524:web:31d7298712b0e4a789c911",
  apiKey: "AIzaSyCNtKIpwXKJD427lpGv4b3qJ0wGaG56Vtg",
  authDomain: "gen-lang-client-0443938474.firebaseapp.com",
  firestoreDatabaseId: "ai-studio-lexitranscribe-5d46d2c0-f260-4df3-b5e7-2000d47bb1e6",
  storageBucket: "gen-lang-client-0443938474.firebasestorage.app",
  messagingSenderId: "756738291524"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId || "(default)");
export const googleProvider = new GoogleAuthProvider();

export async function signInWithGoogle(): Promise<User | null> {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    if (result.user) {
      // Sync user profile to Firestore
      const userRef = doc(db, "users", result.user.uid);
      await setDoc(userRef, {
        displayName: result.user.displayName || "Lexi Operator",
        email: result.user.email,
        photoURL: result.user.photoURL,
        lastActive: serverTimestamp(),
        tier: "Pro Workspace"
      }, { merge: true });
    }
    return result.user;
  } catch (error) {
    console.error("Google Sign-In Error:", error);
    throw error;
  }
}

export async function signOutUser(): Promise<void> {
  await fbSignOut(auth);
}

// Save or Update Transcript Project
export async function saveTranscript(userId: string, project: TranscriptProject): Promise<void> {
  try {
    const docRef = doc(db, "users", userId, "transcripts", project.id);
    await setDoc(docRef, {
      ...project,
      updatedAt: Date.now()
    }, { merge: true });
  } catch (err) {
    console.warn("Firestore save transcript error (falling back to local cache):", err);
    // save to localStorage as backup
    const key = `lexi_transcripts_${userId}`;
    const existing = JSON.parse(localStorage.getItem(key) || "[]");
    const updated = [project, ...existing.filter((p: any) => p.id !== project.id)];
    localStorage.setItem(key, JSON.stringify(updated));
  }
}

// Fetch user transcripts
export async function getTranscripts(userId: string): Promise<TranscriptProject[]> {
  try {
    const colRef = collection(db, "users", userId, "transcripts");
    const q = query(colRef, orderBy("createdAt", "desc"));
    const snapshot = await getDocs(q);
    const results: TranscriptProject[] = [];
    snapshot.forEach((docSnap) => {
      results.push(docSnap.data() as TranscriptProject);
    });
    if (results.length > 0) return results;
  } catch (err) {
    console.warn("Firestore fetch transcripts error:", err);
  }

  // Fallback to local storage
  const key = `lexi_transcripts_${userId}`;
  return JSON.parse(localStorage.getItem(key) || "[]");
}

// Delete Transcript
export async function deleteTranscript(userId: string, transcriptId: string): Promise<void> {
  try {
    const docRef = doc(db, "users", userId, "transcripts", transcriptId);
    await deleteDoc(docRef);
  } catch (err) {
    console.warn("Firestore delete transcript error:", err);
  }
  const key = `lexi_transcripts_${userId}`;
  const existing = JSON.parse(localStorage.getItem(key) || "[]");
  const filtered = existing.filter((p: any) => p.id !== transcriptId);
  localStorage.setItem(key, JSON.stringify(filtered));
}

// Save Chat message
export async function saveChatMessage(userId: string, message: ChatMessage): Promise<void> {
  try {
    const docRef = doc(db, "users", userId, "chats", message.id);
    await setDoc(docRef, { ...message, createdAt: Date.now() }, { merge: true });
  } catch (err) {
    console.warn("Firestore save chat error:", err);
  }
}

// Save Veo Video
export async function saveVeoVideo(userId: string, video: VeoVideoProject): Promise<void> {
  try {
    const docRef = doc(db, "users", userId, "videos", video.id);
    await setDoc(docRef, video, { merge: true });
  } catch (err) {
    console.warn("Firestore save video error:", err);
  }
}
