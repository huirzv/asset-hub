import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";

import { EmptyState } from "@/components/common/EmptyState";
import { Skeleton } from "@/components/ui/skeleton";
import { fetchCollections } from "@/lib/assets-api";
import { formatCount } from "@/lib/format";

export const Route = createFileRoute("/collections")({
  head: () => ({
    meta: [
      { title: "Curated asset collections — Assetly" },
      {
        name: "description",
        content:
          "Hand-picked collections of free game assets: starter environments, UI packs, prop kits and more.",
      },
      { property: "og:title", content: "Curated asset collections — Assetly" },
      {
        property: "og:description",
        content: "Hand-picked collections of free game assets.",
      },
    ],
  }),
  component: CollectionsPage,
});

function CollectionsPage() {
  const collections = useQuery({
    queryKey: ["collections", 24],
    queryFn: () => fetchCollections(24),
  });

  return (
    <div className="mx-auto max-w-[1600px] px-4 py-8 sm:px-6">
      <h1 className="text-2xl font-semibold tracking-tight">Collections</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Packs of assets that work well together.
      </p>

      <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {collections.isLoading
          ? Array.from({ length: 6 }).map((_, index) => (
              <Skeleton key={index} className="h-52 rounded-lg" />
            ))
          : (collections.data ?? []).map((collection) => (
              <Link
                key={collection.id}
                to="/collection/$slug"
                params={{ slug: collection.slug }}
                className="group rounded-lg border border-border bg-surface p-3 transition-colors hover:border-border-strong"
              >
                <div className="grid grid-cols-4 gap-1.5">
                  {collection.covers.slice(0, 4).map((cover, index) => (
                    <img
                      key={`${collection.id}-${index}`}
                      src={cover}
                      alt=""
                      loading="lazy"
                      className="aspect-square w-full rounded object-cover"
                    />
                  ))}
                </div>
                <h2 className="mt-3 text-sm font-medium">{collection.name}</h2>
                <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                  {collection.description}
                </p>
                <p className="mt-2 font-mono text-[11px] text-muted-foreground">
                  {formatCount(collection.asset_count)} assets ·{" "}
                  {collection.creator?.display_name ?? "Assetly"}
                </p>
              </Link>
            ))}
      </div>

      {!collections.isLoading && (collections.data ?? []).length === 0 ? (
        <EmptyState
          title="No collections yet"
          description="Curated collections will appear here as the library grows."
        />
      ) : null}
    </div>
  );
}
