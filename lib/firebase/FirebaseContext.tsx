// src/lib/firebase/FirebaseContext.tsx
// This file sets up Firebase, provides its instances via React Context,
// and handles the initial authentication state.

"use client"; // This directive marks this file as a Client Component,
             // allowing it to use React Hooks and access browser-specific APIs (like process.env for client-side environment variables).

import { useState, useEffect, createContext, useContext } from "react";
// Firebase App Initialization
import { initializeApp, getApps, getApp, FirebaseOptions, FirebaseApp } from 'firebase/app';
// Firebase Authentication
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged, User } from 'firebase/auth';
// Firebase Firestore Database
import { getFirestore } from 'firebase/firestore';
// Firebase Cloud Storage
import { getStorage } from 'firebase/storage';

/**
 * @typedef FirebaseContextType
 * @property {any | null} db - The Firestore database instance.
 * @property {any | null} auth - The Firebase Authentication instance.
 * @property {any | null} storage - The Firebase Cloud Storage instance.
 * @property {User | null} currentUser - The currently authenticated Firebase User object, or null if not logged in.
 * @property {string | null} userId - The UID of the current user, or null.
 * @property {boolean} isAuthReady - True if Firebase's initial authentication state check is complete.
 * @property {(email: string, password: string) => Promise<any>} signInAdmin - Function to sign in an admin user.
 * @property {() => Promise<void>} signOutAdmin - Function to sign out the current admin user.
 */
export type FirebaseContextType = {
  db: any | null;
  auth: any | null;
  storage: any | null;
  currentUser: User | null;
  userId: string | null;
  isAuthReady: boolean;
  signInAdmin: (email: string, password: string) => Promise<any>;
  signOutAdmin: () => Promise<void>;
};

/**
 * Creates the React Context for Firebase.
 * Components can consume this context to access Firebase services.
 */
export const FirebaseContext = createContext<FirebaseContextType | undefined>(undefined);

/**
 * Custom hook to easily access Firebase services from any component
 * wrapped by the FirebaseProvider.
 * @returns {FirebaseContextType} The Firebase context object.
 * @throws {Error} If used outside of a FirebaseProvider.
 */
export const useFirebase = () => {
  const context = useContext(FirebaseContext);
  if (!context) {
    throw new Error('useFirebase must be used within a FirebaseProvider.');
  }
  return context;
};

/**
 * @interface LooseFirebaseOptions
 * Represents the Firebase configuration object, allowing properties to be undefined.
 * This is useful when reading directly from process.env, as values might not be set.
 */
interface LooseFirebaseOptions {
  apiKey?: string;
  authDomain?: string;
  projectId?: string;
  storageBucket?: string;
  messagingSenderId?: string;
  appId?: string;
  measurementId?: string; // Optional: only if you use Google Analytics
}

/**
 * Type guard to check if the provided configuration object is a valid FirebaseOptions object.
 * It ensures all required properties are strings and not empty.
 * @param {LooseFirebaseOptions} config - The configuration object to validate.
 * @returns {boolean} True if the config is valid for Firebase initialization.
 */
function isValidFirebaseOptions(config: LooseFirebaseOptions): config is FirebaseOptions {
  return (
    typeof config.apiKey === 'string' && config.apiKey.length > 0 &&
    typeof config.authDomain === 'string' && config.authDomain.length > 0 &&
    typeof config.projectId === 'string' && config.projectId.length > 0 &&
    typeof config.storageBucket === 'string' && config.storageBucket.length > 0 &&
    typeof config.messagingSenderId === 'string' && config.messagingSenderId.length > 0 &&
    typeof config.appId === 'string' && config.appId.length > 0
  );
}

/**
 * @component FirebaseProvider
 * Provides Firebase service instances (Auth, Firestore, Storage) to its children.
 * It initializes Firebase once and manages the user's authentication state.
 * @param {React.PropsWithChildren} { children } - The child components to be rendered within the provider's scope.
 */
export const FirebaseProvider = ({ children }: { children: React.ReactNode }) => {
  const [db, setDb] = useState<any>(null);
  const [auth, setAuth] = useState<any>(null);
  const [storage, setStorage] = useState<any>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false); // Flag for initial auth state check completion

  useEffect(() => {
    // Construct the Firebase configuration from Next.js public environment variables.
    // These variables must be prefixed with NEXT_PUBLIC_ and defined in your .env.local file
    // for local development, and in your hosting provider's settings for deployment.
    const rawFirebaseConfig: LooseFirebaseOptions = {
      apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
      authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
      measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID, // Include if you use Analytics
    };

    // Validate the Firebase configuration.
    // If invalid, log a critical error and disable Firebase functionality.
    if (!isValidFirebaseOptions(rawFirebaseConfig)) {
      console.error(
        "CRITICAL ERROR: Firebase environment variables are incomplete or invalid. " +
        "Please ensure all required NEXT_PUBLIC_FIREBASE_* variables are set as non-empty strings " +
        "in your .env.local (for local dev) or deployment environment variables." +
        "Firebase functionality will be disabled."
      );
      setIsAuthReady(true); // Allow UI to render, but without Firebase functionality
      setDb(null);
      setAuth(null);
      setStorage(null);
      setCurrentUser(null);
      setUserId(null);
      return; // Stop initialization
    }

    // If validation passes, `rawFirebaseConfig` is now guaranteed to be `FirebaseOptions`.
    const firebaseConfig: FirebaseOptions = rawFirebaseConfig;
    let firebaseAppInstance: FirebaseApp;

    try {
      // Initialize Firebase app. If an app has already been initialized (e.g., due to Next.js Fast Refresh),
      // get the existing instance to prevent errors.
      if (getApps().length) {
        firebaseAppInstance = getApp();
      } else {
        firebaseAppInstance = initializeApp(firebaseConfig);
      }

      // Get instances of specific Firebase services
      const firestore = getFirestore(firebaseAppInstance);
      const firebaseAuth = getAuth(firebaseAppInstance);
      const firebaseStorage = getStorage(firebaseAppInstance); // Initialize storage

      // Store these instances in state
      setDb(firestore);
      setAuth(firebaseAuth);
      setStorage(firebaseStorage);

      // Set up a listener for authentication state changes.
      // This listener updates `currentUser` and `userId` state whenever the user logs in/out.
      const unsubscribe = onAuthStateChanged(firebaseAuth, (user) => {
        setCurrentUser(user);
        setUserId(user ? user.uid : null);
        setIsAuthReady(true); // Mark auth state check as complete
        console.log("Firebase Auth state changed. Current User:", user ? user.email : "None");
      });

      // Cleanup function: unsubscribe from the auth listener when the component unmounts.
      return () => unsubscribe();
    } catch (error: any) {
      console.error(
        "Failed to initialize Firebase services. " +
        "Please check your Firebase configuration and internet connection:",
        error.message, error
      );
      setIsAuthReady(true); // Ensure UI unblocks even on initialization failure
      setDb(null);
      setAuth(null);
      setStorage(null);
    }
  }, []); // Empty dependency array ensures this effect runs only once on mount

  /**
   * Signs in an admin user with email and password.
   * @param {string} email - The admin's email.
   * @param {string} password - The admin's password.
   * @returns {Promise<any>} A promise that resolves with user credentials.
   * @throws {Error} If Firebase Auth is not initialized.
   */
  const signInAdmin = async (email: string, password: string) => {
    if (!auth) {
      throw new Error("Firebase Auth service is not initialized. Cannot sign in.");
    }
    return await signInWithEmailAndPassword(auth, email, password);
  };

  /**
   * Signs out the current admin user.
   * @returns {Promise<void>} A promise that resolves when the user is signed out.
   * @throws {Error} If Firebase Auth is not initialized.
   */
  const signOutAdmin = async () => {
    if (!auth) {
      throw new Error("Firebase Auth service is not initialized. Cannot sign out.");
    }
    await signOut(auth);
  };

  /**
   * The value object passed down to all consumers of FirebaseContext.
   */
  const contextValue = { db, auth, storage, currentUser, userId, isAuthReady, signInAdmin, signOutAdmin };

  return (
    <FirebaseContext.Provider value={contextValue}>
      {/* Show a loading indicator until the Firebase authentication state is determined. */}
      {!isAuthReady && (
        <div className="fixed inset-0 bg-gray-950 flex items-center justify-center text-white text-xl z-50">
          Loading Admin Application...
        </div>
      )}
      {/* Render children only once the authentication state has been checked. */}
      {isAuthReady && children}
    </FirebaseContext.Provider>
  );
};
