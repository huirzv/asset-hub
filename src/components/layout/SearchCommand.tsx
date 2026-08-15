import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Search } from "lucide-react";

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { fetchAssets } from "@/lib/assets-api";
import { CATEGORIES, QUICK_SEARCHES } from "@/lib/taxonomy";
import { formatCount } from "@/lib/format";

export function SearchCommand({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const navigate = useNavigate();
  const [term, setTerm] = useState("");

  const { data, isFetching } = useQuery({
    queryKey: ["command-search", term],
    enabled: open && term.trim().length > 1,
    queryFn: () => fetchAssets({ q: term, page: 1 }),
    staleTime: 30_000,
  });

  useEffect(() => {
    if (!open) setTerm("");
  }, [open]);

  const go = (to: string, search?: Record<string, string>) => {
    onOpenChange(false);
    navigate({ to, search: search ?? {} } as never);
  };

  return (
    <CommandDialog
      open={open}
      onOpenChange={onOpenChange}
      shouldFilter={false}
    >
      <CommandInput
        placeholder="Search models, UI, textures..."
        value={term}
        onValueChange={setTerm}
      />
      <CommandList>
        {term.trim().length > 1 && !isFetching && (data?.items.length ?? 0) === 0 ? (
          <CommandEmpty>No assets found.</CommandEmpty>
        ) : null}

        {(data?.items.length ?? 0) > 0 ? (
          <CommandGroup heading="Assets">
            {data!.items.slice(0, 6).map((asset) => (
              <CommandItem
                key={asset.id}
                value={asset.slug}
                onSelect={() => {
                  onOpenChange(false);
                  navigate({
                    to: "/asset/$slug",
                    params: { slug: asset.slug },
                  });
                }}
              >
                <span className="truncate">{asset.name}</span>
                <span className="ml-auto shrink-0 text-xs text-muted-foreground">
                  {formatCount(asset.download_count)} downloads
                </span>
              </CommandItem>
            ))}
          </CommandGroup>
        ) : null}

        {term.trim().length > 1 ? (
          <CommandGroup heading="Search">
            <CommandItem
              value={`search-${term}`}
              onSelect={() => go("/explore", { q: term })}
            >
              <Search className="mr-2 h-4 w-4" />
              Search all assets for "{term}"
            </CommandItem>
          </CommandGroup>
        ) : (
          <>
            <CommandGroup heading="Quick searches">
              {QUICK_SEARCHES.slice(0, 6).map((quick) => (
                <CommandItem
                  key={quick}
                  value={quick}
                  onSelect={() => go("/explore", { q: quick })}
                >
                  {quick}
                </CommandItem>
              ))}
            </CommandGroup>
            <CommandGroup heading="Categories">
              {CATEGORIES.slice(0, 5).map((category) => (
                <CommandItem
                  key={category.id}
                  value={category.label}
                  onSelect={() => go("/explore", { category: category.id })}
                >
                  {category.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}
      </CommandList>
    </CommandDialog>
  );
}
