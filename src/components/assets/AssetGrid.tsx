import { AssetCard, AssetCardSkeleton } from "./AssetCard";
import type { Asset } from "@/lib/types";

interface AssetGridProps {
  assets: Asset[];
  loading?: boolean;
  skeletonCount?: number;
  favoriteIds?: Set<string>;
  onToggleFavorite?: (asset: Asset) => void;
  emptyState?: React.ReactNode;
}

export function AssetGrid({
  assets,
  loading = false,
  skeletonCount = 10,
  favoriteIds,
  onToggleFavorite,
  emptyState,
}: AssetGridProps) {
  if (loading) {
    return (
      <div className="grid-assets">
        {Array.from({ length: skeletonCount }).map((_, index) => (
          <AssetCardSkeleton key={index} />
        ))}
      </div>
    );
  }

  if (assets.length === 0 && emptyState) {
    return <>{emptyState}</>;
  }

  return (
    <div className="grid-assets">
      {assets.map((asset, index) => (
        <AssetCard
          key={asset.id}
          asset={asset}
          priority={index < 5}
          isFavorite={favoriteIds?.has(asset.id)}
          onToggleFavorite={onToggleFavorite}
        />
      ))}
    </div>
  );
}
