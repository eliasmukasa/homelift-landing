"use client";

import { useState, ChangeEvent } from "react";
import { storage } from "@/lib/firebase";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";

export default function UploadAvatar() {
  const [file, setFile] = useState<File | null>(null);
  const [progress, setProgress] = useState<number>(0);
  const [url, setUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function onPick(e: ChangeEvent<HTMLInputElement>) {
    setError(null);
    setUrl(null);
    setProgress(0);
    setFile(e.target.files?.[0] ?? null);
  }

  async function onUpload() {
    if (!file) return;
    const id = crypto.randomUUID();
    const fileRef = ref(storage, `hcp-avatars/${id}_${file.name}`);
    const task = uploadBytesResumable(fileRef, file, { contentType: file.type });

    task.on(
      "state_changed",
      snap => {
        const pct = (snap.bytesTransferred / snap.totalBytes) * 100;
        setProgress(Math.round(pct));
      },
      err => setError(err.message),
      async () => {
        const downloadURL = await getDownloadURL(task.snapshot.ref);
        setUrl(downloadURL);
        // TODO: write downloadURL into the corresponding HCP document
      }
    );
  }

  return (
    <div className="space-y-6 max-w-sm">
      <input type="file" accept="image/*" onChange={onPick} />

      {file && !url && (
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-500"
          onClick={onUpload}
        >
          Upload
        </button>
      )}

      {progress > 0 && progress < 100 && (
        <div className="w-full bg-gray-800 rounded">
          <div
            style={{ width: `${progress}%` }}
            className="h-2 bg-green-500 rounded"
          />
          <p className="text-sm text-gray-300 mt-1">{progress}%</p>
        </div>
      )}

      {url && (
        <div className="space-y-2">
          <img src={url} alt="Uploaded avatar" className="w-32 h-32 rounded-full object-cover" />
          <p className="break-all text-xs text-gray-400">{url}</p>
        </div>
      )}

      {error && <p className="text-red-400 text-sm">{error}</p>}
    </div>
  );
}