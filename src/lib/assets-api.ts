import { supabase } from "@/integrations/supabase/client";
import type { Asset, Collection, CreatorSummary, ProfileRow } from "./types";
import type { SortId } from "./taxonomy";

export const PAGE_SIZE = 24;

const CREATOR_SELECT =
  "creator:profiles!assets_creator_id_fkey(id,username,display_name,avatar_url)";
const ASSET_SELECT = `*, ${CREATOR_SELECT}`;

export interface AssetFilters {
  q?: string;
  category?: string;
  engine?: string;
  format?: string;
  license?: string;
  style?: string;
  sort?: SortId;
  page?: number;
}

function sanitizeTerm(term: string) {
  return term.replace(/[%,(){}]/g, " ").trim();
}

function applySort(
  query: ReturnType<typeof buildBaseQuery>,
  sort: SortId | undefined,
) {
  switch (sort) {
    case "downloads":
      return query.order("download_count", { ascending: false });
    case "newest":
      return query.order("created_at", { ascending: false });
    case "likes":
      return query.order("like_count", { ascending: false });
    default:
      return query
        .order("download_count", { ascending: false })
        .order("like_count", { ascending: false });
  }
}

function buildBaseQuery() {
  return supabase.from("assets").select(ASSET_SELECT, { count: "exact" });
}

export async function fetchAssets(filters: AssetFilters): Promise<{
  items: Asset[];
  total: number;
}> {
  const page = filters.page ?? 1;
  let query = buildBaseQuery();

  if (filters.category) query = query.eq("category", filters.category);
  if (filters.license) query = query.eq("license", filters.license);
  if (filters.engine) query = query.contains("engines", [filters.engine]);
  if (filters.format) query = query.contains("formats", [filters.format]);
  if (filters.style)
    query = query.contains("tags", [filters.style.toLowerCase()]);

  const term = filters.q ? sanitizeTerm(filters.q) : "";
  if (term) {
    query = query.or(
      `name.ilike.%${term}%,description.ilike.%${term}%,tags.cs.{"${term.toLowerCase()}"}`,
    );
  }

  query = applySort(query, filters.sort);
  query = query.range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);

  const { data, error, count } = await query;
  if (error) throw error;
  return { items: (data ?? []) as unknown as Asset[], total: count ?? 0 };
}

export async function fetchTrendingAssets(limit = 10): Promise<Asset[]> {
  const { data, error } = await supabase
    .from("assets")
    .select(ASSET_SELECT)
    .order("download_count", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data ?? []) as unknown as Asset[];
}

export async function fetchAssetBySlug(slug: string): Promise<Asset | null> {
  const { data, error } = await supabase
    .from("assets")
    .select(ASSET_SELECT)
    .eq("slug", slug)
    .maybeSingle();
  if (error) throw error;
  return (data as unknown as Asset) ?? null;
}

export async function fetchRelatedAssets(asset: Asset, limit = 5) {
  const { data, error } = await supabase
    .from("assets")
    .select(ASSET_SELECT)
    .eq("category", asset.category)
    .neq("id", asset.id)
    .order("download_count", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data ?? []) as unknown as Asset[];
}

export async function fetchCollections(limit = 6): Promise<Collection[]> {
  const { data, error } = await supabase
    .from("collections")
    .select(
      `*, creator:profiles!collections_creator_id_fkey(id,username,display_name,avatar_url), collection_assets(asset:assets(thumbnail_url))`,
    )
    .order("created_at", { ascending: true })
    .limit(limit);
  if (error) throw error;

  return (data ?? []).map((row) => {
    const links = (row as { collection_assets?: { asset: { thumbnail_url: string | null } | null }[] })
      .collection_assets ?? [];
    return {
      ...(row as unknown as Collection),
      asset_count: links.length,
      covers: links
        .map((link) => link.asset?.thumbnail_url)
        .filter((url): url is string => Boolean(url))
        .slice(0, 4),
    } as Collection;
  });
}

export async function fetchCollectionBySlug(slug: string) {
  const { data, error } = await supabase
    .from("collections")
    .select(
      `*, creator:profiles!collections_creator_id_fkey(id,username,display_name,avatar_url), collection_assets(asset:assets(*, ${CREATOR_SELECT}))`,
    )
    .eq("slug", slug)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  const links =
    (data as { collection_assets?: { asset: Asset | null }[] }).collection_assets ?? [];
  const assets = links.map((l) => l.asset).filter((a): a is Asset => Boolean(a));
  return {
    collection: {
      ...(data as unknown as Collection),
      asset_count: assets.length,
      covers: assets
        .map((a) => a.thumbnail_url)
        .filter((u): u is string => Boolean(u))
        .slice(0, 4),
    } as Collection,
    assets,
  };
}

export async function fetchProfileByUsername(
  username: string,
): Promise<ProfileRow | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("username", username)
    .maybeSingle();
  if (error) throw error;
  return data ?? null;
}

export async function fetchCreatorAssets(creatorId: string): Promise<Asset[]> {
  const { data, error } = await supabase
    .from("assets")
    .select(ASSET_SELECT)
    .eq("creator_id", creatorId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as unknown as Asset[];
}

export async function fetchCreatorCollections(creatorId: string) {
  const { data, error } = await supabase
    .from("collections")
    .select(
      `*, creator:profiles!collections_creator_id_fkey(id,username,display_name,avatar_url), collection_assets(asset:assets(thumbnail_url))`,
    )
    .eq("creator_id", creatorId);
  if (error) throw error;
  return (data ?? []).map((row) => {
    const links = (row as { collection_assets?: { asset: { thumbnail_url: string | null } | null }[] })
      .collection_assets ?? [];
    return {
      ...(row as unknown as Collection),
      asset_count: links.length,
      covers: links
        .map((l) => l.asset?.thumbnail_url)
        .filter((u): u is string => Boolean(u))
        .slice(0, 4),
    } as Collection;
  });
}

export async function recordDownload(assetId: string) {
  const { error } = await supabase
    .from("download_events")
    .insert({ asset_id: assetId });
  if (error) throw error;
}

export async function submitReport(input: {
  assetId: string;
  reason: string;
  description?: string;
  reporterId?: string | null;
}) {
  const { error } = await supabase.from("reports").insert({
    asset_id: input.assetId,
    reason: input.reason,
    description: input.description ?? null,
    reporter_id: input.reporterId ?? null,
  });
  if (error) throw error;
}

export function creatorHandle(creator: CreatorSummary | null | undefined) {
  return creator?.username ? `@${creator.username}` : "@unknown";
}
