// "use client";
// import { useState, useEffect } from "react";
// import { collection, doc, setDoc } from "firebase/firestore";
// import { CheckCircleIcon, XMarkIcon } from "@heroicons/react/24/outline";
// import { useFirebase } from "@/lib/firebase/FirebaseContext";
// import { HcpProfile } from "@/app/types";
// import UploadAvatar from "@/app/admin/UploadAvatar";      // unchanged

// interface Props {
//   onSave: () => void;
//   hcp?: HcpProfile | null;
// }

// export default function HCPForm({ onSave, hcp }: Props) {
//   const { db } = useFirebase();
//   // in components/HCPForm.tsx (or page.tsx etc.)

//  const [profile, setProfile] = useState<HcpProfile>({
//     fullName: "",
//     primarySkill: "",
//     experienceYears: 0,
//     bioSummary: "",
//     locationPreference: "",
//     profilePhotoUrl: null,
//     secondarySkills:    [],
//     certifications:     [],
//     languagesSpoken:    [],
//     availability: { fullTime: true, partTime: false, days: [], hours: "" },
//     internalStatus: "Pending Review",
//     });

//   /* ---------- helpers ---------- */
//   const handleString = (n: keyof HcpProfile) => (e: any) =>
//     setProfile({ ...profile, [n]: e.target.value });

//   const handleArray = (n: keyof HcpProfile) => (e: any) =>
//     setProfile({ ...profile, [n]: e.target.value.split(",").map((s:any)=>s.trim()) });

//   const save = async (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!db) return;
//     const col = collection(db, "hcpProfiles");
//     const ref  = profile.id ? doc(db, "hcpProfiles", profile.id) : doc(col);
//     await setDoc(ref, { ...profile, lastUpdated: new Date().toISOString() }, { merge: true });
//     onSave();
//   };

//   /* ---------- ui ---------- */
//   return (
//     <form onSubmit={save} className="space-y-6 p-6 bg-gray-800 rounded-2xl border border-gray-700 shadow-xl">
//       <h2 className="text-2xl font-bold mb-4 text-blue-300">
//         {profile.id ? "Edit HCP Profile" : "Create New HCP"}
//       </h2>

//       {/* top: avatar + headline */}
//       <div className="grid sm:grid-cols-3 gap-6">
//         <UploadAvatar
//           onUploadSuccess={(url: string)=>
//             setProfile({...profile, profilePhotoUrl:url})}
//           initialImageUrl={profile.profilePhotoUrl}
//         />
//         <div className="sm:col-span-2 space-y-4">
//           <Input label="Full name" value={profile.fullName} onChange={handleString("fullName")} />
//           <Input label="Primary skill" value={profile.primarySkill} onChange={handleString("primarySkill")} />
//           <Input label="Experience (yrs)" type="number" min={0} value={profile.experienceYears} onChange={handleString("experienceYears")} />
//         </div>
//       </div>

//       {/* second row: two-column grid */}
//       <div className="grid sm:grid-cols-2 gap-6">
//         <div className="space-y-4">
//           <Input label="Secondary skills (comma-sep)" placeholder="Housekeeping, Cooking" value={profile.secondarySkills.join(", ")} onChange={handleArray("secondarySkills")} />
//           <Input label="Certifications (comma-sep)" placeholder="CPR, First-Aid" value={profile.certifications.join(", ")} onChange={handleArray("certifications")} />
//           <Input label="Languages (comma-sep)" placeholder="English, Luganda" value={profile.languagesSpoken.join(", ")} onChange={handleArray("languagesSpoken")} />
//           <Input label="Education level" value={profile.educationLevel} onChange={handleString("educationLevel")} />
//         </div>

//         <div className="space-y-4">
//           <Textarea label="Bio summary" rows={6} value={profile.bioSummary} onChange={handleString("bioSummary")} />
//           <Input label="Preferred location(s)" value={profile.locationPreference} onChange={handleString("locationPreference")} />
//         </div>
//       </div>

//       {/* availability block */}
//       <fieldset className="border border-gray-600 rounded-xl p-4">
//         <legend className="text-sm text-gray-400 px-2">Availability</legend>
//         <div className="grid sm:grid-cols-3 gap-4">
//           <Toggle
//             label="Full-time"
//             checked={profile.availability.fullTime}
//             onChange={(v)=>setProfile({...profile, availability:{...profile.availability, fullTime:v}})}
//           />
//           <Toggle
//             label="Part-time"
//             checked={profile.availability.partTime}
//             onChange={(v)=>setProfile({...profile, availability:{...profile.availability, partTime:v}})}
//           />
//                     /* ---- WORKING HOURS input --------------------------------- */
//                 <Input
//                 label="Working hours"
//                 value={profile.availability.hours}
//                 onChange={(
//                     e: React.ChangeEvent<HTMLInputElement>   // ① annotate
//                 ) =>
//                     setProfile({
//                     ...profile,
//                     availability: { ...profile.availability, hours: e.target.value }
//                     })
//                 }
//                 />
//         </div>
//                     /* ---- WORKING DAYS textarea -------------------------------- */
//                     <Textarea
//                     label="Working days"
//                     rows={2}
//                     placeholder="Monday, Tuesday, Wednesday…"
//                     value={profile.availability.days.join(", ")}
//                     onChange={(
//                         e: React.ChangeEvent<HTMLTextAreaElement>  // ① annotate
//                     ) =>
//                         setProfile({
//                         ...profile,
//                         availability: {
//                             ...profile.availability,
//                             days: e.target.value                 //   split into array later
//                                     .split(",")
//                                     .map((s: string) => s.trim())  // ② annotate ‘s’
//                         }
//                         })
//                     }
//                     />
//       </fieldset>

//       {/* save */}
//       <button
//         className="w-full bg-blue-600 hover:bg-blue-500 rounded-xl py-3 font-semibold tracking-wide disabled:opacity-50"
//         disabled={!profile.fullName}
//       >
//         {profile.id ? "Update profile" : "Create profile"}
//       </button>
//     </form>
//   );
// }

// /* ---------- tiny reusable controls ---------- */
// function Input({label, ...props}: any) {
//   return (
//     <label className="block text-sm">
//       <span className="text-gray-300">{label}</span>
//       <input {...props} className="mt-1 w-full rounded-lg bg-gray-700 border border-gray-600 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
//     </label>
//   );
// }
// function Textarea({label, ...props}: any) {
//   return (
//     <label className="block text-sm">
//       <span className="text-gray-300">{label}</span>
//       <textarea {...props} className="mt-1 w-full rounded-lg bg-gray-700 border border-gray-600 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
//     </label>
//   );
// }
// function Toggle({label, checked, onChange}: {label:string;checked:boolean;onChange:(v:boolean)=>void}) {
//   return (
//     <label className="inline-flex items-center gap-2 cursor-pointer select-none">
//       <input type="checkbox" className="h-4 w-4" checked={checked} onChange={e=>onChange(e.target.checked)} />
//       <span className="text-gray-300">{label}</span>
//     </label>
//   );
// }