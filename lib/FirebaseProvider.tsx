"use client";
import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { auth, db, storage } from "@/lib/firebase";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  User,
} from "firebase/auth";

type Ctx = {
  db: typeof db;
  auth: typeof auth;
  storage: typeof storage;
  currentUser: User | null;
  authReady: boolean;
  signInAdmin: (e: string, p: string) => Promise<any>;
  signOutAdmin: () => Promise<void>;
};

const FirebaseCtx = createContext<Ctx | null>(null);
export const useFirebase = () => {
  const c = useContext(FirebaseCtx);
  if (!c) throw new Error("useFirebase must be inside <FirebaseProvider>");
  return c;
};

export function FirebaseProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authReady, setAuthReady]     = useState(false);

  useEffect(
    () => onAuthStateChanged(auth, u => {
      setCurrentUser(u);
      setAuthReady(true);
    }),
    []
  );

  const value: Ctx = {
    db,
    auth,
    storage,
    currentUser,
    authReady,
    signInAdmin : (e, p) => signInWithEmailAndPassword(auth, e, p),
    signOutAdmin: ()     => signOut(auth),
  };

  if (!authReady) {
    return (
      <div className="fixed inset-0 grid place-items-center bg-gray-950 text-white">
        Loading Admin Application…
      </div>
    );
  }

  return <FirebaseCtx.Provider value={value}>{children}</FirebaseCtx.Provider>;
}