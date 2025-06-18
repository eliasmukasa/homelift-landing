"use client";

import { useState, useRef, useEffect, createContext, useContext } from "react";
import { getDownloadURL, ref, uploadBytesResumable, getStorage } from 'firebase/storage';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged, User } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc, collection, query, getDocs, deleteDoc } from 'firebase/firestore';
import { XMarkIcon, PencilSquareIcon, TrashIcon, PlusCircleIcon, CheckCircleIcon } from "@heroicons/react/24/outline";

// The __firebase_config global variable declaration is no longer directly used for config parsing
// in this version, as we are prioritizing a process.env-based approach with graceful fallback.
// It remains here to avoid TypeScript errors if it's implicitly used elsewhere or for clarity.
declare const __firebase_config: string | undefined;

// --- Firebase Context and Provider for Admin Panel ---
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

const FirebaseContext = createContext<FirebaseContextType | undefined>(undefined);

export const useFirebase = () => {
  const context = useContext(FirebaseContext);
  if (!context) {
    throw new Error('useFirebase must be used within a FirebaseProvider');
  }
  return context;
};

// Firebase Provider Component for the Admin Panel
const FirebaseProvider = ({ children }: { children: React.ReactNode }) => {
  const [db, setDb] = useState<any>(null);
  const [auth, setAuth] = useState<any>(null);
  const [storage, setStorage] = useState<any>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);

  useEffect(() => {
    // IMPORTANT: For Canvas environment, directly accessing process.env.NEXT_PUBLIC_...
    // leads to "process is not defined" errors.
    // The __firebase_config variable is the intended secure way, but if that's
    // not working reliably, hardcoding placeholders is a TEMPORARY workaround for testing IN CANVAS.
    // YOU MUST REPLACE THESE PLACEHOLDER VALUES WITH YOUR ACTUAL FIREBASE CONFIG FROM YOUR PROJECT.
    // For production, use environment variables from your hosting provider (e.g., Vercel, Netlify).

    const firebaseConfig = {
        apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
        authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
        messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
        appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    };

    // Check if any critical Firebase config values are still placeholders
    const isPlaceholderConfig = Object.values(firebaseConfig).some(v => typeof v === 'string' && v.startsWith('YOUR_'));

    if (isPlaceholderConfig) {
      console.error("CRITICAL ERROR: Firebase configuration is incomplete or still using placeholder values ('YOUR_...'). Please replace all placeholders with your actual Firebase project credentials from the Firebase Console.");
      setIsAuthReady(true); // Allow the UI to unblock, but Firebase functionality will be disabled.
      setDb(null);
      setAuth(null);
      setStorage(null);
      setCurrentUser(null);
      setUserId(null);
      return;
    }

    try {
      console.log("Attempting to initialize Firebase with config:", firebaseConfig);
      // Check if an app is already initialized to prevent re-initialization errors
      const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
      const firestore = getFirestore(app);
      const firebaseAuth = getAuth(app);
      const firebaseStorage = getStorage(app);

      setDb(firestore);
      setAuth(firebaseAuth);
      setStorage(firebaseStorage);

      const unsubscribe = onAuthStateChanged(firebaseAuth, (user) => {
        setCurrentUser(user);
        setUserId(user ? user.uid : null);
        setIsAuthReady(true); // Firebase Auth state has been determined
        console.log("Admin Auth state changed. User:", user ? user.email : "None");
      });

      return () => unsubscribe(); // Cleanup auth listener on component unmount
    } catch (error) {
      console.error("Failed to initialize Firebase for Admin. Please check your Firebase configuration and internet connection:", error);
      setIsAuthReady(true); // Ensure UI unblocks even on initialization error
      setDb(null);
      setAuth(null);
      setStorage(null);
    }
  }, []); // Empty dependency array ensures this runs only once on mount

  const signInAdmin = async (email: string, password: string) => {
    if (!auth) throw new Error("Firebase Auth not initialized.");
    return await signInWithEmailAndPassword(auth, email, password);
  };

  const signOutAdmin = async () => {
    if (!auth) throw new Error("Firebase Auth not initialized.");
    await signOut(auth);
  };

  const contextValue = { db, auth, storage, currentUser, userId, isAuthReady, signInAdmin, signOutAdmin };

  return (
    <FirebaseContext.Provider value={contextValue}>
      {/* Show loading indicator until auth state is determined */}
      {!isAuthReady && (
        <div className="fixed inset-0 bg-gray-950 flex items-center justify-center text-white text-xl">
          Loading Admin Application...
        </div>
      )}
      {/* Render children only when authentication readiness is determined */}
      {isAuthReady && children}
    </FirebaseContext.Provider>
  );
};


// --- UploadAvatar Component (for internal use within HCPForm) ---
interface UploadAvatarProps {
  onUploadSuccess: (url: string) => void;
  initialImageUrl?: string | null;
}

const UploadAvatar: React.FC<UploadAvatarProps> = ({ onUploadSuccess, initialImageUrl }) => {
  const { storage } = useFirebase();
  const [file, setFile] = useState<File | null>(null);
  const [url, setUrl] = useState<string | null>(initialImageUrl || null);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (initialImageUrl && initialImageUrl !== url) {
      setUrl(initialImageUrl);
    }
  }, [initialImageUrl]);

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
    if (!storage) { // Ensure storage is initialized
      setError("Firebase Storage not initialized. Cannot upload.");
      console.error("Firebase storage instance is null. Check FirebaseProvider initialization and environment variables.");
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
      {url && (
        <div className="flex flex-col items-center mb-4">
          <img src={url} alt="HCP Avatar" className="w-24 h-24 rounded-full object-cover border-2 border-blue-400 shadow-lg" />
          <p className="text-xs text-gray-400 break-all mt-2">{url}</p>
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


// --- HCPForm Component ---
interface HcpProfile {
  id?: string;
  fullName: string;
  primarySkill: string;
  experienceYears: number;
  bioSummary: string;
  locationPreference: string;
  profilePhotoUrl: string | null;
  [key: string]: any;
}

interface HCPFormProps {
  onSave: () => void;
  hcpToEdit?: HcpProfile | null;
}

const HCPForm: React.FC<HCPFormProps> = ({ onSave, hcpToEdit }) => {
  const { db } = useFirebase();
  const [profile, setProfile] = useState<HcpProfile>(hcpToEdit || {
    fullName: '',
    primarySkill: '',
    experienceYears: 0,
    bioSummary: '',
    locationPreference: '',
    profilePhotoUrl: null,
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
      });
    }
    setError(null);
    setSuccess(null);
  }, [hcpToEdit]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: name === 'experienceYears' ? Number(value) : value }));
  };

  const handlePhotoUploadSuccess = (url: string) => {
    setProfile(prev => ({ ...prev, profilePhotoUrl: url }));
    setSuccess("Profile picture uploaded successfully!");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!db) {
      setError("Database not initialized.");
      return;
    }
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const hcpProfilesCol = collection(db, 'hcpProfiles');
      if (profile.id) {
        const hcpDocRef = doc(db, 'hcpProfiles', profile.id);
        await setDoc(hcpDocRef, { ...profile, lastUpdated: new Date().toISOString() }, { merge: true });
        setSuccess("HCP profile updated successfully!");
      } else {
        await setDoc(doc(hcpProfilesCol), { ...profile, dateCreated: new Date().toISOString(), internalStatus: "Pending Review" });
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
        <UploadAvatar
          onUploadSuccess={handlePhotoUploadSuccess}
          initialImageUrl={profile.profilePhotoUrl}
        />

        <div>
          <label htmlFor="fullName" className="block text-gray-300 text-sm font-bold mb-2">Full Name</label>
          <input
            type="text"
            id="fullName"
            name="fullName"
            value={profile.fullName}
            onChange={handleChange}
            className="shadow appearance-none border rounded-xl w-full py-3 px-4 text-gray-900 leading-tight focus:outline-none focus:shadow-outline bg-gray-700 border-gray-600 focus:border-blue-500"
            required
          />
        </div>

        <div>
          <label htmlFor="primarySkill" className="block text-gray-300 text-sm font-bold mb-2">Primary Skill</label>
          <input
            type="text"
            id="primarySkill"
            name="primarySkill"
            value={profile.primarySkill}
            onChange={handleChange}
            className="shadow appearance-none border rounded-xl w-full py-3 px-4 text-gray-900 leading-tight focus:outline-none focus:shadow-outline bg-gray-700 border-gray-600 focus:border-blue-500"
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

        <div>
          <label htmlFor="bioSummary" className="block text-gray-300 text-sm font-bold mb-2">Bio Summary</label>
          <textarea
            id="bioSummary"
            name="bioSummary"
            value={profile.bioSummary}
            onChange={handleChange}
            rows={4}
            className="shadow appearance-none border rounded-xl w-full py-3 px-4 text-gray-900 leading-tight focus:outline-none focus:shadow-outline bg-gray-700 border-gray-600 focus:border-blue-500"
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
            className="shadow appearance-none border rounded-xl w-full py-3 px-4 text-gray-900 leading-tight focus:outline-none focus:shadow-outline bg-gray-700 border-gray-600 focus:border-blue-500"
            required
          />
        </div>

        {error && <p className="text-red-400 text-sm italic">{error}</p>}
        {success && <p className="text-green-400 text-sm italic flex items-center gap-2"><CheckCircleIcon className="h-5 w-5"/> {success}</p>}

        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-6 rounded-xl w-full transition duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Saving...' : (hcpToEdit ? 'Update Profile' : 'Create Profile')}
        </button>
      </form>
    </div>
  );
};

// --- AdminPage Component ---
function AdminPage() {
  const { currentUser, signInAdmin, signOutAdmin, db, isAuthReady } = useFirebase();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [hcpList, setHcpList] = useState<HcpProfile[]>([]);
  const [loadingHCPs, setLoadingHCPs] = useState(true);
  const [selectedHCP, setSelectedHCP] = useState<HcpProfile | null>(null);
  const [showForm, setShowForm] = useState(false);

  const fetchHCPs = async () => {
    if (!db) return;
    setLoadingHCPs(true);
    try {
      const q = query(collection(db, 'hcpProfiles'));
      const querySnapshot = await getDocs(q);
      const hcps: HcpProfile[] = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() as HcpProfile }));
      setHcpList(hcps);
      console.log("Fetched HCPs:", hcps);
    } catch (error: any) {
      console.error("Error fetching HCPs:", error);
      setLoginError(`Failed to load HCPs: ${error.message}`);
    } finally {
      setLoadingHCPs(false);
    }
  };

  useEffect(() => {
    if (isAuthReady && currentUser && db) {
      fetchHCPs();
    } else if (isAuthReady && !currentUser) {
      setLoadingHCPs(false);
    }
  }, [isAuthReady, currentUser, db]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    try {
      await signInAdmin(email, password);
      setEmail('');
      setPassword('');
    } catch (err: any) {
      setLoginError(err.message);
    }
  };

  const handleLogout = async () => {
    await signOutAdmin();
    setHcpList([]);
    setSelectedHCP(null);
    setShowForm(false);
  };

  const handleEditHCP = (hcp: HcpProfile) => {
    setSelectedHCP(hcp);
    setShowForm(true);
  };

  const handleDeleteHCP = async (hcpId: string) => {
    if (!db || !confirm("Are you sure you want to delete this HCP profile?")) return;
    setLoadingHCPs(true);
    try {
      await deleteDoc(doc(db, 'hcpProfiles', hcpId));
      fetchHCPs();
    } catch (error: any) {
      console.error("Error deleting HCP:", error);
      setLoginError(`Failed to delete HCP: ${error.message}`);
    } finally {
      setLoadingHCPs(false);
    }
  };

  const handleFormSave = () => {
    setShowForm(false);
    setSelectedHCP(null);
    fetchHCPs();
  };

  if (!isAuthReady) {
    return (
      <div className="fixed inset-0 bg-gray-950 flex items-center justify-center text-white text-xl">
        Loading Admin Application...
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950 p-8">
        <div className="p-8 bg-gray-800 rounded-xl shadow-2xl max-w-md w-full border border-gray-700">
          <h1 className="text-3xl font-bold text-center text-blue-400 mb-6">Admin Login</h1>
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
                className="shadow appearance-none border rounded-xl w-full py-3 px-4 text-gray-900 leading-tight focus:outline-none focus:shadow-outline bg-gray-700 border-gray-600 focus:border-blue-500"
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
                className="shadow appearance-none border rounded-xl w-full py-3 px-4 text-gray-900 leading-tight focus:outline-none focus:shadow-outline bg-gray-700 border-gray-600 focus:border-blue-500"
                placeholder="••••••••"
                required
              />
            </div>
            {loginError && <p className="text-red-400 text-sm italic">{loginError}</p>}
            <button
              type="submit"
              className="bg-green-600 hover:bg-green-500 text-white font-bold py-3 px-6 rounded-xl w-full transition duration-300 transform hover:scale-105"
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
        <h1 className="text-4xl font-bold text-blue-400">HomeLift HCP Admin Panel</h1>
        <div className="flex items-center gap-4">
          <span className="text-gray-300">Logged in as: {currentUser?.email}</span>
          <button
            onClick={handleLogout}
            className="bg-red-600 hover:bg-red-500 text-white font-bold py-2 px-4 rounded-xl shadow-lg transition duration-300"
          >
            Log Out
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="grid lg:grid-cols-3 gap-8">
        {/* HCP List / Dashboard */}
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
                <li key={hcp.id} className="flex items-center justify-between bg-gray-700 p-4 rounded-lg shadow-sm border border-gray-600">
                  <div className="flex items-center gap-4">
                    {hcp.profilePhotoUrl && (
                      <img src={hcp.profilePhotoUrl} alt={`${hcp.fullName}'s avatar`} className="w-12 h-12 rounded-full object-cover border border-blue-400" />
                    )}
                    <div>
                      <p className="text-lg font-semibold text-white">{hcp.fullName}</p>
                      <p className="text-sm text-gray-300">{hcp.primarySkill} ({hcp.experienceYears} yrs)</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
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

        {/* Create/Edit HCP Form */}
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

export default function AdminAppWrapper() {
  return (
    <FirebaseProvider>
      <AdminPage />
    </FirebaseProvider>
  );
}
