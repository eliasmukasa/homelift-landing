// src/lib/firebase/FirebaseContext.tsx
// This file contains the Firebase Context, custom hook, and Provider component.
// It should be placed in your Next.js project, e.g., src/lib/firebase/FirebaseContext.tsx.

"use client"; // This is a Client Component, which needs access to browser APIs like process.env

import { useState, useEffect, createContext, useContext } from "react";
import { getDownloadURL, ref, uploadBytesResumable, getStorage } from 'firebase/storage';
import { initializeApp, getApps, getApp, FirebaseOptions, FirebaseApp } from 'firebase/app'; // Import FirebaseApp and FirebaseOptions
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged, User } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Define the type for the Firebase context value
export type FirebaseContextType = {
  db: any | null; // Firestore instance
  auth: any | null; // Auth instance
  storage: any | null; // Storage instance
  currentUser: User | null; // Current authenticated user
  userId: string | null; // Current user's UID
  isAuthReady: boolean; // Flag indicating if authentication state has been determined
  signInAdmin: (email: string, password: string) => Promise<any>; // Function to sign in admin
  signOutAdmin: () => Promise<void>; // Function to sign out admin
};

// Create the Firebase context
export const FirebaseContext = createContext<FirebaseContextType | undefined>(undefined);

// Custom hook to consume the Firebase context
export const useFirebase = () => {
  const context = useContext(FirebaseContext);
  if (!context) {
    // This error indicates useFirebase was called outside of a FirebaseProvider.
    // Ensure FirebaseProvider wraps the component tree that uses this hook.
    throw new Error('useFirebase must be used within a FirebaseProvider');
  }
  return context;
};

// Define a type that explicitly allows undefined for Firebase config properties
// This accurately reflects the type when reading directly from process.env
interface LooseFirebaseOptions {
  apiKey?: string;
  authDomain?: string;
  projectId?: string;
  storageBucket?: string;
  messagingSenderId?: string;
  appId?: string;
  measurementId?: string; // Optional in FirebaseOptions, so also optional here
}

// Type guard to check if the firebaseConfig object is fully defined and meets FirebaseOptions requirements
function isFirebaseOptions(config: LooseFirebaseOptions): config is FirebaseOptions {
  // Check that all required properties exist and are strings (not undefined, null, or empty string).
  // measurementId is optional in FirebaseOptions, so it's not strictly required here for the type guard.
  return (
    typeof config.apiKey === 'string' && config.apiKey.length > 0 &&
    typeof config.authDomain === 'string' && config.authDomain.length > 0 &&
    typeof config.projectId === 'string' && config.projectId.length > 0 &&
    typeof config.storageBucket === 'string' && config.storageBucket.length > 0 &&
    typeof config.messagingSenderId === 'string' && config.messagingSenderId.length > 0 &&
    typeof config.appId === 'string' && config.appId.length > 0
  );
}

// Firebase Provider Component responsible for initializing Firebase and managing auth state.
export const FirebaseProvider = ({ children }: { children: React.ReactNode }) => {
  const [db, setDb] = useState<any>(null);
  const [auth, setAuth] = useState<any>(null);
  const [storage, setStorage] = useState<any>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false); // Tracks if Firebase auth state has been initially checked

  useEffect(() => {
    // Define the Firebase configuration using Next.js environment variables.
    // These variables should be defined in your .env.local file for local development
    // and in your hosting provider's environment settings for deployment.
    // We use LooseFirebaseOptions to correctly type the potentially undefined values.
    const rawFirebaseConfig: LooseFirebaseOptions = {
      apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
      authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
      measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
    };

    // Use the type guard to check if the config is valid FirebaseOptions.
    // This explicitly checks for non-empty strings.
    if (!isFirebaseOptions(rawFirebaseConfig)) {
      console.error(
        "CRITICAL ERROR: Firebase configuration environment variables are incomplete or missing. " +
        "Please ensure all required NEXT_PUBLIC_FIREBASE_* variables are set in your .env.local " +
        "file (for local development) or your hosting provider's environment variables (for deployment)." +
        "Firebase functionality will be disabled."
      );
      // Set isAuthReady to true to prevent the loading spinner from hanging indefinitely,
      // but Firebase services will not be initialized.
      setIsAuthReady(true);
      setDb(null);
      setAuth(null);
      setStorage(null);
      setCurrentUser(null);
      setUserId(null);
      return;
    }

    // At this point, TypeScript knows that rawFirebaseConfig is indeed FirebaseOptions
    // due to the type guard, so we can safely use it.
    let app: FirebaseApp;
    try {
      // Initialize Firebase app. If an app has already been initialized (e.g., during Fast Refresh),
      // get the existing app instance to prevent re-initialization errors.
      if (getApps().length) {
        app = getApp();
      } else {
        app = initializeApp(rawFirebaseConfig); // Pass the now-validated config
      }

      // Get instances of Firebase services
      const firestore = getFirestore(app);
      const firebaseAuth = getAuth(app);
      const firebaseStorage = getStorage(app);

      // Set state with the initialized Firebase service instances
      setDb(firestore);
      setAuth(firebaseAuth);
      setStorage(firebaseStorage);

      // Set up an authentication state listener to track the current user.
      // This runs whenever the user's login status changes.
      const unsubscribe = onAuthStateChanged(firebaseAuth, (user) => {
        setCurrentUser(user);
        setUserId(user ? user.uid : null);
        setIsAuthReady(true); // Indicate that the initial authentication state check is complete
        console.log("Admin Auth state changed. User:", user ? user.email : "None");
      });

      // Cleanup function: unsubscribe from the auth listener when the component unmounts.
      return () => unsubscribe();
    } catch (error: any) {
      // Log any errors during Firebase initialization.
      console.error(
        "Failed to initialize Firebase for Admin. " +
        "Please check your environment variables, Firebase project settings, and internet connection:",
        error.message, error
      );
      // Ensure UI unblocks even on initialization error by setting isAuthReady to true.
      setDb(null);
      setAuth(null);
      setStorage(null);
    }
  }, []); // Empty dependency array ensures this effect runs only once on component mount

  // Function to sign in an admin user with email and password.
  const signInAdmin = async (email: string, password: string) => {
    if (!auth) {
      // If auth is not initialized (due to config error), throw an error.
      throw new Error("Firebase Auth not initialized. Check your environment variables.");
    }
    return await signInWithEmailAndPassword(auth, email, password);
  };

  // Function to sign out the current admin user.
  const signOutAdmin = async () => {
    if (!auth) {
      // If auth is not initialized, throw an error.
      throw new Error("Firebase Auth not initialized. Cannot sign out.");
    }
    await signOut(auth);
  };

  // The value provided to components wrapped by FirebaseContext.Provider.
  const contextValue = { db, auth, storage, currentUser, userId, isAuthReady, signInAdmin, signOutAdmin };

  return (
    <FirebaseContext.Provider value={contextValue}>
      {/* Show a loading indicator until the authentication state is determined. */}
      {!isAuthReady && (
        <div className="fixed inset-0 bg-gray-950 flex items-center justify-center text-white text-xl">
          Loading Admin Application...
        </div>
      )}
      {/* Render children components only when authentication readiness is determined. */}
      {isAuthReady && children}
    </FirebaseContext.Provider>
  );
};
