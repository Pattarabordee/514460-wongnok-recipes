
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuthUser } from "./useAuthUser";

interface UseRecipeRatingOptions {
  recipeId: string;
}

export type RecipeAggregate = {
  avg: number;
  count: number;
};

export function useRecipeRating({ recipeId }: UseRecipeRatingOptions) {
  const { user } = useAuthUser();
  const queryClient = useQueryClient();

  // 1. Fetch user's own rating for this recipe
  const { data: myRating, isLoading: loadingMyRating } = useQuery({
    queryKey: ["my-rating", recipeId, user?.id],
    enabled: !!recipeId && !!user,
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .from("ratings")
        .select("id, rating")
        .eq("user_id", user.id)
        .eq("recipe_id", recipeId)
        .maybeSingle();
      if (error) throw error;
      return data ? data.rating : null;
    },
  });

  // 2. Fetch aggregate rating (average & count) for the recipe
  const { data: aggregate, refetch: refetchAggregate } = useQuery({
    queryKey: ["recipe-aggregate-rating", recipeId],
    enabled: !!recipeId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ratings")
        .select("rating", { count: "exact" })
        .eq("recipe_id", recipeId);
      if (error) throw error;
      const count = data?.length || 0;
      const avg =
        count > 0
          ? (data!.reduce((sum, r) => sum + (r.rating ?? 0), 0) as number) /
            count
          : 0;
      return { avg, count };
    },
  });

  // 3. Insert rating - user can only rate once!
  const rateMutation = useMutation({
    mutationFn: async (newRating: number) => {
      if (!user) throw new Error("ต้องเข้าสู่ระบบก่อนให้คะแนน");
      // Check if already rated
      const { data: existing, error: existingError } = await supabase
        .from("ratings")
        .select("id")
        .eq("user_id", user.id)
        .eq("recipe_id", recipeId)
        .maybeSingle();
      if (existingError) throw existingError;
      if (existing) {
        // User already rated, cannot rate again!
        throw new Error("คุณได้ให้คะแนนสูตรนี้ไปแล้ว ไม่สามารถให้ใหม่ได้");
      }
      // Insert
      const { error } = await supabase.from("ratings").insert([
        {
          user_id: user.id,
          recipe_id: recipeId,
          rating: newRating,
        },
      ]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-rating", recipeId, user?.id] });
      queryClient.invalidateQueries({ queryKey: ["recipe-aggregate-rating", recipeId] });
    },
  });

  return {
    myRating,
    loadingMyRating,
    rate: rateMutation.mutate,
    rateIsPending: rateMutation.isPending,
    aggregate,
    refetchAggregate,
  };
}
