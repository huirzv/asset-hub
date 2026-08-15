/**
 * Centralized upload validation rules.
 * These are enforced on the client for fast feedback AND re-enforced
 * server-side — the client rules are a convenience, never the boundary.
 */

export const MAX_PACKAGE_BYTES = 250 * 1024 * 1024; // 250 MB
export const MAX_THUMBNAIL_BYTES = 8 * 1024 * 1024; // 8 MB
export const MAX_PREVIEW_MODEL_BYTES = 30 * 1024 * 1024; // 30 MB

/** Extensions that may never be accepted in any slot, in any container. */
export const BLOCKED_EXTENSIONS = [
  "exe",
  "msi",
  "bat",
  "cmd",
  "ps1",
  "scr",
  "com",
  "jar",
  "dll",
  "sh",
  "app",
  "apk",
  "vbs",
  "js",
  "wsf",
  "pif",
  "deb",
  "rpm",
  "dmg",
];

export const ALLOWED_PACKAGE_EXTENSIONS = [
  "zip",
  "glb",
  "gltf",
  "fbx",
  "obj",
  "blend",
  "png",
  "svg",
  "wav",
  "mp3",
  "ogg",
];

export const ALLOWED_THUMBNAIL_EXTENSIONS = ["png", "jpg", "jpeg", "webp"];
export const ALLOWED_THUMBNAIL_MIME = [
  "image/png",
  "image/jpeg",
  "image/webp",
];

export const ALLOWED_PREVIEW_EXTENSIONS = ["glb", "gltf"];
export const ALLOWED_PREVIEW_MIME = [
  "model/gltf-binary",
  "model/gltf+json",
  "application/octet-stream",
  "",
];

/** Archives get extra scrutiny — contents are never executed or trusted. */
export const ARCHIVE_EXTENSIONS = ["zip"];

export interface FileDescriptor {
  name: string;
  size: number;
  type: string;
}

export interface ValidationIssue {
  code:
    | "blocked_extension"
    | "unsupported_extension"
    | "too_large"
    | "empty"
    | "mime_mismatch";
  message: string;
}

export function getExtension(filename: string): string {
  const parts = filename.toLowerCase().split(".");
  return parts.length > 1 ? parts[parts.length - 1] : "";
}

export type UploadSlot = "package" | "thumbnail" | "preview";

const SLOT_RULES: Record<
  UploadSlot,
  { extensions: string[]; maxBytes: number; mimeTypes?: string[]; label: string }
> = {
  package: {
    extensions: ALLOWED_PACKAGE_EXTENSIONS,
    maxBytes: MAX_PACKAGE_BYTES,
    label: "download package",
  },
  thumbnail: {
    extensions: ALLOWED_THUMBNAIL_EXTENSIONS,
    maxBytes: MAX_THUMBNAIL_BYTES,
    mimeTypes: ALLOWED_THUMBNAIL_MIME,
    label: "thumbnail",
  },
  preview: {
    extensions: ALLOWED_PREVIEW_EXTENSIONS,
    maxBytes: MAX_PREVIEW_MODEL_BYTES,
    mimeTypes: ALLOWED_PREVIEW_MIME,
    label: "3D preview",
  },
};

export function validateFile(
  file: FileDescriptor,
  slot: UploadSlot,
): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const rules = SLOT_RULES[slot];
  const ext = getExtension(file.name);

  if (file.size <= 0) {
    issues.push({ code: "empty", message: "This file is empty." });
  }
  if (BLOCKED_EXTENSIONS.includes(ext)) {
    issues.push({
      code: "blocked_extension",
      message: `.${ext} files are never accepted on Assetly.`,
    });
    return issues;
  }
  if (!rules.extensions.includes(ext)) {
    issues.push({
      code: "unsupported_extension",
      message: `.${ext || "unknown"} is not a supported ${rules.label} format. Allowed: ${rules.extensions.join(", ")}.`,
    });
  }
  if (file.size > rules.maxBytes) {
    issues.push({
      code: "too_large",
      message: `This file is larger than the ${Math.round(rules.maxBytes / (1024 * 1024))} MB limit for a ${rules.label}.`,
    });
  }
  if (
    rules.mimeTypes &&
    file.type &&
    !rules.mimeTypes.includes(file.type.toLowerCase())
  ) {
    issues.push({
      code: "mime_mismatch",
      message: `The declared file type (${file.type}) does not match a supported ${rules.label}.`,
    });
  }
  return issues;
}

export function isArchive(filename: string): boolean {
  return ARCHIVE_EXTENSIONS.includes(getExtension(filename));
}

/** Storage keys never trust the user-provided filename. */
export function buildStorageKey(
  userId: string,
  slot: UploadSlot,
  filename: string,
): string {
  const ext = getExtension(filename);
  const token =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.floor(Math.random() * 1e9)}`;
  return `${userId}/${slot}/${token}${ext ? `.${ext}` : ""}`;
}
