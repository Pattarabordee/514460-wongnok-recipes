
import RecipeCard from "./RecipeCard";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import RecipeDetailModal from "@/pages/RecipeDetailModal";

type SupabaseRecipe = {
  id: string;
  title: string;
  image_url: string | null;
  prep_time: number;
  difficulty: string;
  user_id: string;
  // สมมติว่า ratings, author ฯลฯ ยังไม่มีใน schema Supabase ตอนนี้
};

type RecipeAggregates = {
  [recipeId: string]: {
    avg: number;
    count: number;
  };
};

// Profile สำหรับ lookup username
type RecipeProfile = {
  id: string;
  username: string | null;
};

const RecipeList = () => {
  const [recipes, setRecipes] = useState<SupabaseRecipe[]>([]);
  const [profiles, setProfiles] = useState<Record<string, string | null>>({});
  const [loading, setLoading] = useState(true);
  const [loadingProfiles, setLoadingProfiles] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [openId, setOpenId] = useState<string | null>(null);
  const [ratingAggs, setRatingAggs] = useState<RecipeAggregates>({});
  const [loadingAgg, setLoadingAgg] = useState(false);

  // ดึงสูตรอาหารทั้งหมด
  useEffect(() => {
    async function fetchRecipes() {
      setLoading(true);
      setError(null);
      const { data, error } = await supabase
        .from("recipes")
        .select("*")
        .not("user_id", "is", null);

      if (error) {
        setError("เกิดข้อผิดพลาดขณะโหลดสูตรอาหาร");
        setLoading(false);
        return;
      }
      setRecipes(data || []);
      setLoading(false);
    }
    fetchRecipes();
  }, []);

  // ดึงข้อมูล profiles ของ user เจ้าของสูตรแต่ละคน
  useEffect(() => {
    async function fetchProfiles() {
      if (!recipes.length) return setProfiles({});
      setLoadingProfiles(true);
      // หา user_id ไม่ซ้ำในสูตรอาหารทั้งหมด
      const uniqueUserIds = Array.from(new Set(recipes.map(r => r.user_id).filter(Boolean)));
      if (uniqueUserIds.length === 0) {
        setProfiles({});
        setLoadingProfiles(false);
        return;
      }
      // ดึงข้อมูล profile เฉพาะ user ที่เกี่ยวข้องทั้งหมดพร้อมกัน
      const { data, error } = await supabase
        .from("profiles")
        .select("id,username")
        .in("id", uniqueUserIds);

      if (error) {
        setProfiles({});
        setLoadingProfiles(false);
        return;
      }
      // แปลงเป็น lookup ของ user_id → username (หรือ null)
      const map: Record<string, string | null> = {};
      if (data) {
        data.forEach((p: RecipeProfile) => {
          map[p.id] = p.username;
        });
      }
      setProfiles(map);
      setLoadingProfiles(false);
    }
    fetchProfiles();
  }, [recipes]);

  // Fetch all ratings and aggregate per recipe
  useEffect(() => {
    async function fetchRatingsAgg() {
      if (!recipes.length) {
        setRatingAggs({});
        return;
      }
      setLoadingAgg(true);
      const recipeIds = recipes.map(r => r.id);
      const { data, error } = await supabase
        .from("ratings")
        .select("recipe_id,rating");

      if (error) {
        setRatingAggs({});
        setLoadingAgg(false);
        return;
      }
      const aggs: RecipeAggregates = {};
      for (const recipeId of recipeIds) {
        const ratings = data?.filter(d => d.recipe_id === recipeId).map(r => r.rating);
        if (ratings && ratings.length > 0) {
          const sum = ratings.reduce((acc, val) => acc + (val || 0), 0);
          aggs[recipeId] = {
            avg: sum / ratings.length,
            count: ratings.length,
          };
        } else {
          aggs[recipeId] = { avg: 0, count: 0 };
        }
      }
      setRatingAggs(aggs);
      setLoadingAgg(false);
    }
    if (recipes.length > 0) fetchRatingsAgg();
    else setRatingAggs({});
  }, [recipes]);

  if (loading || loadingAgg || loadingProfiles) {
    return (
      <div className="text-center py-12 text-emerald-600 animate-pulse">
        กำลังโหลดสูตรอาหาร...
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12 text-red-500">
        {error}
      </div>
    );
  }

  if (!recipes.length) {
    return (
      <div className="text-center py-12 text-gray-500">
        ไม่พบสูตรอาหารที่สร้างโดยสมาชิก
      </div>
    );
  }

  return (
    <>
      <div className="grid gap-4 sm:gap-6 lg:gap-7 grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
        {recipes.map((recipe) => {
          const agg = ratingAggs[recipe.id] ?? { avg: 0, count: 0 };
          // หา username ของเจ้าของสูตร ถ้าไม่มีใช้ "สมาชิก"
          const authorName = profiles[recipe.user_id] || "สมาชิก";
          return (
            <RecipeCard
              key={recipe.id}
              recipe={{
                id: recipe.id,
                title: recipe.title,
                image: recipe.image_url ?? "/placeholder.svg",
                cookingTime: recipe.prep_time ? `${recipe.prep_time} นาที` : "ไม่ระบุ",
                difficulty: recipe.difficulty,
                author: authorName,
                rating: agg.avg,
                ratingsCount: agg.count,
              }}
              onClick={() => setOpenId(recipe.id)}
            />
          );
        })}
      </div>
      {openId && (
        <RecipeDetailModal
          recipe={
            (() => {
              const r = recipes.find((r) => r.id === openId);
              if (!r) return undefined;
              const agg = ratingAggs[r.id] ?? { avg: 0, count: 0 };
              const authorName = profiles[r.user_id] || "สมาชิก";
              return {
                id: r.id,
                title: r.title,
                image: r.image_url ?? "/placeholder.svg",
                cookingTime: r.prep_time ? `${r.prep_time} นาที` : "ไม่ระบุ",
                difficulty: r.difficulty,
                author: authorName,
                rating: agg.avg,
                ratingsCount: agg.count,
                ingredients: [],
                steps: [],
              };
            })()
          }
          onClose={() => setOpenId(null)}
        />
      )}
    </>
  );
};

export default RecipeList;
