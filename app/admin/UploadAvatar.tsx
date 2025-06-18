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

  async function onUpload () {
  if (!file) return

  /* ① bail out early if storage is not initialised */
  if (!storage) {
    setError('Firebase Storage not initialised – check env vars / restart dev server')
    return
  }

  /* ② continue with the upload */
  const id      = crypto.randomUUID()
  const fileRef = ref(storage, `hcp-avatars/${id}_${file.name}`)

  const task = uploadBytesResumable(fileRef, file, { contentType: file.type })

  task.on('state_changed',
    snap => setProgress(Math.round((snap.bytesTransferred / snap.totalBytes) * 100)),
    err  => setError(err.message),
    async () => {
      const url = await getDownloadURL(fileRef)
      setUrl(url)                         // show the image or save it to Firestore
      setFile(null); setProgress(0)
    }
  )
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