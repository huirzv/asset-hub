import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Search, ShieldCheck, Sparkles, Upload } from "lucide-react";

import { AssetGrid } from "@/components/assets/AssetGrid";
import { SectionHeader } from "@/components/common/SectionHeader";
import { Button } from "@/components/ui/button";
import { fetchAssets, fetchCollections, fetchTrendingAssets } from "@/lib/assets-api";
import { useAuth } from "@/hooks/useAuth";
import { useFavoriteIds, useToggleFavorite } from "@/hooks/useFavorites";
import { CATEGORIES, QUICK_SEARCHES } from "@/lib/taxonomy";
import { formatCount } from "@/lib/format";
import type { Asset } from "@/lib/types";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Assetly — Free game development assets, forever" },
      {
        name: "description",
        content:
          "Discover, preview and download thousands of free 3D models, UI kits, textures and VFX for Roblox, Unity, Unreal, Godot and Blender.",
      },
      { property: "og:title", content: "Assetly — Free game development assets" },
      {
        property: "og:description",
        content:
          "A community-driven library of free, clearly licensed game assets. No paywalls, no subscriptions.",
      },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  const navigate = useNavigate();
  const [term, setTerm] = useState("");
  const { userId } = useAuth();
  const { data: favoriteIds } = useFavoriteIds(userId);
  const toggleFavorite = useToggleFavorite(userId);

  const trending = useQuery({
    queryKey: ["trending", 8],
    queryFn: () => fetchTrendingAssets(8),
  });
  const newest = useQuery({
    queryKey: ["assets", { sort: "newest", page: 1, limit: 4 }],
    queryFn: () => fetchAssets({ sort: "newest", page: 1 }),
  });
  const collections = useQuery({
    queryKey: ["collections", 3],
    queryFn: () => fetchCollections(3),
  });

  const onToggleFavorite = (asset: Asset) =>
    toggleFavorite.mutate({
      assetId: asset.id,
      isFavorite: favoriteIds?.has(asset.id) ?? false,
    });

  const submitSearch = (event: React.FormEvent) => {
    event.preventDefault();
    navigate({ to: "/explore", search: term.trim() ? { q: term.trim() } : {} });
  };

  return (
    <div className="mx-auto max-w-[1600px] px-4 sm:px-6">
      <section className="relative overflow-hidden border-b border-border py-16 sm:py-24">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10 bg-grid opacity-60"
        />
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1 text-[12px] text-muted-foreground">
            <Sparkles className="h-3 w-3 text-primary" />
            Free forever · community-built · clearly licensed
          </span>
          <h1 className="mt-5 text-balance text-4xl font-semibold tracking-tight sm:text-6xl">
            Every asset your game needs.
            <span className="block text-muted-foreground">None of the price tags.</span>
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-pretty text-base text-muted-foreground">
            Assetly is a community-driven library of 3D models, UI kits,
            textures and VFX — ready for Roblox, Unity, Unreal, Godot and
            Blender.
          </p>

          <form onSubmit={submitSearch} className="mx-auto mt-8 max-w-xl">
            <div className="flex items-center gap-2 rounded-xl border border-border-strong bg-surface p-1.5 focus-within:border-primary/60">
              <Search className="ml-2 h-4 w-4 shrink-0 text-muted-foreground" />
              <input
                value={term}
                onChange={(event) => setTerm(event.target.value)}
                placeholder="Search low poly trees, sci-fi UI, PBR textures…"
                aria-label="Search assets"
                className="h-9 w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
              />
              <Button type="submit" size="sm" className="shrink-0">
                Search
              </Button>
            </div>
          </form>

          <div className="mt-4 flex flex-wrap items-center justify-center gap-1.5">
            {QUICK_SEARCHES.map((quick) => (
              <Link
                key={quick}
                to="/explore"
                search={{ q: quick }}
                className="rounded-full border border-border px-2.5 py-1 text-xs text-muted-foreground transition-colors hover:border-border-strong hover:text-foreground"
              >
                {quick}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="py-12">
        <SectionHeader
          title="Browse by category"
          description="Start with 3D models — more asset types are live and growing."
        />
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {CATEGORIES.map((category) => (
            <Link
              key={category.id}
              to="/explore"
              search={{ category: category.id }}
              className="group relative overflow-hidden rounded-lg border border-border bg-surface"
            >
              <div className="aspect-[16/9] overflow-hidden">
                <img
                  src={category.image}
                  alt=""
                  loading="lazy"
                  decoding="async"
                  className="h-full w-full object-cover opacity-70 transition duration-300 group-hover:scale-105 group-hover:opacity-100"
                />
              </div>
              <div className="flex items-center justify-between px-3 py-2.5">
                <span className="text-sm font-medium">{category.label}</span>
                <ArrowRight className="h-3.5 w-3.5 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="py-12">
        <SectionHeader
          title="Trending this week"
          description="The assets creators are downloading right now."
          action={
            <Button asChild variant="outline" size="sm">
              <Link to="/explore" search={{ sort: "trending" }}>
                View all
              </Link>
            </Button>
          }
        />
        <div className="mt-6">
          <AssetGrid
            assets={trending.data ?? []}
            loading={trending.isLoading}
            skeletonCount={8}
            favoriteIds={favoriteIds}
            onToggleFavorite={onToggleFavorite}
          />
        </div>
      </section>

      <section className="py-12">
        <SectionHeader
          title="Curated collections"
          description="Hand-picked packs to kickstart a scene."
          action={
            <Button asChild variant="outline" size="sm">
              <Link to="/collections">All collections</Link>
            </Button>
          }
        />
        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {(collections.data ?? []).map((collection) => (
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
              <h3 className="mt-3 text-sm font-medium">{collection.name}</h3>
              <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                {collection.description}
              </p>
              <p className="mt-2 font-mono text-[11px] text-muted-foreground">
                {formatCount(collection.asset_count)} assets
              </p>
            </Link>
          ))}
        </div>
      </section>

      <section className="py-12">
        <SectionHeader
          title="Freshly uploaded"
          description="New from the community."
        />
        <div className="mt-6">
          <AssetGrid
            assets={(newest.data?.items ?? []).slice(0, 4)}
            loading={newest.isLoading}
            skeletonCount={4}
            favoriteIds={favoriteIds}
            onToggleFavorite={onToggleFavorite}
          />
        </div>
      </section>

      <section className="my-12 rounded-xl border border-border bg-surface px-6 py-12 text-center">
        <ShieldCheck className="mx-auto h-6 w-6 text-primary" />
        <h2 className="mt-4 text-2xl font-semibold tracking-tight">
          Share your work with the community
        </h2>
        <p className="mx-auto mt-2 max-w-lg text-sm text-muted-foreground">
          Every upload is quarantined, validated and scanned before it goes
          live — so downloads stay safe for everyone.
        </p>
        <Button asChild className="mt-6">
          <Link to="/upload">
            <Upload className="mr-1.5 h-3.5 w-3.5" />
            Upload an asset
          </Link>
        </Button>
      </section>
    </div>
  );
}
