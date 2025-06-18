    // lib/firebase.ts

    import { initializeApp, getApps, getApp } from 'firebase/app';
    import { getStorage } from 'firebase/storage';

    const firebaseConfig = {
        apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
        authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET, // This should be correctly set
        messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
        appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
        // measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID // Uncomment if you use Google Analytics
    };

    // --- Add these console.logs for debugging ---
    console.log("Firebase Config during initialization:");
    console.log("API Key:", firebaseConfig.apiKey ? "Set" : "Not Set");
    console.log("Auth Domain:", firebaseConfig.authDomain);
    console.log("Project ID:", firebaseConfig.projectId);
    console.log("Storage Bucket:", firebaseConfig.storageBucket); // Check this value
    console.log("App ID:", firebaseConfig.appId);
    // ---------------------------------------------


    // Check if a Firebase app already exists to prevent re-initialization errors
    const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

    // Export the storage instance, using the initialized app
    // getStorage(app) uses the default bucket specified in firebaseConfig
    export const storage = getStorage(app);

    