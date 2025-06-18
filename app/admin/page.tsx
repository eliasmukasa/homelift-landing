// app/admin/page.tsx
import UploadAvatar from "./UploadAvatar";

export default function AdminPage() {
  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold mb-6">Upload HCP Avatar</h1>
      <UploadAvatar />
    </main>
  );
}