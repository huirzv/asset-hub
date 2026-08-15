import { createFileRoute, Link, notFound } from "@tanstack/react-router";

import { AssetGrid } from "@/components/assets/AssetGrid";
import { EmptyState } from "@/components/common/EmptyState";
import {
  fetchCreatorAssets,
  fetchCreatorCollections,
  fetchProfileByUsername,
} from "@/lib/assets-api";
import { useAuth } from "@/hooks/useAuth";
import { useFavoriteIds, useToggleFavorite } from "@/hooks/useFavorites";
import { formatCount, formatDate, formatNumber } from "@/lib/format";
import type { Asset } from "@/lib/types";

export const Route = createFileRoute("/creators/$username")({
  loader: async ({ params }) => {
    const profile = await fetchProfileByUsername(params.username);
    if (!profile) throw notFound();
    const [assets, collections] = await Promise.all([
      fetchCreatorAssets(profile.id),
      fetchCreatorCollections(profile.id),
    ]);
    return { profile, assets, collections };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [
          { title: "Creator unavailable — Assetly" },
          { name: "robots", content: "noindex" },
        ],
      };
    }
    const { profile, assets } = loaderData;
    const description =
      profile.bio ??
      `${profile.display_name} shares ${assets.length} free game assets on Assetly.`;
    return {
      meta: [
        { title: `${profile.display_name} (@${profile.username}) — Assetly` },
        { name: "description", content: description.slice(0, 158) },
        {
          property: "og:title",
          content: `${profile.display_name} on Assetly`,
        },
        { property: "og:description", content: description.slice(0, 158) },
      ],
    };
  },
  component: CreatorPage,
});

function CreatorPage() {
  const { profile, assets, collections } = Route.useLoaderData();
  const { userId } = useAuth();
  const { data: favoriteIds } = useFavoriteIds(userId);
  const toggleFavorite = useToggleFavorite(userId);

  const downloads = assets.reduce((sum, asset) => sum + asset.download_count, 0);
  const likes = assets.reduce((sum, asset) => sum + asset.like_count, 0);

  const onToggleFavorite = (asset: Asset) =>
    toggleFavorite.mutate({
      assetId: asset.id,
      isFavorite: favoriteIds?.has(asset.id) ?? false,
    });

  return (
    <div className="mx-auto max-w-[1600px] px-4 py-8 sm:px-6">
      <header className="flex flex-wrap items-start gap-5 rounded-xl border border-border bg-surface p-6">
        <span className="grid h-16 w-16 place-items-center rounded-full border border-border-strong bg-background text-xl font-semibold uppercase">
          {profile.display_name.slice(0, 1)}
        </span>
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-semibold tracking-tight">
            {profile.display_name}
          </h1>
          <p className="font-mono text-xs text-muted-foreground">
            @{profile.username} · joined {formatDate(profile.created_at)}
          </p>
          {profile.bio ? (
            <p className="mt-3 max-w-2xl text-sm text-muted-foreground">
              {profile.bio}
            </p>
          ) : null}
          {profile.website ? (
            <a
              href={profile.website}
              target="_blank"
              rel="noreferrer nofollow"
              className="mt-2 inline-block text-xs text-muted-foreground underline underline-offset-4 hover:text-foreground"
            >
              {profile.website.replace(/^https?:\/\//, "")}
            </a>
          ) : null}
        </div>
        <dl className="flex gap-6">
          <Stat label="Assets" value={formatNumber(assets.length)} />
          <Stat label="Downloads" value={formatCount(downloads)} />
          <Stat label="Likes" value={formatCount(likes)} />
        </dl>
      </header>

      {collections.length > 0 ? (
        <section className="mt-10">
          <h2 className="text-lg font-semibold tracking-tight">Collections</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {collections.map((collection) => (
              <Link
                key={collection.id}
                to="/collection/$slug"
                params={{ slug: collection.slug }}
                className="rounded-full border border-border px-3 py-1.5 text-xs text-muted-foreground hover:border-border-strong hover:text-foreground"
              >
                {collection.name} · {collection.asset_count}
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      <section className="mt-10">
        <h2 className="text-lg font-semibold tracking-tight">Assets</h2>
        <div className="mt-5">
          <AssetGrid
            assets={assets}
            favoriteIds={favoriteIds}
            onToggleFavorite={onToggleFavorite}
            emptyState={
              <EmptyState
                title="No published assets yet"
                description={`${profile.display_name} hasn't published anything to the library so far.`}
              />
            }
          />
        </div>
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-eyebrow">{label}</dt>
      <dd className="mt-1 font-mono text-lg">{value}</dd>
    </div>
  );
}
