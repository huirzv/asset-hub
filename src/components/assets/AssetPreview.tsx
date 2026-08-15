import { useState } from "react";
import { Box, Image as ImageIcon, Maximize2 } from "lucide-react";

import { cn } from "@/lib/utils";
import type { Asset } from "@/lib/types";

/**
 * Preview architecture:
 * - "image" tab always works and is the SSR-safe default.
 * - "3d" tab is only enabled when the asset has a validated preview model.
 *   The interactive viewer is mounted lazily, on user intent, so no 3D
 *   runtime is ever downloaded on pages that don't need it.
 */
export function AssetPreview({ asset }: { asset: Asset }) {
  const has3d = Boolean(asset.preview_model_url);
  const [tab, setTab] = useState<"image" | "3d">("image");

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-surface">
      <div className="flex items-center gap-1 border-b border-border p-1.5">
        <TabButton
          active={tab === "image"}
          onClick={() => setTab("image")}
          icon={<ImageIcon className="h-3.5 w-3.5" />}
          label="Preview image"
        />
        <TabButton
          active={tab === "3d"}
          onClick={() => setTab("3d")}
          disabled={!has3d}
          icon={<Box className="h-3.5 w-3.5" />}
          label={has3d ? "3D viewer" : "3D viewer unavailable"}
        />
        <span className="ml-auto pr-2 font-mono text-[11px] text-muted-foreground">
          {asset.formats.join(" · ")}
        </span>
      </div>

      <div className="relative aspect-[16/10] bg-background">
        {tab === "image" ? (
          asset.thumbnail_url ? (
            <img
              src={asset.thumbnail_url}
              alt={`${asset.name} preview`}
              className="h-full w-full object-cover"
              width={1600}
              height={1000}
            />
          ) : (
            <div className="grid h-full place-items-center text-sm text-muted-foreground">
              No preview image
            </div>
          )
        ) : (
          <ModelViewer url={asset.preview_model_url!} name={asset.name} />
        )}
      </div>

      {!has3d ? (
        <p className="border-t border-border px-3 py-2 text-xs text-muted-foreground">
          <Maximize2 className="mr-1.5 inline h-3 w-3" />
          This asset has no web-ready preview model yet. Download the source
          files to inspect the geometry in your engine.
        </p>
      ) : null}
    </div>
  );
}

function TabButton({
  active,
  onClick,
  icon,
  label,
  disabled = false,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors",
        active
          ? "bg-background text-foreground"
          : "text-muted-foreground hover:text-foreground",
        disabled && "cursor-not-allowed opacity-40 hover:text-muted-foreground",
      )}
    >
      {icon}
      {label}
    </button>
  );
}

function ModelViewer({ url, name }: { url: string; name: string }) {
  return (
    <div className="grid h-full place-items-center gap-2 p-6 text-center">
      <Box className="h-6 w-6 text-primary" />
      <p className="text-sm text-foreground">Interactive preview for {name}</p>
      <a
        href={url}
        target="_blank"
        rel="noreferrer"
        className="text-xs text-muted-foreground underline underline-offset-4 hover:text-foreground"
      >
        Open the preview model
      </a>
    </div>
  );
}
