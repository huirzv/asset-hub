/** Centralized taxonomy: categories, engines, formats, styles, sorting. */

export interface CategoryDefinition {
  id: string;
  label: string;
  shortLabel: string;
  /** thumbnail used in the category browser */
  image: string;
  available: boolean;
}

export const CATEGORIES: CategoryDefinition[] = [
  {
    id: "3d-models",
    label: "3D Models",
    shortLabel: "3D",
    image: "/images/assets/low-poly-cafe.jpg",
    available: true,
  },
  {
    id: "ui-kits",
    label: "UI Kits",
    shortLabel: "UI",
    image: "/images/assets/simulator-ui.jpg",
    available: true,
  },
  {
    id: "textures",
    label: "Textures",
    shortLabel: "Textures",
    image: "/images/assets/textures-set.jpg",
    available: true,
  },
  {
    id: "materials",
    label: "Materials",
    shortLabel: "Materials",
    image: "/images/assets/scifi-corridor.jpg",
    available: true,
  },
  {
    id: "icons",
    label: "Icons",
    shortLabel: "Icons",
    image: "/images/assets/game-icons.jpg",
    available: true,
  },
  {
    id: "vfx",
    label: "VFX",
    shortLabel: "VFX",
    image: "/images/assets/vfx-pack.jpg",
    available: true,
  },
  {
    id: "audio",
    label: "Audio",
    shortLabel: "Audio",
    image: "/images/assets/food-pack.jpg",
    available: true,
  },
  {
    id: "animations",
    label: "Animations",
    shortLabel: "Animations",
    image: "/images/assets/fantasy-weapons.jpg",
    available: true,
  },
];

export function getCategory(id: string | null | undefined) {
  return CATEGORIES.find((c) => c.id === id);
}

export function categoryLabel(id: string | null | undefined) {
  return getCategory(id)?.label ?? "Other";
}

export interface EngineDefinition {
  id: string;
  label: string;
  /** two-letter mark used in compact badges */
  mark: string;
}

export const ENGINES: EngineDefinition[] = [
  { id: "roblox", label: "Roblox", mark: "RB" },
  { id: "unity", label: "Unity", mark: "UN" },
  { id: "unreal", label: "Unreal Engine", mark: "UE" },
  { id: "godot", label: "Godot", mark: "GD" },
  { id: "blender", label: "Blender", mark: "BL" },
];

export function getEngine(id: string) {
  return ENGINES.find((e) => e.id === id);
}

export const FILE_FORMATS = [
  "GLB",
  "GLTF",
  "FBX",
  "OBJ",
  "BLEND",
  "PNG",
  "SVG",
  "ZIP",
] as const;
export type FileFormat = (typeof FILE_FORMATS)[number];

export const STYLES = [
  "Low Poly",
  "Stylized",
  "Realistic",
  "Cartoon",
  "Pixel",
  "Minimal",
] as const;

export const SORT_OPTIONS = [
  { id: "trending", label: "Trending" },
  { id: "downloads", label: "Most Downloaded" },
  { id: "newest", label: "Newest" },
  { id: "likes", label: "Most Liked" },
] as const;
export type SortId = (typeof SORT_OPTIONS)[number]["id"];

export const QUICK_SEARCHES = [
  "Low Poly",
  "Environment",
  "Furniture",
  "Weapons",
  "Vehicles",
  "UI",
  "Nature",
  "Characters",
];
