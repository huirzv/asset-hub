import { Link } from "@tanstack/react-router";
import { ArrowDownToLine, Heart } from "lucide-react";

import { cn } from "@/lib/utils";
import { formatCount } from "@/lib/format";
import { getEngine } from "@/lib/taxonomy";
import type { Asset } from "@/lib/types";

interface AssetCardProps {
  asset: Asset;
  isFavorite?: boolean;
  onToggleFavorite?: (asset: Asset) => void;
  priority?: boolean;
}

export function AssetCard({
  asset,
  isFavorite = false,
  onToggleFavorite,
  priority = false,
}: AssetCardProps) {
  const primaryFormat = asset.formats?.[0];

  return (
    <article className="group relative">
      <Link
        to="/asset/$slug"
        params={{ slug: asset.slug }}
        className="block rounded-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
      >
        <div className="relative aspect-[4/3] overflow-hidden rounded-lg border border-border bg-surface transition-colors duration-200 group-hover:border-border-strong">
          {asset.thumbnail_url ? (
            <img
              src={asset.thumbnail_url}
              alt={`${asset.name} preview`}
              loading={priority ? "eager" : "lazy"}
              decoding="async"
              width={1024}
              height={768}
              className="h-full w-full object-cover transition-transform duration-300 ease-out group-hover:scale-[1.04]"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
              No preview
            </div>
          )}

          <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-between gap-2 bg-gradient-to-t from-background/85 to-transparent p-2 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
            <span className="rounded border border-border-strong bg-background/80 px-1.5 py-0.5 text-[11px] font-medium text-foreground backdrop-blur-sm">
              View asset
            </span>
            {primaryFormat ? (
              <span className="rounded border border-border-strong bg-background/80 px-1.5 py-0.5 font-mono text-[10px] uppercase text-muted-foreground backdrop-blur-sm">
                {primaryFormat}
              </span>
            ) : null}
          </div>
        </div>
      </Link>

      {onToggleFavorite ? (
        <button
          type="button"
          onClick={() => onToggleFavorite(asset)}
          aria-pressed={isFavorite}
          aria-label={
            isFavorite
              ? `Remove ${asset.name} from favorites`
              : `Save ${asset.name} to favorites`
          }
          className={cn(
            "absolute right-2 top-2 grid h-8 w-8 place-items-center rounded-md border border-border bg-background/80 text-muted-foreground backdrop-blur-sm transition duration-200 hover:text-foreground focus-visible:opacity-100",
            isFavorite
              ? "border-border-strong text-primary opacity-100"
              : "opacity-0 group-hover:opacity-100",
          )}
        >
          <Heart className={cn("h-4 w-4", isFavorite && "fill-current")} />
        </button>
      ) : null}

      <div className="mt-2.5 space-y-1">
        <div className="flex items-start justify-between gap-2">
          <Link
            to="/asset/$slug"
            params={{ slug: asset.slug }}
            className="line-clamp-1 text-[13.5px] font-medium text-foreground hover:text-primary"
          >
            {asset.name}
          </Link>
        </div>

        <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
          {asset.creator ? (
            <Link
              to="/creators/$username"
              params={{ username: asset.creator.username }}
              className="truncate hover:text-foreground"
            >
              @{asset.creator.username}
            </Link>
          ) : (
            <span>@unknown</span>
          )}
          <span className="flex shrink-0 items-center gap-2.5 tabular-nums">
            <span className="flex items-center gap-1">
              <ArrowDownToLine className="h-3.5 w-3.5" aria-hidden="true" />
              <span className="sr-only">Downloads: </span>
              {formatCount(asset.download_count)}
            </span>
            <span className="flex items-center gap-1">
              <Heart className="h-3.5 w-3.5" aria-hidden="true" />
              <span className="sr-only">Likes: </span>
              {formatCount(asset.like_count)}
            </span>
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-1 pt-0.5">
          <Tag>{asset.license}</Tag>
          {asset.formats?.slice(0, 1).map((format) => (
            <Tag key={format}>{format}</Tag>
          ))}
          {asset.engines?.slice(0, 2).map((engine) => (
            <Tag key={engine} title={getEngine(engine)?.label}>
              {getEngine(engine)?.mark ?? engine}
            </Tag>
          ))}
        </div>
      </div>
    </article>
  );
}

function Tag({
  children,
  title,
}: {
  children: React.ReactNode;
  title?: string;
}) {
  return (
    <span
      title={title}
      className="rounded border border-border px-1.5 py-0.5 font-mono text-[10px] uppercase leading-none tracking-wide text-muted-foreground"
    >
      {children}
    </span>
  );
}

export function AssetCardSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="aspect-[4/3] rounded-lg border border-border bg-surface" />
      <div className="mt-2.5 space-y-2">
        <div className="h-3 w-3/4 rounded bg-surface-raised" />
        <div className="h-2.5 w-1/2 rounded bg-surface" />
        <div className="h-3 w-2/5 rounded bg-surface" />
      </div>
    </div>
  );
}
