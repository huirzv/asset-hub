import { useState } from "react";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowDownToLine,
  Check,
  Copy,
  Flag,
  Heart,
  ShieldCheck,
} from "lucide-react";
import { toast } from "sonner";

import { AssetGrid } from "@/components/assets/AssetGrid";
import { AssetPreview } from "@/components/assets/AssetPreview";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  fetchAssetBySlug,
  fetchRelatedAssets,
  recordDownload,
  submitReport,
} from "@/lib/assets-api";
import { useAuth } from "@/hooks/useAuth";
import { useFavoriteIds, useToggleFavorite } from "@/hooks/useFavorites";
import { buildAttribution, getLicense } from "@/lib/licenses";
import { categoryLabel, getEngine } from "@/lib/taxonomy";
import { formatBytes, formatDate, formatNumber } from "@/lib/format";
import { REPORT_REASONS, type Asset } from "@/lib/types";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/asset/$slug")({
  loader: async ({ params }) => {
    const asset = await fetchAssetBySlug(params.slug);
    if (!asset) throw notFound();
    return { asset };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [
          { title: "Asset unavailable — Assetly" },
          { name: "robots", content: "noindex" },
        ],
      };
    }
    const { asset } = loaderData;
    const description =
      asset.description ??
      `Download ${asset.name} for free under the ${asset.license} license.`;
    return {
      meta: [
        { title: `${asset.name} — free ${categoryLabel(asset.category)} · Assetly` },
        { name: "description", content: description.slice(0, 158) },
        { property: "og:title", content: `${asset.name} — free on Assetly` },
        { property: "og:description", content: description.slice(0, 158) },
      ],
    };
  },
  component: AssetDetailPage,
});

function AssetDetailPage() {
  const { asset } = Route.useLoaderData();
  const { userId } = useAuth();
  const { data: favoriteIds } = useFavoriteIds(userId);
  const toggleFavorite = useToggleFavorite(userId);
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const license = getLicense(asset.license);
  const isFavorite = favoriteIds?.has(asset.id) ?? false;

  const related = useQuery({
    queryKey: ["related", asset.id],
    queryFn: () => fetchRelatedAssets(asset, 4),
  });

  const attribution = buildAttribution({
    assetName: asset.name,
    creatorName: asset.creator?.display_name ?? "Unknown creator",
    licenseId: asset.license,
    url: typeof window === "undefined" ? "" : window.location.href,
  });

  const copyAttribution = async () => {
    await navigator.clipboard.writeText(attribution);
    setCopied(true);
    toast.success("Attribution copied");
    setTimeout(() => setCopied(false), 2000);
  };

  const download = async () => {
    if (!asset.download_file_path) {
      toast.error("This asset has no downloadable file yet.");
      return;
    }
    setDownloading(true);
    try {
      const { data, error } = await supabase.storage
        .from("asset-quarantine")
        .createSignedUrl(asset.download_file_path, 60, { download: true });
      if (error || !data) throw error ?? new Error("no-url");
      await recordDownload(asset.id).catch(() => undefined);
      window.location.href = data.signedUrl;
    } catch {
      toast.error("Download link couldn't be created. Please try again.");
    } finally {
      setDownloading(false);
    }
  };

  const isApproved = asset.moderation_status === "approved";

  return (
    <div className="mx-auto max-w-[1400px] px-4 py-8 sm:px-6">
      <nav aria-label="Breadcrumb" className="text-xs text-muted-foreground">
        <Link to="/explore" search={{}} className="hover:text-foreground">
          Explore
        </Link>
        <span className="px-1.5">/</span>
        <Link
          to="/explore"
          search={{ category: asset.category }}
          className="hover:text-foreground"
        >
          {categoryLabel(asset.category)}
        </Link>
        <span className="px-1.5">/</span>
        <span className="text-foreground">{asset.name}</span>
      </nav>

      <div className="mt-5 grid gap-8 lg:grid-cols-[1fr_340px]">
        <div>
          <AssetPreview asset={asset} />

          <h1 className="mt-6 text-2xl font-semibold tracking-tight">
            {asset.name}
          </h1>
          {asset.creator ? (
            <Link
              to="/creators/$username"
              params={{ username: asset.creator.username }}
              className="mt-1.5 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
            >
              <span className="grid h-6 w-6 place-items-center rounded-full border border-border-strong bg-surface text-[11px] uppercase">
                {asset.creator.display_name.slice(0, 1)}
              </span>
              {asset.creator.display_name}
            </Link>
          ) : null}

          {asset.description ? (
            <p className="mt-5 max-w-2xl text-pretty text-sm leading-relaxed text-muted-foreground">
              {asset.description}
            </p>
          ) : null}

          <div className="mt-5 flex flex-wrap gap-1.5">
            {asset.tags.map((tag) => (
              <Link
                key={tag}
                to="/explore"
                search={{ q: tag }}
                className="rounded-full border border-border px-2.5 py-1 text-xs text-muted-foreground hover:border-border-strong hover:text-foreground"
              >
                {tag}
              </Link>
            ))}
          </div>

          <section className="mt-10">
            <h2 className="text-eyebrow">What's included</h2>
            <ul className="mt-3 grid gap-1.5 sm:grid-cols-2">
              {asset.included_files.map((file) => (
                <li
                  key={file}
                  className="rounded-md border border-border bg-surface px-3 py-2 font-mono text-xs text-muted-foreground"
                >
                  {file}
                </li>
              ))}
            </ul>
          </section>

          <section className="mt-10">
            <h2 className="text-eyebrow">License</h2>
            <div className="mt-3 rounded-lg border border-border bg-surface p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-medium">{license.name}</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {license.summary}
                  </p>
                </div>
              </div>
              <ul className="mt-4 grid gap-1.5 sm:grid-cols-2">
                {license.permissions.map((permission) => (
                  <li
                    key={permission.label}
                    className="flex items-center gap-2 text-sm text-muted-foreground"
                  >
                    <Check className="h-3.5 w-3.5 text-primary" />
                    {permission.label}
                  </li>
                ))}
              </ul>
              {license.attributionRequired ? (
                <div className="mt-4 rounded-md border border-border bg-background p-3">
                  <p className="text-eyebrow">Attribution text</p>
                  <p className="mt-2 font-mono text-[11px] leading-relaxed text-muted-foreground">
                    {attribution}
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-3"
                    onClick={copyAttribution}
                  >
                    {copied ? (
                      <Check className="mr-1.5 h-3.5 w-3.5" />
                    ) : (
                      <Copy className="mr-1.5 h-3.5 w-3.5" />
                    )}
                    Copy attribution
                  </Button>
                </div>
              ) : null}
            </div>
          </section>
        </div>

        <aside className="space-y-4 lg:sticky lg:top-20 lg:self-start">
          <div className="rounded-xl border border-border bg-surface p-4">
            <Button
              className="w-full"
              onClick={download}
              disabled={downloading || !isApproved}
            >
              <ArrowDownToLine className="mr-1.5 h-4 w-4" />
              {downloading ? "Preparing…" : "Download free"}
            </Button>
            <Button
              variant="outline"
              className="mt-2 w-full"
              onClick={() =>
                toggleFavorite.mutate({ assetId: asset.id, isFavorite })
              }
            >
              <Heart
                className={
                  isFavorite ? "mr-1.5 h-4 w-4 fill-primary text-primary" : "mr-1.5 h-4 w-4"
                }
              />
              {isFavorite ? "Saved" : "Save to favorites"}
            </Button>

            <dl className="mt-5 space-y-2.5 text-sm">
              <Row label="License" value={license.shortName} />
              <Row label="Category" value={categoryLabel(asset.category)} />
              <Row label="Formats" value={asset.formats.join(", ")} />
              <Row
                label="Engines"
                value={
                  asset.engines
                    .map((engine) => getEngine(engine)?.label ?? engine)
                    .join(", ") || "Any"
                }
              />
              <Row label="File size" value={formatBytes(asset.file_size)} />
              {asset.triangle_count ? (
                <Row
                  label="Triangles"
                  value={formatNumber(asset.triangle_count)}
                />
              ) : null}
              <Row label="Version" value={asset.version} />
              <Row label="Updated" value={formatDate(asset.updated_at)} />
              <Row
                label="Downloads"
                value={formatNumber(asset.download_count)}
              />
            </dl>
          </div>

          <div className="rounded-xl border border-border bg-surface p-4">
            <p className="flex items-center gap-2 text-sm font-medium">
              <ShieldCheck className="h-4 w-4 text-primary" />
              Safety checks
            </p>
            <ul className="mt-3 space-y-1.5 text-xs text-muted-foreground">
              <li>Validation: {asset.validation_status}</li>
              <li>Malware scan: {asset.scan_status}</li>
              <li>Moderation: {asset.moderation_status}</li>
            </ul>
          </div>

          <ReportDialog asset={asset} userId={userId} />
        </aside>
      </div>

      <section className="mt-16">
        <h2 className="text-lg font-semibold tracking-tight">
          More {categoryLabel(asset.category).toLowerCase()}
        </h2>
        <div className="mt-5">
          <AssetGrid
            assets={related.data ?? []}
            loading={related.isLoading}
            skeletonCount={4}
          />
        </div>
      </section>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="text-right text-foreground">{value}</dd>
    </div>
  );
}

function ReportDialog({
  asset,
  userId,
}: {
  asset: Asset;
  userId: string | null;
}) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState<string>(REPORT_REASONS[0].id);
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);

  const send = async () => {
    setSaving(true);
    try {
      await submitReport({
        assetId: asset.id,
        reason,
        description,
        reporterId: userId,
      });
      toast.success("Report submitted. Our moderators will review it.");
      setOpen(false);
      setDescription("");
    } catch {
      toast.error("We couldn't submit that report. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="w-full text-muted-foreground">
          <Flag className="mr-1.5 h-3.5 w-3.5" />
          Report this asset
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Report "{asset.name}"</DialogTitle>
          <DialogDescription>
            Tell us what's wrong. Reports are reviewed by moderators.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Reason</Label>
            <Select value={reason} onValueChange={setReason}>
              <SelectTrigger className="mt-1.5">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {REPORT_REASONS.map((item) => (
                  <SelectItem key={item.id} value={item.id}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="report-details">Details (optional)</Label>
            <Textarea
              id="report-details"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Add any context that helps us review this faster."
              className="mt-1.5"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={send} disabled={saving}>
            {saving ? "Submitting…" : "Submit report"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
