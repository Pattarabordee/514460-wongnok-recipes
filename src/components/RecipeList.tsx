
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

const RecipeList = () => {
  const [recipes, setRecipes] = useState<SupabaseRecipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openId, setOpenId] = useState<string | null>(null);

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

  if (loading) {
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
        {recipes.map((recipe) => (
          <RecipeCard
            key={recipe.id}
            recipe={{
              id: recipe.id,
              title: recipe.title,
              image: recipe.image_url ?? "/placeholder.svg",
              cookingTime: recipe.prep_time ? `${recipe.prep_time} นาที` : "ไม่ระบุ",
              difficulty: recipe.difficulty,
              author: "สมาชิก", // อาจดึงจาก profile ถ้าต้องการ
              rating: 0,
              ratingsCount: 0,
            }}
            onClick={() => setOpenId(recipe.id)}
          />
        ))}
      </div>
      {openId && (
        <RecipeDetailModal
          recipe={
            (() => {
              const r = recipes.find((r) => r.id === openId);
              if (!r) return undefined;
              return {
                id: r.id,
                title: r.title,
                image: r.image_url ?? "/placeholder.svg",
                cookingTime: r.prep_time ? `${r.prep_time} นาที` : "ไม่ระบุ",
                difficulty: r.difficulty,
                author: "สมาชิก",
                rating: 0,
                ratingsCount: 0,
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

