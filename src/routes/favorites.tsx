import { createFileRoute, Link } from "@tanstack/react-router";
import { Heart } from "lucide-react";

import { AssetGrid } from "@/components/assets/AssetGrid";
import { EmptyState } from "@/components/common/EmptyState";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import {
  useFavoriteAssets,
  useFavoriteIds,
  useToggleFavorite,
} from "@/hooks/useFavorites";
import type { Asset } from "@/lib/types";

export const Route = createFileRoute("/favorites")({
  head: () => ({
    meta: [
      { title: "Your favorites — Assetly" },
      {
        name: "description",
        content: "Assets you saved for your next game project on Assetly.",
      },
      { property: "og:title", content: "Your favorites — Assetly" },
      {
        property: "og:description",
        content: "Assets you saved for your next game project.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: FavoritesPage,
});

function FavoritesPage() {
  const { userId, loading } = useAuth();
  const favorites = useFavoriteAssets(userId);
  const { data: favoriteIds } = useFavoriteIds(userId);
  const toggleFavorite = useToggleFavorite(userId);

  const onToggleFavorite = (asset: Asset) =>
    toggleFavorite.mutate({ assetId: asset.id, isFavorite: true });

  return (
    <div className="mx-auto max-w-[1600px] px-4 py-8 sm:px-6">
      <h1 className="text-2xl font-semibold tracking-tight">Favorites</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Everything you saved, ready to drop into your next scene.
      </p>

      <div className="mt-8">
        {!loading && !userId ? (
          <EmptyState
            icon={<Heart className="h-5 w-5" />}
            title="Sign in to save assets"
            description="Favorites are tied to your account so they follow you everywhere."
            action={
              <Button asChild size="sm">
                <Link to="/auth">Sign in</Link>
              </Button>
            }
          />
        ) : (
          <AssetGrid
            assets={favorites.data ?? []}
            loading={loading || favorites.isLoading}
            favoriteIds={favoriteIds}
            onToggleFavorite={onToggleFavorite}
            emptyState={
              <EmptyState
                icon={<Heart className="h-5 w-5" />}
                title="No favorites yet"
                description="Tap the heart on any asset to save it here."
                action={
                  <Button asChild size="sm" variant="outline">
                    <Link to="/explore" search={{}}>
                      Explore assets
                    </Link>
                  </Button>
                }
              />
            }
          />
        )}
      </div>
    </div>
  );
}
