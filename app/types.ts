// app/types.ts
// -----------------------------------------------------------------------------
// Shared domain types for HomeLift Admin / Public site / PDF generation
// -----------------------------------------------------------------------------

/** * A simple availability object (extend as needed). */
export interface Availability {
  fullTime:   boolean;
  partTime:   boolean;
  /** e.g. ["Monday", "Tuesday"] */
  days:       string[];
  /** e.g. "08:00-17:00" or "Night Shift" */
  hours:      string;
}

/** Clean way to track internal review / lifecycle. */
export type HcpStatus =
  | "Pending Review"
  | "Approved - Ready for Match"
  | "Matched"
  | "Inactive";

/**
 * Master record for a Home-Care Professional.
 * You can safely add or remove optional fields as your admin UI grows.
 */
export interface HcpProfile {
  /** Firestore doc ID (filled in after write). */
  id?: string;

  // ---------- Essentials shown on public PDF ----------
  fullName:          string;
  primarySkill:      string;            // Elderly Care, Childcare, …
  secondarySkills?:  string[];
  experienceYears:   number;
  bioSummary:        string;
  locationPreference:string;
  profilePhotoUrl:   string | null;

  // ---------- Nice-to-have enrichments ----------
  languagesSpoken?:  string[];          // ["English","Luganda",…]
  certifications?:   string[];          // ["First Aid & CPR (2026)", …]
  educationLevel?:   string;            // High-school, Diploma, …
  referencesSummary?:string;            // “Two verified refs …”
  availability:      Availability;

  // ---------- Internal / system fields ----------
  internalStatus?:   HcpStatus;
  dateCreated?:      string;            // ISO timestamp
  lastUpdated?:      string;            // ISO timestamp

  /** Catch-all for anything we haven’t formalised yet. */
  [key: string]: unknown;
}