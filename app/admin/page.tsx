// HomeLift HCP Admin Panel - Unified Code for Canvas Environment
// IMPORTANT: For your actual Next.js project, you MUST separate this code into multiple files
// (e.g., FirebaseContext.tsx, app/admin/page.tsx) for proper modularity and compilation.
// This unified structure is specifically for compilation within this Canvas environment.

"use client"; // This directive marks the component as a Client Component.

import { useState, useEffect, createContext, useContext, useRef } from "react";
// Firebase App Initialization
import { initializeApp, getApps, getApp, FirebaseOptions, FirebaseApp } from 'firebase/app';
// Firebase Authentication
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged, User } from 'firebase/auth';
// Firebase Firestore Database
import { getFirestore, collection, query, getDocs, doc, setDoc, deleteDoc } from 'firebase/firestore';
// Firebase Cloud Storage
import { getStorage, getDownloadURL, ref, uploadBytesResumable } from 'firebase/storage';
// Heroicons for UI icons
import { XMarkIcon, PencilSquareIcon, TrashIcon, PlusCircleIcon, CheckCircleIcon, PhotoIcon } from "@heroicons/react/24/outline";

// --- 1. Firebase Context and Provider ---
// This section would typically be in src/lib/firebase/FirebaseContext.tsx in your Next.js project.

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
type FirebaseContextType = {
  db: any | null;
  auth: any | null;
  storage: any | null;
  currentUser: User | null;
  userId: string | null;
  isAuthReady: boolean;
  signInAdmin: (email: string, password: string) => Promise<any>;
  signOutAdmin: () => Promise<void>;
};

/** Creates the React Context for Firebase. */
const FirebaseContext = createContext<FirebaseContextType | undefined>(undefined);

/**
 * Custom hook to easily access Firebase services from any component
 * wrapped by the FirebaseProvider.
 * @returns {FirebaseContextType} The Firebase context object.
 * @throws {Error} If used outside of a FirebaseProvider.
 */
const useFirebase = () => { // Not exported as it's internal to this unified file
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
const FirebaseProvider = ({ children }: { children: React.ReactNode }) => { // Not exported, as it's used within this file's default export
  const [db, setDb] = useState<any>(null);
  const [auth, setAuth] = useState<any>(null);
  const [storage, setStorage] = useState<any>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);

  useEffect(() => {
    const rawFirebaseConfig: LooseFirebaseOptions = {
      apiKey: typeof process !== 'undefined' ? process.env.NEXT_PUBLIC_FIREBASE_API_KEY : undefined,
      authDomain: typeof process !== 'undefined' ? process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN : undefined,
      projectId: typeof process !== 'undefined' ? process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID : undefined,
      storageBucket: typeof process !== 'undefined' ? process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET : undefined,
      messagingSenderId: typeof process !== 'undefined' ? process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID : undefined,
      appId: typeof process !== 'undefined' ? process.env.NEXT_PUBLIC_FIREBASE_APP_ID : undefined,
      measurementId: typeof process !== 'undefined' ? process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID : undefined,
    };

    if (!isValidFirebaseOptions(rawFirebaseConfig)) {
      console.error(
        "CRITICAL ERROR: Firebase environment variables are incomplete or invalid. " +
        "Please ensure all required NEXT_PUBLIC_FIREBASE_* variables are set as non-empty strings " +
        "in your .env.local (for local dev) or deployment environment variables." +
        "Firebase functionality will be disabled."
      );
      setIsAuthReady(true);
      setDb(null);
      setAuth(null);
      setStorage(null);
      setCurrentUser(null);
      setUserId(null);
      return;
    }

    const firebaseConfig: FirebaseOptions = rawFirebaseConfig;
    let firebaseAppInstance: FirebaseApp;

    try {
      if (getApps().length) {
        firebaseAppInstance = getApp();
      } else {
        firebaseAppInstance = initializeApp(firebaseConfig);
      }

      const firestore = getFirestore(firebaseAppInstance);
      const firebaseAuth = getAuth(firebaseAppInstance);
      const firebaseStorage = getStorage(firebaseAppInstance);

      setDb(firestore);
      setAuth(firebaseAuth);
      setStorage(firebaseStorage);

      const unsubscribe = onAuthStateChanged(firebaseAuth, (user) => {
        setCurrentUser(user);
        setUserId(user ? user.uid : null);
        setIsAuthReady(true);
        console.log("Firebase Auth state changed. Current User:", user ? user.email : "None");
      });

      return () => unsubscribe();
    } catch (error: any) {
      console.error(
        "Failed to initialize Firebase services. " +
        "Please check your Firebase configuration and internet connection:",
        error.message, error
      );
      setIsAuthReady(true);
      setDb(null);
      setAuth(null);
      setStorage(null);
    }
  }, []);

  const signInAdmin = async (email: string, password: string) => {
    if (!auth) {
      throw new Error("Firebase Auth service is not initialized. Cannot sign in.");
    }
    return await signInWithEmailAndPassword(auth, email, password);
  };

  const signOutAdmin = async () => {
    if (!auth) {
      throw new Error("Firebase Auth service is not initialized. Cannot sign out.");
    }
    await signOut(auth);
  };

  const contextValue = { db, auth, storage, currentUser, userId, isAuthReady, signInAdmin, signOutAdmin };

  return (
    <FirebaseContext.Provider value={contextValue}>
      {!isAuthReady && (
        <div className="fixed inset-0 bg-gray-950 flex items-center justify-center text-white text-xl z-50">
          Loading Admin Application...
        </div>
      )}
      {isAuthReady && children}
    </FirebaseContext.Provider>
  );
};


// --- 2. HCP Profile Interfaces and Components ---
// This section would typically be part of app/admin/page.tsx or related components.

/**
 * @interface HcpProfile
 * Defines the comprehensive structure for a Home-Care Professional (HCP) profile.
 */
interface HcpProfile {
  id?: string; // Optional Firestore document ID for existing profiles
  fullName: string;
  primarySkill: string;
  experienceYears: number;
  bioSummary: string;
  locationPreference: string;
  profilePhotoUrl: string | null; // URL to their profile picture in Firebase Storage

  // New Fields for Robust Vetting & Profile
  dateOfBirth: string; // YYYY-MM-DD
  gender: 'Male' | 'Female' | 'Other' | '';
  maritalStatus: string;
  nationality: string;
  ninNumber: string; // National Identification Number
  policeClearanceStatus: 'Cleared' | 'Pending' | 'Not Cleared' | '';
  policeClearanceDate: string; // YYYY-MM-DD
  healthStatus: string; // E.g., 'Good', 'Chronic Condition (details)'

  emergencyContactName: string;
  emergencyContactPhone: string;
  emergencyContactRelationship: string;

  secondarySkills: string; // Comma-separated or short phrases
  specializedSkills: string; // Comma-separated certifications/specialties
  employmentHistory: string; // Free-text for now, can be array of objects later
  references: string; // Free-text for now, can be array of objects later

  availability: 'Full-time' | 'Part-time' | 'Live-in' | 'Live-out' | '';
  preferredWorkingHours: string; // E.g., 'Day', 'Night', 'Flexible'
  hasDrivingLicense: boolean;
  otherLanguages: string; // Comma-separated

  internalNotes: string; // For admin staff only

  [key: string]: any; // Allow for other flexible properties (e.g., internal status, creation date)
}

/**
 * @component UploadAvatar
 * Handles the selection and upload of an image file to Firebase Storage for an HCP's profile picture.
 */
const UploadAvatar: React.FC<{ onUploadSuccess: (url: string) => void; initialImageUrl?: string | null; }> = ({ onUploadSuccess, initialImageUrl }) => {
  const { storage } = useFirebase();
  const [file, setFile] = useState<File | null>(null);
  const [url, setUrl] = useState<string | null>(initialImageUrl || null);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (initialImageUrl && initialImageUrl !== url) {
      setUrl(initialImageUrl);
    }
  }, [initialImageUrl, url]);

  const onPick = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFile(null);
    setUrl(null);
    setProgress(0);
    setError(null);

    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const onUpload = async () => {
    if (!file) {
      setError("Please select a file first.");
      return;
    }
    if (!storage) {
      setError("Firebase Storage not initialized. Cannot upload. Check Firebase config.");
      console.error("Firebase storage instance is null.");
      return;
    }

    setUploading(true);
    setError(null);
    setProgress(0);

    const storageRef = ref(storage, `hcp_profile_pictures/${Date.now()}_${file.name}`);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const currentProgress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setProgress(currentProgress);
      },
      (uploadError: any) => {
        console.error("Upload failed:", uploadError);
        setError(`Upload failed: ${uploadError.message || 'Unknown error'}`);
        setUploading(false);
      },
      async () => {
        try {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          setUrl(downloadURL);
          onUploadSuccess(downloadURL);
          setError(null);
          console.log('File available at', downloadURL);

          if (fileInputRef.current) {
            fileInputRef.current.value = "";
          }
          setFile(null);
        } catch (urlError: any) {
          setError(`Failed to get download URL: ${urlError.message || 'Unknown error'}`);
          console.error("Failed to get download URL:", urlError);
        } finally {
          setUploading(false);
        }
      }
    );
  };

  return (
    <div className="space-y-4 p-4 border border-gray-700 rounded-lg bg-gray-700">
      <h3 className="text-lg font-semibold text-white">Profile Picture</h3>
      {url ? (
        <div className="flex flex-col items-center mb-4">
          <img src={url} alt="HCP Avatar" className="w-24 h-24 rounded-full object-cover border-2 border-blue-400 shadow-lg" />
          <p className="text-xs text-gray-400 break-all mt-2 text-center">{url}</p>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-24 w-24 rounded-full bg-gray-600 border border-gray-500 text-gray-400 mx-auto mb-4">
          <PhotoIcon className="h-10 w-10" />
          <p className="text-xs mt-1">No Image</p>
        </div>
      )}
      <div>
        <label htmlFor="file-upload" className="block text-gray-300 text-sm font-bold mb-2">
          Select New Image:
        </label>
        <input
          id="file-upload"
          type="file"
          accept="image/*"
          onChange={onPick}
          ref={fileInputRef}
          className="block w-full text-sm text-gray-400
            file:mr-4 file:py-2 file:px-4
            file:rounded-full file:border-0
            file:text-sm file:font-semibold
            file:bg-blue-500 file:text-white
            hover:file:bg-blue-600 transition duration-200"
        />
      </div>

      {file && (
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-500 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed w-full"
          onClick={onUpload}
          disabled={uploading}
        >
          {uploading ? `Uploading ${Math.round(progress)}%...` : 'Upload Selected Image'}
        </button>
      )}

      {progress > 0 && progress < 100 && (
        <div className="w-full bg-gray-600 rounded-full h-2.5 mt-2">
          <div
            className="bg-green-500 h-2.5 rounded-full"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      )}

      {error && <p className="text-red-400 text-sm mt-2 text-center">{error}</p>}
    </div>
  );
};

/**
 * @component HCPForm
 * A form for creating or editing Home-Care Professional (HCP) profiles.
 */
const HCPForm: React.FC<{ onSave: () => void; hcpToEdit?: HcpProfile | null; }> = ({ onSave, hcpToEdit }) => {
  const { db } = useFirebase();
  const [profile, setProfile] = useState<HcpProfile>(hcpToEdit || {
    fullName: '',
    primarySkill: '',
    experienceYears: 0,
    bioSummary: '',
    locationPreference: '',
    profilePhotoUrl: null,
    dateOfBirth: '',
    gender: '',
    maritalStatus: '',
    nationality: '',
    ninNumber: '',
    policeClearanceStatus: '',
    policeClearanceDate: '',
    healthStatus: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    emergencyContactRelationship: '',
    secondarySkills: '',
    specializedSkills: '',
    employmentHistory: '',
    references: '',
    availability: '',
    preferredWorkingHours: '',
    hasDrivingLicense: false,
    otherLanguages: '',
    internalNotes: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (hcpToEdit) {
      setProfile(hcpToEdit);
    } else {
      setProfile({
        fullName: '',
        primarySkill: '',
        experienceYears: 0,
        bioSummary: '',
        locationPreference: '',
        profilePhotoUrl: null,
        dateOfBirth: '',
        gender: '',
        maritalStatus: '',
        nationality: '',
        ninNumber: '',
        policeClearanceStatus: '',
        policeClearanceDate: '',
        healthStatus: '',
        emergencyContactName: '',
        emergencyContactPhone: '',
        emergencyContactRelationship: '',
        secondarySkills: '',
        specializedSkills: '',
        employmentHistory: '',
        references: '',
        availability: '',
        preferredWorkingHours: '',
        hasDrivingLicense: false,
        otherLanguages: '',
        internalNotes: '',
      });
    }
    setError(null);
    setSuccess(null);
  }, [hcpToEdit]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type, checked } = e.target as HTMLInputElement;
    setProfile(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : (name === 'experienceYears' ? Number(value) : value)
    }));
  };

  const handlePhotoUploadSuccess = (url: string) => {
    setProfile(prev => ({ ...prev, profilePhotoUrl: url }));
    setSuccess("Profile picture uploaded successfully!");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!db) {
      setError("Database not initialized. Cannot save profile.");
      return;
    }
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const hcpProfilesColRef = collection(db, 'hcpProfiles');

      if (profile.id) {
        const hcpDocRef = doc(db, 'hcpProfiles', profile.id);
        await setDoc(hcpDocRef, { ...profile, lastUpdated: new Date().toISOString() }, { merge: true });
        setSuccess("HCP profile updated successfully!");
      } else {
        await setDoc(doc(hcpProfilesColRef), { ...profile, dateCreated: new Date().toISOString(), internalStatus: "Pending Review" });
        setSuccess("New HCP profile created successfully!");
      }
      onSave();
    } catch (err: any) {
      setError(`Failed to save profile: ${err.message}`);
      console.error("Error saving HCP profile:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-gray-800 rounded-xl shadow-lg border border-gray-700">
      <h2 className="text-2xl font-bold text-white mb-6">
        {hcpToEdit ? 'Edit HCP Profile' : 'Create New HCP Profile'}
      </h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Profile Picture Upload Section */}
        <UploadAvatar
          onUploadSuccess={handlePhotoUploadSuccess}
          initialImageUrl={profile.profilePhotoUrl}
        />

        {/* BASIC INFORMATION */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="fullName" className="block text-gray-300 text-sm font-bold mb-2">Full Name</label>
            <input
              type="text"
              id="fullName"
              name="fullName"
              value={profile.fullName}
              onChange={handleChange}
              className="shadow appearance-none border rounded-xl w-full py-3 px-4 text-gray-900 leading-tight focus:outline-none focus:shadow-outline bg-gray-700 border-gray-600 focus:border-blue-500 placeholder-gray-400"
              placeholder="John Doe"
              required
            />
          </div>
          <div>
            <label htmlFor="dateOfBirth" className="block text-gray-300 text-sm font-bold mb-2">Date of Birth</label>
            <input
              type="date"
              id="dateOfBirth"
              name="dateOfBirth"
              value={profile.dateOfBirth}
              onChange={handleChange}
              className="shadow appearance-none border rounded-xl w-full py-3 px-4 text-gray-900 leading-tight focus:outline-none focus:shadow-outline bg-gray-700 border-gray-600 focus:border-blue-500 placeholder-gray-400"
              required
            />
          </div>
          <div>
            <label htmlFor="gender" className="block text-gray-300 text-sm font-bold mb-2">Gender</label>
            <select
              id="gender"
              name="gender"
              value={profile.gender}
              onChange={handleChange}
              className="shadow appearance-none border rounded-xl w-full py-3 px-4 text-gray-900 leading-tight focus:outline-none focus:shadow-outline bg-gray-700 border-gray-600 focus:border-blue-500"
              required
            >
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div>
            <label htmlFor="maritalStatus" className="block text-gray-300 text-sm font-bold mb-2">Marital Status</label>
            <input
              type="text"
              id="maritalStatus"
              name="maritalStatus"
              value={profile.maritalStatus}
              onChange={handleChange}
              className="shadow appearance-none border rounded-xl w-full py-3 px-4 text-gray-900 leading-tight focus:outline-none focus:shadow-outline bg-gray-700 border-gray-600 focus:border-blue-500 placeholder-gray-400"
              placeholder="Single, Married, Divorced, etc."
              required
            />
          </div>
          <div>
            <label htmlFor="nationality" className="block text-gray-300 text-sm font-bold mb-2">Nationality</label>
            <input
              type="text"
              id="nationality"
              name="nationality"
              value={profile.nationality}
              onChange={handleChange}
              className="shadow appearance-none border rounded-xl w-full py-3 px-4 text-gray-900 leading-tight focus:outline-none focus:shadow-outline bg-gray-700 border-gray-600 focus:border-blue-500 placeholder-gray-400"
              placeholder="Ugandan"
              required
            />
          </div>
          <div>
            <label htmlFor="ninNumber" className="block text-gray-300 text-sm font-bold mb-2">NIN Number</label>
            <input
              type="text"
              id="ninNumber"
              name="ninNumber"
              value={profile.ninNumber}
              onChange={handleChange}
              className="shadow appearance-none border rounded-xl w-full py-3 px-4 text-gray-900 leading-tight focus:outline-none focus:shadow-outline bg-gray-700 border-gray-600 focus:border-blue-500 placeholder-gray-400"
              placeholder="CMXXXXXXXXXX"
              required
            />
          </div>
        </div>

        {/* VETTING & HEALTH INFORMATION */}
        <h3 className="text-xl font-semibold text-white mt-8 mb-4 border-t border-gray-700 pt-6">Vetting & Health Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="policeClearanceStatus" className="block text-gray-300 text-sm font-bold mb-2">Police Clearance Status</label>
            <select
              id="policeClearanceStatus"
              name="policeClearanceStatus"
              value={profile.policeClearanceStatus}
              onChange={handleChange}
              className="shadow appearance-none border rounded-xl w-full py-3 px-4 text-gray-900 leading-tight focus:outline-none focus:shadow-outline bg-gray-700 border-gray-600 focus:border-blue-500"
              required
            >
              <option value="">Select Status</option>
              <option value="Cleared">Cleared</option>
              <option value="Pending">Pending</option>
              <option value="Not Cleared">Not Cleared</option>
            </select>
          </div>
          <div>
            <label htmlFor="policeClearanceDate" className="block text-gray-300 text-sm font-bold mb-2">Police Clearance Date</label>
            <input
              type="date"
              id="policeClearanceDate"
              name="policeClearanceDate"
              value={profile.policeClearanceDate}
              onChange={handleChange}
              className="shadow appearance-none border rounded-xl w-full py-3 px-4 text-gray-900 leading-tight focus:outline-none focus:shadow-outline bg-gray-700 border-gray-600 focus:border-blue-500 placeholder-gray-400"
            />
          </div>
          <div className="col-span-1 md:col-span-2">
            <label htmlFor="healthStatus" className="block text-gray-300 text-sm font-bold mb-2">Health Status / Medical Notes</label>
            <textarea
              id="healthStatus"
              name="healthStatus"
              value={profile.healthStatus}
              onChange={handleChange}
              rows={3}
              className="shadow appearance-none border rounded-xl w-full py-3 px-4 text-gray-900 leading-tight focus:outline-none focus:shadow-outline bg-gray-700 border-gray-600 focus:border-blue-500 placeholder-gray-400"
              placeholder="Any known health conditions, allergies, or medical notes relevant to their work."
            />
          </div>
        </div>

        {/* EMERGENCY CONTACT */}
        <h3 className="text-xl font-semibold text-white mt-8 mb-4 border-t border-gray-700 pt-6">Emergency Contact</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="emergencyContactName" className="block text-gray-300 text-sm font-bold mb-2">Contact Name</label>
            <input
              type="text"
              id="emergencyContactName"
              name="emergencyContactName"
              value={profile.emergencyContactName}
              onChange={handleChange}
              className="shadow appearance-none border rounded-xl w-full py-3 px-4 text-gray-900 leading-tight focus:outline-none focus:shadow-outline bg-gray-700 border-gray-600 focus:border-blue-500 placeholder-gray-400"
              placeholder="Jane Doe"
              required
            />
          </div>
          <div>
            <label htmlFor="emergencyContactPhone" className="block text-gray-300 text-sm font-bold mb-2">Contact Phone</label>
            <input
              type="tel" // Use type="tel" for phone numbers
              id="emergencyContactPhone"
              name="emergencyContactPhone"
              value={profile.emergencyContactPhone}
              onChange={handleChange}
              className="shadow appearance-none border rounded-xl w-full py-3 px-4 text-gray-900 leading-tight focus:outline-none focus:shadow-outline bg-gray-700 border-gray-600 focus:border-blue-500 placeholder-gray-400"
              placeholder="+2567XXXXXXXX"
              required
            />
          </div>
          <div className="col-span-1 md:col-span-2">
            <label htmlFor="emergencyContactRelationship" className="block text-gray-300 text-sm font-bold mb-2">Relationship</label>
            <input
              type="text"
              id="emergencyContactRelationship"
              name="emergencyContactRelationship"
              value={profile.emergencyContactRelationship}
              onChange={handleChange}
              className="shadow appearance-none border rounded-xl w-full py-3 px-4 text-gray-900 leading-tight focus:outline-none focus:shadow-outline bg-gray-700 border-gray-600 focus:border-blue-500 placeholder-gray-400"
              placeholder="Mother, Spouse, Sibling"
              required
            />
          </div>
        </div>

        {/* SKILLS & EXPERIENCE */}
        <h3 className="text-xl font-semibold text-white mt-8 mb-4 border-t border-gray-700 pt-6">Skills & Experience</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="primarySkill" className="block text-gray-300 text-sm font-bold mb-2">Primary Skill</label>
            <input
              type="text"
              id="primarySkill"
              name="primarySkill"
              value={profile.primarySkill}
              onChange={handleChange}
              className="shadow appearance-none border rounded-xl w-full py-3 px-4 text-gray-900 leading-tight focus:outline-none focus:shadow-outline bg-gray-700 border-gray-600 focus:border-blue-500 placeholder-gray-400"
              placeholder="Elderly Care, Childcare, Housekeeping"
              required
            />
          </div>
          <div>
            <label htmlFor="experienceYears" className="block text-gray-300 text-sm font-bold mb-2">Experience (Years)</label>
            <input
              type="number"
              id="experienceYears"
              name="experienceYears"
              value={profile.experienceYears}
              onChange={handleChange}
              className="shadow appearance-none border rounded-xl w-full py-3 px-4 text-gray-900 leading-tight focus:outline-none focus:shadow-outline bg-gray-700 border-gray-600 focus:border-blue-500"
              required
              min="0"
            />
          </div>
          <div className="col-span-1 md:col-span-2">
            <label htmlFor="secondarySkills" className="block text-gray-300 text-sm font-bold mb-2">Secondary Skills (comma-separated)</label>
            <input
              type="text"
              id="secondarySkills"
              name="secondarySkills"
              value={profile.secondarySkills}
              onChange={handleChange}
              className="shadow appearance-none border rounded-xl w-full py-3 px-4 text-gray-900 leading-tight focus:outline-none focus:shadow-outline bg-gray-700 border-gray-600 focus:border-blue-500 placeholder-gray-400"
              placeholder="Cooking, Cleaning, Driving"
            />
          </div>
          <div className="col-span-1 md:col-span-2">
            <label htmlFor="specializedSkills" className="block text-gray-300 text-sm font-bold mb-2">Specialized Skills / Certifications (comma-separated)</label>
            <input
              type="text"
              id="specializedSkills"
              name="specializedSkills"
              value={profile.specializedSkills}
              onChange={handleChange}
              className="shadow appearance-none border rounded-xl w-full py-3 px-4 text-gray-900 leading-tight focus:outline-none focus:shadow-outline bg-gray-700 border-gray-600 focus:border-blue-500 placeholder-gray-400"
              placeholder="First Aid Certified, Care for Elderly, Infant Care"
            />
          </div>
          <div className="col-span-1 md:col-span-2">
            <label htmlFor="employmentHistory" className="block text-gray-300 text-sm font-bold mb-2">Employment History</label>
            <textarea
              id="employmentHistory"
              name="employmentHistory"
              value={profile.employmentHistory}
              onChange={handleChange}
              rows={5}
              className="shadow appearance-none border rounded-xl w-full py-3 px-4 text-gray-900 leading-tight focus:outline-none focus:shadow-outline bg-gray-700 border-gray-600 focus:border-blue-500 placeholder-gray-400"
              placeholder="List previous employers, roles, and dates. E.g., 'Employer ABC, Maid, 2020-2022. Responsibilities: cooking, cleaning...'"
            />
          </div>
          <div className="col-span-1 md:col-span-2">
            <label htmlFor="references" className="block text-gray-300 text-sm font-bold mb-2">References</label>
            <textarea
              id="references"
              name="references"
              value={profile.references}
              onChange={handleChange}
              rows={3}
              className="shadow appearance-none border rounded-xl w-full py-3 px-4 text-gray-900 leading-tight focus:outline-none focus:shadow-outline bg-gray-700 border-gray-600 focus:border-blue-500 placeholder-gray-400"
              placeholder="List professional references with contact information. E.g., 'Name: John Smith, Relationship: Former Employer, Phone: +2567...'"
            />
          </div>
        </div>

        {/* AVAILABILITY & PREFERENCES */}
        <h3 className="text-xl font-semibold text-white mt-8 mb-4 border-t border-gray-700 pt-6">Availability & Preferences</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="availability" className="block text-gray-300 text-sm font-bold mb-2">Availability</label>
            <select
              id="availability"
              name="availability"
              value={profile.availability}
              onChange={handleChange}
              className="shadow appearance-none border rounded-xl w-full py-3 px-4 text-gray-900 leading-tight focus:outline-none focus:shadow-outline bg-gray-700 border-gray-600 focus:border-blue-500"
              required
            >
              <option value="">Select Availability</option>
              <option value="Full-time">Full-time</option>
              <option value="Part-time">Part-time</option>
              <option value="Live-in">Live-in</option>
              <option value="Live-out">Live-out</option>
            </select>
          </div>
          <div>
            <label htmlFor="preferredWorkingHours" className="block text-gray-300 text-sm font-bold mb-2">Preferred Working Hours</label>
            <input
              type="text"
              id="preferredWorkingHours"
              name="preferredWorkingHours"
              value={profile.preferredWorkingHours}
              onChange={handleChange}
              className="shadow appearance-none border rounded-xl w-full py-3 px-4 text-gray-900 leading-tight focus:outline-none focus:shadow-outline bg-gray-700 border-gray-600 focus:border-blue-500 placeholder-gray-400"
              placeholder="Day, Night, Flexible, 8 AM - 5 PM"
            />
          </div>
          <div className="col-span-1 md:col-span-2 flex items-center mt-2">
            <input
              type="checkbox"
              id="hasDrivingLicense"
              name="hasDrivingLicense"
              checked={profile.hasDrivingLicense}
              onChange={handleChange}
              className="form-checkbox h-5 w-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500 bg-gray-700"
            />
            <label htmlFor="hasDrivingLicense" className="ml-2 text-gray-300 text-sm font-bold">Has Driving License</label>
          </div>
          <div className="col-span-1 md:col-span-2">
            <label htmlFor="otherLanguages" className="block text-gray-300 text-sm font-bold mb-2">Other Languages (comma-separated)</label>
            <input
              type="text"
              id="otherLanguages"
              name="otherLanguages"
              value={profile.otherLanguages}
              onChange={handleChange}
              className="shadow appearance-none border rounded-xl w-full py-3 px-4 text-gray-900 leading-tight focus:outline-none focus:shadow-outline bg-gray-700 border-gray-600 focus:border-blue-500 placeholder-gray-400"
              placeholder="Luganda, Swahili, French"
            />
          </div>
        </div>

        {/* BIO SUMMARY & LOCATION */}
        <h3 className="text-xl font-semibold text-white mt-8 mb-4 border-t border-gray-700 pt-6">Bio & Location</h3>
        <div>
          <label htmlFor="bioSummary" className="block text-gray-300 text-sm font-bold mb-2">Bio Summary</label>
          <textarea
            id="bioSummary"
            name="bioSummary"
            value={profile.bioSummary}
            onChange={handleChange}
            rows={4}
            className="shadow appearance-none border rounded-xl w-full py-3 px-4 text-gray-900 leading-tight focus:outline-none focus:shadow-outline bg-gray-700 border-gray-600 focus:border-blue-500 placeholder-gray-400"
            placeholder="A brief summary of the HCP's background and experience."
            required
          />
        </div>
        <div>
          <label htmlFor="locationPreference" className="block text-gray-300 text-sm font-bold mb-2">Location Preference</label>
          <input
            type="text"
            id="locationPreference"
            name="locationPreference"
            value={profile.locationPreference}
            onChange={handleChange}
            className="shadow appearance-none border rounded-xl w-full py-3 px-4 text-gray-900 leading-tight focus:outline-none focus:shadow-outline bg-gray-700 border-gray-600 focus:border-blue-500 placeholder-gray-400"
            placeholder="Kampala, Entebbe, Wakiso"
            required
          />
        </div>

        {/* INTERNAL ADMIN NOTES */}
        <h3 className="text-xl font-semibold text-white mt-8 mb-4 border-t border-gray-700 pt-6">Internal Admin Notes</h3>
        <div>
          <label htmlFor="internalNotes" className="block text-gray-300 text-sm font-bold mb-2">Internal Notes (Only visible to HomeLift Admin)</label>
          <textarea
            id="internalNotes"
            name="internalNotes"
            value={profile.internalNotes}
            onChange={handleChange}
            rows={4}
            className="shadow appearance-none border rounded-xl w-full py-3 px-4 text-gray-900 leading-tight focus:outline-none focus:shadow-outline bg-gray-700 border-gray-600 focus:border-blue-500 placeholder-gray-400"
            placeholder="Add any internal notes about the HCP, vetting details, performance, etc."
          />
        </div>


        {/* Error and Success Messages */}
        {error && <p className="text-red-400 text-sm italic flex items-center gap-2"><XMarkIcon className="h-5 w-5"/> {error}</p>}
        {success && <p className="text-green-400 text-sm italic flex items-center gap-2"><CheckCircleIcon className="h-5 w-5"/> {success}</p>}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading} // Disable button while loading
          className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-6 rounded-xl w-full transition duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Saving...' : (hcpToEdit ? 'Update Profile' : 'Create Profile')}
        </button>
      </form>
    </div>
  );
};

// --- AdminPage Component ---
/**
 * @component AdminPage
 * The main administrative panel for HomeLift HCPs.
 * It handles admin login, displays a list of HCP profiles,
 * and provides functionality to add, edit, and delete profiles.
 */
function AdminPage() {
  // Access Firebase services and authentication state from the `useFirebase` hook.
  const { currentUser, signInAdmin, signOutAdmin, db, isAuthReady } = useFirebase();
  const [email, setEmail] = useState(''); // State for admin login email input
  const [password, setPassword] = useState(''); // State for admin login password input
  const [loginError, setLoginError] = useState<string | null>(null); // State for displaying login errors
  const [hcpList, setHcpList] = useState<HcpProfile[]>([]); // State to store the fetched list of HCP profiles
  const [loadingHCPs, setLoadingHCPs] = useState(true); // State to indicate if HCPs are currently being loaded
  const [selectedHCP, setSelectedHCP] = useState<HcpProfile | null>(null); // State to hold the HCP profile currently selected for editing
  const [showForm, setShowForm] = useState(false); // State to control the visibility of the HCP creation/edit form

  /**
   * Fetches the list of Home-Care Professional (HCP) profiles from Firestore.
   */
  const fetchHCPs = async () => {
    if (!db) {
      console.error("Firestore DB is not initialized. Cannot fetch HCPs.");
      return;
    }
    setLoadingHCPs(true); // Activate loading state for HCP list
    try {
      const q = query(collection(db, 'hcpProfiles')); // Create a query to get all documents from the 'hcpProfiles' collection
      const querySnapshot = await getDocs(q); // Execute the query to get documents
      // Map each document snapshot to an HcpProfile object, including its Firestore document ID.
      const hcps: HcpProfile[] = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() as HcpProfile }));
      setHcpList(hcps); // Update the state with the fetched HCP list
      console.log("Fetched HCPs:", hcps);
    } catch (error: any) {
      console.error("Error fetching HCPs:", error);
      setLoginError(`Failed to load HCPs: ${error.message}`); // Display error message to the user
    } finally {
      setLoadingHCPs(false); // Deactivate loading state
    }
  };

  /**
   * Effect hook to trigger fetching HCPs when Firebase authentication is ready,
   * a user is logged in, and the Firestore DB instance is available.
   */
  useEffect(() => {
    if (isAuthReady && currentUser && db) {
      fetchHCPs(); // Fetch HCPs only if conditions are met
    } else if (isAuthReady && !currentUser) {
      // If auth is ready but no user is logged in, stop the HCP loading indicator immediately.
      setLoadingHCPs(false);
    }
  }, [isAuthReady, currentUser, db]); // Dependencies for this effect: runs when these values change.

  /**
   * Handles the form submission for admin login.
   * @param {React.FormEvent} e - The form submission event.
   */
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault(); // Prevent default browser form submission
    setLoginError(null); // Clear any previous login errors
    try {
      await signInAdmin(email, password); // Attempt to sign in the admin user
      setEmail(''); // Clear email input
      setPassword(''); // Clear password input
    } catch (err: any) {
      setLoginError(err.message); // Display authentication error messages
    }
  };

  /**
   * Handles the admin logout process.
   */
  const handleLogout = async () => {
    await signOutAdmin(); // Sign out the current user
    // Reset relevant states after logout to clear UI data
    setHcpList([]);
    setSelectedHCP(null);
    setShowForm(false);
  };

  /**
   * Sets the selected HCP profile for editing and displays the form.
   * @param {HcpProfile} hcp - The HCP profile to be edited.
   */
  const handleEditHCP = (hcp: HcpProfile) => {
    setSelectedHCP(hcp);
    setShowForm(true);
  };

  /**
   * Handles the deletion of an HCP profile from Firestore.
   * @param {string} hcpId - The ID of the HCP profile to delete.
   */
  const handleDeleteHCP = async (hcpId: string) => {
    // IMPORTANT: For production, replace `window.confirm` with a custom, styled modal
    // for a better user experience and consistent UI.
    if (!db || !window.confirm("Are you sure you want to delete this HCP profile? This action cannot be undone.")) {
      return; // If Firestore not ready or user cancels, exit.
    }
    setLoadingHCPs(true); // Activate loading state during deletion
    try {
      await deleteDoc(doc(db, 'hcpProfiles', hcpId)); // Delete the document from Firestore
      fetchHCPs(); // Re-fetch the HCP list to update the UI immediately
    } catch (error: any) {
      console.error("Error deleting HCP:", error);
      setLoginError(`Failed to delete HCP: ${error.message}`); // Display deletion error
    } finally {
      setLoadingHCPs(false); // Deactivate loading state
    }
  };

  /**
   * Callback function executed after an HCP profile is successfully saved (created or updated)
   * via the HCPForm. It hides the form and refreshes the HCP list.
   */
  const handleFormSave = () => {
    setShowForm(false); // Hide the form
    setSelectedHCP(null); // Clear the selected HCP
    fetchHCPs(); // Re-fetch the HCP list to show the latest data
  };

  // Render a full-screen loading spinner while Firebase authentication state is being determined.
  // This prevents UI flicker before the user's login status is known.
  if (!isAuthReady) {
    return (
      <div className="fixed inset-0 bg-gray-950 flex items-center justify-center text-white text-xl">
        Loading Admin Application...
      </div>
    );
  }

  // Render the admin login form if no user is currently authenticated (`currentUser` is null).
  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950 p-8">
        <div className="p-8 bg-gray-800 rounded-xl shadow-2xl max-w-md w-full border border-gray-700">
          <h1 className="text-3xl font-bold text-center text-blue-400 mb-6">HomeLift Admin Login</h1>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-gray-300 text-sm font-bold mb-2" htmlFor="admin-email">
                Email
              </label>
              <input
                type="email"
                id="admin-email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="shadow appearance-none border rounded-xl w-full py-3 px-4 text-gray-900 leading-tight focus:outline-none focus:shadow-outline bg-gray-700 border-gray-600 focus:border-blue-500 placeholder-gray-400"
                placeholder="admin@homelift.africa"
                required
              />
            </div>
            <div>
              <label className="block text-gray-300 text-sm font-bold mb-2" htmlFor="admin-password">
                Password
              </label>
              <input
                type="password"
                id="admin-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="shadow appearance-none border rounded-xl w-full py-3 px-4 text-gray-900 leading-tight focus:outline-none focus:shadow-outline bg-gray-700 border-gray-600 focus:border-blue-500 placeholder-gray-400"
                placeholder="••••••••"
                required
              />
            </div>
            {loginError && <p className="text-red-400 text-sm italic">{loginError}</p>}
            <button
              type="submit"
              className="bg-green-600 hover:bg-green-500 text-white font-bold py-3 px-6 rounded-xl w-full transition duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={!email || !password}
            >
              Log In
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <header className="flex justify-between items-center mb-10 pb-4 border-b border-gray-700">
        <h1 className="text-4xl font-bold text-green-400">HomeLift HCP Admin Panel</h1>
        <div className="flex items-center gap-4">
          <span className="text-gray-300">Logged in as: <span className="font-semibold">{currentUser?.email}</span></span>
          <button
            onClick={handleLogout}
            className="bg-red-600 hover:bg-red-500 text-white font-bold py-2 px-4 rounded-xl shadow-lg transition duration-300"
          >
            Log Out
          </button>
        </div>
      </header>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 p-6 bg-gray-800 rounded-xl shadow-lg border border-gray-700">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-white">Managed HCP Profiles</h2>
            <button
              onClick={() => { setSelectedHCP(null); setShowForm(true); }}
              className="bg-green-600 hover:bg-green-500 text-white font-bold py-2 px-4 rounded-xl flex items-center gap-2 shadow-md transition duration-300"
            >
              <PlusCircleIcon className="h-5 w-5" /> Add New HCP
            </button>
          </div>

          {loadingHCPs ? (
            <div className="text-center py-10 text-gray-400">Loading HCPs...</div>
          ) : hcpList.length === 0 ? (
            <div className="text-center py-10 text-gray-400">No HCP profiles found. Click "Add New HCP" to get started!</div>
          ) : (
            <ul className="space-y-4">
              {hcpList.map(hcp => (
                <li key={hcp.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-gray-700 p-4 rounded-lg shadow-sm border border-gray-600">
                  <div className="flex items-center gap-4 mb-3 sm:mb-0">
                    {hcp.profilePhotoUrl ? (
                      <img src={hcp.profilePhotoUrl} alt={`${hcp.fullName}'s avatar`} className="w-12 h-12 rounded-full object-cover border border-blue-400 flex-shrink-0" />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-gray-600 border border-gray-500 flex items-center justify-center text-gray-400 flex-shrink-0">
                        <PhotoIcon className="h-6 w-6" />
                      </div>
                    )}
                    <div>
                      <p className="text-lg font-semibold text-white">{hcp.fullName}</p>
                      <p className="text-sm text-gray-300">{hcp.primarySkill} ({hcp.experienceYears} yrs)</p>
                      <p className="text-xs text-gray-400">{hcp.locationPreference}</p>
                      
                    </div>
                  </div>
                  <div className="flex gap-2 self-end sm:self-center">
                    <button
                      onClick={() => handleEditHCP(hcp)}
                      className="text-blue-400 hover:text-blue-300 p-2 rounded-full hover:bg-gray-600 transition"
                      title="Edit HCP"
                    >
                      <PencilSquareIcon className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleDeleteHCP(hcp.id!)}
                      className="text-red-400 hover:text-red-300 p-2 rounded-full hover:bg-gray-600 transition"
                      title="Delete HCP"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="lg:col-span-1">
          {showForm && (
             <HCPForm onSave={handleFormSave} hcpToEdit={selectedHCP} />
          )}
          {!showForm && (
            <div className="p-6 bg-gray-800 rounded-xl shadow-lg border border-gray-700 text-center flex flex-col items-center justify-center min-h-[300px]">
                <PlusCircleIcon className="h-16 w-16 text-blue-400 mb-4"/>
                <p className="text-xl text-gray-300">Select an HCP to edit or click "Add New HCP" to create a new profile.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Default export for the Next.js page, wrapping AdminPage with FirebaseProvider.
export default function AdminAppWrapper() {
  return (
    <FirebaseProvider>
      <AdminPage />
    </FirebaseProvider>
  );
}