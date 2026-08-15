import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { X } from "lucide-react";

import { AssetGrid } from "@/components/assets/AssetGrid";
import { EmptyState } from "@/components/common/EmptyState";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { fetchAssets, PAGE_SIZE } from "@/lib/assets-api";
import { useAuth } from "@/hooks/useAuth";
import { useFavoriteIds, useToggleFavorite } from "@/hooks/useFavorites";
import {
  CATEGORIES,
  ENGINES,
  FILE_FORMATS,
  SORT_OPTIONS,
  STYLES,
  categoryLabel,
  type SortId,
} from "@/lib/taxonomy";
import { LICENSES } from "@/lib/licenses";
import { formatNumber } from "@/lib/format";
import type { Asset } from "@/lib/types";

interface ExploreSearch {
  q?: string;
  category?: string;
  engine?: string;
  format?: string;
  license?: string;
  style?: string;
  sort?: SortId;
  page?: number;
}

const SORT_IDS = SORT_OPTIONS.map((option) => option.id) as string[];

function str(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value : undefined;
}

export const Route = createFileRoute("/explore")({
  validateSearch: (search: Record<string, unknown>): ExploreSearch => {
    const sort = str(search["sort"]);
    const page = Number(search["page"]);
    const result: ExploreSearch = {};
    const q = str(search["q"]);
    if (q) result.q = q;
    const category = str(search["category"]);
    if (category) result.category = category;
    const engine = str(search["engine"]);
    if (engine) result.engine = engine;
    const format = str(search["format"]);
    if (format) result.format = format;
    const license = str(search["license"]);
    if (license) result.license = license;
    const style = str(search["style"]);
    if (style) result.style = style;
    if (sort && SORT_IDS.includes(sort)) result.sort = sort as SortId;
    if (Number.isFinite(page) && page > 1) result.page = Math.floor(page);
    return result;
  },
  head: () => ({
    meta: [
      { title: "Explore free game assets — Assetly" },
      {
        name: "description",
        content:
          "Filter thousands of free game assets by category, engine, file format, license and style.",
      },
      { property: "og:title", content: "Explore free game assets — Assetly" },
      {
        property: "og:description",
        content:
          "Filter free 3D models, UI kits, textures and VFX by engine, format and license.",
      },
    ],
  }),
  component: ExplorePage,
});

function FilterSelect({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string | undefined;
  options: { value: string; label: string }[];
  onChange: (value: string | undefined) => void;
}) {
  return (
    <div>
      <label className="text-eyebrow">{label}</label>
      <Select
        value={value ?? "all"}
        onValueChange={(next) => onChange(next === "all" ? undefined : next)}
      >
        <SelectTrigger className="mt-1.5 h-9 w-full text-sm">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All</SelectItem>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

function ExplorePage() {
  const search = Route.useSearch();
  const navigate = useNavigate({ from: "/explore" });
  const { userId } = useAuth();
  const { data: favoriteIds } = useFavoriteIds(userId);
  const toggleFavorite = useToggleFavorite(userId);

  const page = search.page ?? 1;
  const query = useQuery({
    queryKey: ["assets", search],
    queryFn: () => fetchAssets(search),
  });

  const setFilter = (patch: Record<string, string | undefined>) => {
    navigate({
      search: (prev) => {
        const next: Record<string, unknown> = { ...prev, ...patch, page: undefined };
        for (const key of Object.keys(next)) {
          if (next[key] === undefined) delete next[key];
        }
        return next as ExploreSearch;
      },
    });
  };

  const activeFilters: [string, string][] = (
    [
      ["q", search.q],
      ["category", search.category ? categoryLabel(search.category) : undefined],
      ["engine", search.engine],
      ["format", search.format],
      ["license", search.license],
      ["style", search.style],
    ] as [string, string | undefined][]
  ).filter((entry): entry is [string, string] => Boolean(entry[1]));

  const total = query.data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const onToggleFavorite = (asset: Asset) =>
    toggleFavorite.mutate({
      assetId: asset.id,
      isFavorite: favoriteIds?.has(asset.id) ?? false,
    });

  return (
    <div className="mx-auto max-w-[1600px] px-4 py-8 sm:px-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            {search.q
              ? `Results for "${search.q}"`
              : search.category
                ? categoryLabel(search.category)
                : "Explore assets"}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {query.isLoading
              ? "Searching the library…"
              : `${formatNumber(total)} free ${total === 1 ? "asset" : "assets"}`}
          </p>
        </div>
        <div className="w-44">
          <Select
            value={search.sort ?? "trending"}
            onValueChange={(next) => setFilter({ sort: next as SortId })}
          >
            <SelectTrigger className="h-9 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SORT_OPTIONS.map((option) => (
                <SelectItem key={option.id} value={option.id}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[220px_1fr]">
        <aside className="space-y-5 lg:sticky lg:top-20 lg:self-start">
          <FilterSelect
            label="Category"
            value={search.category}
            onChange={(value) => setFilter({ category: value })}
            options={CATEGORIES.map((category) => ({
              value: category.id,
              label: category.label,
            }))}
          />
          <FilterSelect
            label="Engine"
            value={search.engine}
            onChange={(value) => setFilter({ engine: value })}
            options={ENGINES.map((engine) => ({
              value: engine.id,
              label: engine.label,
            }))}
          />
          <FilterSelect
            label="File format"
            value={search.format}
            onChange={(value) => setFilter({ format: value })}
            options={FILE_FORMATS.map((format) => ({
              value: format,
              label: format,
            }))}
          />
          <FilterSelect
            label="License"
            value={search.license}
            onChange={(value) => setFilter({ license: value })}
            options={Object.values(LICENSES).map((license) => ({
              value: license.id,
              label: license.shortName,
            }))}
          />
          <FilterSelect
            label="Style"
            value={search.style}
            onChange={(value) => setFilter({ style: value })}
            options={STYLES.map((style) => ({ value: style, label: style }))}
          />
        </aside>

        <div>
          {activeFilters.length > 0 ? (
            <div className="mb-5 flex flex-wrap items-center gap-1.5">
              {activeFilters.map(([key, label]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setFilter({ [key]: undefined })}
                  className="inline-flex items-center gap-1 rounded-full border border-border bg-surface px-2.5 py-1 text-xs text-foreground hover:border-border-strong"
                >
                  {label}
                  <X className="h-3 w-3 text-muted-foreground" />
                </button>
              ))}
              <Link
                to="/explore"
                search={{}}
                className="ml-1 text-xs text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
              >
                Clear all
              </Link>
            </div>
          ) : null}

          <AssetGrid
            assets={query.data?.items ?? []}
            loading={query.isLoading}
            favoriteIds={favoriteIds}
            onToggleFavorite={onToggleFavorite}
            emptyState={
              <EmptyState
                title="No assets match those filters"
                description="Try removing a filter or searching for something broader."
                action={
                  <Button asChild variant="outline" size="sm">
                    <Link to="/explore" search={{}}>
                      Reset filters
                    </Link>
                  </Button>
                }
              />
            }
          />

          {totalPages > 1 ? (
            <div className="mt-10 flex items-center justify-center gap-3">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() =>
                  navigate({
                    search: (prev) => ({ ...prev, page: page - 1 }),
                  })
                }
              >
                Previous
              </Button>
              <span className="font-mono text-xs text-muted-foreground">
                {page} / {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages}
                onClick={() =>
                  navigate({
                    search: (prev) => ({ ...prev, page: page + 1 }),
                  })
                }
              >
                Next
              </Button>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
