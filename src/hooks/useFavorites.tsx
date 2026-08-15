import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";
import type { Asset } from "@/lib/types";

export function useFavoriteIds(userId: string | null) {
  return useQuery({
    queryKey: ["favorite-ids", userId],
    enabled: Boolean(userId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("favorites")
        .select("asset_id")
        .eq("user_id", userId!);
      if (error) throw error;
      return new Set((data ?? []).map((row) => row.asset_id));
    },
  });
}

export function useFavoriteAssets(userId: string | null) {
  return useQuery({
    queryKey: ["favorite-assets", userId],
    enabled: Boolean(userId),
    queryFn: async (): Promise<Asset[]> => {
      const { data, error } = await supabase
        .from("favorites")
        .select(
          "asset:assets(*, creator:profiles!assets_creator_id_fkey(id,username,display_name,avatar_url))",
        )
        .eq("user_id", userId!)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? [])
        .map((row) => (row as { asset: Asset | null }).asset)
        .filter((a): a is Asset => Boolean(a));
    },
  });
}

export function useToggleFavorite(userId: string | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      assetId,
      isFavorite,
    }: {
      assetId: string;
      isFavorite: boolean;
    }) => {
      if (!userId) throw new Error("not-authenticated");
      if (isFavorite) {
        const { error } = await supabase
          .from("favorites")
          .delete()
          .eq("user_id", userId)
          .eq("asset_id", assetId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("favorites")
          .insert({ user_id: userId, asset_id: assetId });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["favorite-ids", userId] });
      queryClient.invalidateQueries({ queryKey: ["favorite-assets", userId] });
    },
    onError: (error: Error) => {
      if (error.message === "not-authenticated") {
        toast.error("Sign in to save assets to your favorites.");
      } else {
        toast.error("We couldn't update your favorites. Try again.");
      }
    },
  });
}
