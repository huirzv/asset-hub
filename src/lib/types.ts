import type { Database } from "@/integrations/supabase/types";

export type AssetRow = Database["public"]["Tables"]["assets"]["Row"];
export type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];
export type CollectionRow = Database["public"]["Tables"]["collections"]["Row"];

export type UploadStatus = Database["public"]["Enums"]["upload_status"];
export type ScanStatus = Database["public"]["Enums"]["scan_status"];
export type ValidationStatus = Database["public"]["Enums"]["validation_status"];
export type ModerationStatus = Database["public"]["Enums"]["moderation_status"];

export interface CreatorSummary {
  id: string;
  username: string;
  display_name: string;
  avatar_url: string | null;
}

export interface Asset extends AssetRow {
  creator: CreatorSummary | null;
}

export interface Collection extends CollectionRow {
  creator: CreatorSummary | null;
  asset_count: number;
  covers: string[];
}

export const REPORT_REASONS = [
  { id: "stolen", label: "Stolen content" },
  { id: "malware", label: "Malware / suspicious file" },
  { id: "license", label: "Incorrect license" },
  { id: "copyright", label: "Copyright issue" },
  { id: "inappropriate", label: "Inappropriate content" },
  { id: "broken", label: "Broken download" },
  { id: "other", label: "Other" },
] as const;
