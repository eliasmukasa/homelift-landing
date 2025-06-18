// app/admin/page.tsx
// This file defines the main HomeLift HCP Admin Panel page.

"use client"; // This directive indicates that this is a Client Component,
             // enabling interactive features and client-side logic.

import { useState, useEffect, useRef } from "react";
import { collection, query, getDocs, doc, setDoc, deleteDoc } from 'firebase/firestore'; // Firestore functions
import { getDownloadURL, ref, uploadBytesResumable } from 'firebase/storage'; // Storage functions
// Import the FirebaseProvider and useFirebase hook from the dedicated context file.
// Adjust the import path based on your actual project structure.
// Example: if `app` and `lib` are siblings in your project root, the path might be `../../lib/firebase/FirebaseContext`.
import { useFirebase, FirebaseProvider } from '../../lib/firebase/FirebaseContext';
import { XMarkIcon, PencilSquareIcon, TrashIcon, PlusCircleIcon, CheckCircleIcon, PhotoIcon } from "@heroicons/react/24/outline";

/**
 * @interface HcpProfile
 * Defines the structure for a Home-Care Professional (HCP) profile.
 */
interface HcpProfile {
  id?: string; // Optional Firestore document ID for existing profiles
  fullName: string;
  primarySkill: string;
  experienceYears: number;
  bioSummary: string;
  locationPreference: string;
  profilePhotoUrl: string | null; // URL to their profile picture in Firebase Storage
  // Allow for other flexible properties (e.g., internal status, creation date)
  [key: string]: any;
}

// --- UploadAvatar Component (Defined within page.tsx as per user request to keep it as an admin function) ---
/**
 * @component UploadAvatar
 * Handles the selection and upload of an image file to Firebase Storage for an HCP's profile picture.
 * @param {object} props
 * @param {(url: string) => void} props.onUploadSuccess - Callback function invoked with the download URL upon successful upload.
 * @param {string | null} [props.initialImageUrl] - Optional initial image URL to display (for editing).
 */
const UploadAvatar: React.FC<{ onUploadSuccess: (url: string) => void; initialImageUrl?: string | null; }> = ({ onUploadSuccess, initialImageUrl }) => {
  const { storage } = useFirebase(); // Get Firebase Storage instance from context
  const [file, setFile] = useState<File | null>(null); // State for the selected image file
  const [url, setUrl] = useState<string | null>(initialImageUrl || null); // State for the uploaded image's URL
  const [progress, setProgress] = useState(0); // State for upload progress percentage
  const [error, setError] = useState<string | null>(null); // State for any upload errors
  const [uploading, setUploading] = useState(false); // State to indicate if an upload is in progress
  const fileInputRef = useRef<HTMLInputElement>(null); // Ref for the file input element

  // Effect to update the displayed image URL if the `initialImageUrl` prop changes (e.g., when editing a different HCP).
  useEffect(() => {
    if (initialImageUrl && initialImageUrl !== url) {
      setUrl(initialImageUrl);
    }
  }, [initialImageUrl, url]);

  /**
   * Handles the selection of a file from the input.
   * Resets previous upload states.
   * @param {React.ChangeEvent<HTMLInputElement>} e - The change event from the file input.
   */
  const onPick = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFile(null); // Clear previous file
    setUrl(null); // Clear previous URL
    setProgress(0);
    setError(null);

    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]); // Store the selected file
    }
  };

  /**
   * Initiates the file upload process to Firebase Storage.
   */
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

    setUploading(true); // Set uploading state to true
    setError(null); // Clear previous errors
    setProgress(0); // Reset progress

    // Create a unique storage reference path for the file in 'hcp_profile_pictures' folder.
    // Using Date.now() for uniqueness, but in a real app, you might tie this to the HCP's Firestore ID.
    const storageRef = ref(storage, `hcp_profile_pictures/${Date.now()}_${file.name}`);
    const uploadTask = uploadBytesResumable(storageRef, file); // Start the upload task

    // Listen for state changes (progress, error, completion) on the upload task.
    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const currentProgress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setProgress(currentProgress);
      },
      (uploadError: any) => {
        // Handle unsuccessful uploads (e.g., permission denied, network error).
        console.error("Upload failed:", uploadError);
        setError(`Upload failed: ${uploadError.message || 'Unknown error'}`);
        setUploading(false);
      },
      async () => {
        // Handle successful uploads.
        try {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          setUrl(downloadURL); // Store the download URL
          onUploadSuccess(downloadURL); // Call the parent's success callback
          setError(null); // Clear errors
          console.log('File available at', downloadURL);

          // Optionally clear the file input after successful upload
          if (fileInputRef.current) {
            fileInputRef.current.value = "";
          }
          setFile(null); // Clear file state
        } catch (urlError: any) {
          setError(`Failed to get download URL: ${urlError.message || 'Unknown error'}`);
          console.error("Failed to get download URL:", urlError);
        } finally {
          setUploading(false); // Always reset uploading state
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
          accept="image/*" // Only accept image files
          onChange={onPick}
          ref={fileInputRef} // Attach ref to clear input
          className="block w-full text-sm text-gray-400
            file:mr-4 file:py-2 file:px-4
            file:rounded-full file:border-0
            file:text-sm file:font-semibold
            file:bg-blue-500 file:text-white
            hover:file:bg-blue-600 transition duration-200"
        />
      </div>

      {file && ( // Only show upload button if a file is selected
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-500 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed w-full"
          onClick={onUpload}
          disabled={uploading}
        >
          {uploading ? `Uploading ${Math.round(progress)}%...` : 'Upload Selected Image'}
        </button>
      )}

      {progress > 0 && progress < 100 && ( // Show progress bar during upload
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
/**
 * @component HCPForm
 * A form for creating or editing Home-Care Professional (HCP) profiles.
 * @param {object} props
 * @param {() => void} props.onSave - Callback function invoked after a successful save (create/update).
 * @param {HcpProfile | null} [props.hcpToEdit] - Optional HCP profile object to pre-fill the form for editing.
 */
const HCPForm: React.FC<{ onSave: () => void; hcpToEdit?: HcpProfile | null; }> = ({ onSave, hcpToEdit }) => {
  const { db } = useFirebase(); // Get Firestore instance from Firebase context
  const [profile, setProfile] = useState<HcpProfile>(hcpToEdit || {
    // Initialize profile state with provided data for editing, or with empty defaults for new creation.
    fullName: '',
    primarySkill: '',
    experienceYears: 0,
    bioSummary: '',
    locationPreference: '',
    profilePhotoUrl: null,
  });
  const [loading, setLoading] = useState(false); // State for showing loading indicator during save
  const [error, setError] = useState<string | null>(null); // State for error messages
  const [success, setSuccess] = useState<string | null>(null); // State for success messages

  // Effect to update form fields when `hcpToEdit` prop changes (e.g., when selecting a different HCP to edit).
  useEffect(() => {
    if (hcpToEdit) {
      setProfile(hcpToEdit);
    } else {
      // Reset form to default values if no `hcpToEdit` is provided (for new profile creation).
      setProfile({
        fullName: '',
        primarySkill: '',
        experienceYears: 0,
        bioSummary: '',
        locationPreference: '',
        profilePhotoUrl: null,
      });
    }
    setError(null); // Clear any previous errors
    setSuccess(null); // Clear any previous success messages
  }, [hcpToEdit]);

  /**
   * Generic handler for updating form input fields.
   * @param {React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>} e - The change event from the input.
   */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setProfile(prev => ({
      ...prev,
      [name]: name === 'experienceYears' ? Number(value) : value // Convert 'experienceYears' to a number.
    }));
  };

  /**
   * Callback for when the UploadAvatar component successfully uploads an image.
   * Updates the `profilePhotoUrl` in the current profile state.
   * @param {string} url - The download URL of the uploaded image.
   */
  const handlePhotoUploadSuccess = (url: string) => {
    setProfile(prev => ({ ...prev, profilePhotoUrl: url }));
    setSuccess("Profile picture uploaded successfully!");
  };

  /**
   * Handles the form submission for creating or updating an HCP profile.
   * @param {React.FormEvent} e - The form submission event.
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // Prevent default browser form submission (page reload)

    if (!db) {
      setError("Database not initialized. Cannot save profile.");
      return;
    }
    setLoading(true); // Activate loading state
    setError(null); // Clear previous errors
    setSuccess(null); // Clear previous success messages

    try {
      const hcpProfilesColRef = collection(db, 'hcpProfiles'); // Reference to the 'hcpProfiles' collection

      if (profile.id) {
        // If `profile.id` exists, it means we are updating an existing HCP profile.
        const hcpDocRef = doc(db, 'hcpProfiles', profile.id); // Document reference for the specific HCP
        // Use `setDoc` with `{ merge: true }` to update fields without overwriting the entire document.
        await setDoc(hcpDocRef, { ...profile, lastUpdated: new Date().toISOString() }, { merge: true });
        setSuccess("HCP profile updated successfully!");
      } else {
        // If no `profile.id`, it means we are creating a new HCP profile.
        // `setDoc(doc(hcpProfilesColRef))` allows Firestore to auto-generate a new unique ID for the document.
        await setDoc(doc(hcpProfilesColRef), { ...profile, dateCreated: new Date().toISOString(), internalStatus: "Pending Review" });
        setSuccess("New HCP profile created successfully!");
      }
      onSave(); // Invoke the `onSave` callback provided by the parent component (e.g., to refresh the list).
    } catch (err: any) {
      setError(`Failed to save profile: ${err.message}`);
      console.error("Error saving HCP profile:", err);
    } finally {
      setLoading(false); // Deactivate loading state
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

        {/* Full Name Input */}
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

        {/* Primary Skill Input */}
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

        {/* Experience Years Input */}
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

        {/* Bio Summary Textarea */}
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

        {/* Location Preference Input */}
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

  // Main Admin Panel Content (rendered after successful login).
  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <header className="flex justify-between items-center mb-10 pb-4 border-b border-gray-700">
        <h1 className="text-4xl font-bold text-blue-400">HomeLift HCP Admin Panel</h1>
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

      {/* Main Content Area Layout: Two columns for HCP list and the form. */}
      <div className="grid lg:grid-cols-3 gap-8">
        {/* HCP List / Dashboard Section (Left Column - takes 2/3 width on large screens) */}
        <div className="lg:col-span-2 p-6 bg-gray-800 rounded-xl shadow-lg border border-gray-700">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-white">Managed HCP Profiles</h2>
            <button
              onClick={() => { setSelectedHCP(null); setShowForm(true); }} // Reset selected HCP and show form for new entry.
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

        {/* Create/Edit HCP Form Section (Right Column - takes 1/3 width on large screens) */}
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

/**
 * @component AdminAppWrapper
 * The default export for the `app/admin/page.tsx` route.
 * It wraps the `AdminPage` component with the `FirebaseProvider`
 * to ensure all Firebase services are initialized and available
 * to the admin panel.
 */
export default function AdminAppWrapper() {
  return (
    <FirebaseProvider>
      <AdminPage />
    </FirebaseProvider>
  );
}
