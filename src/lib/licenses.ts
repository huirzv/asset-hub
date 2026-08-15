/**
 * Deterministic license definitions.
 * Licensing permissions are NEVER inferred or generated — they are read
 * from this table only. Adding a license requires an explicit entry here.
 */

export type LicenseId = "CC0" | "CC BY";

export interface LicensePermission {
  label: string;
  allowed: boolean;
  /** true = requirement/caveat rather than a plain permission */
  caveat?: boolean;
}

export interface LicenseDefinition {
  id: LicenseId;
  name: string;
  shortName: string;
  url: string;
  summary: string;
  attributionRequired: boolean;
  permissions: LicensePermission[];
}

export const LICENSES: Record<LicenseId, LicenseDefinition> = {
  CC0: {
    id: "CC0",
    name: "CC0 1.0 Universal (Public Domain Dedication)",
    shortName: "CC0",
    url: "https://creativecommons.org/publicdomain/zero/1.0/",
    summary:
      "The creator has waived their rights to this work worldwide. You can use it for anything, including commercial projects, without crediting anyone.",
    attributionRequired: false,
    permissions: [
      { label: "Commercial use", allowed: true },
      { label: "Modification", allowed: true },
      { label: "Personal use", allowed: true },
      { label: "Attribution not required", allowed: true },
    ],
  },
  "CC BY": {
    id: "CC BY",
    name: "Creative Commons Attribution 4.0 International",
    shortName: "CC BY 4.0",
    url: "https://creativecommons.org/licenses/by/4.0/",
    summary:
      "Free to use in any project, including commercial ones, as long as you credit the creator.",
    attributionRequired: true,
    permissions: [
      { label: "Commercial use", allowed: true },
      { label: "Modification", allowed: true },
      { label: "Personal use", allowed: true },
      { label: "Attribution required", allowed: false, caveat: true },
    ],
  },
};

export const LICENSE_IDS = Object.keys(LICENSES) as LicenseId[];

export function getLicense(id: string | null | undefined): LicenseDefinition {
  if (id && id in LICENSES) return LICENSES[id as LicenseId];
  return LICENSES["CC BY"];
}

export function buildAttribution(input: {
  assetName: string;
  creatorName: string;
  licenseId: string;
  url: string;
}): string {
  const license = getLicense(input.licenseId);
  return `"${input.assetName}" by ${input.creatorName}, licensed under ${license.shortName} (${license.url}). Source: ${input.url}`;
}
