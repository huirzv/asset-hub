import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ShieldCheck, UploadCloud } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { EmptyState } from "@/components/common/EmptyState";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { CATEGORIES, ENGINES } from "@/lib/taxonomy";
import { LICENSES } from "@/lib/licenses";
import { slugify } from "@/lib/format";
import {
  buildStorageKey,
  getExtension,
  validateFile,
} from "@/lib/upload-rules";

export const Route = createFileRoute("/upload")({
  head: () => ({
    meta: [
      { title: "Upload a free asset — Assetly" },
      {
        name: "description",
        content:
          "Share your 3D models, UI kits and textures with the community. Every upload is validated and scanned before publishing.",
      },
      { property: "og:title", content: "Upload a free asset — Assetly" },
      {
        property: "og:description",
        content: "Share your work with game developers everywhere.",
      },
    ],
  }),
  component: UploadPage,
});

function UploadPage() {
  const { userId, loading } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState(CATEGORIES[0]!.id);
  const [license, setLicense] = useState<string>("CC0");
  const [engines, setEngines] = useState<string[]>([]);
  const [tags, setTags] = useState("");
  const [packageFile, setPackageFile] = useState<File | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);

  if (!loading && !userId) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16">
        <EmptyState
          icon={<UploadCloud className="h-5 w-5" />}
          title="Sign in to upload"
          description="You need an account so the community knows who made the asset."
          action={
            <Button asChild size="sm">
              <Link to="/auth">Sign in</Link>
            </Button>
          }
        />
      </div>
    );
  }

  const toggleEngine = (id: string) =>
    setEngines((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!userId || !packageFile) {
      toast.error("Add a download package to continue.");
      return;
    }

    const packageIssues = validateFile(packageFile, "package");
    const thumbIssues = thumbnailFile
      ? validateFile(thumbnailFile, "thumbnail")
      : [];
    const issues = [...packageIssues, ...thumbIssues];
    if (issues.length > 0) {
      toast.error(issues[0]!.message);
      return;
    }

    setBusy(true);
    try {
      const packageKey = buildStorageKey(userId, "package", packageFile.name);
      const { error: packageError } = await supabase.storage
        .from("asset-quarantine")
        .upload(packageKey, packageFile, { upsert: false });
      if (packageError) throw packageError;

      let thumbnailUrl: string | null = null;
      if (thumbnailFile) {
        const thumbKey = buildStorageKey(userId, "thumbnail", thumbnailFile.name);
        const { error: thumbError } = await supabase.storage
          .from("asset-thumbnails")
          .upload(thumbKey, thumbnailFile, { upsert: false });
        if (thumbError) throw thumbError;
        thumbnailUrl = supabase.storage
          .from("asset-thumbnails")
          .getPublicUrl(thumbKey).data.publicUrl;
      }

      const slug = `${slugify(name)}-${Math.random().toString(36).slice(2, 7)}`;
      const { error: insertError } = await supabase.from("assets").insert({
        creator_id: userId,
        name,
        slug,
        description: description || null,
        category,
        license,
        engines,
        formats: [getExtension(packageFile.name).toUpperCase()],
        included_files: [packageFile.name],
        tags: tags
          .split(",")
          .map((tag) => tag.trim().toLowerCase())
          .filter(Boolean),
        file_size: packageFile.size,
        download_file_path: packageKey,
        thumbnail_url: thumbnailUrl,
      });
      if (insertError) throw insertError;

      toast.success(
        "Upload received. It's quarantined for validation and scanning before it goes live.",
      );
      navigate({ to: "/favorites" });
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Upload failed. Try again.",
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
      <h1 className="text-2xl font-semibold tracking-tight">Upload an asset</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Free assets only. Make sure you have the right to share every file you
        include.
      </p>

      <div className="mt-5 flex items-start gap-2.5 rounded-lg border border-border bg-surface p-3 text-xs text-muted-foreground">
        <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
        <p>
          Uploads land in a private quarantine bucket. Files are validated and
          malware-scanned, and only a moderator can publish them — nothing you
          upload is downloadable by others until it passes.
        </p>
      </div>

      <form onSubmit={submit} className="mt-8 space-y-5">
        <div>
          <Label htmlFor="asset-name">Asset name</Label>
          <Input
            id="asset-name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Low Poly Forest Pack"
            className="mt-1.5"
            required
          />
        </div>

        <div>
          <Label htmlFor="asset-description">Description</Label>
          <Textarea
            id="asset-description"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="What's inside, how it's built, and how it's meant to be used."
            className="mt-1.5 min-h-24"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label>Category</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="mt-1.5">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((item) => (
                  <SelectItem key={item.id} value={item.id}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>License</Label>
            <Select value={license} onValueChange={setLicense}>
              <SelectTrigger className="mt-1.5">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.values(LICENSES).map((item) => (
                  <SelectItem key={item.id} value={item.id}>
                    {item.shortName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <Label>Engine compatibility</Label>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {ENGINES.map((engine) => (
              <button
                key={engine.id}
                type="button"
                onClick={() => toggleEngine(engine.id)}
                className={
                  engines.includes(engine.id)
                    ? "rounded-full border border-primary bg-primary/10 px-3 py-1.5 text-xs text-foreground"
                    : "rounded-full border border-border px-3 py-1.5 text-xs text-muted-foreground hover:border-border-strong"
                }
              >
                {engine.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <Label htmlFor="asset-tags">Tags</Label>
          <Input
            id="asset-tags"
            value={tags}
            onChange={(event) => setTags(event.target.value)}
            placeholder="low poly, nature, trees"
            className="mt-1.5"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="asset-package">Download package</Label>
            <Input
              id="asset-package"
              type="file"
              accept=".zip,.glb,.gltf,.fbx,.obj,.blend,.png,.svg,.wav,.mp3,.ogg"
              onChange={(event) =>
                setPackageFile(event.target.files?.[0] ?? null)
              }
              className="mt-1.5"
              required
            />
            <p className="mt-1.5 text-xs text-muted-foreground">
              Max 250 MB. Executables are always rejected.
            </p>
          </div>
          <div>
            <Label htmlFor="asset-thumbnail">Thumbnail</Label>
            <Input
              id="asset-thumbnail"
              type="file"
              accept="image/png,image/jpeg,image/webp"
              onChange={(event) =>
                setThumbnailFile(event.target.files?.[0] ?? null)
              }
              className="mt-1.5"
            />
            <p className="mt-1.5 text-xs text-muted-foreground">
              PNG, JPG or WebP up to 8 MB.
            </p>
          </div>
        </div>

        <Button type="submit" disabled={busy} className="w-full">
          {busy ? "Uploading…" : "Submit for review"}
        </Button>
      </form>
    </div>
  );
}
