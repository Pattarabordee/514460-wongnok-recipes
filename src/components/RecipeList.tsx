
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

const RecipeList = () => {
  const [recipes, setRecipes] = useState<SupabaseRecipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openId, setOpenId] = useState<string | null>(null);
  const [ratingAggs, setRatingAggs] = useState<RecipeAggregates>({});
  const [loadingAgg, setLoadingAgg] = useState(false);

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

  // Fetch all ratings and aggregate per recipe
  useEffect(() => {
    async function fetchRatingsAgg() {
      if (!recipes.length) {
        setRatingAggs({});
        return;
      }
      setLoadingAgg(true);
      // ดึงคะแนน rating สำหรับสูตรทั้งหมด
      const recipeIds = recipes.map(r => r.id);
      const { data, error } = await supabase
        .from("ratings")
        .select("recipe_id,rating");

      if (error) {
        setRatingAggs({});
        setLoadingAgg(false);
        return;
      }
      // คำนวณเฉลี่ย/นับคะแนนต่อสูตร
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

  if (loading || loadingAgg) {
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
          return (
            <RecipeCard
              key={recipe.id}
              recipe={{
                id: recipe.id,
                title: recipe.title,
                image: recipe.image_url ?? "/placeholder.svg",
                cookingTime: recipe.prep_time ? `${recipe.prep_time} นาที` : "ไม่ระบุ",
                difficulty: recipe.difficulty,
                author: "สมาชิก", // อาจดึงจาก profile ถ้าต้องการ
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
              return {
                id: r.id,
                title: r.title,
                image: r.image_url ?? "/placeholder.svg",
                cookingTime: r.prep_time ? `${r.prep_time} นาที` : "ไม่ระบุ",
                difficulty: r.difficulty,
                author: "สมาชิก",
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

