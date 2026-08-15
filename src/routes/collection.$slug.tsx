import { createFileRoute, notFound } from "@tanstack/react-router";

import { AssetGrid } from "@/components/assets/AssetGrid";
import { fetchCollectionBySlug } from "@/lib/assets-api";
import { useAuth } from "@/hooks/useAuth";
import { useFavoriteIds, useToggleFavorite } from "@/hooks/useFavorites";
import { formatCount } from "@/lib/format";
import type { Asset } from "@/lib/types";

export const Route = createFileRoute("/collection/$slug")({
  loader: async ({ params }) => {
    const result = await fetchCollectionBySlug(params.slug);
    if (!result) throw notFound();
    return result;
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [
          { title: "Collection unavailable — Assetly" },
          { name: "robots", content: "noindex" },
        ],
      };
    }
    const { collection } = loaderData;
    const description =
      collection.description ??
      `A curated collection of free game assets on Assetly.`;
    return {
      meta: [
        { title: `${collection.name} — free asset collection · Assetly` },
        { name: "description", content: description.slice(0, 158) },
        { property: "og:title", content: `${collection.name} — Assetly` },
        { property: "og:description", content: description.slice(0, 158) },
      ],
    };
  },
  component: CollectionDetailPage,
});

function CollectionDetailPage() {
  const { collection, assets } = Route.useLoaderData();
  const { userId } = useAuth();
  const { data: favoriteIds } = useFavoriteIds(userId);
  const toggleFavorite = useToggleFavorite(userId);

  const onToggleFavorite = (asset: Asset) =>
    toggleFavorite.mutate({
      assetId: asset.id,
      isFavorite: favoriteIds?.has(asset.id) ?? false,
    });

  return (
    <div className="mx-auto max-w-[1600px] px-4 py-8 sm:px-6">
      <h1 className="text-2xl font-semibold tracking-tight">
        {collection.name}
      </h1>
      <p className="mt-1.5 max-w-2xl text-sm text-muted-foreground">
        {collection.description}
      </p>
      <p className="mt-2 font-mono text-[11px] text-muted-foreground">
        {formatCount(assets.length)} assets · curated by{" "}
        {collection.creator?.display_name ?? "Assetly"}
      </p>

      <div className="mt-8">
        <AssetGrid
          assets={assets}
          favoriteIds={favoriteIds}
          onToggleFavorite={onToggleFavorite}
        />
      </div>
    </div>
  );
}
