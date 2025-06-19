"use client";

import { useState, useEffect, useRef, ChangeEvent } from "react";
import { PhotoIcon } from "@heroicons/react/24/outline";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { useFirebase } from "@/lib/firebase/FirebaseContext";

/** props the parent form needs */
export interface UploadAvatarProps {
  onUploadSuccess: (url: string) => void;   // callback when upload finishes
  initialImageUrl?: string | null;          // show existing image while editing
}

const UploadAvatar: React.FC<UploadAvatarProps> = ({
  onUploadSuccess,
  initialImageUrl = null,
}) => {
  const { storage } = useFirebase();              // <- storage from context
  const [file,      setFile]      = useState<File | null>(null);
  const [progress,  setProgress]  = useState<number>(0);
  const [url,       setUrl]       = useState<string | null>(initialImageUrl);
  const [error,     setError]     = useState<string | null>(null);
  const fileInputRef              = useRef<HTMLInputElement>(null);

  /* sync external change of initialImageUrl (e.g. selecting another HCP) */
  useEffect(() => { setUrl(initialImageUrl ?? null); }, [initialImageUrl]);

  /* pick a new local file ------------------------------------------------ */
  const onPick = (e: ChangeEvent<HTMLInputElement>) => {
    setError(null);
    setProgress(0);
    setFile(e.target.files?.[0] ?? null);
  };

  /* upload to Firebase Storage ------------------------------------------ */
  const onUpload = async () => {
    if (!file) return;
    if (!storage) {                       // should never happen in normal flow
      setError("Firebase Storage not initialised");
      return;
    }

    const id      = crypto.randomUUID();
    const fileRef = ref(storage, `hcp-avatars/${id}_${file.name}`);
    const task    = uploadBytesResumable(fileRef, file, {
      contentType: file.type,
    });

    task.on(
      "state_changed",
      snap => setProgress(Math.round((snap.bytesTransferred / snap.totalBytes) * 100)),
      err  => setError(err.message),
      async () => {
        const downloadURL = await getDownloadURL(fileRef);
        setUrl(downloadURL);
        onUploadSuccess(downloadURL);   // << notify parent form
        /* tidy up local UI state */
        setFile(null);
        setProgress(0);
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    );
  };

  /* -------------------------------------------------------------------- */
  return (
    <div className="space-y-4">
      {/* file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={onPick}
        className="file:mr-4 file:rounded-lg file:border-0
                   file:bg-blue-600 file:px-4 file:py-2 file:text-white
                   hover:file:bg-blue-500"
      />

      {/* upload button */}
      {file && (
        <button
          onClick={onUpload}
          disabled={!file}
          className="rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white
                     hover:bg-blue-500 disabled:opacity-40"
        >
          {progress > 0 && progress < 100
            ? `Uploading ${progress}%`
            : "Upload"}
        </button>
      )}

      {/* progress bar */}
      {progress > 0 && progress < 100 && (
        <div className="h-2 w-full rounded bg-gray-700">
          <div
            style={{ width: `${progress}%` }}
            className="h-full rounded bg-green-500"
          />
        </div>
      )}

      {/* preview / error */}
      {url && (
        <div className="space-y-2">
          <img
            src={url}
            alt="HCP avatar"
            className="h-28 w-28 rounded-full object-cover ring-2 ring-blue-400"
          />
          <p className="break-all text-xs text-gray-400">{url}</p>
        </div>
      )}
      {error && <p className="text-sm text-red-400">{error}</p>}
    </div>
  );
};

export default UploadAvatar;